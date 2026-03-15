import { useState, useRef } from "react";
import * as api from "../api";
import "./UploadForm.css";

interface Props {
  onUploaded: () => void;
}

export default function UploadForm({ onUploaded }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const file = fileRef.current?.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const tags = tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      await api.uploadMedia(file, title || file.name, description, tags);
      setTitle("");
      setDescription("");
      setTagsInput("");
      if (fileRef.current) fileRef.current.value = "";
      onUploaded();
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <form className="upload-form" onSubmit={handleSubmit}>
      <h2>Upload Media</h2>
      <div className="upload-form-row">
        <input ref={fileRef} type="file" accept="image/*,video/*" required />
      </div>
      <div className="upload-form-row">
        <input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>
      <div className="upload-form-row">
        <textarea
          placeholder="Description"
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <div className="upload-form-row">
        <input
          placeholder="Tags (comma separated)"
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
        />
      </div>
      <button type="submit" className="btn-primary" disabled={uploading}>
        {uploading ? "Uploading…" : "Upload"}
      </button>
    </form>
  );
}
