use std::fmt;
use std::path::PathBuf;

use serde::{Deserialize, Serialize};

use crate::error::{Result, ZeKitError};
use crate::receipt::{NetworkKind, ReceiptBundle, ShieldedPool};

/// Configuration for opening or initializing an Orchard-first ZeKit wallet.
#[derive(Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct WalletConfig {
    pub network: NetworkKind,
    pub data_dir: PathBuf,
    pub lightwalletd_url: String,
    pub birthday_height: Option<u32>,
}

impl fmt::Debug for WalletConfig {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.debug_struct("WalletConfig")
            .field("network", &self.network)
            .field("data_dir", &self.data_dir)
            .field("lightwalletd_url", &self.lightwalletd_url)
            .field("birthday_height", &self.birthday_height)
            .finish()
    }
}

/// Summary of a generated Unified Address and its embedded receivers.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UnifiedAddressInfo {
    pub address: String,
    pub network: NetworkKind,
    pub account_index: u32,
    pub diversifier_index: u32,
    pub receivers: Vec<String>,
    pub has_orchard: bool,
    pub has_sapling: bool,
    pub has_transparent: bool,
}

/// Result returned after synchronizing with a `lightwalletd` endpoint.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SyncSummary {
    pub scanned_from_height: u32,
    pub synced_to_height: u32,
    pub orchard_spendable_zatoshis: u64,
    pub orchard_pending_zatoshis: u64,
    pub notes_discovered: u32,
}

/// Parameters for constructing and broadcasting an Orchard-first shielded transfer.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SendRequest {
    /// Either a single destination address or a full `zcash:...` ZIP-321 URI.
    pub recipient_or_uri: String,
    /// Optional explicit amount in zatoshis (overrides single-recipient URI when set).
    pub amount_zatoshis: Option<u64>,
    /// Optional UTF-8 shielded memo (max 512 bytes).
    pub memo: Option<String>,
    /// Preferred pool (defaults to `ShieldedPool::Orchard`).
    pub preferred_pool: ShieldedPool,
}

/// Result of building, broadcasting, and sealing a receipt for a shielded send.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SendOutcome {
    pub txid: String,
    pub fee_zatoshis: u64,
    pub receipt: ReceiptBundle,
}

/// High-level Orchard-first Zcash wallet handle.
///
/// Spending authority stays strictly encapsulated inside native Rust memory/storage
/// and is redacted from `Debug` output.
pub struct ZeKitWallet {
    config: WalletConfig,
}

impl fmt::Debug for ZeKitWallet {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.debug_struct("ZeKitWallet")
            .field("config", &self.config)
            .field("spending_keys", &"<REDACTED>")
            .finish()
    }
}

impl ZeKitWallet {
    /// Initialize a new Orchard-first wallet in `config.data_dir`.
    pub fn init(_config: WalletConfig) -> Result<Self> {
        // TODO(Phase 2): Generate Unified Spending Key / birthday metadata & persist wallet state
        Err(ZeKitError::NotImplemented("ZeKitWallet::init (Phase 2)"))
    }

    /// Open an existing wallet from `config.data_dir`.
    pub fn open(_config: WalletConfig) -> Result<Self> {
        // TODO(Phase 2): Load persisted wallet state and verify network compatibility
        Err(ZeKitError::NotImplemented("ZeKitWallet::open (Phase 2)"))
    }

    /// Return the wallet's active configuration.
    pub fn config(&self) -> &WalletConfig {
        &self.config
    }

    /// Derive or fetch the default Orchard-enabled Unified Address.
    pub fn default_unified_address(&self) -> Result<UnifiedAddressInfo> {
        // TODO(Phase 2): Derive Orchard + Sapling Unified Address for account 0
        Err(ZeKitError::NotImplemented(
            "ZeKitWallet::default_unified_address (Phase 2)",
        ))
    }

    /// Export the Unified Full Viewing Key (`ufvk` / `uviewtest1...`) for audit or watch-only nodes.
    /// Never exports spending keys.
    pub fn export_ufvk(&self, _account_index: u32) -> Result<String> {
        // TODO(Phase 2): Encode UFVK with network HRP (`uview1` / `uviewtest1`)
        Err(ZeKitError::NotImplemented(
            "ZeKitWallet::export_ufvk (Phase 2)",
        ))
    }

    /// Synchronize compact blocks from `lightwalletd` and update Orchard note commitment tree.
    pub async fn sync(&mut self) -> Result<SyncSummary> {
        // TODO(Phase 2): Connect to lightwalletd gRPC / compact block scanner
        Err(ZeKitError::NotImplemented("ZeKitWallet::sync (Phase 2)"))
    }

    /// Construct, prove, broadcast an Orchard-first transaction and emit a [`ReceiptBundle`].
    pub async fn send(&mut self, _req: SendRequest) -> Result<SendOutcome> {
        // TODO(Phase 2): Parse recipient/ZIP-321, calculate ZIP-317 fee, build & broadcast tx, seal receipt
        Err(ZeKitError::NotImplemented("ZeKitWallet::send (Phase 2)"))
    }
}
