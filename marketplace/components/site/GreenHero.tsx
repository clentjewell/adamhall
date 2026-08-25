import type { ReactNode } from "react";

interface Props {
  title: ReactNode;
  subtitle?: ReactNode;
  eyebrow?: string;
  children?: ReactNode; // buttons / extra content
  /**
   * centered — centred title/subtitle, optional photo "bridging" out of the
   *            green band into the section below (How It Works, About, Listen)
   * text     — left-aligned text hero (Contact, Privacy)
   */
  variant?: "centered" | "text";
  bridgeImage?: string;
  bridgeAlt?: string;
  /** Background colour behind the lower half of the bridge photo. */
  bridgeBg?: "white" | "cream";
}

/** Dark-green hero band used on inner pages. */
export default function GreenHero({
  title,
  subtitle,
  eyebrow,
  children,
  variant = "centered",
  bridgeImage,
  bridgeAlt = "",
  bridgeBg = "white",
}: Props) {
  return (
    <>
      <section
        className={`ghero bg-green ghero--${variant} ${bridgeImage ? "has-bridge" : ""}`}
      >
        <div className="container ghero__inner">
          {eyebrow && <span className="eyebrow eyebrow--hero">{eyebrow}</span>}
          <h1 className="ghero__title">{title}</h1>
          {subtitle && <p className="ghero__subtitle">{subtitle}</p>}
          {children && <div className="ghero__actions">{children}</div>}
        </div>
      </section>
      {bridgeImage && (
        <div className={`ghero__bridgewrap ghero__bridgewrap--${bridgeBg}`}>
          <div className="container ghero__bridge">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={bridgeImage}
              alt={bridgeAlt}
              fetchPriority="high"
              width={880}
              height={550}
            />
          </div>
        </div>
      )}
    </>
  );
}
