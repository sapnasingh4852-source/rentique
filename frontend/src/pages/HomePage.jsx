import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Camera,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  HeartHandshake,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Star,
  Store,
  Truck,
  Wallet
} from 'lucide-react';
import api from '../api/client';
import ProductCard from '../components/product/ProductCard';

const OCCASIONS = [
  { name: 'Wedding', title: 'Bridal & pheras', hindi: 'शादी', note: 'Lehengas, sherwanis & heirloom kundan', image: '/media/editorial/occasion-wedding.jpg' },
  { name: 'Festive', title: 'Festivals & pujas', hindi: 'त्योहार', note: 'Diwali silks, Eid sets & Navratri colour', image: '/media/editorial/occasion-festive.jpg' },
  { name: 'Sangeet', title: 'Sangeet nights', hindi: 'संगीत', note: 'Shararas, sequins & movement-friendly silk', image: '/media/editorial/occasion-sangeet.jpg' },
  { name: 'Mehendi', title: 'Mehendi & haldi', hindi: 'मेहंदी', note: 'Chikankari, pastels & fresh florals', image: '/media/editorial/occasion-mehendi.jpg' },
  { name: 'Cocktail', title: 'Cocktails & receptions', hindi: 'मिलनी', note: 'Draped gowns & statement jewels', image: '/media/editorial/occasion-cocktail.jpg' }
];

const TESTIMONIALS = [
  {
    quote:
      'I wore a hand-embroidered Raw Mango lehenga to my sister\'s pheras and returned it two days later. The full ₹6,000 deposit was back in my wallet before I reached home.',
    name: 'Ananya Sharma',
    city: 'Jaipur',
    piece: 'Bridal lehenga · 3-day rental'
  },
  {
    quote:
      'The dispatch photos are what convinced my mother. We compared the zari on arrival with the studio pictures — exactly the same. No arguments, no deductions.',
    name: 'Meera Iyer',
    city: 'Chennai',
    piece: 'Kanjeevaram saree · 7-day rental'
  },
  {
    quote:
      'I rented a sherwani for three weddings in one month and still spent less than buying one. The fit, the finishing, the garment bag — everything felt boutique.',
    name: 'Arjun Mehta',
    city: 'Mumbai',
    piece: 'Raw silk sherwani · 3-day rental'
  },
  {
    quote:
      'Wore a gold Kanjeevaram for Diwali and a pastel organza for my cousin\u2019s engagement in the same fortnight. Two celebrations, one rental wardrobe, zero repeat outfits.',
    name: 'Ira Nair',
    city: 'Kochi',
    piece: 'Kanjeevaram saree · 7-day rental'
  }
];

const formatINR = (value) => `₹${Number(value || 0).toLocaleString('en-IN')}`;

function coverOf(product) {
  return product?.listingImages?.[0]?.secureUrl || '';
}

const isGenerated = (product) =>
  Boolean(product?.listingImages?.[0]?.secureUrl?.startsWith('/media/products/'));

const withGeneratedFirst = (list) =>
  [...list].sort((a, b) => Number(isGenerated(b)) - Number(isGenerated(a)));

function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-surface">
      <div className="aspect-[3/4] animate-pulse bg-plum-mist" />
      <div className="space-y-2 p-4">
        <div className="h-2.5 w-1/3 animate-pulse rounded bg-plum/10" />
        <div className="h-3 w-4/5 animate-pulse rounded bg-plum/10" />
        <div className="h-4 w-2/5 animate-pulse rounded bg-plum/10" />
      </div>
    </div>
  );
}

