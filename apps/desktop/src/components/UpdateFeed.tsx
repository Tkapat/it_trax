import { useState, FormEvent, ChangeEvent, FocusEvent, MouseEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Image, Video, FileText, Download, Trash2 } from "lucide-react";
import { ProjectUpdate, ProjectMedia, ProjectMediaInsert } from "@trax/core";
import { useSupabase } from "../hooks/useSupabase";
import { useAuth } from "../hooks/useAuth";

interface UpdateFeedProps {
  projectId: string;
  initialUpdates?: (ProjectUpdate & { media?: ProjectMedia[] })[];
}

export function UpdateFeed({ projectId, initialUpdates = [] }: UpdateFeedProps) {
  const supabase = useSupabase();
  const { user } = useAuth();
  const [updates, setUpdates] = useState<(ProjectUpdate & { media?: ProjectMedia[] })[]>(initialUpdates);
  const [newContent, setNewContent] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [posting, setPosting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [expandedMedia, setExpandedMedia] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newContent.trim() && selectedFiles.length === 0) return;

    if (!user?.id) {
      alert("You must be logged in to post updates");
      return;
    }

    setPosting(true);
    try {
      const { data: update, error: updateError } = await supabase
        .from("project_updates")
        .insert({
          project_id: projectId,
          user_id: user.id,
          content: newContent.trim(),
        })
        .select()
        .single();

      if (updateError) throw updateError;

      const mediaInserts: ProjectMediaInsert[] = [];
      for (const file of selectedFiles) {
        const fileExt = file.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
        const storagePath = `${user.id}/${projectId}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("project-media")
          .upload(storagePath, file);

        if (uploadError) throw uploadError;

        mediaInserts.push({
          project_id: projectId,
          user_id: user!.id,
          storage_path: storagePath,
          mime_type: file.type,
          size_bytes: file.size,
        });
      }

      if (mediaInserts.length > 0) {
        const { error: mediaError } = await supabase.from("project_media").insert(mediaInserts);
        if (mediaError) throw mediaError;
      }

      setNewContent("");
      setSelectedFiles([]);
      setUpdates((prev) => [{ ...update, media: [] }, ...prev]);
    } catch (error) {
      console.error("Failed to create update:", error);
      alert("Failed to create update. Please try again.");
    } finally {
      setPosting(false);
    }
  };

  const handleDelete = async (updateId: string) => {
    if (!confirm("Delete this update?")) return;

    setDeletingId(updateId);
    try {
      const { error } = await supabase.from("project_updates").delete().eq("id", updateId);
      if (error) throw error;
      setUpdates((prev) => prev.filter((u) => u.id !== updateId));
    } catch (error) {
      console.error("Failed to delete update:", error);
      alert("Failed to delete update.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const remaining = 5 - selectedFiles.length;
    if (files.length > remaining) {
      alert(`Maximum 5 files per update. You can add ${remaining} more.`);
      return;
    }
    setSelectedFiles((prev) => [...prev, ...files.slice(0, remaining)]);
    e.currentTarget.value = "";
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const getMediaUrl = (storagePath: string) => {
    const { data } = supabase.storage.from("project-media").getPublicUrl(storagePath);
    return data.publicUrl;
  };

  const isImage = (mimeType: string) => mimeType.startsWith("image/");
  const isVideo = (mimeType: string) => mimeType.startsWith("video/");

  return (
    <div>
      <form onSubmit={handleSubmit} style={{ marginBottom: "24px" }}>
        <div style={{ display: "flex", gap: "12px" }}>
          <div style={{ flex: 1 }}>
            <textarea
              value={newContent}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setNewContent(e.target.value)}
              placeholder="Write an update..."
              rows={3}
              disabled={posting}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border-color)",
                backgroundColor: "var(--bg-color)",
                color: "var(--text-primary)",
                fontSize: "14px",
                fontFamily: "inherit",
                outline: "none",
                resize: "vertical",
                transition: "border-color var(--transition-fast)",
              }}
              onFocus={(e: FocusEvent) => { (e.currentTarget as HTMLTextAreaElement).style.borderColor = "var(--accent-color)"; }}
              onBlur={(e: FocusEvent) => { (e.currentTarget as HTMLTextAreaElement).style.borderColor = "var(--border-color)"; }}
            />
          </div>
        </div>

        {selectedFiles.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "12px" }}>
            {selectedFiles.map((file, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "8px 12px",
                  backgroundColor: "var(--bg-tertiary)",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border-color)",
                }}
              >
                {isImage(file.type) ? <Image size={16} color="var(--accent-color)" /> : isVideo(file.type) ? <Video size={16} color="var(--accent-color)" /> : <FileText size={16} color="var(--text-tertiary)" />}
                <span style={{ fontSize: "13px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "150px" }}>{file.name}</span>
                <span style={{ fontSize: "11px", color: "var(--text-tertiary)" }}>{(file.size / 1024).toFixed(1)} KB</span>
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  style={{ padding: "2px", color: "var(--text-tertiary)", background: "none", border: "none", cursor: "pointer" }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            <input type="file" multiple accept="image/*,video/*,application/pdf" onChange={handleFileSelect} style={{ display: "none" }} id="file-upload" />
            <label htmlFor="file-upload" style={{ padding: "8px 12px", borderRadius: "var(--radius-md)", border: "1px dashed var(--border-color)", color: "var(--text-tertiary)", fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
              <FileText size={14} /> Add more
            </label>
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "12px" }}>
          <button type="submit" className="btn-primary" disabled={posting || (!newContent.trim() && selectedFiles.length === 0)} style={{ minWidth: "140px" }}>
            {posting ? <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} /> : "Post Update"}
          </button>
        </div>
      </form>

      <AnimatePresence>
        {updates.map((update, index) => (
          <motion.div
            key={update.id}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ delay: index * 0.05 }}
            style={{
              backgroundColor: "var(--bg-secondary)",
              borderRadius: "var(--radius-lg)",
              border: "1px solid var(--border-color)",
              padding: "20px",
              marginBottom: "16px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", backgroundColor: "var(--accent-color-dim)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--accent-color)" }}>
                    {user?.user_metadata?.full_name?.[0] || user?.email?.[0]?.toUpperCase() || "U"}
                  </span>
                </div>
                <div>
                  <div style={{ fontWeight: 500, fontSize: "14px" }}>{user?.user_metadata?.full_name || user?.email?.split("@")[0] || "You"}</div>
                  <div style={{ fontSize: "12px", color: "var(--text-tertiary)" }}>
                    {new Date(update.created_at).toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </div>
              {user?.id === update.user_id && (
                <button
                  onClick={() => handleDelete(update.id)}
                  disabled={deletingId === update.id}
                  style={{
                    padding: "6px",
                    borderRadius: "var(--radius-md)",
                    color: "var(--text-tertiary)",
                    backgroundColor: "transparent",
                    border: "none",
                    cursor: deletingId === update.id ? "not-allowed" : "pointer",
                    opacity: deletingId === update.id ? 0.5 : 1,
                    transition: "all var(--transition-fast)",
                  }}
                  onMouseEnter={(e: MouseEvent<HTMLButtonElement>) => { if (!deletingId) { e.currentTarget.style.color = "var(--error-color)"; e.currentTarget.style.backgroundColor = "rgba(255,68,68,0.1)"; } }}
                  onMouseLeave={(e: MouseEvent<HTMLButtonElement>) => { if (!deletingId) { e.currentTarget.style.color = "var(--text-tertiary)"; e.currentTarget.style.backgroundColor = "transparent"; } }}
                  aria-label="Delete update"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>

            <p style={{ fontSize: "15px", lineHeight: 1.6, whiteSpace: "pre-wrap", color: "var(--text-primary)" }}>
              {update.content}
            </p>

            {update.media && update.media.length > 0 && (
              <div style={{ marginTop: "16px" }}>
                <div style={{ display: "grid", gridTemplateColumns: `repeat(auto-fill, minmax(150px, 1fr))`, gap: "12px" }}>
                  {update.media.map((media) => (
                    <div key={media.id} style={{ position: "relative", borderRadius: "var(--radius-md)", overflow: "hidden", backgroundColor: "var(--bg-tertiary)", aspectRatio: "16/9" }}>
                      {isImage(media.mime_type) ? (
                        <img
                          src={getMediaUrl(media.storage_path)}
                          alt=""
                          style={{ width: "100%", height: "100%", objectFit: "cover", cursor: "zoom-in" }}
                          onClick={() => setExpandedMedia(getMediaUrl(media.storage_path))}
                        />
                      ) : isVideo(media.mime_type) ? (
                        <video
                          src={getMediaUrl(media.storage_path)}
                          controls
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      ) : (
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", padding: "16px", textAlign: "center" }}>
                          <FileText size={32} color="var(--text-tertiary)" />
                          <span style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "8px", wordBreak: "break-all" }}>
                            {media.storage_path.split("/").pop()}
                          </span>
                          <a
                            href={getMediaUrl(media.storage_path)}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ marginTop: "8px", display: "inline-flex", alignItems: "center", gap: "4px", color: "var(--accent-color)", fontSize: "12px" }}
                          >
                            <Download size={14} /> Download
                          </a>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </AnimatePresence>

      {updates.length === 0 && (
        <div style={{ textAlign: "center", padding: "40px", color: "var(--text-tertiary)" }}>
          <p>No updates yet. Be the first to post!</p>
        </div>
      )}

      {expandedMedia && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.95)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 200,
          }}
          onClick={() => setExpandedMedia(null)}
        >
          <img src={expandedMedia} alt="" style={{ maxWidth: "90%", maxHeight: "90%", objectFit: "contain" }} onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </div>
  );
}