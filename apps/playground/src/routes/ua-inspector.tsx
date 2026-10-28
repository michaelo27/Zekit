import React, { useState } from "react";
import { SAMPLE_TESTNET_UA } from "../examples";
import { JsonPretty } from "../components/json-pretty";
import { Badge, Button, Card, Input, ToastMessage } from "../components/ui";

export function UaInspectorRoute({
  onToast,
}: {
  onToast: (title: string, tone?: ToastMessage["tone"]) => void;
}) {
  const [address, setAddress] = useState<string>(SAMPLE_TESTNET_UA);

  const placeholderInspection = {
    status: "TODO_PHASE_2_UA_INSPECTOR",
    address,
    securityPolicy: "Secret spending keys (uask / secret-extended-key) are strictly rejected.",
    expectedReceivers: ["orchard (typecode 0x03)", "sapling (typecode 0x02)"],
  };

  return (
    <div className="space-y-6">
      {/* Privacy & Key Safety Callout */}
      <div className="rounded-2xl border border-zk-cyan/25 bg-zk-surface p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-0.5">
          <p className="text-xs font-semibold text-zk-text">
            Client-Side Unified Address Inspector (ZIP-316)
          </p>
          <p className="text-xs text-zk-muted">
            Paste public Unified (`u1` / `utest1`), Sapling, or Transparent
            addresses only. Secret keys are automatically blocked by{" "}
            <code className="text-zk-cyan">assertNoSecretKeyMaterial()</code>.
          </p>
        </div>
        <Badge tone="lime">Zero Secret Keys</Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <Card
          className="lg:col-span-5"
          title="Inspect Zcash Address"
          subtitle="Decode Bech32m + F4Jumble + TLV receivers in Phase 2."
           >
          <div className="space-y-4">
            <Input
              label="Zcash Address"
              hint="u1... / utest1... / zs1..."
              mono
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                onClick={() =>
                  onToast(
                    "UA receiver inspection is coming next — ZIP-321 tools are live now.",
                    "info",
                  )
                }>
                Inspect Receivers
              </Button>
            </div>
          </div>
        </Card>

        <Card
          className="lg:col-span-7"
          title="Receiver Breakdown"
          subtitle="Orchard-first privacy readiness check"
           >
          <JsonPretty
            data={placeholderInspection}
            title="UnifiedAddressInspection"
          />
        </Card>
      </div>
    </div>
  );
}
