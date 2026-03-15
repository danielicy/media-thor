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
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateMediaDTO {
  originalName: string;
  storageKey: string;
  mimeType: string;
  size: number;
  title: string;
  description: string;
  tags: string[];
}

export interface UpdateMediaDTO {
  title?: string;
  description?: string;
  tags?: string[];
  published?: boolean;
}
