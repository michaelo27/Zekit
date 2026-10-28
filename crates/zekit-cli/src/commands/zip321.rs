use anyhow::{anyhow, Result};
use clap::{Args, Subcommand};
use std::collections::BTreeMap;

#[derive(Debug, Args)]
pub struct Zip321Args {
    #[command(subcommand)]
    pub action: Zip321Command,
}

#[derive(Debug, Subcommand)]
pub enum Zip321Command {
    /// Build a canonical `zcash:` ZIP-321 payment request URI
    Make {
        /// Recipient Zcash Unified/Shielded address
        #[arg(long)]
        address: String,

        /// Amount in ZEC (e.g. `0.025`)
        #[arg(long)]
        amount: Option<String>,

        /// UTF-8 shielded memo (will be base64url-encoded without padding)
        #[arg(long)]
        memo: Option<String>,

        /// Recipient label
        #[arg(long)]
        label: Option<String>,

        /// Payment message
        #[arg(long)]
        message: Option<String>,
    },
    /// Parse and validate a `zcash:` ZIP-321 URI
    Parse {
        /// Full `zcash:...` URI string
        uri: String,
    },
}

fn validate_amount(amount: &str) -> Result<()> {
    let s = amount.trim();
    if s.is_empty() {
        return Err(anyhow!("amount is empty"));
    }

    let mut parts = s.split('.');
    let int = parts.next().unwrap_or("");
    if int.is_empty() || !int.chars().all(|c| c.is_ascii_digit()) {
        return Err(anyhow!("amount must be a decimal like 0.025 (digits + optional .digits)"));
    }

    if let Some(frac) = parts.next() {
        if parts.next().is_some() {
            return Err(anyhow!("amount has more than one decimal point"));
        }
        if frac.len() > 8 {
            return Err(anyhow!("amount supports up to 8 decimal places"));
        }
        if !frac.chars().all(|c| c.is_ascii_digit()) {
            return Err(anyhow!("amount fractional part must be digits only"));
        }
    }

    Ok(())
}

fn pct_encode(s: &str) -> String {
    // application/x-www-form-urlencoded-ish:
    // - unreserved stays
    // - space becomes '+'
    // - everything else becomes %XX (over UTF-8 bytes)
    let mut out = String::new();
    for &b in s.as_bytes() {
        match b {
            b'A'..=b'Z'
            | b'a'..=b'z'
            | b'0'..=b'9'
            | b'-'
            | b'.'
            | b'_'
            | b'~' => out.push(b as char),
            b' ' => out.push('+'),
            _ => out.push_str(&format!("%{:02X}", b)),
        }
    }
    out
}

fn from_hex(b: u8) -> Result<u8> {
    match b {
        b'0'..=b'9' => Ok(b - b'0'),
        b'a'..=b'f' => Ok(b - b'a' + 10),
        b'A'..=b'F' => Ok(b - b'A' + 10),
        _ => Err(anyhow!("invalid hex digit")),
    }
}

fn pct_decode(s: &str) -> Result<String> {
    let bytes = s.as_bytes();
    let mut out: Vec<u8> = Vec::with_capacity(bytes.len());
    let mut i = 0;

    while i < bytes.len() {
        match bytes[i] {
            b'+' => {
                out.push(b' ');
                i += 1;
            }
            b'%' => {
                if i + 2 >= bytes.len() {
                    return Err(anyhow!("incomplete % escape in query param"));
                }
                let hi = from_hex(bytes[i + 1])?;
                let lo = from_hex(bytes[i + 2])?;
                out.push((hi << 4) | lo);
                i += 3;
            }
            b => {
                out.push(b);
                i += 1;
            }
        }
    }

    Ok(String::from_utf8(out)?)
}

