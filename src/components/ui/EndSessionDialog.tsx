
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Icon } from '@iconify/react';
import { FlowScore, Bottlenecks } from '../../types';

interface EndSessionDialogProps {
  onClose: () => void;
  onSave: (data: { 
    flowScore: FlowScore; 
    interruptions: number; 
    shipped: boolean; 
    bottleneck: Bottlenecks;
    notes: string;
  }) => void;
}

export const EndSessionDialog: React.FC<EndSessionDialogProps> = ({ onClose, onSave }) => {
  const [flowScore, setFlowScore] = useState<FlowScore>(3);
  const [interruptions, setInterruptions] = useState(0);
  const [shipped, setShipped] = useState(false);
  const [notes, setNotes] = useState('');
  const [bottleneck, setBottleneck] = useState<Bottlenecks>({
    thinking: 25,
    coding: 25,
    debugging: 25,
    waiting: 25
  });

  const handleBottleneckChange = (key: keyof Bottlenecks, val: string) => {
    const num = parseInt(val) || 0;
    setBottleneck(prev => ({ ...prev, [key]: num }));
  };

  const totalBottleneck = (Object.values(bottleneck) as number[]).reduce((a, b) => a + b, 0);
  const isValid = totalBottleneck === 100;

  const handleSave = () => {
    if (!isValid) return;
    onSave({
      flowScore,
      interruptions,
      shipped,
      bottleneck,
      notes
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-neutral-950/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 8 }}
        className="relative bg-[#111] border border-neutral-800 p-8 rounded-2xl w-full max-w-lg space-y-8 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-start">
          <h2 className="text-xl font-bold text-neutral-100 tracking-tight">Session Review</h2>
          <button onClick={onClose} className="text-neutral-500 hover:text-white transition-colors">
            <Icon icon="lucide:x" className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Flow Rating */}
          <section className="space-y-3">
            <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Flow Quality (1-5)</label>
            <div className="flex justify-between gap-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  onClick={() => setFlowScore(s as FlowScore)}
                  className={`flex-1 py-3 rounded-lg border mono text-lg transition-all ${
                    flowScore === s 
                      ? 'bg-neutral-100 text-neutral-950 border-neutral-100' 
                      : 'bg-neutral-900/50 text-neutral-400 border-neutral-800 hover:border-neutral-700'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </section>

          {/* Shipped & Interruptions */}
          <div className="grid grid-cols-2 gap-4">
            <section className="space-y-2">
              <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Shipped?</label>
              <button 
                onClick={() => setShipped(!shipped)}
                className={`w-full py-3 rounded-lg border font-semibold flex items-center justify-center gap-2 transition-all ${
                  shipped 
                    ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' 
                    : 'bg-neutral-900/50 text-neutral-500 border-neutral-800'
                }`}
              >
                {shipped && <Icon icon="lucide:check" className="w-4 h-4" />}
                {shipped ? 'Yes' : 'No'}
              </button>
            </section>
            <section className="space-y-2">
              <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Interruptions</label>
              <input 
                type="number"
                min="0"
                value={interruptions}
                onChange={(e) => setInterruptions(parseInt(e.target.value) || 0)}
                className="w-full bg-neutral-900/50 border border-neutral-800 text-neutral-200 py-3 px-4 rounded-lg focus:outline-none focus:border-neutral-600 mono"
              />
            </section>
          </div>

          {/* Bottlenecks */}
          <section className="space-y-4">
             <div className="flex items-center justify-between">
               <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Bottleneck Allocation (%)</label>
               <span className={`text-[10px] font-bold mono ${isValid ? 'text-green-500' : 'text-red-500'}`}>
                 Total: {totalBottleneck}%
               </span>
             </div>
             <div className="grid grid-cols-2 gap-x-4 gap-y-3">
               {Object.entries(bottleneck).map(([key, value]) => (
                 <div key={key} className="flex items-center gap-2">
                   <span className="text-[10px] text-neutral-400 uppercase w-16 truncate">{key}</span>
                   <input 
                     type="number"
                     min="0"
                     max="100"
                     value={value}
                     onChange={(e) => handleBottleneckChange(key as keyof Bottlenecks, e.target.value)}
                     className="flex-1 bg-neutral-900/50 border border-neutral-800 text-neutral-300 text-sm py-1 px-2 rounded focus:outline-none focus:border-neutral-600 mono"
                   />
                 </div>
               ))}
             </div>
             {!isValid && (
               <p className="text-[10px] text-red-500/70 italic">* Percentages must sum to 100%</p>
             )}
          </section>

          {/* Notes section */}
          <section className="space-y-2">
            <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Notes / Output</label>
            <textarea 
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="What did you achieve or what blocked you?"
              rows={3}
              className="w-full bg-neutral-900/50 border border-neutral-800 text-neutral-200 py-3 px-4 rounded-lg focus:outline-none focus:border-neutral-600 text-sm resize-none"
            />
          </section>
        </div>

        <button 
          onClick={handleSave}
          disabled={!isValid}
          className="w-full bg-neutral-100 hover:bg-white text-neutral-950 py-4 rounded-xl font-bold transition-all text-sm uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Save Session
        </button>
      </motion.div>
    </div>
  );
};
