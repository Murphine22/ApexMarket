import { motion } from 'framer-motion';
import { useUiStore } from '../store/useUiStore';

// Page-level transition. Uses spring physics for an organic feel.
export function Page({ children, className }) {
  const reduceMotion = useUiStore((s) => s.reduceMotion);
  return (
    <motion.div
      className={className}
      initial={reduceMotion ? false : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduceMotion ? undefined : { opacity: 0, y: -10 }}
      transition={{ type: 'spring', stiffness: 260, damping: 28 }}
    >
      {children}
    </motion.div>
  );
}

// Staggered container + item for organic list reveals.
export const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};

export const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 280, damping: 26 } },
};
