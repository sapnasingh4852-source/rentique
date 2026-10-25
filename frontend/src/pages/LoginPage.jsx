import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles,
  ShieldCheck,
  ArrowRight,
  Lock,
  Mail,
  User,
  Store,
  ShoppingBag,
  Truck,
  Wallet,
  Camera
} from 'lucide-react';
import { LogoMark } from '../components/common/Logo';

const ROLE_META = {
  CUSTOMER: {
    label: 'Customer',
    blurb: 'Rent outfits & jewellery',
    eyebrow: 'Ananya Sharma',
    icon: ShoppingBag
  },
  ADMIN: {
    label: 'Boutique',
    blurb: 'List, dispatch & inspect returns',
    eyebrow: 'Pooja Mehta',
    icon: Store
  }
};

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [role, setRole] = useState('CUSTOMER');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login, register, switchRole } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      if (isRegister) {
        await register({ name, email, password, role });
      } else {
        await login(email, password);
      }
      sessionStorage.setItem('rentique_role_selected', 'true');
      if (role === 'ADMIN') {
        navigate('/admin');
      } else if (role === 'DELIVERY_PARTNER') {
        navigate('/delivery');
      } else {
        navigate('/catalog');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed. Please check credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleTestLogin = async (targetRole) => {
    await switchRole(targetRole);
    sessionStorage.setItem('rentique_role_selected', 'true');
    if (targetRole === 'ADMIN') {
      navigate('/admin');
    } else if (targetRole === 'DELIVERY_PARTNER') {
      navigate('/delivery');
    } else {
      navigate('/catalog');
    }
  };

  return (
    <div className="shell flex min-h-[calc(100vh-9rem)] items-center justify-center py-12">
      <div className="grid w-full max-w-4xl overflow-hidden rounded-[28px] border border-line bg-surface shadow-lift md:grid-cols-[0.9fr_1.1fr]">
        {/* Brand rail */}
        <aside className="relative hidden overflow-hidden bg-plum-deep p-8 text-paper md:flex md:flex-col md:justify-between">
          <div className="jaali-pattern absolute inset-0 opacity-25" aria-hidden="true" />
          <div className="relative">
            <div className="flex items-center gap-3">
              <LogoMark size={44} />
              <div>
                <p className="font-display text-2xl font-semibold leading-none">Rentique</p>
                <p className="mt-1 text-[9px] font-semibold uppercase tracking-[0.24em] text-gold">
                  The celebration wardrobe
                </p>
              </div>
            </div>
            <h2 className="mt-10 font-display text-[2rem] leading-[1.05]">
              Your wardrobe,
              <br />
              <span className="italic text-gold">for the occasion.</span>
            </h2>
            <p className="mt-3 max-w-[16rem] text-xs leading-relaxed text-paper/60">
              Sign in to track rentals, review studio photographs and settle deposits back to your wallet.
            </p>
          </div>

          <div className="relative mt-10 space-y-3 text-[11px] text-paper/70">
            <div className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-full border border-gold/30 text-gold">
                <Camera className="h-3.5 w-3.5" />
              </span>
              Visual condition proof
            </div>
            <div className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-full border border-gold/30 text-gold">
                <Wallet className="h-3.5 w-3.5" />
              </span>
              Security deposit, returned
            </div>
            <div className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-full border border-gold/30 text-gold">
                <ShieldCheck className="h-3.5 w-3.5" />
              </span>
              Inspected before dispatch
            </div>
          </div>
        </aside>

        {/* Form */}
        <div className="p-6 sm:p-8">
          <div className="text-center">
            <span className="eyebrow text-saffron">Rentique secure gateway</span>
            <h1 className="mt-2 font-display text-3xl font-semibold text-ink">
              {isRegister ? 'Join Rentique' : 'Welcome back.'}
            </h1>
            <p className="mx-auto mt-1 max-w-sm text-xs text-muted">
              {isRegister
                ? 'Create an account to rent designer wear or list your boutique.'
                : 'Sign in to manage your wardrobe, deposit refunds and boutique listings.'}
            </p>
          </div>

          <div className="mt-6 rounded-2xl border border-line bg-paper p-4">
            <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-plum">
              <Sparkles className="h-3.5 w-3.5 text-saffron" />
              One-click demo entry
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {Object.entries(ROLE_META).map(([key, meta]) => {
                const Icon = meta.icon;
                return (
                  <button
                    key={key}
                    onClick={() => handleTestLogin(key)}
                    className="group rounded-xl border border-line bg-surface p-3 text-left transition hover:border-plum/40 hover:shadow-soft"
                  >
                    <div className="flex items-center gap-1.5">
                      <Icon className="h-3.5 w-3.5 text-plum" />
                      <span className="text-[11px] font-semibold text-ink">{meta.label}</span>
                    </div>
                    <p className="mt-1 text-[10px] leading-snug text-muted">{meta.blurb}</p>
                    <p className="mt-1.5 text-[9px] uppercase tracking-[0.12em] text-muted/70">{meta.eyebrow}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {error && (
            <div className="mt-4 rounded-xl border border-rani/25 bg-rani/5 px-4 py-3 text-[11px] text-rani">
              {error}
            </div>
          )}

          <div className="mt-5 flex rounded-full border border-line bg-paper p-1 text-[11px]">
            <button
              type="button"
              onClick={() => setRole('CUSTOMER')}
              className={`flex-1 rounded-full py-1.5 font-semibold transition ${
                role === 'CUSTOMER' ? 'bg-ink text-paper' : 'text-muted hover:text-ink'
              }`}
            >
              Rent as customer
            </button>
            <button
              type="button"
              onClick={() => setRole('ADMIN')}
              className={`flex-1 rounded-full py-1.5 font-semibold transition ${
                role === 'ADMIN' ? 'bg-ink text-paper' : 'text-muted hover:text-ink'
              }`}
            >
              List as boutique
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
            {isRegister && (
              <label className="block">
                <span className="mb-1 block text-[11px] font-medium text-ink">Full name</span>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted/60" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Radhika Sharma"
                    className="field pl-10"
                  />
                </div>
              </label>
            )}

            <label className="block">
              <span className="mb-1 block text-[11px] font-medium text-ink">Email address</span>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted/60" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@domain.com"
                  className="field pl-10"
                />
              </div>
            </label>

            <label className="block">
              <span className="mb-1 block text-[11px] font-medium text-ink">Password</span>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted/60" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="field pl-10"
                />
              </div>
            </label>

            <button type="submit" disabled={submitting} className="btn-primary w-full justify-center">
              {submitting
                ? 'Authenticating…'
                : isRegister
                  ? `Create ${role === 'ADMIN' ? 'boutique' : 'customer'} account`
                  : `Sign in as ${role === 'ADMIN' ? 'boutique' : 'customer'}`}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-line pt-4 text-[11px] text-muted">
            <button
              onClick={() => setIsRegister(!isRegister)}
              className="font-semibold text-plum hover:underline"
            >
              {isRegister ? 'Already registered? Sign in' : "New here? Create an account"}
            </button>

            <button
              onClick={() => handleTestLogin('DELIVERY_PARTNER')}
              className="inline-flex items-center gap-1.5 transition hover:text-ink"
            >
              <Truck className="h-3.5 w-3.5" />
              Logistics partner
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
