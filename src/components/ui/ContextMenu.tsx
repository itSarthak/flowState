import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';

interface ContextMenuItem {
  label?: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  variant?: 'default' | 'danger';
  type?: 'item' | 'divider';
}

interface ContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  items: ContextMenuItem[];
}

export const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, onClose, items }) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  // Adjust position if it goes off screen
  const adjustedX = Math.min(x, window.innerWidth - 200);
  const adjustedY = Math.min(y, window.innerHeight - (items.length * 40 + 20));

  return createPortal(
    <AnimatePresence>
      <motion.div
        ref={menuRef}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.1 }}
        style={{ top: adjustedY, left: adjustedX }}
        className="fixed z-[999] bg-[#111] border border-neutral-800 rounded-lg shadow-2xl p-1 w-48 overflow-hidden"
      >
        {items.map((item, idx) => (
          item.type === 'divider' ? (
            <div key={idx} className="h-px bg-neutral-800 my-1 mx-1" />
          ) : (
            <button
              key={idx}
              onClick={() => {
                item.onClick?.();
                onClose();
              }}
              className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-md transition-colors ${
                item.variant === 'danger' 
                  ? 'text-red-400 hover:bg-red-500/10' 
                  : 'text-neutral-300 hover:bg-neutral-800 hover:text-white'
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          )
        ))}
      </motion.div>
    </AnimatePresence>,
    document.body
  );
};
