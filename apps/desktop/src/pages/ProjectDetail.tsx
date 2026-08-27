import { useState, MouseEvent } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, ChevronLeft, ExternalLink, Edit, Trash2 } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { useSupabase } from "../hooks/useSupabase";
import { Project, ProjectUpdate, ProjectMedia, ProjectStatus } from "@trax/core";
import { UpdateFeed } from "../components/UpdateFeed";
import { ProjectForm } from "../components/ProjectForm";

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

export function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const supabase = useSupabase();
  const queryClient = useQueryClient();
  const [showEditForm, setShowEditForm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const { data: project, isLoading: loadingProject } = useQuery({
    queryKey: ["project", id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase.from("projects").select("*").eq("id", id).single();
      if (error) throw error;
      return data as Project;
    },
    enabled: !!id,
  });

  const { data: updates } = useQuery({
    queryKey: ["project-updates", id],
    queryFn: async () => {
      if (!id) return [];
      const { data, error } = await supabase
        .from("project_updates")
        .select("*, project_media(*)")
        .eq("project_id", id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as unknown as (ProjectUpdate & { project_media: ProjectMedia[] })[];
    },
    enabled: !!id,
  });

  const deleteProjectMutation = useMutation({
    mutationFn: async (projectId: string) => {
      const { error } = await supabase.from("projects").delete().eq("id", projectId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      navigate("/projects");
    },
    onError: (error) => {
      console.error("Failed to delete project:", error);
      alert("Failed to delete project. Please try again.");
      setDeleting(false);
    },
  });

  const handleDelete = () => {
    if (!project) return;
    if (!confirm(`Delete "${project.name}"? This will also delete all updates and media. This action cannot be undone.`)) return;
    setDeleting(true);
    deleteProjectMutation.mutate(project.id);
  };

  if (loadingProject) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
        <Loader2 size={40} style={{ animation: "spin 1s linear infinite", color: "var(--accent-color)" }} />
      </div>
    );
  }

  if (!project) {
    return (
      <div style={{ textAlign: "center", padding: "60px" }}>
        <h2 style={{ marginBottom: "16px" }}>Project not found</h2>
        <button onClick={() => navigate("/projects")} className="btn-primary" style={{ marginTop: "16px" }}>
          <ChevronLeft size={16} /> Back to Projects
        </button>
      </div>
    );
  }

  const statusColor = statusColors[project.status] || "var(--text-tertiary)";

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "32px", flexWrap: "wrap" }}>
        <button onClick={() => navigate("/projects")} style={{ padding: "8px", borderRadius: "var(--radius-md)", color: "var(--text-secondary)", backgroundColor: "transparent", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", transition: "all var(--transition-fast)" }} onMouseEnter={(e: MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.color = "var(--text-primary)"; e.currentTarget.style.backgroundColor = "var(--bg-tertiary)"; }} onMouseLeave={(e: MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.color = "var(--text-secondary)"; e.currentTarget.style.backgroundColor = "transparent"; }}>
          <ChevronLeft size={20} />
        </button>
        <div style={{ flex: 1, minWidth: 200 }}>
          <h1 style={{ fontSize: "32px", fontWeight: 700, letterSpacing: "-0.02em", display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
            {project.name}
            <span style={{ fontSize: "12px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", padding: "4px 10px", borderRadius: "var(--radius-full)", backgroundColor: `${statusColor}20`, color: statusColor }}>
              {statusLabels[project.status]}
            </span>
          </h1>
          {project.description && <p style={{ color: "var(--text-secondary)", marginTop: "8px", fontSize: "16px" }}>{project.description}</p>}
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          {project.github_url && (
            <a href={project.github_url} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 12px", borderRadius: "var(--radius-md)", color: "var(--text-secondary)", backgroundColor: "var(--bg-tertiary)", border: "1px solid var(--border-color)", textDecoration: "none", fontSize: "14px", transition: "all var(--transition-fast)" }} onMouseEnter={(e: MouseEvent<HTMLAnchorElement>) => { e.currentTarget.style.color = "var(--accent-color)"; e.currentTarget.style.borderColor = "var(--accent-color)"; }} onMouseLeave={(e: MouseEvent<HTMLAnchorElement>) => { e.currentTarget.style.color = "var(--text-secondary)"; e.currentTarget.style.borderColor = "var(--border-color)"; }}>
              <ExternalLink size={16} />
              <span>View on GitHub</span>
            </a>
          )}
          <button onClick={() => setShowEditForm(true)} style={{ padding: "8px 12px", borderRadius: "var(--radius-md)", color: "var(--text-secondary)", backgroundColor: "var(--bg-tertiary)", border: "1px solid var(--border-color)", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", fontSize: "14px", transition: "all var(--transition-fast)" }} onMouseEnter={(e: MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.color = "var(--text-primary)"; e.currentTarget.style.borderColor = "var(--text-tertiary)"; }} onMouseLeave={(e: MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.color = "var(--text-secondary)"; e.currentTarget.style.borderColor = "var(--border-color)"; }}>
            <Edit size={16} />
            <span>Edit</span>
          </button>
          <button onClick={handleDelete} disabled={deleting} style={{ padding: "8px 12px", borderRadius: "var(--radius-md)", color: "var(--error-color)", backgroundColor: "rgba(255,68,68,0.1)", border: "1px solid var(--error-color)", cursor: deleting ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: "6px", fontSize: "14px", opacity: deleting ? 0.5 : 1, transition: "all var(--transition-fast)" }} onMouseEnter={(e: MouseEvent<HTMLButtonElement>) => { if (!deleting) { e.currentTarget.style.backgroundColor = "rgba(255,68,68,0.2)"; } }} onMouseLeave={(e: MouseEvent<HTMLButtonElement>) => { if (!deleting) { e.currentTarget.style.backgroundColor = "rgba(255,68,68,0.1)"; } }}>
            <Trash2 size={16} />
            <span>Delete</span>
          </button>
        </div>
      </div>

      <UpdateFeed projectId={project.id} initialUpdates={updates || []} />

      <AnimatePresence>
        {showEditForm && (
          <ProjectForm
            initialData={project}
            onSubmit={async (data) => {
              const { error } = await supabase.from("projects").update(data).eq("id", project.id);
              if (error) throw error;
              queryClient.invalidateQueries({ queryKey: ["project", id] });
              queryClient.invalidateQueries({ queryKey: ["projects"] });
            }}
            onClose={() => setShowEditForm(false)}
            loading={false}
          />
        )}
      </AnimatePresence>
    </div>
  );
}