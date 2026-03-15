import mysql, { Pool, RowDataPacket, ResultSetHeader } from "mysql2/promise";

let pool: Pool;

export function getPool(): Pool {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.DB_HOST || "localhost",
      port: Number(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "media_tor",
      waitForConnections: true,
      connectionLimit: 10,
    });
  }
  return pool;
}

export async function initDatabase(): Promise<void> {
  const db = getPool();

  await db.execute(`
    CREATE TABLE IF NOT EXISTS media (
      id          VARCHAR(36) PRIMARY KEY,
      originalName VARCHAR(512) NOT NULL,
      storageKey  VARCHAR(1024) NOT NULL,
      mimeType    VARCHAR(128)  NOT NULL,
      size        BIGINT        NOT NULL,
      title       VARCHAR(512)  NOT NULL DEFAULT '',
      description TEXT          NOT NULL,
      published   BOOLEAN       NOT NULL DEFAULT FALSE,
      createdAt   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS media_tags (
      mediaId VARCHAR(36)   NOT NULL,
      tag     VARCHAR(128)  NOT NULL,
      PRIMARY KEY (mediaId, tag),
      FOREIGN KEY (mediaId) REFERENCES media(id) ON DELETE CASCADE
    )
  `);
}

export type { Pool, RowDataPacket, ResultSetHeader };
