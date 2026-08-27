import { useState, useEffect, FormEvent, ChangeEvent, MouseEvent } from "react";
import { motion } from "framer-motion";
import { X, Loader2 } from "lucide-react";
import {
  Routine,
  RoutineInsert,
  RoutineUpdate,
  RoutineFrequency,
  RoutineCategory,
} from "@trax/core";

interface RoutineFormProps {
  initialData?: Routine | null;
  categories: RoutineCategory[];
  onSubmit: (
    data: RoutineInsert | RoutineUpdate,
    newCategoryName: string | null
  ) => Promise<void>;
  onClose: () => void;
  loading?: boolean;
}

const frequencyOptions: { value: RoutineFrequency; label: string }[] = [
  { value: "daily", label: "Every day" },
  { value: "weekdays", label: "Weekdays" },
  { value: "weekends", label: "Weekends" },
  { value: "custom", label: "Custom days" },
];

const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function RoutineForm({
  initialData,
  categories,
  onSubmit,
  onClose,
  loading = false,
}: RoutineFormProps) {
  const isEditing = !!initialData;

  const [name, setName] = useState(initialData?.name || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [frequency, setFrequency] = useState<RoutineFrequency>(initialData?.frequency || "daily");
  const [timeOfDay, setTimeOfDay] = useState(initialData?.time_of_day || "");
  const [customDays, setCustomDays] = useState<number[]>(initialData?.custom_days || []);
  const [isMustDo, setIsMustDo] = useState(initialData?.is_must_do ?? false);
  const [routineType, setRoutineType] = useState<"standard" | "book">(
    initialData?.type === "book" ? "book" : "standard"
  );
  const [categoryId, setCategoryId] = useState<string>(initialData?.category_id || "");
  const [newCategoryName, setNewCategoryName] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setDescription(initialData.description || "");
      setFrequency(initialData.frequency);
      setTimeOfDay(initialData.time_of_day || "");
      setCustomDays(initialData.custom_days || []);
      setIsMustDo(initialData.is_must_do ?? false);
      setRoutineType(initialData.type === "book" ? "book" : "standard");
      setCategoryId(initialData.category_id || "");
    }
  }, [initialData]);

  const getErrors = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Name is required";
    if (!categoryId && !newCategoryName.trim()) e.category = "Pick a category or create one";
    if (frequency === "custom" && customDays.length === 0) {
      e.custom_days = "Select at least one day";
    }
    return e;
  };

  const isValid = () => Object.keys(getErrors()).length === 0;

  const validate = () => {
    const e = getErrors();
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) return;

    const data = {
      name: name.trim(),
      description: description.trim() || null,
      frequency,
      time_of_day: timeOfDay || null,
      custom_days: frequency === "custom" ? customDays : null,
      is_must_do: isMustDo,
      type: routineType,
      category_id: newCategoryName.trim() ? null : categoryId || null,
    } as RoutineInsert | RoutineUpdate;

    await onSubmit(data, newCategoryName.trim() || null);
  };

  const inputStyle = (hasError?: string): React.CSSProperties => ({
    width: "100%",
    padding: "10px 14px",
    borderRadius: "var(--radius-md)",
    border: `1px solid ${hasError ? "var(--error-color)" : "var(--border-color)"}`,
    backgroundColor: "var(--bg-tertiary)",
    color: "var(--text-primary)",
    fontSize: 14,
    outline: "none",
  });

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
        padding: 20,
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        style={{
          width: "100%",
          maxWidth: 480,
          maxHeight: "90vh",
          overflowY: "auto",
          backgroundColor: "var(--bg-secondary)",
          borderRadius: "var(--radius-lg)",
          border: "1px solid var(--border-color)",
          padding: 24,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h2 style={{ fontSize: 20 }}>{isEditing ? "Edit Routine" : "New Routine"}</h2>
          <button
            onClick={onClose}
            style={{
              padding: 8,
              borderRadius: "var(--radius-md)",
              color: "var(--text-tertiary)",
            }}
            onMouseEnter={(e: MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.color = "var(--text-primary)"; }}
            onMouseLeave={(e: MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.color = "var(--text-tertiary)"; }}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Name */}
          <div>
            <label style={{ fontSize: 12, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>
              Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
              placeholder="Morning run"
              maxLength={120}
              disabled={loading}
              style={inputStyle(errors.name)}
            />
            {errors.name && <p style={{ color: "var(--error-color)", fontSize: 12, marginTop: 4 }}>{errors.name}</p>}
          </div>

          {/* Category — existing or create-new */}
          <div>
            <label style={{ fontSize: 12, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>
              Category *
            </label>
            <div style={{ display: "flex", gap: 8 }}>
              <select
                value={newCategoryName ? "__new__" : categoryId}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => {
                  if (e.target.value === "__new__") {
                    setNewCategoryName(" ");
                    setCategoryId("");
                  } else {
                    setNewCategoryName("");
                    setCategoryId(e.target.value);
                  }
                }}
                disabled={loading}
                style={{ ...inputStyle(errors.category), flex: 1 }}
              >
                <option value="">Select category…</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
                <option value="__new__">+ New category…</option>
              </select>
            </div>
            {newCategoryName && (
              <input
                type="text"
                value={newCategoryName.trim()}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setNewCategoryName(e.target.value)}
                placeholder="New category name"
                autoFocus
                maxLength={60}
                disabled={loading}
                style={{ ...inputStyle(), marginTop: 8 }}
              />
            )}
            {errors.category && <p style={{ color: "var(--error-color)", fontSize: 12, marginTop: 4 }}>{errors.category}</p>}
          </div>

          {/* Type */}
          <div>
            <label style={{ fontSize: 12, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>
              Type
            </label>
            <div style={{ display: "flex", gap: 8 }}>
              {(["standard", "book"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setRoutineType(t)}
                  disabled={loading}
                  style={{
                    flex: 1,
                    padding: "10px 0",
                    borderRadius: "var(--radius-md)",
                    border: `1px solid ${routineType === t ? "var(--accent-color)" : "var(--border-color)"}`,
                    backgroundColor: routineType === t ? "var(--accent-color-dim)" : "var(--bg-tertiary)",
                    color: routineType === t ? "var(--accent-color)" : "var(--text-secondary)",
                    fontSize: 13,
                    fontWeight: 500,
                    textTransform: "capitalize",
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Frequency */}
          <div>
            <label style={{ fontSize: 12, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>
              Frequency
            </label>
            <select
              value={frequency}
              onChange={(e: ChangeEvent<HTMLSelectElement>) => setFrequency(e.target.value as RoutineFrequency)}
              disabled={loading}
              style={inputStyle()}
            >
              {frequencyOptions.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          {frequency === "custom" && (
            <div>
              <div style={{ display: "flex", gap: 6 }}>
                {dayLabels.map((label, index) => {
                  const on = customDays.includes(index);
                  return (
                    <motion.button
                      key={index}
                      type="button"
                      whileTap={{ scale: 0.9 }}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      onClick={() =>
                        setCustomDays((prev) =>
                          prev.includes(index) ? prev.filter((d) => d !== index) : [...prev, index].sort()
                        )
                      }
                      disabled={loading}
                      style={{
                        flex: 1,
                        padding: "8px 0",
                        borderRadius: "var(--radius-md)",
                        border: `1px solid ${on ? "var(--accent-color)" : "var(--border-color)"}`,
                        backgroundColor: on ? "var(--accent-color-dim)" : "var(--bg-tertiary)",
                        color: on ? "var(--accent-color)" : "var(--text-secondary)",
                        fontSize: 12,
                        fontWeight: 500,
                      }}
                    >
                      {label}
                    </motion.button>
                  );
                })}
              </div>
              {errors.custom_days && <p style={{ color: "var(--error-color)", fontSize: 12, marginTop: 4 }}>{errors.custom_days}</p>}
            </div>
          )}

          {/* Time + Must-do row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 16, alignItems: "end" }}>
            <div>
              <label style={{ fontSize: 12, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>
                Time of day
              </label>
              <input
                type="time"
                value={timeOfDay}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setTimeOfDay(e.target.value)}
                disabled={loading}
                style={inputStyle()}
              />
            </div>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                cursor: "pointer",
                paddingBottom: 10,
                fontSize: 13,
                color: isMustDo ? "var(--accent-color)" : "var(--text-secondary)",
                userSelect: "none",
              }}
            >
              <input
                type="checkbox"
                checked={isMustDo}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setIsMustDo(e.target.checked)}
                disabled={loading}
                style={{ accentColor: "var(--accent-color)", width: 16, height: 16 }}
              />
              Must do
            </label>
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
            <button type="button" onClick={onClose} disabled={loading} className="btn-secondary" style={{ flex: 1 }}>
              Cancel
            </button>
            <button type="submit" disabled={loading || !isValid()} className="btn-primary" style={{ flex: 1 }}>
              {loading ? (
                <>
                  <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
                  <span>{isEditing ? "Saving…" : "Creating…"}</span>
                </>
              ) : isEditing ? "Save Changes" : "Create Routine"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}