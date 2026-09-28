import { useLayoutEffect, useRef, useState, useEffect } from "react";
import { GraphLayout, type Node, type Rect } from "./types";
import { NodeComponent } from "./NodeComponent";
import type { ElkNode } from "elkjs";
import ElkConstructor from "elkjs";
import { useNodeStore } from "./store";
import { rectsMap } from "./navigation";
import { encode, decode } from "./serialization";

const elk = new ElkConstructor();

export const getLayoutOptions = () => {
    const layout = useNodeStore.getState().layout;

    return {
        "elk.algorithm": "layered",
        "elk.direction": layout & GraphLayout.DDown ? "DOWN" : "RIGHT",
        "elk.spacing.nodeNode": "100",
        "elk.layered.spacing.nodeNodeBetweenLayers": "100",
        "elk.edgeRouting": "ORTHOGONAL",
        "elk.layered.nodePlacement.strategy":
            layout & GraphLayout.Network_Simplex
                ? "NETWORK_SIMPLEX"
                : layout & GraphLayout.Linear_Segments
                    ? "LINEAR_SEGMENTS"
                    : "BRANDES_KOEPF",
        "elk.layered.nodePlacement.bk.fixedAlignment":
            layout & GraphLayout.Left
                ? "LEFTUP"
                : layout & GraphLayout.Right
                    ? "RIGHTDOWN"
                    : layout & GraphLayout.Down
                        ? "DOWN"
                        : layout & GraphLayout.Up
                            ? "UP"
                            : "BALANCED",
        "elk.padding": "[top=40,left=40,bottom=40,right=40]",
        "elk.layered.crossingMinimization.semiInteractive": "true",
        "elk.layered.considerModelOrder.strategy": "NODES_AND_EDGES"
    };
};

export async function layoutNodes(rootId: string): Promise<{ nodes: Node[]; graph: ElkNode }> {
    const { findNode } = useNodeStore.getState();

    const nodes: Node[] = [];
    const edges: { id: string; source: string; target: string }[] = [];
    const visited = new Set<string>();

    function walk(nodeId: string) {
        if (visited.has(nodeId)) return;
        visited.add(nodeId);

        const node = findNode(nodeId);
        if (!node) return;

        nodes.push(node);

        node.children?.forEach((childId) => {
            edges.push({ id: `${nodeId}-${childId}`, source: nodeId, target: childId });
            walk(childId);
        });
    }

    walk(rootId);

    const indexOf = (id: string) => String(nodes.findIndex((n) => n.id === id));

    const graph = await elk.layout({
        id: "root",
        layoutOptions: getLayoutOptions(),
        children: nodes.map((_, i) => ({
            id: String(i),
            width: 100,
            height: 50
        })),
        edges: edges.map((edge) => ({
            id: edge.id,
            sources: [indexOf(edge.source)],
            targets: [indexOf(edge.target)]
        }))
    });

    return { nodes, graph };
}

function curvedPath(source: Rect, target: Rect, offset = 0) {
    const start = pointOnBoundary(source, {
        x: target.x + target.width / 2,
        y: target.y + target.height / 2
    });
    const end = pointOnBoundary(target, {
        x: source.x + source.width / 2,
        y: source.y + source.height / 2
    });

    const mx = (start.x + end.x) / 2;
    const my = (start.y + end.y) / 2;

    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len;
    const ny = dx / len;

    const cx = mx + nx * offset;
    const cy = my + ny * offset;

    return `M ${start.x} ${start.y} Q ${cx} ${cy} ${end.x} ${end.y}`;
}

function pointOnBoundary(rect: Rect, toward: { x: number; y: number }) {
    const cx = rect.x + rect.width / 2;
    const cy = rect.y + rect.height / 2;
    const dx = toward.x - cx;
    const dy = toward.y - cy;

    if (dx === 0 && dy === 0) return { x: cx, y: cy };

    const halfW = rect.width / 2;
    const halfH = rect.height / 2;
    const scaleX = dx !== 0 ? halfW / Math.abs(dx) : Infinity;
    const scaleY = dy !== 0 ? halfH / Math.abs(dy) : Infinity;
    const scale = Math.min(scaleX, scaleY);

    return { x: cx + dx * scale, y: cy + dy * scale };
}

