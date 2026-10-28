import React, { useState } from "react";
import { SAMPLE_ZIP321_SINGLE } from "../examples";
import {
  Badge,
  Button,
  Card,
  CodeBlock,
  TextArea,
  ToastMessage,
} from "../components/ui";
import { parseZip321Uri } from "zekit-ts";

 

 

export function ParserRoute({
  onToast,
}: {
  onToast: (title: string, tone?: ToastMessage["tone"]) => void;
}) {
  const [uri, setUri] = useState<string>(SAMPLE_ZIP321_SINGLE);
  const [resultJson, setResultJson] = useState<string>("");

 const handleParse = () => {
   try {
     const req = parseZip321Uri(uri);

     // show JSON nicely in the result pane
     setResultJson(JSON.stringify(req, null, 2));
     onToast("Parsed ZIP-321 URI (via zekit-ts)", "success");
   } catch (e: any) {
     setResultJson(
       JSON.stringify(
         { error: e?.message ?? String(e), input: uri.trim() },
         null,
         2,
       ),
     );
     onToast("Failed to parse URI (see result)", "danger");
   }
 };

  return (
    <div className="grid gap-6 lg:grid-cols-12">
      <Card
        className="lg:col-span-7"
        title="ZIP-321 Parser"
        subtitle="Paste a zcash: payment URI and decode its fields (including memo)."
        badge={<Badge tone="cyan">ZIP-321</Badge>}>
        <div className="space-y-4">
          <TextArea
            label="ZIP-321 URI"
            hint="Must start with zcash:"
            mono
            rows={5}
            value={uri}
            onChange={(e) => setUri(e.target.value)}
            placeholder="zcash:utest1...?...&memo=..."
          />
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Button type="button" onClick={handleParse}>
              Parse URI
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setUri(SAMPLE_ZIP321_SINGLE);
                setResultJson("");
                onToast("Loaded example URI", "info");
              }}>
              Load Example
            </Button>
          </div>
        </div>
      </Card>

      <div className="lg:col-span-5 space-y-6">
        <Card
          title="Decoded Result"
          subtitle="Shows parsed fields + memo decoded as UTF-8."
          badge={<Badge tone="violet">Decode</Badge>}>
          <CodeBlock
            label="Result (JSON)"
            value={resultJson || "// Click Parse URI"}
            onCopy={() => {
              navigator.clipboard?.writeText(resultJson || "");
              onToast("Copied result JSON", "success");
            }}
          />
        </Card>
      </div>
    </div>
  );
}
