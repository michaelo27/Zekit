use std::collections::BTreeMap;

use chrono::{DateTime, SecondsFormat, Utc};
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};

use crate::error::{Result, ZeKitError};

/// Canonical schema version identifier for ZeKit ReceiptBundles (`zekit.receipt.v1`).
pub const RECEIPT_SCHEMA_VERSION: &str = "zekit.receipt.v1";

/// Maximum ZEC supply in zatoshis (`21_000_000 * 10^8`).
pub const MAX_ZATOSHIS: u64 = 2_100_000_000_000_000;

/// Maximum Zcash shielded memo size in bytes (ZIP-302 / protocol consensus).
pub const MAX_MEMO_BYTES: usize = 512;

/// Supported Zcash network environments.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, Default)]
#[serde(rename_all = "lowercase")]
pub enum NetworkKind {
    #[default]
    Testnet,
    Mainnet,
    Regtest,
}

impl NetworkKind {
    pub fn as_str(&self) -> &'static str {
        match self {
            Self::Testnet => "testnet",
            Self::Mainnet => "mainnet",
            Self::Regtest => "regtest",
        }
    }
}

/// Shielded value pool identifier used by wallet and watcher subsystems.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, Default)]
#[serde(rename_all = "lowercase")]
pub enum ShieldedPool {
    #[default]
    Orchard,
    Sapling,
}

/// Lifecycle state of a [`ReceiptBundleV1`].
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum ReceiptStatus {
    Created,
    Broadcast,
    Confirmed,
}

/// Single recipient payment record inside [`ReceiptBundleV1`].
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct ReceiptPayment {
    /// Destination Zcash address (Unified Address `utest1...` / `u1...` preferred).
    pub to: String,
    /// Payment amount in zatoshis encoded as a canonical base-10 integer string.
    pub amount_zat: String,
    /// Optional UTF-8 shielded memo (at most 512 bytes).
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub memo: Option<String>,
}

impl ReceiptPayment {
    /// Parse `amount_zat` into a validated `u64` zatoshi value.
    pub fn amount_zatoshis(&self) -> Result<u64> {
        parse_canonical_zatoshis(&self.amount_zat)
    }
}

/// Portable, secret-free Zcash payment receipt (`zekit.receipt.v1`).
///
/// Mirrored 1:1 in `packages/zekit-ts/src/ts/schemas.ts` (`ReceiptBundleSchema`).
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct ReceiptBundleV1 {
    /// Must always equal `"zekit.receipt.v1"`.
    pub schema_version: String,
    /// Target Zcash network (`"testnet"`, `"mainnet"`, or `"regtest"`).
    pub network: NetworkKind,
    /// Creation timestamp formatted as an RFC 3339 string (e.g. `"2026-10-28T12:00:00Z"`).
    pub created_at: String,
    /// 64-character hexadecimal transaction identifier.
    pub txid: String,
    /// Ordered list of recipient payments (`>= 1` item).
    pub payments: Vec<ReceiptPayment>,
    /// Optional originating `zcash:` ZIP-321 payment request URI.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub zip321: Option<String>,
    /// Lifecycle status (`"created" | "broadcast" | "confirmed"`).
    pub status: ReceiptStatus,
    /// Optional extensible string key-value metadata map.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub metadata: Option<BTreeMap<String, String>>,
}

/// Primary alias for the stable v1 receipt bundle schema.
pub type ReceiptBundle = ReceiptBundleV1;

impl ReceiptBundleV1 {
    /// Construct and validate a new [`ReceiptBundleV1`] stamped with the current UTC RFC 3339 time.
    pub fn new(
        network: NetworkKind,
        txid: impl Into<String>,
        payments: Vec<ReceiptPayment>,
        zip321: Option<String>,
        status: ReceiptStatus,
        metadata: Option<BTreeMap<String, String>>,
    ) -> Result<Self> {
        let bundle = Self {
            schema_version: RECEIPT_SCHEMA_VERSION.to_string(),
            network,
            created_at: Utc::now().to_rfc3339_opts(SecondsFormat::Secs, true),
            txid: txid.into(),
            payments,
            zip321,
            status,
            metadata,
        };
        bundle.validate()?;
        Ok(bundle)
    }