export function Tree() {
    const [layout, setLayout] = useState<Awaited<ReturnType<typeof layoutNodes>>>();
    const [nodeRects, setNodeRects] = useState<Map<number, Rect>>(new Map());

    const nodeRefs = useRef<Map<number, HTMLDivElement>>(new Map());
    const nodes = useNodeStore((state) => state.nodes);
    const root = useNodeStore((state) => state.rootId);
    const loadGraph = useNodeStore((state) => state.loadGraph);
    const graphLayoutFlags = useNodeStore((state) => state.layout);

    const initialized = useRef(false);

    useEffect(() => {
        if (!initialized.current) {
            initialized.current = true;

            const url = new URL(window.location.href);
            const encoded = url.searchParams.get("graph");

            if (encoded) {
                const deserialized = decode(encoded);

                loadGraph(deserialized);

                console.log(`Loaded fastgraph with ${deserialized.nodes.length} nodes.`);
            }

            return;
        }

        layoutNodes(root).then(setLayout);

        const url = new URL(window.location.href);
        url.searchParams.set("graph", encode(root, Object.values(nodes)));

        history.replaceState(null, "", url);

        console.log(nodes)
    }, [root, nodes, graphLayoutFlags]);

    useLayoutEffect(() => {

        if (!layout) return;

        const measure = () => {
            const next = new Map<number, Rect>();
            nodeRefs.current.forEach((el, i) => {
                next.set(i, {
                    x: el.offsetLeft,
                    y: el.offsetTop,
                    width: el.offsetWidth,
                    height: el.offsetHeight
                });
            });
            setNodeRects(next);

            rectsMap.clear();
            next.forEach((rect, i) => {
                const id = layout.nodes[i]?.id;
                if (id) rectsMap.set(id, rect);
            });
        };

        measure();

        const observer = new ResizeObserver(measure);
        nodeRefs.current.forEach((el) => observer.observe(el));

        return () => {
            observer.disconnect();
            rectsMap.clear()
        }
    }, [layout, nodes]);

    if (!layout) return null;

    return (
        <div
            className="relative rounded-xl p-4 w-full h-full"
        >
            <svg
                className="absolute inset-0 text-white w-full h-full"
                width={layout.graph.width}
                height={layout.graph.height}
                style={{ overflow: "visible" }}
            >
                <defs>
                    <marker
                        id="arrow"
                        markerWidth="8"
                        markerHeight="8"
                        refX="6.1"
                        refY="4"
                        orient="auto"
                        markerUnits="strokeWidth"
                    >
                        <path
                            d="M1,1 L7,4 L1,7 Q0,7 0,6 L0,2 Q0,1 1,1 Z"
                            fill="currentColor"
                        />
                    </marker>
                </defs>

                {layout.graph.edges?.map((edge) => {
                    const sourceId = edge.sources?.[0];
                    const targetId = edge.targets?.[0];

                    if (sourceId === "0") return null;
                    if (sourceId === undefined || targetId === undefined) return null;

                    const sourceRect = nodeRects.get(Number(sourceId));
                    const targetRect = nodeRects.get(Number(targetId));

                    if (!sourceRect || !targetRect) return null;

                    const offset = Number(sourceId) < Number(targetId) ? -50 : 50;

                    const path = curvedPath(sourceRect, targetRect, offset);

                    return (
                        <path
                            key={edge.id}
                            d={path}
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="4"
                            strokeOpacity="0.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            markerEnd="url(#arrow)"
                        />
                    );
                })}
            </svg>

            {layout.nodes.map((node, i) => {
                const position = layout.graph.children?.find(
                    (child) => child.id === String(i)
                );

                if (!position) return null;

                return (
                    <div
                        key={i}
                        ref={(el) => {
                            if (el) nodeRefs.current.set(i, el);
                            else nodeRefs.current.delete(i);
                        }}
                        className="absolute"
                        style={{
                            left: (position.x ?? 0) + (node.meta?.offset?.x ?? 0),
                            top: (position.y ?? 0) + (node.meta?.offset?.y ?? 0)
                        }}
                    >
                        <NodeComponent node={node} />
                    </div>
                );
            })}
        </div>
    );
}