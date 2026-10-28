use std::path::PathBuf;

use anyhow::Result;
use clap::Args;

#[derive(Debug, Args)]
pub struct AddressArgs {
    /// Wallet data directory
    #[arg(long, env = "ZEKIT_DATA_DIR", default_value = ".zekit/testnet")]
    pub data_dir: PathBuf,

    /// Account index (ZIP-32)
    #[arg(long, default_value_t = 0)]
    pub account: u32,

    /// Inspect an arbitrary Unified Address instead of reading the local wallet
    #[arg(long)]
    pub inspect: Option<String>,
}

pub async fn run(args: AddressArgs, _json: bool) -> Result<()> {
    // TODO(Phase 2): Derive wallet UA or decode/inspect embedded receivers (Orchard/Sapling/Transparent)
    println!(
        "[TODO Phase 2] zekit address skeleton — account={}, inspect={:?}",
        args.account, args.inspect
    );
    Ok(())
}
