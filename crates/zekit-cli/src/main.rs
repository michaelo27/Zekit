#![forbid(unsafe_code)]

mod commands;

use anyhow::Result;
use clap::Parser;
use commands::{Cli, Commands};

#[tokio::main]
async fn main() -> Result<()> {
    tracing_subscriber::fmt()
        .with_env_filter(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| tracing_subscriber::EnvFilter::new("warn")),
        )
        .with_target(false)
        .init();

    let cli = Cli::parse();

    match cli.command {
        Commands::Doctor(args) => commands::doctor::run(args, cli.json).await,
        Commands::Init(args) => commands::init::run(args, cli.json).await,
        Commands::Address(args) => commands::address::run(args, cli.json).await,
        Commands::Export(args) => commands::export::run(args, cli.json).await,
        Commands::Zip321(args) => commands::zip321::run(args, cli.json).await,
        Commands::Receipt(args) => commands::receipt::run(args, cli.json).await,
        Commands::Sync(args) => commands::sync::run(args, cli.json).await,
        Commands::Send(args) => commands::send::run(args, cli.json).await,
        Commands::Watch(args) => commands::watch::run(args, cli.json).await,
    }
}
