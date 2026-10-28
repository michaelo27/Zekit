import type { ReceiptBundle } from "zekit-ts";

export const ZEKIT_TAGLINE =
  "Shielded Tx in Minutes.  ";
export const ZEKIT_TAGLINE2 =
  " Stop integrating 8 components.  ";
export const ZEKIT_TAGLINE3 =
  " Use one kit.";

export const CORE_STACK_REPLACED = [
  "librustzcash crates + wallet database + scanning",
  "lightwalletd connectivity",
  "ZIP-321 parsing/building",
  "key + viewing key handling",
  "transaction construction + broadcast",
  "monitoring + receipts",
] as const;

export const SAMPLE_TESTNET_UA =
  "utest1qz2c9w7x8r0orchard0placeholder9shielded7unified4address3testnet";

export const SAMPLE_ZIP321_SINGLE =
  "zcash:utest1qz2c9w7x8r0orchard0placeholder9shielded7unified4address3testnet?amount=0.025&memo=ZGV2LWNvZmZlZS1vcmNoYXJk&label=ZeKit%20Demo&message=Zecathon%20Testnet%20Coffee";

export const SAMPLE_ZIP321_MULTI =
  "zcash:?address=utest1qz2c9w7x8r0orchard0placeholder9shielded7unified4address3testnet&amount=0.15&memo=bWVyY2hhbnQtcGF5b3V0&address.1=ztestsapling1placeholder7sapling6receiver9testnet4demo000000&amount.1=0.05&label.1=Protocol%20Split";

export const SAMPLE_RECEIPT_BUNDLE: ReceiptBundle = {
  schema_version: "zekit.receipt.v1",
  network: "testnet",
  created_at: "2026-10-28T12:00:00Z",
  txid: "6f84c2b910e5a4d3f90c21b8a7e45d1290c3f8a1b7e6d5c4321098fedcba4321",
  payments: [
    {
      to: SAMPLE_TESTNET_UA,
      amount_zat: "2500000",
      memo: "dev-coffee-orchard",
    },
  ],
  zip321: SAMPLE_ZIP321_SINGLE,
  status: "confirmed",
  metadata: {
    pool: "orchard",
    order_id: "ord_1042",
  },
};
