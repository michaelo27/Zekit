//! WASM entry point for `zekit-ts`.
//!
//! SECURITY INVARIANT: This crate operates across the JavaScript/WASM boundary and
//! MUST NEVER accept, derive, or store Zcash secret spending keys or seed phrases.

#![forbid(unsafe_code)]

use wasm_bindgen::prelude::*;

/// Return the active `zekit` WASM engine version.
#[wasm_bindgen]
pub fn wasm_version() -> String {
    zekit::ZEKIT_VERSION.to_string()
}

/// Parse a `zcash:` ZIP-321 URI into a serialized `Zip321Request` JS value.
#[wasm_bindgen]
pub fn wasm_parse_zip321(uri: &str) -> Result<JsValue, JsError> {
    // TODO(Subphase 2B): Wire to implemented zekit::zip321::parse_zip321
    let parsed = zekit::zip321::parse_zip321(uri).map_err(|e| JsError::new(&e.to_string()))?;
    serde_wasm_bindgen::to_value(&parsed).map_err(|e| JsError::new(&e.to_string()))
}

/// Build a canonical `zcash:` ZIP-321 URI from a `Zip321Request` JS object.
#[wasm_bindgen]
pub fn wasm_build_zip321(request: JsValue) -> Result<String, JsError> {
    // TODO(Subphase 2B): Deserialize Zip321Request and delegate to zekit::zip321::build_zip321
    let req: zekit::zip321::Zip321Request =
        serde_wasm_bindgen::from_value(request).map_err(|e| JsError::new(&e.to_string()))?;
    zekit::zip321::build_zip321(&req).map_err(|e| JsError::new(&e.to_string()))
}

/// Inspect a Zcash Unified Address (`u1...` / `utest1...`) and list its receivers.
/// Rejects any secret spending key prefix immediately.
#[wasm_bindgen]
pub fn wasm_inspect_ua(_address: &str) -> Result<JsValue, JsError> {
    // TODO(Subphase 2B): Wire to zekit Unified Address inspection
    Err(JsError::new(
        "not implemented yet: wasm_inspect_ua (Subphase 2B)",
    ))
}

/// Validate a serialized `ReceiptBundleV1` (`zekit.receipt.v1`) JSON string and return
/// its canonical SHA-256 hex fingerprint.
#[wasm_bindgen]
pub fn wasm_validate_receipt(receipt_json: &str) -> Result<String, JsError> {
    let bundle = zekit::receipt::ReceiptBundleV1::from_json(receipt_json)
        .map_err(|e| JsError::new(&e.to_string()))?;
    bundle
        .fingerprint_sha256()
        .map_err(|e| JsError::new(&e.to_string()))
}
