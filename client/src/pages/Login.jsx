import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Mail, Lock, User, ArrowRight, ShieldCheck } from 'lucide-react';
import Logo from '../components/Logo';
import { useAuthStore } from '../store/useAuthStore';
import { dataService } from '../lib/dataService';
import { playChime } from '../lib/utils';
import { useUiStore } from '../store/useUiStore';
import usePageTitle from '../hooks/usePageTitle';

export default function Login() {
  usePageTitle('Sign in');
  const navigate = useNavigate();
  const { login, register, loading } = useAuthStore();
  const soundEnabled = useUiStore((s) => s.soundEnabled);
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: 'admin@apexmarket.io', password: 'admin123', role: 'staff' });

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    try {
      if (mode === 'login') {
        const user = await login(form.email, form.password);
        toast.success(`Welcome back, ${user.name.split(' ')[0]}!`);
      } else {
        const user = await register(form);
        toast.success(`Account created — welcome, ${user.name.split(' ')[0]}!`);
      }
      playChime(soundEnabled);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message || 'Authentication failed');
    }
  };

  const quickFill = (email, password) => setForm((f) => ({ ...f, email, password }));

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Floating ambient orbs for trust & stability */}
      <motion.div
        className="pointer-events-none absolute -left-24 top-1/4 h-72 w-72 rounded-full bg-safe-500/20 blur-3xl"
        animate={{ y: [0, 30, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="pointer-events-none absolute -right-24 bottom-1/4 h-80 w-80 rounded-full bg-sky-500/20 blur-3xl"
        animate={{ y: [0, -30, 0] }}
        transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="relative z-10 grid min-h-screen lg:grid-cols-2">
        {/* Brand / value panel */}
        <div className="hidden lg:flex flex-col justify-between p-12">
          <Logo size={44} />
          <div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 120 }}
              className="max-w-md text-4xl font-extrabold leading-tight"
            >
              Retail operations,{' '}
              <span className="bg-gradient-to-r from-safe-400 to-sky-400 bg-clip-text text-transparent">
                reimagined.
              </span>
            </motion.h1>
            <p className="mt-4 max-w-md text-slate-400">
              ApexMarket blends production-grade security with an interface engineered around how
              your team actually thinks — calm when it should be, urgent when it matters.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              {['Role-based access', 'Real-time inventory', 'Atomic POS', 'Audit trail'].map((f) => (
                <span key={f} className="chip bg-white/5 text-slate-300">
                  <ShieldCheck size={13} className="text-safe-400" /> {f}
                </span>
              ))}
            </div>
          </div>
          <p className="text-xs text-slate-600">© {new Date().getFullYear()} ApexMarket</p>
        </div>

        {/* Auth card */}
        <div className="flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 22 }}
            className="card glass-strong w-full max-w-md p-8"
          >
            <div className="mb-6 lg:hidden">
              <Logo />
            </div>
            <h2 className="text-2xl font-bold">
              {mode === 'login' ? 'Sign in' : 'Create your account'}
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              {mode === 'login'
                ? 'Access your ApexMarket dashboard.'
                : 'Join your store team in seconds.'}
            </p>

            <form onSubmit={submit} className="mt-6 space-y-4">
              {mode === 'register' && (
                <div>
                  <label className="label">Full name</label>
                  <div className="relative">
                    <User size={16} className="absolute left-3 top-3 text-slate-500" />
                    <input
                      name="name"
                      required
                      value={form.name}
                      onChange={onChange}
                      placeholder="Jane Doe"
                      className="input pl-9"
                    />
                  </div>
                </div>
              )}
              <div>
                <label className="label">Email</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-3 text-slate-500" />
                  <input
                    name="email"
                    type="email"
                    required
                    value={form.email}
                    onChange={onChange}
                    placeholder="you@apexmarket.io"
                    className="input pl-9"
                  />
                </div>
              </div>
              <div>
                <label className="label">Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-3 text-slate-500" />
                  <input
                    name="password"
                    type="password"
                    required
                    value={form.password}
                    onChange={onChange}
                    placeholder="••••••••"
                    className="input pl-9"
                  />
                </div>
              </div>
              {mode === 'register' && (
                <div>
                  <label className="label">Role</label>
                  <select name="role" value={form.role} onChange={onChange} className="input">
                    <option value="staff">Staff</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              )}

              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}
                <ArrowRight size={16} />
              </button>
            </form>

            <div className="mt-5 text-center text-sm text-slate-400">
              {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
              <button
                onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                className="font-semibold text-safe-400 hover:underline"
              >
                {mode === 'login' ? 'Create one' : 'Sign in'}
              </button>
            </div>

            {dataService.mode === 'demo' && (
              <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-slate-400">
                <p className="mb-2 font-medium text-slate-300">Demo accounts — click to fill:</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => quickFill('admin@apexmarket.io', 'admin123')}
                    className="chip bg-safe-500/15 text-safe-400 hover:bg-safe-500/25"
                  >
                    admin@apexmarket.io
                  </button>
                  <button
                    type="button"
                    onClick={() => quickFill('staff@apexmarket.io', 'staff123')}
                    className="chip bg-sky-500/15 text-sky-300 hover:bg-sky-500/25"
                  >
                    staff@apexmarket.io
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
