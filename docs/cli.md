# ZeKit CLI Reference (`zekit`)

`zekit` is the single binary CLI for Orchard-first wallet management, ZIP-321 payment requests, Unified Address inspection, receipt validation, and viewing-key monitoring.

## Global Flags

- `--json` — Emit deterministic machine-readable JSON output for scripts and CI pipelines.
- `--help` / `--version` — Display CLI usage and version metadata.

---

## Commands Overview

### `zekit receipt validate`

Validates a `zekit.receipt.v1` JSON file or inline JSON string against `ReceiptBundleV1` (`serde` strict fields + RFC 3339 timestamp + 64-hex `txid` + canonical zatoshi bounds + 512-byte memo limit + secret-key rejection) and prints its canonical SHA-256 fingerprint.

```bash
# Validate a receipt file on disk
zekit receipt validate ./receipt.json

# Validate and emit structured JSON output
zekit receipt validate ./receipt.json --json

# Validate an inline JSON string directly
zekit receipt validate --raw '{
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
  "status": "confirmed"
}' --json
```

Example `--json` output:

```json
{
  "valid": true,
  "schema_version": "zekit.receipt.v1",
  "network": "testnet",
  "status": "confirmed",
  "txid": "6f84c2b910e5a4d3f90c21b8a7e45d1290c3f8a1b7e6d5c4321098fedcba4321",
  "payment_count": 1,
  "total_amount_zat": "2500000",
  "fingerprint_sha256": "..."
}
```

---

### `zekit zip321 make` / `zekit zip321 parse`
- `make`: Builds canonical `zcash:` URIs with automatic base64url (unpadded) memo encoding.
- `parse`: Parses single and multi-recipient (`address.1`, `amount.1`, ...) ZIP-321 URIs.
- `TODO (Subphase 2D)`: Wire full CLI formatting and `--json` output.

### `zekit doctor`
- Verifies network selection (`testnet` / `mainnet` / `regtest`), checks local wallet directory permissions, and probes `lightwalletd` endpoint health.

### `zekit init`
- Initializes a new Orchard-first wallet in `ZEKIT_DATA_DIR`.

### `zekit address`
- Displays the default Unified Address (`u1...` / `utest1...`) for `--account`, or inspects an external Unified Address (`zekit ua inspect` added in Subphase 2D).

### `zekit export`
- Exports the **Unified Full Viewing Key (`UFVK`)** (`uview1...` / `uviewtest1...`) for watch-only servers or auditors. Never exports raw spending keys.

### `zekit sync`
- Connects to `lightwalletd` and scans compact blocks from wallet birthday to chain tip.

### `zekit send`
- Accepts either a bare Unified Address or a full `zcash:` ZIP-321 URI, broadcasts the Orchard shielded transaction, and writes a `ReceiptBundleV1` (`--receipt-out`).

### `zekit watch`
- Runs a non-custodial watch-only monitor powered solely by `--ufvk` (`ZEKIT_UFVK`) and emits `ReceiptBundleV1` records as payments arrive.
