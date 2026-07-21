import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Car } from "@/lib/types";

// Cookie-less anon client — no request cookies touched, so pages calling
// these stay cacheable (ISR via `export const revalidate`) instead of
// being forced dynamic.
function anonClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } },
  );
}

// RLS already limits anon reads to published + recently sold cars; the
// 30-day sold window is enforced in the policy itself.
export async function fetchPublicCars(): Promise<Car[]> {
  const supabase = anonClient();
  const { data, error } = await supabase
    .from("cars")
    .select("*")
    .in("status", ["published", "sold"])
    .order("published_at", { ascending: false });
  if (error) {
    console.error("fetchPublicCars:", error.message);
    return [];
  }
  return (data ?? []) as Car[];
}

export async function fetchCarBySlug(slug: string): Promise<Car | null> {
  const supabase = anonClient();
  const { data, error } = await supabase
    .from("cars")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) {
    console.error("fetchCarBySlug:", error.message);
    return null;
  }
  return data as Car | null;
}
