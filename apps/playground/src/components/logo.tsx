import React from "react";

export function LogoMark({ size = 36 }: { size?: number }) {
  return (
    <div
      className="grid place-items-center rounded-2xl border border-[color:var(--border)] bg-[var(--surface)]"
      style={{ width: size, height: size }}
      aria-label="ZeKit"
      title="ZeKit">
      <svg
        width={Math.round(size * 0.62)}
        height={Math.round(size * 0.62)}
        viewBox="0 0 64 64"
        fill="none"
        aria-hidden="true">
        {/* shield */}
        <path
          d="M32 6 L52 14 V30 C52 44.5 43 53.8 32 58 C21 53.8 12 44.5 12 30 V14 Z"
          stroke="currentColor"
          strokeWidth="2.5"
          className="text-[color:var(--text)]"
        />
        {/* stylized Z */}
        <path
          d="M22 22 H42 L23 42 H42"
          stroke="currentColor"
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-[color:var(--accent)]"
        />
      </svg>
    </div>
  );
}

export function LogoWordmark() {
  return (
    <div className="leading-tight">
      <div className="text-sm font-semibold tracking-tight text-[color:var(--text)]">
        ZeKit
      </div>
      <div className="text-[11px] text-[color:var(--muted)]">
        Orchard-first · Testnet
      </div>
    </div>
  );
}
