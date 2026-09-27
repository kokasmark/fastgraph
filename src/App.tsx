import { Tree } from "./Tree";
import { KeyBar } from "./KeyBar";
import { Help } from "./Help";
import { Layers } from "./Layers";

function App() {
    return (
        <div
            className="w-full h-full bg-neutral-900 overflow-hidden"
            style={{
                backgroundImage: "radial-gradient(circle, #3f3f46 1px, transparent 1px)",
                backgroundSize: "24px 24px"
            }}
        >

            <p className="uppercase absolute text-[10px] font-black text-gray-500 top-0 right-2">fastgraph</p>

            <Tree />
            <KeyBar />
            <Help />
            <Layers />

        </div>
    );
}

export default App
