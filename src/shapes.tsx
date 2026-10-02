import {
    useLayoutEffect,
    useRef,
    useState,
    type ReactNode,
    type SVGProps,
} from "react";

export type ShapeProps = SVGProps<SVGSVGElement>;

export type Shape = {
    name: string;
    Svg: (props: ShapeProps) => ReactNode;
};

export const RADIUS = 4;

type Point = [number, number];

function roundedPath(pts: Point[], radius: number): string {
    const n = pts.length;
    let d = "";
    for (let i = 0; i < n; i++) {
        const prev = pts[(i - 1 + n) % n];
        const cur = pts[i];
        const next = pts[(i + 1) % n];

        const d1 = Math.hypot(prev[0] - cur[0], prev[1] - cur[1]);
        const d2 = Math.hypot(next[0] - cur[0], next[1] - cur[1]);
        const t = Math.min(radius, d1 / 2, d2 / 2);

        const a: Point = [
            cur[0] + ((prev[0] - cur[0]) / d1) * t,
            cur[1] + ((prev[1] - cur[1]) / d1) * t,
        ];
        const b: Point = [
            cur[0] + ((next[0] - cur[0]) / d2) * t,
            cur[1] + ((next[1] - cur[1]) / d2) * t,
        ];

        d += `${i === 0 ? "M" : "L"}${a[0]} ${a[1]} Q${cur[0]} ${cur[1]} ${b[0]} ${b[1]} `;
    }
    return d + "Z";
}

function RoundedPolygon({
    vertices,
    ...props
}: ShapeProps & { vertices: Point[] }) {
    const ref = useRef<SVGSVGElement>(null);
    const [size, setSize] = useState({ w: 0, h: 0 });

    useLayoutEffect(() => {
        const el = ref.current;
        if (!el) return;
        const update = () => {
            const r = el.getBoundingClientRect();
            setSize({ w: r.width, h: r.height });
        };
        update();
        const ro = new ResizeObserver(update);
        ro.observe(el);
        return () => ro.disconnect();
    }, []);

    const px = vertices.map(([x, y]): Point => [(x / 100) * size.w, (y / 100) * size.h]);

    return (
        <svg ref={ref} width="100%" height="100%" fill="currentColor" {...props}>
            {size.w > 0 && <path d={roundedPath(px, RADIUS)} />}
        </svg>
    );
}

const polygon =
    (vertices: Point[]) =>
    (props: ShapeProps) => <RoundedPolygon vertices={vertices} {...props} />;

const stretch = (children: ReactNode, props: ShapeProps) => (
    <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        width="100%"
        height="100%"
        fill="currentColor"
        {...props}
    >
        {children}
    </svg>
);

export const BoxShape: Shape = {
    name: "box",
    Svg: (props) => (
        <svg width="100%" height="100%" fill="currentColor" {...props}>
            <rect width="100%" height="100%" rx={RADIUS} ry={RADIUS} />
        </svg>
    ),
};

export const EllipseShape: Shape = {
    name: "ellipse",
    Svg: (props) => (
        <svg width="100%" height="100%" fill="currentColor" {...props}>
            <ellipse cx="50%" cy="50%" rx="50%" ry="50%" />
        </svg>
    ),
};

export const CircleShape: Shape = {
    name: "circle",
    Svg: (props) => (
        <svg viewBox="0 0 100 100" width="100%" height="100%" fill="currentColor" {...props}>
            <circle cx="50" cy="50" r="50" />
        </svg>
    ),
};

export const RombusShape: Shape = {
    name: "rombus",
    Svg: polygon([[50, 0], [100, 50], [50, 100], [0, 50]]),
};

export const ParallelogramShape: Shape = {
    name: "parallelogram",
    Svg: polygon([[15, 0], [100, 0], [85, 100], [0, 100]]),
};

export const TriangleShape: Shape = {
    name: "triangle",
    Svg: polygon([[50, 0], [100, 100], [0, 100]]),
};

export const HexagonShape: Shape = {
    name: "hexagon",
    Svg: polygon([[25, 0], [75, 0], [100, 50], [75, 100], [25, 100], [0, 50]]),
};

export const NoteShape: Shape = {
    name: "note",
    Svg: polygon([[0, 0], [85, 0], [100, 25], [100, 100], [0, 100]]),
};

export const DatabaseShape: Shape = {
    name: "database",
    Svg: (props) =>
        stretch(
            <>
                <path d="M0 12 A50 12 0 0 1 100 12 V88 A50 12 0 0 1 0 88 Z" />
                <ellipse cx="50" cy="12" rx="50" ry="12" fill="white" fillOpacity="0.25" />
            </>,
            props,
        ),
};

export const CloudShape: Shape = {
    name: "cloud",
    Svg: (props) =>
        stretch(
            <>
                <circle cx="30" cy="60" r="20" />
                <circle cx="50" cy="40" r="25" />
                <circle cx="72" cy="58" r="22" />
                <rect x="28" y="58" width="46" height="22" rx="11" />
            </>,
            props,
        ),
};

export const Shapes: Shape[] = [
    BoxShape,
    EllipseShape,
    CircleShape,
    RombusShape,
    DatabaseShape,
    ParallelogramShape,
    TriangleShape,
    HexagonShape,
    NoteShape,
    CloudShape,
];