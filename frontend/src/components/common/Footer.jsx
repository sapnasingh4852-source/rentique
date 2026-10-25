import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BadgeCheck,
  Mail,
  MapPin,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Truck
} from 'lucide-react';
import Logo from './Logo';

const COLLECTION_LINKS = [
  { label: 'Bridal lehengas', to: '/catalog?collection=lehengas' },
  { label: 'Banarasi & Kanjeevaram', to: '/catalog?collection=sarees' },
  { label: 'Anarkalis & shararas', to: '/catalog?collection=suits' },
  { label: 'Evening gowns', to: '/catalog?collection=gowns' },
  { label: 'Groom sherwanis', to: '/catalog?collection=menswear' },
  { label: 'Kundan & polki', to: '/catalog?collection=jewellery' },
  { label: 'Potlis & clutches', to: '/catalog?collection=bags' },
  { label: 'Mojaris & juttis', to: '/catalog?collection=footwear' }
];

const GUARANTEES = [
  { icon: ShieldCheck, title: 'Visual proof', text: 'Front, fabric macro and authenticity tag captured before dispatch.' },
  { icon: RotateCcw, title: 'Deposit comes back', text: 'Every rupee of your security deposit returns after inspection.' },
  { icon: Truck, title: 'Doorstep, both ways', text: 'Insured pickup and delivery across 18 Indian cities.' },
  { icon: Sparkles, title: 'Cleaned & sealed', text: 'Dry-cleaned, steam-pressed and packed in a garment bag.' }
];

function InstagramGlyph({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={className} aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (event) => {
    event.preventDefault();
    if (email.trim()) setSubscribed(true);
  };

  return (    <footer className="mt-24 bg-plum-deep text-paper">
      {/* Newsletter */}
      <div className="relative overflow-hidden border-b border-paper/10 bg-plum">
        <div className="jaali-pattern absolute inset-0 opacity-20" aria-hidden="true" />
        <div className="shell relative flex flex-col gap-6 py-12 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-lg">
            <p className="eyebrow text-gold">The first look list</p>
            <h2 className="mt-2 font-display text-3xl font-semibold leading-tight sm:text-4xl">
              ₹200 off your first rental.
            </h2>
            <p className="mt-2 text-sm text-paper/65">
              New arrivals, festive edits and deposit-free offers — one considered letter each week.
            </p>
          </div>
          <div className="w-full max-w-md">
            {subscribed ? (
              <div className="flex items-center gap-3 rounded-2xl border border-gold/30 bg-paper/10 px-5 py-4 text-sm">
                <BadgeCheck className="h-5 w-5 text-gold" />
                <p>You&apos;re on the list. Your ₹200 code is on its way to {email}.</p>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col gap-2 sm:flex-row">
                <label className="relative flex-1">
                  <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-paper/40" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                    className="h-12 w-full rounded-full border border-paper/20 bg-paper/10 pl-11 pr-4 text-sm text-paper placeholder:text-paper/40 focus:border-gold focus:outline-none"
                  />
                </label>
                <button type="submit" className="btn-primary h-12 shrink-0 px-6">
                  Join the list
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>
            )}
            <p className="mt-2 text-[10px] text-paper/40">No spam. Unsubscribe whenever you like.</p>
          </div>
        </div>
      </div>

      {/* Guarantees */}
      <div className="border-b border-paper/10">
        <div className="shell grid gap-6 py-10 sm:grid-cols-2 lg:grid-cols-4">
          {GUARANTEES.map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex gap-3">
              <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gold/30 text-gold">
                <Icon className="h-4 w-4" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-paper">{title}</p>
                <p className="mt-1 text-[11px] leading-relaxed text-paper/50">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Links */}
      <div className="shell grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <Logo tone="light" size={44} />
          <p className="mt-4 max-w-sm text-xs leading-relaxed text-paper/55">
            Rentique is a rental wardrobe for Indian celebrations. Borrow the heirloom, wear it once, return it —
            and keep the deposit. Designer craft should not need a permanent price tag.
          </p>
          <div className="mt-5 flex items-center gap-4 text-[11px] text-paper/50">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-gold" /> Jaipur · Delhi · Bengaluru
            </span>
          </div>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex items-center gap-2 text-[11px] text-paper/60 transition hover:text-gold"
          >
            <InstagramGlyph className="h-4 w-4" /> @rentique.in
          </a>
        </div>

        <div>
          <p className="eyebrow text-gold">Rent</p>
          <ul className="mt-4 space-y-2.5 text-xs text-paper/60">
            {COLLECTION_LINKS.map((link) => (
              <li key={link.label}>
                <Link to={link.to} className="transition hover:text-paper">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="eyebrow text-gold">The house</p>
          <ul className="mt-4 space-y-2.5 text-xs text-paper/60">
            <li><a href="/#how-it-works" className="transition hover:text-paper">How renting works</a></li>
            <li><a href="/#inspection" className="transition hover:text-paper">The visual record check</a></li>
            <li><Link to="/product/timeline-preview" className="transition hover:text-paper">Condition timeline</Link></li>
            <li><Link to="/admin" className="transition hover:text-paper">Seller studio</Link></li>
            <li><Link to="/login" className="transition hover:text-paper">Sign in</Link></li>
          </ul>
        </div>

        <div>
          <p className="eyebrow text-gold">Care</p>
          <ul className="mt-4 space-y-2.5 text-xs text-paper/60">
            <li><Link to="/dashboard" className="transition hover:text-paper">Wallet &amp; deposits</Link></li>
            <li><Link to="/dashboard" className="transition hover:text-paper">Returns &amp; extensions</Link></li>
            <li><Link to="/product/timeline-preview" className="transition hover:text-paper">Damage &amp; disputes</Link></li>
            <li><a href="mailto:care@rentique.in" className="transition hover:text-paper">care@rentique.in</a></li>
            <li><span>Mon–Sat, 10am–7pm IST</span></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-paper/10">
        <div className="shell flex flex-col gap-3 py-6 text-[10px] text-paper/40 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Rentique India. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <span>20% rental · 30% refundable deposit · 2% per late day</span>
            <span className="hidden h-1 w-1 rounded-full bg-paper/30 sm:block" />
            <span>Made in India, for Indian celebrations</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
