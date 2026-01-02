import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '@iconify/react';
import { helpContent } from '../../../constants/helpContent';

interface WisdomModalProps {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

export const WisdomModal: React.FC<WisdomModalProps> = ({ isOpen, onOpen, onClose }) => {
  const [quote, setQuote] = useState<{ title: string; content: string } | null>(null);
  const [canClose, setCanClose] = useState(false);

  // Timer for random triggers
  useEffect(() => {
    const checkInterval = setInterval(() => {
      const lastShown = localStorage.getItem('lastWisdomTime');
      const now = Date.now();
      const twoHours = 2 * 60 * 60 * 1000;

      if (!lastShown || now - parseInt(lastShown) > twoHours) {
        if (Math.random() < 0.1) {
          onOpen();
        }
      }
    }, 60000);
    return () => clearInterval(checkInterval);
  }, [onOpen]);

  // Handle Opening (Reset state and pick quote)
  useEffect(() => {
    if (isOpen) {
      const section = helpContent[Math.floor(Math.random() * helpContent.length)];
      const point = section.points[Math.floor(Math.random() * section.points.length)];
      setQuote({
        title: point.title,
        content: point.content
      });
      setCanClose(false);
      localStorage.setItem('lastWisdomTime', Date.now().toString());
    }
  }, [isOpen]);

  const handleClose = () => {
    if (!canClose) return;
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && quote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl p-8 shadow-2xl relative overflow-hidden"
          >
            {/* Background pattern or subtle glow */}
            <div className="absolute top-0 right-0 p-32 bg-blue-500/5 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2 pointer-events-none" />

            <div className="relative z-10 space-y-6 text-center">
              <div className="inline-flex p-3 rounded-full bg-neutral-800/50 border border-neutral-700 mx-auto">
                <Icon icon="lucide:sparkles" className="w-6 h-6 text-yellow-500" />
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-bold text-neutral-100">{quote.title}</h3>
                <div 
                  className="text-neutral-400 leading-relaxed text-sm"
                  dangerouslySetInnerHTML={{ __html: quote.content }} 
                />
              </div>

              <div className="pt-4">
                <CooldownButton onComplete={() => setCanClose(true)} onClick={handleClose} />
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const CooldownButton = ({ onComplete, onClick }: { onComplete: () => void; onClick: () => void }) => {
  const duration = 4; // seconds
  const [disabled, setDisabled] = useState(true);

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`relative w-full py-3 rounded-xl font-semibold text-sm transition-all overflow-hidden group ${
        disabled 
          ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed' 
          : 'bg-neutral-100 text-neutral-950 hover:bg-white cursor-pointer shadow-lg'
      }`}
    >
      <span className="relative z-10">
        {disabled ? 'Reading...' : 'I Acknowledge'}
      </span>
      
      {disabled && (
        <motion.div
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{ duration: duration, ease: 'linear' }}
          onAnimationComplete={() => {
            setDisabled(false);
            onComplete();
          }}
          className="absolute inset-0 bg-neutral-700/50 h-full origin-left"
        />
      )}
    </button>
  );
};
