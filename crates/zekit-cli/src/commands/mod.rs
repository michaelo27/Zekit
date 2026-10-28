pub mod address;
pub mod doctor;
pub mod export;
pub mod init;
pub mod receipt;
pub mod send;
pub mod sync;
pub mod watch;
pub mod zip321;

use clap::{Parser, Subcommand};

#[derive(Debug, Parser)]
#[command(
    name = "zekit",
    version,
    about = "ZeKit CLI — Shielded Tx in Minutes. Stop integrating 8 components. Use one kit."
)]
pub struct Cli {
    /// Emit machine-readable JSON output
    #[arg(long, global = true, default_value_t = false)]
    pub json: bool,

    #[command(subcommand)]
    pub command: Commands,
}

#[derive(Debug, Subcommand)]
pub enum Commands {
    /// Check network config, data directory permissions, and lightwalletd connectivity
    Doctor(doctor::DoctorArgs),
    /// Initialize a new Orchard-first ZeKit wallet (testnet default)
    Init(init::InitArgs),
    /// Derive or inspect Unified Addresses for the active wallet
    Address(address::AddressArgs),
    /// Export non-spending viewing keys (UFVK) for watch-only servers or auditors
    Export(export::ExportArgs),
    /// Build or parse ZIP-321 payment request URIs (`make` / `parse`)
    Zip321(zip321::Zip321Args),
    /// Validate portable `zekit.receipt.v1` ReceiptBundle JSON files
    Receipt(receipt::ReceiptArgs),
    /// Synchronize compact blocks from lightwalletd
    Sync(sync::SyncArgs),
    /// Construct, broadcast an Orchard shielded transaction, and emit a ReceiptBundle
    Send(send::SendArgs),
    /// Monitor incoming shielded payments with a Viewing Key (no spending keys required)
    Watch(watch::WatchArgs),
}
