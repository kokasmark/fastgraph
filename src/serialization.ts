import { styles, type DeserializedGraph, type Node, type SerializedGraph } from "./types";

export function encode(root:string, nodes: Node[]): string {
    const index = new Map<string, number>();

    nodes.forEach((node, i) => {
        index.set(node.id, i);
    });

    const serialized: SerializedGraph = {
        r: index.get(root)!,
        n: nodes.map(node => ({
            ...(node.style !== undefined && { s: styles.indexOf(node.style) }),
            ...(node.parents !== undefined && {
                p: node.parents
                    .map(id => index.get(id))
                    .filter((id): id is number => id !== undefined)
            }),
            ...(node.children !== undefined && {
                c: node.children
                    .map(id => index.get(id))
                    .filter((id): id is number => id !== undefined)
            }),
            ...(node.meta !== undefined && { m: node.meta })
        }))
    };

    const json = JSON.stringify(serialized);
    const bytes = new TextEncoder().encode(json);

    let binary = "";
    bytes.forEach(byte => binary += String.fromCharCode(byte));

    return btoa(binary)
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");
}

export function decode(value: string): DeserializedGraph {
    const base64 = value
        .replace(/-/g, "+")
        .replace(/_/g, "/");

    const padded = base64 + "=".repeat((4 - base64.length % 4) % 4);
    const binary = atob(padded);

    const bytes = Uint8Array.from(binary, char => char.charCodeAt(0));
    const json = new TextDecoder().decode(bytes);

    const serialized = JSON.parse(json) as SerializedGraph;

    const ids = serialized.n.map(() => crypto.randomUUID());

    return {
        root: ids[serialized.r],
        nodes: serialized.n.map((node, i) => ({
            id: ids[i],
            ...(node.s !== undefined && { style: styles[node.s]}),
            ...(node.p !== undefined && {
                parents: node.p.map(index => ids[index])
            }),
            ...(node.c !== undefined && {
                children: node.c.map(index => ids[index])
            }),
            ...(node.m !== undefined && { meta: node.m })
        }))
    };
}