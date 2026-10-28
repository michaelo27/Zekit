use std::path::PathBuf;

use anyhow::Result;
use clap::Args;

#[derive(Debug, Args)]
pub struct InitArgs {
    /// Directory to store encrypted local wallet state
    #[arg(long, env = "ZEKIT_DATA_DIR", default_value = ".zekit/testnet")]
    pub data_dir: PathBuf,

    /// Zcash network (`testnet` | `mainnet` | `regtest`)
    #[arg(long, env = "ZEKIT_NETWORK", default_value = "testnet")]
    pub network: String,

    /// Optional wallet birthday block height
    #[arg(long)]
    pub birthday_height: Option<u32>,
}

pub async fn run(args: InitArgs, _json: bool) -> Result<()> {
    // TODO(Phase 2): Invoke ZeKitWallet::init and print initial Unified Address + safety notice
    println!(
        "[TODO Phase 2] zekit init skeleton — network={}, data_dir={}",
        args.network,
        args.data_dir.display()
    );
    Ok(())
}
