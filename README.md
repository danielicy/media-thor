# Media-Tor

A media management system for storing, organizing, and publishing images and videos with metadata and tags.

## Architecture

```
media-tor/
├── server/          # Node.js + Express + TypeScript API
│   └── src/
│       ├── storage/            # Pluggable storage abstraction
│       │   ├── StorageProvider.ts        # Interface
│       │   ├── LocalFileSystemStorage.ts # Local FS implementation
│       │   └── index.ts                 # Factory
│       ├── routes/media.ts     # REST endpoints
│       ├── types/media.ts      # Shared DTOs
│       ├── db.ts               # MySQL connection & schema
│       ├── mediaService.ts     # Metadata CRUD
│       └── index.ts            # App entry point
├── client/          # React + Vite + TypeScript frontend
│   └── src/
│       ├── components/
│       │   ├── UploadForm.tsx   # File upload with title/description/tags
│       │   ├── MediaGrid.tsx    # Card grid with publish/delete controls
│       │   └── MediaDetail.tsx  # Detail view with inline editing
│       ├── api.ts              # API client
│       ├── App.tsx             # Manage / Gallery view toggle
│       └── types.ts            # Shared types
```

## Prerequisites

- **Node.js** >= 18
- **MySQL** >= 8

## Setup

### 1. Database

Create a MySQL database:

```sql
CREATE DATABASE media_tor;
```

Tables are created automatically on first server start.

### 2. Server

```bash
cd server
cp .env.example .env   # edit with your MySQL credentials
npm install
npm run dev            # http://localhost:4000
```

### 3. Client

```bash
cd client
npm install
npm run dev            # http://localhost:5173
```

The Vite dev server proxies `/api` and `/uploads` requests to the backend.

## Environment Variables (server/.env)

| Variable           | Default     | Description               |
| ------------------ | ----------- | ------------------------- |
| `PORT`             | `4000`      | Server port               |
| `DB_HOST`          | `localhost` | MySQL host                |
| `DB_PORT`          | `3306`      | MySQL port                |
| `DB_USER`          | `root`      | MySQL user                |
| `DB_PASSWORD`      |             | MySQL password            |
| `DB_NAME`          | `media_tor` | MySQL database name       |
| `STORAGE_PROVIDER` | `local`     | Storage backend (`local`) |
| `UPLOAD_DIR`       | `./uploads` | Local storage directory   |

## API

| Method   | Path             | Description                                             |
| -------- | ---------------- | ------------------------------------------------------- |
| `POST`   | `/api/media`     | Upload file (multipart: file, title, description, tags) |
| `GET`    | `/api/media`     | List all media (`?published=true` for published only)   |
| `GET`    | `/api/media/:id` | Get single media item                                   |
| `PATCH`  | `/api/media/:id` | Update title, description, tags, published              |
| `DELETE` | `/api/media/:id` | Delete media item and file                              |

## Storage Abstraction

The `StorageProvider` interface decouples file storage from the rest of the application. To add a cloud provider (S3, Azure Blob, GCS):

1. Create a new class implementing `StorageProvider`
2. Register it in `server/src/storage/index.ts`
3. Set `STORAGE_PROVIDER` in `.env`

No changes to routes or services required.

## Scripts

| Location | Command           | Description              |
| -------- | ----------------- | ------------------------ |
| server   | `npm run dev`     | Start with hot reload    |
| server   | `npm run build`   | Compile TypeScript       |
| server   | `npm start`       | Run compiled output      |
| client   | `npm run dev`     | Vite dev server          |
| client   | `npm run build`   | Production build         |
| client   | `npm run preview` | Preview production build |
