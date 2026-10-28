use anyhow::Result;
use clap::Args;

#[derive(Debug, Args)]
pub struct WatchArgs {
    /// Unified Full Viewing Key (`uviewtest1...` / `uview1...`)
    #[arg(long, env = "ZEKIT_UFVK")]
    pub ufvk: String,

    /// lightwalletd endpoint
    #[arg(
        long,
        env = "ZEKIT_LIGHTWALLETD_URL",
        default_value = "https://lightwalletd.testnet.electriccoin.co:9067"
    )]
    pub lightwalletd_url: String,

    /// Starting block height to scan from
    #[arg(long, default_value_t = 0)]
    pub from_height: u32,

    /// Minimum confirmations required before emitting receipt events
    #[arg(long, default_value_t = 1)]
    pub confirmations: u32,
}

pub async fn run(args: WatchArgs, _json: bool) -> Result<()> {
    // TODO(Phase 2): Instantiate ViewingWatcher::from_ufvk and stream decrypted shielded receipts
    println!(
        "[TODO Phase 2] zekit watch skeleton — endpoint={}, from_height={}, confirmations={}",
        args.lightwalletd_url, args.from_height, args.confirmations
    );
    Ok(())
}
