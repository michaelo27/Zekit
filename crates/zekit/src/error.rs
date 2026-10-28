use thiserror::Error;

/// Unified result alias for ZeKit operations.
pub type Result<T> = std::result::Result<T, ZeKitError>;

/// Structured error type across all ZeKit subsystems.
#[derive(Debug, Error)]
pub enum ZeKitError {
    #[error("not implemented yet: {0}")]
    NotImplemented(&'static str),

    #[error("invalid Zcash address: {0}")]
    InvalidAddress(String),

    #[error("ZIP-321 payment request error: {0}")]
    Zip321Error(String),

    #[error("secret key material rejected in restricted context: {0}")]
    SecretKeyForbidden(String),

    #[error("lightwalletd connectivity/sync error: {0}")]
    LightwalletdError(String),

    #[error("wallet storage or key management error: {0}")]
    WalletError(String),

    #[error("shielded transaction build/broadcast error: {0}")]
    TransactionError(String),

    #[error("receipt bundle validation failed: {0}")]
    ReceiptError(String),

    #[error("serialization error: {0}")]
    Serialization(#[from] serde_json::Error),
}
