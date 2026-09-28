import { useNodeStore } from "./store";

export function move(dx: number, dy: number) {
    useNodeStore.setState((state) => {
        const ids = new Set<string>();
        const visited = new Set<string>();

        const collect = (nodeId: string) => {
            if (visited.has(nodeId)) return;
            visited.add(nodeId);

            ids.add(nodeId);
            state.nodes[nodeId]?.children?.forEach(collect);
        };

        collect(useNodeStore.getState().currentId);

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
    useNodeStore.getState().updateNode(useNodeStore.getState().currentId, (node) => {
        return {
            ...node,
            meta: {
                ...node.meta,
                size: {
                    x: (node.meta?.size?.x ?? 0) + dx,
                    y: (node.meta?.size?.x ?? 0) + dy,
                },
            },
        };
    })
}

export function setColor(color?:string) {
    useNodeStore.getState().updateNode(useNodeStore.getState().currentId, (node) => {
        return {
            ...node,
            meta: {
                ...node.meta,
                color: color,
            },
        };
    })
}