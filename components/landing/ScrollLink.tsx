"use client";

import type { ReactNode } from "react";
import { scrollToSection } from "@/lib/landing/scroll";

/** An in-page anchor that scrolls smoothly; still a plain link without JavaScript. */
export function ScrollLink({
  to,
  className,
  children,
  ...rest
}: {
  to: string;
  className?: string;
  children: ReactNode;
  "aria-label"?: string;
}) {
  return (
    <a
      href={`#${to}`}
      className={className}
      onClick={(event) => {
        event.preventDefault();
        scrollToSection(to);
      }}
      {...rest}
    >
      {children}
    </a>
  );
}
