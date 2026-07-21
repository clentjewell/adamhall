import { requireAdmin } from "@/lib/admin";
import AdamAI from "@/components/admin/AdamAI";

export const metadata = { title: "Adam AI" };

export default async function AdamAIPage() {
  await requireAdmin();
  const configured = !!process.env.ANTHROPIC_API_KEY;

  return (
    <div>
      <h1 className="font-display font-bold text-2xl mb-4">Adam AI</h1>
      <AdamAI configured={configured} />
    </div>
  );
}
