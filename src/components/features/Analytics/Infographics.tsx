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
    let aggregatedData: { label: string; value: number; fullDate: string; avgScore: string }[] = [];
    let filteredSessions: FlowSession[] = [];

    // --- 1. Aggregation Logic ---
    if (filter === 'day') {
      // Last 7 Days
      const sevenDaysAgo = subDays(now, 7);
      filteredSessions = sessions.filter(s => new Date(s.endTime).getTime() >= sevenDaysAgo.getTime()); // [FIX]

      for (let i = 6; i >= 0; i--) {
        const d = subDays(now, i);
        const label = format(d, 'dd/MM/yy');
        
        const sessionsInBucket = sessions.filter(s => isSameDay(new Date(s.endTime), d));
        const value = sessionsInBucket.reduce((acc, s) => acc + s.leadTimeMinutes, 0);
        const avgScore = sessionsInBucket.length > 0 
          ? (sessionsInBucket.reduce((acc, s) => acc + s.flowScore, 0) / sessionsInBucket.length).toFixed(1)
          : '0';

        aggregatedData.push({ label, value, fullDate: d.toDateString(), avgScore });
      }

    } else if (filter === 'week') {
      // ... (Week logic)
      for (let i = 11; i >= 0; i--) {
        const d = subWeeks(now, i);
        const weekNum = getISOWeek(d);
        const label = `Week ${weekNum}`;
        const start = startOfWeek(d, { weekStartsOn: 1 });
        const end = endOfWeek(d, { weekStartsOn: 1 });

        const sessionsInBucket = sessions.filter(s => {
          const t = new Date(s.endTime).getTime();
          return t >= start.getTime() && t <= end.getTime();
        });

        const value = sessionsInBucket.reduce((acc, s) => acc + s.leadTimeMinutes, 0);
        const avgScore = sessionsInBucket.length > 0 
          ? (sessionsInBucket.reduce((acc, s) => acc + s.flowScore, 0) / sessionsInBucket.length).toFixed(1)
          : '0';

        aggregatedData.push({ label, value, fullDate: `Week of ${format(start, 'dd MMM')}`, avgScore });
      }
      
      const twelveWeeksAgo = subWeeks(now, 12);
      filteredSessions = sessions.filter(s => new Date(s.endTime).getTime() >= twelveWeeksAgo.getTime());

    } else if (filter === 'month') {
      // ... (Month logic)
      for (let i = 5; i >= 0; i--) {
        const d = subMonths(now, i);
        const label = format(d, 'MMM yyyy');
        
        const sessionsInBucket = sessions.filter(s => {
             const t = new Date(s.endTime);
             return t.getMonth() === d.getMonth() && t.getFullYear() === d.getFullYear();
        });

        const value = sessionsInBucket.reduce((acc, s) => acc + s.leadTimeMinutes, 0);
        const avgScore = sessionsInBucket.length > 0 
          ? (sessionsInBucket.reduce((acc, s) => acc + s.flowScore, 0) / sessionsInBucket.length).toFixed(1)
          : '0';

        aggregatedData.push({ label, value, fullDate: label, avgScore });
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

    // --- 3. Deep Stats Calculation ---
    // Best Day
    let bestDay = { label: '-', value: 0 };
    if (aggregatedData.length > 0) {
      const max = aggregatedData.reduce((prev, current) => (prev.value > current.value) ? prev : current);
      bestDay = max;
    }

    // Daily Average (if filter is day, it's hourly avg, if week/month it's daily avg over that period? 
    // Actually, simple average of the chart bars is strictly correct for the visualization)
    const average = Math.round(totalMinutes / (aggregatedData.length || 1));

    return {
      stats: {
        totalHours: (totalMinutes / 60).toFixed(1),
        avgScore,
        shipRate,
        count: filteredSessions.length,
        bestDay,
        average,
        shippedCount
      },
      chartData: aggregatedData
    };
  }, [sessions, filter]);

  return (
    <div className="p-5 md:p-8 rounded-xl border border-border bg-card/30 space-y-8">
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
        <MetricCard 
          icon="lucide:clock" 
          label="Focus Time" 
          value={`${stats.totalHours}h`} 
          subLabel="In selected period" 
          tooltip={
            <div className="space-y-1">
              <div className="flex justify-between gap-4"><span className="text-neutral-500">Average:</span> <span className="text-neutral-200 mono">{stats.average}m / bucket</span></div>
              <div className="flex justify-between gap-4"><span className="text-neutral-500">Best:</span> <span className="text-neutral-200 mono">{stats.bestDay.value}m ({stats.bestDay.label})</span></div>
            </div>
          }
        />
        <MetricCard 
          icon="lucide:zap" 
          label="Avg Quality" 
          value={stats.avgScore} 
          subLabel="Flow Score" 
          tooltip={
             <div className="flex justify-between gap-4"><span className="text-neutral-500">Sessions recorded:</span> <span className="text-neutral-200 mono">{stats.count}</span></div>
          }
        />
        <MetricCard 
          icon="lucide:package-check" 
          label="Ship Rate" 
          value={`${stats.shipRate}%`} 
          subLabel="Completion" 
          tooltip={
             <div className="flex justify-between gap-4"><span className="text-neutral-500">Total Shipped:</span> <span className="text-neutral-200 mono">{stats.shippedCount} items</span></div>
          }
        />
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
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-3 shadow-xl space-y-2">
                          <div className="text-xs text-neutral-400 mb-1">{data.fullDate}</div>
                          <div className="flex items-center gap-4">
                            <span className="text-sm font-bold text-blue-400">{data.value} min</span>
                            <span className="text-xs font-mono text-neutral-500">Avg Flow: {data.avgScore}</span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
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
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-3 shadow-xl space-y-2">
                          <div className="text-xs text-neutral-400 mb-1">{data.fullDate}</div>
                          <div className="flex items-center gap-4">
                            <span className="text-sm font-bold text-blue-400">{data.value} min</span>
                            <span className="text-xs font-mono text-neutral-500">Avg Flow: {data.avgScore}</span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
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

const MetricCard = ({ icon, label, value, subLabel, tooltip }: { icon: string; label: string; value: string; subLabel: string; tooltip?: React.ReactNode }) => (
  <div className="p-4 rounded-lg bg-neutral-900/40 border border-neutral-800 space-y-2 relative group cursor-help">
    <div className="flex items-center gap-2">
      <Icon icon={icon} className="w-3.5 h-3.5 text-neutral-500" />
      <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">{label}</span>
    </div>
    <div className="flex flex-col">
      <span className="text-2xl font-bold mono text-neutral-200">{value}</span>
      <span className="text-[10px] text-neutral-600 font-medium">{subLabel}</span>
    </div>

    {tooltip && (
      <div className="absolute top-full left-0 mt-2 w-max min-w-[160px] p-3 bg-neutral-900 border border-neutral-800 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none">
        <div className="text-[10px] uppercase font-bold text-neutral-600 mb-2 border-b border-neutral-800 pb-1">Details</div>
        <div className="text-xs text-neutral-300">{tooltip}</div>
      </div>
    )}
  </div>
);
