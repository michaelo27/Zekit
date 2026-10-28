import { z } from "zod";
import {
  NetworkKindSchema,
  ReceiptBundle,
  ReceiptBundleSchema,
  ReceiptBundleV1,
  ReceiptPaymentSchema,
  ReceiptStatusSchema,
  ShieldedPoolSchema,
} from "./schemas";

export type NetworkKind = z.infer<typeof NetworkKindSchema>;
export type ShieldedPool = z.infer<typeof ShieldedPoolSchema>;
export type ReceiptStatus = z.infer<typeof ReceiptStatusSchema>;
export type ReceiptPayment = z.infer<typeof ReceiptPaymentSchema>;
export type { ReceiptBundle, ReceiptBundleV1 };

export interface ReceiptValidationResult {
  valid: boolean;
  bundle?: ReceiptBundle;
  totalAmountZat?: string;
  errors: string[];
}

/**
 * Parse and validate a raw JSON string or object against `ReceiptBundleSchema` (`zekit.receipt.v1`).
 * Throws a `ZodError` or `SyntaxError` when invalid.
 */
export function parseReceiptBundle(input: unknown): ReceiptBundle {
  const value = typeof input === "string" ? JSON.parse(input) : input;
  return ReceiptBundleSchema.parse(value);
}

/**
 * Non-throwing validation helper returning structured error messages and total zatoshis.
 */
export function validateReceiptBundle(input: unknown): ReceiptValidationResult {
  let candidate: unknown = input;
  if (typeof input === "string") {
    try {
      candidate = JSON.parse(input);
    } catch (err) {
      return {
        valid: false,
        errors: [
          `Invalid JSON syntax: ${
            err instanceof Error ? err.message : String(err)
          }`,
        ],
      };
    }
  }

  const parsed = ReceiptBundleSchema.safeParse(candidate);
  if (!parsed.success) {
    return {
      valid: false,
      errors: parsed.error.issues.map((issue) => {
        const path = issue.path.length > 0 ? `${issue.path.join(".")}: ` : "";
        return `${path}${issue.message}`;
      }),
    };
  }

  let total = 0n;
  for (const payment of parsed.data.payments) {
    total += BigInt(payment.amount_zat);
  }

  return {
    valid: true,
    bundle: parsed.data,
    totalAmountZat: total.toString(),
    errors: [],
  };
}
