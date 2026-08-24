import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Loader2, AlertCircle, Calendar, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSupabase } from "../hooks/useSupabase";
import { useAuth } from "../hooks/useAuth";
import { Task, TaskInsert, TaskUpdate, TaskStatus, TaskPriority, Project } from "@trax/core";
import { TaskForm } from "../components/TaskForm";

const statusLabels: Record<TaskStatus, string> = {
  todo: "To Do",
  in_progress: "In Progress",
  done: "Done",
  cancelled: "Cancelled",
};

const statusColors: Record<TaskStatus, string> = {
  todo: "var(--text-tertiary)",
  in_progress: "var(--accent-color)",
  done: "#22c55e",
  cancelled: "var(--error-color)",
};

const priorityLabels: Record<TaskPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
};

const priorityColors: Record<TaskPriority, string> = {
  low: "var(--text-tertiary)",
  medium: "var(--accent-color)",
  high: "#f59e0b",
  urgent: "var(--error-color)",
};

export function Tasks() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "all">("all");

  const { data: tasks, isLoading } = useQuery({
    queryKey: ["tasks", statusFilter],
    queryFn: async () => {
      let query = supabase.from("tasks").select("*").order("created_at", { ascending: false });
      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data as Task[];
    },
  });

  const { data: projects } = useQuery({
    queryKey: ["projects-for-tasks"],
    queryFn: async () => {
      const { data, error } = await supabase.from("projects").select("id, name").order("name");
      if (error) throw error;
      return data as Project[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: TaskInsert) => {
      if (!user) throw new Error("Not logged in");
      const { data: result, error } = await supabase
        .from("tasks")
        .insert({ ...data, user_id: user.id })
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      setShowForm(false);
    },
    onError: (error) => {
      console.error("Failed to create task:", error);
      alert(`Failed to create task: ${error instanceof Error ? error.message : JSON.stringify(error)}`);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: TaskUpdate }) => {
      const { data: result, error } = await supabase.from("tasks").update(data).eq("id", id).select().single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      setEditingTask(null);
    },
    onError: (error) => {
      console.error("Failed to update task:", error);
      alert(`Failed to update task: ${error instanceof Error ? error.message : JSON.stringify(error)}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("tasks").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
    onError: (error) => {
      console.error("Failed to delete task:", error);
      alert(`Failed to delete task: ${error instanceof Error ? error.message : JSON.stringify(error)}`);
    },
  });

  const handleCreate = async (data: TaskInsert | TaskUpdate) => {
    await createMutation.mutateAsync(data as TaskInsert);
  };

  const handleUpdate = async (data: TaskInsert | TaskUpdate) => {
    if (editingTask) {
      await updateMutation.mutateAsync({ id: editingTask.id, data: data as TaskUpdate });
    }
  };

  const handleDelete = async (task: Task) => {
    if (!confirm(`Delete "${task.title}"? This action cannot be undone.`)) return;
    await deleteMutation.mutateAsync(task.id);
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setShowForm(true);
  };

  const toggleStatus = async (task: Task) => {
    const statusOrder: TaskStatus[] = ["todo", "in_progress", "done"];
    const currentIndex = statusOrder.indexOf(task.status);
    const nextStatus = statusOrder[(currentIndex + 1) % statusOrder.length];
    await supabase.from("tasks").update({ status: nextStatus }).eq("id", task.id);
    queryClient.invalidateQueries({ queryKey: ["tasks"] });
  };

  const tasksList = tasks || [];
  const filteredTasks = statusFilter === "all" ? tasksList : tasksList.filter(t => t.status === statusFilter);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ fontSize: "32px", fontWeight: 700, letterSpacing: "-0.02em" }}>Tasks</h1>
          <p style={{ color: "var(--text-secondary)", marginTop: "4px" }}>Manage your tasks and projects</p>
        </div>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as TaskStatus | "all")}
            style={{
              padding: "8px 12px",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border-color)",
              backgroundColor: "var(--bg-color)",
              color: "var(--text-primary)",
              fontSize: "14px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <option value="all">All Statuses</option>
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="done">Done</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <button onClick={() => { setEditingTask(null); setShowForm(true); }} className="btn-primary">
            <Plus size={18} />
            <span>New Task</span>
          </button>
        </div>
      </div>

      {isLoading ? (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "60px" }}>
          <Loader2 size={40} style={{ animation: "spin 1s linear infinite", color: "var(--accent-color)" }} />
        </div>
      ) : filteredTasks.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 40px", backgroundColor: "var(--bg-secondary)", borderRadius: "var(--radius-lg)", border: "1px dashed var(--border-color)" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>✅</div>
          <h3 style={{ fontSize: "20px", fontWeight: 600, marginBottom: "8px" }}>No tasks yet</h3>
          <p style={{ color: "var(--text-secondary)", marginBottom: "24px" }}>Create your first task to get started</p>
          <button onClick={() => { setEditingTask(null); setShowForm(true); }} className="btn-primary">
            <Plus size={18} />
            <span>Create Task</span>
          </button>
        </div>
      ) : (
        <AnimatePresence>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "20px" }}>
            {filteredTasks.map((task, index) => (
              <motion.div key={task.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
                <motion.div
                  style={{
                    backgroundColor: "var(--bg-secondary)",
                    borderRadius: "var(--radius-lg)",
                    border: "1px solid var(--border-color)",
                    padding: "20px",
                    transition: "border-color var(--transition-fast), box-shadow var(--transition-fast)",
                  }}
                  whileHover={{ borderColor: "var(--text-tertiary)", boxShadow: "var(--shadow-md)" }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h3 style={{ fontSize: "18px", fontWeight: 600, marginBottom: "4px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {task.title}
                      </h3>
                      {task.description && (
                        <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginBottom: "8px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                          {task.description}
                        </p>
                      )}
                    </div>
                    <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: 600,
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                          padding: "4px 8px",
                          borderRadius: "var(--radius-full)",
                          backgroundColor: `${statusColors[task.status]}20`,
                          color: statusColors[task.status],
                          cursor: "pointer",
                        }}
                        onClick={() => toggleStatus(task)}
                        title="Click to advance status"
                      >
                        {statusLabels[task.status]}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "12px", borderTop: "1px solid var(--border-color)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: 600,
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                          padding: "4px 8px",
                          borderRadius: "var(--radius-full)",
                          backgroundColor: `${priorityColors[task.priority]}20`,
                          color: priorityColors[task.priority],
                        }}
                      >
                        {priorityLabels[task.priority]}
                      </span>
                      {task.due_date && (
                        <span style={{ fontSize: "13px", color: "var(--text-tertiary)", display: "flex", alignItems: "center", gap: "4px" }}>
                          <Calendar size={14} />
                          {new Date(task.due_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </span>
                      )}
                    </div>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button
                        onClick={() => handleEdit(task)}
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
                        aria-label="Edit task"
                      >
                        <X size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(task)}
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
                        aria-label="Delete task"
                      >
                        <AlertCircle size={16} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      )}

      <AnimatePresence>
        {(showForm || editingTask) && (
          <TaskForm
            initialData={editingTask}
            onSubmit={editingTask ? handleUpdate : handleCreate}
            onClose={() => { setShowForm(false); setEditingTask(null); }}
            loading={createMutation.isPending || updateMutation.isPending}
            projects={projects || []}
          />
        )}
      </AnimatePresence>
    </div>
  );
}