import React, { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";

export function QrPreview({ uri }: { uri: string }) {
  const [svg, setSvg] = useState<string>("");
  const [err, setErr] = useState<string>("");

  const text = useMemo(() => (uri ?? "").trim(), [uri]);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setErr("");
      setSvg("");
      if (!text) return;

      try {
        // Standard QR contrast (dark modules on light background) = best scan reliability
        const out = await QRCode.toString(text, {
          type: "svg",
          errorCorrectionLevel: "M",
          margin: 2,
          color: {
            dark: "#0B1020",
            light: "#FFFFFF",
          },
        });

        if (!cancelled) setSvg(out);
      } catch (e: any) {
        if (!cancelled) setErr(e?.message ?? String(e));
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [text]);

  if (!text) {
    return (
      <div className="rounded-2xl border border-[color:var(--border)] bg-[var(--surface)] p-6 text-sm text-[color:var(--muted)]">
        Enter a URI to preview QR
      </div>
    );
  }

  if (err) {
    return (
      <div className="rounded-2xl border border-[color:var(--border)] bg-[var(--surface)] p-4 text-sm text-[color:var(--danger)]">
        QR error: {err}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[color:var(--border)] bg-[var(--surface)] p-6">
      {/* White QR tile inside a themed card */}
      <div className="mx-auto w-fit rounded-2xl bg-white p-3 shadow-sm">
        <div
          className="w-[240px] max-w-full"
          aria-label="QR code"
          role="img"
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      </div>
      <p className="mt-3 text-center text-[11px] text-[color:var(--muted)]">
        Scan to open the ZIP-321 URI
      </p>
    </div>
  );
}
