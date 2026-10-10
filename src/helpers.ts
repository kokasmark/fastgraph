import { useFastGraphStore } from "./store";
import type { Node } from "./types";

export function move(dx: number, dy: number) {
    useFastGraphStore.setState((state) => {
        const ids = new Set<string>();
        const visited = new Set<string>();

        const collect = (nodeId: string) => {
            if (visited.has(nodeId)) return;
            visited.add(nodeId);

            ids.add(nodeId);
            state.nodes[nodeId]?.children?.forEach(collect);
        };

        useFastGraphStore.getState().selected.forEach(collect);

        const nodes = { ...state.nodes };
        ids.forEach((nodeId) => {
            const node = nodes[nodeId];
            if (!node) return;
            const prev = node.meta?.offset ?? { x: 0, y: 0 };
            nodes[nodeId] = {
                ...node,
                meta: {
                    ...node.meta,
                    offset: { x: prev.x + dx, y: prev.y + dy },
                },
            };
        });

        return { nodes };
    });
}

export function scale(dx: number, dy: number) {
    useFastGraphStore.getState().apply((node) => {
        return {
            ...node,
            meta: {
                ...node.meta,
                size: {
                    x: (node.meta?.size?.x ?? 64) + dx,
                    y: (node.meta?.size?.x ?? 64) + dy,
                },
            },
        };
    })
}

export function setColor(color?:string) {
    useFastGraphStore.getState().apply((node) => {
        return {
            ...node,
            meta: {
                ...node.meta,
                color: color,
            },
        };
    })
}

export function addShape(node:Node){
    const { selected, addNode } = useFastGraphStore.getState();
    [...selected].forEach((parentId) => addNode(parentId, node));
}
export function walk(node: Node | undefined, walkF: (node?: Node) => void, seen: string[]) {
    if (!node) return;

    const { findNode } = useFastGraphStore.getState();

    walkF(node);

    seen.push(node.id)

    node.children?.forEach(child => {
        if(!seen.includes(child))
            walk(findNode(child), walkF, seen);
    });
}