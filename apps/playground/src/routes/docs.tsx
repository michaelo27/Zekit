import React, { useMemo } from "react";
import { ZEKIT_TAGLINE } from "../examples";

function Block({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[28px] border border-[color:var(--border)] bg-[var(--surface)] p-6">
      <div className="text-sm font-semibold tracking-tight">{title}</div>
      <div className="mt-3 text-sm leading-relaxed text-[color:var(--muted)]">
        {children}
      </div>
    </div>
  );
}

function Code({ children }: { children: string }) {
  return (
    <pre className="mt-3 overflow-x-auto rounded-2xl border border-[color:var(--border)] bg-[var(--surface-2)] p-4 font-mono text-[12px] leading-relaxed text-[color:var(--text)]">
      {children}
    </pre>
  );
}

export function DocsRoute() {
  const cmdMake = useMemo(
    () =>
      'cargo run -p zekit-cli -- zip321 make --address utest1qz2c9w7x8r0orchard0placeholder9shielded7unified4address3testnet --amount 0.125 --memo "dev-coffee-orchard" --label "ZeKit Demo" --message "Zecathon Testnet Coffee"',
    [],
  );

  const cmdParse = useMemo(
    () =>
      'cargo run -p zekit-cli -- --json zip321 parse "<paste zcash: URI here>"',
    [],
  );

  return (
    <div className="space-y-8">
      <div>
        <div className="text-xs font-semibold tracking-wide text-[color:var(--muted)]">
          Documentation
        </div>
        <h1 className="mt-3 text-3xl sm:text-4xl font-semibold tracking-tight">
          ZeKit Docs
        </h1>
        <p className="mt-3 max-w-2xl text-sm sm:text-base leading-relaxed text-[color:var(--muted)]">
          {ZEKIT_TAGLINE}. This page explains what ZeKit provides today (ZIP‑321
          tools) and how wallet developers can use the CLI + TypeScript kit
          consistently.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Block title="What ZeKit is">
          ZeKit is a Core &amp; Tooling developer kit: consistent
          parsing/building of payment request artifacts across Rust + CLI +
          TypeScript, reducing subtle interoperability bugs.
        </Block>

        <Block title="Security model">
          The web UI is intentionally “safe”: it focuses on building payment
          requests, parsing, validation, and UX tooling. No spending keys should
          be handled in the browser.
        </Block>
      </div>

      <Block title="CLI: build a ZIP‑321 request">
        <div>
          Generates a canonical{" "}
          <span className="font-mono text-[color:var(--text)]">zcash:</span> URI
          with memo base64url encoding.
        </div>
        <Code>{cmdMake}</Code>
      </Block>

      <Block title="CLI: parse a ZIP‑321 request (JSON)">
        <div>
          Decodes the URI into structured fields (including memo decoding). Use
          JSON for scripts/CI.
        </div>
        <Code>{cmdParse}</Code>
      </Block>

      <div className="grid gap-4 md:grid-cols-2">
        <Block title="Playground: Builder">
          Enter address/amount/memo → generate URI + QR. Copy into the Parser to
          round-trip.
        </Block>
        <Block title="Playground: Parser">
          Paste a URI → get structured JSON with{" "}
          <span className="font-mono text-[color:var(--text)]">
            amountZatoshis
          </span>{" "}
          and decoded memo.
        </Block>
      </div>

      <Block title="Roadmap">
        Next modules: UA receiver inspection, receipt bundle verification, then
        Orchard-first flows on testnet via lightwalletd.
      </Block>
    </div>
  );
}
