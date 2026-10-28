use std::path::PathBuf;

use anyhow::Result;
use clap::Args;

#[derive(Debug, Args)]
pub struct SendArgs {
    /// Wallet data directory
    #[arg(long, env = "ZEKIT_DATA_DIR", default_value = ".zekit/testnet")]
    pub data_dir: PathBuf,

    /// Destination Unified Address or full `zcash:` ZIP-321 URI
    #[arg(long)]
    pub to: String,

    /// Optional amount in ZEC (when `--to` is a bare address)
    #[arg(long)]
    pub amount: Option<String>,

    /// Optional UTF-8 shielded memo
    #[arg(long)]
    pub memo: Option<String>,

    /// Optional path to write the sealed `ReceiptBundle` JSON
    #[arg(long)]
    pub receipt_out: Option<PathBuf>,
}

pub async fn run(args: SendArgs, _json: bool) -> Result<()> {
    // TODO(Phase 2): Construct Orchard shielded tx, broadcast via lightwalletd, emit ReceiptBundle
    println!(
        "[TODO Phase 2] zekit send skeleton — to={}, receipt_out={:?}",
        args.to, args.receipt_out
    );
    Ok(())
}
