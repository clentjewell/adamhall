import { requireAdmin } from "@/lib/admin";
import { getContent } from "@/lib/content";
import LiveEditor from "@/components/admin/LiveEditor";

export default async function ContentPage() {
  await requireAdmin();
  const content = await getContent();

  return (
    <div>
      <h1 className="font-display font-extrabold text-2xl mb-1">Site copy</h1>
      <p className="text-sm text-stone-500 mb-5 max-w-[70ch]">
        This is your live site. Click the dashed text on any page, type the
        change, then Save and publish.
      </p>
      <LiveEditor initial={content} />
    </div>
  );
}
