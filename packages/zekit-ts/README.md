# `zekit-ts`

> **ZeKit TypeScript + WASM SDK** — *“Shielded Tx in Minutes. Stop integrating 8 components. Use one kit.”*

`zekit-ts` brings safe client-side Zcash tooling to web apps, checkouts, and developer dashboards via `wasm-bindgen` + TypeScript + `zod`:

- **ZIP-321 Builder & Parser:** Construct and validate single or multi-recipient `zcash:` payment request URIs.
- **Unified Address (UA) Inspector:** Decode Unified Addresses (`u1...` / `utest1...`) and inspect embedded Orchard, Sapling, and Transparent receivers.
- **ReceiptBundle Schemas & Verifier:** Strict `zod` schemas mirroring Rust's `ReceiptBundle` (`zekit.receipt.v1`) plus canonical integrity digest checks.

## Security Boundary (Zero Secret Keys)

`zekit-ts` **never** generates, accepts, stores, or processes spending keys (`secret-extended-key-*`, `uask*`, or BIP-39 seed phrases). All spending operations belong strictly in native Rust (`crates/zekit` or `zekit-cli`).

## Local Build (Run Locally, Not in Arena)

```bash
# 1. Build the Rust WASM module via wasm-pack
pnpm --filter zekit-ts build:wasm

# 2. Bundle the TypeScript wrapper + Zod types
pnpm --filter zekit-ts build
```

> **Status:** Phase 1 skeleton created. Full WASM bridge & TypeScript runtime wiring scheduled for Phase 2.
