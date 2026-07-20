import Link from "next/link";
import { CaretRight } from "@phosphor-icons/react/dist/ssr";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export default function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.label,
      ...(item.href ? { item: `${siteUrl}${item.href}` } : {}),
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav aria-label="Breadcrumb">
        <ol className="flex flex-wrap items-center gap-1.5 text-sm">
          {items.map((item, i) => {
            const isLast = i === items.length - 1;
            return (
              <li key={`${item.label}-${i}`} className="flex items-center gap-1.5">
                {i > 0 && <CaretRight size={12} className="text-stone-400" />}
                {isLast || !item.href ? (
                  <span
                    aria-current={isLast ? "page" : undefined}
                    className={isLast ? "font-semibold text-ink" : "text-stone-500"}
                  >
                    {item.label}
                  </span>
                ) : (
                  <Link href={item.href} className="text-stone-500 hover:text-forest-700">
                    {item.label}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