    /// Convenience constructor for Zcash `testnet` receipts.
    pub fn new_testnet(
        txid: impl Into<String>,
        payments: Vec<ReceiptPayment>,
        zip321: Option<String>,
        status: ReceiptStatus,
        metadata: Option<BTreeMap<String, String>>,
    ) -> Result<Self> {
        Self::new(
            NetworkKind::Testnet,
            txid,
            payments,
            zip321,
            status,
            metadata,
        )
    }

    /// Validate all structural, domain, and privacy invariants of this receipt bundle.
    pub fn validate(&self) -> Result<()> {
        if self.schema_version != RECEIPT_SCHEMA_VERSION {
            return Err(ZeKitError::ReceiptError(format!(
                "unsupported schema_version '{}', expected '{}'",
                self.schema_version, RECEIPT_SCHEMA_VERSION
            )));
        }

        DateTime::parse_from_rfc3339(&self.created_at).map_err(|e| {
            ZeKitError::ReceiptError(format!(
                "created_at '{}' is not valid RFC3339: {e}",
                self.created_at
            ))
        })?;

        if self.txid.len() != 64 || !self.txid.chars().all(|c| c.is_ascii_hexdigit()) {
            return Err(ZeKitError::ReceiptError(
                "txid must be a 64-character hexadecimal string".to_string(),
            ));
        }

        if self.payments.is_empty() {
            return Err(ZeKitError::ReceiptError(
                "payments must contain at least one recipient entry".to_string(),
            ));
        }

        for (idx, payment) in self.payments.iter().enumerate() {
            let trimmed_to = payment.to.trim();
            if trimmed_to.is_empty() {
                return Err(ZeKitError::ReceiptError(format!(
                    "payments[{idx}].to must not be empty"
                )));
            }
            reject_secret_key_material(trimmed_to)?;

            parse_canonical_zatoshis(&payment.amount_zat).map_err(|e| {
                ZeKitError::ReceiptError(format!("payments[{idx}].amount_zat invalid: {e}"))
            })?;

            if let Some(memo) = &payment.memo {
                if memo.len() > MAX_MEMO_BYTES {
                    return Err(ZeKitError::ReceiptError(format!(
                        "payments[{idx}].memo exceeds {MAX_MEMO_BYTES} UTF-8 bytes (got {} bytes)",
                        memo.len()
                    )));
                }
                reject_secret_key_material(memo)?;
            }
        }

        if let Some(uri) = &self.zip321 {
            if !uri.starts_with("zcash:") {
                return Err(ZeKitError::ReceiptError(
                    "zip321 field must start with 'zcash:' scheme".to_string(),
                ));
            }
            reject_secret_key_material(uri)?;
        }

        if let Some(meta) = &self.metadata {
            for (k, v) in meta {
                if k.trim().is_empty() {
                    return Err(ZeKitError::ReceiptError(
                        "metadata keys must not be empty".to_string(),
                    ));
                }
                reject_secret_key_material(v)?;
            }
        }

        Ok(())
    }

    /// Total zatoshi sum across all `payments` in this receipt.
    pub fn total_amount_zatoshis(&self) -> Result<u64> {
        let mut total: u64 = 0;
        for payment in &self.payments {
            let amt = payment.amount_zatoshis()?;
            total = total.checked_add(amt).ok_or_else(|| {
                ZeKitError::ReceiptError("total payment amount overflowed u64".to_string())
            })?;
        }
        if total > MAX_ZATOSHIS {
            return Err(ZeKitError::ReceiptError(format!(
                "total payment amount {total} exceeds MAX_ZATOSHIS ({MAX_ZATOSHIS})"
            )));
        }
        Ok(total)
    }

    /// Parse a JSON string into [`ReceiptBundleV1`] and enforce all domain invariants.
    pub fn from_json(raw: &str) -> Result<Self> {
        let bundle: Self = serde_json::from_str(raw)?;
        bundle.validate()?;
        Ok(bundle)
    }

    /// Serialize this receipt bundle as pretty-printed JSON after validating invariants.
    pub fn to_json_pretty(&self) -> Result<String> {
        self.validate()?;
        Ok(serde_json::to_string_pretty(self)?)
    }

