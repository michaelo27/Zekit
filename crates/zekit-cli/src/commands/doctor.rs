use anyhow::Result;
use clap::Args;

#[derive(Debug, Args)]
pub struct DoctorArgs {
    /// lightwalletd endpoint to probe
    #[arg(
        long,
        env = "ZEKIT_LIGHTWALLETD_URL",
        default_value = "https://lightwalletd.testnet.electriccoin.co:9067"
    )]
    pub lightwalletd_url: String,

    /// Network name (`testnet` | `mainnet` | `regtest`)
    #[arg(long, env = "ZEKIT_NETWORK", default_value = "testnet")]
    pub network: String,
}

pub async fn run(args: DoctorArgs, _json: bool) -> Result<()> {
    // TODO(Phase 2): Probe lightwalletd GetLightdInfo, check wallet dir permissions, report status
    println!(
        "[TODO Phase 2] zekit doctor skeleton — network={}, endpoint={}",
        args.network, args.lightwalletd_url
    );
    Ok(())
}
