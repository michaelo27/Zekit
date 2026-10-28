import React, { useMemo, useState } from "react";
// @ts-ignore CSS side-effect imports may not have a TypeScript declaration.
import "../styles/home-wallet.css";
import { ZEKIT_TAGLINE, ZEKIT_TAGLINE2, ZEKIT_TAGLINE3 } from "../examples";
import { PlaygroundRoute } from "../components/nav";
import { ToastMessage } from "../components/ui";
import { RoadmapCircle, RoadmapMilestone } from "../components/roadmap-circle";

type CardId = "builder" | "parser" | "cli";

function FullSection({
  id,
  eyebrow,
  title,
  lead,
  children,
  tone = "plain",
}: {
  id: string;
  eyebrow: string;
  title: string;
  lead?: string;
  children?: React.ReactNode;
  tone?: "plain" | "surface";
}) {
  return (
    <section
      id={id}
      className={[
        "min-h-[85vh] flex items-center",
        tone === "surface"
          ? "rounded-[32px] border border-[color:var(--border)] bg-[var(--surface)]"
          : "",
      ].join(" ")}>
      <div className="w-full px-6 py-16 sm:px-10">
        <div className="mx-auto max-w-5xl">
          <div className="text-xs font-semibold tracking-wide text-[color:var(--muted)]">
            {eyebrow}
          </div>

          <h2 className="mt-3 text-3xl sm:text-4xl font-semibold tracking-tight leading-[1.08]">
            {title}
          </h2>

          {lead && (
            <p className="mt-4 max-w-2xl text-sm sm:text-base leading-relaxed text-[color:var(--muted)]">
              {lead}
            </p>
          )}

          {children ? <div className="mt-10">{children}</div> : null}
        </div>
      </div>
    </section>
  );
}

