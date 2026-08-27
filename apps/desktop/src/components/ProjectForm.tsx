import { useState, useEffect, FormEvent, ChangeEvent, FocusEvent, MouseEvent } from "react";
import { motion } from "framer-motion";
import { X, Loader2 } from "lucide-react";
import { Project, ProjectInsert, ProjectUpdate, ProjectStatus } from "@trax/core";

interface ProjectFormProps {
  initialData?: Project | null;
  onSubmit: (data: ProjectInsert | ProjectUpdate) => Promise<void>;
  onClose: () => void;
  loading?: boolean;
}

const statusOptions: { value: ProjectStatus; label: string }[] = [
  { value: "in_progress", label: "In Progress" },
  { value: "on_track", label: "On Track" },
  { value: "at_risk", label: "At Risk" },
  { value: "completed", label: "Completed" },
];

export function ProjectForm({ initialData, onSubmit, onClose, loading = false }: ProjectFormProps) {
  const isEditing = !!initialData;
  const [name, setName] = useState(initialData?.name || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [githubUrl, setGithubUrl] = useState(initialData?.github_url || "");
  const [status, setStatus] = useState<ProjectStatus>(initialData?.status || "in_progress");
  const [errors, setErrors] = useState<Partial<Record<keyof ProjectInsert, string>>>({});

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setDescription(initialData.description || "");
      setGithubUrl(initialData.github_url || "");
      setStatus(initialData.status);
    }
  }, [initialData]);

  const validate = () => {
    const newErrors: Partial<Record<keyof ProjectInsert, string>> = {};
    if (!name.trim()) newErrors.name = "Name is required";
    if (name.length > 120) newErrors.name = "Name must be 120 characters or less";
    if (githubUrl && !/^https:\/\/github\.com\/.+/.test(githubUrl)) {
      newErrors.github_url = "Must be a valid GitHub URL (https://github.com/...)";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) return;

    const data = {
      name: name.trim(),
      description: description.trim() || null,
      github_url: githubUrl.trim() || null,
      status,
    } as ProjectInsert | ProjectUpdate;

    await onSubmit(data);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
        padding: "20px",
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        style={{
          width: "100%",
          maxWidth: "500px",
          backgroundColor: "var(--bg-secondary)",
          borderRadius: "var(--radius-lg)",
          border: "1px solid var(--border-color)",
          padding: "24px",
          boxShadow: "var(--shadow-lg)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <h2 style={{ fontSize: "20px", fontWeight: 600 }}>{isEditing ? "Edit Project" : "New Project"}</h2>
          <button
            onClick={onClose}
            disabled={loading}
            style={{
              padding: "8px",
              borderRadius: "var(--radius-md)",
              color: "var(--text-tertiary)",
              backgroundColor: "transparent",
              border: "none",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.5 : 1,
              transition: "all var(--transition-fast)",
            }}
            onMouseEnter={(e: MouseEvent<HTMLButtonElement>) => { if (!loading) { e.currentTarget.style.color = "var(--text-primary)"; e.currentTarget.style.backgroundColor = "var(--bg-tertiary)"; } }}
            onMouseLeave={(e: MouseEvent<HTMLButtonElement>) => { if (!loading) { e.currentTarget.style.color = "var(--text-tertiary)"; e.currentTarget.style.backgroundColor = "transparent"; } }}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label style={{ display: "block", fontSize: "14px", color: "var(--text-secondary)", marginBottom: "6px" }}>
              Name <span style={{ color: "var(--error-color)" }}>*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
              placeholder="My Awesome Project"
              maxLength={120}
              disabled={loading}
              style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: "var(--radius-md)",
                border: `1px solid ${errors.name ? "var(--error-color)" : "var(--border-color)"}`,
                backgroundColor: "var(--bg-color)",
                color: "var(--text-primary)",
                fontSize: "16px",
                outline: "none",
                transition: "border-color var(--transition-fast)",
              }}
              onFocus={(e: FocusEvent<HTMLInputElement>) => { e.currentTarget.style.borderColor = "var(--accent-color)"; }}
              onBlur={(e: FocusEvent<HTMLInputElement>) => { e.currentTarget.style.borderColor = errors.name ? "var(--error-color)" : "var(--border-color)"; }}
            />
            {errors.name && <p style={{ color: "var(--error-color)", fontSize: "12px", marginTop: "4px" }}>{errors.name}</p>}
          </div>

          <div>
            <label style={{ display: "block", fontSize: "14px", color: "var(--text-secondary)", marginBottom: "6px" }}>
              Description
            </label>
            <textarea
              value={description}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
              placeholder="Add a description..."
              rows={3}
              disabled={loading}
              style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border-color)",
                backgroundColor: "var(--bg-color)",
                color: "var(--text-primary)",
                fontSize: "16px",
                fontFamily: "inherit",
                outline: "none",
                resize: "vertical",
                transition: "border-color var(--transition-fast)",
              }}
              onFocus={(e: FocusEvent<HTMLTextAreaElement>) => { e.currentTarget.style.borderColor = "var(--accent-color)"; }}
              onBlur={(e: FocusEvent<HTMLTextAreaElement>) => { e.currentTarget.style.borderColor = "var(--border-color)"; }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "14px", color: "var(--text-secondary)", marginBottom: "6px" }}>
              GitHub URL
            </label>
            <input
              type="url"
              value={githubUrl}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setGithubUrl(e.target.value)}
              placeholder="https://github.com/username/repo"
              disabled={loading}
              style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: "var(--radius-md)",
                border: `1px solid ${errors.github_url ? "var(--error-color)" : "var(--border-color)"}`,
                backgroundColor: "var(--bg-color)",
                color: "var(--text-primary)",
                fontSize: "16px",
                outline: "none",
                transition: "border-color var(--transition-fast)",
              }}
              onFocus={(e: FocusEvent<HTMLInputElement>) => { e.currentTarget.style.borderColor = "var(--accent-color)"; }}
              onBlur={(e: FocusEvent<HTMLInputElement>) => { e.currentTarget.style.borderColor = errors.github_url ? "var(--error-color)" : "var(--border-color)"; }}
            />
            {errors.github_url && <p style={{ color: "var(--error-color)", fontSize: "12px", marginTop: "4px" }}>{errors.github_url}</p>}
            <p style={{ fontSize: "12px", color: "var(--text-tertiary)", marginTop: "4px" }}>Must be a valid GitHub repository URL</p>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "14px", color: "var(--text-secondary)", marginBottom: "6px" }}>
              Status
            </label>
            <select
              value={status}
              onChange={(e: ChangeEvent<HTMLSelectElement>) => setStatus(e.target.value as ProjectStatus)}
              disabled={loading}
              style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border-color)",
                backgroundColor: "var(--bg-color)",
                color: "var(--text-primary)",
                fontSize: "16px",
                outline: "none",
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="btn-secondary"
              style={{ flex: 1 }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ flex: 1 }}
            >
              {loading ? (
                <>
                  <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} />
                  <span>{isEditing ? "Saving..." : "Creating..."}</span>
                </>
              ) : (
                isEditing ? "Save Changes" : "Create Project"
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}