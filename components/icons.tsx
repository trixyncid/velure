import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

function iconProps(props: IconProps): IconProps {
  return {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.5,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
    ...props,
  };
}

export function IconMenu(props: IconProps) {
  return (
    <svg {...iconProps(props)}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

export function IconClose(props: IconProps) {
  return (
    <svg {...iconProps(props)}>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

export function IconSearch(props: IconProps) {
  return (
    <svg {...iconProps(props)}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="M16 16.5L20 20.5" />
    </svg>
  );
}

export function IconBag(props: IconProps) {
  return (
    <svg {...iconProps(props)}>
      <path d="M6.5 8h11l.8 11.2a1 1 0 0 1-1 .8H6.7a1 1 0 0 1-1-.8L6.5 8z" />
      <path d="M9 8V6.8A3 3 0 0 1 12 3.8 3 3 0 0 1 15 6.8V8" />
    </svg>
  );
}

export function IconTruck(props: IconProps) {
  return (
    <svg {...iconProps(props)}>
      <path d="M3 7.5h11v8H3zM14 10.5h4.2L21 13.5V15.5h-7" />
      <circle cx="7" cy="17.5" r="1.6" />
      <circle cx="17" cy="17.5" r="1.6" />
    </svg>
  );
}

export function IconSeal(props: IconProps) {
  return (
    <svg {...iconProps(props)}>
      <path d="M12 3.5l1.7 1.7 2.4-.3.8 2.3 2.1 1.1-.7 2.3 1.2 2.1-1.8 1.6.1 2.4-2.3.7-1.4 1.9-2.1-1.1-2.1 1.1-1.4-1.9-2.3-.7.1-2.4L4.5 12.7l1.2-2.1-.7-2.3 2.1-1.1.8-2.3 2.4.3L12 3.5z" />
      <path d="M9.2 12.1l1.8 1.8 3.8-4" />
    </svg>
  );
}

export function IconStar(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      {...props}
    >
      <path d="M12 3.2l2.4 5.3 5.8.6-4.3 3.9 1.2 5.6L12 15.8 6.9 18.6l1.2-5.6L3.8 9.1l5.8-.6L12 3.2z" />
    </svg>
  );
}

export function IconChevron(props: IconProps) {
  return (
    <svg {...iconProps(props)}>
      <path d="M14.5 6.5L9 12l5.5 5.5" />
    </svg>
  );
}

export function IconOverview(props: IconProps) {
  return (
    <svg {...iconProps(props)}>
      <path d="M4 10.5 12 4l8 6.5" />
      <path d="M6.5 9.5V20h11V9.5" />
    </svg>
  );
}

export function IconFragrance(props: IconProps) {
  return (
    <svg {...iconProps(props)}>
      <path d="M10 3.5h4M11.2 3.5v3.2" />
      <path d="M9 7h6l1.1 2.8a5.6 5.6 0 1 1-8.2 0L9 7z" />
    </svg>
  );
}

export function IconPeople(props: IconProps) {
  return (
    <svg {...iconProps(props)}>
      <circle cx="9" cy="8.2" r="2.3" />
      <circle cx="16" cy="9.2" r="1.9" />
      <path d="M4.8 18.6c.9-2.5 2.7-3.7 4.2-3.7s3.3 1.2 4.2 3.7" />
      <path d="M13.2 15c1.1-.5 2.4-.3 3.4.6.9.8 1.5 1.8 1.8 2.9" />
    </svg>
  );
}

export function IconChat(props: IconProps) {
  return (
    <svg {...iconProps(props)}>
      <path d="M4.5 18.5l1.2-3.6A7.5 7.5 0 1 1 9 18.1l-4.5.4z" />
      <path d="M9 11.5h.01M12 11.5h.01M15 11.5h.01" strokeWidth={2} />
    </svg>
  );
}

export function IconWallet(props: IconProps) {
  return (
    <svg {...iconProps(props)}>
      <path d="M4 7.5A1.5 1.5 0 0 1 5.5 6H18v3" />
      <path d="M4 7.5v10A1.5 1.5 0 0 0 5.5 19H20V9H5.5A1.5 1.5 0 0 1 4 7.5z" />
      <circle cx="16" cy="14" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconCheck(props: IconProps) {
  return (
    <svg {...iconProps(props)}>
      <path d="M5 12.5l4.2 4.2L19 7" />
    </svg>
  );
}

export function IconArrow(props: IconProps) {
  return (
    <svg {...iconProps(props)}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

export function IconPlus(props: IconProps) {
  return (
    <svg {...iconProps(props)}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function IconMinus(props: IconProps) {
  return (
    <svg {...iconProps(props)}>
      <path d="M5 12h14" />
    </svg>
  );
}

/** WhatsApp glyph (filled). */
export function IconWhatsApp(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2zm0 18.15h-.01a8.23 8.23 0 0 1-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.23 8.25-8.23 2.2 0 4.27.86 5.83 2.42a8.18 8.18 0 0 1 2.41 5.82c0 4.54-3.7 8.23-8.23 8.23zm4.52-6.16c-.25-.12-1.47-.72-1.7-.81-.23-.08-.39-.12-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.5.11-.11.25-.29.37-.43.12-.15.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.23.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.14-1.18-.06-.1-.22-.16-.47-.29z" />
    </svg>
  );
}

export function IconAlert(props: IconProps) {
  return (
    <svg {...iconProps(props)}>
      <path d="M12 8v5" />
      <path d="M12 16.5h.01" strokeWidth={2.2} />
    </svg>
  );
}

export function IconQuote(props: IconProps) {
  return (
    <svg {...iconProps(props)}>
      <path d="M5 18.5c2.6-1 4-3 4-6.2V8.5H5V13h4" />
      <path d="M14 18.5c2.6-1 4-3 4-6.2V8.5h-4V13h4" />
    </svg>
  );
}
