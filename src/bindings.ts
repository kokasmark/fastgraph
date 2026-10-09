import { useNodeStore } from "./store";
import { GraphLayout, GraphLayoutAlignment, GraphLayoutDirection, GraphLayoutStrategy, GraphState } from "./types";
import { BoxNode, CircleNode, CloudNode, DatabaseNode, EllipseNode, HexagonNode, NoteNode, ParallelogramNode, RombusNode, RootNode, TriangleNode, } from "./nodes";
import { addShape, move, scale, setColor } from "./helpers";
import { navigate } from "./navigation";

type Action = () => void;

type Bindings = {
    [key: string]: {
        name: string;
        children: Action | Bindings;
    };
};

function pasteNode(yankedId: string, parentId: string) {
    const { addNode, findNode } = useNodeStore.getState();

    const yanked = findNode(yankedId);
    if (!yanked) return;

    addNode(parentId, yanked);
}

function pasteTree(yankedId: string, parentId: string) {
    const { addNode, findNode } = useNodeStore.getState();

    const yanked = findNode(yankedId);
    if (!yanked) return;

    const newRootId = addNode(parentId, { ...yanked, children: [] })!;

    const stack: { sourceId: string; newParentId: string }[] = [];
    yanked.children?.forEach((childId) =>
        stack.push({ sourceId: childId, newParentId: newRootId })
    );

    while (stack.length > 0) {
        const { sourceId, newParentId } = stack.pop()!;
        const template = findNode(sourceId);
        if (!template) continue;

        const newId = addNode(newParentId, { ...template, children: [] })!;

        template.children?.forEach((childId) =>
            stack.push({ sourceId: childId, newParentId: newId })
        );
    }
}

const baseBindings: Bindings = {
    n: {
        name: "New Graph",
        children: {
            n: {
                name: "Create",
                children: () => {
                    const root = crypto.randomUUID()
                    useNodeStore.getState().loadGraph({root, nodes: [ ({...RootNode, id: root}) ]})
                }
            }
        }
    },
    a: {
        name: "Add",
        children: {
            b: {
                name: "Box",
                children: () => addShape(BoxNode),
            },

            t: {
                name: "Triangle",
                children: () => addShape(TriangleNode)
            },

            c: {
                name: "Circle",
                children: () => addShape(CircleNode)
            },

            e: {
                name: "Ellipse",
                children: () => addShape(EllipseNode)
            },

            p: {
                name: "Parallelogram",
                children: () => addShape(ParallelogramNode)
            },

            h: {
                name: "Hexagon",
                children: () => addShape(HexagonNode)
            },

            r: {
                name: "Rombus",
                children: () => addShape(RombusNode),
            },

            d: {
                name: "Database",
                children: () => addShape(DatabaseNode),
            },

            n: {
                name: "Note",
                children: () => addShape(NoteNode)
            },

            l: {
                name: "Cloud",
                children: () => addShape(CloudNode)
            },
            
        },
    },
    x: {
        name: "Delete",
        children: () => {
            const { selected, removeNode } = useNodeStore.getState();
            [...selected].forEach((id) => removeNode(id));
        },
    },
    g: {
        name: "Grab",
        children: () => useNodeStore.getState().setState(GraphState.Grabbed),
    },
    t: {
        name: "Text",
        children: () => useNodeStore.getState().setState(GraphState.Typing),
    },
    s: {
        name: "Resize",
        children: () => useNodeStore.getState().setState(GraphState.Scale),
    },
    y: {
        name: "Yank",
        children: () => {
            const { setState, setYanked, selected } = useNodeStore.getState();
            setYanked(selected)
            setState(GraphState.Yanked)
        },
    },
    m: {
        name: "Multi",
        children: () => useNodeStore.getState().setState(GraphState.Multi),
    },
    d: {
        name: "Detach",
        children: () => {
            const { rootId, updateNode, selected, findNode, apply } = useNodeStore.getState();

            const ids = [...selected];

            ids.forEach((id) => {
                findNode(id)?.parents?.forEach((parentId) => {
                    updateNode(parentId, (node) => ({
                        ...node,
                        children: node.children?.filter((n) => n !== id)
                    }));
                });
            });

            apply((node) => ({
                ...node,
                parents: [rootId]
            }));

            updateNode(rootId, (node) => ({
                ...node,
                children: [...(node.children ?? []), ...ids]
            }));
        },
    },
    arrowup: { name: "Up", children: () => navigate("up") },
    arrowdown: { name: "Down", children: () => navigate("down") },
    arrowleft: { name: "Left", children: () => navigate("left") },
    arrowright: { name: "Right", children: () => navigate("right") },
    c: {
        name: "Color",
        children: {
            r: {
                name: "Red",
                children: () => setColor("red"),
            },

            o: {
                name: "Orange",
                children: () => setColor("orange"),
            },

            y: {
                name: "Yellow",
                children: () => setColor("yellow"),
            },

            g: {
                name: "Green",
                children: () => setColor("green"),
            },

            b: {
                name: "Blue",
                children: () => setColor("blue"),
            },

            p: {
                name: "Purple",
                children: () => setColor("purple"),
            },

            backspace: {
                name: "Default",
                children: () => setColor(undefined),
            }
        },
    },
    l: {
        name: "Layout",
        children: {
            d: {
                name: "Direction",
                children: {
                    arrowright: {
                        name: "Right",
                        children: () => useNodeStore.getState().setLayoutFlag(GraphLayout.DRight, GraphLayoutDirection)
                    },
                    arrowdown: {
                        name: "Down",
                        children: () => useNodeStore.getState().setLayoutFlag(GraphLayout.DDown, GraphLayoutDirection)
                    }
                }
            },
            a: {
                name: "Aligment",
                children: {
                    arrowup: {
                        name: "Up",
                        children: () => useNodeStore.getState().setLayoutFlag(GraphLayout.Up, GraphLayoutAlignment)
                    },
                    arrowdown: {
                        name: "Down",
                        children: () => useNodeStore.getState().setLayoutFlag(GraphLayout.Down, GraphLayoutAlignment)
                    },
                    arrowleft: {
                        name: "Left",
                        children: () => useNodeStore.getState().setLayoutFlag(GraphLayout.Left, GraphLayoutAlignment)
                    },
                    arrowright: {
                        name: "Right",
                        children: () => useNodeStore.getState().setLayoutFlag(GraphLayout.Right, GraphLayoutAlignment)
                    }
                }
            },
            s: {
                name: "Strategy",
                children: {
                    b: {
                        name: "Brandes Koepf",
                        children: () => useNodeStore.getState().setLayoutFlag(GraphLayout.Brandes_Koepf, GraphLayoutStrategy)
                    },
                    n: {
                        name: "Network Simplex",
                        children: () => useNodeStore.getState().setLayoutFlag(GraphLayout.Network_Simplex, GraphLayoutStrategy)
                    },
                    l: {
                        name: "Linear Segments",
                        children: () => useNodeStore.getState().setLayoutFlag(GraphLayout.Linear_Segments, GraphLayoutStrategy)
                    }
                }
            }
        }
    },
    z: {
        name: "Undo",
        children: () => {
            const { undo } = useNodeStore.getState();
            undo()
        }
    },
};

