"use client";

import Image from "next/image";
import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowCounterClockwise,
  ArrowLeft,
  ArrowRight,
  Sparkle,
  Star,
  UploadSimple,
  X,
} from "@phosphor-icons/react";
import { saveCar, type CarInput } from "@/app/actions/admin";
import { compressImage } from "@/lib/upload";
import { createClient } from "@/lib/supabase/client";
import type { Car, CarPhoto } from "@/lib/types";

export default function CarForm({
  car,
  aiConfigured = false,
}: {
  car: Car | null;
  /** Whether ANTHROPIC_API_KEY is set, so the draft button can say why not. */
  aiConfigured?: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [photos, setPhotos] = useState<CarPhoto[]>(car?.photos ?? []);
  const [uploading, setUploading] = useState(0);
  // The description is the one field held in state: the draft button streams
  // into it. Everything else stays uncontrolled and is read out of the form.
  const [description, setDescription] = useState(car?.description ?? "");
  const [drafting, setDrafting] = useState(false);
  const [draftError, setDraftError] = useState<string | null>(null);
  // What the box said before the last draft, so a draft the dealer doesn't
  // like costs nothing. Cleared once they edit the text themselves.
  const [undoTo, setUndoTo] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  async function onFiles(files: FileList | null) {
    if (!files) return;
    const supabase = createClient();
    setUploading((n) => n + files.length);
    for (const file of Array.from(files)) {
      try {
        const blob = await compressImage(file, 1920, 0.85);
        const path = `listings/${car?.id ?? "new"}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;
        const { error: upError } = await supabase.storage
          .from("car-photos")
          .upload(path, blob, { contentType: "image/jpeg" });
        if (upError) throw new Error(upError.message);
        const { data } = supabase.storage.from("car-photos").getPublicUrl(path);
        setPhotos((p) => [...p, { url: data.publicUrl }]);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Upload failed");
      } finally {
        setUploading((n) => n - 1);
      }
    }
  }

  /**
   * Draft the description from the photos on the car and the specs as they
   * stand in the form. Nothing is saved: the draft lands in the textarea and
   * the dealer edits it and saves the form as usual.
   */
  async function draftDescription() {
    const form = formRef.current;
    if (!form || drafting) return;
    const data = new FormData(form);
    const text = (name: string) => {
      const v = data.get(name);
      const trimmed = typeof v === "string" ? v.trim() : "";
      return trimmed || undefined;
    };
    const num = (name: string) => {
      const v = text(name);
      if (!v) return undefined;
      const n = Number(v);
      return Number.isFinite(n) ? n : undefined;
    };

    if (!text("make") || !text("model")) {
      setDraftError("Fill in the make and model first.");
      return;
    }

    const previous = description;
    setDraftError(null);
    setDrafting(true);
    setUndoTo(previous);
    setDescription("");

    try {
      const res = await fetch("/api/admin/draft-description", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          spec: {
            make: text("make"),
            model: text("model"),
            badge: text("badge"),
            year: num("year"),
            price: num("price"),
            odometer_km: num("odometer_km"),
            body_type: text("body_type"),
            transmission: text("transmission"),
            fuel: text("fuel"),
            drivetrain: text("drivetrain"),
            colour: text("colour"),
            seats: num("seats"),
            service_history: text("service_history"),
            ppsr_clear: data.get("ppsr_clear") === "on",
            inspection_summary: text("inspection_summary"),
            adams_take: text("adams_take"),
          },
          photos: photos.map((p) => p.url),
        }),
      });
      if (!res.ok || !res.body) {
        const { error: e } = await res
          .json()
          .catch(() => ({ error: "Drafting failed." }));
        throw new Error(e || "Drafting failed.");
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let draft = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        draft += decoder.decode(value, { stream: true });
        setDescription(draft);
      }
      if (!draft.trim()) {
        throw new Error("Claude came back with nothing. Try again.");
      }
    } catch (e) {
      // Put back exactly what was in the box, not the stale state value.
      setDescription(previous);
      setUndoTo(null);
      setDraftError(e instanceof Error ? e.message : "Drafting failed.");
    } finally {
      setDrafting(false);
    }
  }

  function onSubmit(formData: FormData) {
    startTransition(async () => {
      setError(null);
      setSaved(false);
      const input: CarInput = {
        id: car?.id,
        make: String(formData.get("make") ?? ""),
        model: String(formData.get("model") ?? ""),
        badge: String(formData.get("badge") ?? "") || undefined,
        year: Number(formData.get("year")),
        price: Number(formData.get("price")),
        odometer_km: Number(formData.get("odometer_km")),
        body_type: String(formData.get("body_type") ?? ""),
        transmission: String(formData.get("transmission") ?? ""),
        fuel: String(formData.get("fuel") ?? ""),
        drivetrain: String(formData.get("drivetrain") ?? "") || undefined,
        colour: String(formData.get("colour") ?? "") || undefined,
        seats: formData.get("seats") ? Number(formData.get("seats")) : undefined,
        description: String(formData.get("description") ?? "") || undefined,
        adams_take: String(formData.get("adams_take") ?? "") || undefined,
        video_url: String(formData.get("video_url") ?? ""),
        ppsr_clear: formData.get("ppsr_clear") === "on",
        service_history: (formData.get("service_history") as CarInput["service_history"]) ?? "unknown",
        inspection_summary: String(formData.get("inspection_summary") ?? "") || undefined,
        photos,
      };
      const r = await saveCar(input);
      if (!r.ok) {
        setError(r.error ?? "Save failed.");
        return;
      }
      setSaved(true);
      if (!car && r.id) router.push(`/admin/inventory/${r.id}`);
      else router.refresh();
    });
  }

  const field = (
    name: string,
    label: string,
    props: React.InputHTMLAttributes<HTMLInputElement> = {},
    defaultValue?: string | number | null,
  ) => (
    <div>
      <label htmlFor={`car-${name}`} className="label">{label}</label>
      <input
        id={`car-${name}`}
        name={name}
        className="input"
        defaultValue={defaultValue ?? undefined}
        {...props}
      />
    </div>
  );

  return (
    <form ref={formRef} action={onSubmit} className="space-y-6">
      <section className="card p-5">
        <h2 className="font-bold mb-4">The car</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {field("make", "Make", { required: true }, car?.make)}
          {field("model", "Model", { required: true }, car?.model)}
          {field("badge", "Badge / variant", {}, car?.badge)}
          {field("year", "Year", { type: "number", required: true }, car?.year)}
          {field("price", "Price (AUD)", { type: "number", required: true }, car?.price)}
          {field("odometer_km", "Odometer (km)", { type: "number", required: true }, car?.odometer_km)}
          {field("body_type", "Body type", { required: true, placeholder: "Ute, SUV, Hatch…" }, car?.body_type)}
          {field("transmission", "Transmission", { required: true, placeholder: "Automatic" }, car?.transmission)}
          {field("fuel", "Fuel", { required: true, placeholder: "Diesel" }, car?.fuel)}
          {field("drivetrain", "Drivetrain", { placeholder: "4x4, AWD, FWD" }, car?.drivetrain)}
          {field("colour", "Colour", {}, car?.colour)}
          {field("seats", "Seats", { type: "number" }, car?.seats)}
        </div>
      </section>

      <section className="card p-5">
        <h2 className="font-bold mb-1">Photos</h2>
        <p className="text-sm text-stone-500 mb-4">First photo is the hero shot.</p>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-4">
          {photos.map((p, i) => (
            <div key={p.url} className="relative aspect-[3/2] rounded-lg overflow-hidden bg-stone-100 group">
              <Image src={p.url} alt={p.alt ?? `Photo ${i + 1}`} fill sizes="200px" className="object-cover" />
              {i === 0 && (
                <span className="absolute bottom-1 left-1 bg-forest-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                  HERO
                </span>
              )}
              <button
                type="button"
                aria-label={`Remove photo ${i + 1}`}
                onClick={() => setPhotos((ps) => ps.filter((x) => x.url !== p.url))}
                className="absolute top-1 right-1 bg-ink/70 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={12} weight="bold" />
              </button>
              <div className="absolute bottom-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {i > 0 && (
                  <button
                    type="button"
                    aria-label={`Make photo ${i + 1} the hero`}
                    title="Make hero"
                    onClick={() =>
                      setPhotos((ps) => [ps[i], ...ps.filter((_, j) => j !== i)])
                    }
                    className="bg-ink/70 text-white rounded-full p-1"
                  >
                    <Star size={12} weight="bold" />
                  </button>
                )}
                {i > 0 && (
                  <button
                    type="button"
                    aria-label={`Move photo ${i + 1} earlier`}
                    title="Move left"
                    onClick={() =>
                      setPhotos((ps) => {
                        const next = [...ps];
                        [next[i - 1], next[i]] = [next[i], next[i - 1]];
                        return next;
                      })
                    }
                    className="bg-ink/70 text-white rounded-full p-1"
                  >
                    <ArrowLeft size={12} weight="bold" />
                  </button>
                )}
                {i < photos.length - 1 && (
                  <button
                    type="button"
                    aria-label={`Move photo ${i + 1} later`}
                    title="Move right"
                    onClick={() =>
                      setPhotos((ps) => {
                        const next = [...ps];
                        [next[i], next[i + 1]] = [next[i + 1], next[i]];
                        return next;
                      })
                    }
                    className="bg-ink/70 text-white rounded-full p-1"
                  >
                    <ArrowRight size={12} weight="bold" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
        <label className="btn-secondary !py-2.5 text-sm cursor-pointer">
          <UploadSimple size={18} weight="bold" />
          {uploading > 0 ? `Uploading ${uploading}…` : "Add photos"}
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => {
              onFiles(e.target.files);
              e.target.value = "";
            }}
          />
        </label>
      </section>

      <section className="card p-5">
        <h2 className="font-bold mb-4">Trust block</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="car-sh" className="label">Service history</label>
            <select id="car-sh" name="service_history" className="input" defaultValue={car?.service_history ?? "unknown"}>
              <option value="full">Full books</option>
              <option value="partial">Partial / receipts</option>
              <option value="none">No records</option>
              <option value="unknown">Being confirmed</option>
            </select>
          </div>
          <label className="flex items-center gap-3 mt-7 cursor-pointer">
            <input
              type="checkbox"
              name="ppsr_clear"
              defaultChecked={car?.ppsr_clear ?? false}
              className="w-5 h-5 accent-forest-600"
            />
            <span className="font-semibold text-sm">PPSR checked and clear</span>
          </label>
        </div>
        <div className="mt-4">
          {field("inspection_summary", "Inspection summary (shown on listing)", { placeholder: "Fresh service done. Tyres at 80%…" }, car?.inspection_summary)}
        </div>
        <div className="mt-4">
          <label htmlFor="car-take" className="label">Our take (two honest sentences)</label>
          <textarea
            id="car-take"
            name="adams_take"
            rows={2}
            className="input resize-none"
            defaultValue={car?.adams_take ?? ""}
            placeholder="Nothing generic — say what you'd say on the lot."
          />
        </div>
      </section>

      <section className="card p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-1">
          <h2 className="font-bold">Listing copy</h2>
          <div className="flex items-center gap-2">
            {undoTo !== null && !drafting && (
              <button
                type="button"
                onClick={() => {
                  setDescription(undoTo);
                  setUndoTo(null);
                }}
                className="btn-ghost !py-2 text-sm"
              >
                <ArrowCounterClockwise size={16} weight="bold" />
                Undo draft
              </button>
            )}
            <button
              type="button"
              onClick={draftDescription}
              disabled={!aiConfigured || drafting || uploading > 0}
              title={
                aiConfigured
                  ? undefined
                  : "Add ANTHROPIC_API_KEY in Cloudflare to enable drafting"
              }
              className="btn-secondary !py-2 text-sm"
            >
              <Sparkle size={16} weight="bold" />
              {drafting
                ? "Drafting…"
                : description.trim()
                  ? "Redraft with AI"
                  : "Draft with AI"}
            </button>
          </div>
        </div>
        <p className="text-sm text-stone-500 mb-4">
          {!aiConfigured
            ? "Drafting needs an ANTHROPIC_API_KEY secret in Cloudflare."
            : photos.length > 0
              ? "Drafting reads the photos above and the specs you have typed in. Read it before you save."
              : "Drafting reads the specs you have typed in. Add photos above and it will describe what is in them too. Read it before you save."}
        </p>
        {draftError && (
          <p className="error-text mb-4" role="alert">{draftError}</p>
        )}
        <div>
          <label htmlFor="car-desc" className="label">Description</label>
          <textarea
            id="car-desc"
            name="description"
            rows={5}
            className="input resize-y"
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              setUndoTo(null);
            }}
            readOnly={drafting}
          />
        </div>
        <div className="mt-4">
          {field("video_url", "Walk-around video URL (YouTube or Vimeo)", { type: "url", placeholder: "https://youtu.be/…" }, car?.video_url)}
        </div>
      </section>

      {error && <p className="error-text" role="alert">{error}</p>}
      {saved && <p className="text-sm font-medium text-forest-700" role="status">Saved.</p>}

      {/* Drafting blocks saving too: a half-streamed description saved mid
          draft would look like the dealer's own words. */}
      <button
        type="submit"
        disabled={pending || uploading > 0 || drafting}
        className="btn-primary"
      >
        {pending ? "Saving…" : car ? "Save changes" : "Create draft listing"}
      </button>
    </form>
  );
}
