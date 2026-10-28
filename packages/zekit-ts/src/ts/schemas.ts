import { z } from "zod";

/**
 * Maximum ZEC supply in zatoshis (`21,000,000 * 10^8`), safely within JS `Number.MAX_SAFE_INTEGER`.
 */
export const MAX_ZATOSHIS = 2_100_000_000_000_000;
export const MAX_ZATOSHIS_BIGINT = 2_100_000_000_000_000n;

/**
 * Maximum Zcash shielded memo size in UTF-8 bytes (ZIP-302).
 */
export const MAX_MEMO_BYTES = 512;

/**
 * Stable v1 schema version identifier for ZeKit ReceiptBundles.
 */
export const RECEIPT_SCHEMA_VERSION = "zekit.receipt.v1" as const;

const FORBIDDEN_SECRET_PREFIXES = [
  "secret-extended-key-main",
  "secret-extended-key-test",
  "uask1",
  "uasktest1",
] as const;

/**
 * Returns `true` if `candidate` starts with a known Zcash secret spending key prefix.
 */
export function isSecretKeyMaterial(candidate: string): boolean {
  const lower = candidate.trim().toLowerCase();
  return FORBIDDEN_SECRET_PREFIXES.some((prefix) => lower.startsWith(prefix));
}

/**
 * Throws immediately if `candidate` resembles a Zcash secret spending key.
 * Secret keys NEVER belong in browser/TypeScript runtimes.
 */
export function assertNoSecretKeyMaterial(candidate: string): void {
  if (isSecretKeyMaterial(candidate)) {
    throw new Error(
      "Security violation: Secret spending keys are strictly forbidden in zekit-ts. Use native Rust zekit-cli instead."
    );
  }
}

function utf8ByteLength(value: string): number {
  return new TextEncoder().encode(value).byteLength;
}

export const NetworkKindSchema = z.enum(["testnet", "mainnet", "regtest"]);

export const ShieldedPoolSchema = z.enum(["orchard", "sapling"]);

/**
 * Mirrors `crates/zekit/src/receipt.rs` -> `ReceiptStatus`
 */
export const ReceiptStatusSchema = z.enum([
  "created",
  "broadcast",
  "confirmed",
]);

/**
 * Canonical base-10 non-negative integer string representing zatoshis (`"0"` .. `"2100000000000000"`).
 * Mirrors `crates/zekit/src/receipt.rs` -> `parse_canonical_zatoshis`.
 */
export const ZatoshiStringSchema = z
  .string()
  .regex(
    /^(0|[1-9][0-9]*)$/,
    "amount_zat must be a base-10 non-negative integer string without leading zeros"
  )
  .refine((val) => BigInt(val) <= MAX_ZATOSHIS_BIGINT, {
    message: `amount_zat exceeds max ZEC supply (${MAX_ZATOSHIS} zatoshis)`,
  });

export const ZatoshiAmountSchema = z
  .number()
  .int()
  .nonnegative()
  .max(MAX_ZATOSHIS);

/**
 * Mirrors `crates/zekit/src/receipt.rs` -> `ReceiptPayment`
 */
export const ReceiptPaymentSchema = z
  .object({
    to: z
      .string()
      .refine((v) => v.trim().length > 0, {
        message: "payment.to must not be empty",
      })
      .refine((v) => !isSecretKeyMaterial(v), {
        message: "Zcash spending key prefix detected in payment.to",
      }),
    amount_zat: ZatoshiStringSchema,
    memo: z
      .string()
      .refine((m) => utf8ByteLength(m) <= MAX_MEMO_BYTES, {
        message: `memo exceeds ${MAX_MEMO_BYTES} UTF-8 bytes`,
      })
      .refine((m) => !isSecretKeyMaterial(m), {
        message: "Zcash spending key prefix detected in memo",
      })
      .optional(),
  })
  .strict();

/**
 * Mirrors `crates/zekit/src/receipt.rs` -> `ReceiptBundleV1` (`zekit.receipt.v1`) exactly.
 */
export const ReceiptBundleV1Schema = z
  .object({
    schema_version: z.literal(RECEIPT_SCHEMA_VERSION),
    network: NetworkKindSchema,
    created_at: z.string().datetime({
      offset: true,
      message: "created_at must be a valid RFC3339 timestamp",
    }),
    txid: z
      .string()
      .regex(
        /^[0-9a-fA-F]{64}$/,
        "txid must be a 64-character hexadecimal string"
      ),
    payments: z
      .array(ReceiptPaymentSchema)
      .min(1, "payments must contain at least one recipient entry"),
    zip321: z
      .string()
      .startsWith("zcash:", "zip321 field must start with 'zcash:' scheme")
      .refine((u) => !isSecretKeyMaterial(u), {
        message: "Zcash spending key prefix detected in zip321",
      })
      .optional(),
    status: ReceiptStatusSchema,
    metadata: z
      .record(
        z
          .string()
          .refine((k) => k.trim().length > 0, {
            message: "metadata keys must not be empty",
          }),
        z.string().refine((v) => !isSecretKeyMaterial(v), {
          message: "Zcash spending key prefix detected in metadata value",
        })
      )
      .optional(),
  })
  .strict()
  .superRefine((bundle, ctx) => {
    let total = 0n;
    for (const payment of bundle.payments) {
      total += BigInt(payment.amount_zat);
    }
    if (total > MAX_ZATOSHIS_BIGINT) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["payments"],
        message: `total payment amount (${total.toString()}) exceeds MAX_ZATOSHIS (${MAX_ZATOSHIS})`,
      });
    }
  });

/**
 * Canonical `ReceiptBundle` Zod validator + TypeScript type exports.
 */
export const ReceiptBundleSchema = ReceiptBundleV1Schema;
export type ReceiptBundleV1 = z.infer<typeof ReceiptBundleV1Schema>;
export type ReceiptBundle = z.infer<typeof ReceiptBundleSchema>;

/**
 * Mirrors `crates/zekit/src/zip321.rs` -> `PaymentItem`
 */
export const PaymentItemSchema = z.object({
  address: z.string().min(1),
  amountZatoshis: ZatoshiAmountSchema.optional(),
  memo: z.string().max(MAX_MEMO_BYTES).optional(),
  label: z.string().optional(),
  message: z.string().optional(),
  otherParams: z.record(z.string(), z.string()).optional(),
});

/**
 * Mirrors `crates/zekit/src/zip321.rs` -> `Zip321Request`
 */
export const Zip321RequestSchema = z.object({
  payments: z.array(PaymentItemSchema).min(1),
});

export const ReceiverKindSchema = z.enum([
  "orchard",
  "sapling",
  "p2pkh",
  "p2sh",
  "unknown",
]);

export const UnifiedReceiverSchema = z.object({
  kind: ReceiverKindSchema,
  typecode: z.number().int().nonnegative(),
  byteLength: z.number().int().nonnegative(),
  dataHex: z.string(),
  shielded: z.boolean(),
});

export const UnifiedAddressInspectionSchema = z.object({
  address: z.string(),
  network: NetworkKindSchema,
  addressKind: z.enum(["unified", "sapling", "transparent"]),
  hasOrchard: z.boolean(),
  hasSapling: z.boolean(),
  hasTransparent: z.boolean(),
  privacyRecommendation: z.string(),
  receivers: z.array(UnifiedReceiverSchema),
});
