import { useState, useEffect, useCallback } from "react";
import { MediaItem } from "./types";
import * as api from "./api";
import UploadForm from "./components/UploadForm";
import MediaGrid from "./components/MediaGrid";
import MediaDetail from "./components/MediaDetail";
import "./App.css";

type View = "manage" | "gallery";

export default function App() {
  const [view, setView] = useState<View>("manage");
  const [items, setItems] = useState<MediaItem[]>([]);
  const [selected, setSelected] = useState<MediaItem | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.fetchMedia(view === "gallery");
      setItems(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [view]);

  useEffect(() => {
    load();
  }, [load]);

  const handleUploaded = () => {
    load();
  };

  const handleDelete = async (id: string) => {
    await api.deleteMedia(id);
    setSelected(null);
    load();
  };

  const handleTogglePublish = async (item: MediaItem) => {
    await api.updateMedia(item.id, { published: !item.published });
    load();
  };

  const handleUpdate = async (id: string, data: { title?: string; description?: string; tags?: string[] }) => {
    await api.updateMedia(id, data);
    const updated = await api.fetchMediaById(id);
    setSelected(updated);
    load();
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Media-Tor</h1>
        <nav className="app-nav">
          <button
            className={view === "manage" ? "active" : ""}
            onClick={() => { setView("manage"); setSelected(null); }}
          >
            Manage
          </button>
          <button
            className={view === "gallery" ? "active" : ""}
            onClick={() => { setView("gallery"); setSelected(null); }}
          >
            Gallery
          </button>
        </nav>
      </header>

      <main className="app-main">
        {view === "manage" && <UploadForm onUploaded={handleUploaded} />}

        {selected ? (
          <MediaDetail
            item={selected}
            isAdmin={view === "manage"}
            onClose={() => setSelected(null)}
            onDelete={handleDelete}
            onTogglePublish={handleTogglePublish}
            onUpdate={handleUpdate}
          />
        ) : (
          <MediaGrid
            items={items}
            loading={loading}
            isAdmin={view === "manage"}
            onSelect={setSelected}
            onTogglePublish={handleTogglePublish}
            onDelete={handleDelete}
          />
        )}
      </main>
    </div>
  );
}
