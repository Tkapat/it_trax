import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit, Trash2 } from "lucide-react";
import { useSupabase } from "../hooks/useSupabase";
import { useAuth } from "../hooks/useAuth";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { ProgressRing } from "../components/ProgressRing";
import { motion, AnimatePresence } from "framer-motion";
import { Flame } from "lucide-react";
import { RoutineForm } from "../components/RoutineForm";
import { Routine, RoutineInsert, RoutineUpdate, GetTodayRoutineRow } from "@trax/core";

export function Home() {
  const supabase = useSupabase();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showRoutineForm, setShowRoutineForm] = useState(false);
  const [editingRoutine, setEditingRoutine] = useState<Routine | null>(null);

  const todayStr = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date());

  const { data: routines, isLoading: loadingRoutines } = useQuery({
    queryKey: ["today-routines"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_today_routines");
      if (error) throw error;
      return data as GetTodayRoutineRow[];
    },
  });

  const { data: streaks } = useQuery({
    queryKey: ["streaks"],
    queryFn: async () => {
      const { data, error } = await supabase.from("streaks").select("*");
      if (error) throw error;
      return data;
    },
  });

  const createRoutineMutation = useMutation({
    mutationFn: async (data: RoutineInsert) => {
      if (!user) throw new Error("Not logged in");
      const { data: result, error } = await supabase
        .from("routines")
        .insert({ ...data, user_id: user.id })
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["today-routines"] });
      setShowRoutineForm(false);
    },
    onError: (error) => {
      console.error("Failed to create routine:", error);
      alert(`Failed to create routine: ${error instanceof Error ? error.message : JSON.stringify(error)}`);
    },
  });

  const updateRoutineMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: RoutineUpdate }) => {
      const { data: result, error } = await supabase
        .from("routines")
        .update(data)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["today-routines"] });
      setEditingRoutine(null);
    },
    onError: (error) => {
      console.error("Failed to update routine:", error);
      alert(`Failed to update routine: ${error instanceof Error ? error.message : JSON.stringify(error)}`);
    },
  });

  const deleteRoutineMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("routines").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["today-routines"] });
    },
    onError: (error) => {
      console.error("Failed to delete routine:", error);
      alert(`Failed to delete routine: ${error instanceof Error ? error.message : JSON.stringify(error)}`);
    },
  });

  const toggleCompleteMutation = useMutation({
    mutationFn: async ({ routineId, completed }: { routineId: string; completed: boolean }) => {
      if (!user) throw new Error("Not logged in");

      if (completed) {
        const { data: logs } = await supabase
          .from("routine_logs")
          .select("id")
          .eq("routine_id", routineId)
          .eq("user_id", user.id)
          .order("completed_at", { ascending: false })
          .limit(1);

        if (logs && logs.length > 0) {
          await supabase.from("routine_logs").delete().eq("id", logs[0].id);
        }
      } else {
        await supabase.from("routine_logs").insert({
          routine_id: routineId,
          user_id: user.id,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["today-routines"] });
      queryClient.invalidateQueries({ queryKey: ["streaks"] });
    },
  });

  const handleCreate = async (data: RoutineInsert | RoutineUpdate) => {
    await createRoutineMutation.mutateAsync(data as RoutineInsert);
  };

  const handleUpdate = async (data: RoutineInsert | RoutineUpdate) => {
    if (editingRoutine) {
      await updateRoutineMutation.mutateAsync({ id: editingRoutine.id, data: data as RoutineUpdate });
    }
  };

  const handleDelete = async (routine: GetTodayRoutineRow) => {
    if (!confirm(`Delete "${routine.name}"? This action cannot be undone.`)) return;
    await deleteRoutineMutation.mutateAsync(routine.routine_id);
  };

  const handleEdit = (routine: GetTodayRoutineRow) => {
    // Convert GetTodayRoutineRow to Routine for the form
    const routineForForm: Routine = {
      id: routine.routine_id,
      user_id: user?.id || '',
      name: routine.name,
      description: routine.description,
      frequency: routine.frequency,
      time_of_day: routine.time_of_day,
      custom_days: routine.frequency === 'custom' ? [] : null,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setEditingRoutine(routineForForm);
    setShowRoutineForm(true);
  };

  if (loadingRoutines) {
    return (
      <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <LoadingSpinner size={40} />
      </div>
    );
  }

  const routinesList = routines || [];
  const total = routinesList.length;
  const completed = routinesList.filter(r => r.completed_today).length;
  const progressPercent = total === 0 ? 0 : Math.round((completed / total) * 100);

  return (
    <div>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px' }}>
        <div>
          <h2 style={{ color: 'var(--text-secondary)', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
            {todayStr}
          </h2>
          <h1 style={{ fontSize: '32px', fontWeight: 700, letterSpacing: '-0.02em' }}>
            Good morning, {user?.user_metadata?.full_name?.split(' ')[0] || user?.email?.split('@')[0]}
          </h1>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '20px', fontWeight: 600 }}>{progressPercent}%</div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Completed</div>
          </div>
          <ProgressRing progress={progressPercent} radius={28} stroke={4} />
          <button onClick={() => { setEditingRoutine(null); setShowRoutineForm(true); }} className="btn-primary" style={{ marginLeft: '16px' }}>
            <Plus size={18} />
            <span>New Routine</span>
          </button>
        </div>
      </header>

      <section>
        <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>Today&apos;s Routines</h3>
        {total === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--border-color)' }}>
            <p style={{ color: 'var(--text-secondary)' }}>No routines scheduled for today.</p>
            <button onClick={() => { setEditingRoutine(null); setShowRoutineForm(true); }} className="btn-primary" style={{ marginTop: '16px' }}>
              <Plus size={18} />
              <span>Create Routine</span>
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <AnimatePresence>
              {routinesList.map(routine => {
                const streak = streaks?.find(s => s.routine_id === routine.routine_id);
                
                return (
                  <motion.div
                    key={routine.routine_id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      padding: '16px 20px',
                      backgroundColor: 'var(--bg-secondary)',
                      borderRadius: 'var(--radius-lg)',
                      border: '1px solid var(--border-color)',
                      cursor: 'pointer',
                      transition: 'border-color var(--transition-fast)',
                    }}
                    whileHover={{ borderColor: 'var(--text-tertiary)' }}
                  >
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <ProgressRing 
                        progress={routine.completed_today ? 100 : 0} 
                        radius={16} 
                        stroke={2} 
                        color={routine.completed_today ? 'var(--accent-color)' : 'var(--border-color)'}
                        bgColor="var(--border-color)"
                      />
                    </div>
                    
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h4 style={{ 
                        fontSize: '16px', 
                        fontWeight: 500,
                        color: routine.completed_today ? 'var(--text-secondary)' : 'var(--text-primary)',
                        textDecoration: routine.completed_today ? 'line-through' : 'none',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}>
                        {routine.name}
                      </h4>
                      {routine.description && (
                        <p style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>{routine.description}</p>
                      )}
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: streak && streak.current_streak > 0 ? 'var(--accent-color)' : 'var(--text-tertiary)' }}>
                      <Flame size={16} />
                      <span style={{ fontSize: '14px', fontWeight: 600 }}>
                        {streak?.current_streak || 0}
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', marginLeft: 'auto' }}>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleEdit(routine); }}
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
                        aria-label="Edit routine"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(routine); }}
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
                        aria-label="Delete routine"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div
                      style={{
                        flex: 1,
                        cursor: 'pointer',
                      }}
                      onClick={() => toggleCompleteMutation.mutate({ 
                        routineId: routine.routine_id, 
                        completed: routine.completed_today 
                      })}
                    />
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </section>

      <AnimatePresence>
        {(showRoutineForm || editingRoutine) && (
          <RoutineForm
            initialData={editingRoutine}
            onSubmit={editingRoutine ? handleUpdate : handleCreate}
            onClose={() => { setShowRoutineForm(false); setEditingRoutine(null); }}
            loading={createRoutineMutation.isPending || updateRoutineMutation.isPending}
          />
        )}
      </AnimatePresence>
    </div>
  );
}