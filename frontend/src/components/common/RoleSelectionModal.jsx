import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  ShoppingBag,
  Store,
  Sparkles,
  ShieldCheck,
  Wallet,
  Camera,
  ArrowRight,
  X,
  CheckCircle2,
  Truck
} from 'lucide-react';
import { LogoMark } from './Logo';

const PROOFS = [
  { icon: Camera, label: 'Visual condition proof' },
  { icon: Wallet, label: 'Deposit held in your wallet' },
  { icon: ShieldCheck, label: 'Inspected before every dispatch' }
];

const CUSTOMER_PERKS = [
  'Deposit returns to your wallet after inspection',
  'Studio photographs before dispatch',
  'Dry-cleaned, steamed and sealed'
];

const SELLER_PERKS = [
  'Upload front, fabric and tag Cloudinary photo sets',
  'Before / after return inspection studio',
  'Instant deposit settlements to wallet'
];

export default function RoleSelectionModal({ isOpen, onClose }) {
  const { switchRole, login, register } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('CHOICE');
  const [selectedRole, setSelectedRole] = useState('CUSTOMER');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleRoleSelect = async (role) => {
    setSubmitting(true);
    setError('');
    try {
      await switchRole(role);
      sessionStorage.setItem('rentique_role_selected', 'true');
      if (onClose) onClose();
      if (role === 'ADMIN') {
        navigate('/admin');
      } else if (role === 'DELIVERY_PARTNER') {
        navigate('/delivery');
      } else {
        navigate('/catalog');
      }
    } catch (err) {
      setError('Unable to switch persona. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCustomAuth = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      if (activeTab === 'REGISTER') {
        await register({ name, email, password, role: selectedRole });
      } else {
        await login(email, password);
      }
      sessionStorage.setItem('rentique_role_selected', 'true');
      if (onClose) onClose();
      if (selectedRole === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const tabClass = (tab) =>
    `rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] transition ${
      activeTab === tab
        ? 'bg-ink text-paper shadow-soft'
        : 'text-muted hover:bg-ink/5 hover:text-ink'
    }`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-plum-deep/70 p-4 backdrop-blur-sm">
      <div className="relative my-auto w-full max-w-4xl overflow-hidden rounded-[28px] border border-line bg-surface shadow-lift">
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 z-10 rounded-full border border-line bg-surface/90 p-2 text-muted transition hover:text-ink"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="grid md:grid-cols-[0.85fr_1.15fr]">
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
                Wear the heirloom.
                <br />
                <span className="italic text-gold">Keep the deposit.</span>
              </h2>
              <p className="mt-3 max-w-[15rem] text-xs leading-relaxed text-paper/60">
                Designer lehengas, sarees and kundan from India&apos;s finest boutiques — for the days that matter.
              </p>
            </div>

            <div className="relative mt-10 space-y-3">
              {PROOFS.map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2.5 text-[11px] text-paper/70">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full border border-gold/30 text-gold">
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                  {label}
                </div>
              ))}
              <p className="pt-4 text-[10px] uppercase tracking-[0.18em] text-paper/35">
                18 cities · 136 pieces · since 2024
              </p>
            </div>
          </aside>

          {/* Content */}
          <div className="p-6 sm:p-8">
            <div className="flex rounded-full border border-line bg-paper p-1">
              <button onClick={() => setActiveTab('CHOICE')} className={tabClass('CHOICE')}>
                1-click demo
              </button>
              <button
                onClick={() => {
                  setActiveTab('LOGIN');
                  setSelectedRole('CUSTOMER');
                }}
                className={tabClass('LOGIN')}
              >
                Sign in
              </button>
            </div>

            {error && (
              <div className="mt-4 rounded-xl border border-rani/25 bg-rani/5 px-4 py-3 text-[11px] text-rani">
                {error}
              </div>
            )}

            {activeTab === 'CHOICE' ? (
              <div className="mt-5 space-y-3">
                <p className="text-[11px] uppercase tracking-[0.16em] text-muted">
                  Choose how you want to explore the demo
                </p>

                <button
                  onClick={() => handleRoleSelect('CUSTOMER')}
                  disabled={submitting}
                  className="group w-full rounded-2xl border border-line bg-paper p-5 text-left transition hover:border-plum/40 hover:shadow-soft disabled:opacity-60"
                >
                  <div className="flex items-start gap-4">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-plum text-paper">
                      <ShoppingBag className="h-5 w-5" />
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-display text-lg font-semibold text-ink">Rent the wardrobe</h3>
                        <ArrowRight className="h-4 w-4 text-muted transition group-hover:translate-x-0.5 group-hover:text-plum" />
                      </div>
                      <p className="mt-0.5 text-[11px] text-muted">Customer · browse, book and claim your deposit</p>
                      <ul className="mt-3 space-y-1.5">
                        {CUSTOMER_PERKS.map((perk) => (
                          <li key={perk} className="flex items-start gap-1.5 text-[11px] text-muted">
                            <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-forest" />
                            {perk}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => handleRoleSelect('ADMIN')}
                  disabled={submitting}
                  className="group w-full rounded-2xl border border-line bg-paper p-5 text-left transition hover:border-saffron/50 hover:shadow-soft disabled:opacity-60"
                >
                  <div className="flex items-start gap-4">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-saffron text-white">
                      <Store className="h-5 w-5" />
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-display text-lg font-semibold text-ink">List a boutique</h3>
                        <ArrowRight className="h-4 w-4 text-muted transition group-hover:translate-x-0.5 group-hover:text-saffron" />
                      </div>
                      <p className="mt-0.5 text-[11px] text-muted">Seller · catalogue, dispatch proofs and inspections</p>
                      <ul className="mt-3 space-y-1.5">
                        {SELLER_PERKS.map((perk) => (
                          <li key={perk} className="flex items-start gap-1.5 text-[11px] text-muted">
                            <Sparkles className="mt-0.5 h-3 w-3 shrink-0 text-saffron" />
                            {perk}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </button>
              </div>
            ) : (
              <form onSubmit={handleCustomAuth} className="mt-5 space-y-3.5">
                <div className="flex border-b border-line">
                  <button
                    type="button"
                    onClick={() => setSelectedRole('CUSTOMER')}
                    className={`flex-1 border-b-2 pb-2 text-[11px] font-semibold transition ${
                      selectedRole === 'CUSTOMER'
                        ? 'border-plum text-plum'
                        : 'border-transparent text-muted hover:text-ink'
                    }`}
                  >
                    Customer account
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedRole('ADMIN')}
                    className={`flex-1 border-b-2 pb-2 text-[11px] font-semibold transition ${
                      selectedRole === 'ADMIN'
                        ? 'border-saffron text-saffron-deep'
                        : 'border-transparent text-muted hover:text-ink'
                    }`}
                  >
                    Boutique account
                  </button>
                </div>

                {activeTab === 'REGISTER' && (
                  <label className="block">
                    <span className="mb-1 block text-[11px] font-medium text-ink">Full name</span>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Priya Patel"
                      className="field"
                    />
                  </label>
                )}

                <label className="block">
                  <span className="mb-1 block text-[11px] font-medium text-ink">Email address</span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@domain.com"
                    className="field"
                  />
                </label>

                <label className="block">
                  <span className="mb-1 block text-[11px] font-medium text-ink">Password</span>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="field"
                  />
                </label>

                <button type="submit" disabled={submitting} className="btn-primary w-full justify-center">
                  {submitting
                    ? 'Authenticating…'
                    : activeTab === 'REGISTER'
                      ? 'Create account'
                      : 'Sign in'}
                  <ArrowRight className="h-4 w-4" />
                </button>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] text-muted">
                  {activeTab === 'LOGIN' ? (
                    <span>
                      New here?{' '}
                      <button
                        type="button"
                        onClick={() => setActiveTab('REGISTER')}
                        className="font-semibold text-plum hover:underline"
                      >
                        Create an account
                      </button>
                    </span>
                  ) : (
                    <span>
                      Already registered?{' '}
                      <button
                        type="button"
                        onClick={() => setActiveTab('LOGIN')}
                        className="font-semibold text-plum hover:underline"
                      >
                        Sign in
                      </button>
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => setActiveTab('CHOICE')}
                    className="transition hover:text-ink"
                  >
                    Back to 1-click
                  </button>
                </div>
              </form>
            )}

            <div className="mt-6 border-t border-line pt-4">
              <button
                onClick={() => handleRoleSelect('DELIVERY_PARTNER')}
                disabled={submitting}
                className="inline-flex items-center gap-1.5 text-[11px] text-muted transition hover:text-ink"
              >
                <Truck className="h-3.5 w-3.5" />
                Delivery partner? Open the logistics hub
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
