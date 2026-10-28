use std::path::PathBuf;

use anyhow::Result;
use clap::Args;

#[derive(Debug, Args)]
pub struct SyncArgs {
    /// Wallet data directory
    #[arg(long, env = "ZEKIT_DATA_DIR", default_value = ".zekit/testnet")]
    pub data_dir: PathBuf,

    /// lightwalletd gRPC endpoint
    #[arg(
        long,
        env = "ZEKIT_LIGHTWALLETD_URL",
        default_value = "https://lightwalletd.testnet.electriccoin.co:9067"
    )]
    pub lightwalletd_url: String,
}

pub async fn run(args: SyncArgs, _json: bool) -> Result<()> {
    // TODO(Phase 2): Open ZeKitWallet and run compact block sync against lightwalletd
    println!(
        "[TODO Phase 2] zekit sync skeleton — endpoint={}, data_dir={}",
        args.lightwalletd_url,
        args.data_dir.display()
    );
    Ok(())
}