const grabbedBindings: Bindings = {
    g: {
        name: "Release",
        children: () => useNodeStore.getState().setState(GraphState.None),
    },
    arrowup: {
        name: "Up",
        children: () => move(0, -20),
    },
    arrowdown: {
        name: "Down",
        children: () => move(0, 20),
    },
    arrowleft: {
        name: "Left",
        children: () => move(-20, 0),
    },
    arrowright: {
        name: "Right",
        children: () => move(20, 0),
    },
};

const typingBindings: Bindings = {
    enter: {
        name: "Enter",
        children: () => {
            useNodeStore.getState().setState(GraphState.None)
        }
    }
}

const resizingBindings: Bindings = {
    s: {
        name: "Release",
        children: () => useNodeStore.getState().setState(GraphState.None),
    },
    arrowup: {
        name: "Scale",
        children: () => scale(0, -20),
    },
    arrowdown: {
        name: "Scale",
        children: () => scale(0, 20),
    },
    arrowleft: {
        name: "Scale",
        children: () => scale(-20, 0),
    },
    arrowright: {
        name: "Scale",
        children: () => scale(20, 0),
    },
}

const multiBindings: Bindings = {
    m: {
        name: "Done",
        children: () => useNodeStore.getState().setState(GraphState.None),
    },
    u: {
        name: "Unselect",
        children: () => {
            const { selected, setSelected, setState } = useNodeStore.getState();
            setSelected([selected[selected.length - 1]]);
            setState(GraphState.None);
        },
    },
    arrowup: baseBindings.arrowup,
    arrowdown: baseBindings.arrowdown,
    arrowleft: baseBindings.arrowleft,
    arrowright: baseBindings.arrowright,
}

