import React, { useMemo } from 'react';
import { FlowSession } from '../../../types';
import { motion } from 'framer-motion';

interface ActivityHeatmapProps {
  sessions: FlowSession[];
}

export const ActivityHeatmap: React.FC<ActivityHeatmapProps> = ({ sessions }) => {
  const days = 365;
  const now = new Date();
  
  const heatmapData = useMemo(() => {
    const data: Record<string, number> = {};
    
    // Aggregate minutes per day
    sessions.forEach(session => {
      const dateKey = new Date(session.endTime).toDateString();
      data[dateKey] = (data[dateKey] || 0) + session.leadTimeMinutes;
    });

    // Generate last 365 days
    return Array.from({ length: days }).map((_, i) => {
      const date = new Date(now);
      date.setDate(date.getDate() - (days - 1 - i));
      const dateKey = date.toDateString();
      const minutes = data[dateKey] || 0;
      
      // Intensity mapping (0-4)
      // 0: 0 min
      // 1: 1-60 min
      // 2: 61-120 min
      // 3: 121-240 min
      // 4: >240 min
      let intensity = 0;
      if (minutes > 0 && minutes <= 60) intensity = 1;
      else if (minutes > 60 && minutes <= 120) intensity = 2;
      else if (minutes > 120 && minutes <= 240) intensity = 3;
      else if (minutes > 240) intensity = 4;

      return {
        date: dateKey,
        minutes,
        intensity
      };
    });
  }, [sessions]);

  const intensityColors = [
    'bg-neutral-800/30',    // 0
    'bg-blue-500/20',     // 1
    'bg-blue-500/40',     // 2
    'bg-blue-500/70',     // 3
    'bg-blue-500'         // 4
  ];

  return (
    <div className="p-6 rounded-xl border border-neutral-800 bg-neutral-900/30 space-y-6 overflow-hidden">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Activity Heatmap (365 Days)</h3>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-neutral-600 uppercase font-bold">Less</span>
          <div className="flex gap-1">
            {intensityColors.map((color, i) => (
              <div key={i} className={`w-3 h-3 rounded-sm ${color}`} />
            ))}
          </div>
          <span className="text-[10px] text-neutral-600 uppercase font-bold">More</span>
        </div>
      </div>

      <div className="relative overflow-x-auto custom-scrollbar pb-2">
        <div 
          className="grid grid-flow-col gap-2 md:gap-1.5"
          style={{ 
            gridTemplateRows: 'repeat(7, minmax(0, 1fr))',
            gridTemplateColumns: 'repeat(53, minmax(0, 1fr))' 
          }}
        >
          {heatmapData.map((day, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: i * 0.001 }}
              className={`w-3.5 h-3.5 md:w-3 md:h-3 rounded-sm transition-colors cursor-help relative group ${intensityColors[day.intensity]}`}
            >
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-neutral-950 border border-neutral-800 rounded text-[10px] text-neutral-200 whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none z-10 transition-opacity">
                {day.date}: {day.minutes} min
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      
      <div className="flex justify-between text-[10px] text-neutral-600 font-bold uppercase tracking-tight">
        <span>Jan 2025</span>
        <span>Today</span>
      </div>
    </div>
  );
};
