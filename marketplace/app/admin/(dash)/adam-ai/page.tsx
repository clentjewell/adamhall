import { requireAdmin } from "@/lib/admin";
import AdamAI from "@/components/admin/AdamAI";

export const metadata = { title: "Assistant" };

export default async function AdamAIPage() {
  await requireAdmin();
  const configured = !!process.env.ANTHROPIC_API_KEY;

  // The AdamAI card carries its own branded header, so no page-level title
  // here — a second "Assistant" heading just stacked on top of it.
  return <AdamAI configured={configured} />;
}
