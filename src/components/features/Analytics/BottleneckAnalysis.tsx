
import React, { useMemo } from 'react';
import { FlowSession } from '../../../types';
import { AnalyticFilter } from './Infographics';
import { Icon } from '@iconify/react';
import { subDays, subWeeks, subMonths } from 'date-fns';

interface BottleneckAnalysisProps {
  sessions: FlowSession[];
  filter: AnalyticFilter;
}

export const BottleneckAnalysis: React.FC<BottleneckAnalysisProps> = ({ sessions, filter }) => {
  const filteredSessions = useMemo(() => {
    const now = new Date();
    return sessions.filter(s => {
      const t = new Date(s.endTime).getTime();
      if (filter === 'day') return t >= subDays(now, 7).getTime();
      if (filter === 'week') return t >= subWeeks(now, 12).getTime();
      if (filter === 'month') return t >= subMonths(now, 6).getTime();
      return true;
    });
  }, [sessions, filter]);

  const totals = filteredSessions.reduce((acc, s) => {
    acc.thinking += s.bottleneck.thinking;
    acc.coding += s.bottleneck.coding;
    acc.debugging += s.bottleneck.debugging;
    acc.waiting += s.bottleneck.waiting;
    return acc;
  }, { thinking: 0, coding: 0, debugging: 0, waiting: 0 });

  const totalPoints = totals.thinking + totals.coding + totals.debugging + totals.waiting || 1;
  const getPercent = (val: number) => Math.round((val / totalPoints) * 100);

  const data = [
    { label: 'Thinking', value: totals.thinking, percent: getPercent(totals.thinking) },
    { label: 'Coding', value: totals.coding, percent: getPercent(totals.coding) },
    { label: 'Debugging', value: totals.debugging, percent: getPercent(totals.debugging) },
    { label: 'Waiting', value: totals.waiting, percent: getPercent(totals.waiting) },
  ].sort((a, b) => b.value - a.value);

  return (
    <div className="p-5 md:p-8 rounded-xl border border-neutral-800 bg-neutral-900/30">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8 text-neutral-500">
        <div className="flex items-center gap-2">
          <Icon icon="lucide:gauge" className="w-4 h-4" />
          <h2 className="text-[10px] md:text-xs font-semibold uppercase tracking-wider">Bottleneck Analysis</h2>
        </div>
        <p className="text-[9px] md:text-[10px] text-neutral-600 font-bold uppercase italic">Fix the biggest bar, not your discipline.</p>
      </div>

      <div className="space-y-6">
        {data.map((item) => (
          <div key={item.label} className="space-y-2">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-neutral-400 uppercase tracking-wide">{item.label}</span>
              <span className="text-neutral-500 mono">{item.percent}%</span>
            </div>
            <div className="h-1.5 w-full bg-neutral-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-neutral-300 transition-all duration-500 ease-out" 
                style={{ width: `${item.percent}%` }} 
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
