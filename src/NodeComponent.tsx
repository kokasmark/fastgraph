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
    const { currentId, rootId } = useNodeStore();
    const isCurrent = currentId === node.id && rootId !== node.id;
    const appState = useNodeStore((s) => s.state);

    const cursor = cursorForState(appState);

    const width = node.meta?.size?.x;
    const height = node.meta?.size?.y;

    return (
       <div
            style={{
                minWidth: 64,
                minHeight: 65,
                ...(width !== undefined && { width, maxWidth: width }),
                ...(height !== undefined && { height, maxHeight: height }),
            }}
            className="relative grid w-fit max-w-64"
        >

        <div
            className={`flex items-center justify-center text-center p-1 bg-neutral-800 text-neutral-400
                ${node.style}
                ${node?.meta?.color ? `bg-${node.meta.color}-400!` : ""}
                ${node?.meta?.color ? `text-${node.meta.color}-900!` : ""}
            `}
        >
            {node.meta?.text && (
                <p className="w-full whitespace-pre-wrap break-words font-bold">
                    {node.meta.text}
                </p>
            )}
        </div>

        {isCurrent && !hideCursor && (
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