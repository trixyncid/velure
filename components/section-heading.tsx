export function SectionHeading({
  children,
  eyebrow,
  id,
  tone = "dark",
}: {
  children: string;
  eyebrow?: string;
  id?: string;
  tone?: "dark" | "light";
}) {
  return (
    <div className="text-center">
      {eyebrow ? (
        <p className="text-[11px] tracking-[0.34em] text-gold uppercase">{eyebrow}</p>
      ) : null}
      <h2
        id={id}
        className={`mt-3 font-serif text-[clamp(2.1rem,4vw,3rem)] leading-[1.05] font-medium ${
          tone === "light" ? "text-white" : "text-ink"
        }`}
      >
        {children}
      </h2>
      <div className="mt-5 flex items-center justify-center gap-3 text-gold" aria-hidden="true">
        <span className="h-px w-10 bg-current opacity-70" />
        <svg width="7" height="7" viewBox="0 0 8 8">
          <path d="M4 0 L8 4 L4 8 L0 4 Z" fill="currentColor" />
        </svg>
        <span className="h-px w-10 bg-current opacity-70" />
      </div>
    </div>
  );
}
