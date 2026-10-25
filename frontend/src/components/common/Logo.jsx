import React from 'react';
import { Link } from 'react-router-dom';

export function LogoMark({ size = 42, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      role="img"
      aria-label="Rentique monogram"
      className={className}
    >
      <rect width="64" height="64" rx="18" fill="#3D1B33" />
      <path
        d="M15 49V30.5C15 21.4 22.4 14 31.5 14h1C41.6 14 49 21.4 49 30.5V49"
        fill="none"
        stroke="#C9A227"
        strokeWidth="1.8"
      />
      <path
        d="M25 47V23h7.8a6.8 6.8 0 0 1 0 13.6H25M34 36.6 42 47"
        fill="none"
        stroke="#FBF6EC"
        strokeWidth="3.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="32" cy="9" r="2.2" fill="#E86A24" />
    </svg>
  );
}

export default function Logo({ size = 42, tone = 'dark', tagline = true, className = '' }) {
  const titleColor = tone === 'light' ? 'text-paper' : 'text-plum';
  const subColor = tone === 'light' ? 'text-paper/55' : 'text-muted';

  return (
    <Link to="/" className={`group inline-flex items-center gap-3 ${className}`} aria-label="Rentique home">
      <LogoMark
        size={size}
        className="shrink-0 transition-transform duration-500 group-hover:-rotate-3 group-hover:scale-[1.04]"
      />
      <span className="flex min-w-0 flex-col leading-none">
        <span className={`font-display text-[23px] font-semibold tracking-[-0.02em] ${titleColor}`}>
          Rentique
        </span>
        {tagline && (
          <span className={`mt-1 text-[7.5px] font-semibold uppercase tracking-[0.31em] ${subColor}`}>
            Celebration Wardrobe
          </span>
        )}
      </span>
    </Link>
  );
}
