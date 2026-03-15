import { StorageProvider } from "./StorageProvider";
import { LocalFileSystemStorage } from "./LocalFileSystemStorage";

export type { StorageProvider };

export function createStorageProvider(): StorageProvider {
  const provider = process.env.STORAGE_PROVIDER || "local";

  switch (provider) {
    case "local":
      return new LocalFileSystemStorage(process.env.UPLOAD_DIR || "./uploads");
    // Add future providers here, e.g.:
    // case "s3":
    //   return new S3Storage({ bucket: process.env.S3_BUCKET!, ... });
    default:
      throw new Error(`Unknown storage provider: ${provider}`);
  }
}
