import { resolveActiveBindings } from "./bindings";
import { labelFor } from "./KeyBar";
import { useNodeStore } from "./store";

export function Help() {
    const bindings = useNodeStore((s) => s.activeBindings) ?? resolveActiveBindings();

    return (
        <div className="fixed top-2 left-2 flex flex-col gap-2">
            {Object.entries(bindings).map(([key, entry]) => (
                <div key={key + entry.name} className="flex gap-2 items-center">
                    <div className={`key-cap`}>
                        {labelFor(key)}
                    </div>
                    <p className="text-xs text-neutral-500">{entry.name}</p>
                </div>
            ))}

            <div key={Object.keys(bindings).length} className="flex gap-2 items-center">
                    <div className={`key-cap`}>
                        {labelFor("escape")}
                    </div>
                    <p className="text-xs text-neutral-500">Cancel</p>
                </div>
        </div>
    );
}