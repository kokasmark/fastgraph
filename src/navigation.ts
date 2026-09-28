import { useNodeStore } from "./store";
import type { Rect } from "./types";

export const rectsMap = new Map<string, Rect>();

type Dir = "up" | "down" | "left" | "right";

const gap = (a0: number, a1: number, b0: number, b1: number) =>
    Math.max(0, Math.max(a0, b0) - Math.min(a1, b1));

export function navigate(dir: Dir) {
    const { currentId, rootId, findNode, setCurrent } = useNodeStore.getState();
    const from = rectsMap.get(currentId);
    if (!from) return;

    const horizontal = dir === "left" || dir === "right";
    const sign = dir === "right" || dir === "down" ? 1 : -1;
    const fcx = from.x + from.width / 2;
    const fcy = from.y + from.height / 2;
    const current = findNode(currentId);

    let best: { id: string; score: number } | null = null;

    for (const [id, r] of rectsMap) {
        if (id === currentId || id === rootId) continue;

        const dx = r.x + r.width / 2 - fcx;
        const dy = r.y + r.height / 2 - fcy;
        const along = (horizontal ? dx : dy) * sign;
        const across = horizontal ? dy : dx;
        if (along <= 0.001) continue;

        const alongGap = horizontal
            ? gap(from.x, from.x + from.width, r.x, r.x + r.width)
            : gap(from.y, from.y + from.height, r.y, r.y + r.height);
        const acrossGap = horizontal
            ? gap(from.y, from.y + from.height, r.y, r.y + r.height)
            : gap(from.x, from.x + from.width, r.x, r.x + r.width);

        let score = alongGap + along * 0.25 + acrossGap * 3 + Math.abs(across) * 0.5;

        const linked = current?.children?.includes(id) || current?.parents?.includes(id);
        if (linked) score *= 0.75;

        if (!best || score < best.score) best = { id, score };
    }

    if (best) setCurrent(best.id);
}