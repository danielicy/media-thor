export interface StorageProvider {
  /** Save a file and return the storage key (relative path or cloud key). */
  save(fileName: string, data: Buffer, mimeType: string): Promise<string>;

  /** Delete a file by its storage key. */
  delete(key: string): Promise<void>;

  /** Return a readable URL or local path for serving the file. */
  getUrl(key: string): string;

  /** Check whether a file exists. */
  exists(key: string): Promise<boolean>;
}
