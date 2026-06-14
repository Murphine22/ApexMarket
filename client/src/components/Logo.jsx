import { motion } from 'framer-motion';

export default function Logo({ size = 36, withText = true }) {
  return (
    <div className="flex items-center gap-3">
      <motion.div
        initial={{ rotate: -8, scale: 0.9 }}
        animate={{ rotate: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 12 }}
        className="grid place-items-center rounded-xl bg-gradient-to-br from-safe-500 to-sky-500 shadow-glow"
        style={{ width: size, height: size }}
      >
        <svg viewBox="0 0 64 64" width={size * 0.62} height={size * 0.62}>
          <path
            d="M14 44 L26 18 L32 30 L38 18 L50 44"
            fill="none"
            stroke="white"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </motion.div>
      {withText && (
        <div className="leading-tight">
          <div className="text-lg font-extrabold tracking-tight">
            Apex<span className="text-safe-400">Market</span>
          </div>
          <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500">
            Management System
          </div>
        </div>
      )}
    </div>
  );
}
