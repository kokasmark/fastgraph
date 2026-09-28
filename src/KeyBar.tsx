import { useEffect, useRef, useState } from "react";
import { createKeyResolver, type KeyStatus } from "./bindings";

const keyLabels: Record<string, string> = {
    arrowleft: "←",
    arrowright: "→",
    arrowup: "↑",
    arrowdown: "↓",
    enter: "⏎",
    shift: "⇧",
    escape: "↩",
    " ": "␣",
};

export function labelFor(key: string) {
    return keyLabels[key] ?? key.toUpperCase();
}

type Badge = {
    id: number;
    name: string;
    label: string;
    status: KeyStatus;
};

export function KeyBar() {
    const [badges, setBadges] = useState<Badge[]>([]);
    const idRef = useRef(0);
    const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

    useEffect(() => {
        const resolver = createKeyResolver((name, key, status) => {
            if(!key || !name){
                setBadges((prev) => prev.map(x => ({...x, status: "fail"})))
                clearTimeout(timeoutRef.current);
                timeoutRef.current = setTimeout(() => setBadges([]), 450);
                return;
            }

            const id = idRef.current++;

            setBadges((prev) => {
                const updated =
                    status === "pending"
                        ? prev
                        : prev.map((b) => ({ ...b, status }));

                return [...updated, { id, label: labelFor(key), name, status }];
            });

            if (status !== "pending") {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = setTimeout(() => setBadges([]), 450);
            }
        });

        function handleKeyDown(e: KeyboardEvent) {
            resolver(e.key);
        }

        document.body.addEventListener("keydown", handleKeyDown);
        return () => {
            document.body.removeEventListener("keydown", handleKeyDown);
            clearTimeout(timeoutRef.current);
        };
    }, []);

    return (
        <div className="key-bar">
            {badges.map((b) => (
                <div key={b.id} className={`key-cap key-cap--${b.status}`}>
                    {b.label}
                    <p className="absolute -top-5 text-xs font-thin text-nowrap">{b.name}</p>
                </div>
            ))}
        </div>
    );
}