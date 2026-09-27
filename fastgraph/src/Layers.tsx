import { useNodeStore } from "./store";

export function Layers() {
    const nodes = useNodeStore((s) => s.nodes);
    const rootId = useNodeStore((s) => s.rootId);
    const currentId = useNodeStore((s) => s.currentId);
    const setCurrent = useNodeStore((s) => s.setCurrent);

    function renderNode(id: string) {
        const node = nodes[id];
        if (!node) return null;

        return (
            <button
                key={id}
                onClick={() => setCurrent(id)}
                className={`key-cap scale-40 -m-1.5
                    ${node.style}
                    ${node?.meta?.color ? `bg-${node.meta.color}-400!` : ""}
                    ${node?.meta?.color ? `text-${node.meta.color}-900!` : ""}
                    hover:brightness-125 transition-all
                    -mt-4
                    ${currentId === id ? "ring-1 ring-white ring-offset-1 ring-offset-neutral-900" : ""}`}
            >
            </button>
        );
    }

    function renderRow(
        ids: string[],
        depth: number,
        path = new Set<string>()
    ): React.ReactNode {
        if (ids.length === 0) return null;

        const used = new Set<string>();
        const groups: string[][] = [];

        ids.forEach((id) => {
            if (path.has(id) || used.has(id)) return;

            used.add(id);
            const group = [id];

            ids.forEach((otherId) => {
                if (path.has(otherId) || used.has(otherId)) return;

                const shares = nodes[id]?.children?.some((c) =>
                    nodes[otherId]?.children?.includes(c)
                );

                if (shares) {
                    group.push(otherId);
                    used.add(otherId);
                }
            });

            groups.push(group);
        });

        return groups.map((group) => {
            const childIds = Array.from(
                new Set(group.flatMap((id) => nodes[id]?.children ?? []))
            ).filter((id) => !path.has(id));

            const nextPath = new Set(path);
            group.forEach((id) => nextPath.add(id));

            return (
                <div key={group.join("-")}>
                    <div
                        className="flex items-center justify-end gap-0 py-0.5"
                        style={{ paddingRight: 12 + depth * 16 }}
                    >
                        {group.map((id) => renderNode(id))}
                    </div>

                    {renderRow(childIds, depth + 1, nextPath)}
                </div>
            );
        });
    }

    const root = nodes[rootId];

    return (
        <div className="absolute top-4 right-2 flex flex-col w-64 h-fit pt-4 overflow-y-auto">
            {renderRow(root?.children ?? [], 0)}
        </div>
    );
}