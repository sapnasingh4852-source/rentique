import React, { useState } from 'react';
import {
  ShieldCheck,
  Wrench,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  User,
  Image as ImageIcon,
  Sparkles,
  X
} from 'lucide-react';
import { getOptimizedImageUrl } from '../../services/cloudinaryUtils';

const STAGE_ICONS = {
  INITIAL_STOCK: Sparkles,
  BEFORE_RENTAL: ShieldCheck,
  RETURNED: AlertTriangle,
  INSPECTED: CheckCircle2,
  REPAIRED: Wrench
};

const GRADE_STYLES = {
  EXCELLENT: 'border-forest/25 bg-forest-soft text-forest',
  MINOR_DAMAGE: 'border-saffron/30 bg-saffron-soft text-saffron-deep',
  MAJOR_DAMAGE: 'border-rani/25 bg-rani-soft text-rani',
  REPAIRED: 'border-plum/20 bg-plum-mist text-plum'
};

export default function ConditionTimeline({
  history = [],
  currentCondition = 'EXCELLENT',
  title = ''
}) {
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  if (!history || history.length === 0) {
    return (
      <div className="rounded-2xl border border-line bg-surface p-10 text-center">
        <ShieldCheck className="mx-auto mb-2 h-9 w-9 text-forest" />
        <h4 className="font-display text-lg font-semibold text-ink">Pristine archival addition</h4>
        <p className="mx-auto mt-1 max-w-md text-[11px] leading-relaxed text-muted">
          This piece was freshly catalogued and verified in excellent condition before entering the rental wardrobe.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-line bg-surface p-5 sm:p-7">
      <div className="flex flex-col gap-3 border-b border-line pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="eyebrow text-saffron">Cloudinary visual provenance</span>
          <h3 className="mt-1.5 font-display text-2xl font-semibold text-ink">
            {title ? `Condition record · ${title}` : 'Product condition timeline'}
          </h3>
          <p className="mt-1 text-[11px] text-muted">
            Lifecycle proof captured across intake, dispatch and returns.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <span className="text-[9px] font-semibold uppercase tracking-[0.14em] text-muted">Current state</span>
          <span
            className={`rounded-full border px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.1em] ${
              GRADE_STYLES[currentCondition] || 'border-line bg-paper text-muted'
            }`}
          >
            {currentCondition.replace('_', ' ')}
          </span>
        </div>
      </div>

      <div className="relative mt-6 space-y-5 pl-8 before:absolute before:bottom-3 before:left-[13px] before:top-2 before:w-px before:bg-line">
        {history.map((entry, index) => {
          const Icon = STAGE_ICONS[entry.stage] || Calendar;
          const dateStr = new Date(entry.date).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
          });
          const grade = entry.conditionGrade || 'EXCELLENT';

          return (
            <div key={`${entry.stage}-${index}`} className="relative">
              <div className="absolute -left-8 top-1 flex h-7 w-7 items-center justify-center rounded-full border border-gold/50 bg-paper shadow-soft">
                <Icon className="h-3.5 w-3.5 text-plum" />
              </div>

              <div className="rounded-xl border border-line bg-paper p-4 transition hover:border-gold/60">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-display text-sm font-semibold uppercase tracking-[0.06em] text-ink">
                      {entry.stage.replace(/_/g, ' ')}
                    </span>
                    <span
                      className={`rounded-full border px-2 py-0.5 text-[8.5px] font-bold uppercase tracking-[0.1em] ${
                        GRADE_STYLES[grade] || 'border-line bg-surface text-muted'
                      }`}
                    >
                      {grade.replace('_', ' ')}
                    </span>
                  </div>
                  <span className="font-mono text-[10px] text-muted">{dateStr}</span>
                </div>

                {entry.customerName && (
                  <div className="mt-2 flex items-center gap-1.5 text-[11px] text-muted">
                    <User className="h-3 w-3 text-muted/70" />
                    <span>
                      Rented to <strong className="font-medium text-ink">{entry.customerName}</strong>
                    </span>
                  </div>
                )}

                <p className="mt-2 text-[11px] leading-relaxed text-muted">{entry.notes}</p>

                {entry.evidence?.length > 0 && (
                  <div className="mt-3">
                    <span className="text-[8.5px] font-bold uppercase tracking-[0.16em] text-saffron-deep">
                      Cloudinary verified evidence
                    </span>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {entry.evidence.map((evidence, evidenceIndex) => {
                        const imageUrl = evidence.secureUrl || evidence.url;
                        return (
                          <button
                            type="button"
                            key={evidenceIndex}
                            onClick={() => setSelectedPhoto(imageUrl)}
                            className="group relative h-16 w-14 overflow-hidden rounded-lg border border-line transition hover:ring-2 hover:ring-gold/50"
                          >
                            <img
                              src={getOptimizedImageUrl(imageUrl, { width: 160, height: 200, crop: 'fill' })}
                              alt="Condition evidence"
                              className="h-full w-full object-cover object-top"
                              loading="lazy"
                            />
                            <span className="absolute inset-0 flex items-center justify-center bg-plum-deep/0 transition group-hover:bg-plum-deep/45">
                              <ImageIcon className="h-4 w-4 text-paper opacity-0 transition group-hover:opacity-100" />
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {selectedPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-plum-deep/85 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-gold/20 bg-surface shadow-lift">
            <div className="flex items-center justify-between bg-plum-deep px-4 py-3 text-paper">
              <span className="flex items-center gap-1.5 font-display text-sm">
                <ShieldCheck className="h-4 w-4 text-gold" />
                Cloudinary authenticated condition proof
              </span>
              <button
                type="button"
                onClick={() => setSelectedPhoto(null)}
                className="rounded-full p-1 text-paper/70 transition hover:bg-paper/10 hover:text-paper"
                aria-label="Close evidence"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex max-h-[75vh] justify-center bg-paper p-4">
              <img
                src={selectedPhoto}
                alt="Enlarged condition evidence"
                className="max-h-full rounded-xl object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
