"use client";

import type { CSSProperties, ReactNode } from "react";
import { useShown } from "@/components/landing/hooks";

/** Headline whose lines slide up from behind a mask as it enters the view. */
export function RevealLines({
  lines,
  as: Tag = "h2",
  className = "",
  id,
}: {
  lines: string[];
  as?: "h1" | "h2" | "h3" | "p";
  className?: string;
  id?: string;
}) {
  const { ref, shown } = useShown<HTMLHeadingElement>();
  return (
    <Tag ref={ref} id={id} className={className}>
      {lines.map((line, index) => (
        <span key={line} className="line-mask" data-shown={shown}>
          <span style={{ transitionDelay: `${index * 120}ms` }}>{line}</span>
        </span>
      ))}
    </Tag>
  );
}

/** Soft fade-and-rise for body copy and buttons. */
export function FadeUp({
  children,
  className = "",
  delay = 0,
  style,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  style?: CSSProperties;
}) {
  const { ref, shown } = useShown<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className={`fade-up ${className}`}
      data-shown={shown}
      style={{ ...style, transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
