//! # ZeKit Core SDK
//!
//! > **“Shielded Tx in Minutes. Stop integrating 8 components. Use one kit.”**
//!
//! `zekit` provides an Orchard-first Zcash developer kit combining:
//! - **ZIP-321** payment request URI parsing & building (`zip321`)
//! - **Orchard-first Wallet** setup, Unified Addresses, `lightwalletd` sync & shielded send (`wallet`)
//! - **Viewing-Key Monitoring** for non-custodial incoming/outgoing shielded events (`watch`)
//! - **Verifiable ReceiptBundles** (`receipt`) with stable v1 schema validation

#![forbid(unsafe_code)]

pub mod error;
pub mod receipt;
pub mod wallet;
pub mod watch;
pub mod zip321;

pub use error::{Result, ZeKitError};
pub use receipt::{
    parse_canonical_zatoshis, reject_secret_key_material, NetworkKind, ReceiptBundle,
    ReceiptBundleV1, ReceiptPayment, ReceiptStatus, ShieldedPool, MAX_MEMO_BYTES, MAX_ZATOSHIS,
    RECEIPT_SCHEMA_VERSION,
};
pub use wallet::{
    SendOutcome, SendRequest, SyncSummary, UnifiedAddressInfo, WalletConfig, ZeKitWallet,
};
pub use watch::{ShieldedEvent, ViewingWatcher, WatchFilter};
pub use zip321::{build_zip321, parse_zip321, PaymentItem, Zip321Request};

/// Current crate semantic version.
pub const ZEKIT_VERSION: &str = env!("CARGO_PKG_VERSION");

/// Canonical ZeKit tagline.
pub const TAGLINE: &str = "Shielded Tx in Minutes. Stop integrating 8 components. Use one kit.";