const yankedBindings: Bindings = {
    y: {
        name: "Release",
        children: () => {
            const { setState, setYanked } = useNodeStore.getState();
            setYanked(undefined)
            setState(GraphState.None)
        },
    },
    p: {
        name: "Paste",
        children: {
            p: {
                name: "Without Children",
                children: () => {
                    const { yanked, selected } = useNodeStore.getState();

                    const parents = [...selected];
                    parents.forEach((parentId) => yanked.forEach((id) => pasteNode(id, parentId)));
                }
            },
            w: {
                name: "With Children",
                children: () => {
                    const { yanked, selected } = useNodeStore.getState();

                    const parents = [...selected];
                    parents.forEach((parentId) => yanked.forEach((id) => pasteTree(id, parentId)));
                },
            }
        },
    },
    x: {
        name: "Cut & Paste",
        children: {
            x: {
                name: "Without Children",
                children: () => {
                    const { yanked, selected, removeNode } = useNodeStore.getState();

                    const parents = [...selected];
                    const ids = [...yanked];
                    const copies = ids.map((id) => useNodeStore.getState().findNode(id));

                    ids.forEach((id) => removeNode(id));
                    parents.forEach((parentId) =>
                        copies.forEach((copy) => {
                            if (copy) useNodeStore.getState().addNode(parentId, copy);
                        })
                    );
                }
            },
            w: {
                name: "With Children",
                children: () => {
                    const { yanked, selected, removeNode } = useNodeStore.getState();

                    const parents = [...selected];
                    const ids = [...yanked];

                    parents.forEach((parentId) => ids.forEach((id) => pasteTree(id, parentId)));
                    ids.forEach((id) => removeNode(id));
                },
            }
        },
    },
    j: {
        name: "Join",
        children: () => {
            const { yanked, selected, updateNode } = useNodeStore.getState();

            selected.forEach((currentId) => {
                yanked.forEach((yankedId) => {
                    if (yankedId === currentId) return;

                    updateNode(yankedId, (node) => {
                        const parents = node.parents ?? [];
                        if (parents.includes(currentId)) return node;
                        return { ...node, parents: [...parents, currentId] };
                    });

                    updateNode(currentId, (node) => {
                        const children = node.children ?? [];
                        if (children.includes(yankedId)) return node;
                        return { ...node, children: [...children, yankedId] };
                    });
                });
            });
        },
    },
    s: {
        name: "Separate",
        children: () => {
            const { yanked, selected, updateNode, rootId } = useNodeStore.getState();

            selected.forEach((currentId) => {
                yanked.forEach((yankedId) => {
                    const yankedNode = useNodeStore.getState().nodes[yankedId];

                    if (!yankedNode) return;

                    if (yankedNode.parents?.includes(currentId)) {
                        const remainingParents = yankedNode.parents.filter((id) => id !== currentId);
                        const orphaned = remainingParents.length === 0;

                        updateNode(yankedId, (node) => ({
                            ...node,
                            parents: orphaned ? [rootId] : remainingParents
                        }));

                        updateNode(currentId, (node) => ({
                            ...node,
                            children: node.children?.filter((id) => id !== yankedId)
                        }));

                        if (orphaned) {
                            updateNode(rootId, (node) => ({
                                ...node,
                                children: node.children?.includes(yankedId)
                                    ? node.children
                                    : [...(node.children ?? []), yankedId]
                            }));
                        }
                    }
                });
            });
        },
    },
    arrowup: baseBindings.arrowup,
    arrowdown: baseBindings.arrowdown,
    arrowleft: baseBindings.arrowleft,
    arrowright: baseBindings.arrowright,
}

const stateBindings: Partial<Record<GraphState, Bindings>> = {
    [GraphState.None]: baseBindings,
    [GraphState.Grabbed]: grabbedBindings,
    [GraphState.Typing]: typingBindings,
    [GraphState.Scale]: resizingBindings,
    [GraphState.Yanked]: yankedBindings,
    [GraphState.Multi]: multiBindings,
};

export function resolveActiveBindings(): Bindings {
    const state = useNodeStore.getState().state;
    const bindings = stateBindings[state] ?? baseBindings;

    return bindings;
}

export type KeyStatus = "pending" | "success" | "fail";

export function createKeyResolver(
    onKey: (name: string | undefined, key: string | undefined, status: KeyStatus) => void
) {
    let chord: Bindings | null = null;

    return function handleKey(key: string) {
        const modeRoot = resolveActiveBindings();
        const root = chord ?? modeRoot;
        const entry = root[key.toLowerCase()];

        if (key === "Escape" && !entry) {
            chord = null;
            useNodeStore.getState().setActiveBindings(baseBindings);
            useNodeStore.getState().setState(GraphState.None);
            onKey(undefined, undefined, "fail");
            return;
        }

        if (useNodeStore.getState().state === GraphState.Typing && !entry) {
            if (key === "Backspace") {
                useNodeStore.getState().apply((node) => {
                    const text = node.meta?.text ?? "";
                    return {
                        ...node,
                        meta: {
                            ...node.meta,
                            text: text.slice(0, -1),
                        },
                    };
                });
                return;
            }

            if (key.length !== 1) {
                return;
            }

            useNodeStore.getState().apply((node) => {
                const text = (node.meta?.text ?? "") + key;
                return {
                    ...node,
                    meta: {
                        ...node.meta,
                        text,
                    },
                };
            });
            return;
        }

        if (!entry) {
            chord = null;
            useNodeStore.getState().setActiveBindings(resolveActiveBindings());
            onKey(undefined, key.toLowerCase(), "fail");
            return;
        }

        if (typeof entry.children === "function") {
            entry.children();
            chord = null;
            useNodeStore.getState().setActiveBindings(resolveActiveBindings());
            onKey(entry.name, key.toLowerCase(), "success");
            return;
        }

        chord = entry.children;
        useNodeStore.getState().setActiveBindings(chord);
        onKey(entry.name, key.toLowerCase(), "pending");
    };
}