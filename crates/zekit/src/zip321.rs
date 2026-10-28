use std::collections::BTreeMap;

use serde::{Deserialize, Serialize};

use crate::error::{Result, ZeKitError};

/// Single payment descriptor inside a ZIP-321 payment request URI.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PaymentItem {
    /// Recipient Zcash address (Unified, Sapling, or transparent).
    pub address: String,
    /// Optional amount in zatoshis (`1 ZEC = 100_000_000` zatoshis).
    #[serde(skip_serializing_if = "Option::is_none")]
    pub amount_zatoshis: Option<u64>,
    /// Optional base64url-decoded memo string (UTF-8) for shielded recipients.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub memo: Option<String>,
    /// Optional human-readable recipient label (`label` parameter).
    #[serde(skip_serializing_if = "Option::is_none")]
    pub label: Option<String>,
    /// Optional human-readable payment description (`message` parameter).
    #[serde(skip_serializing_if = "Option::is_none")]
    pub message: Option<String>,
    /// Additional non-required/experimental parameters (`other_params`).
    #[serde(default, skip_serializing_if = "BTreeMap::is_empty")]
    pub other_params: BTreeMap<String, String>,
}

/// Structured representation of a ZIP-321 `zcash:` payment request URI.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Zip321Request {
    /// Ordered list of payment outputs (`index 0` uses unindexed params, `1..N` use `.1`, `.2`, ...).
    pub payments: Vec<PaymentItem>,
}

/// Parse a `zcash:` ZIP-321 URI into a validated [`Zip321Request`].
pub fn parse_zip321(_uri: &str) -> Result<Zip321Request> {
    // TODO(Phase 2): Implement full ZIP-321 grammar, indexed params, decimal ZEC->zatoshi bounds,
    // base64url no-padding memo decoding, and transparent-address memo rejection.
    Err(ZeKitError::NotImplemented("zip321::parse_zip321 (Phase 2)"))
}

/// Build a canonical `zcash:` ZIP-321 URI from a [`Zip321Request`].
pub fn build_zip321(_request: &Zip321Request) -> Result<String> {
    // TODO(Phase 2): Validate addresses/memos, encode base64url memos without padding,
    // format non-scientific ZEC decimals, and emit canonical ZIP-321 URI string.
    Err(ZeKitError::NotImplemented("zip321::build_zip321 (Phase 2)"))
}
