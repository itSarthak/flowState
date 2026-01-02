
import React, { useState, useEffect } from 'react';
import { CurrentSession } from '../../types';
import { Icon } from '@iconify/react';

interface HeaderProps {
  currentSession: CurrentSession | null;
  onStartFlow: (goal: string) => void;
  onEndFlow: () => void;
  notificationInterval: number;
  onSetNotificationInterval: (val: number) => void;
  onExport: () => void;
  onShowHelp: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  currentSession, 
  onStartFlow, 
  onEndFlow, 
  notificationInterval, 
  onSetNotificationInterval,
  onExport,
  onShowHelp
}) => {
  const [goal, setGoal] = useState('');
  const [dateStr, setDateStr] = useState('');

  useEffect(() => {
    const d = new Date();
    const options: Intl.DateTimeFormatOptions = { weekday: 'short', month: 'short', day: 'numeric' };
    setDateStr(d.toLocaleDateString('en-US', options));
  }, []);

  const handleStart = () => {
    if (goal.trim()) {
      onStartFlow(goal);
      setGoal(''); // Clear input [TASK 1]
    }
  };

  const handleTestNotification = () => {
    import('../../services/notificationService').then(({ notificationService }) => {
      notificationService.trigger('Test Flow Goal', 1);
    });
  };

  const intervals = [30, 45, 60, 75, 90, 105, 120, 135, 150];

  return (
    <header className="flex flex-col gap-4 md:gap-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-0.5 md:space-y-1">
          <p className="text-neutral-500 text-[10px] md:text-sm font-medium uppercase tracking-widest">{dateStr}</p>
          <h1 className="text-2xl md:text-3xl font-bold text-neutral-100 tracking-tight">Today</h1>
        </div>

        <div className="flex items-center gap-2 md:gap-3 overflow-x-auto pb-1 md:pb-0 no-scrollbar">
          <div className="flex items-center gap-2 px-2 md:px-3 py-1.5 bg-neutral-900/50 border border-neutral-800 rounded-md text-[9px] md:text-[10px] uppercase font-bold text-neutral-500 shrink-0">
            <button 
              onClick={handleTestNotification}
              className="hover:text-white transition-colors flex items-center gap-1"
              title="Test Notification"
            >
              <Icon icon="lucide:bell" className="w-3.5 h-3.5" />
            </button>
            <span className="hidden sm:inline">Alert every</span>
            <select 
              value={notificationInterval}
              onChange={(e) => onSetNotificationInterval(parseInt(e.target.value))}
              className="bg-transparent text-neutral-300 focus:outline-none cursor-pointer hover:text-white transition-colors"
            >
              {intervals.map(i => <option key={i} value={i} className="bg-neutral-900">{i}m</option>)}
            </select>
          </div>
          <button 
            onClick={onExport}
            className="p-2 text-neutral-500 hover:text-white bg-neutral-900/50 border border-neutral-800 rounded-md transition-all shrink-0"
            title="Export Data"
          >
            <Icon icon="lucide:download" className="w-4 h-4" />
          </button>
          <button 
            onClick={onShowHelp}
            className="p-2 text-neutral-500 hover:text-white bg-neutral-900/50 border border-neutral-800 rounded-md transition-all shrink-0"
            title="Help / Guide"
          >
            <Icon icon="lucide:help-circle" className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 md:gap-3 bg-neutral-900/50 p-1.5 rounded-lg border border-neutral-800">
        <input 
          type="text"
          placeholder="What will work when this ends?"
          value={currentSession ? currentSession.goal : goal}
          onChange={(e) => setGoal(e.target.value)}
          disabled={!!currentSession}
          onKeyDown={(e) => e.key === 'Enter' && handleStart()}
          className="bg-transparent flex-1 px-3 py-2.5 sm:py-2 text-neutral-200 placeholder:text-neutral-600 focus:outline-none disabled:cursor-not-allowed text-sm md:text-base"
        />
        {currentSession ? (
          <button 
            onClick={onEndFlow}
            className="flex items-center justify-center gap-2 px-4 py-2.5 sm:py-2 bg-neutral-100 hover:bg-white text-neutral-950 rounded-md font-semibold transition-colors text-xs md:text-sm whitespace-nowrap"
          >
            <Icon icon="lucide:square" className="w-4 h-4" />
            End Session
          </button>
        ) : (
          <button 
            onClick={handleStart}
            disabled={!goal.trim()}
            className="flex items-center justify-center gap-2 px-4 py-2.5 sm:py-2 bg-neutral-100 hover:bg-white text-neutral-950 rounded-md font-semibold transition-colors text-xs md:text-sm disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            <Icon icon="lucide:play" className="w-4 h-4" />
            Start Flow
          </button>
        )}
      </div>
    </header>
  );
};