    /// Compute a deterministic lowercase SHA-256 hex digest over the canonical JSON encoding.
    pub fn fingerprint_sha256(&self) -> Result<String> {
        self.validate()?;
        let canonical_bytes = serde_json::to_vec(self)?;
        let digest = Sha256::digest(&canonical_bytes);
        Ok(hex::encode(digest))
    }
}

/// Parse a canonical base-10 zatoshi string (`"0"` or non-zero digits without leading zeros).
pub fn parse_canonical_zatoshis(raw: &str) -> Result<u64> {
    if raw.is_empty() || !raw.bytes().all(|b| b.is_ascii_digit()) {
        return Err(ZeKitError::ReceiptError(format!(
            "expected base-10 non-negative integer string, got '{raw}'"
        )));
    }
    if raw.len() > 1 && raw.starts_with('0') {
        return Err(ZeKitError::ReceiptError(format!(
            "amount_zat '{raw}' must not contain leading zeros"
        )));
    }
    let value: u64 = raw.parse().map_err(|_| {
        ZeKitError::ReceiptError(format!("amount_zat '{raw}' overflows u64"))
    })?;
    if value > MAX_ZATOSHIS {
        return Err(ZeKitError::ReceiptError(format!(
            "amount_zat {value} exceeds max ZEC supply ({MAX_ZATOSHIS} zatoshis)"
        )));
    }
    Ok(value)
}

/// Ensure secret spending keys are never embedded inside receipts or public tool inputs.
pub fn reject_secret_key_material(candidate: &str) -> Result<()> {
    let lower = candidate.trim().to_ascii_lowercase();
    const FORBIDDEN_PREFIXES: &[&str] = &[
        "secret-extended-key-main",
        "secret-extended-key-test",
        "uask1",
        "uasktest1",
    ];
    for prefix in FORBIDDEN_PREFIXES {
        if lower.starts_with(prefix) {
            return Err(ZeKitError::SecretKeyForbidden(
                "Zcash spending key prefix detected in public/receipt field".to_string(),
            ));
        }
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    fn sample_valid_json() -> &'static str {
        r#"{
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
    "pool": "orchard",
    "order_id": "ord_1042"
  }
}"#
    }

    #[test]
    fn valid_receipt_roundtrips_and_hashes() {
        let bundle = ReceiptBundleV1::from_json(sample_valid_json()).expect("valid receipt");
        assert_eq!(bundle.schema_version, "zekit.receipt.v1");
        assert_eq!(bundle.network, NetworkKind::Testnet);
        assert_eq!(bundle.status, ReceiptStatus::Confirmed);
        assert_eq!(bundle.total_amount_zatoshis().unwrap(), 2_500_000);

        let reserialized = bundle.to_json_pretty().expect("serialize");
        let reparsed = ReceiptBundleV1::from_json(&reserialized).expect("reparse");
        assert_eq!(bundle, reparsed);
        assert_eq!(
            bundle.fingerprint_sha256().unwrap(),
            reparsed.fingerprint_sha256().unwrap()
        );
    }

    #[test]
    fn rejects_invalid_schema_or_txid() {
        let mut bundle = ReceiptBundleV1::from_json(sample_valid_json()).unwrap();
        bundle.schema_version = "zekit.receipt.v99".to_string();
        assert!(bundle.validate().is_err());

        let mut bad_txid = ReceiptBundleV1::from_json(sample_valid_json()).unwrap();
        bad_txid.txid = "not-a-hex-txid".to_string();
        assert!(bad_txid.validate().is_err());
    }

    #[test]
    fn rejects_malformed_amount_zat_and_secret_keys() {
        let mut bundle = ReceiptBundleV1::from_json(sample_valid_json()).unwrap();
        bundle.payments[0].amount_zat = "00250".to_string();
        assert!(bundle.validate().is_err());

        bundle.payments[0].amount_zat = "2500000".to_string();
        bundle.payments[0].to = "uasktest1secretkeymaterial".to_string();
        assert!(matches!(
            bundle.validate(),
            Err(ZeKitError::SecretKeyForbidden(_))
        ));
    }
}
