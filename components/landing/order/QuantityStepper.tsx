"use client";

import { MAX_QTY } from "@/components/commerce";
import { IconMinus, IconPlus } from "@/components/icons";
import { useI18n } from "@/lib/i18n/client";

export function QuantityStepper({
  value,
  onChange,
  label,
  min = 1,
  size = "md",
}: {
  value: number;
  onChange: (next: number) => void;
  label: string;
  min?: number;
  size?: "sm" | "md";
}) {
  const { t } = useI18n();
  const box = size === "sm" ? "size-9" : "size-12";
  return (
    <div className="inline-flex items-center border border-white/20">
      <button
        type="button"
        className={`grid ${box} place-items-center text-white/70 transition-colors hover:text-champagne disabled:opacity-30`}
        aria-label={t.common.decrease(label)}
        disabled={value <= min}
        onClick={() => onChange(value - 1)}
      >
        <IconMinus className="size-3.5" />
      </button>
      <span key={value} className="animate-bump w-8 text-center text-[15px] tabular-nums" aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        className={`grid ${box} place-items-center text-white/70 transition-colors hover:text-champagne disabled:opacity-30`}
        aria-label={t.common.increase(label)}
        disabled={value >= MAX_QTY}
        onClick={() => onChange(value + 1)}
      >
        <IconPlus className="size-3.5" />
      </button>
    </div>
  );
}
