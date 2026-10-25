import React, { useEffect, useState } from 'react';
import { Camera, ShieldCheck, ZoomIn, ZoomOut } from 'lucide-react';
import { getDetailImageUrl, getThumbnailUrl } from '../../services/cloudinaryUtils';

const ANGLE_LABELS = {
  FRONT: 'Front view',
  BACK: 'Back view',
  SIDE: 'Side detail',
  CLOSEUP: 'Fabric & zari macro',
  TAG: 'Authenticity tag'
};

const STOREFRONT_VIEWS = ['FRONT', 'CLOSEUP', 'TAG'];

export default function MultiAngleGallery({ images = [], title = 'Product' }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);

  const visibleImages = STOREFRONT_VIEWS.map((view) =>
    images.find((image) => image.viewType === view)
  ).filter(Boolean);
  const galleryImages = [];
  for (const image of visibleImages.length ? visibleImages : images) {
    if (!galleryImages.some((seen) => seen.secureUrl === image.secureUrl)) {
      galleryImages.push(image);
    }
  }

  useEffect(() => {
    setSelectedIndex(0);
    setIsZoomed(false);
  }, [title]);

  if (!galleryImages || galleryImages.length === 0) {
    return (
      <div className="flex aspect-[3/4] items-center justify-center rounded-2xl border border-line bg-surface text-xs text-muted">
        No photographic record available
      </div>
    );
  }

  const activeImage = galleryImages[selectedIndex] || galleryImages[0];
  const detailUrl = getDetailImageUrl(activeImage.secureUrl);
  const isCloudinary = String(activeImage.secureUrl || '').includes('res.cloudinary.com');

  return (
    <div className="flex flex-col-reverse gap-3 sm:flex-row">
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar sm:w-[80px] sm:flex-col sm:overflow-visible sm:pb-0">
        {galleryImages.map((image, index) => {
          const selected = index === selectedIndex;
          return (
            <button
              key={image.viewType || index}
              type="button"
              onClick={() => {
                setSelectedIndex(index);
                setIsZoomed(false);
              }}
              className={`relative h-20 w-16 shrink-0 overflow-hidden rounded-xl border-2 transition sm:h-[96px] sm:w-full ${
                selected
                  ? 'border-plum shadow-soft'
                  : 'border-transparent opacity-75 hover:opacity-100'
              }`}
              aria-label={`View ${ANGLE_LABELS[image.viewType] || image.viewType}`}
              aria-pressed={selected}
            >
              <img
                src={getThumbnailUrl(image.secureUrl)}
                alt={`${title} — ${image.viewType}`}
                loading="lazy"
                className="h-full w-full object-cover object-top"
              />
              <span className="absolute inset-x-0 bottom-0 bg-plum-deep/75 py-0.5 text-center text-[7px] font-semibold uppercase tracking-[0.12em] text-paper">
                {image.viewType}
              </span>
            </button>
          );
        })}
      </div>

      <div className="relative flex-1 overflow-hidden rounded-2xl border border-line bg-plum-mist">
        <div className="relative aspect-[3/4] max-h-[640px] w-full overflow-hidden">
          <img
            src={detailUrl}
            alt={`${title} — ${activeImage.viewType}`}
            onClick={() => setIsZoomed((value) => !value)}
            className={`h-full w-full object-cover object-top transition-transform duration-700 ${
              isZoomed ? 'scale-[1.65] cursor-zoom-out' : 'cursor-zoom-in'
            }`}
          />

          <div className="pointer-events-none absolute left-3 top-3 flex flex-wrap gap-1.5">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-surface/90 px-2.5 py-1 text-[8px] font-semibold uppercase tracking-[0.12em] text-plum backdrop-blur">
              <ShieldCheck className="h-3 w-3 text-forest" />
              Visual record verified
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-plum-deep/80 px-2.5 py-1 text-[8px] font-semibold uppercase tracking-[0.12em] text-paper backdrop-blur">
              <Camera className="h-3 w-3 text-gold" />
              {ANGLE_LABELS[activeImage.viewType] || activeImage.viewType}
            </span>
          </div>

          <div className="absolute inset-x-3 bottom-3 flex items-end justify-between gap-3">
            <span className="rounded-full bg-plum-deep/75 px-2.5 py-1 font-mono text-[8px] tracking-[0.12em] text-paper/80 backdrop-blur">
              {String(selectedIndex + 1).padStart(2, '0')} / {String(galleryImages.length).padStart(2, '0')}
              <span className="ml-2 text-gold">{isCloudinary ? 'f_auto · q_auto' : 'Cloudinary master'}</span>
            </span>
            <button
              type="button"
              onClick={() => setIsZoomed((value) => !value)}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-surface/90 text-plum shadow-soft transition hover:bg-surface"
              aria-label={isZoomed ? 'Zoom out' : 'Zoom in'}
            >
              {isZoomed ? <ZoomOut className="h-4 w-4" /> : <ZoomIn className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
