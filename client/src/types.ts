export interface MediaItem {
  id: string;
  originalName: string;
  storageKey: string;
  mimeType: string;
  size: number;
  title: string;
  description: string;
  tags: string[];
  published: boolean;
  url: string;
  createdAt: string;
  updatedAt: string;
}
