"use client";

import { useRouter } from "next/navigation";
import { LOCALE_COOKIE, locales, localeNames, type Locale } from "@/lib/i18n";
import { useI18n } from "@/lib/i18n/client";

function rememberLocale(next: Locale) {
  document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
}

export function LanguageSwitcher({
  tone = "light",
  className = "",
}: {
  tone?: "light" | "dark";
  className?: string;
}) {
  const { locale, t } = useI18n();
  const router = useRouter();
  const idle = tone === "dark" ? "text-white/50 hover:text-white" : "text-ink/50 hover:text-ink";
  const active = tone === "dark" ? "text-white" : "text-ink";
  const divider = tone === "dark" ? "bg-white/25" : "bg-ink/20";

  return (
    <div
      role="group"
      aria-label={t.common.language}
      className={`inline-flex items-center gap-2 text-[11px] tracking-[0.18em] uppercase ${className}`}
    >
      {locales.map((code, index) => (
        <span key={code} className="inline-flex items-center gap-2">
          {index > 0 ? <span aria-hidden="true" className={`h-3 w-px ${divider}`} /> : null}
          <a
            href={`/${code}`}
            hrefLang={code}
            lang={code}
            aria-current={code === locale ? "true" : undefined}
            title={localeNames[code]}
            onClick={(event) => {
              event.preventDefault();
              if (code === locale) return;
              rememberLocale(code);
              // Keep the visitor on the section they were reading.
              router.push(`/${code}${window.location.hash}`, { scroll: false });
            }}
            className={`py-1 transition-colors duration-300 ${
              code === locale ? `${active} font-medium` : idle
            }`}
          >
            {code}
            <span className="sr-only"> — {localeNames[code]}</span>
          </a>
        </span>
      ))}
    </div>
  );
}
