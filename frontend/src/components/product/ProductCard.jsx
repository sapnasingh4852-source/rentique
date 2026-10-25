import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Heart, ShieldCheck, Star, Wallet } from 'lucide-react';
import { getOptimizedImageUrl } from '../../services/cloudinaryUtils';

export default function ProductCard({ product }) {
  const [hovered, setHovered] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);

  const images = product.listingImages || [];
  const frontImage = images.find((image) => image.viewType === 'FRONT') || images[0];
  const altImage =
    images.find((image) => image.viewType === 'CLOSEUP') ||
    frontImage;

  const imageOptions = { width: 700, height: 933, crop: 'fill', gravity: 'auto' };
  const frontUrl = getOptimizedImageUrl(frontImage?.secureUrl, imageOptions);
  const altUrl = getOptimizedImageUrl(altImage?.secureUrl, imageOptions);

  const savings = product.actualPrice
    ? Math.round(((product.actualPrice - product.rentalPrice) / product.actualPrice) * 100)
    : 0;

  const collectionLabel =
    product.subCategory ||
    (product.collection ? product.collection.replace(/(^|\s)\S/g, (c) => c.toUpperCase()) : 'Rentique');

  return (
    <article
      className="group flex flex-col overflow-hidden rounded-2xl border border-line/80 bg-surface transition duration-500 hover:-translate-y-1 hover:border-plum/20 hover:shadow-lift"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-plum-mist">
        <Link to={`/product/${product._id}`} aria-label={product.title} className="block h-full w-full">
          <img
            src={frontUrl}
            alt={product.title}
            loading="lazy"
            className={`absolute inset-0 h-full w-full object-cover object-top transition duration-700 ${
              hovered ? 'scale-105 opacity-0' : 'scale-100 opacity-100'
            }`}
          />
          <img
            src={altUrl}
            alt=""
            aria-hidden="true"
            loading="lazy"
            className={`absolute inset-0 h-full w-full object-cover object-top transition duration-700 ${
              hovered ? 'scale-105 opacity-100' : 'scale-100 opacity-0'
            }`}
          />
        </Link>

        <div className="pointer-events-none absolute left-2.5 top-2.5 flex items-center gap-1.5 rounded-full bg-surface/90 px-2.5 py-1 text-[8.5px] font-semibold uppercase tracking-[0.12em] text-plum backdrop-blur">
          <ShieldCheck className="h-3 w-3 text-forest" />
          <span className="max-w-[130px] truncate">{collectionLabel}</span>
        </div>

        <button
          type="button"
          onClick={(event) => {
            event.preventDefault();
            setWishlisted((value) => !value);
          }}
          className="absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-full bg-surface/90 text-plum backdrop-blur transition hover:bg-surface"
          aria-label={wishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
        >
          <Heart className={`h-3.5 w-3.5 ${wishlisted ? 'fill-rani text-rani' : ''}`} />
        </button>

        <div className="pointer-events-none absolute bottom-2.5 left-2.5 flex items-center gap-1 rounded-full bg-plum-deep/80 px-2 py-1 text-[8px] font-medium uppercase tracking-[0.1em] text-paper backdrop-blur">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          {hovered ? `View: ${altImage?.viewType?.toLowerCase() || 'front'}` : 'Ready to rent'}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-3.5 sm:p-4">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-[9.5px] font-semibold uppercase tracking-[0.16em] text-muted">
            {product.brand}
          </p>
          <span className="inline-flex shrink-0 items-center gap-0.5 text-[10px] font-semibold text-ink">
            <Star className="h-3 w-3 fill-saffron text-saffron" />
            {product.rating}
            <span className="ml-0.5 font-normal text-muted">({product.reviewCount})</span>
          </span>
        </div>

        <Link to={`/product/${product._id}`} className="mt-1">
          <h3 className="line-clamp-2 text-[13px] font-medium leading-snug text-ink transition group-hover:text-plum">
            {product.title}
          </h3>
        </Link>

        <div className="mt-2.5 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <span className="font-display text-[19px] font-semibold text-plum">
            ₹{product.rentalPrice?.toLocaleString('en-IN')}
          </span>
          <span className="text-[10px] text-muted">/ 3 days</span>
          <span className="text-[10px] text-muted/80 line-through">
            ₹{product.actualPrice?.toLocaleString('en-IN')}
          </span>
          {savings > 0 && (
            <span className="text-[9.5px] font-semibold text-forest">{savings}% less</span>
          )}
        </div>

        <div className="mt-2 flex items-center gap-1.5 rounded-lg bg-forest-soft px-2 py-1.5 text-[9.5px] font-medium text-forest">
          <Wallet className="h-3 w-3 shrink-0" />
          <span className="truncate">
            ₹{product.securityDeposit?.toLocaleString('en-IN')}{' '}
            <span className="hidden sm:inline">refundable deposit</span>
            <span className="sm:hidden">deposit</span>
          </span>
        </div>

        <Link
          to={`/product/${product._id}`}
          className="mt-3 flex items-center justify-between rounded-full border border-plum/15 px-3.5 py-2 text-[9.5px] font-semibold uppercase tracking-[0.14em] text-plum transition group-hover:border-plum group-hover:bg-plum group-hover:text-paper"
        >
          Rent this piece
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </article>
  );
}
