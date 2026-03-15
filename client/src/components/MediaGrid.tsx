import { MediaItem } from "../types";
import "./MediaGrid.css";

interface Props {
  items: MediaItem[];
  loading: boolean;
  isAdmin: boolean;
  onSelect: (item: MediaItem) => void;
  onTogglePublish: (item: MediaItem) => void;
  onDelete: (id: string) => void;
}

export default function MediaGrid({ items, loading, isAdmin, onSelect, onTogglePublish, onDelete }: Props) {
  if (loading) return <p className="status-text">Loading…</p>;
  if (items.length === 0) return <p className="status-text">No media found.</p>;

  return (
    <div className="media-grid">
      {items.map((item) => (
        <div key={item.id} className="media-card">
          <div className="media-thumb" onClick={() => onSelect(item)}>
            {item.mimeType.startsWith("video/") ? (
              <video src={item.url} muted preload="metadata" />
            ) : (
              <img src={item.url} alt={item.title} loading="lazy" />
            )}
          </div>
          <div className="media-info">
            <h3 onClick={() => onSelect(item)}>{item.title}</h3>
            {item.tags.length > 0 && (
              <div className="media-tags">
                {item.tags.map((t) => (
                  <span key={t} className="tag">{t}</span>
                ))}
              </div>
            )}
            {isAdmin && (
              <div className="media-actions">
                <button
                  className={item.published ? "btn-unpublish" : "btn-publish"}
                  onClick={() => onTogglePublish(item)}
                >
                  {item.published ? "Unpublish" : "Publish"}
                </button>
                <button className="btn-danger" onClick={() => onDelete(item.id)}>
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
