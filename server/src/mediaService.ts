import { v4 as uuidv4 } from "uuid";
import { getPool, RowDataPacket, ResultSetHeader } from "./db";
import { MediaItem, CreateMediaDTO, UpdateMediaDTO } from "./types/media";

interface MediaRow extends RowDataPacket {
  id: string;
  originalName: string;
  storageKey: string;
  mimeType: string;
  size: number;
  title: string;
  description: string;
  published: number;
  createdAt: Date;
  updatedAt: Date;
}

interface TagRow extends RowDataPacket {
  tag: string;
}

function toMediaItem(row: MediaRow, tags: string[]): MediaItem {
  return {
    id: row.id,
    originalName: row.originalName,
    storageKey: row.storageKey,
    mimeType: row.mimeType,
    size: row.size,
    title: row.title,
    description: row.description,
    tags,
    published: Boolean(row.published),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

async function getTagsForMedia(mediaId: string): Promise<string[]> {
  const db = getPool();
  const [rows] = await db.execute<TagRow[]>(
    "SELECT tag FROM media_tags WHERE mediaId = ?",
    [mediaId]
  );
  return rows.map((r) => r.tag);
}

async function setTags(mediaId: string, tags: string[]): Promise<void> {
  const db = getPool();
  await db.execute("DELETE FROM media_tags WHERE mediaId = ?", [mediaId]);
  for (const tag of tags) {
    await db.execute(
      "INSERT INTO media_tags (mediaId, tag) VALUES (?, ?)",
      [mediaId, tag]
    );
  }
}

export async function createMedia(dto: CreateMediaDTO): Promise<MediaItem> {
  const db = getPool();
  const id = uuidv4();

  await db.execute<ResultSetHeader>(
    `INSERT INTO media (id, originalName, storageKey, mimeType, size, title, description)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [id, dto.originalName, dto.storageKey, dto.mimeType, dto.size, dto.title, dto.description]
  );

  if (dto.tags.length > 0) {
    await setTags(id, dto.tags);
  }

  return (await getMediaById(id))!;
}

export async function getMediaById(id: string): Promise<MediaItem | null> {
  const db = getPool();
  const [rows] = await db.execute<MediaRow[]>(
    "SELECT * FROM media WHERE id = ?",
    [id]
  );
  if (rows.length === 0) return null;
  const tags = await getTagsForMedia(id);
  return toMediaItem(rows[0], tags);
}

export async function listMedia(publishedOnly: boolean = false): Promise<MediaItem[]> {
  const db = getPool();
  const query = publishedOnly
    ? "SELECT * FROM media WHERE published = TRUE ORDER BY createdAt DESC"
    : "SELECT * FROM media ORDER BY createdAt DESC";
  const [rows] = await db.execute<MediaRow[]>(query);

  const items: MediaItem[] = [];
  for (const row of rows) {
    const tags = await getTagsForMedia(row.id);
    items.push(toMediaItem(row, tags));
  }
  return items;
}

export async function updateMedia(id: string, dto: UpdateMediaDTO): Promise<MediaItem | null> {
  const db = getPool();
  const fields: string[] = [];
  const values: (string | boolean)[] = [];

  if (dto.title !== undefined) {
    fields.push("title = ?");
    values.push(dto.title);
  }
  if (dto.description !== undefined) {
    fields.push("description = ?");
    values.push(dto.description);
  }
  if (dto.published !== undefined) {
    fields.push("published = ?");
    values.push(dto.published);
  }

  if (fields.length > 0) {
    values.push(id);
    await db.execute<ResultSetHeader>(
      `UPDATE media SET ${fields.join(", ")} WHERE id = ?`,
      values
    );
  }

  if (dto.tags !== undefined) {
    await setTags(id, dto.tags);
  }

  return getMediaById(id);
}

export async function deleteMedia(id: string): Promise<boolean> {
  const db = getPool();
  const [result] = await db.execute<ResultSetHeader>(
    "DELETE FROM media WHERE id = ?",
    [id]
  );
  return result.affectedRows > 0;
}
