import type { ReactNode } from "react";

export const labelClass = "text-[12px] tracking-[0.16em] text-muted uppercase";

export const inputClass =
  "mt-2 w-full border-b border-line bg-transparent py-3 text-sm text-ink outline-none placeholder:text-muted/50";

export const textAreaClass =
  "mt-2 min-h-36 w-full resize-y border border-line bg-transparent px-3 py-3 text-sm leading-6 text-ink outline-none";

export const buttonClass =
  "inline-flex items-center justify-center bg-ink px-5 py-3 text-[12px] tracking-[0.18em] text-white uppercase transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60";

export const buttonGhostClass =
  "inline-flex items-center justify-center border border-line bg-white px-5 py-3 text-[12px] tracking-[0.18em] text-ink uppercase transition-colors hover:border-ink disabled:cursor-not-allowed disabled:opacity-60";

export function PageHeader({
  eyebrow,
  title,
  lede,
  children,
}: {
  eyebrow: string;
  title: string;
  lede?: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-xl">
        <p className="text-[12px] tracking-[0.22em] text-muted uppercase">{eyebrow}</p>
        <h1 className="mt-3 font-serif text-5xl text-ink">{title}</h1>
        {lede ? <p className="mt-4 text-sm leading-7 text-muted">{lede}</p> : null}
      </div>
      {children}
    </div>
  );
}

export function Field({
  id,
  label,
  hint,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
      {children}
      {hint ? (
        <p id={`${id}-hint`} className="mt-2 text-xs leading-5 text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

