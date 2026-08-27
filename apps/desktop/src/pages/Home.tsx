import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Flame, BookOpen } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  computeMegaAvg,
  isScheduledOn,
  timeOfDayGreeting,
  todayInTimezone,
  yesterdayInTimezone,
  dayStartInstant,
  dayEndInstant,
  dayNoonInstant,
  Motion,
  type Routine,
  type RoutineInsert,
  type RoutineUpdate,
  type RoutineCategory,
  type RoutineLog,
  type Todo,
  type Streak,
} from "@trax/core";
import { useSupabase } from "../hooks/useSupabase";
import { useAuth } from "../hooks/useAuth";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { ProgressRing } from "../components/ProgressRing";
import { MorphCheckbox } from "../components/MorphCheckbox";
import { RoutineForm } from "../components/RoutineForm";

const TZ = "Asia/Kolkata";

type DayKey = "today" | "yesterday";

function dateFor(day: DayKey): string {
  return day === "today" ? todayInTimezone(TZ) : yesterdayInTimezone(TZ);
}

function formatDisplayDate(dateISO: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(new Date(dateISO + "T12:00:00"));
}

export function Home() {
  const supabase = useSupabase();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [selectedDay, setSelectedDay] = useState<DayKey>("today");
  const [showForm, setShowForm] = useState(false);
  const [editingRoutine, setEditingRoutine] = useState<Routine | null>(null);

  const selectedDate = dateFor(selectedDay);
  const prevDate = dateFor(selectedDay === "today" ? "yesterday" : "today");

  // --- Queries ---------------------------------------------------------------

  const { data: categories = [] } = useQuery({
    queryKey: ["routine-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("routine_categories")
        .select("*")
        .order("position", { ascending: true });
      if (error) throw error;
      return data as RoutineCategory[];
    },
  });

  const { data: routines, isLoading: loadingRoutines } = useQuery({
    queryKey: ["routines"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("routines")
        .select("*, category:routine_categories(name)")
        .eq("is_active", true)
        .order("time_of_day", { ascending: true, nullsFirst: false });
      if (error) throw error;
      return data as (Routine & { category: { name: string } | null })[];
    },
  });

  // Logs for BOTH the selected day and the day before it (streak grace)
  const { data: logs } = useQuery({
    queryKey: ["routine-logs", selectedDate],
    queryFn: async () => {
      const start = dayStartInstant(prevDate, TZ);
      const end = dayEndInstant(selectedDate, TZ);
      const { data, error } = await supabase
        .from("routine_logs")
        .select("*")
        .gte("completed_at", start)
        .lt("completed_at", end);
      if (error) throw error;
      return data as RoutineLog[];
    },
  });

  const { data: todosDueToday = [] } = useQuery({
    queryKey: ["todos-due", selectedDate],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("todos")
        .select("*")
        .eq("due_date", selectedDate);
      if (error) throw error;
      return data as Todo[];
    },
  });

  const { data: streaks = [] } = useQuery({
    queryKey: ["streaks"],
    queryFn: async () => {
      const { data, error } = await supabase.from("streaks").select("*");
      if (error) throw error;
      return data as Streak[];
    },
  });

  // --- Derived ----------------------------------------------------------------

  const scheduledToday = useMemo(
    () =>
      (routines || []).filter((r) => isScheduledOn(r.frequency, r.custom_days, selectedDate)),
    [routines, selectedDate]
  );

  const logsByRoutine = useMemo(() => {
    const map = new Map<string, RoutineLog[]>();
    for (const log of logs || []) {
      const arr = map.get(log.routine_id) ?? [];
      arr.push(log);
      map.set(log.routine_id, arr);
    }
    return map;
  }, [logs]);

  const isCompleted = (routineId: string) =>
    (logsByRoutine.get(routineId) || []).length > 0;


  const completedCount = scheduledToday.filter((r) => isCompleted(r.id)).length;

  const todosDone = todosDueToday.filter((t) => t.is_completed).length;

  const megaAvg = computeMegaAvg({
    completedRoutinesToday: completedCount,
    totalScheduledRoutinesToday: scheduledToday.length,
    completedTodosDueToday: todosDone,
    totalTodosDueToday: todosDueToday.length,
  });

  /** Per-category completion % for the selected day */
  const categoryStats = useMemo(() => {
    return categories
      .map((cat) => {
        const inCat = scheduledToday.filter((r) => r.category_id === cat.id);
        const done = inCat.filter((r) => isCompleted(r.id)).length;
        return {
          ...cat,
          total: inCat.length,
          done,
          percent: inCat.length === 0 ? 0 : Math.round((done / inCat.length) * 100),
        };
      })
      .filter((c) => c.total > 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categories, scheduledToday, logs]);

  // Group rows by category for the main list; uncategorised last
  const groupedRows = useMemo(() => {
    const groups = new Map<string, typeof scheduledToday>();
    for (const cat of categories) {
      const rows = scheduledToday.filter((r) => r.category_id === cat.id);
      if (rows.length) groups.set(cat.name, rows);
    }
    const orphans = scheduledToday.filter((r) => !r.category_id);
    if (orphans.length) groups.set("Uncategorised", orphans);
    return [...groups.entries()];
  }, [categories, scheduledToday]);

  // --- Mutations --------------------------------------------------------------

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ["routines"] });
    queryClient.invalidateQueries({ queryKey: ["routine-logs"] });
    queryClient.invalidateQueries({ queryKey: ["todos-due"] });
    queryClient.invalidateQueries({ queryKey: ["streaks"] });
    queryClient.invalidateQueries({ queryKey: ["heatmap"] });
  };

  const toggleComplete = useMutation({
    mutationFn: async ({ routineId, completed }: { routineId: string; completed: boolean }) => {
      if (!user) throw new Error("Not logged in");

      if (completed) {
        // Un-complete: remove this routine's logs within selected day's window
        const start = dayStartInstant(selectedDate, TZ);
        const end = dayEndInstant(selectedDate, TZ);
        const { error } = await supabase
          .from("routine_logs")
          .delete()
          .eq("routine_id", routineId)
          .gte("completed_at", start)
          .lt("completed_at", end);
        if (error) throw error;
      } else {
        // Complete. For yesterday, anchor timestamp inside that day so the
        // log lands on the right calendar day; mark as logged late.
        const completedAt =
          selectedDay === "today" ? undefined : dayNoonInstant(selectedDate, TZ);
        const { error } = await supabase.from("routine_logs").insert({
          routine_id: routineId,
          user_id: user.id,
          ...(completedAt ? { completed_at: completedAt } : {}),
          logged_late: selectedDay !== "today",
        });
        if (error) throw error;
      }
    },
    onSuccess: invalidateAll,
    onError: (error) => {
      alert(`Failed: ${error instanceof Error ? error.message : JSON.stringify(error)}`);
    },
  });

  const createRoutine = useMutation({
    mutationFn: async ({
      data,
      newCategoryName,
    }: {
      data: RoutineInsert | RoutineUpdate;
      newCategoryName: string | null;
    }) => {
      if (!user) throw new Error("Not logged in");

      let categoryId = (data as RoutineInsert).category_id || null;

      if (newCategoryName) {
        const { data: cat, error: catErr } = await supabase
          .from("routine_categories")
          .insert({ user_id: user.id, name: newCategoryName })
          .select()
          .single();
        if (catErr) throw catErr;
        categoryId = cat.id;
      }

      const { data: result, error } = await supabase
        .from("routines")
        .insert({ ...(data as RoutineInsert), user_id: user.id, category_id: categoryId })
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      invalidateAll();
      queryClient.invalidateQueries({ queryKey: ["routine-categories"] });
      setShowForm(false);
    },
    onError: (error) => {
      alert(`Failed to create routine: ${error instanceof Error ? error.message : JSON.stringify(error)}`);
    },
  });

  const updateRoutine = useMutation({
    mutationFn: async ({
      id,
      data,
      newCategoryName,
    }: {
      id: string;
      data: RoutineInsert | RoutineUpdate;
      newCategoryName: string | null;
    }) => {
      let categoryId = (data as RoutineUpdate).category_id;

      if (newCategoryName) {
        if (!user) throw new Error("Not logged in");
        const { data: cat, error: catErr } = await supabase
          .from("routine_categories")
          .insert({ user_id: user.id, name: newCategoryName })
          .select()
          .single();
        if (catErr) throw catErr;
        categoryId = cat.id;
      }

      const { error } = await supabase
        .from("routines")
        .update({ ...data, category_id: categoryId })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      invalidateAll();
      queryClient.invalidateQueries({ queryKey: ["routine-categories"] });
      setEditingRoutine(null);
    },
    onError: (error) => {
      alert(`Failed to update routine: ${error instanceof Error ? error.message : JSON.stringify(error)}`);
    },
  });

  const deleteRoutine = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("routines").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidateAll,
    onError: (error) => {
      alert(`Failed to delete: ${error instanceof Error ? error.message : JSON.stringify(error)}`);
    },
  });

  // --- Render helpers -----------------------------------------------------------

  const hour = new Date().getHours();
  const greeting = timeOfDayGreeting(hour);
  const firstName =
    user?.user_metadata?.full_name?.split(" ")[0] ||
    user?.email?.split("@")[0] ||
    "";

  const renderRow = (routine: Routine & { category: { name: string } | null }) => {
    const done = isCompleted(routine.id);
    const streak = streaks.find((s) => s.routine_id === routine.id);
    const loggedLate =
      done &&
      (logsByRoutine.get(routine.id) || []).some(
        (l) => selectedDay !== "today" && l.logged_late
      );

    return (
      <motion.div
        key={routine.id}
        layout
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={Motion.spring}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          padding: "14px 18px",
          backgroundColor: "var(--bg-secondary)",
          borderRadius: "var(--radius-lg)",
          border: "1px solid var(--border-color)",
        }}
      >
        <MorphCheckbox
          checked={done}
          onChange={() =>
            toggleComplete.mutate({ routineId: routine.id, completed: done })
          }
          disabled={toggleComplete.isPending}
        />

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span
              style={{
                fontSize: 16,
                color: done ? "var(--text-secondary)" : "var(--text-primary)",
                textDecoration: done ? "line-through" : "none",
              }}
            >
              {routine.name}
            </span>
            {routine.is_must_do && !done && (
              <span style={{ color: "var(--accent-color)", fontSize: 11, fontWeight: 600 }}>MUST</span>
            )}
            {routine.type === "book" && (
              <BookOpen size={13} color="var(--text-tertiary)" />
            )}
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 2 }}>
            {routine.category?.name && (
              <span style={{ fontSize: 12, color: "var(--text-tertiary)" }}>
                {routine.category.name}
              </span>
            )}
            {loggedLate && (
              <span style={{ fontSize: 12, color: "var(--text-secondary)", fontStyle: "italic" }}>
                logged late
              </span>
            )}
          </div>
        </div>

        {/* streak — mono numeral */}
        {(streak?.current_streak ?? 0) > 0 && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              color: "var(--accent-color)",
              flexShrink: 0,
            }}
            title={`${streak?.current_streak} day streak`}
          >
            <Flame size={14} />
            <span className="num" style={{ fontSize: 14, fontWeight: 500 }}>
              {streak?.current_streak}
            </span>
          </div>
        )}

        {routine.time_of_day && (
          <span
            className="num"
            style={{ fontSize: 13, color: "var(--text-tertiary)", flexShrink: 0 }}
          >
            {routine.time_of_day.slice(0, 5)}
          </span>
        )}

        <div style={{ display: "flex", gap: 2, flexShrink: 0 }}>
          <button
            onClick={() => { setEditingRoutine(routine); setShowForm(true); }}
            style={{ padding: 6, borderRadius: 8, color: "var(--text-tertiary)", border: "none", background: "transparent", cursor: "pointer" }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "var(--text-primary)"; e.currentTarget.style.background = "var(--bg-tertiary)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-tertiary)"; e.currentTarget.style.background = "transparent"; }}
            aria-label="Edit routine"
          >
            <Pencil size={15} />
          </button>
          <button
            onClick={() => {
              if (!confirm(`Delete "${routine.name}"?`)) return;
              deleteRoutine.mutate(routine.id);
            }}
            style={{ padding: 6, borderRadius: 8, color: "var(--text-tertiary)", border: "none", background: "transparent", cursor: "pointer" }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "var(--error-color)"; e.currentTarget.style.background = "rgba(255,69,58,0.08)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-tertiary)"; e.currentTarget.style.background = "transparent"; }}
            aria-label="Delete routine"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </motion.div>
    );
  };

  if (loadingRoutines) {
    return (
      <div style={{ display: "flex", flex: 1, alignItems: "center", justifyContent: "center" }}>
        <LoadingSpinner size={40} />
      </div>
    );
  }

  return (
    <div>
      {/* ---------- Header ---------- */}
      <header style={{ marginBottom: 32 }}>
        <p style={{ fontSize: 12, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.06em" }} className="num">
          {formatDisplayDate(selectedDate)}
        </p>
        <h1 style={{ fontSize: 28, fontWeight: 600, marginTop: 4, letterSpacing: "-0.02em" }}>
          Good {greeting}{firstName ? `, ${firstName}` : ""}
        </h1>
      </header>

      {/* ---------- Overview split: categories | mega ring ---------- */}
      <section
        style={{
          display: "grid",
          gridTemplateColumns: "1fr auto",
          gap: 24,
          alignItems: "stretch",
          marginBottom: 36,
        }}
      >
        {/* Left: scrollable category rings */}
        <div
          style={{
            backgroundColor: "var(--bg-secondary)",
            border: "1px solid var(--border-color)",
            borderRadius: "var(--radius-lg)",
            padding: "16px 20px",
            maxHeight: 220,
            overflowY: "auto",
          }}
        >
          <h3 style={{ fontSize: 12, fontWeight: 500, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>
            Categories
          </h3>
          {categoryStats.length === 0 ? (
            <p style={{ fontSize: 13, color: "var(--text-tertiary)", padding: "8px 0" }}>
              No categorised routines yet.
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {categoryStats.map((cat) => (
                <div key={cat.id} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <ProgressRing progress={cat.percent} radius={14} stroke={2.5} />
                  <span style={{ fontSize: 14, flex: 1 }}>{cat.name}</span>
                  <span className="num" style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                    {cat.done}/{cat.total}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: FIXED mega-average ring */}
        <div
          style={{
            backgroundColor: "var(--bg-secondary)",
            border: "1px solid var(--border-color)",
            borderRadius: "var(--radius-lg)",
            padding: "20px 32px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minWidth: 200,
          }}
        >
          <div style={{ position: "relative", width: 128, height: 128 }}>
            <ProgressRing progress={megaAvg.percent} radius={64} stroke={7} />
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span className="num" style={{ fontSize: 28, fontWeight: 600 }}>
                {megaAvg.percent}
                <span style={{ fontSize: 14 }}>%</span>
              </span>
              <span style={{ fontSize: 11, color: "var(--text-tertiary)" }}>
                {megaAvg.completedTotal}/{megaAvg.scheduledTotal} today
              </span>
            </div>
          </div>
          <span style={{ fontSize: 11, color: "var(--text-secondary)", marginTop: 10, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Overall
          </span>
        </div>
      </section>

      {/* ---------- Today's routines ---------- */}
      <section>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          {/* Date pill selector — today/yesterday only */}
          <div
            style={{
              display: "inline-flex",
              backgroundColor: "var(--bg-secondary)",
              border: "1px solid var(--border-color)",
              borderRadius: "var(--radius-full)",
              padding: 3,
              gap: 2,
            }}
          >
            {(["today", "yesterday"] as DayKey[]).map((day) => {
              const active = selectedDay === day;
              return (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  style={{
                    padding: "6px 14px",
                    borderRadius: "var(--radius-full)",
                    border: "none",
                    fontSize: 13,
                    fontWeight: active ? 600 : 400,
                    backgroundColor: active ? "var(--bg-tertiary)" : "transparent",
                    color: active ? "var(--accent-color)" : "var(--text-tertiary)",
                    cursor: "pointer",
                    transition: "all var(--transition-fast)",
                  }}
                >
                  {day === "today" ? "Today" : formatDisplayDate(prevDate)}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => { setEditingRoutine(null); setShowForm(true); }}
            className="btn-primary"
            style={{ padding: "9px 18px", fontSize: 14 }}
          >
            <Plus size={16} />
            Add Routine
          </button>
        </div>

        {/* Grace-period hint when viewing yesterday */}
        {selectedDay === "yesterday" && (
          <p style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 12 }}>
            You can still check off yesterday. Late entries are marked.
          </p>
        )}

        {scheduledToday.length === 0 ? (
          <div
            style={{
              padding: 40,
              textAlign: "center",
              backgroundColor: "var(--bg-secondary)",
              borderRadius: "var(--radius-lg)",
              border: "1px dashed var(--border-color)",
            }}
          >
            <p style={{ color: "var(--text-secondary)", fontSize: 15 }}>
              Nothing scheduled for {selectedDay === "today" ? "today" : "yesterday"}.
            </p>
            <button
              onClick={() => { setEditingRoutine(null); setShowForm(true); }}
              className="btn-secondary"
              style={{ marginTop: 16 }}
            >
              <Plus size={16} /> Create your first routine
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {groupedRows.map(([groupName, rows]) => (
              <div key={groupName}>
                <h4
                  style={{
                    fontSize: 11,
                    fontWeight: 500,
                    color: "var(--text-tertiary)",
                    textTransform: "uppercase",
                    letterSpacing: "0.07em",
                    margin: "0 0 8px 4px",
                  }}
                >
                  {groupName}
                </h4>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <AnimatePresence>{rows.map(renderRow)}</AnimatePresence>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ---------- Form modal ---------- */}
      <AnimatePresence>
        {showForm && (
          <RoutineForm
            initialData={editingRoutine}
            categories={categories}
            onSubmit={async (data, newCategoryName) => {
              if (editingRoutine) {
                await updateRoutine.mutateAsync({ id: editingRoutine.id, data, newCategoryName });
              } else {
                await createRoutine.mutateAsync({ data, newCategoryName });
              }
            }}
            onClose={() => { setShowForm(false); setEditingRoutine(null); }}
            loading={createRoutine.isPending || updateRoutine.isPending}
          />
        )}
      </AnimatePresence>
    </div>
  );
}