fn b64url_encode_no_pad(bytes: &[u8]) -> String {
    // No extra crates: simple base64url encoding via base64 crate if available is best,
    // but to keep this file self-contained we’ll implement a tiny encoder.
    // (This is standard base64url without padding)
    const TABLE: &[u8; 64] = b"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
    let mut out = String::new();

    let mut i = 0;
    while i + 3 <= bytes.len() {
        let n = ((bytes[i] as u32) << 16) | ((bytes[i + 1] as u32) << 8) | (bytes[i + 2] as u32);
        out.push(TABLE[((n >> 18) & 0x3F) as usize] as char);
        out.push(TABLE[((n >> 12) & 0x3F) as usize] as char);
        out.push(TABLE[((n >> 6) & 0x3F) as usize] as char);
        out.push(TABLE[(n & 0x3F) as usize] as char);
        i += 3;
    }

    let rem = bytes.len() - i;
    if rem == 1 {
        let n = (bytes[i] as u32) << 16;
        out.push(TABLE[((n >> 18) & 0x3F) as usize] as char);
        out.push(TABLE[((n >> 12) & 0x3F) as usize] as char);
        // no padding
    } else if rem == 2 {
        let n = ((bytes[i] as u32) << 16) | ((bytes[i + 1] as u32) << 8);
        out.push(TABLE[((n >> 18) & 0x3F) as usize] as char);
        out.push(TABLE[((n >> 12) & 0x3F) as usize] as char);
        out.push(TABLE[((n >> 6) & 0x3F) as usize] as char);
        // no padding
    }

    out
}

fn b64url_decode_no_pad(s: &str) -> Result<Vec<u8>> {
    fn val(c: u8) -> Result<u8> {
        match c {
            b'A'..=b'Z' => Ok(c - b'A'),
            b'a'..=b'z' => Ok(c - b'a' + 26),
            b'0'..=b'9' => Ok(c - b'0' + 52),
            b'-' => Ok(62),
            b'_' => Ok(63),
            _ => Err(anyhow!("invalid base64url character")),
        }
    }

    let bytes = s.as_bytes();
    if bytes.is_empty() {
        return Ok(vec![]);
    }

    let mut out = Vec::<u8>::new();
    let mut i = 0;

    while i < bytes.len() {
        let remaining = bytes.len() - i;

        if remaining >= 4 {
            let a = val(bytes[i])? as u32;
            let b = val(bytes[i + 1])? as u32;
            let c = val(bytes[i + 2])? as u32;
            let d = val(bytes[i + 3])? as u32;
            let n = (a << 18) | (b << 12) | (c << 6) | d;

            out.push(((n >> 16) & 0xFF) as u8);
            out.push(((n >> 8) & 0xFF) as u8);
            out.push((n & 0xFF) as u8);

            i += 4;
        } else if remaining == 2 {
            let a = val(bytes[i])? as u32;
            let b = val(bytes[i + 1])? as u32;
            let n = (a << 18) | (b << 12);
            out.push(((n >> 16) & 0xFF) as u8);
            i += 2;
        } else if remaining == 3 {
            let a = val(bytes[i])? as u32;
            let b = val(bytes[i + 1])? as u32;
            let c = val(bytes[i + 2])? as u32;
            let n = (a << 18) | (b << 12) | (c << 6);
            out.push(((n >> 16) & 0xFF) as u8);
            out.push(((n >> 8) & 0xFF) as u8);
            i += 3;
        } else {
            return Err(anyhow!("invalid base64url length"));
        }
    }

    Ok(out)
}

