"use client";

import { createClient } from "@/lib/supabase/client";

// Compress on-device before upload: phone photos are 4–12 MB each and the
// seller is probably on mobile data. 1600px JPEG is plenty for valuation.
export async function compressImage(file: File, maxDim = 1600, quality = 0.8): Promise<Blob> {
  const bitmap = await createImageBitmap(file).catch(() => null);
  if (!bitmap) return file;

  const scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height));
  if (scale === 1 && file.size < 1_500_000) return file;

  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) return file;
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

  return new Promise((resolve) =>
    canvas.toBlob((b) => resolve(b ?? file), "image/jpeg", quality),
  );
}

export async function uploadSubmissionPhoto(blob: Blob, draftId: string, index: number): Promise<string> {
  const supabase = createClient();
  const path = `drafts/${draftId}/${Date.now()}-${index}.jpg`;
  const { error } = await supabase.storage
    .from("submission-photos")
    .upload(path, blob, { contentType: "image/jpeg", upsert: false });
  if (error) throw new Error(error.message);
  return path;
}
