use serde::{Deserialize, Serialize};

use crate::error::{Result, ZeKitError};
use crate::receipt::{NetworkKind, ReceiptBundle, ShieldedPool};

/// Filtering options when watching incoming/outgoing shielded transactions with a viewing key.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct WatchFilter {
    /// Minimum payment value in zatoshis to report.
    pub min_amount_zatoshis: Option<u64>,
    /// Optional substring match on UTF-8 memo field.
    pub memo_contains: Option<String>,
    /// Require at least N confirmations before emitting `Confirmed` receipt events.
    pub min_confirmations: u32,
}

impl Default for WatchFilter {
    fn default() -> Self {
        Self {
            min_amount_zatoshis: None,
            memo_contains: None,
            min_confirmations: 1,
        }
    }
}

/// Decrypted shielded transaction event observed via a Full Viewing Key (`UFVK`).
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ShieldedEvent {
    pub txid: String,
    pub block_height: Option<u32>,
    pub confirmations: u32,
    pub pool: ShieldedPool,
    pub amount_zatoshis: u64,
    pub memo_utf8: Option<String>,
    pub receipt: ReceiptBundle,
}

/// Non-custodial viewing-key monitor (safe for backend servers — holds zero spending keys).
#[derive(Debug, Clone)]
pub struct ViewingWatcher {
    network: NetworkKind,
    lightwalletd_url: String,
    ufvk_redacted_fingerprint: String,
}

impl ViewingWatcher {
    /// Construct a watch-only monitor from a Unified Full Viewing Key (`uview1...` / `uviewtest1...`).
    /// Rejects spending keys (`secret-extended-key` / `uask`).
    pub fn from_ufvk(
        _network: NetworkKind,
        _lightwalletd_url: impl Into<String>,
        _ufvk: &str,
    ) -> Result<Self> {
        // TODO(Phase 2): Validate UFVK HRP & receivers, reject spending keys, compute FVK fingerprint
        Err(ZeKitError::NotImplemented(
            "ViewingWatcher::from_ufvk (Phase 2)",
        ))
    }

    /// Return the network configured for this watcher.
    pub fn network(&self) -> NetworkKind {
        self.network
    }

    /// Return the `lightwalletd` endpoint URL.
    pub fn lightwalletd_url(&self) -> &str {
        &self.lightwalletd_url
    }

    /// Return the redacted FVK fingerprint.
    pub fn fvk_fingerprint(&self) -> &str {
        &self.ufvk_redacted_fingerprint
    }

    /// Poll `lightwalletd` once for shielded events matching `filter` since `from_height`.
    pub async fn poll_once(
        &self,
        _from_height: u32,
        _filter: &WatchFilter,
    ) -> Result<Vec<ShieldedEvent>> {
        // TODO(Phase 2): Trial-decrypt compact/full Orchard actions with UFVK and seal ReceiptBundles
        Err(ZeKitError::NotImplemented(
            "ViewingWatcher::poll_once (Phase 2)",
        ))
    }
}
