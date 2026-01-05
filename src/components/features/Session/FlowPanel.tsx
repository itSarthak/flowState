
import React from 'react';
import { Icon } from '@iconify/react';
import { FlowScore } from '../../../types';

interface FlowPanelProps {
  isActive: boolean;
  duration: number;
  lastFlowScore?: FlowScore;
}

export const FlowPanel: React.FC<FlowPanelProps> = ({ isActive, duration, lastFlowScore }) => {
  return (
    <div className="p-6 rounded-xl border border-border bg-card/30 flex flex-col justify-between h-48 group hover:border-primary/50 transition-colors">
      <div className="flex items-center justify-between text-neutral-500">
        <span className="text-xs font-semibold uppercase tracking-wider">Flow Panel</span>
        <Icon icon="lucide:brain" className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" />
      </div>

      <div className="flex items-baseline gap-2">
        <span className="text-5xl font-bold mono text-foreground">
          {isActive ? duration : (lastFlowScore || 0)}
        </span>
        <span className="text-neutral-500 font-medium">
          {isActive ? 'min active' : 'last score'}
        </span>
      </div>

      <div className="text-sm text-neutral-600 font-medium italic">
        {isActive ? 'Deep work in progress...' : 'Start a session to measure focus.'}
      </div>
    </div>
  );
};
