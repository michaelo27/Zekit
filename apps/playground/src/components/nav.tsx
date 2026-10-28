import React from "react";

export type PlaygroundRoute =
  | "home"
  | "docs"
  | "builder"
  | "parser"
  | "ua-inspector"
  | "receipts";

const NAV: { id: PlaygroundRoute; label: string }[] = [
  { id: "builder", label: "Builder" },
  { id: "parser", label: "Parser" },
  { id: "ua-inspector", label: "UA Inspector" },
  { id: "receipts", label: "Receipts" },
];

export function Nav({
  activeRoute,
  onSelect,
}: {
  activeRoute: PlaygroundRoute;
  onSelect: (route: PlaygroundRoute) => void;
}) {
  return (
    <nav className="hidden md:flex items-center gap-1 rounded-2xl border border-[color:var(--border)] bg-[var(--surface)] p-1">
      {NAV.map((item) => {
        const active = item.id === activeRoute;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect(item.id)}
            className={[
              "rounded-xl px-3 py-2 text-xs font-semibold transition-colors",
              active
                ? "bg-[var(--surface-2)] text-[color:var(--text)]"
                : "text-[color:var(--muted)] hover:bg-[var(--surface-2)] hover:text-[color:var(--text)]",
            ].join(" ")}>
            {item.label}
          </button>
        );
      })}
    </nav>
  );
}
