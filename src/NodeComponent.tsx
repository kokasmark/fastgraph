import { useNodeStore } from "./store";
import { GraphState } from "./types";
import type { Node } from "./types";

function cursorForState(state: GraphState): string {
    if (state === GraphState.Typing) return "typing";
    if (state === GraphState.Grabbed) return "grabbing";
    if (state === GraphState.Scale) return "resize";
    if (state === GraphState.Yanked) return "yanked";
    return "pointer";
}


export function NodeComponent({ node, hideCursor }: { node: Node, hideCursor?: boolean }) {
    const currentId = useNodeStore((s) => s.currentId);
    const isCurrent = currentId === node.id;
    const appState = useNodeStore((s) => s.state);

    const cursor = cursorForState(appState);

    const w = node.meta?.size?.x;
    const h = node.meta?.size?.y;

    return (
        <div
            style={{
                paddingLeft: `${16 + (node.meta?.size?.x ?? 0)}px`,
                paddingRight: `${16 + (node.meta?.size?.x ?? 0)}px`,
                paddingTop: `${16 + (node.meta?.size?.y ?? 0)}px`,
                paddingBottom: `${16 + (node.meta?.size?.y ?? 0)}px`,
            }}
            className={`relative flex w-fit items-center justify-center text-center min-w-16 min-h-16 max-w-64 bg-neutral-800 text-neutral-400
                ${node.style}
                ${node?.meta?.color ? `bg-${node.meta.color}-400!` : ""}
                ${node?.meta?.color ? `text-${node.meta.color}-900!` : ""}
            `}
        >
            {node.meta?.text && (
                <p className="w-full whitespace-pre-wrap break-words font-bold">{node.meta.text}</p>
            )}

            {(isCurrent && !hideCursor) && (
                <div
                    className="absolute -top-2 -right-2 w-6 h-6 pointer-events-none"
                    style={{
                        backgroundImage: `url(cursors/${cursor}.png)`,
                        backgroundSize: "contain",
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "center",
                    }}
                />
            )}
        </div>
    );
}