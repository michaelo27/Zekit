import React, { useState } from "react";
import { validateReceiptBundle } from "zekit-ts";
import { SAMPLE_RECEIPT_BUNDLE } from "../examples";
import { JsonPretty } from "../components/json-pretty";
import {
  Badge,
  Button,
  Card,
  TextArea,
  ToastMessage,
} from "../components/ui";

export function ReceiptsRoute({
  onToast,
}: {
  onToast: (title: string, tone?: ToastMessage["tone"]) => void;
}) {
  const [rawJson, setRawJson] = useState<string>(
    JSON.stringify(SAMPLE_RECEIPT_BUNDLE, null, 2)
  );
  const [validation, setValidation] = useState(() =>
    validateReceiptBundle(SAMPLE_RECEIPT_BUNDLE)
  );

  const handleValidate = () => {
    const result = validateReceiptBundle(rawJson);
    setValidation(result);
    if (result.valid) {
      onToast("ReceiptBundle v1 passed Zod schema validation", "success");
    } else {
      onToast(result.errors[0] ?? "ReceiptBundle validation failed", "danger");
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-12">
      <Card
        className="lg:col-span-6"
        title="ReceiptBundle Validator (zekit.receipt.v1)"
        subtitle="Validate exact Rust/TS ReceiptBundleV1 schema parity without exposing spending keys."
         
      >
        <div className="space-y-4">
          <TextArea
            label="ReceiptBundle JSON"
            hint="zekit.receipt.v1"
            rows={14}
            value={rawJson}
            onChange={(e) => setRawJson(e.target.value)}
          />
          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={handleValidate}>
              Validate ReceiptBundle
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                const formatted = JSON.stringify(
                  SAMPLE_RECEIPT_BUNDLE,
                  null,
                  2
                );
                setRawJson(formatted);
                setValidation(validateReceiptBundle(SAMPLE_RECEIPT_BUNDLE));
                onToast("Loaded sample testnet ReceiptBundle", "info");
              }}
            >
              Load Example
            </Button>
          </div>
        </div>
      </Card>

      <Card
        className="lg:col-span-6"
        title="Validation & Parsed Summary"
        subtitle="Mirrors Rust ReceiptBundleV1 & TS Zod ReceiptBundleSchema"
        badge={
          validation.valid ? (
            <Badge tone="lime">Schema Valid</Badge>
          ) : (
            <Badge tone="danger">Invalid Schema</Badge>
          )
        }
      >
        <div className="space-y-4">
          {validation.valid && validation.bundle ? (
            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className="rounded-xl border border-zk-border bg-zk-surface2/60 p-3">
                <span className="text-zk-muted block">Schema</span>
                <span className="font-mono font-semibold text-zk-cyan">
                  {validation.bundle.schema_version}
                </span>
              </div>
              <div className="rounded-xl border border-zk-border bg-zk-surface2/60 p-3">
                <span className="text-zk-muted block">Network · Status</span>
                <span className="font-mono font-semibold text-zk-lime">
                  {validation.bundle.network} · {validation.bundle.status}
                </span>
              </div>
              <div className="rounded-xl border border-zk-border bg-zk-surface2/60 p-3">
                <span className="text-zk-muted block">Total Zatoshis</span>
                <span className="font-mono font-semibold text-zk-text">
                  {validation.totalAmountZat}
                </span>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-zk-danger/35 bg-zk-danger/10 p-3.5 text-xs text-zk-danger space-y-1">
              <p className="font-semibold">Validation Errors:</p>
              <ul className="list-disc pl-4 space-y-0.5 font-mono">
                {validation.errors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          <JsonPretty
            data={
              validation.valid
                ? validation.bundle
                : { valid: false, errors: validation.errors }
            }
            title="ReceiptBundle Result"
          />
        </div>
      </Card>
    </div>
  );
}
