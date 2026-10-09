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

            <div className="absolute bottom-2 right-2 flex flex-col items-end">
                <p className="uppercase text-[10px] leading-none font-black text-gray-500">fastgraph</p>
                <p className="uppercase text-[8px] leading-none font-black text-gray-500">{__VERSION__}</p>
            </div>

            <Tree />
            <KeyBar />
            <Help />
            <Layers />

        </div>
    );
}

export default App
