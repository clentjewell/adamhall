"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin";
import type { SiteContent } from "@/lib/content";

const quoteSchema = z.object({
  text: z.string().trim().min(4).max(400),
  author: z.string().trim().min(1).max(60),
  suburb: z.string().trim().min(1).max(60),
});

const contentSchema = z.object({
  phone: z.object({
    display: z.string().trim().min(6).max(20),
    tel: z.string().trim().regex(/^tel:\+?[\d\s]{8,16}$/, "Phone link must look like tel:+614..."),
  }),
  hero: z.object({
    headline: z.string().trim().min(4).max(90),
    subtext: z.string().trim().min(4).max(220),
    ctaPrimary: z.string().trim().min(2).max(30),
    ctaSecondary: z.string().trim().min(2).max(30),
  }),
  why: z
    .array(
      z.object({
        title: z.string().trim().min(2).max(60),
        body: z.string().trim().min(4).max(160),
      }),
    )
    .length(3),
  sellBand: z.object({
    heading: z.string().trim().min(4).max(80),
    body: z.string().trim().min(4).max(300),
    cta: z.string().trim().min(2).max(30),
  }),
  carsHero: z.object({
    title: z.string().trim().min(2).max(60),
    sub: z.string().trim().min(4).max(260),
  }),
  sellHero: z.object({
    title: z.string().trim().min(2).max(60),
    sub: z.string().trim().min(4).max(260),
  }),
  footer: z.object({
    blurb: z.string().trim().min(4).max(220),
    deal: z.array(z.string().trim().min(2).max(90)).min(1).max(6),
  }),
  reviews: z.object({
    rating: z.coerce.number().min(1).max(5),
    count: z.coerce.number().int().min(0).max(100000),
    quotes: z.array(quoteSchema).min(1).max(8),
  }),
  about: z.object({
    title: z.string().trim().min(2).max(80),
    sub: z.string().trim().min(4).max(300),
    sections: z
      .array(
        z.object({
          heading: z.string().trim().min(2).max(80),
          body: z.string().trim().min(4).max(1000),
        }),
      )
      .min(1)
      .max(8),
  }),
  contact: z.object({
    title: z.string().trim().min(2).max(80),
    sub: z.string().trim().min(4).max(300),
    email: z.string().trim().min(3).max(120),
    address: z.string().trim().min(3).max(300),
    hours: z
      .array(
        z.object({
          days: z.string().trim().min(2).max(40),
          hours: z.string().trim().min(2).max(40),
        }),
      )
      .min(1)
      .max(7),
  }),
  faq: z.object({
    title: z.string().trim().min(2).max(80),
    sub: z.string().trim().min(4).max(300),
    items: z
      .array(
        z.object({
          group: z.string().trim().min(2).max(40),
          q: z.string().trim().min(4).max(200),
          a: z.string().trim().min(4).max(1000),
        }),
      )
      .min(1)
      .max(30),
  }),
  financePage: z.object({
    title: z.string().trim().min(2).max(80),
    sub: z.string().trim().min(4).max(300),
    steps: z
      .array(
        z.object({
          title: z.string().trim().min(2).max(60),
          body: z.string().trim().min(4).max(300),
        }),
      )
      .length(3),
  }),
  legal: z.object({
    privacy: z.string().trim().min(1).max(20000),
    terms: z.string().trim().min(1).max(20000),
    financeDisclaimer: z.string().trim().min(1).max(20000),
    websiteDisclaimer: z.string().trim().min(1).max(20000),
    complaints: z.string().trim().min(1).max(20000),
  }),
});

export interface ContentActionState {
  ok: boolean;
  error?: string;
}

export async function saveSiteContent(
  content: SiteContent,
): Promise<ContentActionState> {
  const admin = await requireAdmin();
  const parsed = contentSchema.safeParse(content);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return { ok: false, error: `${issue.path.join(".")}: ${issue.message}` };
  }

  const { error } = await admin.supabase.from("site_content").upsert(
    {
      key: "site",
      value: parsed.data,
      updated_at: new Date().toISOString(),
      updated_by: admin.name,
    },
    { onConflict: "key" },
  );
  if (error) return { ok: false, error: error.message };

  // Copy renders through a tagged cache; invalidate it and the pages.
  revalidateTag("site-content");
  revalidatePath("/", "layout");
  return { ok: true };
}
