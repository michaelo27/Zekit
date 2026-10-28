import React, { useState } from "react";
import { SAMPLE_TESTNET_UA, SAMPLE_ZIP321_SINGLE } from "../examples";
import { QrPreview } from "../components/qr";
import {
  Badge,
  Button,
  Card,
  CodeBlock,
  Input,
  TextArea,
  ToastMessage,
} from "../components/ui";
import { buildZip321Uri } from "zekit-ts";

 

export function BuilderRoute({
  onToast,
}: {
  onToast: (title: string, tone?: ToastMessage["tone"]) => void;
}) {
  const [address, setAddress] = useState<string>(SAMPLE_TESTNET_UA);
  const [amount, setAmount] = useState<string>("0.025");
  const [memo, setMemo] = useState<string>("dev-coffee-orchard");
  const [label, setLabel] = useState<string>("ZeKit Demo");
  const [message, setMessage] = useState<string>("Zecathon Testnet Coffee");
  const [previewUri, setPreviewUri] = useState<string>(SAMPLE_ZIP321_SINGLE);

  const handleBuild = (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const uri = buildZip321Uri({
        payments: [
          {
            address: address.trim(),
            // zekit-ts uses zatoshis, convert from ZEC string:
            amountZatoshis: amount.trim()
              ? Math.round(Number(amount.trim()) * 100_000_000)
              : undefined,
            memo: memo.trim() ? memo.trim() : undefined,
            label: label.trim() ? label.trim() : undefined,
            message: message.trim() ? message.trim() : undefined,
            otherParams: {},
          },
        ],
      });

      setPreviewUri(uri);
      onToast("Built ZIP-321 URI (via zekit-ts)", "success");
    } catch (err: any) {
      onToast(err?.message ?? "Failed to build ZIP-321 URI", "danger");
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-12">
      <Card
        className="lg:col-span-7"
        title="ZIP-321 Payment Request Builder"
        subtitle="Construct Orchard-first shielded payment URIs with base64url memo encoding."
        badge={<Badge tone="cyan">ZIP-321</Badge>}>
        <form onSubmit={handleBuild} className="space-y-4">
          <Input
            label="Recipient Unified / Shielded Address"
            hint="Orchard UA preferred"
            mono
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="utest1..."
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Amount (ZEC)"
              hint="Up to 8 decimals"
              mono
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.025"
            />
            <Input
              label="Recipient Label"
              hint="Optional"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="ZeKit Merchant"
            />
          </div>
          <Input
            label="Payment Message"
            hint="Optional public URI note"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Order #1042"
          />
          <TextArea
            label="Shielded Memo (UTF-8)"
            hint="Max 512 bytes · Encrypted on-chain"
            rows={3}
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder="Encrypted Orchard memo..."
          />

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Button type="submit">Build ZIP-321 URI</Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setAddress(SAMPLE_TESTNET_UA);
                setAmount("0.025");
                setLabel("ZeKit Demo");
                setMessage("Zecathon Testnet Coffee");
                setMemo("dev-coffee-orchard");
                setPreviewUri(SAMPLE_ZIP321_SINGLE);
                onToast("Reset to sample testnet payment request", "info");
              }}>
              Load Testnet Example
            </Button>
          </div>
        </form>
      </Card>

      <div className="lg:col-span-5 space-y-6">
        <Card
          title="Generated URI & QR Preview"
          subtitle="Copy/paste the URI into the Parser tab to verify round-trip decoding."
          badge={<Badge tone="violet">URI + QR</Badge>}>
          <div className="space-y-4">
            <CodeBlock
              label="ZIP-321 URI"
              value={previewUri}
              onCopy={() => {
                navigator.clipboard?.writeText(previewUri);
                onToast("Copied URI to clipboard", "success");
              }}
            />
            <QrPreview uri={previewUri} />
          </div>
        </Card>
      </div>
    </div>
  );
}
