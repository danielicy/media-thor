import { MediaItem } from "./types";

const BASE = "/api/media";

export async function fetchMedia(publishedOnly = false): Promise<MediaItem[]> {
  const url = publishedOnly ? `${BASE}?published=true` : BASE;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch media");
  return res.json();
}

export async function fetchMediaById(id: string): Promise<MediaItem> {
  const res = await fetch(`${BASE}/${id}`);
  if (!res.ok) throw new Error("Failed to fetch media item");
  return res.json();
}

export async function uploadMedia(
  file: File,
  title: string,
  description: string,
  tags: string[]
): Promise<MediaItem> {
  const form = new FormData();
  form.append("file", file);
  form.append("title", title);
  form.append("description", description);
  form.append("tags", JSON.stringify(tags));

  const res = await fetch(BASE, { method: "POST", body: form });
  if (!res.ok) throw new Error("Upload failed");
  return res.json();
}

export async function updateMedia(
  id: string,
  data: { title?: string; description?: string; tags?: string[]; published?: boolean }
): Promise<MediaItem> {
  const res = await fetch(`${BASE}/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Update failed");
  return res.json();
}

export async function deleteMedia(id: string): Promise<void> {
  const res = await fetch(`${BASE}/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Delete failed");
}
