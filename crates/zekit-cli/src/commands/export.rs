use std::path::PathBuf;

use anyhow::Result;
use clap::Args;

#[derive(Debug, Args)]
pub struct ExportArgs {
    /// Wallet data directory
    #[arg(long, env = "ZEKIT_DATA_DIR", default_value = ".zekit/testnet")]
    pub data_dir: PathBuf,

    /// Account index whose Unified Full Viewing Key (`ufvk`) will be exported
    #[arg(long, default_value_t = 0)]
    pub account: u32,
}

pub async fn run(args: ExportArgs, _json: bool) -> Result<()> {
    // TODO(Phase 2): Export UFVK only (never spending keys unless explicitly unsupported)
    println!(
        "[TODO Phase 2] zekit export skeleton — account={}, data_dir={}",
        args.account,
        args.data_dir.display()
    );
    Ok(())
}
