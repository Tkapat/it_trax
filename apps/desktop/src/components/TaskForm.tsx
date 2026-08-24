import { useState, useEffect, FormEvent, ChangeEvent, FocusEvent, MouseEvent } from "react";
import { motion } from "framer-motion";
import { X, Loader2, Calendar } from "lucide-react";
import { Task, TaskInsert, TaskUpdate, TaskStatus, TaskPriority, Project } from "@trax/core";

interface TaskFormProps {
  initialData?: Task | null;
  onSubmit: (data: TaskInsert | TaskUpdate) => Promise<void>;
  onClose: () => void;
  loading?: boolean;
  projects?: Project[];
}

const statusOptions: { value: TaskStatus; label: string }[] = [
  { value: "todo", label: "To Do" },
  { value: "in_progress", label: "In Progress" },
  { value: "done", label: "Done" },
  { value: "cancelled", label: "Cancelled" },
];

const priorityOptions: { value: TaskPriority; label: string }[] = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
];

export function TaskForm({ initialData, onSubmit, onClose, loading = false, projects = [] }: TaskFormProps) {
  const isEditing = !!initialData;
  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [status, setStatus] = useState<TaskStatus>(initialData?.status || "todo");
  const [priority, setPriority] = useState<TaskPriority>(initialData?.priority || "medium");
  const [dueDate, setDueDate] = useState(initialData?.due_date || "");
  const [projectId, setProjectId] = useState(initialData?.project_id || "");
  const [errors, setErrors] = useState<Partial<Record<keyof TaskInsert, string>>>({});

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setDescription(initialData.description || "");
      setStatus(initialData.status);
      setPriority(initialData.priority);
      setDueDate(initialData.due_date || "");
      setProjectId(initialData.project_id || "");
    }
  }, [initialData]);

  const validate = () => {
    const newErrors: Partial<Record<keyof TaskInsert, string>> = {};
    if (!title.trim()) newErrors.title = "Title is required";
    if (title.length > 200) newErrors.title = "Title must be 200 characters or less";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) return;

    const data = {
      title: title.trim(),
      description: description.trim() || null,
      status,
      priority,
      due_date: dueDate || null,
      project_id: projectId || null,
    } as TaskInsert | TaskUpdate;

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
          <h2 style={{ fontSize: "20px", fontWeight: 600 }}>{isEditing ? "Edit Task" : "New Task"}</h2>
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
              Title <span style={{ color: "var(--error-color)" }}>*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
              placeholder="Task title"
              maxLength={200}
              disabled={loading}
              style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: "var(--radius-md)",
                border: `1px solid ${errors.title ? "var(--error-color)" : "var(--border-color)"}`,
                backgroundColor: "var(--bg-color)",
                color: "var(--text-primary)",
                fontSize: "16px",
                outline: "none",
                transition: "border-color var(--transition-fast)",
              }}
              onFocus={(e: FocusEvent<HTMLInputElement>) => { e.currentTarget.style.borderColor = "var(--accent-color)"; }}
              onBlur={(e: FocusEvent<HTMLInputElement>) => { e.currentTarget.style.borderColor = errors.title ? "var(--error-color)" : "var(--border-color)"; }}
            />
            {errors.title && <p style={{ color: "var(--error-color)", fontSize: "12px", marginTop: "4px" }}>{errors.title}</p>}
          </div>

          <div>
            <label style={{ display: "block", fontSize: "14px", color: "var(--text-secondary)", marginBottom: "6px" }}>
              Description
            </label>
            <textarea
              value={description}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
              placeholder="Add details..."
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

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div>
              <label style={{ display: "block", fontSize: "14px", color: "var(--text-secondary)", marginBottom: "6px" }}>
                Status
              </label>
              <select
                value={status}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => setStatus(e.target.value as TaskStatus)}
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

            <div>
              <label style={{ display: "block", fontSize: "14px", color: "var(--text-secondary)", marginBottom: "6px" }}>
                Priority
              </label>
              <select
                value={priority}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => setPriority(e.target.value as TaskPriority)}
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
                {priorityOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div>
              <label style={{ display: "block", fontSize: "14px", color: "var(--text-secondary)", marginBottom: "6px" }}>
                Due Date
              </label>
              <div style={{ position: "relative" }}>
                <Calendar
                  size={18}
                  color="var(--text-tertiary)"
                  style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
                />
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setDueDate(e.target.value)}
                  disabled={loading}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    paddingRight: "40px",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--border-color)",
                    backgroundColor: "var(--bg-color)",
                    color: "var(--text-primary)",
                    fontSize: "16px",
                    outline: "none",
                    cursor: loading ? "not-allowed" : "pointer",
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "14px", color: "var(--text-secondary)", marginBottom: "6px" }}>
                Project (optional)
              </label>
              <select
                value={projectId}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => setProjectId(e.target.value)}
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
                <option value="">None</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
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
                isEditing ? "Save Changes" : "Create Task"
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}