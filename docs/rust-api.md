# ZeKit Rust SDK API Reference (`crates/zekit`)

`zekit` exposes an ergonomic, `#![forbid(unsafe_code)]` Rust API so backend services and native apps can integrate shielded Zcash payments without wiring 8 low-level crates manually.

---

## 1. `zekit::receipt` — Stable `ReceiptBundleV1` Schema

`ReceiptBundleV1` (re-exported as `ReceiptBundle`) is ZeKit's canonical, secret-free payment receipt structure (`zekit.receipt.v1`). It is mirrored 1:1 in `packages/zekit-ts/src/ts/schemas.ts` (`ReceiptBundleSchema`).

### Rust Types

```rust
pub const RECEIPT_SCHEMA_VERSION: &str = "zekit.receipt.v1";

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, Default)]
#[serde(rename_all = "lowercase")]
pub enum NetworkKind {
    #[default]
    Testnet,
    Mainnet,
    Regtest,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum ReceiptStatus {
    Created,
    Broadcast,
    Confirmed,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct ReceiptPayment {
    pub to: String,
    pub amount_zat: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub memo: Option<String>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct ReceiptBundleV1 {
    pub schema_version: String,
    pub network: NetworkKind,
    pub created_at: String,
    pub txid: String,
    pub payments: Vec<ReceiptPayment>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub zip321: Option<String>,
    pub status: ReceiptStatus,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub metadata: Option<BTreeMap<String, String>>,
}

pub type ReceiptBundle = ReceiptBundleV1;
```

### Enforced Domain & Privacy Invariants (`ReceiptBundleV1::validate`)

- **`schema_version`**: Must equal `"zekit.receipt.v1"`. Unknown JSON properties are rejected (`#[serde(deny_unknown_fields)]`).
- **`created_at`**: Must parse as a valid RFC 3339 timestamp (`chrono::DateTime::parse_from_rfc3339`).
- **`txid`**: Must be an exact 64-character ASCII hexadecimal string.
- **`payments`**: Must contain at least 1 `ReceiptPayment`:
  - `to`: Non-empty recipient address; automatically rejects Zcash secret spending key prefixes (`uask1`, `uasktest1`, `secret-extended-key-*`).
  - `amount_zat`: Canonical base-10 non-negative integer string without leading zeros (`"0"` .. `"2100000000000000"`).
  - `memo`: Optional UTF-8 string up to `512` bytes (`MAX_MEMO_BYTES`), scanned against secret-key leakage.
- **`zip321`**: Optional string; when present, must begin with `"zcash:"`.
- **`status`**: One of `"created"`, `"broadcast"`, or `"confirmed"`.
- **`metadata`**: Optional `BTreeMap<String, String>` with non-empty keys; deterministic key ordering enables canonical SHA-256 fingerprinting via `bundle.fingerprint_sha256()`.

### Rust Usage Example

```rust
use std::collections::BTreeMap;
use zekit::{ReceiptBundleV1, ReceiptPayment, ReceiptStatus};

let mut meta = BTreeMap::new();
meta.insert("order_id".to_string(), "ord_1042".to_string());

let receipt = ReceiptBundleV1::new_testnet(
    "6f84c2b910e5a4d3f90c21b8a7e45d1290c3f8a1b7e6d5c4321098fedcba4321",
    vec![ReceiptPayment {
        to: "utest1qz2c9w7x8r0orchard0placeholder9shielded7unified4address3testnet".into(),
        amount_zat: "2500000".into(),
        memo: Some("Coffee via Orchard".into()),
    }],
    Some("zcash:utest1qz2c9w7x8r0orchard0placeholder9shielded7unified4address3testnet?amount=0.025".into()),
    ReceiptStatus::Confirmed,
    Some(meta),
)?;

let json = receipt.to_json_pretty()?;
let parsed = ReceiptBundleV1::from_json(&json)?;
let sha256 = parsed.fingerprint_sha256()?;
# Ok::<(), zekit::ZeKitError>(())
```

### JSON Schema Specification (Draft 2020-12) & Example Payload

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://zekit.dev/schemas/zekit.receipt.v1.json",
  "title": "ReceiptBundleV1",
  "type": "object",
  "additionalProperties": false,
  "required": [
    "schema_version",
    "network",
    "created_at",
    "txid",
    "payments",
    "status"
  ],
  "properties": {
    "schema_version": { "const": "zekit.receipt.v1" },
    "network": { "enum": ["testnet", "mainnet", "regtest"] },
    "created_at": { "type": "string", "format": "date-time" },
    "txid": { "type": "string", "pattern": "^[0-9a-fA-F]{64}$" },
    "payments": {
      "type": "array",
      "minItems": 1,
      "items": {
        "type": "object",
        "additionalProperties": false,
        "required": ["to", "amount_zat"],
        "properties": {
          "to": { "type": "string", "minLength": 1 },
          "amount_zat": { "type": "string", "pattern": "^(0|[1-9][0-9]*)$" },
          "memo": { "type": "string", "maxLength": 512 }
        }
      }
    },
    "zip321": { "type": "string", "pattern": "^zcash:" },
    "status": { "enum": ["created", "broadcast", "confirmed"] },
    "metadata": {
      "type": "object",
      "additionalProperties": { "type": "string" }
    }
  }
}
```

Example valid `ReceiptBundleV1` instance:

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

## 2. `zekit::zip321`
- `PaymentItem` — Recipient address, optional `amount_zatoshis`, UTF-8 `memo`, `label`, `message`, and extension params.
- `Zip321Request` — Ordered list of `PaymentItem`s.
- `parse_zip321(uri: &str) -> Result<Zip321Request>`
- `build_zip321(req: &Zip321Request) -> Result<String>`
- `TODO (Subphase 2B)`: Implement parser/builder and roundtrip unit tests.

## 3. `zekit::wallet`
- `WalletConfig` — Network, `data_dir`, `lightwalletd_url`, and optional `birthday_height`.
- `ZeKitWallet` — High-level Orchard-first wallet handle (`Debug` redacts spending keys).
- `TODO (Subphase 2B & 2E)`: Implement Unified Address inspection and isolated `lightwalletd`/SQLite wallet workflows.

## 4. `zekit::watch`
- `ViewingWatcher::from_ufvk(network, lightwalletd_url, ufvk)` — Rejects spending keys; safe for cloud deployment.
- `TODO (Subphase 2E)`: Implement viewing-key polling and receipt emission architecture.

---

## Feature Flags

- `wallet-runtime` *(default)* — Enables async `tokio` runtime support for `sync`, `send`, and `watch`.
- `default-features = false` — Pure data/codec mode used by `packages/zekit-ts` (`wasm32-unknown-unknown`).
