import React, { useState } from 'react';
import { Tag, FlowSession } from '../../../types';
import { format } from 'date-fns';
import { Icon } from '@iconify/react';
import { motion, AnimatePresence } from 'framer-motion';

interface ShippingCycleAnalysisProps {
  sessions: FlowSession[];
  tags: Tag[];
}

export const ShippingCycleAnalysis: React.FC<ShippingCycleAnalysisProps> = ({ sessions, tags }) => {
  const [expandedTagId, setExpandedTagId] = useState<string | null>(null);

  // Group sessions by tag
  const getTagStats = (tag: Tag) => {
    const tagSessions = sessions.filter(s => s.tagId === tag.id);
    const totalMinutes = tagSessions.reduce((acc, s) => acc + s.leadTimeMinutes, 0);
    const totalSessions = tagSessions.length;
    
    // Start Date = First session start time (or tag creation time if no sessions yet)
    // End Date = Last session end time (if completed) or current
    const sortedSessions = [...tagSessions].sort((a, b) => a.startTime - b.startTime);
    const startDate = tag.createdAt;
    const endDate = tag.completedAt || (sortedSessions.length > 0 ? sortedSessions[sortedSessions.length - 1].endTime : null);

    return {
      totalMinutes,
      totalSessions,
      startDate,
      endDate,
      sessions: sortedSessions
    };
  };

  const sortedTags = [...tags].sort((a, b) => {
    // Active first, then by creation date desc
    if (a.status === 'active' && b.status !== 'active') return -1;
    if (a.status !== 'active' && b.status === 'active') return 1;
    return b.createdAt - a.createdAt;
  });

  const [showAll, setShowAll] = useState(false);
  const displayedTags = showAll ? sortedTags : sortedTags.slice(0, 3);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
           <Icon icon="lucide:container" className="text-neutral-400 w-5 h-5" />
           <h2 className="text-sm font-bold uppercase tracking-widest text-neutral-300">Shipping Cycles</h2>
        </div>
        {tags.length > 3 && (
           <button 
             onClick={() => setShowAll(!showAll)}
             className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 hover:text-neutral-300 transition-colors flex items-center gap-1"
           >
             {showAll ? 'Show Less' : `Show ${tags.length - 3} More`}
             <Icon icon={showAll ? "lucide:chevron-up" : "lucide:chevron-down"} className="w-3 h-3" />
           </button>
        )}
      </div>

      <div className="grid gap-3">
        {displayedTags.map(tag => {
          const stats = getTagStats(tag);
          const isExpanded = expandedTagId === tag.id;

          return (
            <motion.div 
              key={tag.id}
              layout
              className={`rounded-lg border ${
                tag.status === 'active' ? 'bg-card border-border' : 'bg-muted/30 border-border'
              } overflow-hidden`}
            >
              <div 
                onClick={() => setExpandedTagId(isExpanded ? null : tag.id)}
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-neutral-800/20 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-md ${tag.status === 'active' ? 'bg-blue-500/10 text-blue-400' : 'bg-green-500/10 text-green-400'}`}>
                    <Icon icon={tag.status === 'active' ? 'lucide:dolly-chart' : 'lucide:check-circle'} className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className={`font-bold text-sm ${tag.status === 'active' ? 'text-neutral-200' : 'text-neutral-500 line-through'}`}>
                      {tag.name}
                    </h3>
                    <div className="flex items-center gap-3 text-[10px] text-neutral-500 uppercase tracking-wider font-medium mt-1">
                      <span>{stats.totalSessions} Sessions</span>
                      <span>•</span>
                      <span>{Math.floor(stats.totalMinutes / 60)}h {stats.totalMinutes % 60}m</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                   <div className="text-right hidden sm:block">
                     <div className="text-[10px] text-neutral-600 uppercase font-bold">Started</div>
                     <div className="text-xs text-neutral-400 font-mono">{format(stats.startDate, 'dd MMM')}</div>
                   </div>
                   {tag.completedAt && (
                      <div className="text-right hidden sm:block">
                        <div className="text-[10px] text-neutral-600 uppercase font-bold">Shipped</div>
                        <div className="text-xs text-green-500/80 font-mono">{format(tag.completedAt, 'dd MMM')}</div>
                      </div>
                   )}
                   <Icon 
                      icon="lucide:chevron-down" 
                      className={`w-4 h-4 text-neutral-600 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
                   />
                </div>
              </div>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                    className="border-t border-border/50 bg-muted/20"
                  >
                    <div className="p-4 space-y-2">
                       <h4 className="text-[10px] uppercase font-bold text-neutral-600 mb-2">Session History</h4>
                       {stats.sessions.length > 0 ? (
                         stats.sessions.map(session => (
                           <div key={session.id} className="flex items-center justify-between text-xs py-1 border-b border-neutral-800/50 last:border-0 hover:bg-neutral-900/30 px-2 rounded -mx-2">
                             <span className="text-neutral-400 truncate max-w-[200px] md:max-w-md">{session.goal}</span>
                             <div className="flex items-center gap-3 shrink-0">
                               <span className="text-neutral-600 font-mono">{session.leadTimeMinutes}m</span>
                               <span className="text-neutral-700 font-mono text-[10px]">{format(session.endTime, 'dd/MM')}</span>
                             </div>
                           </div>
                         ))
                       ) : (
                         <div className="text-neutral-700 text-xs italic">No sessions recorded specific to this tag yet.</div>
                       )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
        {tags.length === 0 && (
           <div className="p-8 text-center border border-dashed border-border rounded-xl">
             <p className="text-neutral-500 text-sm">No tags created yet. Add a tag when starting a flow to track shipping cycles.</p>
           </div>
        )}
      </div>
    </div>
  );
};
