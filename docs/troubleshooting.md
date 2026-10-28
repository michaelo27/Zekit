# Troubleshooting & Testnet FAQ

Common issues and remedies when developing locally with **ZeKit**.

---

## 1. `lightwalletd` Connectivity Errors

- **Symptom:** `zekit doctor` or `zekit sync` reports TLS or connection timeout errors.
- **Checklist:**
  - Confirm `ZEKIT_LIGHTWALLETD_URL` includes `https://` and port `:9067` (e.g., `https://lightwalletd.testnet.electriccoin.co:9067`).
  - Ensure `ZEKIT_NETWORK=testnet` matches a testnet endpoint (do not mix mainnet endpoints with `utest1` addresses).
- `TODO (Phase 2)`: Add fallback public testnet `lightwalletd` endpoints and custom root CA guidance.

---

## 2. Secret Keys Rejected in `zekit-ts` / Playground

- **Symptom:** `Security violation: Secret spending keys are strictly forbidden in zekit-ts.`
- **Explanation:** By design, `zekit-ts` and the Web Playground refuse `uask1...`, `uasktest1...`, and `secret-extended-key-*` inputs to prevent accidental key exposure in browsers.
- **Fix:** Use public Unified Addresses (`u1...` / `utest1...`) in browser tools, and use `zekit-cli` locally for spending operations.

---

## 3. ZIP-321 Memo Validation Failures

- **Symptom:** Building or parsing a URI fails when `memo` is supplied.
- **Checklist:**
  - Shielded memos are strictly capped at **512 bytes** in UTF-8.
  - Transparent-only addresses (`t1...`, `tm...`) **cannot** carry encrypted memos per ZIP-321. Use an Orchard-enabled Unified Address (`u1...` / `utest1...`).
- `TODO (Phase 2)`: Document exact error variants emitted by `ZeKitError::Zip321Error`.

---

## 4. WASM Module Loading in Vite (`apps/playground`)

- **Symptom:** Playground cannot find `packages/zekit-ts/pkg` when running locally for the first time.
- **Fix:** Build the WASM package locally first (`pnpm build:wasm && pnpm build:ts`) before starting Vite (`pnpm dev:playground`).
- `TODO (Phase 2)`: Document automatic pure-TS fallback behavior when WASM artifacts are absent during UI development.
