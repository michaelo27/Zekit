import React, { useEffect, useMemo, useState } from "react";
import { ZEKIT_TAGLINE } from "../examples";
import { Nav, PlaygroundRoute } from "./nav";
import { Badge } from "./ui";
import { LogoMark } from "./logo";

function getIsDark(): boolean {
  return document.documentElement.classList.contains("dark");
}

function applyTheme(next: "light" | "dark") {
  if (next === "dark") document.documentElement.classList.add("dark");
  else document.documentElement.classList.remove("dark");
  localStorage.setItem("zekit-theme", next);
}

export function Layout({
  activeRoute,
  onSelectRoute,
  children,
}: {
  activeRoute: PlaygroundRoute;
  onSelectRoute: (route: PlaygroundRoute) => void;
  children: React.ReactNode;
}) {
  const [isDark, setIsDark] = useState(false);
  const [quickstartOpen, setQuickstartOpen] = useState(false);

  useEffect(() => {
    const saved =
      (localStorage.getItem("zekit-theme") as "light" | "dark" | null) ??
      "light";
    applyTheme(saved);
    setIsDark(getIsDark());
  }, []);

  const toggleTheme = () => {
    const next = getIsDark() ? "light" : "dark";
    applyTheme(next);
    setIsDark(getIsDark());
  };

  const quickCmd = useMemo(
    () =>
      'cargo run -p zekit-cli -- zip321 make --address utest1qz2c9w7x8r0orchard0placeholder9shielded7unified4address3testnet --amount 0.125 --memo "dev-coffee-orchard" --label "ZeKit Demo" --message "Zecathon Testnet Coffee"',
    [],
  );

  const isHome = activeRoute === "home";

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[color:var(--text)]">
      {/* Header: minimal on Home, app header on tools */}
      <header className="border-b border-[color:var(--border)] bg-[var(--bg)]">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4">
          <button
            type="button"
            onClick={() => onSelectRoute("home")}
            className="flex items-center gap-3"
            title="Home">
            <LogoMark size={38} />
            <div className="leading-tight">
              <div className="flex items-center gap-2">
                <span className="text-md font-semibold tracking-tight">
                  ZeKit
                </span>
                <Badge tone="neutral">Testnet</Badge>
                <Badge tone="neutral">Orchard-first</Badge>
              </div>
              <div className="text-[11px] text-[color:var(--muted)]">
                
              </div>
            </div>
          </button>

          <div className="flex items-center gap-2">
            {!isHome && (
              <>
                <Nav activeRoute={activeRoute} onSelect={onSelectRoute} />
                <button
                  type="button"
                  onClick={() => setQuickstartOpen(true)}
                  className="rounded-2xl border border-[color:var(--border)] bg-[var(--surface)] px-3 py-2 text-xs font-semibold hover:bg-[var(--surface-2)]">
                  Quickstart
                </button>
              </>
            )}

            <button
              type="button"
              onClick={toggleTheme}
              className="rounded-2xl border border-[color:var(--border)] bg-[var(--surface)] px-3 py-2 text-xs font-semibold hover:bg-[var(--surface-2)]"
              title="Toggle theme">
              {isDark ? "Dark" : "Light"}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-10">{children}</main>

      <footer className="border-t border-[color:var(--border)] py-8 text-xs text-[color:var(--muted)]">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span className="font-semibold text-[color:var(--text)]">
              ZeKit
            </span>{" "}
            · Rust + CLI + WASM · Core & Tooling
          </div>
          <div className="font-mono text-[11px]">
            Security: no spending keys in browser
          </div>
        </div>
      </footer>

      {/* Black modal available on tool pages */}
      {quickstartOpen && !isHome && (
        <div className="fixed inset-0 z-50 grid place-items-center zekit-modal-backdrop p-4">
          <div className="w-full max-w-2xl rounded-2xl zekit-modal p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-sm font-bold">Quickstart</div>
                <div className="mt-1 text-xs text-white/70">
                  Copy/paste commands for a fast demo.
                </div>
              </div>
              <button
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/80 hover:bg-white/10"
                onClick={() => setQuickstartOpen(false)}>
                Close
              </button>
            </div>

            <div className="mt-4 rounded-xl border border-white/10 bg-black/40 p-3">
              <div className="flex items-center justify-between gap-3">
                <div className="text-xs font-semibold text-white/80">
                  zekit zip321 make
                </div>
                <button
                  className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/80 hover:bg-white/10"
                  onClick={() => navigator.clipboard?.writeText(quickCmd)}>
                  Copy
                </button>
              </div>
              <pre className="mt-2 overflow-x-auto rounded-lg bg-black/60 p-2 font-mono text-[11px] text-white/80">
                {quickCmd}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
