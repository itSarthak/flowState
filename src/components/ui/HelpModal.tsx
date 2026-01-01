import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '@iconify/react';
import { helpContent, HelpPoint } from '../../constants/helpContent';

interface HelpModalProps {
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ onClose }) => {
  const [activeSection, setActiveSection] = useState<number | null>(0);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-neutral-950/95 backdrop-blur-xl"
        onClick={onClose}
      />
      
      {/* Premium Background Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              x: [0, Math.random() * 100 - 50, 0],
              y: [0, Math.random() * 100 - 50, 0],
              opacity: [0.1, 0.3, 0.1],
              scale: [1, 1.2, 1]
            }}
            transition={{
              duration: 10 + Math.random() * 10,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className={`absolute rounded-full blur-[120px]`}
            style={{
              width: '400px',
              height: '400px',
              backgroundColor: i % 2 === 0 ? 'rgba(59, 130, 246, 0.08)' : 'rgba(168, 85, 247, 0.05)',
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 30 }}
        className="relative bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] w-full max-w-5xl max-h-[85vh] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)] flex flex-col"
      >
        {/* Header */}
        <div className="px-8 py-10 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-blue-500/5 to-purple-500/5">
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500/30 blur-xl rounded-full" />
              <div className="relative p-4 bg-neutral-900 border border-white/10 rounded-2xl shadow-inner">
                <Icon icon="lucide:sparkles" className="w-7 h-7 text-blue-400" />
              </div>
            </div>
            <div className="space-y-1">
              <h2 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-neutral-500 tracking-tight">
                The Science of Flow
              </h2>
              <div className="flex items-center gap-2">
                <span className="h-[1px] w-6 bg-blue-500/50" />
                <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-[0.2em]">Deep Work & Shipping Research</p>
              </div>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-3 text-neutral-500 hover:text-white hover:bg-white/5 border border-white/5 rounded-2xl transition-all group"
          >
            <Icon icon="lucide:x" className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-6 custom-scrollbar scroll-smooth">
          {helpContent.map((section, sIdx) => (
            <div key={sIdx} className="space-y-4">
              <button 
                onClick={() => setActiveSection(activeSection === sIdx ? null : sIdx)}
                className={`w-full flex items-center justify-between p-6 rounded-3xl border transition-all duration-300 ${
                  activeSection === sIdx 
                    ? 'bg-neutral-900/60 border-blue-500/30 shadow-[0_4px_30px_rgba(59,130,246,0.1)]' 
                    : 'bg-neutral-900/20 border-white/5 hover:border-white/10'
                } group`}
              >
                <div className="flex items-center gap-5">
                  <div className={`text-sm font-black mono ${activeSection === sIdx ? 'text-blue-400' : 'text-neutral-700'}`}>
                    {String(sIdx + 1).padStart(2, '0')}
                  </div>
                  <h3 className={`text-xl font-bold transition-all ${
                    activeSection === sIdx ? 'text-white translate-x-1' : 'text-neutral-300 group-hover:text-white'
                  }`}>
                    {section.title}
                  </h3>
                </div>
                <Icon 
                  icon="lucide:chevron-right" 
                  className={`w-5 h-5 text-neutral-500 transition-all duration-500 ${activeSection === sIdx ? 'rotate-90 text-blue-400 scale-125' : ''}`} 
                />
              </button>

              <AnimatePresence>
                {activeSection === sIdx && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 p-2 pb-10">
                      {section.points.map((point, pIdx) => (
                        <PointCard key={pIdx} point={point} index={pIdx} />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-10 py-8 border-t border-white/5 bg-neutral-900/10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 p-[1px]">
              <div className="w-full h-full rounded-full bg-[#0a0a0a] flex items-center justify-center">
                <Icon icon="lucide:zap" className="w-4 h-4 text-white" />
              </div>
            </div>
            <p className="text-sm font-medium text-neutral-400 italic">"Flow is the engine of the shipping elite."</p>
          </div>
          
          <div className="flex gap-8">
             <LegendItem color="bg-blue-500" label="Deep Focus" />
             <LegendItem color="bg-purple-500" label="Extreme Output" />
             <LegendItem color="bg-emerald-500" label="High Velocity" />
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const PointCard = ({ point, index }: { point: HelpPoint; index: number }) => {
  const colorMap: Record<string, string> = {
    blue: 'text-blue-400 bg-blue-500/5 border-blue-500/20',
    green: 'text-emerald-400 bg-emerald-500/5 border-emerald-500/20',
    emerald: 'text-emerald-400 bg-emerald-500/5 border-emerald-500/20',
    purple: 'text-purple-400 bg-purple-500/5 border-purple-500/20',
    orange: 'text-orange-400 bg-orange-500/5 border-orange-500/20',
    red: 'text-red-400 bg-red-500/5 border-red-500/20',
    rose: 'text-rose-400 bg-rose-500/5 border-rose-500/20',
    yellow: 'text-yellow-400 bg-yellow-500/5 border-yellow-500/20',
    amber: 'text-amber-400 bg-amber-500/5 border-amber-500/20',
    indigo: 'text-indigo-400 bg-indigo-500/5 border-indigo-500/20',
    cyan: 'text-cyan-400 bg-cyan-500/5 border-cyan-500/20',
    sky: 'text-sky-400 bg-sky-500/5 border-sky-500/20',
    stone: 'text-stone-400 bg-stone-500/5 border-stone-500/20',
  };

  const styleClass = colorMap[point.color] || colorMap.blue;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.5 }}
      className={`flex flex-col justify-between p-6 rounded-[2rem] border relative overflow-hidden group hover:bg-neutral-900/40 transition-all duration-500 ${styleClass}`}
    >
        <div>
            <div className="flex items-start gap-4 mb-4">
                <div className={`p-3 rounded-2xl bg-black/40 border border-white/5 group-hover:scale-110 transition-transform duration-500`}>
                    <Icon icon={point.icon} className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-black uppercase tracking-wider leading-tight text-white/90 pt-1 group-hover:text-white transition-colors">
                    {point.title}
                </h4>
            </div>
      
            <div 
                className="text-sm text-neutral-400 leading-relaxed font-medium space-y-2 whitespace-pre-wrap"
                dangerouslySetInnerHTML={{ __html: point.content }}
            />
        </div>
      

      {point.details && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-5 pt-5 border-t border-white/5"
        >
          <div className="flex gap-2">
            <Icon icon="lucide:info" className="w-3.5 h-3.5 text-neutral-500 mt-0.5 shrink-0" />
            <p className="text-[11px] text-neutral-500 italic leading-relaxed font-medium" dangerouslySetInnerHTML={{ __html: point.details }} />
          </div>
        </motion.div>
      )}

      {/* Hover Gradient Shimmer */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/0 via-white/[0.02] to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 pointer-events-none" />
    </motion.div>
  );
};

const LegendItem = ({ color, label }: { color: string, label: string }) => (
  <div className="flex items-center gap-2.5">
    <div className={`w-1.5 h-1.5 rounded-full ${color} shadow-[0_0_8px_rgba(255,255,255,0.2)]`} />
    <span className="text-[10px] uppercase font-black text-neutral-600 tracking-widest">{label}</span>
  </div>
);
