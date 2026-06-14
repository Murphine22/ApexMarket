import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useEffect } from 'react';

// "Liquid morphing" modal: scales out of the clicked origin instead of a hard
// rectangular modal, creating an organic flow that captures attention.
export default function Modal({ open, onClose, title, children, origin }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    if (open) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const originStyle = origin
    ? { transformOrigin: `${origin.x}px ${origin.y}px` }
    : undefined;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 grid place-items-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0 bg-navy-950/70 backdrop-blur-md"
            onClick={onClose}
          />
          <motion.div
            className="relative z-10 w-full max-w-lg card glass-strong p-6 morph-origin"
            style={originStyle}
            initial={{ scale: 0.6, opacity: 0, filter: 'blur(8px)' }}
            animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
            exit={{ scale: 0.7, opacity: 0, filter: 'blur(6px)' }}
            transition={{ type: 'spring', stiffness: 300, damping: 26 }}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold">{title}</h3>
              <button className="btn-ghost px-2 py-2" onClick={onClose}>
                <X size={16} />
              </button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
