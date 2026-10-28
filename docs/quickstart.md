# ZeKit Quickstart Guide

> **“Shielded Tx in Minutes. Stop integrating 8 components. Use one kit.”**

This guide walks through setting up **ZeKit** locally on Zcash **Testnet** (Orchard-first) across the CLI, Rust SDK, TypeScript/WASM SDK, and Web Playground.

> **Important:** Run all commands below on your local workstation — do **not** run package installation or Cargo builds inside restricted sandbox environments.

---

## 1. Prerequisites

- Rust `1.75+` (`rustup target add wasm32-unknown-unknown`)
- `wasm-pack` (`cargo install wasm-pack`)
- Node.js `20+` & `pnpm` `9+`

---

## 2. Five-Minute Testnet Flow (CLI)

- **Step 1 — Configure environment:** Copy `.env.example` to `.env` and review `ZEKIT_LIGHTWALLETD_URL`.
- **Step 2 — Run diagnostics:** Execute `cargo run -p zekit-cli -- doctor`.
- **Step 3 — Initialize Orchard wallet:** Execute `cargo run -p zekit-cli -- init`.
- **Step 4 — Generate a Unified Address:** Execute `cargo run -p zekit-cli -- address`.
- **Step 5 — Build a ZIP-321 Payment URI:** Execute `cargo run -p zekit-cli -- zip321 make --address <UA> --amount 0.01 --memo "Hello Orchard"`.
- **Step 6 — Sync & Send:** Sync testnet blocks and emit a verifiable `ReceiptBundle`.

> `TODO (Phase 2)`: Add end-to-end testnet faucet walkthrough, sample terminal transcripts, and verified `ReceiptBundle` output JSON.

---

## 3. Using `zekit-ts` + Web Playground

- Build WASM bindings with `pnpm build:wasm`
- Bundle TypeScript wrappers & Zod validators with `pnpm build:ts`
- Launch the interactive Playground with `pnpm dev:playground`

> `TODO (Phase 2)`: Add copy-paste browser/checkout snippet demonstrating `buildZip321Uri`, `inspectUnifiedAddress`, and `verifyReceiptBundle`.
