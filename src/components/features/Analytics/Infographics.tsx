import React, { useState, useMemo } from 'react';
import { FlowSession } from '../../../types';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '@iconify/react';

interface InfographicsProps {
  sessions: FlowSession[];
}

type Filter = 'day' | 'week' | 'month';
type VizType = 'line' | 'bar';

export const Infographics: React.FC<InfographicsProps> = ({ sessions }) => {
  const [filter, setFilter] = useState<Filter>('week');
  const [vizType, setVizType] = useState<VizType>('bar');

  const stats = useMemo(() => {
    const now = new Date();
    const filteredSessions = sessions.filter(s => {
      const sessionDate = new Date(s.endTime);
      if (filter === 'day') {
        const today = new Date(now).setHours(0,0,0,0);
        return sessionDate.getTime() >= today;
      } else if (filter === 'week') {
        const weekAgo = new Date(now).setDate(now.getDate() - 7);
        return sessionDate.getTime() >= weekAgo;
      } else {
        const monthAgo = new Date(now).setMonth(now.getMonth() - 1);
        return sessionDate.getTime() >= monthAgo;
      }
    });

    const totalMinutes = filteredSessions.reduce((acc, s) => acc + s.leadTimeMinutes, 0);
    const avgScore = filteredSessions.length > 0 
      ? (filteredSessions.reduce((acc, s) => acc + s.flowScore, 0) / filteredSessions.length).toFixed(1)
      : '0';
    const shippedCount = filteredSessions.filter(s => s.shipped).length;
    const shipRate = filteredSessions.length > 0 
      ? Math.round((shippedCount / filteredSessions.length) * 100)
      : 0;

    // Prepare chart data
    const chartData: { label: string; value: number }[] = [];
    if (filter === 'day') {
      // Last 24 hours
      for (let i = 23; i >= 0; i--) {
        const hour = new Date(now);
        hour.setHours(now.getHours() - i, 0, 0, 0);
        const mins = sessions.filter(s => {
          const d = new Date(s.endTime);
          return d.getHours() === hour.getHours() && d.toDateString() === hour.toDateString();
        }).reduce((acc, s) => acc + s.leadTimeMinutes, 0);
        chartData.push({ label: `${hour.getHours()}h`, value: mins });
      }
    } else {
      // Last N days
      const days = filter === 'week' ? 7 : 30;
      for (let i = days - 1; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(now.getDate() - i);
        const mins = sessions.filter(s => new Date(s.endTime).toDateString() === d.toDateString())
          .reduce((acc, s) => acc + s.leadTimeMinutes, 0);
        chartData.push({ label: d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }), value: mins });
      }
    }

    return {
      totalHours: (totalMinutes / 60).toFixed(1),
      avgScore,
      shipRate,
      count: filteredSessions.length,
      chartData
    };
  }, [sessions, filter]);

  const maxVal = Math.max(...stats.chartData.map(d => d.value), 1);

  return (
    <div className="p-5 md:p-8 rounded-xl border border-neutral-800 bg-neutral-900/30 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
            <Icon icon="lucide:line-chart" className="text-blue-500 w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-widest text-neutral-400">Performance Insights</h2>
            <p className="text-[10px] text-neutral-600 font-bold uppercase">Work velocity analytics</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
           <div className="flex bg-neutral-950 p-1 rounded-md border border-neutral-800 shrink-0">
            {(['day', 'week', 'month'] as Filter[]).map((f) => (
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

      <div className="grid grid-cols-3 gap-4 md:gap-6">
        <MetricCard icon="lucide:clock" label="Focus" value={`${stats.totalHours}h`} subLabel="Logged" />
        <MetricCard icon="lucide:zap" label="Quality" value={stats.avgScore} subLabel="Flow" />
        <MetricCard icon="lucide:package-check" label="Shipped" value={`${stats.shipRate}%`} subLabel="Rate" />
      </div>

      <div className="relative h-48 w-full bg-neutral-950/20 rounded-lg border border-neutral-800/50 p-4">
        <div className="absolute inset-0 flex items-end justify-between px-6 pb-2">
          {stats.chartData.map((d, i) => (
            <div key={i} className="flex-1 flex flex-col items-center group relative h-full justify-end">
              <AnimatePresence mode="wait">
                {vizType === 'bar' ? (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${(d.value / maxVal) * 80}%` }}
                    className="w-full max-w-[12px] bg-blue-500/40 rounded-t-sm group-hover:bg-blue-500 transition-colors"
                  />
                ) : (
                  <div className="hidden" /> // Line handled by SVG below
                )}
              </AnimatePresence>
              
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-neutral-900 border border-neutral-800 rounded text-[9px] text-neutral-300 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10 whitespace-nowrap">
                {d.label}: {d.value}m
              </div>
            </div>
          ))}
        </div>

        {vizType === 'line' && (
          <svg className="absolute inset-0 w-full h-full p-6 pb-2 overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
            <motion.path
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.8 }}
              d={`M ${stats.chartData.map((d, i) => {
                const x = (i / (stats.chartData.length - 1 || 1)) * 100;
                const y = 100 - (d.value / maxVal) * 80;
                return `${x} ${y}`;
              }).join(' L ')}`}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-blue-500"
              style={{ vectorEffect: 'non-scaling-stroke' }}
            />
          </svg>
        )}
        
        <div className="absolute top-2 right-4 text-[9px] text-neutral-600 font-bold uppercase">Minutes per {filter === 'day' ? 'hour' : 'day'}</div>
      </div>
    </div>
  );
};

const MetricCard = ({ icon, label, value, subLabel }: { icon: string; label: string; value: string; subLabel: string }) => (
  <div className="space-y-1">
    <div className="flex items-center gap-1.5">
      <Icon icon={icon} className="w-3 h-3 text-neutral-500" />
      <span className="text-[9px] font-bold text-neutral-600 uppercase tracking-widest">{label}</span>
    </div>
    <div className="flex items-baseline gap-1">
      <span className="text-xl md:text-2xl font-bold mono text-neutral-100">{value}</span>
      <span className="text-[9px] text-neutral-600 font-medium uppercase">{subLabel}</span>
    </div>
  </div>
);
