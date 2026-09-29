import { type Node } from "./types";

export const styles = [
    "hidden",
    "rounded-md!", 
    "rounded-full! aspect-square!",
    "[clip-path:polygon(50%_0,100%_50%,50%_100%,0_50%)]!",
    "relative! rounded-[50%_/_12%]! before:content-[''] before:absolute before:inset-x-0 before:top-0 before:h-[24%] before:rounded-[50%] before:border before:border-inherit",
    "[clip-path:polygon(15%_0,100%_0,85%_100%,0_100%)]!",
    "[clip-path:polygon(50%_0,100%_100%,0_100%)]!",
    "shape-cloud!",
]

export const RootNode: Node = {
    id: "",
    children: [],
    style: styles[0],
};

export const BoxNode: Node = { id: "", style: "rounded-md!" };

export const EllipseNode: Node = { id: "", style: "rounded-full!" };

export const CircleNode: Node = { id: "", style: "rounded-full! aspect-square!" };

export const RombusNode: Node = {
    id: "",
    style: "[clip-path:polygon(50%_0,100%_50%,50%_100%,0_50%)]!",
};

export const DatabaseNode: Node = {
    id: "",
    style:
        "relative! rounded-[50%_/_12%]! before:content-[''] before:absolute before:inset-x-0 before:top-0 before:h-[24%] before:rounded-[50%] before:border before:border-inherit",
};

export const ParallelogramNode: Node = {
    id: "",
    style: "[clip-path:polygon(15%_0,100%_0,85%_100%,0_100%)]!",
};

export const TriangleNode: Node = {
    id: "",
    style: "[clip-path:polygon(50%_0,100%_100%,0_100%)]!",
};

export const HexagonNode: Node = {
    id: "",
    style: "[clip-path:polygon(25%_0,75%_0,100%_50%,75%_100%,25%_100%,0_50%)]!",
};

export const NoteNode: Node = {
    id: "",
    style: "[clip-path:polygon(0_0,85%_0,100%_25%,100%_100%,0_100%)]!",
};

export const CloudNode: Node = {
    id: "",
    style: "shape-cloud!",
};