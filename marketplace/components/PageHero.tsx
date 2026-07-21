import Image from "next/image";
import type { ReactNode } from "react";
import { HeroStagger, HeroItem } from "@/components/motion/Reveal";
import HeroVideo from "@/components/HeroVideo";

// Full-width photographic (or video) header used across the public pages.
// It slides up under the transparent header (-mt-16) and carries a
// data-header-tone marker so the header knows to go light over it.
export default function PageHero({
  image,
  imageAlt,
  video,
  title,
  titleEditPath,
  tall = false,
  children,
}: {
  image: string;
  imageAlt: string;
  video?: string;
  title: string;
  titleEditPath?: string;
  tall?: boolean;
  children?: ReactNode;
}) {
  return (
    <section
      data-header-tone="dark"
      className={`relative -mt-16 flex items-end ${
        tall ? "min-h-[70vh] md:min-h-[80vh]" : "min-h-[360px] md:min-h-[440px]"
      }`}
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
      <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/40 to-ink/20" />
      <div className="relative w-full max-w-6xl mx-auto px-4 pb-10 pt-28">
        <HeroStagger>
          <HeroItem>
            <h1
              data-edit={titleEditPath}
              className="font-display font-extrabold text-3xl md:text-5xl tracking-tight text-white"
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
