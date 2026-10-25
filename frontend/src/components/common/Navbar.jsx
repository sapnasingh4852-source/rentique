import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Bell,
  ChevronDown,
  LogOut,
  Menu,
  Search,
  ShoppingBag,
  Store,
  Truck,
  User,
  Wallet,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Logo from './Logo';
import RoleSelectionModal from './RoleSelectionModal';

const NAV_LINKS = [
  { label: 'Lehengas', to: '/catalog?collection=lehengas' },
  { label: 'Sarees', to: '/catalog?collection=sarees' },
  { label: 'Suits & Gowns', to: '/catalog?collection=suits,gowns' },
  { label: 'Jewellery', to: '/catalog?collection=jewellery' },
  { label: 'Men', to: '/catalog?collection=menswear' },
  { label: 'Accessories', to: '/catalog?collection=bags,footwear' }
];

const ROLE_LABELS = {
  CUSTOMER: 'Customer',
  ADMIN: 'Boutique',
  DELIVERY_PARTNER: 'Logistics'
};

function AccountButton({ user }) {
  if (!user) {
    return (
      <Link
        to="/login"
        className="inline-flex h-10 items-center gap-2 rounded-full bg-ink px-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-paper transition hover:bg-plum-deep"
      >
        <User className="h-4 w-4 text-gold" />
        <span>Sign in</span>
      </Link>
    );
  }

  const role = user.role;

  if (role === 'ADMIN') {
    return (
      <Link
        to="/admin"
        className="inline-flex h-10 items-center gap-2 rounded-full bg-plum px-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-paper transition hover:bg-plum-deep"
      >
        <Store className="h-4 w-4 text-gold" />
        <span className="hidden sm:inline">Seller studio</span>
      </Link>
    );
  }
  if (role === 'DELIVERY_PARTNER') {
    return (
      <Link
        to="/delivery"
        className="inline-flex h-10 items-center gap-2 rounded-full bg-forest px-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-forest-deep"
      >
        <Truck className="h-4 w-4" />
        <span className="hidden sm:inline">Logistics</span>
      </Link>
    );
  }
  return (
    <Link
      to="/dashboard"
      className="inline-flex h-10 items-center gap-2 rounded-full bg-plum px-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-paper transition hover:bg-plum-deep"
    >
      <ShoppingBag className="h-4 w-4 text-gold" />
      <span className="hidden sm:inline">My wardrobe</span>
    </Link>
  );
}

