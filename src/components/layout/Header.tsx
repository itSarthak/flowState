
import React, { useState, useEffect, useRef } from 'react';
import { CurrentSession, Tag } from '../../types';
import { Icon } from '@iconify/react';
import { motion, AnimatePresence } from 'framer-motion';

interface HeaderProps {
  currentSession: CurrentSession | null;
  tags: Tag[]; // [NEW]
  onCreateTag: (name: string) => string; // [NEW] Returns ID
  onStartFlow: (goal: string, tagId?: string) => void;
  onEndFlow: () => void;
  notificationInterval: number;
  onSetNotificationInterval: (val: number) => void;
  onExport: () => void;
  onShowHelp: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  currentSession, 
  tags,
  onCreateTag,
  onStartFlow, 
  onEndFlow, 
  notificationInterval, 
  onSetNotificationInterval,
  onExport,
  onShowHelp
}) => {
  const [goal, setGoal] = useState('');
  const [tagName, setTagName] = useState(''); // Local tag input
  const [isTagMenuOpen, setIsTagMenuOpen] = useState(false);
  const [dateStr, setDateStr] = useState('');
  const tagInputRef = useRef<HTMLInputElement>(null);

  // Active tags only
  const activeTags = tags.filter(t => t.status === 'active');

  useEffect(() => {
    const d = new Date();
    const options: Intl.DateTimeFormatOptions = { weekday: 'short', month: 'short', day: 'numeric' };
    setDateStr(d.toLocaleDateString('en-US', options));
  }, []);

  // Initialize tag name if valid session with tag
  useEffect(() => {
    if (currentSession?.tagId) {
      const t = tags.find(tag => tag.id === currentSession.tagId);
      if (t) setTagName(t.name);
    } else if (!currentSession) {
      setTagName('');
    }
  }, [currentSession, tags]);

  const handleStart = () => {
    if (goal.trim()) {
      let tagId: string | undefined = undefined;
      const cleanTagName = tagName.trim();

      if (cleanTagName) {
        const existing = activeTags.find(t => t.name.toLowerCase() === cleanTagName.toLowerCase());
        if (existing) {
          tagId = existing.id;
        } else {
          tagId = onCreateTag(cleanTagName);
        }
      }

      onStartFlow(goal, tagId);
      setGoal(''); 
    }
  };

  const handleTestNotification = () => {
    import('../../services/notificationService').then(({ notificationService }) => {
      notificationService.trigger('Test Flow Goal', 1);
    });
  };

  const handleIntervalChange = (val: number) => {
    onSetNotificationInterval(val);
    import('../../services/notificationService').then(({ notificationService }) => {
      notificationService.requestPermission();
    });
  };

  const intervals = [1, 30, 45, 60, 75, 90, 105, 120, 135, 150];

  return (
    <header className="flex flex-col gap-4 md:gap-6 relative z-30">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-0.5 md:space-y-1">
          <p className="text-neutral-500 text-[10px] md:text-sm font-medium uppercase tracking-widest">{dateStr}</p>
          <h1 className="text-2xl md:text-3xl font-bold text-neutral-100 tracking-tight">Today</h1>
        </div>

        <div className="flex items-center gap-2 md:gap-3 overflow-x-auto pb-1 md:pb-0 no-scrollbar">
          <div className="flex items-center gap-2 px-2 md:px-3 py-1.5 bg-neutral-900/50 border border-neutral-800 rounded-md text-[9px] md:text-[10px] uppercase font-bold text-neutral-500 shrink-0">
            <button 
              onClick={() => {
                handleTestNotification();
                handleIntervalChange(notificationInterval);
              }}
              className="hover:text-white transition-colors flex items-center gap-1"
              title="Test Notification"
            >
              <Icon icon="lucide:bell" className="w-3.5 h-3.5" />
            </button>
            <span className="hidden sm:inline">Alert every</span>
            <select 
              value={notificationInterval}
              onChange={(e) => handleIntervalChange(parseInt(e.target.value))}
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
        
        {/* Tag Input Section */}
        <div className="relative group shrink-0 min-w-[120px] sm:max-w-[180px]">
           <div className="flex items-center gap-2 px-3 py-2.5 sm:py-2 bg-neutral-950/50 rounded-md border border-transparent focus-within:border-neutral-700 transition-colors">
             <Icon icon="lucide:tag" className={`w-3.5 h-3.5 ${tagName ? 'text-blue-500' : 'text-neutral-600'}`} />
             <input
                ref={tagInputRef}
                type="text"
                placeholder="Tag..."
                value={tagName}
                onChange={(e) => {
                  setTagName(e.target.value);
                  setIsTagMenuOpen(true);
                }}
                onFocus={() => setIsTagMenuOpen(true)}
                onBlur={() => setTimeout(() => setIsTagMenuOpen(false), 200)}
                disabled={!!currentSession}
                className="w-full bg-transparent text-xs text-neutral-200 placeholder:text-neutral-600 focus:outline-none"
             />
           </div>

           {/* Tag Suggestions Dropdown */}
           <AnimatePresence>
             {isTagMenuOpen && !currentSession && (
               <motion.div
                 initial={{ opacity: 0, y: 5 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0, y: 5 }}
                 className="absolute top-full left-0 mt-1 w-full min-w-[160px] max-h-48 overflow-y-auto bg-neutral-900 border border-neutral-800 rounded-lg shadow-xl py-1 z-50 no-scrollbar"
               >
                 {activeTags.filter(t => t.name.toLowerCase().includes(tagName.toLowerCase())).map(t => (
                   <button
                     key={t.id}
                     onClick={() => setTagName(t.name)}
                     className="w-full text-left px-3 py-2 text-xs text-neutral-300 hover:bg-neutral-800 hover:text-white flex items-center justify-between group/item"
                   >
                     <span>{t.name}</span>
                     <Icon icon="lucide:arrow-up-left" className="w-3 h-3 opacity-0 group-hover/item:opacity-50" />
                   </button>
                 ))}
                 {tagName && !activeTags.some(t => t.name.toLowerCase() === tagName.toLowerCase()) && (
                   <div className="px-3 py-2 text-xs text-neutral-500 border-t border-neutral-800/50 italic">
                     Create "{tagName}"
                   </div>
                 )}
               </motion.div>
             )}
           </AnimatePresence>
        </div>

        <div className="w-[1px] h-6 bg-neutral-800 hidden sm:block" />

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
