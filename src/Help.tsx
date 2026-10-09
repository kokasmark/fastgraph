import { resolveActiveBindings } from "./bindings";
import { labelFor } from "./KeyBar";
import { useFastGraphStore } from "./store";

const ANIMATION_DELAY = 0.025;

export function Help() {
    const bindings = useFastGraphStore((s) => s.activeBindings) ?? resolveActiveBindings();

    return (
        <div className="fixed top-2 left-2 flex flex-col gap-2 flex-wrap h-full">
            {Object.entries(bindings).map(([key, entry], i) => (
                <div key={Math.random()} className="flex gap-2 items-center">
                    <div className={`key-cap`} style={{animationDelay: `${ANIMATION_DELAY * i}s`}}>
                        {labelFor(key)}
                    </div>
                    <p className="text-xs text-neutral-500 opacity-0 animate-[pop-in_0.18s_ease-out_forwards]" style={{animationDelay: `${ANIMATION_DELAY * i}s`}}>{entry.name}</p>
                </div>
            ))}

            <div key={Object.keys(bindings).length} className="flex gap-2 items-center">
                    <div className={`key-cap`} style={{animationDelay: `${ANIMATION_DELAY * Object.keys(bindings).length}s`}}>
                        {labelFor("escape")}
                    </div>
                    <p className="text-xs text-neutral-500 opacity-0 animate-[pop-in_0.18s_ease-out_forwards]" style={{animationDelay: `${ANIMATION_DELAY * Object.keys(bindings).length}s`}}>Cancel</p>
            </div>
        </div>
    );
}