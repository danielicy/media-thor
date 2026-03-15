import fs from "fs/promises";
import path from "path";
import { StorageProvider } from "./StorageProvider";

export class LocalFileSystemStorage implements StorageProvider {
  private readonly basePath: string;

  constructor(basePath: string) {
    this.basePath = path.resolve(basePath);
  }

  async save(fileName: string, data: Buffer, _mimeType: string): Promise<string> {
    await fs.mkdir(this.basePath, { recursive: true });
    const filePath = path.join(this.basePath, fileName);
    await fs.writeFile(filePath, data);
    return fileName;
  }

  async delete(key: string): Promise<void> {
    const filePath = path.join(this.basePath, key);
    await fs.unlink(filePath);
  }

  getUrl(key: string): string {
    return `/uploads/${key}`;
  }

  async exists(key: string): Promise<boolean> {
    try {
      await fs.access(path.join(this.basePath, key));
      return true;
    } catch {
      return false;
    }
  }
}
