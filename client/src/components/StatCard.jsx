import { motion } from 'framer-motion';
import { cn } from '../lib/utils';

export default function StatCard({ icon: Icon, label, value, hint, accent = 'safe', delay = 0 }) {
  const accents = {
    safe: 'from-safe-500/20 to-safe-500/0 text-safe-400',
    sky: 'from-sky-500/20 to-sky-500/0 text-sky-300',
    amber: 'from-amber-500/20 to-amber-500/0 text-amber-400',
    rose: 'from-rose-500/20 to-rose-500/0 text-rose-300',
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 260, damping: 24, delay }}
      whileHover={{ y: -4 }}
      className="card relative overflow-hidden p-5"
    >
      <div
        className={cn(
          'absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br blur-xl',
          accents[accent]
        )}
      />
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider text-slate-400">{label}</p>
          <p className="mt-2 text-2xl font-extrabold tracking-tight">{value}</p>
          {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
        </div>
        {Icon && (
          <div className={cn('grid h-11 w-11 place-items-center rounded-xl bg-white/5', accents[accent])}>
            <Icon size={20} />
          </div>
        )}
      </div>
    </motion.div>
  );
}
