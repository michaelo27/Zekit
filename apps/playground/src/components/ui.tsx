import React from "react";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md";
}

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-zk-cyan/40 disabled:opacity-50 disabled:cursor-not-allowed";

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
  }[size];

  const variants = {
    primary:
      "bg-gradient-to-r from-zk-cyan to-zk-violet text-zk-bg font-semibold shadow-glow hover:brightness-110",
    secondary:
      "bg-zk-surface2 text-zk-text border border-zk-border hover:border-zk-cyan/40 hover:bg-zk-surface2/80",
    ghost:
      "bg-transparent text-zk-muted hover:text-zk-text hover:bg-zk-surface2/50",
    danger:
      "bg-zk-danger/15 text-zk-danger border border-zk-danger/30 hover:bg-zk-danger/25",
  }[variant];

  return (
    <button className={`${base} ${sizes} ${variants} ${className}`} {...props}>
      {children}
    </button>
  );
}

export function Card({
  title,
  subtitle,
  badge,
  children,
  className = "",
}: {
  title?: string;
  subtitle?: string;
  badge?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-2xl bg-zk-card-gradient border border-zk-border p-5 backdrop-blur-sm ${className}`}
    >
      {(title || subtitle || badge) && (
        <div className="mb-4 flex items-start justify-between gap-3 border-b border-zk-border pb-3.5">
          <div>
            {title && (
              <h3 className="text-base font-semibold tracking-tight text-zk-text">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="mt-0.5 text-xs text-zk-muted">{subtitle}</p>
            )}
          </div>
          {badge}
        </div>
      )}
      {children}
    </section>
  );
}

export function Badge({
  tone = "cyan",
  children,
}: {
  tone?: "cyan" | "violet" | "lime" | "danger" | "neutral";
  children: React.ReactNode;
}) {
  const tones = {
    cyan: "bg-zk-cyan/10 text-zk-cyan border-zk-cyan/25",
    violet: "bg-zk-violet/15 text-zk-violet border-zk-violet/30",
    lime: "bg-zk-lime/10 text-zk-lime border-zk-lime/30",
    danger: "bg-zk-danger/15 text-zk-danger border-zk-danger/30",
    neutral: "bg-zk-surface2 text-zk-muted border-zk-border",
  }[tone];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${tones}`}
    >
      {children}
    </span>
  );
}

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: string;
  mono?: boolean;
}

export function Input({
  label,
  hint,
  mono = false,
  className = "",
  ...props
}: InputProps) {
  return (
    <label className="block space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-zk-text">{label}</span>
        {hint && <span className="text-[11px] text-zk-muted">{hint}</span>}
      </div>
      <input
        className={`w-full rounded-xl border border-zk-border bg-zk-bg/80 px-3.5 py-2.5 text-sm text-zk-text placeholder:text-zk-muted/50 focus:border-zk-cyan/60 focus:outline-none focus:ring-1 focus:ring-zk-cyan/40 ${
          mono ? "font-mono text-xs" : ""
        } ${className}`}
        {...props}
      />
    </label>
  );
}

export interface TextAreaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  hint?: string;
  mono?: boolean;
}

export function TextArea({
  label,
  hint,
  mono = true,
  className = "",
  ...props
}: TextAreaProps) {
  return (
    <label className="block space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-zk-text">{label}</span>
        {hint && <span className="text-[11px] text-zk-muted">{hint}</span>}
      </div>
      <textarea
        className={`w-full rounded-xl border border-zk-border bg-zk-bg/80 px-3.5 py-2.5 text-sm text-zk-text placeholder:text-zk-muted/50 focus:border-zk-cyan/60 focus:outline-none focus:ring-1 focus:ring-zk-cyan/40 ${
          mono ? "font-mono text-xs leading-relaxed" : ""
        } ${className}`}
        {...props}
      />
    </label>
  );
}

export function CodeBlock({
  label,
  value,
  onCopy,
}: {
  label?: string;
  value: string;
  onCopy?: () => void;
}) {
  return (
    <div className="rounded-xl border border-zk-border bg-zk-bg/90 overflow-hidden">
      {label && (
        <div className="flex items-center justify-between border-b border-zk-border bg-zk-surface px-3.5 py-2">
          <span className="text-[11px] font-medium uppercase tracking-wider text-zk-muted">
            {label}
          </span>
          {onCopy && (
            <button
              type="button"
              onClick={onCopy}
              className="text-xs font-medium text-zk-cyan hover:underline"
            >
              Copy
            </button>
          )}
        </div>
      )}
      <pre className="overflow-x-auto p-3.5 font-mono text-xs leading-relaxed text-zk-text break-all whitespace-pre-wrap">
        {value}
      </pre>
    </div>
  );
}

export interface ToastMessage {
  id: string;
  title: string;
  tone: "info" | "success" | "danger";
}

export function ToastViewport({
  toasts,
  onDismiss,
}: {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}) {
  if (toasts.length === 0) return null;
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm">
      {toasts.map((toast) => {
        const borderTone =
          toast.tone === "danger"
            ? "border-zk-danger/40 text-zk-danger"
            : toast.tone === "success"
            ? "border-zk-lime/40 text-zk-lime"
            : "border-zk-cyan/40 text-zk-cyan";
        return (
          <div
            key={toast.id}
            onClick={() => onDismiss(toast.id)}
            className={`cursor-pointer rounded-xl border bg-zk-surface px-4 py-3 text-xs shadow-glow backdrop-blur ${borderTone}`}
          >
            <span className="font-medium text-zk-text">{toast.title}</span>
          </div>
        );
      })}
    </div>
  );
}
