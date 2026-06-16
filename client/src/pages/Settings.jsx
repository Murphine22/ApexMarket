import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Volume2, Eye, Activity, Database, RotateCcw, ShieldCheck, Sun } from 'lucide-react';
import { Page } from '../components/Motion';
import PageHeader from '../components/PageHeader';
import { useUiStore } from '../store/useUiStore';
import { useAuthStore } from '../store/useAuthStore';
import { dataService } from '../lib/dataService';
import { resetDemoDb } from '../lib/demoDb';
import { useQueryClient } from '@tanstack/react-query';
import { cn } from '../lib/utils';
import usePageTitle from '../hooks/usePageTitle';

function Toggle({ checked, onChange }) {
  return (
    <button
      onClick={onChange}
      className={cn(
        'relative h-6 w-11 rounded-full transition-colors',
        checked ? 'bg-safe-500' : 'bg-white/15'
      )}
    >
      <motion.span
        layout
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className={cn('absolute top-0.5 h-5 w-5 rounded-full bg-white', checked ? 'left-[22px]' : 'left-0.5')}
      />
    </button>
  );
}

function Row({ icon: Icon, title, desc, children }) {
  return (
    <div className="flex items-center justify-between gap-4 py-4">
      <div className="flex items-start gap-3">
        <div className="grid h-9 w-9 place-items-center rounded-lg bg-white/5 text-safe-400">
          <Icon size={17} />
        </div>
        <div>
          <p className="font-medium">{title}</p>
          <p className="text-xs text-slate-400">{desc}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

export default function Settings() {
  usePageTitle('Settings');
  const qc = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const {
    soundEnabled,
    toggleSound,
    focusMode,
    toggleFocusMode,
    reduceMotion,
    toggleReduceMotion,
    theme,
    toggleTheme,
  } = useUiStore();

  const resetDemo = () => {
    resetDemoDb();
    qc.invalidateQueries();
    toast.success('Demo data reset to defaults');
  };

  return (
    <Page>
      <PageHeader title="Settings" subtitle="Tune the experience and review your account." />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card divide-y divide-white/5 p-5">
          <h3 className="pb-3 font-semibold">Experience</h3>
          <Row icon={Sun} title="Light theme" desc="Switch between the dark and light appearance.">
            <Toggle checked={theme === 'light'} onChange={toggleTheme} />
          </Row>
          <Row icon={Volume2} title="Sound cues" desc="Harmonic chime on high-value actions.">
            <Toggle checked={soundEnabled} onChange={toggleSound} />
          </Row>
          <Row icon={Eye} title="Focus mode" desc="Cognitive narrowing during detailed tasks.">
            <Toggle checked={focusMode} onChange={toggleFocusMode} />
          </Row>
          <Row icon={Activity} title="Reduce motion" desc="Minimise animations for accessibility.">
            <Toggle checked={reduceMotion} onChange={toggleReduceMotion} />
          </Row>
        </div>

        <div className="card divide-y divide-white/5 p-5">
          <h3 className="pb-3 font-semibold">Account</h3>
          <Row icon={ShieldCheck} title={user?.name} desc={user?.email}>
            <span className={cn('chip', user?.role === 'admin' ? 'bg-safe-500/15 text-safe-400' : 'bg-sky-500/15 text-sky-300')}>
              {user?.role}
            </span>
          </Row>
          <Row icon={Database} title="Data source" desc="Where the app reads and writes data.">
            <span className={cn('chip', dataService.mode === 'api' ? 'bg-safe-500/15 text-safe-400' : 'bg-amber-500/15 text-amber-400')}>
              {dataService.mode === 'api' ? 'Live API' : 'Demo mode'}
            </span>
          </Row>
          {dataService.mode === 'demo' && (
            <Row icon={RotateCcw} title="Reset demo data" desc="Restore products, sales and logs to defaults.">
              <button className="btn-ghost" onClick={resetDemo}>
                <RotateCcw size={15} /> Reset
              </button>
            </Row>
          )}
        </div>
      </div>
    </Page>
  );
}
