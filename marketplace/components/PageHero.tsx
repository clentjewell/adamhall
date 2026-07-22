import Image from "next/image";
import type { ReactNode } from "react";
import { HeroStagger, HeroItem } from "@/components/motion/Reveal";
import HeroVideo from "@/components/HeroVideo";

// Full-bleed hero used across the public pages — fills the viewport
// (100dvh) like the home hero. It slides up under the transparent header
// (-mt-16) and carries a data-header-tone marker so the header goes light
// over it. Larger heading + bottom-anchored content match the home hero.
export default function PageHero({
  image,
  imageAlt,
  video,
  title,
  titleEditPath,
  children,
}: {
  image: string;
  imageAlt: string;
  video?: string;
  title: string;
  titleEditPath?: string;
  children?: ReactNode;
}) {
  return (
    <section
      data-header-tone="dark"
      className="relative -mt-16 min-h-[100dvh] flex items-end"
    >
      {video ? (
        <HeroVideo src={video} poster={image} posterAlt={imageAlt} />
      ) : (
        <Image
          src={image}
          alt={imageAlt}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/45 to-ink/15" />
      <div className="relative w-full max-w-6xl mx-auto px-4 pb-20 pt-32">
        <HeroStagger>
          <HeroItem>
            <h1
              data-edit={titleEditPath}
              className="font-display font-extrabold text-4xl md:text-6xl tracking-tight text-white leading-tight"
            >
              {title}
            </h1>
          </HeroItem>
          {children && <HeroItem>{children}</HeroItem>}
        </HeroStagger>
      </div>
    </section>
  );
}
