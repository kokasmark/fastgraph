import { create } from "zustand";
import type { Node, NodeStore as FastGraphStore, Transaction } from "./types";
import { GraphLayout, GraphState } from "./types";
import { RootNode } from "./nodes";

function diffState<S extends object>(before: S, after: S, ignoreKeys: Set<keyof S>): Transaction<S> {
    const changes: Transaction<S> = [];
    const keys = Object.keys(after) as (keyof S)[];

    keys.forEach((key) => {
        if (ignoreKeys.has(key)) return;
        if (typeof after[key] === "function") return;
        if (!Object.is(before[key], after[key])) {
            changes.push({ key, before: before[key] });
        }
    });

    return changes;
}

const rootId = crypto.randomUUID();

const UNTRACKED_KEYS = new Set<keyof FastGraphStore>(["undoStack"]);

export const useFastGraphStore = create<FastGraphStore>((set, get) => {
    const rawSet = set;

    const trackedSet: typeof set = (partial, replace) => {
        const before = get();

        rawSet(partial as any, replace as any);

        const after = get();
        const transaction = diffState(before, after, UNTRACKED_KEYS);
        if (transaction.length === 0) return;

        rawSet((state) => ({ undoStack: [...state.undoStack, transaction] }) as any);
    };

    return ({
        nodes: { [rootId]: {...RootNode, id: rootId} },
        rootId,
        selected: [rootId],
        yanked: [],
        state: GraphState.None,
        layout: GraphLayout.Right | GraphLayout.Balanced | GraphLayout.Brandes_Koepf,
        activeBindings: null,
        undoStack: [],
        repeatFunction: undefined,

        loadGraph: (graph) => {
            const nodes = Object.fromEntries(graph.nodes.map(node => [node.id, node]))

            if (!nodes[graph.root]) {
                console.error("Cannot load graph: root node does not exist.");
                return;
            }

            trackedSet((state) => ({
                ...state,
                nodes,
                rootId: graph.root,
                selected: [graph.root],
                yanked: [],
            }));
        },

        findNode: (id) => get().nodes[id],

        setState: (state) => rawSet({ state }),

        updateNode: (id, updater) => {
            trackedSet((s) => {
                const node = s.nodes[id];
                if (!node) return s;

                return {
                    nodes: {
                        ...s.nodes,
                        [id]: updater(node),
                    },
                    repeatFunction: () => get().updateNode(id, updater)
                };
            });
        },

        apply: (updater) => {
            trackedSet((s) => {
                const nodes = { ...s.nodes };
                s.selected.forEach((id) => {
                    if (nodes[id]) nodes[id] = updater(nodes[id]);
                });
                return { nodes };
            });
        },

        setLayoutFlag: (flag, category) => {
            trackedSet((s) => ({
                ...s,
                layout: (s.layout & ~category) | flag
            }));
        },

        addNode: (parentId, child) => {
            const parent = get().nodes[parentId];

            if (!parent) return;

            const newNode: Node = {
                ...child,
                id: crypto.randomUUID(),
                meta: {
                    ...child.meta,
                    offset: parent.meta?.offset,
                },
                parents: [parentId],
                children: [],
            };

            trackedSet((s) => ({
                nodes: {
                    ...s.nodes,
                    [parentId]: {
                        ...parent,
                        children: [...(parent.children ?? []), newNode.id],
                    },
                    [newNode.id]: newNode,
                },
                selected: [newNode.id],
                repeatFunction: () => get().addNode(parentId, child)
            }));

            return newNode.id
        },

        setCurrent: (nodeId) => {
            if (get().nodes[nodeId]) trackedSet({ selected: [nodeId] });
        },

        setSelected: (nodeIds) => {
            const valid = nodeIds.filter((id) => get().nodes[id]);
            if (valid.length > 0) trackedSet({ selected: valid });
        },

        setActiveBindings: (bindings) => rawSet({ activeBindings: bindings }),

        setYanked: (nodeIds) => {
            trackedSet({ yanked: nodeIds ?? [] });
        },

        removeNode: (nodeId) => {
            trackedSet((s) => {
                const node = s.nodes[nodeId];
                if (!node) return s;

                const idsToRemove = new Set<string>();
                const collect = (id: string) => {
                    idsToRemove.add(id);
                    s.nodes[id]?.children?.forEach(collect);
                };
                collect(nodeId);

                const nodes = { ...s.nodes };
                idsToRemove.forEach((id) => delete nodes[id]);

                node.parents?.forEach((parentId) => {
                    if (!nodes[parentId]) return;
                    nodes[parentId] = {
                        ...nodes[parentId],
                        children: nodes[parentId].children?.filter(
                            (id) => id !== nodeId
                        ),
                    };
                });

                const remaining = s.selected.filter((id) => !idsToRemove.has(id));
                const selected = remaining.length > 0
                    ? remaining
                    : [node.parents?.[0] ?? s.rootId];
                
                return { nodes, selected, repeatFunction: () => get().removeNode(nodeId) };
            });
        },

        undo: () => {
            const { undoStack } = get();
            const transaction = undoStack[undoStack.length - 1];
            if (!transaction) return;

            rawSet((state) => {
                const reverted: Partial<FastGraphStore> = {};
                transaction.forEach(({ key, before }) => {
                    (reverted as any)[key] = before;
                });
                return { ...reverted, undoStack: state.undoStack.slice(0, -1) } as any;
            });
        },

        repeat: () => {
            const { repeatFunction } = get();

            if(!repeatFunction) return;

            repeatFunction();
        }
    })
});

export const apply = (updater: (node: Node) => Node) => useFastGraphStore.getState().apply(updater);