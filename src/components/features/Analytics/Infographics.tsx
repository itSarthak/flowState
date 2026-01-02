import React, { useMemo } from 'react';
import { FlowSession } from '../../../types';
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid 
} from 'recharts';
import { 
  format, subDays, startOfWeek, endOfWeek, subWeeks, startOfMonth, subMonths, isSameDay, getISOWeek 
} from 'date-fns';
import { Icon } from '@iconify/react';
import { motion, AnimatePresence } from 'framer-motion';

export type AnalyticFilter = 'day' | 'week' | 'month';

interface InfographicsProps {
  sessions: FlowSession[];
  filter: AnalyticFilter;
  setFilter: (f: AnalyticFilter) => void;
}

type VizType = 'line' | 'bar';

export const Infographics: React.FC<InfographicsProps> = ({ sessions, filter, setFilter }) => {
  const [vizType, setVizType] = React.useState<VizType>('bar');

  const { stats, chartData } = useMemo(() => {
    const now = new Date();
    let aggregatedData: { label: string; value: number; fullDate: string }[] = [];
    let filteredSessions: FlowSession[] = [];

    // --- 1. Aggregation Logic ---
    if (filter === 'day') {
      // LAST 7 DAYS (Current day on right)
      // Iterate 6 -> 0
      filteredSessions = sessions.filter(s => {
         const t = new Date(s.endTime).getTime();
         return t >= subDays(now, 7).getTime(); // Rough filter for performacne
      });

      for (let i = 6; i >= 0; i--) {
        const d = subDays(now, i);
        const label = format(d, 'dd/MM/yy');
        
        // Sum minutes for this day
        const value = sessions
          .filter(s => isSameDay(new Date(s.endTime), d))
          .reduce((acc, s) => acc + s.leadTimeMinutes, 0);

        aggregatedData.push({ label, value, fullDate: d.toDateString() });
      }

    } else if (filter === 'week') {
      // LAST 12 WEEKS
      // Iterate 11 -> 0
      for (let i = 11; i >= 0; i--) {
        const d = subWeeks(now, i);
        const weekNum = getISOWeek(d);
        const label = `Week ${weekNum}`;
        const start = startOfWeek(d, { weekStartsOn: 1 }); // Monday
        const end = endOfWeek(d, { weekStartsOn: 1 });

        const value = sessions
          .filter(s => {
            const t = new Date(s.endTime).getTime();
            return t >= start.getTime() && t <= end.getTime();
          })
          .reduce((acc, s) => acc + s.leadTimeMinutes, 0);

        aggregatedData.push({ label, value, fullDate: `Week of ${format(start, 'dd MMM')}` });
      }
      
      // Filter sessions for the stats cards (matches the chart range roughly)
      const twelveWeeksAgo = subWeeks(now, 12);
      filteredSessions = sessions.filter(s => new Date(s.endTime).getTime() >= twelveWeeksAgo.getTime());

    } else if (filter === 'month') {
      // LAST 6 MONTHS
      for (let i = 5; i >= 0; i--) {
        const d = subMonths(now, i);
        const label = format(d, 'MMM yyyy');
        const monthStart = startOfMonth(d);
        
        const value = sessions
          .filter(s => {
             const t = new Date(s.endTime);
             return t.getMonth() === d.getMonth() && t.getFullYear() === d.getFullYear();
          })
          .reduce((acc, s) => acc + s.leadTimeMinutes, 0);

        aggregatedData.push({ label, value, fullDate: label });
      }

       const sixMonthsAgo = subMonths(now, 6);
       filteredSessions = sessions.filter(s => new Date(s.endTime).getTime() >= sixMonthsAgo.getTime());
    }

    // --- 2. Stats Calculation (Based on the Filtered Range) ---
    const totalMinutes = filteredSessions.reduce((acc, s) => acc + s.leadTimeMinutes, 0);
    const avgScore = filteredSessions.length > 0 
      ? (filteredSessions.reduce((acc, s) => acc + s.flowScore, 0) / filteredSessions.length).toFixed(1)
      : '0';
    const shippedCount = filteredSessions.filter(s => s.shipped).length;
    const shipRate = filteredSessions.length > 0 
      ? Math.round((shippedCount / filteredSessions.length) * 100)
      : 0;

    return {
      stats: {
        totalHours: (totalMinutes / 60).toFixed(1),
        avgScore,
        shipRate,
        count: filteredSessions.length
      },
      chartData: aggregatedData
    };
  }, [sessions, filter]);

  return (
    <div className="p-5 md:p-8 rounded-xl border border-neutral-800 bg-neutral-900/30 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
         {/* ... Header ... */}
         <div className="flex items-center gap-3">
          <div className="p-2 bg-neutral-800/50 rounded-lg border border-neutral-800">
            <Icon icon="lucide:bar-chart-2" className="text-neutral-400 w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-widest text-neutral-300">Performance Insights</h2>
            <p className="text-[10px] text-neutral-600 font-bold uppercase">Analytics & Trends</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
           <div className="flex bg-neutral-950 p-1 rounded-md border border-neutral-800 shrink-0">
            {(['day', 'week', 'month'] as AnalyticFilter[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 rounded text-[9px] font-black uppercase tracking-tighter transition-all ${
                  filter === f 
                    ? 'bg-neutral-800 text-white' 
                    : 'text-neutral-500 hover:text-neutral-300'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="flex bg-neutral-950 p-1 rounded-md border border-neutral-800 shrink-0">
            {(['line', 'bar'] as VizType[]).map((v) => (
              <button
                key={v}
                onClick={() => setVizType(v)}
                className={`px-2 py-1 rounded transition-all ${
                  vizType === v 
                    ? 'bg-neutral-800 text-white' 
                    : 'text-neutral-500 hover:text-neutral-300'
                }`}
              >
                <Icon icon={v === 'line' ? 'lucide:trending-up' : 'lucide:bar-chart-2'} className="w-3.5 h-3.5" />
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
        <MetricCard icon="lucide:clock" label="Focus Time" value={`${stats.totalHours}h`} subLabel="In selected period" />
        <MetricCard icon="lucide:zap" label="Avg Quality" value={stats.avgScore} subLabel="Flow Score" />
        <MetricCard icon="lucide:package-check" label="Ship Rate" value={`${stats.shipRate}%`} subLabel="Completion" />
      </div>

      <div className="h-64 w-full bg-neutral-950/20 rounded-xl border border-neutral-800/50 p-4 relative">
        <ResponsiveContainer width="100%" height="100%">
          {vizType === 'bar' ? (
            <BarChart data={chartData}>
               <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
               <XAxis 
                  dataKey="label" 
                  stroke="#525252" 
                  tick={{ fill: '#737373', fontSize: 10, fontWeight: 500 }} 
                  axisLine={false} 
                  tickLine={false} 
                  dy={10}
               />
               <Tooltip 
                  cursor={{ fill: '#262626', opacity: 0.4 }}
                  contentStyle={{ backgroundColor: '#171717', borderColor: '#262626', borderRadius: '8px', fontSize: '12px' }}
                  itemStyle={{ color: '#e5e5e5' }}
                  labelStyle={{ color: '#a3a3a3', marginBottom: '4px' }}
               />
               <Bar 
                  dataKey="value" 
                  fill="#3b82f6" 
                  radius={[4, 4, 0, 0]} 
                  barSize={32}
                  activeBar={{ fill: '#60a5fa' }}
               />
            </BarChart>
          ) : (
            <LineChart data={chartData}>
               <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                <XAxis 
                  dataKey="label" 
                  stroke="#525252" 
                  tick={{ fill: '#737373', fontSize: 10, fontWeight: 500 }} 
                  axisLine={false} 
                  tickLine={false} 
                  dy={10}
               />
               <Tooltip 
                  contentStyle={{ backgroundColor: '#171717', borderColor: '#262626', borderRadius: '8px', fontSize: '12px' }}
                  itemStyle={{ color: '#e5e5e5' }}
                  labelStyle={{ color: '#a3a3a3', marginBottom: '4px' }}
               />
               <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={{ fill: '#171717', stroke: '#3b82f6', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, fill: '#60a5fa' }}
               />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const MetricCard = ({ icon, label, value, subLabel }: { icon: string; label: string; value: string; subLabel: string }) => (
  <div className="p-4 rounded-lg bg-neutral-900/40 border border-neutral-800 space-y-2">
    <div className="flex items-center gap-2">
      <Icon icon={icon} className="w-3.5 h-3.5 text-neutral-500" />
      <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">{label}</span>
    </div>
    <div className="flex flex-col">
      <span className="text-2xl font-bold mono text-neutral-200">{value}</span>
      <span className="text-[10px] text-neutral-600 font-medium">{subLabel}</span>
    </div>
  </div>
);
