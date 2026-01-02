import React, { useState, useEffect, useRef } from 'react';
import { FlowSession, Tag } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '@iconify/react';

interface EditSessionModalProps {
  session: FlowSession;
  tags: Tag[];
  onClose: () => void;
  onSave: (id: string, updates: Partial<FlowSession>) => void;
  onCreateTag: (name: string) => string;
}

export const EditSessionModal: React.FC<EditSessionModalProps> = ({
  session,
  tags,
  onClose,
  onSave,
  onCreateTag
}) => {
  const [goal, setGoal] = useState(session.goal);
  const [tagName, setTagName] = useState('');
  const [isTagMenuOpen, setIsTagMenuOpen] = useState(false);
  const tagInputRef = useRef<HTMLInputElement>(null);

  // Available tags: Active tags + Completed tags if session was during their active period
  const availableTags = tags.filter(t => {
    if (t.status === 'active') return true;
    // For completed tags, allow if session started before or during the tag's life (rough check)
    // We use session.startTime <= tag.completedAt
    return t.completedAt && session.startTime <= t.completedAt;
  });

  useEffect(() => {
     if (session.tagId) {
        const t = tags.find(tag => tag.id === session.tagId);
        if (t) setTagName(t.name);
     }
  }, [session, tags]);

  const handleSave = () => {
    if (!goal.trim()) return;

    let tagId: string | undefined = session.tagId;
    const cleanTagName = tagName.trim();

    if (cleanTagName) {
       const existing = availableTags.find(t => t.name.toLowerCase() === cleanTagName.toLowerCase());
       if (existing) {
          tagId = existing.id;
       } else {
         // Create new tag if changed
         // Note: if user clears tag input, tagId remains undefined (handled below by not entering this block if empty? No wait)
         tagId = onCreateTag(cleanTagName);
       }
    } else {
       // Tag cleared
       tagId = undefined;
    }

    onSave(session.id, { goal, tagId });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl overflow-hidden"
      >
        <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-neutral-200 uppercase tracking-wider">Edit Session</h3>
          <button onClick={onClose} className="text-neutral-500 hover:text-white transition-colors">
            <Icon icon="lucide:x" className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-neutral-500 uppercase">Goal</label>
            <input 
              type="text" 
              value={goal} 
              onChange={(e) => setGoal(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-3 text-sm text-neutral-200 focus:border-blue-500 focus:outline-none transition-colors"
              placeholder="What was the goal?"
            />
          </div>

          <div className="space-y-2 relative">
             <label className="text-xs font-bold text-neutral-500 uppercase">Tag (Shipping Cycle)</label>
             <div className="flex items-center gap-2 px-3 py-3 bg-neutral-950 rounded-lg border border-neutral-800 focus-within:border-blue-500 transition-colors">
                 <Icon icon="lucide:tag" className={`w-4 h-4 ${tagName ? 'text-blue-500' : 'text-neutral-600'}`} />
                 <input
                    ref={tagInputRef}
                    type="text"
                    placeholder="Assign a tag..."
                    value={tagName}
                    onChange={(e) => {
                      setTagName(e.target.value);
                      setIsTagMenuOpen(true);
                    }}
                    onFocus={() => setIsTagMenuOpen(true)}
                    onBlur={() => setTimeout(() => setIsTagMenuOpen(false), 200)}
                    className="w-full bg-transparent text-sm text-neutral-200 placeholder:text-neutral-600 focus:outline-none"
                 />
             </div>
             
             {/* Tag Menu Reuse (Simpler version) */}
             <AnimatePresence>
                 {isTagMenuOpen && (
                   <motion.div
                     initial={{ opacity: 0, y: 5 }}
                     animate={{ opacity: 1, y: 0 }}
                     exit={{ opacity: 0, y: 5 }}
                     className="absolute top-full left-0 mt-1 w-full max-h-48 overflow-y-auto bg-neutral-900 border border-neutral-800 rounded-lg shadow-xl py-1 z-50 scroller"
                     style={{ maxHeight: '200px' }}
                   >
                     {availableTags.filter(t => t.name.toLowerCase().includes(tagName.toLowerCase())).map(t => (
                       <button
                         key={t.id}
                         onClick={() => setTagName(t.name)}
                         className="w-full text-left px-3 py-2 text-xs text-neutral-300 hover:bg-neutral-800 hover:text-white flex items-center justify-between group/item"
                       >
                         <span>{t.name}</span>
                       </button>
                     ))}
                     {tagName && !availableTags.some(t => t.name.toLowerCase() === tagName.toLowerCase()) && (
                       <div className="px-3 py-2 text-xs text-neutral-500 border-t border-neutral-800/50 italic">
                         Create "{tagName}"
                       </div>
                     )}
                   </motion.div>
                 )}
             </AnimatePresence>
          </div>
        </div>

        <div className="p-4 bg-neutral-950/50 border-t border-neutral-800 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium text-neutral-400 hover:text-white hover:bg-neutral-800 transition-all"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            disabled={!goal.trim()}
            className="px-4 py-2 rounded-lg text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save Changes
          </button>
        </div>
      </motion.div>
    </div>
  );
};
