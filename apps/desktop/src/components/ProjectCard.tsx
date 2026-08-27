import { motion } from "framer-motion";
import { Edit, Trash2, ExternalLink } from "lucide-react";
import { Project, ProjectStatus } from "@trax/core";

interface ProjectCardProps {
  project: Project;
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
  onOpen: (project: Project) => void;
}

const statusColors: Record<ProjectStatus, string> = {
  in_progress: "var(--accent-color)",
  on_track: "var(--accent-color)",
  at_risk: "#f59e0b",
  completed: "#22c55e",
};

const statusLabels: Record<ProjectStatus, string> = {
  in_progress: "In Progress",
  on_track: "On Track",
  at_risk: "At Risk",
  completed: "Completed",
};

export function ProjectCard({ project, onEdit, onDelete, onOpen }: ProjectCardProps) {
  const statusColor = statusColors[project.status] || "var(--text-tertiary)";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        backgroundColor: "var(--bg-secondary)",
        borderRadius: "var(--radius-lg)",
        border: "1px solid var(--border-color)",
        padding: "20px",
        cursor: "pointer",
        transition: "border-color var(--transition-fast), box-shadow var(--transition-fast)",
      }}
      whileHover={{ borderColor: "var(--text-tertiary)", boxShadow: "var(--shadow-md)" }}
      onClick={() => onOpen(project)}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{ fontSize: "18px", fontWeight: 600, marginBottom: "4px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {project.name}
          </h3>
          {project.description && (
            <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginBottom: "8px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
              {project.description}
            </p>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
          <span
            style={{
              fontSize: "11px",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              padding: "4px 8px",
              borderRadius: "var(--radius-full)",
              backgroundColor: `${statusColor}20`,
              color: statusColor,
            }}
          >
            {statusLabels[project.status]}
          </span>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "12px", borderTop: "1px solid var(--border-color)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {project.github_url && (
            <a
              href={project.github_url}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "var(--text-tertiary)", transition: "color var(--transition-fast)" }}
              onClick={(e) => e.stopPropagation()}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent-color)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-tertiary)")}
            >
              <ExternalLink size={16} />
            </a>
          )}
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(project); }}
            style={{
              padding: "8px",
              borderRadius: "var(--radius-md)",
              color: "var(--text-tertiary)",
              backgroundColor: "transparent",
              border: "none",
              cursor: "pointer",
              transition: "all var(--transition-fast)",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "var(--text-primary)"; e.currentTarget.style.backgroundColor = "var(--bg-tertiary)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-tertiary)"; e.currentTarget.style.backgroundColor = "transparent"; }}
            aria-label="Edit project"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(project); }}
            style={{
              padding: "8px",
              borderRadius: "var(--radius-md)",
              color: "var(--text-tertiary)",
              backgroundColor: "transparent",
              border: "none",
              cursor: "pointer",
              transition: "all var(--transition-fast)",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "var(--error-color)"; e.currentTarget.style.backgroundColor = "rgba(255,68,68,0.1)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-tertiary)"; e.currentTarget.style.backgroundColor = "transparent"; }}
            aria-label="Delete project"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}