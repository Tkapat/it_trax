import { useState, useEffect, FormEvent, ChangeEvent, FocusEvent, MouseEvent } from "react";
import { motion } from "framer-motion";
import { X, Loader2 } from "lucide-react";
import { Routine, RoutineInsert, RoutineUpdate, RoutineFrequency } from "@trax/core";

interface RoutineFormProps {
  initialData?: Routine | null;
  onSubmit: (data: RoutineInsert | RoutineUpdate) => Promise<void>;
  onClose: () => void;
  loading?: boolean;
}

const frequencyOptions: { value: RoutineFrequency; label: string }[] = [
  { value: "daily", label: "Daily" },
  { value: "weekdays", label: "Weekdays (Mon-Fri)" },
  { value: "weekends", label: "Weekends (Sat-Sun)" },
  { value: "custom", label: "Custom Days" },
];

const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function RoutineForm({ initialData, onSubmit, onClose, loading = false }: RoutineFormProps) {
  const isEditing = !!initialData;
  const [name, setName] = useState(initialData?.name || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [frequency, setFrequency] = useState<RoutineFrequency>(initialData?.frequency || "daily");
  const [timeOfDay, setTimeOfDay] = useState(initialData?.time_of_day || "");
  const [customDays, setCustomDays] = useState<number[]>(initialData?.custom_days || []);
  const [errors, setErrors] = useState<Partial<Record<keyof RoutineInsert, string>>>({});

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setDescription(initialData.description || "");
      setFrequency(initialData.frequency);
      setTimeOfDay(initialData.time_of_day || "");
      setCustomDays(initialData.custom_days || []);
    }
  }, [initialData]);

  const toggleCustomDay = (day: number) => {
    setCustomDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort()
    );
  };

  const validate = () => {
    const newErrors: Partial<Record<keyof RoutineInsert, string>> = {};
    if (!name.trim()) newErrors.name = "Name is required";
    if (name.length > 120) newErrors.name = "Name must be 120 characters or less";
    if (frequency === "custom" && customDays.length === 0) {
      newErrors.custom_days = "Select at least one day for custom frequency";
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
      frequency,
      time_of_day: timeOfDay || null,
      custom_days: frequency === "custom" ? customDays : null,
    } as RoutineInsert | RoutineUpdate;

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
          <h2 style={{ fontSize: "20px", fontWeight: 600 }}>{isEditing ? "Edit Routine" : "New Routine"}</h2>
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
              placeholder="Morning run"
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
              placeholder="Optional description..."
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
              Frequency
            </label>
            <select
              value={frequency}
              onChange={(e: ChangeEvent<HTMLSelectElement>) => setFrequency(e.target.value as RoutineFrequency)}
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
              {frequencyOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "14px", color: "var(--text-secondary)", marginBottom: "6px" }}>
              Time of Day (optional)
            </label>
            <input
              type="time"
              value={timeOfDay}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setTimeOfDay(e.target.value)}
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
                transition: "border-color var(--transition-fast)",
              }}
              onFocus={(e: FocusEvent<HTMLInputElement>) => { e.currentTarget.style.borderColor = "var(--accent-color)"; }}
              onBlur={(e: FocusEvent<HTMLInputElement>) => { e.currentTarget.style.borderColor = "var(--border-color)"; }}
            />
          </div>

          {frequency === "custom" && (
            <div>
              <label style={{ display: "block", fontSize: "14px", color: "var(--text-secondary)", marginBottom: "8px" }}>
                Custom Days <span style={{ color: "var(--error-color)" }}>*</span>
              </label>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {dayLabels.map((label, index) => {
                  const isSelected = customDays.includes(index);
                  return (
                    <button
                      key={index}
                      type="button"
                      onClick={() => toggleCustomDay(index)}
                      disabled={loading}
                      style={{
                        flex: "1 1 calc(14.28% - 8px)",
                        minWidth: "40px",
                        padding: "10px",
                        borderRadius: "var(--radius-md)",
                        border: `2px solid ${isSelected ? "var(--accent-color)" : "var(--border-color)"}`,
                        backgroundColor: isSelected ? "var(--accent-color-dim)" : "var(--bg-color)",
                        color: isSelected ? "var(--accent-color)" : "var(--text-primary)",
                        fontSize: "13px",
                        fontWeight: 600,
                        cursor: loading ? "not-allowed" : "pointer",
                        transition: "all var(--transition-fast)",
                        opacity: loading ? 0.5 : 1,
                      }}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
              {errors.custom_days && <p style={{ color: "var(--error-color)", fontSize: "12px", marginTop: "4px" }}>{errors.custom_days}</p>}
            </div>
          )}

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
                isEditing ? "Save Changes" : "Create Routine"
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}