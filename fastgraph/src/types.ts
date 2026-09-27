// ts-ignore
export enum GraphState {
    None,
    Grabbed,
    Typing,
    Scale,
    Yanked
}

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

export type Action = () => void;

export type Bindings = {
    [key: string]: {
        name: string;
        children: Action | Bindings;
    };
};