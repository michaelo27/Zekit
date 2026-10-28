# ZeKit

> **“Shielded Tx in Minutes. Stop integrating 8 components. Use one kit.”**

Built for the **Zecathon Core & Tooling** track, **ZeKit** unifies Zcash Orchard-first shielded transactions, ZIP-321 payment requests, Unified Address inspection, viewing-key monitoring, and verifiable payment receipts into a single cohesive developer toolkit across **Rust**, **CLI**, **TypeScript/WASM**, and an interactive **Web Playground**.

---

## Why ZeKit?

Developers building privacy-preserving Zcash apps today have to manually stitch together **8 fragmented layers**:

1. `librustzcash` crates + wallet database + block scanning
2. `lightwalletd` gRPC connectivity & chain state management
3. **ZIP-321** payment request URI parsing & building
4. Unified Address + Full/Outgoing Viewing Key (`UFVK`/`OVK`) handling
5. Shielded transaction construction (Orchard-first) + fee calculation (ZIP-317)
6. Transaction broadcast & mempool/confirmation tracking
7. Incoming/outgoing viewing-key monitoring & webhook/event streams
8. Structured, verifiable payment **ReceiptBundles**

**Stop integrating 8 components. Use one kit.**

---

## Architecture & Deliverables

```text
zekit/
├── crates/
│   ├── zekit/          # Core Rust SDK (Orchard-first testnet, ZIP-321, sync, send, watch, receipts)
│   └── zekit-cli/      # `zekit` CLI binary (doctor, init, address, export, zip321, receipt, sync, send, watch)
├── packages/
│   └── zekit-ts/       # TypeScript + WASM SDK (ZIP-321, UA inspection, Zod ReceiptBundle — zero secret keys)
├── apps/
│   └── playground/     # Interactive Vite + React + Tailwind developer workbench
└── docs/               # Quickstart, CLI reference, Rust API guide, and Troubleshooting
```

### Privacy & Security Posture

- **Orchard-First by Default:** Prioritizes Orchard shielded receivers and Unified Addresses (`u1...` / `utest1...`).
- **Strict Secret Isolation:** Spending keys and seed phrases exist **exclusively** inside native Rust (`crates/zekit` / `zekit-cli`). The TypeScript/WASM boundary (`packages/zekit-ts`) and Web Playground **never** accept, store, or process secret spending keys.
- **Portable ReceiptBundles:** Secret-free JSON receipts (`zekit.receipt.v1`) allow merchants, auditors, and users to validate payment metadata across Rust and TypeScript with 1:1 schema parity.

---

## ReceiptBundle (stable schema)

ZeKit standardizes shielded payment receipts via **`ReceiptBundleV1`** (`schema_version: "zekit.receipt.v1"`), implemented identically in Rust (`crates/zekit/src/receipt.rs` with `serde`) and TypeScript (`packages/zekit-ts/src/ts/schemas.ts` with `zod`).

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `schema_version` | `"zekit.receipt.v1"` | Yes | Fixed schema discriminator |
| `network` | `"testnet" \| "mainnet" \| "regtest"` | Yes | Target Zcash network (`"testnet"` default) |
| `created_at` | `string` (RFC 3339) | Yes | UTC creation timestamp (e.g. `"2026-10-28T12:00:00Z"`) |
| `txid` | `string` (64-char hex) | Yes | Zcash transaction ID |
| `payments` | `Array<{ to, amount_zat, memo? }>` | Yes | Non-empty list of recipient outputs (`amount_zat` as canonical base-10 string; `memo` `<= 512` UTF-8 bytes) |
| `zip321` | `string` (`zcash:...`) | No | Originating ZIP-321 payment request URI |
| `status` | `"created" \| "broadcast" \| "confirmed"` | Yes | Receipt lifecycle state |
| `metadata` | `Record<string, string>` | No | Extensible string map for application/audit tags |

### Example `zekit.receipt.v1` JSON

```json
{
  "schema_version": "zekit.receipt.v1",
  "network": "testnet",
  "created_at": "2026-10-28T12:00:00Z",
  "txid": "6f84c2b910e5a4d3f90c21b8a7e45d1290c3f8a1b7e6d5c4321098fedcba4321",
  "payments": [
    {
      "to": "utest1qz2c9w7x8r0orchard0placeholder9shielded7unified4address3testnet",
      "amount_zat": "2500000",
      "memo": "Coffee via Orchard"
    }
  ],
  "zip321": "zcash:utest1qz2c9w7x8r0orchard0placeholder9shielded7unified4address3testnet?amount=0.025",
  "status": "confirmed",
  "metadata": {
    "order_id": "ord_1042",
    "pool": "orchard"
  }
}
```

---

## Project Status

- [x] **Phase 1 — Monorepo Skeleton:** Workspace manifests, CLI command tree, WASM bridge stubs, Playground visual UI shell, and documentation structure.
- [x] **Subphase 2A — ReceiptBundle v1 Schema & Docs:** Full Rust `ReceiptBundleV1` (`serde` + domain/privacy validation + unit tests), exact TypeScript `zod` mirror (`ReceiptBundleSchema`), `zekit receipt validate` CLI command, and stable schema documentation.
- [ ] **Subphase 2B — ZIP-321 + Unified Address Tooling:** Rust + TS ZIP-321 parser/builder, UA receiver inspection, and Playground wiring.
- [ ] **Subphase 2C — Playground UI Polish:** Noise/radial styling, copy buttons, inline QR rendering, and syntax-highlighted JSON viewer.
- [ ] **Subphase 2D — CLI Non-Network Commands:** Full `zip321 make/parse`, `ua inspect`, and `--json` UX.
- [ ] **Subphase 2E — Wallet Sync/Send/Watch Architecture:** SQLite wallet init, isolated `lightwalletd` boundary (`lwd.rs`), Orchard send, and viewing-key watcher.

---

## Local Build Instructions (Run Locally, NOT in Arena)

> **Note:** Execute the commands below on your local development machine. Do **not** run build/install commands inside restricted sandbox environments.

### Prerequisites

- **Rust:** `1.75+` with `wasm32-unknown-unknown` target (`rustup target add wasm32-unknown-unknown`)
- **wasm-pack:** `0.12+` (`cargo install wasm-pack`)
- **Node.js:** `20+` and **pnpm:** `9+`

### 1. Rust Workspace & CLI

```bash
# Check and test the Rust workspace
cargo check --workspace
cargo test --workspace

# Validate a ReceiptBundle JSON payload via CLI
cargo run -p zekit-cli -- receipt validate path/to/receipt.json --json

# Build or parse a ZIP-321 URI
cargo run -p zekit-cli -- zip321 make \
  --address utest1... \
  --amount 0.015 \
  --memo "Coffee via Orchard"
```

### 2. TypeScript + WASM SDK (`packages/zekit-ts`)

```bash
# Compile Rust WASM bindings into packages/zekit-ts/pkg
pnpm build:wasm

# Build the TypeScript wrapper + Zod validators
pnpm install
pnpm build:ts
```

### 3. Developer Playground (`apps/playground`)

```bash
# Start the local Vite dev server
pnpm dev:playground
```

---

## Documentation

- [Quickstart Guide](docs/quickstart.md)
- [CLI Reference (`zekit`)](docs/cli.md)
- [Rust SDK API Reference](docs/rust-api.md)
- [Troubleshooting & Testnet FAQ](docs/troubleshooting.md)

---

## License

Released under the [MIT License](LICENSE).
