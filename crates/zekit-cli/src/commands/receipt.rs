use std::fs;
use std::path::PathBuf;

use anyhow::{Context, Result};
use clap::{Args, Subcommand};
use serde::Serialize;
use zekit::ReceiptBundleV1;

#[derive(Debug, Args)]
pub struct ReceiptArgs {
    #[command(subcommand)]
    pub action: ReceiptCommand,
}

#[derive(Debug, Subcommand)]
pub enum ReceiptCommand {
    /// Validate a `zekit.receipt.v1` JSON file or inline JSON payload
    Validate {
        /// Path to a ReceiptBundle JSON file (optional when `--raw` is supplied)
        #[arg(value_name = "FILE")]
        file: Option<PathBuf>,

        /// Inline JSON string to validate directly
        #[arg(long)]
        raw: Option<String>,
    },
}

#[derive(Debug, Serialize)]
struct ValidationReport {
    valid: bool,
    schema_version: String,
    network: String,
    status: zekit::ReceiptStatus,
    txid: String,
    payment_count: usize,
    total_amount_zat: String,
    fingerprint_sha256: String,
}

pub async fn run(args: ReceiptArgs, json_output: bool) -> Result<()> {
    match args.action {
        ReceiptCommand::Validate { file, raw } => {
            let payload = match (file, raw) {
                (Some(path), None) => fs::read_to_string(&path)
                    .with_context(|| format!("failed to read receipt file: {}", path.display()))?,
                (None, Some(inline)) => inline,
                (Some(_), Some(_)) => {
                    anyhow::bail!("provide either a <FILE> path or `--raw <JSON>`, not both")
                }
                (None, None) => {
                    anyhow::bail!("missing input: pass `<FILE>` or `--raw '<JSON>'`")
                }
            };

            let bundle = ReceiptBundleV1::from_json(&payload)
                .context("ReceiptBundle v1 validation failed")?;
            let total_zat = bundle.total_amount_zatoshis()?;
            let fingerprint = bundle.fingerprint_sha256()?;

            let report = ValidationReport {
                valid: true,
                schema_version: bundle.schema_version.clone(),
                network: bundle.network.as_str().to_string(),
                status: bundle.status,
                txid: bundle.txid.clone(),
                payment_count: bundle.payments.len(),
                total_amount_zat: total_zat.to_string(),
                fingerprint_sha256: fingerprint,
            };

            if json_output {
                println!("{}", serde_json::to_string_pretty(&report)?);
            } else {
                println!("ReceiptBundle VALID ({})", report.schema_version);
                println!("  network:       {}", report.network);
                println!("  status:        {:?}", report.status);
                println!("  txid:          {}", report.txid);
                println!("  payments:      {}", report.payment_count);
                println!("  total_zat:     {}", report.total_amount_zat);
                println!("  sha256:        {}", report.fingerprint_sha256);
            }
            Ok(())
        }
    }
}
