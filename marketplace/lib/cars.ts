import { createClient } from "@/lib/supabase/server";
import type { Car } from "@/lib/types";

// RLS already limits anon reads to published + recently sold cars; the
// 30-day sold window is enforced in the policy itself.
export async function fetchPublicCars(): Promise<Car[]> {
  const supabase = await createClient();
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
  const supabase = await createClient();
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
