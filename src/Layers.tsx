import { useMemo } from "react";
import { useNodeStore } from "./store";
import { Shapes } from "./shapes";

export function Layers() {
    const nodes = useNodeStore((s) => s.nodes);
    const rootId = useNodeStore((s) => s.rootId);
    const currentId = useNodeStore((s) => s.currentId);
    const setCurrent = useNodeStore((s) => s.setCurrent);

    const levels = useMemo(() => {
        const depth: Record<string, number> = {};
        const order: string[] = [];
        const visiting = new Set<string>();

        function visit(id: string, d: number) {
            if (!nodes[id] || visiting.has(id)) return;
            if (depth[id] !== undefined && depth[id] >= d) return;
            if (depth[id] === undefined) order.push(id);

            depth[id] = d;
            visiting.add(id);
            nodes[id].children?.forEach((c) => visit(c, d + 1));
            visiting.delete(id);
        }

        nodes[rootId]?.children?.forEach((c) => visit(c, 0));

        const byDepth: string[][] = [];
        order.forEach((id) => {
            (byDepth[depth[id]] ??= []).push(id);
        });

        return byDepth.map((ids) => {
            const parent: Record<string, string> = {};
            const find = (x: string): string =>
                parent[x] === x ? x : (parent[x] = find(parent[x]));
            ids.forEach((id) => (parent[id] = id));

            for (let i = 0; i < ids.length; i++) {
                for (let j = i + 1; j < ids.length; j++) {
                    const shares = nodes[ids[i]].children?.some((c) =>
                        nodes[ids[j]].children?.includes(c)
                    );
                    if (shares) parent[find(ids[i])] = find(ids[j]);
                }
            }

            const groups = new Map<string, string[]>();
            ids.forEach((id) => {
                const r = find(id);
                groups.set(r, [...(groups.get(r) ?? []), id]);
            });
            return Array.from(groups.values());
        });
    }, [nodes, rootId]);

    function renderNode(id: string) {
        const node = nodes[id];
        if (!node) return null;

        const Shape = node.shape > -1 ? Shapes[node.shape].Svg : null;
    
        return (
            <button
                key={id}
                onClick={() => setCurrent(id)}
                className={`
                w-4 h-4
                shrink-0
                ${node?.meta?.color ? `text-${node.meta.color}-400` : "text-neutral-700"}
                hover:brightness-125
                cursor-pointer
                rounded-lg
                ${currentId === id ? "[filter:drop-shadow(1px_0_0_#fff)_drop-shadow(-1px_0_0_#fff)_drop-shadow(0_1px_0_#fff)_drop-shadow(0_-1px_0_#fff)]" : ""}`}
            >
                {Shape && <Shape />}
            </button>
        );
    }

    return (
        <div className="absolute top-6 right-2 flex flex-col w-64 h-fit">
            {levels.map((groups, depth) => (
                <div
                    key={depth}
                    className="flex items-center justify-end gap-2 py-0.5"
                    style={{ paddingRight: 12 + depth * 16 }}
                >
                    {groups.map((group) => (
                        <div key={group.join("-")} className="flex items-center gap-0">
                            {group.map(renderNode)}
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
}