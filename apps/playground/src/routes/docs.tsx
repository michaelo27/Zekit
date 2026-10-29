import React, { useMemo, useState } from "react";
import { ZEKIT_TAGLINE } from "../examples";

function Anchor({ id }: { id: string }) {
  return <span id={id} className="block scroll-mt-24" />;
}

function H1({ children }: { children: React.ReactNode }) {
  return (
    <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight leading-[1.1]">
      {children}
    </h1>
  );
}

function H2({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">
      {children}
    </h2>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-sm sm:text-base leading-relaxed text-[color:var(--muted)]">
      {children}
    </p>
  );
}

function Card({
  title,
  children,
  subtle,
}: {
  title?: string;
  children: React.ReactNode;
  subtle?: boolean;
}) {
  return (
    <div
      className={[
        "rounded-[28px] border border-[color:var(--border)]",
        subtle ? "bg-[var(--surface-2)]" : "bg-[var(--surface)]",
        "p-6",
      ].join(" ")}
    >
      {title ? (
        <div className="text-sm font-semibold tracking-tight text-[color:var(--text)]">
          {title}
        </div>
      ) : null}
      <div className={title ? "mt-3" : ""}>{children}</div>
    </div>
  );
}

function InlineCode({ children }: { children: string }) {
  return (
    <code className="rounded-lg border border-[color:var(--border)] bg-[var(--surface-2)] px-2 py-1 font-mono text-[12px] text-[color:var(--text)]">
      {children}
    </code>
  );
}

function CodeBlock({
  label,
  code,
}: {
  label?: string;
  code: string;
}) {
  const [copied, setCopied] = useState(false);

  return (
    <div className="rounded-2xl border border-[color:var(--border)] bg-[var(--surface)] p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="text-xs font-semibold text-[color:var(--muted)]">
          {label ?? "Example"}
        </div>
        <button
          type="button"
          className="rounded-xl border border-[color:var(--border)] bg-[var(--surface)] px-3 py-1.5 text-xs font-semibold hover:bg-[var(--surface-2)]"
          onClick={async () => {
            try {
              await navigator.clipboard?.writeText(code);
              setCopied(true);
              window.setTimeout(() => setCopied(false), 1200);
            } catch {
              // ignore
            }
          }}
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="mt-3 overflow-x-auto rounded-xl border border-[color:var(--border)] bg-[var(--surface-2)] p-4 font-mono text-[12px] leading-relaxed text-[color:var(--text)]">
{code}
      </pre>
    </div>
  );
}

function Callout({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-[color:var(--border)] bg-[var(--surface)] p-5">
      <div className="text-sm font-semibold">{title}</div>
      <div className="mt-2 text-sm leading-relaxed text-[color:var(--muted)]">
        {children}
      </div>
    </div>
  );
}

