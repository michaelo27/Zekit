import { z } from "zod";
import {
  assertNoSecretKeyMaterial,
  ReceiverKindSchema,
  UnifiedAddressInspectionSchema,
  UnifiedReceiverSchema,
} from "./schemas";

export type ReceiverKind = z.infer<typeof ReceiverKindSchema>;
export type UnifiedReceiver = z.infer<typeof UnifiedReceiverSchema>;
export type UnifiedAddressInspection = z.infer<
  typeof UnifiedAddressInspectionSchema
>;

/**
 * Inspect a Zcash Unified, Sapling, or Transparent address and return receiver metadata.
 * Rejects secret spending keys immediately.
 *
 * TODO(Phase 2): Wire to WASM `wasm_inspect_ua` (Bech32m + F4Jumble + ZIP-316 TLV decoding).
 */
export function inspectUnifiedAddress(
  address: string
): UnifiedAddressInspection {
  assertNoSecretKeyMaterial(address);
  // TODO(Phase 2): Delegate to WASM `wasm_inspect_ua`
  throw new Error("TODO(Phase 2): inspectUnifiedAddress not implemented yet");
}
