import { type DeserializedGraph, type Node, type Tuple } from "./types";

const RAW = 0;
const DEFLATED = 1;

async function pipe(
    data: Uint8Array<ArrayBuffer>,
    stream: CompressionStream | DecompressionStream
): Promise<Uint8Array<ArrayBuffer>> {
    const out = new Blob([data]).stream().pipeThrough(stream);
    return new Uint8Array(await new Response(out).arrayBuffer());
}

function fromBase64Url(value: string): Uint8Array<ArrayBuffer> {
    const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
    return Uint8Array.from(atob(padded), char => char.charCodeAt(0));
}

function toBase64Url(bytes: Uint8Array): string {
    let binary = "";
    bytes.forEach(byte => (binary += String.fromCharCode(byte)));
    return btoa(binary)
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");
}

export async function encode(nodes: Node[]): Promise<string> {
    const index = new Map<string, number>(nodes.map((node, i) => [node.id, i]));

    const children: Set<number>[] = nodes.map(() => new Set<number>());

    nodes.forEach((node, i) => {
        node.children?.forEach(id => {
            const c = index.get(id);
            if (c !== undefined) children[i].add(c);
        });
        node.parents?.forEach(id => {
            const p = index.get(id);
            if (p !== undefined) children[p].add(i);
        });
    });

    const tuples = nodes.map((node, i) => {
        let s = node.shape;
        const c = [...children[i]].sort((a, b) => a - b);
        const tuple: unknown[] = [s, c, node.meta];

        if (node.meta === undefined) {
            tuple.pop();
            if (c.length === 0) {
                tuple.pop();
                if (s === 0) tuple.pop();
            }
        }
        return tuple as Tuple;
    });

    const json = new TextEncoder().encode(JSON.stringify(tuples));
    const deflated = await pipe(json, new CompressionStream("deflate-raw"));

    const useDeflate = deflated.length < json.length;
    const body = useDeflate ? deflated : json;

    const out = new Uint8Array(body.length + 1);
    out[0] = useDeflate ? DEFLATED : RAW;
    out.set(body, 1);

    return toBase64Url(out);
}

export async function decode(value: string): Promise<DeserializedGraph> {
    const raw = fromBase64Url(value);
    const body = raw.subarray(1);

    const bytes =
        raw[0] === DEFLATED
            ? await pipe(body, new DecompressionStream("deflate-raw"))
            : body;

    const tuples = JSON.parse(new TextDecoder().decode(bytes)) as Tuple[];
    const ids = tuples.map(() => crypto.randomUUID());

    const parents: string[][] = tuples.map(() => []);
    tuples.forEach(([, c], i) => {
        c?.forEach(child => parents[child]?.push(ids[i]));
    });

    return {
        root: ids[0],
        nodes: tuples.map(([s, c, m], i) => ({
            id: ids[i],
            ...({ shape: s }),
            ...(parents[i].length ? { parents: parents[i] } : {}),
            ...(c?.length ? { children: c.map(child => ids[child]) } : {}),
            ...(m !== undefined ? { meta: m } : {})
        }))
    };
}