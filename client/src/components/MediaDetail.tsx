import { useState } from "react";
import { MediaItem } from "../types";
import "./MediaDetail.css";

interface Props {
  item: MediaItem;
  isAdmin: boolean;
  onClose: () => void;
  onDelete: (id: string) => void;
  onTogglePublish: (item: MediaItem) => void;
  onUpdate: (id: string, data: { title?: string; description?: string; tags?: string[] }) => void;
}

export default function MediaDetail({ item, isAdmin, onClose, onDelete, onTogglePublish, onUpdate }: Props) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(item.title);
  const [description, setDescription] = useState(item.description);
  const [tagsInput, setTagsInput] = useState(item.tags.join(", "));

  const handleSave = () => {
    const tags = tagsInput.split(",").map((t) => t.trim()).filter(Boolean);
    onUpdate(item.id, { title, description, tags });
    setEditing(false);
  };

  return (
    <div className="media-detail">
      <button className="btn-back" onClick={onClose}>← Back</button>

      <div className="detail-media">
        {item.mimeType.startsWith("video/") ? (
          <video src={item.url} controls />
        ) : (
          <img src={item.url} alt={item.title} />
        )}
      </div>

      <div className="detail-body">
        {editing ? (
          <>
            <input value={title} onChange={(e) => setTitle(e.target.value)} />
            <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
            <input placeholder="Tags (comma separated)" value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} />
            <div className="detail-actions">
              <button className="btn-primary" onClick={handleSave}>Save</button>
              <button onClick={() => setEditing(false)}>Cancel</button>
            </div>
          </>
        ) : (
          <>
            <h2>{item.title}</h2>
            {item.description && <p className="detail-desc">{item.description}</p>}
            {item.tags.length > 0 && (
              <div className="media-tags">
                {item.tags.map((t) => <span key={t} className="tag">{t}</span>)}
              </div>
            )}
            <p className="detail-meta">
              {item.mimeType} &middot; {(item.size / 1024 / 1024).toFixed(1)} MB
              {isAdmin && (
                <> &middot; {item.published ? "Published" : "Draft"}</>
              )}
            </p>
            {isAdmin && (
              <div className="detail-actions">
                <button className="btn-primary" onClick={() => setEditing(true)}>Edit</button>
                <button
                  className={item.published ? "btn-unpublish" : "btn-publish"}
                  onClick={() => onTogglePublish(item)}
                >
                  {item.published ? "Unpublish" : "Publish"}
                </button>
                <button className="btn-danger" onClick={() => onDelete(item.id)}>Delete</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
