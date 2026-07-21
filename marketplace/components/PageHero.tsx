import Image from "next/image";
import type { ReactNode } from "react";
import { HeroStagger, HeroItem } from "@/components/motion/Reveal";

// Full-width photographic header used by /cars and /sell. Shorter than the
// home hero — these pages have a job to do below the fold.
export default function PageHero({
  image,
  imageAlt,
  title,
  titleEditPath,
  children,
}: {
  image: string;
  imageAlt: string;
  title: string;
  titleEditPath?: string;
  children?: ReactNode;
}) {
  return (
    <section className="relative min-h-[300px] md:min-h-[380px] flex items-end">
      <Image
        src={image}
        alt={imageAlt}
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/40 to-ink/10" />
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
