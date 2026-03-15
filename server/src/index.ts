import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import { initDatabase } from "./db";
import { createStorageProvider } from "./storage";
import { createMediaRouter } from "./routes/media";

async function main() {
  await initDatabase();

  const app = express();
  const storage = createStorageProvider();

  app.use(cors({ origin: process.env.CLIENT_ORIGIN || "http://localhost:5173" }));
  app.use(express.json());

  // Serve uploaded files statically (local storage only)
  const uploadDir = path.resolve(process.env.UPLOAD_DIR || "./uploads");
  app.use("/uploads", express.static(uploadDir));

  app.use("/api/media", createMediaRouter(storage));

  const port = Number(process.env.PORT) || 4000;
  app.listen(port, () => {
    console.log(`Media-Tor server running on http://localhost:${port}`);
  });
}

main().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
