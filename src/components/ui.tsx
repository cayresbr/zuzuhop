import Link from "next/link";
import type { ComponentProps } from "react";

export function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-blob bg-white p-6 soft-shadow ${className}`}>{children}</div>
  );
}

export function PageTitle({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-3xl font-extrabold text-ink">{title}</h1>
        {subtitle ? <p className="mt-1 text-ink-soft">{subtitle}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function Button({
  className = "",
  variant = "primary",
  style,
  ...props
}: ComponentProps<"button"> & { variant?: "primary" | "ghost" | "danger" }) {
  const styles = {
    primary: { cls: "bg-grape-500 text-white", shade: "#4d22b4" },
    ghost: { cls: "bg-grape-100 text-grape-700", shade: "#b99cff" },
    danger: { cls: "bg-coral-500 text-white", shade: "#9c1d1d" },
  }[variant];

  return (
    <button
      {...props}
      style={{ "--chunky-shade": styles.shade, ...style } as React.CSSProperties}
      className={`chunky px-6 py-3 font-display text-base font-extrabold disabled:opacity-60 ${styles.cls} ${className}`}
    />
  );
}

export function LinkButton({
  className = "",
  style,
  ...props
}: ComponentProps<typeof Link>) {
  return (
    <Link
      {...props}
      style={{ "--chunky-shade": "#4d22b4", ...style } as React.CSSProperties}
      className={`chunky inline-flex items-center justify-center bg-grape-500 px-6 py-3 font-display text-base font-extrabold text-white ${className}`}
    />
  );
}

export function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-bold text-ink">{label}</span>
      {children}
      {hint && !error ? (
        <span className="mt-1 block text-xs text-ink-soft">{hint}</span>
      ) : null}
      {error ? (
        <span role="alert" className="mt-1 block text-xs font-bold text-coral-600">
          {error}
        </span>
      ) : null}
    </label>
  );
}

export const inputClass =
  "w-full rounded-2xl border-2 border-grape-100 bg-grape-50/40 px-4 py-3.5 text-base text-ink outline-none transition focus:border-grape-500 focus:bg-white";

export function Alert({
  tone = "info",
  children,
}: {
  tone?: "info" | "error" | "success";
  children: React.ReactNode;
}) {
  const styles = {
    info: "bg-sky-100 text-sky-600",
    error: "bg-coral-100 text-coral-600",
    success: "bg-mint-100 text-mint-600",
  }[tone];
  return (
    <div role={tone === "error" ? "alert" : "status"} className={`rounded-2xl px-4 py-3 text-sm font-bold ${styles}`}>
      {children}
    </div>
  );
}

export function Badge({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "green" | "red" | "amber";
}) {
  const styles = {
    neutral: "bg-grape-50 text-grape-700",
    green: "bg-mint-100 text-mint-600",
    red: "bg-coral-100 text-coral-600",
    amber: "bg-mango-100 text-mango-600",
  }[tone];
  return (
    <span className={`inline-block rounded-full px-3 py-1 text-xs font-bold ${styles}`}>
      {children}
    </span>
  );
}

export function EmptyState({
  emoji,
  title,
  description,
}: {
  emoji: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="rounded-blob border-4 border-dashed border-grape-200 bg-white/60 p-10 text-center">
      <div className="animate-float-slow text-5xl" aria-hidden>
        {emoji}
      </div>
      <p className="mt-3 font-display text-lg font-extrabold text-ink">{title}</p>
      {description ? <p className="mt-1 text-ink-soft">{description}</p> : null}
    </div>
  );
}
