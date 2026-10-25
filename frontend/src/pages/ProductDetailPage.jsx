import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowRight,
  BadgeCheck,
  Camera,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  Heart,
  RotateCcw,
  Scissors,
  ShieldCheck,
  Sparkles,
  Star,
  Truck,
  Wallet
} from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import MultiAngleGallery from '../components/product/MultiAngleGallery';
import ConditionTimeline from '../components/product/ConditionTimeline';
import ProductCard from '../components/product/ProductCard';

const COLLECTION_LABELS = {
  lehengas: 'Lehengas',
  sarees: 'Sarees',
  suits: 'Suits & sets',
  gowns: 'Gowns',
  menswear: 'Men',
  jewellery: 'Jewellery',
  bags: 'Bags',
  footwear: 'Footwear'
};

const TENURES = [
  { days: 3, label: '3 days', note: 'The celebration' },
  { days: 7, label: '7 days', note: 'The celebration week' },
  { days: 10, label: '10 days', note: 'The full season' }
];

const formatINR = (value) => `₹${Number(value || 0).toLocaleString('en-IN')}`;

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDuration, setSelectedDuration] = useState(3);
  const [selectedSize, setSelectedSize] = useState('');
  const [refundPreference, setRefundPreference] = useState('APP_WALLET');
  const [activeTab, setActiveTab] = useState('PIECE');
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/products/${id}`);
        if (cancelled) return;
        if (data.success) {
          setProduct(data.product);
          setSelectedSize(
            Array.isArray(data.product.size) ? data.product.size[0] : data.product.size || 'Free Size'
          );
        }
      } catch (err) {
        if (!cancelled) setError('We could not load this piece.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    if (!product?.collection) return undefined;
    let cancelled = false;
    api
      .get('/products', { params: { collection: product.collection } })
      .then(({ data }) => {
        if (!cancelled && data.success) {
          setRelated(data.products.filter((item) => item._id !== product._id).slice(0, 4));
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [product?._id, product?.collection]);

  if (loading) {
    return (
      <div className="shell py-10">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="aspect-[3/4] animate-pulse rounded-2xl bg-plum-mist" />
          <div className="space-y-4 pt-4">
            <div className="h-3 w-1/4 animate-pulse rounded bg-plum/10" />
            <div className="h-9 w-4/5 animate-pulse rounded bg-plum/10" />
            <div className="h-4 w-full animate-pulse rounded bg-plum/10" />
            <div className="h-40 animate-pulse rounded-2xl bg-plum-mist" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="shell py-24 text-center">
        <p className="font-display text-2xl text-plum">This piece is no longer in the wardrobe.</p>
        <p className="mt-2 text-xs text-muted">{error}</p>
        <Link to="/catalog" className="btn-primary mt-6">
          Back to the catalog <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  const retail = product.actualPrice || 10000;
  const isTrusted = (user?.trustScore ?? 95) >= 90;
  const tenureMultiplier = selectedDuration / 3;
  const baseRental = Math.round(((product.rentalPrice || retail * 0.2) * tenureMultiplier) / 10) * 10;
  const depositRate = isTrusted ? 0.2 : 0.3;
  const securityDeposit = Math.round(retail * depositRate);
  const initialTotal = baseRental + securityDeposit;
  const dailyEquivalent = Math.max(1, Math.round(baseRental / selectedDuration));
  const savings = Math.max(0, Math.round((1 - baseRental / retail) * 100));
  const dueDate = new Date(Date.now() + selectedDuration * 86400000).toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short'
  });

  const sizes = Array.isArray(product.size)
    ? product.size
    : product.size
    ? [product.size]
    : ['Free Size'];

  const goToCheckout = () => {
    const checkoutHref = `/checkout/${product._id}?duration=${selectedDuration}&size=${encodeURIComponent(
      selectedSize
    )}&refund=${refundPreference}`;
    if (!user) {
      navigate(`/login?redirect=${encodeURIComponent(checkoutHref)}`);
      return;
    }
    navigate(checkoutHref);
  };

  const gallery = product.listingImages || [];
  const mediaRecord = gallery.filter((image) => ['FRONT', 'CLOSEUP', 'TAG'].includes(image.viewType));
  const collectionLabel = COLLECTION_LABELS[product.collection] || 'Rentique edit';

  const tabs = [
    { id: 'PIECE', label: 'The piece' },
    { id: 'TIMELINE', label: `Condition timeline (${product.conditionHistory?.length || 0})` },
    { id: 'TERMS', label: 'Rental terms' }
  ];

  return (
    <div className="pb-28 lg:pb-16">
      <div className="border-b border-line bg-surface">
        <div className="shell flex items-center gap-1.5 py-3.5 text-[10px] text-muted">
          <Link to="/" className="hover:text-plum">Home</Link>
          <ChevronRight className="h-2.5 w-2.5" />
          <Link to="/catalog" className="hover:text-plum">Rent</Link>
          <ChevronRight className="h-2.5 w-2.5" />
          <Link to={`/catalog?collection=${product.collection}`} className="hover:text-plum">
            {collectionLabel}
          </Link>
          <ChevronRight className="h-2.5 w-2.5" />
          <span className="max-w-[220px] truncate font-semibold text-plum">{product.title}</span>
        </div>
      </div>

      <div className="shell pt-6 sm:pt-8">
        <div className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:gap-12">
          <div>
            <MultiAngleGallery images={gallery} title={product.title} />

            <div className="mt-4 grid grid-cols-3 gap-2 rounded-2xl border border-line bg-surface p-3 sm:p-4">
              {[
                { icon: Camera, title: 'Photo record', note: 'Before dispatch' },
                { icon: Scissors, title: 'Dry-clean included', note: 'Steam-pressed' },
                { icon: Truck, title: 'Doorstep delivery', note: 'Insured, both ways' }
              ].map(({ icon: Icon, title, note }) => (
                <div key={title} className="flex flex-col items-center gap-1 text-center">
                  <Icon className="h-4 w-4 text-saffron" />
                  <p className="text-[9px] font-semibold uppercase tracking-[0.08em] text-plum">{title}</p>
                  <p className="text-[8.5px] text-muted">{note}</p>
                </div>
              ))}
            </div>

            <div className="mt-4 hidden items-center justify-between rounded-2xl border border-gold/30 bg-saffron-soft/60 px-4 py-3 sm:flex">
              <div className="flex items-center gap-2 text-saffron-deep">
                <Sparkles className="h-4 w-4" />
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em]">
                  Styled by the Rentique studio
                </p>
              </div>
              <p className="text-[10px] text-saffron-deep/70">
                Need help with sizing? Our stylist replies within an hour.
              </p>
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <div className="flex items-center justify-between gap-3">
                <Link
                  to={`/catalog?collection=${product.collection}`}
                  className="eyebrow text-saffron hover:text-saffron-deep"
                >
                  {collectionLabel}
                </Link>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-forest/20 bg-forest-soft px-2.5 py-1 text-[8.5px] font-semibold uppercase tracking-[0.1em] text-forest">
                  <span className="h-1.5 w-1.5 rounded-full bg-forest" />
                  {product.currentCondition || 'EXCELLENT'}
                </span>
              </div>
              <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">
                {product.brand}
              </p>
              <h1 className="display-title mt-1 text-[28px] leading-[1.1] text-plum sm:text-[36px]">
                {product.title}
              </h1>
              <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10.5px] text-muted">
                <span className="inline-flex items-center gap-1 font-semibold text-ink">
                  <Star className="h-3 w-3 fill-saffron text-saffron" />
                  {product.rating}
                  <span className="font-normal text-muted">({product.reviewCount} reviews)</span>
                </span>
                <span className="h-3 w-px bg-line" />
                <span>{product.gender === 'MEN' ? 'Men’s fit' : 'Women’s fit'}</span>
                <span className="h-3 w-px bg-line" />
                <span>{product.occasion}</span>
              </div>
              <p className="mt-3 text-[12px] leading-relaxed text-muted">{product.description}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                <span className="chip text-[9px]">{product.color}</span>
                <span className="chip max-w-[220px] text-[9px]">
                  <span className="truncate">{product.fabricOrMaterial}</span>
                </span>
                <span className="chip text-[9px]">{product.subCategory}</span>
              </div>
            </div>

            <div className="rounded-2xl border border-line bg-surface p-5 shadow-soft">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-muted">
                    Rental · {selectedDuration} days
                  </p>
                  <p className="mt-1 font-display text-[32px] font-semibold leading-none text-plum">
                    {formatINR(baseRental)}
                  </p>
                  <p className="mt-1.5 text-[9.5px] text-muted">
                    ≈ {formatINR(dailyEquivalent)}/day · retail {formatINR(retail)}
                  </p>
                </div>
                {savings > 0 && (
                  <span className="rounded-full bg-forest-soft px-2.5 py-1 text-[9px] font-semibold text-forest">
                    {savings}% less than retail
                  </span>
                )}
              </div>

              <div className="mt-4 flex items-center justify-between rounded-xl border border-forest/15 bg-forest-soft px-3.5 py-3">
                <div>
                  <p className="flex items-center gap-1.5 text-[9.5px] font-semibold uppercase tracking-[0.1em] text-forest">
                    <Wallet className="h-3.5 w-3.5" /> Refundable deposit
                  </p>
                  <p className="mt-0.5 text-[9px] text-forest/70">
                    Returns to your wallet after inspection
                    {isTrusted ? ' · 20% trusted-renter rate' : ' · 30% of retail'}
                  </p>
                </div>
                <p className="font-display text-lg font-semibold text-forest">{formatINR(securityDeposit)}</p>
              </div>

              <div className="mt-4">
                <div className="flex items-center justify-between">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-plum">Tenure</p>
                  <p className="text-[9px] text-muted">Due back {dueDate}</p>
                </div>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {TENURES.map((tenure) => (
                    <button
                      key={tenure.days}
                      type="button"
                      onClick={() => setSelectedDuration(tenure.days)}
                      className={`rounded-xl border px-2 py-2.5 text-center transition ${
                        selectedDuration === tenure.days
                          ? 'border-plum bg-plum text-paper'
                          : 'border-line bg-paper text-muted hover:border-plum/30'
                      }`}
                    >
                      <span className="block text-[11px] font-semibold">{tenure.label}</span>
                      <span className={`mt-0.5 block text-[7.5px] uppercase tracking-[0.08em] ${
                        selectedDuration === tenure.days ? 'text-paper/55' : 'text-muted/60'
                      }`}>
                        {tenure.note}
                      </span>
                    </button>
                  ))}
                </div>
                <p className="mt-1.5 text-[8.5px] text-muted/80">
                  Rental is charged pro-rata at 20% of retail per 3-day tenure.
                </p>
              </div>

              <div className="mt-4">
                <p className="mb-2 text-[9px] font-semibold uppercase tracking-[0.14em] text-plum">Size</p>
                <div className="flex flex-wrap gap-1.5">
                  {sizes.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setSelectedSize(size)}
                      className={`rounded-full border px-3 py-1.5 text-[10px] font-medium transition ${
                        selectedSize === size
                          ? 'border-plum bg-plum text-paper'
                          : 'border-line bg-paper text-muted hover:border-plum/30'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-4">
                <p className="mb-2 text-[9px] font-semibold uppercase tracking-[0.14em] text-plum">
                  Deposit refund to
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'APP_WALLET', icon: Wallet, title: 'Rentique wallet', note: 'Instant credit' },
                    { id: 'ORIGINAL_PAYMENT_METHOD', icon: CreditCard, title: 'Original source', note: 'Card / UPI · 3–5 days' }
                  ].map(({ id: optionId, icon: Icon, title, note }) => (
                    <button
                      key={optionId}
                      type="button"
                      onClick={() => setRefundPreference(optionId)}
                      className={`rounded-xl border p-2.5 text-left transition ${
                        refundPreference === optionId
                          ? 'border-plum bg-plum/5'
                          : 'border-line bg-paper hover:border-plum/25'
                      }`}
                    >
                      <Icon className={`h-3.5 w-3.5 ${refundPreference === optionId ? 'text-plum' : 'text-muted'}`} />
                      <p className="mt-1 text-[10px] font-semibold text-ink">{title}</p>
                      <p className="mt-0.5 text-[8px] text-muted">{note}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-4 rounded-xl bg-paper p-3.5 text-[10px]">
                <div className="flex justify-between text-muted">
                  <span>Rental fee ({selectedDuration} days)</span>
                  <span>{formatINR(baseRental)}</span>
                </div>
                <div className="mt-1.5 flex justify-between text-muted">
                  <span>Refundable deposit</span>
                  <span>{formatINR(securityDeposit)}</span>
                </div>
                <div className="mt-2.5 flex items-baseline justify-between border-t border-line pt-2.5">
                  <span className="text-[10px] font-semibold text-plum">Payable now</span>
                  <span className="font-display text-xl font-semibold text-plum">{formatINR(initialTotal)}</span>
                </div>
                <p className="mt-1 text-[8.5px] leading-relaxed text-muted/80">
                  {formatINR(securityDeposit)} of this is a security deposit, refunded in full after the return
                  inspection.
                </p>
              </div>

              <button
                type="button"
                onClick={goToCheckout}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-plum px-5 py-3.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-paper transition hover:bg-saffron hover:text-white"
              >
                <Sparkles className="h-4 w-4 text-gold" />
                Rent now · {formatINR(initialTotal)}
              </button>
              <p className="mt-2 text-center text-[8.5px] text-muted">
                Address, pincode check and payment on the next step
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {[
                { icon: ShieldCheck, title: 'Visual condition proof', note: 'Before every dispatch' },
                { icon: RotateCcw, title: 'Deposit returned', note: 'No unexplained deductions' },
                { icon: Truck, title: 'Insured delivery', note: 'Pickup included' },
                { icon: Scissors, title: 'Cleaned & sealed', note: 'Ready-to-wear' }
              ].map(({ icon: Icon, title, note }) => (
                <div key={title} className="flex gap-2 rounded-xl border border-line bg-surface p-2.5">
                  <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-forest" />
                  <div>
                    <p className="text-[9px] font-semibold text-ink">{title}</p>
                    <p className="mt-0.5 text-[8px] text-muted">{note}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-line pt-8">
          <div className="flex gap-5 overflow-x-auto border-b border-line no-scrollbar">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap border-b-2 pb-3 text-[10px] font-semibold uppercase tracking-[0.14em] transition ${
                  activeTab === tab.id
                    ? 'border-saffron text-plum'
                    : 'border-transparent text-muted hover:text-plum'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="pt-6">
            {activeTab === 'PIECE' && (
              <div className="grid gap-5 lg:grid-cols-2">
                <div className="min-w-0 rounded-2xl border border-line bg-surface p-5 sm:p-6">
                  <p className="eyebrow text-saffron">Craft notes</p>
                  <h2 className="display-title mt-2 text-2xl text-plum">Made to be borrowed.</h2>
                  <p className="mt-3 text-[11.5px] leading-relaxed text-muted">{product.description}</p>
                  <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 text-[10px]">
                    {[
                      ['Fabric', product.fabricOrMaterial],
                      ['Colour', product.color],
                      ['Occasion', product.occasion],
                      ['Silhouette', product.subCategory]
                    ].map(([label, value]) => (
                      <div key={label}>
                        <dt className="text-[8px] uppercase tracking-[0.14em] text-muted/70">{label}</dt>
                        <dd className="mt-0.5 font-medium leading-snug text-ink">{value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>

                <div className="min-w-0 space-y-4">
                  <div className="min-w-0 rounded-2xl border border-line bg-surface p-5 sm:p-6">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-forest" />
                      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-plum">
                        Cloudinary media record
                      </p>
                    </div>
                    <p className="mt-2 text-[10px] leading-relaxed text-muted">
                      Front, fabric and authenticity masters are stored against this piece. Once uploaded, the
                      delivery URLs pick up automatic format, quality and responsive transforms.
                    </p>
                    <div className="mt-3 divide-y divide-line rounded-xl border border-line">
                      {mediaRecord.map((image) => (
                        <div key={image.viewType} className="flex items-center justify-between gap-3 px-3 py-2">
                          <div className="flex min-w-0 items-center gap-2">
                            <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-gold" />
                            <span className="text-[9px] font-semibold uppercase tracking-[0.1em] text-plum">
                              {image.viewType}
                            </span>
                            <span className="truncate font-mono text-[8px] text-muted">{image.publicId}</span>
                          </div>
                          <span className="shrink-0 rounded bg-paper px-1.5 py-0.5 font-mono text-[8px] text-muted">
                            {image.format || 'jpg'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-gold/30 bg-saffron-soft/60 p-5">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-saffron-deep">
                      Care & fit
                    </p>
                    <ul className="mt-2 space-y-1.5 text-[10px] leading-relaxed text-saffron-deep/80">
                      <li className="flex gap-2"><CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0" /> Dry-clean only; we handle cleaning on return.</li>
                      <li className="flex gap-2"><CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0" /> Steam-pressed and delivered in a sealed garment bag.</li>
                      <li className="flex gap-2"><CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0" /> Size not right? Request an exchange within 24 hours.</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'TIMELINE' && (
              <ConditionTimeline
                history={product.conditionHistory}
                currentCondition={product.currentCondition}
                title={product.title}
              />
            )}

            {activeTab === 'TERMS' && (
              <div className="grid gap-4 md:grid-cols-3">
                {[
                  {
                    title: 'Rental & deposit',
                    body: '20% of retail is the rental fee for every three-day tenure. A 30% security deposit is held separately and returned after inspection. Trusted renters pay a 20% deposit.'
                  },
                  {
                    title: 'Late returns',
                    body: 'Returns after the due date are charged 2% of retail per day. The fee is deducted from the deposit, never charged silently to a card on file.'
                  },
                  {
                    title: 'Damage & disputes',
                    body: 'Every penalty is reviewed against the front, fabric and tag images on file. You can raise a dispute with photo evidence within 48 hours of the inspection.'
                  }
                ].map((term) => (
                  <div key={term.title} className="rounded-2xl border border-line bg-surface p-5">
                    <p className="font-display text-lg font-semibold text-plum">{term.title}</p>
                    <p className="mt-2 text-[10.5px] leading-relaxed text-muted">{term.body}</p>
                  </div>
                ))}
                <div className="rounded-2xl border border-forest/20 bg-forest-soft p-5 md:col-span-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-forest">
                    The deposit journey
                  </p>
                  <div className="mt-3 grid gap-3 text-[10px] text-forest/80 sm:grid-cols-5">
                    {['Book & pay deposit', 'Dispatch proof', 'Wear & return', '48-hour inspection', 'Deposit refunded'].map(
                      (step, index) => (
                        <div key={step} className="flex items-start gap-2">
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-forest text-[8px] font-bold text-white">
                            {index + 1}
                          </span>
                          <span>{step}</span>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {related.length > 0 && (
          <div className="mt-14">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="eyebrow text-saffron">Complete the wardrobe</p>
                <h2 className="display-title mt-2 text-2xl text-plum sm:text-[32px]">More from {collectionLabel}.</h2>
              </div>
              <Link
                to={`/catalog?collection=${product.collection}`}
                className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-plum hover:text-saffron"
              >
                View all <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
              {related.map((item) => (
                <ProductCard key={item._id} product={item} />
              ))}
            </div>
          </div>
        )}

        <div className="mt-12 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-plum px-5 py-4 text-paper">
          <div className="flex items-center gap-2">
            <Heart className="h-4 w-4 text-gold" />
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em]">
              Rented {product.reviewCount}+ times this season
            </p>
          </div>
          <p className="text-[10px] text-paper/60">Join the wardrobe — deposits always return.</p>
        </div>
      </div>

      {/* Mobile booking bar */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/95 px-4 py-3 backdrop-blur lg:hidden">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[8.5px] uppercase tracking-[0.1em] text-muted">
              {formatINR(baseRental)} rental + {formatINR(securityDeposit)} deposit
            </p>
            <p className="font-display text-xl font-semibold text-plum">{formatINR(initialTotal)}</p>
          </div>
          <button
            type="button"
            onClick={goToCheckout}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-plum py-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-paper"
            style={{ maxWidth: 190 }}
          >
            Rent now
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