export default function Navbar({ onSearch }) {
  const { user, switchRole, notifications, logout } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [roleOpen, setRoleOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setMobileOpen(false);
    setMobileSearchOpen(false);
    setRoleOpen(false);
    setNotifOpen(false);
  }, [location.pathname, location.search]);

  const unreadCount = (notifications || []).filter((n) => !n.read).length;
  const role = user?.role || 'CUSTOMER';

  const submitSearch = (event) => {
    event.preventDefault();
    const query = searchTerm.trim();
    if (onSearch) onSearch(query);
    navigate(query ? `/catalog?search=${encodeURIComponent(query)}` : '/catalog');
    setMobileOpen(false);
    setMobileSearchOpen(false);
  };

  const handleRoleSwitch = (nextRole) => {
    switchRole(nextRole);
    setRoleOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-paper/95 backdrop-blur-xl">
        {/* Announcement rail */}
        <div className="bg-plum-deep text-paper/80">
          <div className="shell flex h-8 items-center justify-between gap-4">
            <div className="min-w-0 overflow-hidden">
              <div className="marquee-track gap-8 text-[9px] font-medium uppercase tracking-[0.18em] sm:text-[10px]">
                {[0, 1].map((copy) => (
                  <div key={copy} className="flex shrink-0 items-center gap-8" aria-hidden={copy === 1}>
                    <span className="text-saffron">Complimentary dry-clean &amp; steam press</span>
                    <span className="h-1 w-1 rounded-full bg-gold/60" />
                    <span>100% refundable security deposit</span>
                    <span className="h-1 w-1 rounded-full bg-gold/60" />
                    <span className="text-gold">Front, fabric &amp; tag inspection on every piece</span>
                    <span className="h-1 w-1 rounded-full bg-gold/60" />
                    <span>Free delivery on 3-day rentals</span>
                    <span className="h-1 w-1 rounded-full bg-gold/60" />
                  </div>
                ))}
              </div>
            </div>

            <div className="relative hidden shrink-0 sm:block">
              <button
                type="button"
                onClick={() => setRoleOpen((open) => !open)}
                className="flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-[0.16em] text-paper/70 transition hover:text-paper"
                aria-expanded={roleOpen}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                {user ? `Demo: ${ROLE_LABELS[role]}` : 'Guest preview'}
                <ChevronDown className={`h-3 w-3 transition ${roleOpen ? 'rotate-180' : ''}`} />
              </button>
              {roleOpen && (
                <div className="absolute right-0 top-full z-50 mt-3 w-60 rounded-2xl border border-line bg-surface p-2 shadow-lift">
                  {user && (
                    <div className="mb-1 border-b border-line px-2 pb-2 pt-1">
                      <p className="truncate text-xs font-semibold text-ink">{user.name}</p>
                      <p className="truncate text-[10px] text-muted">{user.email}</p>
                    </div>
                  )}
                  <p className="px-2 pb-1.5 pt-1 text-[9px] font-semibold uppercase tracking-[0.18em] text-muted">
                    View the demo as
                  </p>
                  {Object.entries(ROLE_LABELS).map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => handleRoleSwitch(value)}
                      className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs transition ${
                        role === value ? 'bg-plum text-paper' : 'text-ink hover:bg-plum/5'
                      }`}
                    >
                      <span>{label}</span>
                      {role === value && <span className="text-[9px] uppercase tracking-wider text-gold">Active</span>}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      setRoleOpen(false);
                      setRoleModalOpen(true);
                    }}
                    className="mt-1 w-full rounded-xl border-t border-line px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-[0.14em] text-muted hover:text-plum"
                  >
                    Login options
                  </button>
                  {user && (
                    <button
                      type="button"
                      onClick={() => {
                        setRoleOpen(false);
                        logout();
                      }}
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-[0.14em] text-rani hover:bg-rani/5"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      Sign out
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main bar */}
        <div className="border-b border-line/80">
          <div className="shell flex h-[74px] items-center gap-3 sm:gap-5">
            <Logo size={40} className="shrink-0" />

            <nav className="ml-1 hidden shrink-0 items-center gap-0.5 xl:flex">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.label}
                  to={link.to}
                  className="whitespace-nowrap rounded-full px-3 py-2 text-[12px] font-medium text-ink/75 transition hover:bg-plum/5 hover:text-plum"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="ml-auto flex min-w-0 flex-1 items-center justify-end gap-1.5 sm:gap-2">
              <form onSubmit={submitSearch} className="relative hidden w-full max-w-[310px] lg:block">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                <input
                  type="search"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search lehengas, kundan, sherwani…"
                  aria-label="Search the catalog"
                  className="h-10 w-full rounded-full border border-line bg-surface pl-10 pr-9 text-xs text-ink placeholder:text-muted/70 focus:border-saffron focus:outline-none focus:ring-2 focus:ring-saffron/15"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-plum"
                    aria-label="Clear search"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </form>

              <button
                type="button"
                onClick={() => setMobileSearchOpen((open) => !open)}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-surface text-ink/70 transition hover:border-plum/30 hover:text-plum lg:hidden"
                aria-label="Search"
              >
                {mobileSearchOpen ? <X className="h-4 w-4" /> : <Search className="h-4 w-4" />}
              </button>

              {user?.role === 'CUSTOMER' && (
                <Link
                  to="/dashboard"
                  className="hidden h-10 items-center gap-1.5 rounded-full border border-forest/20 bg-forest-soft px-3 text-[11px] font-semibold text-forest transition hover:border-forest/40 sm:flex"
                  title="Refundable deposit held in your wallet"
                >
                  <Wallet className="h-3.5 w-3.5" />
                  <span>₹{(user?.walletBalance || 0).toLocaleString('en-IN')}</span>
                </Link>
              )}

              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setNotifOpen((open) => !open);
                    setRoleOpen(false);
                  }}
                  className="relative flex h-10 w-10 items-center justify-center rounded-full border border-line bg-surface text-ink/70 transition hover:border-plum/30 hover:text-plum"
                  aria-label="Notifications"
                >
                  <Bell className="h-4 w-4" />
                  {unreadCount > 0 && (
                    <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-saffron ring-2 ring-surface" />
                  )}
                </button>

                {notifOpen && (
                  <>
                    <button
                      type="button"
                      className="fixed inset-0 z-30 cursor-default"
                      onClick={() => setNotifOpen(false)}
                      aria-label="Close notifications"
                    />
                    <div className="absolute right-0 top-full z-40 mt-3 w-[310px] rounded-2xl border border-line bg-surface p-4 shadow-lift">
                      <div className="mb-3 flex items-center justify-between border-b border-line pb-2">
                        <p className="font-display text-sm font-semibold text-plum">Rental alerts</p>
                        <span className="text-[9px] uppercase tracking-[0.16em] text-muted">
                          {notifications?.length || 0} updates
                        </span>
                      </div>
                      <div className="max-h-64 space-y-2 overflow-y-auto">
                        {(notifications || []).length === 0 && (
                          <p className="py-4 text-center text-xs text-muted">Nothing here yet.</p>
                        )}
                        {(notifications || []).slice(0, 6).map((notification, index) => (
                          <div key={index} className="rounded-xl bg-paper p-2.5">
                            <p className="text-[11px] font-semibold text-ink">{notification.title}</p>
                            <p className="mt-0.5 text-[11px] leading-relaxed text-muted">{notification.message}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>

              <AccountButton user={user} />

              <button
                type="button"
                onClick={() => setMobileOpen((open) => !open)}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-surface text-ink/70 transition hover:border-plum/30 hover:text-plum xl:hidden"
                aria-label="Menu"
              >
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {mobileSearchOpen && (
            <div className="border-t border-line bg-surface px-4 py-3 lg:hidden">
              <form onSubmit={submitSearch} className="relative mx-auto flex max-w-xl items-center">
                <Search className="pointer-events-none absolute left-3.5 h-4 w-4 text-muted" />
                <input
                  autoFocus
                  type="search"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search the celebration wardrobe…"
                  className="field pl-10"
                />
              </form>
            </div>
          )}
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="border-b border-line bg-surface xl:hidden">
            <div className="shell grid gap-5 py-6">
              <div className="grid grid-cols-2 gap-2">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.label}
                    to={link.to}
                    className="rounded-xl border border-line bg-paper px-3 py-2.5 text-xs font-medium text-ink transition hover:border-plum/30 hover:text-plum"
                  >
                    {link.label}
                  </Link>
                ))}
                <Link
                  to="/catalog"
                  className="rounded-xl bg-plum px-3 py-2.5 text-xs font-semibold text-paper"
                >
                  View all 136 pieces
                </Link>
                <Link
                  to="/dashboard"
                  className="rounded-xl border border-forest/20 bg-forest-soft px-3 py-2.5 text-xs font-semibold text-forest"
                >
                  Wallet ₹{(user?.walletBalance || 0).toLocaleString('en-IN')}
                </Link>
              </div>

              <div className="rounded-2xl border border-line bg-paper p-3">
                <p className="mb-2 text-[9px] font-semibold uppercase tracking-[0.18em] text-muted">
                  Demo view
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(ROLE_LABELS).map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => handleRoleSwitch(value)}
                      className={`rounded-xl px-2 py-2 text-[10px] font-semibold uppercase tracking-wider transition ${
                        role === value ? 'bg-plum text-paper' : 'border border-line bg-surface text-ink'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 text-[11px] text-muted">
                <button type="button" onClick={() => setRoleModalOpen(true)} className="font-semibold text-plum underline">
                  Login options
                </button>
                {user ? (
                  <button type="button" onClick={logout} className="hover:text-plum">
                    Sign out
                  </button>
                ) : (
                  <Link to="/login" className="font-semibold text-plum underline">
                    Sign in
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      <RoleSelectionModal isOpen={roleModalOpen} onClose={() => setRoleModalOpen(false)} />
    </>
  );
}