export default function HomePage({ onOpenRoleGate }) {
  const [products, setProducts] = useState([]);
  const [facets, setFacets] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeEdit, setActiveEdit] = useState('new');

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const [productsResponse, facetsResponse] = await Promise.all([
          api.get('/products'),
          api.get('/products/facets')
        ]);
        if (cancelled) return;
        if (productsResponse.data.success) setProducts(productsResponse.data.products || []);
        if (facetsResponse.data.success) setFacets(facetsResponse.data.facets || null);
      } catch (error) {
        console.error('Home data failed:', error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const collections = facets?.collections || [];

  const byCollection = (id) => products.find((product) => product.collection === id);

  const heroLehenga = byCollection('lehengas') || products[0];
  const heroSaree = byCollection('sarees') || products[1];
  const heroJewellery = byCollection('jewellery') || products[2];

  const lehengaFrom = (() => {
    const prices = products
      .filter((product) => product.collection === 'lehengas')
      .map((product) => product.rentalPrice)
      .filter(Boolean);
    return prices.length ? Math.min(...prices) : 2400;
  })();

  const edits = useMemo(() => {
    const sortedByRating = withGeneratedFirst(
      [...products].sort((a, b) => (b.rating || 0) - (a.rating || 0))
    );
    const celebration = products.filter((product) =>
      /bridal|wedding|festive/i.test(`${product.subCategory} ${product.occasion}`)
    );
    const budget = products
      .filter((product) => product.rentalPrice < 1000)
      .sort((a, b) => a.rentalPrice - b.rentalPrice);
    const accessories = products.filter((product) =>
      ['jewellery', 'bags', 'footwear'].includes(product.collection)
    );
    return [
      {
        id: 'new',
        label: 'New in',
        items: sortedByRating.slice(0, 8),
        count: products.length
      },
      {
        id: 'celebration',
        label: 'Wedding & festive',
        items: withGeneratedFirst(celebration).slice(0, 8),
        count: celebration.length
      },
      {
        id: 'under',
        label: 'Under ₹1,000',
        items: withGeneratedFirst(budget).slice(0, 8),
        count: budget.length
      },
      {
        id: 'accessories',
        label: 'Jewellery & accessories',
        items: withGeneratedFirst(accessories).slice(0, 8),
        count: accessories.length
      }
    ];
  }, [products]);

  const activeEditItems = edits.find((edit) => edit.id === activeEdit)?.items || [];

  const galleryProduct =
    products.find(
      (product) =>
        product.listingImages?.length === 5 &&
        product.listingImages.every((image) => image.secureUrl?.startsWith('/media/products/'))
    ) || products[0];

  const galleryImages = galleryProduct?.listingImages || [];
  const galleryFront = galleryImages.find((image) => image.viewType === 'FRONT') || galleryImages[0];
  const galleryRest = ['CLOSEUP', 'TAG']
    .map((view) => galleryImages.find((image) => image.viewType === view))
    .filter((image) => image && image.secureUrl !== galleryFront?.secureUrl)
    .filter((image, index, list) => list.findIndex((seen) => seen.secureUrl === image.secureUrl) === index);

  const brands = (facets?.brands || []).slice(0, 10).map((brand) => brand.name);

  return (
    <div className="overflow-hidden">
      {/* Hero */}
      <section className="relative">
        <div className="pointer-events-none absolute -right-24 top-4 h-[420px] w-[420px] rounded-full bg-saffron/10 blur-3xl" />
        <div className="pointer-events-none absolute left-1/3 top-40 h-[300px] w-[300px] rounded-full bg-plum/5 blur-3xl" />
        <div className="shell relative grid gap-14 pb-16 pt-10 lg:grid-cols-[1.02fr_0.98fr] lg:items-center lg:gap-8 lg:pb-24 lg:pt-16">
          <div className="relative z-10 max-w-xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-plum/15 bg-surface py-1.5 pl-2 pr-4 shadow-soft">
              <span className="rounded-full bg-saffron px-2 py-0.5 text-[8px] font-bold uppercase tracking-[0.16em] text-white">
                New
              </span>
              <span className="eyebrow text-plum">The 2026 celebration edit</span>
            </div>

            <h1 className="display-title mt-6 text-[46px] text-plum sm:text-[64px] lg:text-[76px]">
              Borrow the
              <br />
              grandeur.
              <span className="block italic text-saffron">Keep the memories.</span>
            </h1>

            <p className="mt-5 max-w-md text-[13px] leading-relaxed text-muted sm:text-sm">
              India&apos;s designer wardrobe, on rent. Wedding lehengas, Diwali silks, festive sarees, kundan sets
              and groom sherwanis at 20% of retail for a three-day tenure — with every rupee of your security
              deposit returned.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link to="/catalog" className="btn-primary">
                Shop the celebration edit
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a href="#how-it-works" className="btn-ghost">
                How renting works
              </a>
            </div>

            <dl className="mt-10 grid max-w-md grid-cols-3 gap-4 border-t border-line pt-5">
              <div>
                <dt className="font-display text-2xl font-semibold text-plum">{products.length || 136}</dt>
                <dd className="mt-0.5 text-[9px] uppercase leading-tight tracking-[0.14em] text-muted">
                  Curated pieces
                </dd>
              </div>
              <div className="border-l border-line pl-4">
                <dt className="font-display text-2xl font-semibold text-plum">20%</dt>
                <dd className="mt-0.5 text-[9px] uppercase leading-tight tracking-[0.14em] text-muted">
                  Of retail, per tenure
                </dd>
              </div>
              <div className="border-l border-line pl-4">
                <dt className="font-display text-2xl font-semibold text-plum">100%</dt>
                <dd className="mt-0.5 text-[9px] uppercase leading-tight tracking-[0.14em] text-muted">
                  Deposit returned
                </dd>
              </div>
            </dl>
          </div>

          <div className="relative mx-auto w-full max-w-[430px] lg:max-w-none">
            <div className="absolute -left-4 top-10 h-[86%] w-[86%] rounded-t-[999px] border border-gold/40 bg-saffron-soft/50" />
            <div className="absolute right-2 top-2 hidden h-[92%] w-[92%] rounded-t-[999px] border border-plum/10 sm:block" />

            <div className="relative ml-auto w-[88%] overflow-hidden rounded-t-[999px] rounded-b-3xl border border-plum/10 bg-plum-mist shadow-lift">
              <img
                src="/media/editorial/hero-celebration.jpg"
                alt="Indian model in a hand-embroidered floral lehenga, styled for a celebration"
                className="aspect-[3/4.05] w-full object-cover object-top"
              />
              <div className="absolute inset-x-3 bottom-3 rounded-2xl border border-paper/15 bg-plum-deep/85 p-3.5 text-paper backdrop-blur">
                <p className="text-[8px] font-semibold uppercase tracking-[0.2em] text-gold">
                  The celebration edit
                </p>
                <p className="mt-1 line-clamp-1 font-display text-sm font-medium">
                  Hand-embroidered bridal lehengas
                </p>
                <div className="mt-1 flex items-end justify-between">
                  <p className="font-display text-xl font-semibold">
                    From {formatINR(lehengaFrom)}
                    <span className="ml-1 font-sans text-[9px] font-normal text-paper/60">/ 3 days</span>
                  </p>
                  <p className="text-[8.5px] text-paper/55">Deposit fully refundable</p>
                </div>
              </div>
            </div>

            <div className="absolute -left-2 bottom-28 w-[34%] overflow-hidden rounded-2xl border-[5px] border-surface bg-plum-mist shadow-lift">
              <img
                src={coverOf(heroSaree)}
                alt={heroSaree?.title || 'Banarasi saree on rent'}
                className="aspect-[3/4] w-full object-cover object-top"
              />
              <span className="absolute bottom-1.5 left-1.5 rounded-full bg-plum-deep/80 px-2 py-0.5 text-[7px] font-semibold uppercase tracking-[0.12em] text-paper">
                Saree edit
              </span>
            </div>

            <div className="absolute -right-1 top-4 flex h-[92px] w-[92px] -rotate-6 flex-col items-center justify-center rounded-full border border-gold/50 bg-plum text-center text-paper shadow-lift sm:h-28 sm:w-28">
              <Sparkles className="h-3.5 w-3.5 text-gold" />
              <p className="mt-1 font-display text-lg font-semibold leading-none">20%</p>
              <p className="mt-1 text-[7px] uppercase leading-tight tracking-[0.16em] text-paper/70">
                Of MRP
                <br />
                3-day tenure
              </p>
            </div>

            <div className="absolute bottom-28 right-0 hidden w-[24%] overflow-hidden rounded-xl border-[4px] border-surface bg-plum-mist shadow-soft sm:block">
              <img
                src={coverOf(heroJewellery)}
                alt={heroJewellery?.title || 'Kundan jewellery on rent'}
                className="aspect-square w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Designer rail */}
      <div className="border-y border-line bg-surface">
        <div className="flex items-center overflow-hidden py-3.5">
          <span className="eyebrow z-10 shrink-0 border-r border-line bg-surface px-5 text-saffron sm:px-10">
            The atelier list
          </span>
          <div className="min-w-0 overflow-hidden">
            <div className="marquee-track items-center gap-10 pl-6">
              {[0, 1].map((copy) => (
                <div key={copy} className="flex shrink-0 items-center gap-10" aria-hidden={copy === 1}>
                  {(brands.length ? brands : ['Sabyasachi', 'Raw Mango', 'Anita Dongre', 'Tarun Tahiliani', 'Manyavar', 'Amrapali', 'Tanishq', 'Seema Gujral']).map(
                    (brand) => (
                      <span
                        key={`${copy}-${brand}`}
                        className="whitespace-nowrap font-display text-sm italic tracking-wide text-muted/80"
                      >
                        {brand}
                      </span>
                    )
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Occasions */}
      <section className="shell py-16 sm:py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow text-saffron">Shop the calendar</p>
            <h2 className="display-title mt-2 text-3xl text-plum sm:text-[42px]">Dressed for every celebration.</h2>
          </div>
          <Link
            to="/catalog"
            className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-plum transition hover:text-saffron"
          >
            All 136 pieces <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
          {OCCASIONS.map((occasion, index) => (
            <Link
              key={occasion.name}
              to={`/catalog?occasion=${encodeURIComponent(occasion.name)}`}
              className={`group relative overflow-hidden rounded-2xl border border-line bg-plum-mist ${
                index === 0 ? 'col-span-2 lg:col-span-1' : ''
              }`}
            >
              <div className="aspect-[3/4] overflow-hidden">
                <img
                  src={occasion.image}
                  alt={occasion.title}
                  loading="lazy"
                  className="h-full w-full object-cover object-top transition duration-700 group-hover:scale-105"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-plum-deep via-plum-deep/20 to-transparent" />
              <div className="absolute inset-x-4 bottom-4 text-paper">
                <div className="flex items-center justify-between">
                  <span className="font-hindi text-sm text-gold">{occasion.hindi}</span>
                  <ArrowUpRight className="h-4 w-4 opacity-0 transition group-hover:opacity-100" />
                </div>
                <h3 className="mt-1 font-display text-xl font-semibold leading-tight sm:text-2xl">
                  {occasion.title}
                </h3>
                <p className="mt-1 hidden text-[10px] leading-snug text-paper/65 sm:block">{occasion.note}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Collections */}
      <section className="border-y border-line bg-surface py-16 sm:py-20">
        <div className="shell">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow text-saffron">The wardrobe</p>
              <h2 className="display-title mt-2 text-3xl text-plum sm:text-[42px]">Eight collections. One closet.</h2>
            </div>
            <p className="max-w-sm text-[11px] leading-relaxed text-muted">
              Every piece is sourced from a verified boutique, photographed front, fabric and tag, and rented
              with a refundable deposit.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {collections.map((collection) => (
              <Link
                key={collection.id}
                to={`/catalog?collection=${collection.id}`}
                className="group relative overflow-hidden rounded-2xl border border-line bg-paper"
              >
                <div className="aspect-[4/5] overflow-hidden">
                  <img
                    src={collection.image}
                    alt={collection.label}
                    loading="lazy"
                    className="h-full w-full object-cover object-top transition duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-plum-deep/90 via-plum-deep/10 to-transparent opacity-90" />
                <span className="absolute right-3 top-3 rounded-full bg-surface/90 px-2 py-1 text-[8px] font-semibold uppercase tracking-[0.12em] text-plum backdrop-blur">
                  {collection.count} pieces
                </span>
                <div className="absolute inset-x-4 bottom-3.5 text-paper">
                  <p className="font-hindi text-[11px] text-gold">{collection.hindi}</p>
                  <div className="mt-0.5 flex items-end justify-between gap-2">
                    <h3 className="font-display text-lg font-semibold leading-tight sm:text-xl">{collection.label}</h3>
                    <ArrowUpRight className="h-4 w-4 shrink-0 opacity-60 transition group-hover:opacity-100" />
                  </div>
                  <p className="mt-0.5 text-[9px] uppercase tracking-[0.12em] text-paper/60">
                    From {formatINR(collection.minRentalPrice)} · 3 days
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* The edit */}
      <section className="shell py-16 sm:py-20">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="eyebrow text-saffron">Curated this week</p>
            <h2 className="display-title mt-2 text-3xl text-plum sm:text-[42px]">The Rentique edit.</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {edits.map((edit) => (
              <button
                key={edit.id}
                type="button"
                onClick={() => setActiveEdit(edit.id)}
                className={`rounded-full px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] transition ${
                  activeEdit === edit.id
                    ? 'bg-plum text-paper'
                    : 'border border-line bg-surface text-muted hover:border-plum/30 hover:text-plum'
                }`}
              >
                {edit.label}
                <span className={`ml-1.5 text-[9px] ${activeEdit === edit.id ? 'text-paper/60' : 'text-muted/60'}`}>
                  {edit.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
          {loading
            ? Array.from({ length: 8 }).map((_, index) => <SkeletonCard key={index} />)
            : activeEditItems.map((product) => <ProductCard key={product._id} product={product} />)}
        </div>

        <div className="mt-10 flex justify-center">
          <Link to="/catalog" className="btn-dark">
            View all {products.length || 136} pieces
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Deposit model */}
      <section id="how-it-works" className="border-y border-line bg-surface">
        <div className="shell grid gap-12 py-16 sm:py-20 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="eyebrow text-saffron">The deposit model</p>
            <h2 className="display-title mt-2 text-3xl text-plum sm:text-[42px]">
              A deposit,
              <br />
              not a fee.
            </h2>
            <p className="mt-4 max-w-md text-[13px] leading-relaxed text-muted">
              You pay 20% of retail as the rental fee and 30% as a refundable security deposit. The deposit sits
              in your Rentique wallet, not in ours. Return the piece on time and it comes back in full — after a
              visual condition check.
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              {['Rental 20% of MRP', 'Deposit 30%, refundable', 'Late fee 2% per day', 'Photo proof'].map(
                (chip) => (
                  <span key={chip} className="chip text-[10px]">
                    <CheckCircle2 className="h-3 w-3 text-forest" />
                    {chip}
                  </span>
                )
              )}
            </div>

            <div className="relative mt-8 max-w-sm overflow-hidden rounded-3xl bg-plum p-5 text-paper shadow-lift">
              <div className="jaali-pattern absolute inset-0 opacity-20" aria-hidden="true" />
              <div className="relative">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[8px] font-semibold uppercase tracking-[0.24em] text-gold">Rentique wallet</p>
                    <p className="mt-1 text-[9px] uppercase tracking-[0.14em] text-paper/50">Security deposit</p>
                  </div>
                  <Wallet className="h-5 w-5 text-gold" />
                </div>
                <p className="mt-5 font-display text-4xl font-semibold">{formatINR(6000)}</p>
                <p className="mt-1 text-[9px] uppercase tracking-[0.14em] text-paper/50">
                  Held for RNT-1023 · festive lehenga
                </p>
                <div className="my-4 h-px w-full bg-paper/15" />
                <div className="grid grid-cols-2 gap-3 text-[10px]">
                  <div>
                    <p className="text-paper/45">Rental paid</p>
                    <p className="mt-0.5 font-semibold text-paper">{formatINR(4000)}</p>
                  </div>
                  <div>
                    <p className="text-paper/45">Refund after return</p>
                    <p className="mt-0.5 font-semibold text-emerald-300">{formatINR(6000)}</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between rounded-xl bg-paper/10 px-3 py-2 text-[9px] uppercase tracking-[0.1em]">
                  <span className="flex items-center gap-1.5 text-paper/70">
                    <ShieldCheck className="h-3.5 w-3.5 text-gold" /> Inspection passed
                  </span>
                  <span className="font-semibold text-emerald-300">Refund ready</span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:pt-6">
            {[
              {
                icon: Sparkles,
                title: 'Pick the piece & the tenure',
                text: 'Choose a three, seven or fourteen-day tenure. The rental fee is always 20% of retail; the deposit is 30%.'
              },
              {
                icon: Camera,
                title: 'We photograph every detail',
                text: 'The front, a fabric-and-zari macro and the authenticity tag are uploaded to Cloudinary before the piece leaves the boutique.'
              },
              {
                icon: Truck,
                title: 'Wear it, then hand it back',
                text: 'Insured delivery both ways. Request a pickup from your dashboard and we collect it in a sealed bag.'
              },
              {
                icon: RotateCcw,
                title: 'Inspection, then the deposit returns',
                text: 'The same visual record is compared. No damage means your deposit is credited back to your wallet in full.'
              }
            ].map(({ icon: Icon, title, text }, index) => (
              <div key={title} className="relative flex gap-4 pb-8 last:pb-0">
                {index < 3 && (
                  <span className="absolute left-[23px] top-12 h-[calc(100%-3rem)] w-px bg-line" aria-hidden="true" />
                )}
                <span className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-line bg-paper text-saffron">
                  <Icon className="h-5 w-5" />
                </span>
                <div className="pt-1">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-gold">
                    {String(index + 1).padStart(2, '0')}
                  </p>
                  <h3 className="mt-1 font-display text-lg font-semibold text-plum">{title}</h3>
                  <p className="mt-1 max-w-sm text-[11px] leading-relaxed text-muted">{text}</p>
                </div>
              </div>
            ))}
            <Link
              to="/product/timeline-preview"
              className="ml-16 inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-plum hover:text-saffron"
            >
              See the condition timeline <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Cloudinary inspection */}
      <section id="inspection" className="shell py-16 sm:py-20">
        <div className="relative overflow-hidden rounded-[32px] bg-plum-deep text-paper">
          <div className="jaali-pattern absolute inset-0 opacity-[0.12]" aria-hidden="true" />
          <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-gold/10 blur-3xl" />
          <div className="relative grid gap-10 p-6 sm:p-10 lg:grid-cols-[0.92fr_1.08fr] lg:items-center lg:gap-14 lg:p-14">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-paper/5 px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.18em] text-gold">
                <ShieldCheck className="h-3.5 w-3.5" />
                Cloudinary condition lifecycle
              </div>
              <h2 className="display-title mt-4 text-3xl sm:text-[42px]">
                Three views.
                <br />
                <span className="italic text-gold">Zero arguments.</span>
              </h2>
              <p className="mt-4 max-w-md text-[12px] leading-relaxed text-paper/60">
                Every piece is photographed on the model, in fabric close-up and with its authenticity card
                before dispatch and again at return. If something arrives less than perfect, you have the
                evidence — and so do we. No guesswork, no automatic penalties.
              </p>

              <div className="mt-6 space-y-2.5">
                {[
                  'Before dispatch: front, fabric macro and authenticity tag',
                  'You verify the same visual record on arrival',
                  'Return pickup and inspection use one record'
                ].map((line) => (
                  <div key={line} className="flex items-start gap-2.5 text-[11px] text-paper/75">
                    <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                    {line}
                  </div>
                ))}
              </div>

              <div className="mt-7 flex flex-wrap gap-3">
                <Link to="/product/timeline-preview" className="btn-primary">
                  Open a live timeline
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to={galleryProduct ? `/product/${galleryProduct._id}` : '/catalog'}
                  className="btn-light"
                >
                  View a verified piece
                </Link>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between pb-3">
                <p className="text-[9px] font-medium uppercase tracking-[0.16em] text-paper/50">
                  {galleryProduct?.title || 'Verified catalogue'}
                </p>
                <span className="rounded-full border border-paper/15 bg-paper/5 px-2.5 py-1 font-mono text-[8px] text-gold">
                  f_auto · q_auto
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                {galleryFront && (
                  <div className="col-span-2 overflow-hidden rounded-2xl border border-paper/10 bg-paper/5 sm:col-span-1 sm:row-span-2">
                    <div className="relative h-full min-h-[240px] sm:min-h-[360px]">
                      <img
                        src={galleryFront.secureUrl}
                        alt={`${galleryProduct?.title} front view`}
                        className="absolute inset-0 h-full w-full object-cover object-top"
                        loading="lazy"
                      />
                      <span className="absolute bottom-2.5 left-2.5 rounded-full bg-plum-deep/80 px-2.5 py-1 text-[8px] font-semibold uppercase tracking-[0.14em] text-paper backdrop-blur">
                        Front · dispatch
                      </span>
                    </div>
                  </div>
                )}
                <div className="col-span-2 grid grid-cols-2 gap-2.5 sm:col-span-1">
                  {galleryRest.map((image) => (
                    <div key={image.viewType} className="relative aspect-[4/5] overflow-hidden rounded-xl border border-paper/10">
                      <img
                        src={image.secureUrl}
                        alt={`${galleryProduct?.title} ${image.viewType.toLowerCase()} view`}
                        className="h-full w-full object-cover object-top"
                        loading="lazy"
                      />
                      <span className="absolute bottom-1.5 left-1.5 rounded-full bg-plum-deep/80 px-2 py-0.5 text-[7px] font-semibold uppercase tracking-[0.12em] text-paper">
                        {image.viewType}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between text-[8.5px] text-paper/40">
                <span>Immutable media record · Rentique studio</span>
                <span className="font-mono">{galleryProduct?._id?.slice(-8) || 'RNT-0000'}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="border-y border-line bg-surface py-16 sm:py-20">
        <div className="shell">
          <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
            <div>
              <p className="eyebrow text-saffron">The wall of celebrations</p>
              <h2 className="display-title mt-2 text-3xl text-plum sm:text-[42px]">
                Worn, returned,
                <br />
                loved.
              </h2>
            </div>
            <div className="grid grid-cols-3 gap-4 border-line lg:border-l lg:pl-8">
              {[
                { value: '4.9', label: 'Average rating' },
                { value: '12,400+', label: 'Rentals delivered' },
                { value: '98%', label: 'On-time returns' }
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="font-display text-2xl font-semibold text-plum sm:text-3xl">{stat.value}</p>
                  <p className="mt-1 text-[9px] uppercase leading-tight tracking-[0.12em] text-muted">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-9 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {TESTIMONIALS.map((testimonial) => (
              <figure
                key={testimonial.name}
                className="flex flex-col justify-between rounded-2xl border border-line bg-paper p-5 sm:p-6"
              >
                <div>
                  <div className="flex gap-0.5 text-saffron">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Star key={index} className="h-3 w-3 fill-saffron" />
                    ))}
                  </div>
                  <blockquote className="mt-3 font-display text-[15px] leading-relaxed text-ink/85">
                    &ldquo;{testimonial.quote}&rdquo;
                  </blockquote>
                </div>
                <figcaption className="mt-5 flex items-center justify-between border-t border-line pt-3">
                  <div>
                    <p className="text-xs font-semibold text-plum">{testimonial.name}</p>
                    <p className="text-[9px] uppercase tracking-[0.12em] text-muted">{testimonial.city}</p>
                  </div>
                  <p className="max-w-[110px] text-right text-[8.5px] leading-tight text-muted">
                    {testimonial.piece}
                  </p>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* Seller CTA */}
      <section className="shell py-16 sm:py-20">
        <div className="grid overflow-hidden rounded-[32px] bg-plum text-paper lg:grid-cols-[1.05fr_0.95fr]">
          <div className="relative p-8 sm:p-12 lg:p-14">
            <div className="jaali-pattern absolute inset-0 opacity-10" aria-hidden="true" />
            <div className="relative">
              <p className="eyebrow text-gold">For boutiques &amp; closets</p>
              <h2 className="display-title mt-3 text-3xl sm:text-[42px]">
                Your closet
                <br />
                is a boutique.
              </h2>
              <p className="mt-4 max-w-md text-[12px] leading-relaxed text-paper/60">
                Have a lehenga that deserves more than one celebration? List it on Rentique. We photograph it,
                handle the renter, collect the deposit and return it inspected. You earn 70% of every rental.
              </p>
              <div className="mt-7 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={onOpenRoleGate}
                  className="btn-primary"
                >
                  Open the seller studio
                  <Store className="h-4 w-4" />
                </button>
                <span className="text-[9px] uppercase tracking-[0.14em] text-paper/40">
                  No listing fee · We handle logistics
                </span>
              </div>
              <div className="mt-8 grid max-w-md grid-cols-3 gap-3 border-t border-paper/15 pt-5 text-[10px] text-paper/55">
                <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-gold" /> Free shoot</span>
                <span className="flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-gold" /> Insured</span>
                <span className="flex items-center gap-1.5"><HeartHandshake className="h-3.5 w-3.5 text-gold" /> 70% payout</span>
              </div>
            </div>
          </div>
          <div className="relative min-h-[260px]">
            <img
              src={coverOf(heroSaree) || coverOf(heroLehenga)}
              alt="Boutique rental wardrobe"
              className="absolute inset-0 h-full w-full object-cover object-top"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-plum via-plum/20 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between rounded-2xl border border-paper/15 bg-plum-deep/70 px-4 py-3 backdrop-blur">
              <div>
                <p className="text-[8px] uppercase tracking-[0.16em] text-gold">Average partner payout</p>
                <p className="mt-0.5 font-display text-lg font-semibold">₹18,400 / month</p>
              </div>
              <CreditCard className="h-5 w-5 text-paper/60" />
            </div>
          </div>
        </div>
      </section>

      {/* Closing marquee */}
      <div className="overflow-hidden border-y border-line bg-saffron py-3 text-paper">
        <div className="marquee-track items-center gap-6 text-[11px] font-semibold uppercase tracking-[0.2em]">
          {[0, 1].map((copy) => (
            <div key={copy} className="flex shrink-0 items-center gap-6" aria-hidden={copy === 1}>
              <span>Borrow the grandeur</span>
              <Sparkles className="h-3.5 w-3.5" />
              <span className="text-plum">Keep the deposit</span>
              <Sparkles className="h-3.5 w-3.5" />
              <span>Wear it once, remember it forever</span>
              <Sparkles className="h-3.5 w-3.5" />
              <span className="text-plum">Rentique · since 2026</span>
              <Sparkles className="h-3.5 w-3.5" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
