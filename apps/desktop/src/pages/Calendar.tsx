import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSupabase } from "../hooks/useSupabase";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

function getMonthBounds(date: Date) {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  
  // Format as YYYY-MM-DD
  const format = (d: Date) => d.toISOString().split('T')[0];
  
  return {
    start_date: format(start),
    end_date: format(end),
    monthName: new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(start)
  };
}

export function Calendar() {
  const supabase = useSupabase();
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const { start_date, end_date, monthName } = getMonthBounds(currentDate);

  const { data: heatmap, isLoading } = useQuery({
    queryKey: ["heatmap", start_date, end_date],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_heatmap_range", {
        start_date,
        end_date
      });
      if (error) throw error;
      return data;
    },
  });

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  return (
    <div>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 700, letterSpacing: '-0.02em' }}>Calendar</h1>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button onClick={prevMonth} style={{ padding: '8px', color: 'var(--text-secondary)' }}>
            <ChevronLeft size={20} />
          </button>
          <span style={{ fontSize: '16px', fontWeight: 600, minWidth: '140px', textAlign: 'center' }}>
            {monthName}
          </span>
          <button onClick={nextMonth} style={{ padding: '8px', color: 'var(--text-secondary)' }}>
            <ChevronRight size={20} />
          </button>
        </div>
      </header>

      {isLoading ? (
        <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
          <LoadingSpinner size={40} />
        </div>
      ) : (
        <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
          <div className="heatmap-grid" style={{ marginBottom: '8px' }}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} style={{ textAlign: 'center', fontSize: '12px', color: 'var(--text-tertiary)', paddingBottom: '8px' }}>
                {day}
              </div>
            ))}
          </div>
          
          <div className="heatmap-grid">
            {/* Pad the start of the month to the correct day of week */}
            {Array.from({ length: new Date(start_date).getDay() }).map((_, i) => (
              <div key={`empty-${i}`} style={{ aspectRatio: '1', borderRadius: 'var(--radius-sm)' }} />
            ))}
            
            {heatmap?.map((day, i) => {
              // completion_ratio is 0..1
              const ratio = day.completion_ratio || 0;
              // Map ratio to an opacity for the cyan color. Minimum 0.1 for empty, max 1.
              let bg = 'var(--bg-tertiary)';
              let border = '1px solid var(--border-color)';
              
              if (ratio > 0) {
                // If it's a perfect 1 (100%), full cyan. Otherwise scaled opacity.
                const opacity = ratio === 1 ? 1 : Math.max(0.3, ratio);
                bg = `rgba(255, 184, 0, ${opacity})`;
                border = '1px solid rgba(255, 184, 0, 0.5)';
              }

              return (
                <motion.div
                  key={day.local_date}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.01 }}
                  title={`${day.local_date}: ${day.completion_count} completed`}
                  style={{
                    aspectRatio: '1',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: bg,
                    border,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    fontSize: '12px',
                    color: ratio > 0.5 ? '#000' : 'var(--text-secondary)',
                    fontWeight: 600,
                  }}
                  whileHover={{ scale: 1.1, zIndex: 10 }}
                >
                  {new Date(day.local_date).getDate()}
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