pub async fn run(args: Zip321Args, json: bool) -> Result<()> {
    match args.action {
        Zip321Command::Make {
            address,
            amount,
            memo,
            label,
            message,
        } => {
            let addr = address.trim();
            if addr.is_empty() {
                return Err(anyhow!("address is required"));
            }

            let mut parts: Vec<(String, String)> = Vec::new();

            if let Some(a) = amount.as_deref().map(str::trim).filter(|s| !s.is_empty()) {
                validate_amount(a)?;
                parts.push(("amount".to_string(), a.to_string()));
            }
            if let Some(l) = label.as_deref().map(str::trim).filter(|s| !s.is_empty()) {
                parts.push(("label".to_string(), l.to_string()));
            }
            if let Some(m) = message.as_deref().map(str::trim).filter(|s| !s.is_empty()) {
                parts.push(("message".to_string(), m.to_string()));
            }
            if let Some(memo_utf8) = memo.as_deref().map(str::trim).filter(|s| !s.is_empty()) {
                let memo_b64url = b64url_encode_no_pad(memo_utf8.as_bytes());
                parts.push(("memo".to_string(), memo_b64url));
            }

            // Canonical ordering by key (simple, deterministic)
            parts.sort_by(|a, b| a.0.cmp(&b.0));

            let query = parts
                .into_iter()
                .map(|(k, v)| format!("{}={}", k, pct_encode(&v)))
                .collect::<Vec<_>>()
                .join("&");

            let uri = if query.is_empty() {
                format!("zcash:{addr}")
            } else {
                format!("zcash:{addr}?{query}")
            };

            if json {
                // keep it simple: JSON with just the uri
                println!(
                    "{{\n  \"uri\": \"{}\"\n}}",
                    uri.replace('\\', "\\\\").replace('"', "\\\"")
                );
            } else {
                println!("{uri}");
            }

            Ok(())
        }

        Zip321Command::Parse { uri } => {
            let s = uri.trim();
            if !s.to_lowercase().starts_with("zcash:") {
                return Err(anyhow!("URI must start with 'zcash:'"));
            }

            let rest = &s["zcash:".len()..];
            let (addr_part, query_part) = match rest.split_once('?') {
                Some((a, q)) => (a, q),
                None => (rest, ""),
            };

            let address = addr_part.trim().to_string();
            if address.is_empty() {
                return Err(anyhow!("Missing address after 'zcash:'"));
            }

            let mut params: BTreeMap<String, String> = BTreeMap::new();
            if !query_part.trim().is_empty() {
                for pair in query_part.split('&') {
                    if pair.trim().is_empty() {
                        continue;
                    }
                    let (k, v) = match pair.split_once('=') {
                        Some((k, v)) => (k, v),
                        None => (pair, ""),
                    };
                    let key = pct_decode(k.trim())?;
                    let val = pct_decode(v.trim())?;
                    if !key.is_empty() {
                        params.insert(key, val);
                    }
                }
            }

            let amount = params.get("amount").cloned();
            if let Some(ref a) = amount {
                validate_amount(a)?;
            }

            let label = params.get("label").cloned();
            let message = params.get("message").cloned();

            let memo_base64url = params.get("memo").cloned();
            let (memo_utf8, memo_error) = if let Some(ref b64u) = memo_base64url {
                match b64url_decode_no_pad(b64u)
                    .and_then(|bytes| String::from_utf8(bytes).map_err(|e| anyhow!(e)))
                {
                    Ok(s) => (Some(s), None),
                    Err(e) => (None, Some(e.to_string())),
                }
            } else {
                (None, None)
            };

            if json {
                // JSON output (no extra deps)
                let esc = |x: &str| x.replace('\\', "\\\\").replace('"', "\\\"");
                println!("{{");
                println!("  \"address\": \"{}\",", esc(&address));
                if let Some(a) = amount {
                    println!("  \"amount\": \"{}\",", esc(&a));
                } else {
                    println!("  \"amount\": null,");
                }
                if let Some(l) = label {
                    println!("  \"label\": \"{}\",", esc(&l));
                } else {
                    println!("  \"label\": null,");
                }
                if let Some(m) = message {
                    println!("  \"message\": \"{}\",", esc(&m));
                } else {
                    println!("  \"message\": null,");
                }
                if let Some(mb) = memo_base64url {
                    println!("  \"memoBase64Url\": \"{}\",", esc(&mb));
                } else {
                    println!("  \"memoBase64Url\": null,");
                }
                if let Some(mu) = memo_utf8 {
                    println!("  \"memoUtf8\": \"{}\",", esc(&mu));
                } else {
                    println!("  \"memoUtf8\": null,");
                }
                if let Some(me) = memo_error {
                    println!("  \"memoError\": \"{}\",", esc(&me));
                } else {
                    println!("  \"memoError\": null,");
                }

                println!("  \"allParams\": {{");
                let mut first = true;
                for (k, v) in params.iter() {
                    if !first {
                        println!(",");
                    }
                    first = false;
                    print!("    \"{}\": \"{}\"", esc(k), esc(v));
                }
                println!();
                println!("  }}");
                println!("}}");
            } else {
                println!("address:  {address}");
                if let Some(a) = params.get("amount") {
                    println!("amount:   {a}");
                }
                if let Some(l) = params.get("label") {
                    println!("label:    {l}");
                }
                if let Some(m) = params.get("message") {
                    println!("message:  {m}");
                }
                if let Some(mb) = params.get("memo") {
                    println!("memo(b64url): {mb}");
                }
                if let Some(mu) = memo_utf8 {
                    println!("memo(utf8):   {mu}");
                }
                if let Some(me) = memo_error {
                    println!("memo(error):  {me}");
                }
            }

            Ok(())
        }
    }
}