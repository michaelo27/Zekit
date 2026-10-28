import React from "react";

export function JsonPretty({
  data,
  title = "JSON Output",
}: {
  data: unknown;
  title?: string;
}) {
  const formatted = JSON.stringify(data, null, 2);

  return (
    <div className="rounded-xl border border-zk-border bg-zk-bg/90 overflow-hidden">
      <div className="flex items-center justify-between border-b border-zk-border bg-zk-surface px-3.5 py-2">
        <span className="text-[11px] font-medium uppercase tracking-wider text-zk-muted">
          {title}
        </span>
        <span className="font-mono text-[10px] text-zk-violet">
          application/json
        </span>
      </div>
      <pre className="max-h-96 overflow-auto p-4 font-mono text-xs leading-relaxed text-zk-text">
        {formatted}
      </pre>
    </div>
  );
}
