export enum GraphState {
    None,
    Grabbed,
    Typing,
    Scale,
    Yanked
}

export enum GraphLayout {
    Balanced = 0,

    // bk.fixedAlignment
    Left = 1 << 1,
    Right = 1 << 2,
    Down = 1 << 3,
    Up = 1 << 4,

    // elk.direction
    DRight = 1 << 10, 
    DDown = 1 << 11,

    // elk.strategy
    Brandes_Koepf = 1 << 20,
    Network_Simplex = 1 << 21,
    Linear_Segments = 1 << 22
}

export const GraphLayoutAlignment =
    GraphLayout.Left |
    GraphLayout.Right |
    GraphLayout.Down |
    GraphLayout.Up

export const GraphLayoutDirection =
    GraphLayout.DRight |
    GraphLayout.DDown

export const GraphLayoutStrategy =
    GraphLayout.Brandes_Koepf |
    GraphLayout.Network_Simplex |
    GraphLayout.Linear_Segments

export type NodeMeta ={
    offset?: {
        x: number,
        y: number,
    },
    size?: {
        x: number,
        y: number,
    }
    text?: string,
    color?: string
}

export type Node = {
    id: string;
    style?: string;
    parents?: string[];
    children?: string[];
    meta?: NodeMeta;
}

export type SerializedNode = {
    s?: number;
    p?: number[];
    c?: number[];
    m?: NodeMeta;
};

export type Tuple = [number?, number[]?, NodeMeta?];

export type SerializedGraph = {
    n: SerializedNode[];
};

export type DeserializedGraph = {
    nodes: Node[];
    root: string;
}

export type Action = () => void;

export type Bindings = {
    [key: string]: {
        name: string;
        children: Action | Bindings;
    };
};

export type Rect = { x: number; y: number; width: number; height: number };

export type StoreChange<S> = { key: keyof S; before: S[keyof S] };
export type Transaction<S> = StoreChange<S>[];

export type NodeStore = {
    nodes: Record<string, Node>;
    rootId: string;
    currentId: string;
    yankedId?: string;
    state: GraphState;
    layout: GraphLayout;
    activeBindings: Bindings | null;
    undoStack: Transaction<NodeStore>[];

    loadGraph: (graph: DeserializedGraph) => void;

    setActiveBindings: (bindings: Bindings | null) => void;
    findNode: (id: string) => Node | undefined;
    setState: (state: GraphState) => void;
    setLayoutFlag: (flag: GraphLayout, category: GraphLayout) => void;
    updateNode: (id: string, updater: (node: Node) => Node) => void;
    addNode: (parentId: string, child: Node) => string | undefined;
    setCurrent: (nodeId: string) => void;
    setYanked: (nodeId?: string) => void;
    removeNode: (nodeId: string) => void;
    undo: () => void;
};