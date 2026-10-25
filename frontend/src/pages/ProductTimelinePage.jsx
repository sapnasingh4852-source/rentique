import React, { useState, useEffect } from 'react';
import { ShieldCheck, Sparkles, ChevronRight, Package, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import ConditionTimeline from '../components/product/ConditionTimeline';

export default function ProductTimelinePage() {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        const { data } = await api.get('/products');
        if (data.success && data.products) {
          setProducts(data.products);
          // Default to first product (Sabyasachi Lehenga with rich timeline)
          setSelectedProduct(data.products[0]);
        }
      } catch (err) {
        console.error('Failed to load products for timeline:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCatalog();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="bg-plum-deep text-white p-6 sm:p-8 rounded-3xl border border-gray-800 shadow-xl">
        <div className="flex items-center space-x-2 text-gold text-xs font-semibold mb-1">
          <ShieldCheck className="w-4 h-4 text-gold" />
          <span>IMMUTABLE VISUAL AUDIT TRAIL</span>
        </div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold">
          Product Condition Timeline Studio
        </h1>
        <p className="text-xs text-gray-400 mt-1 max-w-2xl leading-relaxed">
          Every garment's lifetime journey is permanently chronicled using Cloudinary media public IDs. Inspect how pieces are cataloged, rented, returned, inspected, and restored to pristine condition.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Select Garment */}
        <div className="lg:col-span-4 space-y-3">
          <h3 className="font-serif text-base font-bold text-gray-900">
            Select Garment to Inspect
          </h3>

          <div className="space-y-2">
            {products.map(p => {
              const isSelected = selectedProduct?._id === p._id;
              const thumb = p.listingImages?.[0]?.secureUrl;

              return (
                <div
                  key={p._id}
                  onClick={() => setSelectedProduct(p)}
                  className={`p-3 rounded-2xl border cursor-pointer transition flex items-center space-x-3 ${
                    isSelected
                      ? 'border-gold bg-amber-50/60 ring-2 ring-gold/30 shadow-sm'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <img
                    src={thumb}
                    alt={p.title}
                    className="w-12 h-14 object-cover object-top rounded-lg border flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] uppercase font-bold text-goldDark block">
                      {p.brand}
                    </span>
                    <h4 className="font-serif text-xs font-bold text-gray-900 truncate">
                      {p.title}
                    </h4>
                    <span className="text-[10px] text-gray-500">
                      {p.conditionHistory?.length || 1} Timeline Event(s)
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Visual Timeline */}
        <div className="lg:col-span-8">
          {selectedProduct ? (
            <ConditionTimeline
              history={selectedProduct.conditionHistory}
              currentCondition={selectedProduct.currentCondition}
              title={selectedProduct.title}
            />
          ) : (
            <div className="p-12 text-center text-xs text-gray-400">Loading timeline...</div>
          )}
        </div>
      </div>
    </div>
  );
}
