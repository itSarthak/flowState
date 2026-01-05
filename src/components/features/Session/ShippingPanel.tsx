
import React from 'react';
import { FlowSession } from '../../../types';
import { Icon } from '@iconify/react';

interface ShippingPanelProps {
  sessions: FlowSession[];
}

export const ShippingPanel: React.FC<ShippingPanelProps> = ({ sessions }) => {
  const shippedToday = sessions.filter(s => {
    const today = new Date().toDateString();
    return s.shipped && new Date(s.endTime).toDateString() === today;
  }).length;

  const totalLeadTime = sessions.reduce((acc, s) => acc + s.leadTimeMinutes, 0);
  const avgLeadTime = sessions.length > 0 ? Math.round(totalLeadTime / sessions.length) : 0;
  
  // First win is the lead time of the first session today
  const todaySessions = sessions.filter(s => new Date(s.endTime).toDateString() === new Date().toDateString());
  const firstWin = todaySessions.length > 0 ? todaySessions[todaySessions.length - 1].leadTimeMinutes : 0;

  return (
    <div className="p-6 rounded-xl border border-border bg-card/30 space-y-4 h-48 flex flex-col justify-between hover:border-primary/50 transition-colors">
      <div className="flex items-center justify-between text-neutral-500">
        <span className="text-xs font-semibold uppercase tracking-wider">Shipping Panel</span>
        <Icon icon="lucide:ship" className="w-4 h-4 opacity-50" />
      </div>

      <div className="grid grid-cols-3 divide-x divide-border">
        <Metric label="Shipped" value={shippedToday.toString()} subLabel="Today" />
        <Metric label="Lead Time" value={`${avgLeadTime}m`} subLabel="Avg" />
        <Metric label="First Win" value={`${firstWin}m`} subLabel="Today" />
      </div>
    </div>
  );
};

const Metric = ({ label, value, subLabel }: { label: string; value: string; subLabel: string }) => (
  <div className="flex flex-col items-center first:pl-0 px-4 last:pr-0">
    <span className="text-2xl font-bold mono text-foreground">{value}</span>
    <span className="text-[10px] text-neutral-500 uppercase tracking-tighter mt-1">{label} ({subLabel})</span>
  </div>
);
