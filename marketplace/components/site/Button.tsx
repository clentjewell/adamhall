import Link from "next/link";
import type { ReactNode } from "react";

type Variant =
  | "purple"
  | "green"
  | "white"
  | "tan"
  | "outline-white"
  | "outline-green"
  | "black";

interface Props {
  to?: string;
  href?: string;
  variant?: Variant;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  ariaLabel?: string;
  arrow?: boolean;
}

/** Pill button/CTA used across the site. Renders as Next Link, anchor or button. */
export default function Button({
  to,
  href,
  variant = "purple",
  children,
  className = "",
  onClick,
  type = "button",
  ariaLabel,
  arrow = false,
}: Props) {
  const cls = `btn btn--${variant} ${className}`.trim();
  const inner = (
    <>
      {children}
      {arrow && (
        <span className="btn__arrow" aria-hidden="true">
          →
        </span>
      )}
    </>
  );
  if (to) {
    return (
      <Link href={to} className={cls} onClick={onClick} aria-label={ariaLabel}>
        {inner}
      </Link>
    );
  }
  if (href) {
    return (
      <a className={cls} href={href} onClick={onClick} aria-label={ariaLabel}>
        {inner}
      </a>
    );
  }
  return (
    <button className={cls} type={type} onClick={onClick} aria-label={ariaLabel}>
      {inner}
    </button>
  );
}
