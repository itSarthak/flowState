import React, { useState } from 'react';
import { FlowSession } from '../../../types';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '@iconify/react';
import { ContextMenu } from '../../ui/ContextMenu';

interface TimelineProps {
  sessions: FlowSession[];
  onDelete: (id: string) => void;
  onEdit: (session: FlowSession) => void;
}

import { format, isToday, isSameDay } from 'date-fns';

export const Timeline: React.FC<TimelineProps> = ({ sessions, onDelete, onEdit }) => {
  const [showAll, setShowAll] = useState(false);
  const displayedSessions = showAll ? sessions : sessions.slice(0, 3);
  
  // Helper to render date header
  const renderDateHeader = (date: number) => {
    const d = new Date(date);
    return (
      <div className="flex items-center gap-2 py-2 mt-4 mb-2">
        <div className="h-px bg-neutral-800 flex-1" />
        <span className="text-[10px] uppercase font-bold text-neutral-500 tracking-widest">
          {isToday(d) ? 'Today' : format(d, 'dd/MM/yy')}
        </span>
        <div className="h-px bg-neutral-800 flex-1" />
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between text-neutral-500 px-1">
        <div className="flex items-center gap-2">
          <Icon icon="lucide:calendar-range" className="w-4 h-4" />
          <h2 className="text-xs font-semibold uppercase tracking-wider">Session Timeline</h2>
        </div>
        {sessions.length > 3 && (
          <button 
            onClick={() => setShowAll(!showAll)}
            className="text-[10px] font-bold uppercase tracking-widest hover:text-neutral-300 transition-colors flex items-center gap-1"
          >
            {showAll ? 'Show Less' : `Show ${sessions.length - 3} More`}
            <Icon icon={showAll ? "lucide:chevron-up" : "lucide:chevron-down"} className="w-3 h-3" />
          </button>
        )}
      </div>

      <div className="space-y-3">
        <AnimatePresence initial={false} mode="popLayout">
          {sessions.length === 0 ? (
            <div className="p-12 text-center text-neutral-700 border border-dashed border-neutral-800 rounded-xl">
              No sessions recorded yet. Focus and ship.
            </div>
          ) : (
            displayedSessions.map((session, index) => {
              const showHeader = index === 0 || !isSameDay(new Date(session.endTime), new Date(displayedSessions[index - 1].endTime));
              
              return (
                <React.Fragment key={session.id}>
                  {showHeader && renderDateHeader(session.endTime)}
                  <TimelineItem session={session} onDelete={onDelete} onEdit={onEdit} />
                </React.Fragment>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const TimelineItem = ({ session, onDelete, onEdit }: { session: FlowSession; onDelete: (id: string) => void; onEdit: (session: FlowSession) => void }) => {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number } | null>(null);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent global context menu
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  const menuItems = [
    {
      label: 'Edit Session',
      icon: <Icon icon="lucide:edit-3" className="w-4 h-4" />,
      onClick: () => onEdit(session),
    },
    {
      label: 'Delete Session',
      icon: <Icon icon="lucide:trash-2" className="w-4 h-4" />,
      onClick: () => onDelete(session.id),
      variant: 'danger' as const
    }
  ];

  return (
    <div onContextMenu={handleContextMenu} className="relative">
      <motion.div 
        layout
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="bg-neutral-900/40 border border-neutral-800 rounded-xl overflow-hidden hover:border-neutral-700 transition-colors cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 md:gap-4">
          <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
            <div className={`w-2 h-2 rounded-full shrink-0 ${session.shipped ? 'bg-blue-500' : 'bg-neutral-700'}`} />
            <span className="text-sm md:text-base text-neutral-200 font-medium truncate flex-1">{session.goal}</span>
          </div>
          
          <div className="flex items-center justify-between sm:justify-end gap-4 md:gap-6 text-sm">
            <div className="flex flex-col items-end">
               <span className="mono text-xs md:text-sm text-neutral-400">{session.leadTimeMinutes}m</span>
               <span className="text-[9px] md:text-[10px] text-neutral-600 uppercase">Duration</span>
            </div>
            <div className="flex flex-col items-end">
               <span className="mono text-xs md:text-sm text-neutral-400">{session.flowScore}/5</span>
               <span className="text-[9px] md:text-[10px] text-neutral-600 uppercase">Flow</span>
            </div>
            {session.shipped && (
              <Icon icon="lucide:check-circle-2" className="w-4 h-4 md:w-5 md:h-5 text-blue-500/80" />
            )}
          </div>
        </div>

        {isExpanded && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="px-4 pb-4 border-t border-neutral-800 pt-4"
          >
            <div className="flex flex-col md:flex-row md:items-center gap-6 mb-4">
              <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
                <Stat label="Interruptions" value={session.interruptions.toString()} />
                <Stat label="Lead Time" value={`${session.leadTimeMinutes}m`} />
                <Stat label="Started" value={new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} />
                <Stat label="Ended" value={new Date(session.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} />
              </div>
              <div className="h-10 w-px bg-neutral-800 hidden md:block" />
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-neutral-600 uppercase whitespace-nowrap">Bottleneck</span>
                <div className="flex items-center gap-1.5 px-2 py-1 bg-neutral-800/50 rounded text-xs text-neutral-400 border border-neutral-700">
                   {Object.entries(session.bottleneck).sort((a,b) => b[1] - a[1])[0][0].toUpperCase()}
                </div>
              </div>
            </div>
            {session.notes && (
              <div className="bg-neutral-900/60 p-3 rounded border border-neutral-800/50">
                 <p className="text-[10px] text-neutral-600 uppercase font-bold mb-1">Notes</p>
                 <p className="text-sm text-neutral-400 leading-relaxed italic">{session.notes}</p>
              </div>
            )}
          </motion.div>
        )}
      </motion.div>

      {contextMenu && (
        <ContextMenu 
          x={contextMenu.x} 
          y={contextMenu.y} 
          onClose={() => setContextMenu(null)} 
          items={menuItems}
        />
      )}
    </div>
  );
};

const Stat = ({ label, value }: { label: string; value: string }) => (
  <div>
    <p className="text-[10px] text-neutral-600 uppercase font-bold">{label}</p>
    <p className="text-sm text-neutral-300 mono">{value}</p>
  </div>
);