function Toc() {
  const items = [
    { id: "overview", label: "Overview" },
    { id: "quickstart", label: "Quickstart" },
    { id: "playground", label: "Playground flow" },
    { id: "cli", label: "CLI reference" },
    { id: "ts", label: "TypeScript SDK" },
    { id: "interop", label: "Interop notes" },
    { id: "security", label: "Security model" },
    { id: "troubleshooting", label: "Troubleshooting" },
    { id: "roadmap", label: "Roadmap" },
  ];

  return (
    <div className="sticky top-24 hidden lg:block">
      <div className="rounded-[28px] border border-[color:var(--border)] bg-[var(--surface)] p-5">
        <div className="text-xs font-semibold tracking-wide text-[color:var(--muted)]">
          Documentation
        </div>
        <div className="mt-3 space-y-1">
          {items.map((it) => (
            <a
              key={it.id}
              href={`#${it.id}`}
              className="block rounded-xl px-3 py-2 text-sm font-semibold text-[color:var(--text)] hover:bg-[var(--surface-2)]"
            >
              {it.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

export function DocsRoute() {
  const cmdPlayground = useMemo(() => "pnpm -C apps/playground dev", []);
  const cmdInstall = useMemo(() => "pnpm install", []);
  const cmdBuildAll = useMemo(
    () => "pnpm -C packages/zekit-ts build && pnpm -C apps/playground build",
    []
  );

  const cmdZipMake = useMemo(
    () =>
      'cargo run -p zekit-cli -- zip321 make --address utest1qz2c9w7x8r0orchard0placeholder9shielded7unified4address3testnet --amount 0.125 --memo "dev-coffee-orchard" --label "ZeKit Demo" --message "Zecathon Testnet Coffee"',
    []
  );

  const cmdZipParseJson = useMemo(
    () =>
      'cargo run -p zekit-cli -- --json zip321 parse "<paste zcash: URI here>"',
    []
  );

  const tsBuildExample = useMemo(
    () => `import { buildZip321Uri } from "zekit-ts";

const uri = buildZip321Uri({
  payments: [
    {
      address: "utest1...",          // recipient address (UA preferred)
      amountZatoshis: 12_500_000,    // 0.125 ZEC
      memo: "dev-coffee-orchard",
      label: "ZeKit Demo",
      message: "Zecathon Testnet Coffee",
      otherParams: {},
    },
  ],
});

console.log(uri);`,
    []
  );

  const tsParseExample = useMemo(
    () => `import { parseZip321Uri } from "zekit-ts";

const req = parseZip321Uri("zcash:utest1...?amount=...&memo=...");
console.log(req.payments[0].amountZatoshis);
console.log(req.payments[0].memo);`,
    []
  );

  return (
    <div className="grid gap-6 lg:grid-cols-12">
      <div className="lg:col-span-4">
        <Toc />
      </div>

      <div className="lg:col-span-8 space-y-10">
        <div className="space-y-3">
          <div className="text-xs font-semibold tracking-wide text-[color:var(--muted)]">
            ZeKit Docs
          </div>
          <H1>Developer documentation</H1>
          <P>
            <strong className="text-[color:var(--text)]">{ZEKIT_TAGLINE}</strong>{" "}
            ZeKit is a Core &amp; Tooling dev kit that targets the sharp edges of
            shielded-payment integrations. Today’s demo focuses on{" "}
            <strong className="text-[color:var(--text)]">ZIP‑321 payment request URIs</strong>{" "}
            (build + parse + memo encoding) across Playground, CLI, and TypeScript.
          </P>
        </div>

        {/* Overview */}
        <section className="space-y-4">
          <Anchor id="overview" />
          <H2>Overview</H2>

          <div className="grid gap-4 sm:grid-cols-2">
            <Callout title="What ZeKit is">
              A cross-surface toolkit that keeps behavior consistent across{" "}
              <InlineCode>Rust</InlineCode>, <InlineCode>CLI</InlineCode>, and{" "}
              <InlineCode>TypeScript</InlineCode>. The goal: fewer integration bugs
              and faster wallet/app shipping.
            </Callout>

            <Callout title="What ZeKit is not (yet)">
              It is not a full wallet implementation. Transaction building/sync are
              roadmap items. The current shipped value is correctness + UX tooling
              around payment request artifacts.
            </Callout>
          </div>

          <Card title="Current capabilities (implemented)">
            <ul className="list-disc pl-5 space-y-2 text-sm text-[color:var(--muted)]">
              <li>
                ZIP‑321 URI building (single payment) with memo base64url (no padding).
              </li>
              <li>
                ZIP‑321 URI parsing into structured JSON (includes decoded UTF‑8 memo).
              </li>
              <li>
                CLI output in human-readable and <InlineCode>--json</InlineCode> modes.
              </li>
              <li>
                Playground UI: Builder → QR → Parser round-trip.
              </li>
            </ul>
          </Card>

          <Card title="Known limitations (explicit)">
            <ul className="list-disc pl-5 space-y-2 text-sm text-[color:var(--muted)]">
              <li>ZIP‑321 multi-output indexed params are not fully implemented.</li>
              <li>Unified Address receiver inspection is a roadmap module.</li>
              <li>Lightwalletd sync / Orchard sends are roadmap modules.</li>
            </ul>
          </Card>
        </section>

        {/* Quickstart */}
        <section className="space-y-4">
          <Anchor id="quickstart" />
          <H2>Quickstart</H2>

          <P>
            Minimal commands to run the Playground and validate behavior locally.
          </P>

          <div className="space-y-4">
            <CodeBlock label="Install dependencies (repo root)" code={cmdInstall} />
            <CodeBlock label="Run Playground" code={cmdPlayground} />
            <CodeBlock label="Production build (TS + Playground)" code={cmdBuildAll} />
          </div>
        </section>

        {/* Playground flow */}
        <section className="space-y-4">
          <Anchor id="playground" />
          <H2>Playground flow</H2>

          <Card title="Builder → Parser round-trip (recommended demo)">
            <ol className="list-decimal pl-5 space-y-2 text-sm text-[color:var(--muted)]">
              <li>
                Go to <strong className="text-[color:var(--text)]">ZIP‑321 Builder</strong>.
              </li>
              <li>Enter an address (UA preferred), amount, optional label/message, memo.</li>
              <li>Click Build → copy the URI → verify the QR renders.</li>
              <li>
                Go to <strong className="text-[color:var(--text)]">ZIP‑321 Parser</strong> → paste URI → Parse.
              </li>
              <li>
                Confirm the JSON includes <InlineCode>amountZatoshis</InlineCode> and decoded <InlineCode>memo</InlineCode>.
              </li>
            </ol>
          </Card>
        </section>

        {/* CLI */}
        <section className="space-y-4">
          <Anchor id="cli" />
          <H2>CLI reference</H2>

          <P>
            The CLI is ideal for scripting, CI, and debugging (“what does this URI actually mean?”).
          </P>

          <div className="space-y-4">
            <CodeBlock label="Build a ZIP‑321 URI" code={cmdZipMake} />
            <CodeBlock label="Parse a ZIP‑321 URI (JSON output)" code={cmdZipParseJson} />
          </div>

          <Card title="Common CLI patterns">
            <ul className="list-disc pl-5 space-y-2 text-sm text-[color:var(--muted)]">
              <li>
                Use <InlineCode>--json</InlineCode> for machine-readable output.
              </li>
              <li>
                Use the CLI to reproduce and verify a bug report: paste the URI and inspect fields.
              </li>
            </ul>
          </Card>
        </section>

        {/* TypeScript SDK */}
        <section className="space-y-4">
          <Anchor id="ts" />
          <H2>TypeScript SDK (zekit-ts)</H2>

          <P>
            <InlineCode>zekit-ts</InlineCode> exposes a small API for apps/SDK consumers with Zod validation.
          </P>

          <div className="grid gap-4">
            <Card title="API surface">
              <ul className="list-disc pl-5 space-y-2 text-sm text-[color:var(--muted)]">
                <li>
                  <InlineCode>buildZip321Uri(request)</InlineCode> → returns a canonical <InlineCode>zcash:</InlineCode> URI
                </li>
                <li>
                  <InlineCode>parseZip321Uri(uri)</InlineCode> → returns <InlineCode>Zip321Request</InlineCode>
                </li>
              </ul>
            </Card>

            <CodeBlock label="TypeScript: build example" code={tsBuildExample} />
            <CodeBlock label="TypeScript: parse example" code={tsParseExample} />
          </div>
        </section>

        {/* Interop */}
        <section className="space-y-4">
          <Anchor id="interop" />
          <H2>Interop notes (why this kit matters)</H2>

          <div className="grid gap-4 sm:grid-cols-2">
            <Callout title="Memo encoding">
              Memos in ZIP‑321 are encoded using <strong className="text-[color:var(--text)]">base64url</strong> without padding.
              Incorrect encoding is a common interoperability failure between apps.
            </Callout>

            <Callout title="Amount normalization">
              Wallet engines prefer integer amounts. ZeKit normalizes amounts into{" "}
              <InlineCode>amountZatoshis</InlineCode> in structured output.
              This prevents UI rounding mismatches.
            </Callout>
          </div>

          <Card title="Canonical behavior goal">
            <P>
              The same input should produce the same output across UI, CLI, and SDK. ZeKit’s philosophy is:
              <strong className="text-[color:var(--text)]"> one source of truth for edge-case rules</strong>.
            </P>
          </Card>
        </section>

        {/* Security */}
        <section className="space-y-4">
          <Anchor id="security" />
          <H2>Security model</H2>

          <Card title="No spending keys in the browser">
            <P>
              ZeKit’s Playground is designed for request construction, parsing, validation, and developer UX.
              Secret key material should not be handled in the browser layer. This reduces the risk of accidental key exposure.
            </P>
          </Card>
        </section>

        {/* Troubleshooting */}
        <section className="space-y-4">
          <Anchor id="troubleshooting" />
          <H2>Troubleshooting</H2>

          <div className="grid gap-4">
            <Card title="Parser shows error / empty output">
              <ul className="list-disc pl-5 space-y-2 text-sm text-[color:var(--muted)]">
                <li>Confirm the URI begins with <InlineCode>zcash:</InlineCode></li>
                <li>Ensure <InlineCode>memo</InlineCode> is base64url (no padding)</li>
                <li>Try CLI parse with <InlineCode>--json</InlineCode> to see exact failure</li>
              </ul>
            </Card>

            <Card title="Vercel deploy issues (pnpm)">
              <P>
                Pin Node + pnpm versions, and commit <InlineCode>pnpm-lock.yaml</InlineCode> for deterministic installs.
              </P>
            </Card>
          </div>
        </section>

        {/* Roadmap */}
        <section className="space-y-4">
          <Anchor id="roadmap" />
          <H2>Roadmap</H2>

          <Card title="Next milestones">
            <ul className="list-disc pl-5 space-y-2 text-sm text-[color:var(--muted)]">
              <li>
                Unified Address receiver inspection (wallet debugging and Orchard-first policy enforcement)
              </li>
              <li>Receipt bundles (consistent verification artifacts)</li>
              <li>Lightwalletd primitives (configurable LWD URL; no full node required)</li>
              <li>Orchard-first testnet send pipeline modules</li>
            </ul>
          </Card>
        </section>

        <div className="pt-4 text-xs text-[color:var(--muted)]">
          Tip: For a judge demo, show Builder → Parser → CLI --json parse.
        </div>
      </div>
    </div>
  );
}