import { Router, Request, Response } from "express";
import multer from "multer";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { StorageProvider } from "../storage";
import * as mediaService from "../mediaService";

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "video/mp4",
  "video/webm",
  "video/quicktime",
];

const MAX_FILE_SIZE = 200 * 1024 * 1024; // 200 MB

export function createMediaRouter(storage: StorageProvider): Router {
  const router = Router();

  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: MAX_FILE_SIZE },
    fileFilter: (_req, file, cb) => {
      if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error(`Unsupported file type: ${file.mimetype}`));
      }
    },
  });

  // Upload a new media item
  router.post("/", upload.single("file"), async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        res.status(400).json({ error: "No file provided" });
        return;
      }

      const ext = path.extname(req.file.originalname);
      const uniqueName = `${uuidv4()}${ext}`;
      const storageKey = await storage.save(uniqueName, req.file.buffer, req.file.mimetype);

      const tags: string[] = req.body.tags
        ? JSON.parse(req.body.tags)
        : [];

      const item = await mediaService.createMedia({
        originalName: req.file.originalname,
        storageKey,
        mimeType: req.file.mimetype,
        size: req.file.size,
        title: req.body.title || req.file.originalname,
        description: req.body.description || "",
        tags,
      });

      res.status(201).json(item);
    } catch (err: any) {
      console.error("Upload error:", err);
      res.status(500).json({ error: err.message });
    }
  });

  // List all media (admin) or published only (?published=true)
  router.get("/", async (req: Request, res: Response) => {
    try {
      const publishedOnly = req.query.published === "true";
      const items = await mediaService.listMedia(publishedOnly);

      const enriched = items.map((item) => ({
        ...item,
        url: storage.getUrl(item.storageKey),
      }));

      res.json(enriched);
    } catch (err: any) {
      console.error("List error:", err);
      res.status(500).json({ error: err.message });
    }
  });

  // Get single media item
  router.get("/:id", async (req: Request, res: Response) => {
    try {
      const item = await mediaService.getMediaById(req.params.id);
      if (!item) {
        res.status(404).json({ error: "Not found" });
        return;
      }
      res.json({ ...item, url: storage.getUrl(item.storageKey) });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Update media metadata (title, description, tags, published)
  router.patch("/:id", async (req: Request, res: Response) => {
    try {
      const item = await mediaService.updateMedia(req.params.id, req.body);
      if (!item) {
        res.status(404).json({ error: "Not found" });
        return;
      }
      res.json({ ...item, url: storage.getUrl(item.storageKey) });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Delete media
  router.delete("/:id", async (req: Request, res: Response) => {
    try {
      const item = await mediaService.getMediaById(req.params.id);
      if (!item) {
        res.status(404).json({ error: "Not found" });
        return;
      }

      await storage.delete(item.storageKey);
      await mediaService.deleteMedia(req.params.id);
      res.status(204).send();
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
}
