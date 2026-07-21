"use server";

import { randomUUID } from "node:crypto";
import { requireAdmin } from "@/lib/admin";

export type ChatTurn = { role: "user" | "assistant"; content: string };
export type ChatSummary = { id: string; title: string; updated_at: string };

function titleFrom(messages: ChatTurn[]): string {
  const firstUser = messages.find((m) => m.role === "user")?.content?.trim();
  const t = (firstUser || "New chat").replace(/\s+/g, " ");
  return t.length > 80 ? t.slice(0, 79) + "…" : t;
}

// Recent saved chats for the signed-in admin (newest first).
export async function listChats(): Promise<ChatSummary[]> {
  const { supabase } = await requireAdmin();
  const { data } = await supabase
    .from("ai_chats")
    .select("id, title, updated_at")
    .order("updated_at", { ascending: false })
    .limit(40);
  return (data ?? []) as ChatSummary[];
}

// Full transcript for one chat.
export async function getChat(
  id: string,
): Promise<{ id: string; title: string; messages: ChatTurn[] } | null> {
  const { supabase } = await requireAdmin();
  const { data } = await supabase
    .from("ai_chats")
    .select("id, title, messages")
    .eq("id", id)
    .maybeSingle();
  if (!data) return null;
  return {
    id: data.id as string,
    title: data.title as string,
    messages: (data.messages ?? []) as ChatTurn[],
  };
}

// Create or update a chat. Returns the id so a new chat can keep saving
// into the same row as the conversation continues.
export async function saveChat(input: {
  id?: string | null;
  messages: ChatTurn[];
}): Promise<{ id: string }> {
  const { supabase, userId } = await requireAdmin();
  const clean = (input.messages ?? [])
    .filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .slice(-60);
  const id = input.id ?? randomUUID();
  await supabase.from("ai_chats").upsert({
    id,
    admin_id: userId,
    title: titleFrom(clean),
    messages: clean,
    updated_at: new Date().toISOString(),
  });
  return { id };
}

export async function deleteChat(id: string): Promise<void> {
  const { supabase } = await requireAdmin();
  await supabase.from("ai_chats").delete().eq("id", id);
}
