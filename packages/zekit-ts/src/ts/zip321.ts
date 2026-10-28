import { z } from "zod";
import {
  assertNoSecretKeyMaterial,
  PaymentItemSchema,
  Zip321RequestSchema,
} from "./schemas";

export type PaymentItem = z.infer<typeof PaymentItemSchema>;
export type Zip321Request = z.infer<typeof Zip321RequestSchema>;

const ZATOSHIS_PER_ZEC = 100_000_000n;

function base64Encode(bytes: Uint8Array): string {
  // Browser
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const g: any = globalThis as any;
  if (typeof g.btoa === "function") {
    let binary = "";
    for (const b of bytes) binary += String.fromCharCode(b);
    return g.btoa(binary);
  }

  // Node fallback
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Buf: any = (g as any).Buffer;
  if (Buf) return Buf.from(bytes).toString("base64");

  throw new Error("No base64 encoder available in this environment");
}

function base64Decode(b64: string): Uint8Array {
  // Browser
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const g: any = globalThis as any;
  if (typeof g.atob === "function") {
    const binary = g.atob(b64);
    const out = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) out[i] = binary.charCodeAt(i);
    return out;
  }

  // Node fallback
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Buf: any = (g as any).Buffer;
  if (Buf) return new Uint8Array(Buf.from(b64, "base64"));

  throw new Error("No base64 decoder available in this environment");
}

function base64UrlEncodeUtf8(s: string): string {
  const bytes = new TextEncoder().encode(s);
  const b64 = base64Encode(bytes);
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlDecodeUtf8(b64url: string): string {
  let b64 = b64url.replace(/-/g, "+").replace(/_/g, "/");
  while (b64.length % 4 !== 0) b64 += "=";
  const bytes = base64Decode(b64);
  return new TextDecoder().decode(bytes);
}

function parseZecToZatoshis(amountZec: string): number {
  const s = amountZec.trim();
  const m = s.match(/^(\d+)(?:\.(\d{0,8}))?$/);
  if (!m) {
    throw new Error(
      "Invalid amount. Use decimal ZEC like 0.025 (up to 8 decimals).",
    );
  }

  const whole = BigInt(m[1] ?? "0");
  const fracRaw = m[2] ?? "";
  const fracPadded = (fracRaw + "00000000").slice(0, 8); // pad right to 8
  const frac = BigInt(fracPadded || "0");

  const z = whole * ZATOSHIS_PER_ZEC + frac;

  // Keep schema simple (number). Guard against unsafe integers.
  if (z > BigInt(Number.MAX_SAFE_INTEGER)) {
    throw new Error("Amount too large (exceeds JS safe integer range).");
  }
  return Number(z);
}

function formatZatoshisToZec(amountZatoshis: number): string {
  if (!Number.isFinite(amountZatoshis) || amountZatoshis < 0) {
    throw new Error("amountZatoshis must be a non-negative number");
  }
  const z = BigInt(Math.trunc(amountZatoshis));
  const whole = z / ZATOSHIS_PER_ZEC;
  const frac = z % ZATOSHIS_PER_ZEC;

  if (frac === 0n) return whole.toString();

  let fracStr = frac.toString().padStart(8, "0");
  fracStr = fracStr.replace(/0+$/, ""); // trim trailing zeros
  return `${whole.toString()}.${fracStr}`;
}

/**
 * Build a canonical `zcash:` ZIP-321 URI from one or more payment items.
 *
 * Note: For now this implements the common single-payment form (no indexed params).
 */
export function buildZip321Uri(request: Zip321Request): string {
  const validated = Zip321RequestSchema.parse(request);

  if (validated.payments.length !== 1) {
    throw new Error(
      "Only single-payment ZIP-321 URIs are supported right now.",
    );
  }

const payment = validated.payments[0];
if (!payment) throw new Error("Missing payment item");
assertNoSecretKeyMaterial(payment.address);

  const addr = payment.address.trim();
  if (!addr) throw new Error("Payment address is required");

  const params = new URLSearchParams();

  if (payment.amountZatoshis != null) {
    params.set("amount", formatZatoshisToZec(payment.amountZatoshis));
  }
  if (payment.label) params.set("label", payment.label);
  if (payment.message) params.set("message", payment.message);
  if (payment.memo) params.set("memo", base64UrlEncodeUtf8(payment.memo));

  const other = payment.otherParams ?? {};
  for (const key of Object.keys(other).sort()) {
    if (!key) continue;
    if (["amount", "label", "message", "memo"].includes(key)) continue;
    params.set(key, String(other[key] ?? ""));
  }

  const q = params.toString();
  return `zcash:${addr}${q ? `?${q}` : ""}`;
}

/**
 * Parse and validate a `zcash:` ZIP-321 payment request URI.
 *
 * Note: For now this parses the common single-payment form (no indexed params).
 */
export function parseZip321Uri(uri: string): Zip321Request {
  const s = uri.trim();
  assertNoSecretKeyMaterial(s);

  if (!s.toLowerCase().startsWith("zcash:")) {
    throw new Error("URI must start with 'zcash:'");
  }

  const rest = s.slice("zcash:".length);
  const [addrPart, queryPart = ""] = rest.split("?", 2);
  const address = (addrPart ?? "").trim();
  if (!address) throw new Error("Missing address after 'zcash:'");

  const params = new URLSearchParams(queryPart);

  const known = new Set(["amount", "label", "message", "memo"]);
  const otherParams: Record<string, string> = {};

  for (const [k, v] of params.entries()) {
    if (!known.has(k)) otherParams[k] = v;
  }

  const amount = params.get("amount");
  const label = params.get("label");
  const message = params.get("message");
  const memoB64 = params.get("memo");

  const payment: PaymentItem = {
    address,
    otherParams,
  };

  if (amount) payment.amountZatoshis = parseZecToZatoshis(amount);
  if (label) payment.label = label;
  if (message) payment.message = message;
  if (memoB64) payment.memo = base64UrlDecodeUtf8(memoB64);

  return Zip321RequestSchema.parse({ payments: [payment] });
}
