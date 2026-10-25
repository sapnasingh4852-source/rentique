import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  ArrowRight,
  Check,
  ChevronRight,
  SlidersHorizontal,
  Sparkles,
  Wallet,
  X
} from 'lucide-react';
import api from '../api/client';
import ProductCard from '../components/product/ProductCard';

const FALLBACK_BANDS = [
  { id: 'under_500', label: 'Under ₹500', min: 0, max: 499 },
  { id: '500_999', label: '₹500 – ₹999', min: 500, max: 999 },
  { id: '1000_1999', label: '₹1,000 – ₹1,999', min: 1000, max: 1999 },
  { id: '2000_3999', label: '₹2,000 – ₹3,999', min: 2000, max: 3999 },
  { id: '4000_plus', label: '₹4,000 & above', min: 4000, max: null }
];

const COLLECTION_NAMES = {
  lehengas: 'Lehengas',
  sarees: 'Sarees',
  suits: 'Suits & sets',
  gowns: 'Gowns',
  menswear: 'Men',
  jewellery: 'Jewellery',
  bags: 'Bags',
  footwear: 'Footwear'
};

function FilterSection({ title, children, hint }) {
  return (
    <div className="border-b border-line px-4 py-4 last:border-b-0">
      <div className="mb-3 flex items-baseline justify-between">
        <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-plum">{title}</p>
        {hint && <span className="text-[9px] text-muted/60">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

export default function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [facets, setFacets] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [showAllBrands, setShowAllBrands] = useState(false);

  const collectionParam = searchParams.get('collection') || '';
  const selectedCollections = collectionParam.split(',').filter(Boolean);
  const subCategory = searchParams.get('subCategory') || '';
  const gender = searchParams.get('gender') || '';
  const brandParam = searchParams.get('brand') || '';
  const selectedBrands = brandParam.split(',').filter(Boolean);
  const colorParam = searchParams.get('colorFamily') || '';
  const selectedColors = colorParam.split(',').filter(Boolean);
  const occasionParam = searchParams.get('occasion') || '';
  const selectedOccasions = occasionParam.split(',').filter(Boolean);
  const priceBandId = searchParams.get('price') || '';
  const search = searchParams.get('search') || '';
  const sort = searchParams.get('sort') || 'popular';
  const queryString = searchParams.toString();

  const priceBands = facets?.priceBands?.length ? facets.priceBands : FALLBACK_BANDS;

  useEffect(() => {
    let cancelled = false;
    const loadFacets = async () => {
      try {
        const { data } = await api.get('/products/facets');
        if (!cancelled && data.success) setFacets(data.facets);
      } catch (error) {
        console.error('Facets failed:', error);
      }
    };
    loadFacets();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const loadProducts = async () => {
      setLoading(true);
      try {
        const params = {};
        if (collectionParam) params.collection = collectionParam;
        if (subCategory) params.subCategory = subCategory;
        if (gender) params.gender = gender;
        if (brandParam) params.brand = brandParam;
        if (colorParam) params.colorFamily = colorParam;
        if (occasionParam) params.occasion = occasionParam;
        if (search) params.search = search;
        if (sort) params.sort = sort;

        const band = priceBands.find((item) => item.id === priceBandId);
        if (band) {
          params.minPrice = band.min;
          if (band.max !== null && band.max !== undefined) params.maxPrice = band.max;
        }

        const { data } = await api.get('/products', { params });
        if (!cancelled && data.success) setProducts(data.products || []);
      } catch (error) {
        console.error('Catalog fetch failed:', error);
        if (!cancelled) setProducts([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    loadProducts();
    return () => {
      cancelled = true;
    };
  }, [queryString, priceBandId, priceBands.length]);

  const applyFilters = (updates) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value) next.set(key, value);
      else next.delete(key);
    });
    setSearchParams(next, { replace: true });
  };

  const toggleValue = (key, value, options = {}) => {
    const current = (searchParams.get(key) || '').split(',').filter(Boolean);
    const nextValues = current.includes(value)
      ? current.filter((item) => item !== value)
      : [...current, value];
    const next = new URLSearchParams(searchParams);
    if (nextValues.length) next.set(key, nextValues.join(','));
    else next.delete(key);
    (options.clear || []).forEach((clearKey) => next.delete(clearKey));
    setSearchParams(next, { replace: true });
  };

  const clearAll = () => setSearchParams({}, { replace: true });

  const activeCollectionMeta = selectedCollections.length
    ? facets?.collections?.find((collection) => collection.id === selectedCollections[0])
    : null;

  const heading = activeCollectionMeta ? activeCollectionMeta.label : 'The celebration wardrobe';
  const tagline = activeCollectionMeta
    ? activeCollectionMeta.tagline
    : 'Designer Indian wear, heirloom jewellery and groom sherwanis — every piece photographed front, fabric and tag, and rented with a fully refundable deposit.';

  const subCategoryOptions = useMemo(() => {
    if (!facets?.collections) return [];
    if (selectedCollections.length === 1) {
      return (
        facets.collections.find((collection) => collection.id === selectedCollections[0])?.subCategories || []
      ).filter((item) => item.count > 0);
    }
    if (selectedCollections.length === 0) {
      const seen = new Map();
      facets.collections.forEach((collection) => {
        collection.subCategories.forEach((item) => {
          if (item.count > 0) seen.set(item.name, (seen.get(item.name) || 0) + item.count);
        });
      });
      return [...seen.entries()].map(([name, count]) => ({ name, count }));
    }
    return [];
  }, [facets, selectedCollections.join(',')]);

  const brandOptions = useMemo(() => {
    const brands = facets?.brands || [];
    return showAllBrands ? brands : brands.slice(0, 9);
  }, [facets, showAllBrands]);

  const activeChips = [];
  selectedCollections.forEach((id) =>
    activeChips.push({
      key: `collection-${id}`,
      label:
        facets?.collections?.find((collection) => collection.id === id)?.label ||
        COLLECTION_NAMES[id] ||
        id,
      clear: () => toggleValue('collection', id, { clear: ['subCategory'] })
    })
  );
  if (subCategory) activeChips.push({ key: 'subCategory', label: subCategory, clear: () => applyFilters({ subCategory: '' }) });
  selectedBrands.forEach((brand) =>
    activeChips.push({ key: `brand-${brand}`, label: brand, clear: () => toggleValue('brand', brand) })
  );
  selectedColors.forEach((color) =>
    activeChips.push({ key: `color-${color}`, label: color, clear: () => toggleValue('colorFamily', color) })
  );
  selectedOccasions.forEach((occasion) =>
    activeChips.push({ key: `occasion-${occasion}`, label: occasion, clear: () => toggleValue('occasion', occasion) })
  );
  if (gender) activeChips.push({ key: 'gender', label: gender === 'MEN' ? 'Men' : 'Women', clear: () => applyFilters({ gender: '' }) });
  if (priceBandId) {
    activeChips.push({
      key: 'price',
      label: priceBands.find((band) => band.id === priceBandId)?.label || 'Budget',
      clear: () => applyFilters({ price: '' })
    });
  }
  if (search) activeChips.push({ key: 'search', label: `“${search}”`, clear: () => applyFilters({ search: '' }) });

  const renderFilters = () => (
    <div className="divide-y divide-line">
      <FilterSection title="Collection">
        <div className="space-y-1">
          {(facets?.collections || []).map((collection) => {
            const active = selectedCollections.includes(collection.id);
            return (
              <button
                key={collection.id}
                type="button"
                onClick={() => toggleValue('collection', collection.id, { clear: ['subCategory'] })}
                className={`flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left text-[11px] transition ${
                  active ? 'bg-plum/5 font-semibold text-plum' : 'text-muted hover:bg-paper hover:text-ink'
                }`}
              >
                <span className="flex items-center gap-2">
                  <span
                    className={`flex h-3.5 w-3.5 items-center justify-center rounded border ${
                      active ? 'border-plum bg-plum text-paper' : 'border-line bg-surface'
                    }`}
                  >
                    {active && <Check className="h-2.5 w-2.5" />}
                  </span>
                  {collection.label}
                </span>
                <span className="text-[9px] text-muted/60">{collection.count}</span>
              </button>
            );
          })}
        </div>
      </FilterSection>

      {subCategoryOptions.length > 0 && (
        <FilterSection title="Silhouette" hint={`${subCategoryOptions.length} types`}>
          <div className="flex flex-wrap gap-1.5">
            {subCategoryOptions.map((item) => {
              const active = subCategory === item.name;
              return (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => applyFilters({ subCategory: active ? '' : item.name })}
                  className={`rounded-full border px-2.5 py-1 text-[10px] transition ${
                    active
                      ? 'border-plum bg-plum text-paper'
                      : 'border-line bg-surface text-muted hover:border-plum/30 hover:text-plum'
                  }`}
                >
                  {item.name}
                  <span className={`ml-1 text-[8px] ${active ? 'text-paper/60' : 'text-muted/50'}`}>{item.count}</span>
                </button>
              );
            })}
          </div>
        </FilterSection>
      )}

      <FilterSection title="Rental budget" hint="per 3 days">
        <div className="space-y-1">
          {priceBands.map((band) => {
            const active = priceBandId === band.id;
            return (
              <button
                key={band.id}
                type="button"
                onClick={() => applyFilters({ price: active ? '' : band.id })}
                className={`flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left text-[11px] transition ${
                  active ? 'bg-plum/5 font-semibold text-plum' : 'text-muted hover:bg-paper hover:text-ink'
                }`}
              >
                <span className="flex items-center gap-2">
                  <span
                    className={`flex h-3.5 w-3.5 items-center justify-center rounded-full border ${
                      active ? 'border-plum' : 'border-line'
                    }`}
                  >
                    {active && <span className="h-1.5 w-1.5 rounded-full bg-plum" />}
                  </span>
                  {band.label}
                </span>
                <span className="text-[9px] text-muted/60">{band.count ?? ''}</span>
              </button>
            );
          })}
        </div>
      </FilterSection>

      <FilterSection title="Colour" hint="family">
        <div className="grid grid-cols-2 gap-1.5">
          {(facets?.colors || []).slice(0, 12).map((color) => {
            const active = selectedColors.includes(color.name);
            return (
              <button
                key={color.name}
                type="button"
                onClick={() => toggleValue('colorFamily', color.name)}
                className={`flex items-center gap-2 rounded-lg border px-2 py-1.5 text-left text-[10px] transition ${
                  active
                    ? 'border-plum bg-plum/5 font-semibold text-plum'
                    : 'border-line bg-surface text-muted hover:border-plum/30'
                }`}
              >
                <span
                  className="h-3 w-3 shrink-0 rounded-full border border-black/10"
                  style={{ backgroundColor: color.hex }}
                />
                <span className="truncate">{color.name}</span>
              </button>
            );
          })}
        </div>
      </FilterSection>

      <FilterSection title="Occasion">
        <div className="flex flex-wrap gap-1.5">
          {(facets?.occasions || []).slice(0, 8).map((occasion) => {
            const active = selectedOccasions.includes(occasion.name);
            return (
              <button
                key={occasion.name}
                type="button"
                onClick={() => toggleValue('occasion', occasion.name)}
                className={`rounded-full border px-2.5 py-1 text-[10px] transition ${
                  active
                    ? 'border-plum bg-plum text-paper'
                    : 'border-line bg-surface text-muted hover:border-plum/30 hover:text-plum'
                }`}
              >
                {occasion.name}
              </button>
            );
          })}
        </div>
      </FilterSection>

      <FilterSection title="Wearer">
        <div className="grid grid-cols-2 gap-1.5">
          {[
            { value: 'WOMEN', label: 'Women' },
            { value: 'MEN', label: 'Men' }
          ].map((option) => {
            const active = gender === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => applyFilters({ gender: active ? '' : option.value })}
                className={`rounded-lg border px-2 py-1.5 text-[10px] font-medium transition ${
                  active
                    ? 'border-plum bg-plum text-paper'
                    : 'border-line bg-surface text-muted hover:border-plum/30 hover:text-plum'
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </FilterSection>

      <FilterSection title="Designer" hint={`${facets?.brands?.length || 0} houses`}>
        <div className="space-y-1">
          {brandOptions.map((brand) => {
            const active = selectedBrands.includes(brand.name);
            return (
              <button
                key={brand.name}
                type="button"
                onClick={() => toggleValue('brand', brand.name)}
                className={`flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left text-[11px] transition ${
                  active ? 'bg-plum/5 font-semibold text-plum' : 'text-muted hover:bg-paper hover:text-ink'
                }`}
              >
                <span className="flex items-center gap-2">
                  <span
                    className={`flex h-3.5 w-3.5 items-center justify-center rounded border ${
                      active ? 'border-plum bg-plum text-paper' : 'border-line bg-surface'
                    }`}
                  >
                    {active && <Check className="h-2.5 w-2.5" />}
                  </span>
                  <span className="truncate">{brand.name}</span>
                </span>
                <span className="text-[9px] text-muted/60">{brand.count}</span>
              </button>
            );
          })}
          {(facets?.brands?.length || 0) > 9 && (
            <button
              type="button"
              onClick={() => setShowAllBrands((value) => !value)}
              className="mt-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-saffron hover:text-saffron-deep"
            >
              {showAllBrands ? 'Show fewer' : `Show all ${facets.brands.length}`}
            </button>
          )}
        </div>
      </FilterSection>
    </div>
  );

  return (
    <div className="min-h-screen pb-20">
      <div className="border-b border-line bg-surface">
        <div className="shell py-4">
          <nav className="flex items-center gap-1.5 text-[10px] text-muted">
            <Link to="/" className="hover:text-plum">Home</Link>
            <ChevronRight className="h-2.5 w-2.5" />
            <Link to="/catalog" className="hover:text-plum">Rent</Link>
            <ChevronRight className="h-2.5 w-2.5" />
            <span className="font-semibold text-plum">{activeCollectionMeta?.label || 'All pieces'}</span>
          </nav>

          <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <p className="eyebrow text-saffron">
                  {activeCollectionMeta?.hindi || 'Rentique collection'}
                </p>
                <span className="h-1 w-1 rounded-full bg-line" />
                <p className="text-[9px] uppercase tracking-[0.14em] text-muted">
                  {loading ? 'Loading' : `${products.length} pieces`}
                </p>
              </div>
              <h1 className="display-title mt-2 text-3xl text-plum sm:text-[40px]">{heading}</h1>
              <p className="mt-2 max-w-xl text-[11px] leading-relaxed text-muted">{tagline}</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(true)}
                className="inline-flex items-center gap-2 rounded-full border border-line bg-paper px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-plum lg:hidden"
              >
                <SlidersHorizontal className="h-3.5 w-3.5" />
                Filters
                {activeChips.length > 0 && (
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-plum text-[8px] text-paper">
                    {activeChips.length}
                  </span>
                )}
              </button>
              <label className="flex items-center gap-2 rounded-full border border-line bg-paper px-3 py-2.5 text-[10px] text-muted">
                <span className="hidden sm:inline">Sort</span>
                <select
                  value={sort}
                  onChange={(event) => applyFilters({ sort: event.target.value === 'popular' ? '' : event.target.value })}
                  className="cursor-pointer bg-transparent text-[10px] font-semibold uppercase tracking-[0.1em] text-plum focus:outline-none"
                >
                  <option value="popular">Recommended</option>
                  <option value="rating">Top rated</option>
                  <option value="price_asc">Price: low to high</option>
                  <option value="price_desc">Price: high to low</option>
                </select>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Collection pills */}
      <div className="sticky top-[105px] z-30 border-b border-line bg-paper/95 backdrop-blur-xl">
        <div className="shell flex items-center gap-2 overflow-x-auto py-3 no-scrollbar">
          <button
            type="button"
            onClick={() => applyFilters({ collection: '', subCategory: '' })}
            className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] transition ${
              selectedCollections.length === 0
                ? 'bg-plum text-paper'
                : 'border border-line bg-surface text-muted hover:border-plum/30 hover:text-plum'
            }`}
          >
            All pieces
          </button>
          {(facets?.collections || []).map((collection) => {
            const active = selectedCollections.includes(collection.id);
            return (
              <button
                key={collection.id}
                type="button"
                onClick={() => toggleValue('collection', collection.id, { clear: ['subCategory'] })}
                className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] transition ${
                  active
                    ? 'bg-plum text-paper'
                    : 'border border-line bg-surface text-muted hover:border-plum/30 hover:text-plum'
                }`}
              >
                {collection.label}
                <span className={`ml-1.5 text-[8px] ${active ? 'text-paper/55' : 'text-muted/50'}`}>
                  {collection.count}
                </span>
              </button>
            );
          })}
          {search && (
            <span className="ml-auto hidden shrink-0 items-center gap-1.5 rounded-full bg-saffron-soft px-3 py-1.5 text-[10px] font-semibold text-saffron-deep sm:flex">
              Search: {search}
              <button type="button" onClick={() => applyFilters({ search: '' })}>
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
        </div>
      </div>

      <div className="shell pt-6">
        {activeChips.length > 0 && (
          <div className="mb-5 flex flex-wrap items-center gap-2">
            {activeChips.map((chip) => (
              <span
                key={chip.key}
                className="inline-flex items-center gap-1.5 rounded-full border border-plum/20 bg-plum/5 px-2.5 py-1 text-[10px] font-medium text-plum"
              >
                {chip.label}
                <button type="button" onClick={chip.clear} aria-label={`Remove ${chip.label}`}>
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
            <button
              type="button"
              onClick={clearAll}
              className="ml-1 text-[9px] font-semibold uppercase tracking-[0.14em] text-saffron hover:text-saffron-deep"
            >
              Clear all
            </button>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-4">
          <aside className="hidden lg:block">
            <div className="sticky top-[165px] overflow-hidden rounded-2xl border border-line bg-surface">
              <div className="flex items-center justify-between border-b border-line px-4 py-3.5">
                <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-plum">
                  <SlidersHorizontal className="h-3.5 w-3.5" /> Filters
                </p>
                {activeChips.length > 0 && (
                  <button
                    type="button"
                    onClick={clearAll}
                    className="text-[9px] font-semibold uppercase tracking-[0.12em] text-saffron hover:text-saffron-deep"
                  >
                    Reset
                  </button>
                )}
              </div>
              <div className="max-h-[calc(100vh-215px)] overflow-y-auto">{renderFilters()}</div>
            </div>

            <div className="mt-4 rounded-2xl border border-forest/20 bg-forest-soft p-4">
              <div className="flex items-center gap-2 text-forest">
                <Wallet className="h-4 w-4" />
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em]">Deposit promise</p>
              </div>
              <p className="mt-2 text-[10px] leading-relaxed text-forest/80">
                Every piece carries a fully refundable security deposit. It returns to your Rentique wallet after
                the visual inspection.
              </p>
            </div>
          </aside>

          <div className="lg:col-span-3">
            {loading ? (
              <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3">
                {Array.from({ length: 9 }).map((_, index) => (
                  <div key={index} className="overflow-hidden rounded-2xl border border-line bg-surface">
                    <div className="aspect-[3/4] animate-pulse bg-plum-mist" />
                    <div className="space-y-2 p-4">
                      <div className="h-2.5 w-1/3 animate-pulse rounded bg-plum/10" />
                      <div className="h-3 w-4/5 animate-pulse rounded bg-plum/10" />
                      <div className="h-4 w-2/5 animate-pulse rounded bg-plum/10" />
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="rounded-3xl border border-line bg-surface px-6 py-20 text-center">
                <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-saffron-soft text-saffron">
                  <Sparkles className="h-6 w-6" />
                </span>
                <h2 className="mt-4 font-display text-2xl font-semibold text-plum">Nothing in this edit yet</h2>
                <p className="mx-auto mt-2 max-w-sm text-[11px] leading-relaxed text-muted">
                  Try removing a filter, broadening the budget, or search for a silhouette like “lehenga”,
                  “saree”, “kundan” or “sherwani”.
                </p>
                <button type="button" onClick={clearAll} className="btn-primary mt-5">
                  Reset all filters
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <>
                <div className="mb-4 flex items-center justify-between text-[10px] text-muted">
                  <p>
                    Showing <span className="font-semibold text-plum">{products.length}</span> pieces
                  </p>
                  <p className="hidden sm:block">Rental fee for a 3-day tenure · deposit included separately</p>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3">
                  {products.map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>
                <div className="mt-10 flex flex-col items-center justify-between gap-4 rounded-2xl border border-line bg-surface px-5 py-5 sm:flex-row">
                  <div>
                    <p className="font-display text-lg font-semibold text-plum">Not sure about the fit?</p>
                    <p className="mt-1 text-[10px] text-muted">
                      Every rental includes a free size consultation and a doorstep pickup.
                    </p>
                  </div>
                  <Link to="/product/timeline-preview" className="btn-ghost !py-2.5">
                    See how inspection works
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile filter drawer */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-plum-deep/60 backdrop-blur-sm"
            onClick={() => setMobileFiltersOpen(false)}
            aria-label="Close filters"
          />
          <div className="absolute inset-y-0 right-0 flex w-[92%] max-w-sm flex-col bg-paper">
            <div className="flex items-center justify-between border-b border-line px-4 py-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-plum">Filters</p>
                <p className="mt-0.5 text-[10px] text-muted">{products.length} pieces</p>
              </div>
              <div className="flex items-center gap-3">
                {activeChips.length > 0 && (
                  <button
                    type="button"
                    onClick={clearAll}
                    className="text-[9px] font-semibold uppercase tracking-[0.12em] text-saffron"
                  >
                    Reset
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setMobileFiltersOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-line bg-surface text-plum"
                  aria-label="Close filters"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">{renderFilters()}</div>
            <div className="border-t border-line bg-paper p-4">
              <button type="button" onClick={() => setMobileFiltersOpen(false)} className="btn-primary w-full">
                Show {products.length} pieces
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
