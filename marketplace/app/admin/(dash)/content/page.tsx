import { requireAdmin } from "@/lib/admin";
import { getContent } from "@/lib/content";
import ContentEditor from "@/components/admin/ContentEditor";

export default async function ContentPage() {
  await requireAdmin();
  const content = await getContent();

  return (
    <div>
      <h1 className="font-display font-extrabold text-2xl mb-1">Site copy</h1>
      <p className="text-sm text-stone-500 mb-6 max-w-[64ch]">
        Change the words on the public site. Blank a field and it falls back
        to the original wording. Saves publish within a few seconds.
      </p>
      <ContentEditor initial={content} />
    </div>
  );
}
