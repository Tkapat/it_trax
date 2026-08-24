import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSupabase } from "../hooks/useSupabase";
import { useAuth } from "../hooks/useAuth";
import { Project, ProjectInsert, ProjectUpdate } from "@trax/core";
import { ProjectCard } from "../components/ProjectCard";
import { ProjectForm } from "../components/ProjectForm";

export function Projects() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const { data: projects, isLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const { data, error } = await supabase.from("projects").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as Project[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: ProjectInsert) => {
      if (!user) throw new Error("Not logged in");
      const { data: result, error } = await supabase
        .from("projects")
        .insert({ ...data, user_id: user.id })
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      setShowForm(false);
    },
    onError: (error) => {
      console.error("Failed to create project:", error);
      alert(`Failed to create project: ${error instanceof Error ? error.message : JSON.stringify(error)}`);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (vars: { id: string; data: ProjectUpdate }) => {
      // @ts-expect-error - TypeScript incorrectly resolves ProjectUpdate to project_updates table type
      const { data: result, error } = await supabase.from("projects").update(vars.data).eq("id", vars.id).select().single();
      if (error) throw error;
      return result as Project;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      setEditingProject(null);
    },
    onError: (error) => {
      console.error("Failed to update project:", error);
      alert("Failed to update project. Please try again.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("projects").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
    onError: (error) => {
      console.error("Failed to delete project:", error);
      alert("Failed to delete project. Please try again.");
    },
  });

  const handleCreate = async (data: ProjectInsert | ProjectUpdate) => {
    await createMutation.mutateAsync(data as ProjectInsert);
  };

  const handleUpdate = async (data: ProjectInsert | ProjectUpdate) => {
    if (editingProject) {
      await updateMutation.mutateAsync({ id: editingProject.id, data: data as ProjectUpdate });
    }
  };

  const handleDelete = async (project: Project) => {
    if (!confirm(`Delete "${project.name}"? This action cannot be undone.`)) return;
    await deleteMutation.mutateAsync(project.id);
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setShowForm(true);
  };

  const handleOpen = (project: Project) => {
    window.location.href = `/projects/${project.id}`;
  };

  const projectsList = projects || [];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
        <div>
          <h1 style={{ fontSize: "32px", fontWeight: 700, letterSpacing: "-0.02em" }}>Projects</h1>
          <p style={{ color: "var(--text-secondary)", marginTop: "4px" }}>Track your projects and progress</p>
        </div>
        <button onClick={() => { setEditingProject(null); setShowForm(true); }} className="btn-primary">
          <Plus size={18} />
          <span>New Project</span>
        </button>
      </div>

      {isLoading ? (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "60px" }}>
          <Loader2 size={40} style={{ animation: "spin 1s linear infinite", color: "var(--accent-color)" }} />
        </div>
      ) : projectsList.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 40px", backgroundColor: "var(--bg-secondary)", borderRadius: "var(--radius-lg)", border: "1px dashed var(--border-color)" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>📁</div>
          <h3 style={{ fontSize: "20px", fontWeight: 600, marginBottom: "8px" }}>No projects yet</h3>
          <p style={{ color: "var(--text-secondary)", marginBottom: "24px" }}>Create your first project to start tracking</p>
          <button onClick={() => { setEditingProject(null); setShowForm(true); }} className="btn-primary">
            <Plus size={18} />
            <span>Create Project</span>
          </button>
        </div>
      ) : (
        <AnimatePresence>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "20px" }}>
            {projectsList.map((project, index) => (
              <motion.div key={project.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
                <ProjectCard
                  project={project}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onOpen={handleOpen}
                />
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      )}

      <AnimatePresence>
        {(showForm || editingProject) && (
          <ProjectForm
            initialData={editingProject}
            onSubmit={editingProject ? handleUpdate : handleCreate}
            onClose={() => { setShowForm(false); setEditingProject(null); }}
            loading={createMutation.isPending || updateMutation.isPending}
          />
        )}
      </AnimatePresence>
    </div>
  );
}