export function HomeRoute({
  onNavigate,
  onToast,
}: {
  onNavigate: (r: PlaygroundRoute) => void;
  onToast: (title: string, tone?: ToastMessage["tone"]) => void;
}) {
  const [active, setActive] = useState<CardId>("builder");
  const [open, setOpen] = useState(false);

  const quickCmd = useMemo(
    () =>
      'cargo run -p zekit-cli -- zip321 make --address utest1qz2c9w7x8r0orchard0placeholder9shielded7unified4address3testnet --amount 0.125 --memo "dev-coffee-orchard" --label "ZeKit Demo" --message "Zecathon Testnet Coffee"',
    [],
  );

  const cta =
    active === "builder"
      ? { label: "Open ZIP‑321 Builder", route: "builder" as PlaygroundRoute }
      : active === "parser"
        ? { label: "Open ZIP‑321 Parser", route: "parser" as PlaygroundRoute }
        : { label: "Open ZIP‑321 Parser", route: "parser" as PlaygroundRoute };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    el.style.setProperty("--shine-x", `${x}%`);
    el.style.setProperty("--shine-y", `${y}%`);
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    el.style.setProperty("--shine-x", "50%");
    el.style.setProperty("--shine-y", "50%");
  };

  const milestones: RoadmapMilestone[] = [
    {
      id: "zip321",
      eyebrow: "Milestone 01",
      title: "ZIP‑321 canonical build/parse",
      body: "Consistent URI construction + decoding across Playground + CLI + TypeScript (memo base64url, amounts normalized).",
      status: "now",
    },
    {
      id: "ua",
      eyebrow: "Milestone 02",
      title: "Unified Address receiver inspection",
      body: "Decode UA receivers and enforce Orchard-first selection policies (wallet-dev friendly debugging surface).",
      status: "next",
    },
    {
      id: "receipts",
      eyebrow: "Milestone 03",
      title: "ReceiptBundles standardization",
      body: "Generate and verify receipts for merchant/wallet flows, with consistent schemas across languages.",
      status: "next",
    },
    {
      id: "lwd",
      eyebrow: "Milestone 04",
      title: "Lightwalletd sync primitives",
      body: "Configurable LWD URL; scanning & sync building blocks so demos don’t require a full node.",
      status: "later",
    },
    {
      id: "orchard",
      eyebrow: "Milestone 05",
      title: "Orchard-first testnet sends (kit-level)",
      body: "End-to-end send pipeline as reusable tooling: build → prove → broadcast → receipt.",
      status: "later",
    },
  ];

  return (
    <div className="space-y-14">
      {/* HERO (calm) */}
      <section className="min-h-[90vh] flex items-center">
        <div className="w-full">
          <div className="grid gap-14 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-7">
              <div className="text-sm font-semibold tracking-wide text-[color:var(--muted)]">
                ZeKit · Core & Tooling · Orchard-first · Testnet
              </div>
              <p className="mt-4 text-5xl sm:text-6xl font-semibold tracking-tight leading-[1.02]">
                {ZEKIT_TAGLINE}
              </p>{" "}
              <p className="mt-4 text-red-400 text-md sm:text-4xl font-semibold tracking-tight leading-[1.02]">
                {ZEKIT_TAGLINE2}
              </p>{" "}
              <p className=" text-md sm:text-4xl text-red-400 font-semibold tracking-tight leading-[1.02]">
                {ZEKIT_TAGLINE3}
              </p>
              <p className="mt-6 max-w-xl text-sm sm:text-base leading-relaxed text-[color:var(--muted)]">
                ZeKit removes format + validation foot-guns from shielded
                payment integrations starting with ZIP‑321. One kit, consistent
                behavior across Rust, CLI, and TypeScript.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => onNavigate(cta.route)}
                  className="rounded-2xl bg-[color:var(--text)] px-6 py-3.5 text-sm font-semibold text-[color:var(--bg)] hover:opacity-90">
                  {cta.label}
                </button>

                <button
                  type="button"
                  onClick={() => setOpen(true)}
                  className="rounded-2xl border border-[color:var(--border)] bg-[var(--surface)] px-6 py-3.5 text-sm font-semibold hover:bg-[var(--surface-2)]">
                  Quickstart
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate("docs")}
                  className="rounded-2xl border border-[color:var(--border)] bg-[var(--surface)] px-6 py-3.5 text-sm font-semibold hover:bg-[var(--surface-2)]">
                  Read Docs
                </button>
              </div>
              <div className="mt-10 grid gap-2 text-sm text-[color:var(--muted)]">
                <div>
                  • Memo base64url (no padding) encoded/decoded correctly
                </div>
                <div>
                  • Amounts normalized to zatoshis for wallet-friendly output
                </div>
                <div>• Browser UI avoids secret key material by design</div>
              </div>
            </div>

            {/* Bigger cards visual */}
            <div className="lg:col-span-5">
              <div className="mx-auto w-full max-w-[460px]">
                <div className="relative h-[420px]">
                  <div className="absolute bottom-[120px] left-1/2 -translate-x-1/2 w-[380px] h-[235px]">
                    <div
                      className={`zekit-card zekit-card-builder ${active === "builder" ? "active" : ""}`}
                      onClick={() => setActive("builder")}
                      onMouseMove={handleMouseMove}
                      onMouseLeave={handleMouseLeave}
                      role="button">
                      <div className="zekit-card-content">
                        <div className="zekit-card-top">
                          <div className="zekit-dots">•••</div>
                          <div className="zekit-brand">Builder</div>
                        </div>
                        <div className="zekit-card-bottom">
                          <div className="zekit-card-info">
                            <div className="zekit-name">ZIP‑321 URI + QR</div>
                            <div className="zekit-number">memo → base64url</div>
                          </div>
                          <div className="zekit-expiry">UI</div>
                        </div>
                      </div>
                    </div>

                    <div
                      className={`zekit-card zekit-card-parser ${active === "parser" ? "active" : ""}`}
                      onClick={() => setActive("parser")}
                      onMouseMove={handleMouseMove}
                      onMouseLeave={handleMouseLeave}
                      role="button">
                      <div className="zekit-card-content">
                        <div className="zekit-card-top">
                          <div className="zekit-dots">•••</div>
                          <div className="zekit-brand">Parser</div>
                        </div>
                        <div className="zekit-card-bottom">
                          <div className="zekit-card-info">
                            <div className="zekit-name">URI → JSON</div>
                            <div className="zekit-number">zatoshis + memo</div>
                          </div>
                          <div className="zekit-expiry">WASM</div>
                        </div>
                      </div>
                    </div>

                    <div
                      className={`zekit-card zekit-card-cli ${active === "cli" ? "active" : ""}`}
                      onClick={() => setActive("cli")}
                      onMouseMove={handleMouseMove}
                      onMouseLeave={handleMouseLeave}
                      role="button">
                      <div className="zekit-card-content">
                        <div className="zekit-card-top">
                          <div className="zekit-dots">•••</div>
                          <div className="zekit-brand">CLI</div>
                        </div>
                        <div className="zekit-card-bottom">
                          <div className="zekit-card-info">
                            <div className="zekit-name">zekit zip321</div>
                            <div className="zekit-number">
                              make / parse / --json
                            </div>
                          </div>
                          <div className="zekit-expiry">Rust</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="absolute bottom-0 left-0 w-full h-[140px] rounded-[20px] zekit-wallet-base">
                    <div className="text-white text-[26px] font-semibold tracking-[-0.5px]">
                      ZeKit
                    </div>
                    <div className="text-white/85 text-[12px] mt-[2px]">
                      Click a card to choose your demo
                    </div>
                  </div>
                </div>

                <div className="mt-5 text-center text-xs text-[color:var(--muted)]">
                  {/* Minimal. Visual. Judge-friendly. */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Full-page sections */}
      <FullSection
        id="problem"
        eyebrow="Problem"
        title="Integration tax breaks interoperability"
        lead="Wallets and apps frequently diverge on URI grammar, memo encoding, and amount normalization. Those “small” bugs cause real payment failures."
        tone="surface">
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            {
              t: "Memo encoding",
              d: "Base64url rules + padding mistakes break wallet decoding.",
            },
            {
              t: "Amounts",
              d: "Decimal ZEC parsing/formatting & rounding issues cause mismatched UI vs engine.",
            },
            {
              t: "Inconsistent parsing",
              d: "Frontends, backends, and CLIs produce different interpretations of the same URI.",
            },
          ].map((x) => (
            <div
              key={x.t}
              className="rounded-2xl border border-[color:var(--border)] bg-[var(--surface)] p-5">
              <div className="text-sm font-semibold">{x.t}</div>
              <div className="mt-2 text-sm leading-relaxed text-[color:var(--muted)]">
                {x.d}
              </div>
            </div>
          ))}
        </div>
      </FullSection>

      <FullSection
        id="what"
        eyebrow="What ZeKit provides"
        title="One kit, multiple surfaces"
        lead="The same behaviors in Rust, CLI and TypeScript so wallet devs don’t debug three different implementations.">
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            {
              t: "Rust crate",
              d: "Core types + validation; reusable in wallet engines/services.",
            },
            {
              t: "CLI",
              d: "Scriptable zip321 make/parse; perfect for CI and debugging.",
            },
            {
              t: "TypeScript SDK",
              d: "Zod-validated API for apps; structured outputs.",
            },
            {
              t: "Playground",
              d: "Visual builder/parser with QR to validate behaviors fast.",
            },
          ].map((x) => (
            <div
              key={x.t}
              className="rounded-2xl border border-[color:var(--border)] bg-[var(--surface)] p-6">
              <div className="text-sm font-semibold">{x.t}</div>
              <div className="mt-2 text-sm leading-relaxed text-[color:var(--muted)]">
                {x.d}
              </div>
            </div>
          ))}
        </div>
      </FullSection>

      <FullSection
        id="demo"
        eyebrow="Demo"
        title="Judge flow in ~60 seconds"
        lead="A quick proof that the same rules work across UI and CLI."
        tone="surface">
        <ol className="list-decimal pl-5 space-y-2 text-sm sm:text-base text-[color:var(--muted)]">
          <li>Builder → generate a ZIP‑321 URI + QR.</li>
          <li>
            Parser → paste URI → decode to JSON (memo decoded, amountZatoshis
            normalized).
          </li>
          <li>
            CLI → parse with{" "}
            <span className="font-mono text-[color:var(--text)]">--json</span>{" "}
            to prove headless usage.
          </li>
        </ol>
      </FullSection>

      <FullSection
        id="roadmap"
        eyebrow="Roadmap"
        title="Clickable, draggable milestones"
        lead="Drag the ring to explore. Click a milestone to zoom/focus it in the center.">
        <RoadmapCircle milestones={milestones} />
      </FullSection>

      <FullSection
        id="security"
        eyebrow="Security posture"
        title="No spending keys in the browser"
        lead="The Playground is for building requests, parsing, and validation. Key material stays out of the web layer by design."
        tone="surface"
      />
      {/* Quickstart modal (black) */}
      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center zekit-modal-backdrop p-4">
          <div className="w-full max-w-2xl rounded-2xl zekit-modal p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-sm font-bold">Quickstart</div>
                <div className="mt-1 text-xs text-white/70">
                  Copy/paste this CLI command:
                </div>
              </div>
              <button
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/80 hover:bg-white/10"
                onClick={() => setOpen(false)}>
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
                  onClick={() => {
                    navigator.clipboard?.writeText(quickCmd);
                    onToast("Copied CLI command", "success");
                  }}>
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
