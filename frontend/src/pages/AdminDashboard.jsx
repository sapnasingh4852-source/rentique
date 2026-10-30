import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Split, Plus, Package, Clock, AlertTriangle, ShieldCheck, DollarSign, Users, Sparkles, ExternalLink, RefreshCw, Store, Wallet, CheckCircle2, PackageCheck } from 'lucide-react';
import api from '../api/client';
import InspectionModal from '../components/inspection/InspectionModal';
import DispatchEvidenceModal from '../components/evidence/DispatchEvidenceModal';

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState(null);
  const [pendingQueue, setPendingQueue] = useState([]);
  const [dispatchQueue, setDispatchQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRentalForInspect, setSelectedRentalForInspect] = useState(null);
  const [selectedRentalForDispatch, setSelectedRentalForDispatch] = useState(null);
  const [showAddProductModal, setShowAddProductModal] = useState(false);

  // New product form state
  const [newTitle, setNewTitle] = useState('');
  const [newBrand, setNewBrand] = useState('');
  const [newCategory, setNewCategory] = useState('CLOTHES');
  const [newSubCategory, setNewSubCategory] = useState('Evening Gown');
  const [newActualPrice, setNewActualPrice] = useState(60000);
  const [newDescription, setNewDescription] = useState('Exquisite designer piece crafted with luxury embroidery.');
  const [addingProduct, setAddingProduct] = useState(false);

  const fetchAdminData = async () => {
    try {
      const { data } = await api.get('/admin/metrics');
      if (data.success) {
        setMetrics(data.metrics);
        setPendingQueue(data.pendingInspectionQueue || []);
        setDispatchQueue(data.dispatchQueue || []);
      }
    } catch (err) {
      console.error('Failed to load admin metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    setAddingProduct(true);

    try {
      const { data } = await api.post('/products', {
        title: newTitle,
        brand: newBrand,
        category: newCategory,
        subCategory: newSubCategory,
        actualPrice: Number(newActualPrice),
        description: newDescription,
        size: ['S', 'M', 'L']
      });

      if (data.success) {
        alert('Product added with Cloudinary front, fabric and tag listing assets!');
        setShowAddProductModal(false);
        setNewTitle('');
        setNewBrand('');
        fetchAdminData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create product');
    } finally {
      setAddingProduct(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-sans">
      {/* 1. Header with Quick Actions */}
      <div className="indian-maroon-dark text-white p-6 sm:p-8 rounded-3xl border border-[#D4AF37]/30 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center space-x-2 text-[#FDE68A] text-xs font-bold mb-1">
            <Store className="w-4 h-4 text-[#D4AF37]" />
            <span>RENTIQUE BOUTIQUE SELLER STUDIO • OPERATIONS HUB</span>
          </div>
          <h1 className="font-royal text-2xl sm:text-3xl font-bold">
            Boutique Partner & Seller Portal
          </h1>
          <p className="text-xs text-amber-100/80 mt-1 font-light">
            List your ethnic wear, manage rentals, inspect returns with Cloudinary zoom & settle deposit refunds.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchAdminData}
            className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-gray-200 hover:text-white transition"
            title="Refresh Metrics"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={() => setShowAddProductModal(true)}
            className="bg-[#D4AF37] hover:bg-[#B45309] text-[#1A0B10] hover:text-white font-bold text-xs px-5 py-2.5 rounded-xl transition shadow flex items-center space-x-1.5 uppercase tracking-wider"
          >
            <Plus className="w-4 h-4" />
            <span>List Outfit / Jewellery</span>
          </button>
        </div>
      </div>

      {/* 2. Key Metrics Grid (Section 23 Requirements) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex justify-between items-center text-gray-400 text-xs mb-1">
            <span>Total Catalog</span>
            <Package className="w-4 h-4 text-gold" />
          </div>
          <span className="text-2xl font-bold text-gray-900">{metrics?.totalProducts || 6}</span>
          <span className="text-[10px] text-gray-500 block mt-0.5">Active Products</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex justify-between items-center text-gray-400 text-xs mb-1">
            <span>Active Rentals</span>
            <Clock className="w-4 h-4 text-emerald-500" />
          </div>
          <span className="text-2xl font-bold text-gray-900">{metrics?.activeRentals || 2}</span>
          <span className="text-[10px] text-emerald-600 font-semibold block mt-0.5">Out on Rent</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex justify-between items-center text-gray-400 text-xs mb-1">
            <span>Overdue Returns</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <span className="text-2xl font-bold text-rose-700">{metrics?.overdueRentals || 1}</span>
          <span className="text-[10px] text-rose-600 block mt-0.5">2%/day Fee Applied</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex justify-between items-center text-gray-400 text-xs mb-1">
            <span>Pending Review</span>
            <Split className="w-4 h-4 text-amber-500" />
          </div>
          <span className="text-2xl font-bold text-amber-700">{pendingQueue.length}</span>
          <span className="text-[10px] text-amber-600 font-bold block mt-0.5">Needs Visual Audit</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm col-span-2 sm:col-span-1">
          <div className="flex justify-between items-center text-gray-400 text-xs mb-1">
            <span>Rental Revenue</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="text-2xl font-bold text-gray-900">₹{(metrics?.totalRevenue || 41000).toLocaleString()}</span>
          <span className="text-[10px] text-gray-500 block mt-0.5">Total Paid Rent (20%)</span>
        </div>
      </div>

      {/* 3. New Orders — Dispatch Preparation Queue */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <PackageCheck className="w-5 h-5 text-goldDark" />
              <h3 className="font-serif text-xl font-bold text-gray-900">
                New Orders — Dispatch Preparation
              </h3>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Fresh bookings waiting for the boutique. Capture the 5-angle condition proof to lock the
              dispatch record — the order then moves to the logistics partner automatically.
            </p>
          </div>

          <span className="bg-plum-deep text-white text-xs font-bold px-3 py-1 rounded-full">
            {dispatchQueue.length} to dispatch
          </span>
        </div>

        {dispatchQueue.length === 0 ? (
          <div className="p-12 text-center text-xs text-gray-500">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <span>No new orders right now — every booking has been dispatched.</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider text-[10px] border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3">Rental #</th>
                  <th className="px-6 py-3">Garment & Customer</th>
                  <th className="px-6 py-3">Deliver To</th>
                  <th className="px-6 py-3">Payment</th>
                  <th className="px-6 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {dispatchQueue.map(rental => {
                  const product = rental.product || {};
                  const customer = rental.customer || {};

                  return (
                    <tr key={rental._id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 font-mono font-bold text-gray-900">
                        #{rental.rentalNumber}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <img
                            src={rental.product?.listingImages?.[0]?.secureUrl}
                            alt="product"
                            className="w-9 h-12 object-cover rounded-lg border"
                          />
                          <div>
                            <div className="font-semibold text-gray-900">{product.title}</div>
                            <div className="text-[11px] text-gray-500">
                              Customer: {customer.name} · Size {rental.size}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-[11px] text-gray-700">
                        <div className="font-medium">{rental.delivery?.fullName}</div>
                        <div className="text-gray-500">
                          {rental.delivery?.city}, {rental.delivery?.state} — {rental.delivery?.pincode}
                        </div>
                        <div className="text-gray-400">ETA {rental.delivery?.etaDays} day(s)</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded font-semibold text-[10px] ${
                          rental.paymentStatus === 'PENDING'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-50 text-emerald-800'
                        }`}>
                          {rental.paymentMethod} · {rental.paymentStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setSelectedRentalForDispatch(rental)}
                          className="bg-plum-deep text-white hover:bg-gold hover:text-black px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm inline-flex items-center space-x-1.5"
                        >
                          <PackageCheck className="w-3.5 h-3.5 text-gold" />
                          <span>Capture Dispatch Proof</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 4. Flagship Section: "Pending Visual Inspections" Queue */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <Split className="w-5 h-5 text-goldDark" />
              <h3 className="font-serif text-xl font-bold text-gray-900">
                Pending Visual Inspections Queue
              </h3>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Compare Before vs After Cloudinary evidence side-by-side to assess condition and clear deposit refunds.
            </p>
          </div>

          <span className="bg-amber-100 text-amber-900 text-xs font-bold px-3 py-1 rounded-full">
            {pendingQueue.length} in queue
          </span>
        </div>

        {pendingQueue.length === 0 ? (
          <div className="p-12 text-center text-xs text-gray-500">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <span>All returned garments have been inspected and refunded!</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider text-[10px] border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3">Rental #</th>
                  <th className="px-6 py-3">Garment & Customer</th>
                  <th className="px-6 py-3">Security Deposit</th>
                  <th className="px-6 py-3">Return Proof</th>
                  <th className="px-6 py-3">Customer Preference</th>
                  <th className="px-6 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pendingQueue.map(rental => {
                  const product = rental.product || {};
                  const customer = rental.customer || {};

                  return (
                    <tr key={rental._id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 font-mono font-bold text-gray-900">
                        #{rental.rentalNumber}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-900">{product.title}</div>
                        <div className="text-[11px] text-gray-500">Customer: {customer.name}</div>
                      </td>
                      <td className="px-6 py-4 font-semibold text-gray-900">
                        ₹{rental.pricing?.securityDeposit?.toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded font-semibold text-[10px] flex items-center w-fit">
                          <Sparkles className="w-3 h-3 mr-1 text-emerald-600" />
                          Cloudinary Ready
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[11px] font-medium text-gray-700">
                          {rental.refundPreference === 'APP_WALLET' ? 'App Wallet' : 'Original Source'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setSelectedRentalForInspect(rental)}
                          className="bg-plum-deep text-white hover:bg-gold hover:text-black px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm inline-flex items-center space-x-1.5"
                        >
                          <Split className="w-3.5 h-3.5 text-gold" />
                          <span>Open Visual Comparison Studio</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Dispatch Evidence Modal */}
      {selectedRentalForDispatch && (
        <DispatchEvidenceModal
          rental={selectedRentalForDispatch}
          isOpen={true}
          onClose={() => setSelectedRentalForDispatch(null)}
          onSuccess={() => {
            fetchAdminData();
          }}
        />
      )}

      {/* Visual Inspection Modal */}
      {selectedRentalForInspect && (
        <InspectionModal
          rental={selectedRentalForInspect}
          isOpen={true}
          onClose={() => setSelectedRentalForInspect(null)}
          onSuccess={() => {
            fetchAdminData();
          }}
        />
      )}

      {/* Add New Product Modal */}
      {showAddProductModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <h3 className="font-serif text-xl font-bold text-gray-900">
              Add New Designer Product to Wardrobe
            </h3>
            <p className="text-xs text-gray-500">
              Generates Front, Back, Side, Close-up, and Tag multi-angle Cloudinary listing assets automatically.
            </p>

            <form onSubmit={handleCreateProduct} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block mb-1">Product Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="E.g., Manish Malhotra Embroidered Velvet Sherwani"
                  className="w-full p-2.5 border rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Brand Name</label>
                  <input
                    type="text"
                    required
                    value={newBrand}
                    onChange={(e) => setNewBrand(e.target.value)}
                    placeholder="E.g., Manish Malhotra"
                    className="w-full p-2.5 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full p-2.5 border rounded-lg bg-white"
                  >
                    <option value="CLOTHES">Clothes</option>
                    <option value="SHOES">Shoes</option>
                    <option value="ACCESSORIES">Accessories</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold block mb-1">Retail Price (100%) in ₹</label>
                <input
                  type="number"
                  required
                  value={newActualPrice}
                  onChange={(e) => setNewActualPrice(e.target.value)}
                  className="w-full p-2.5 border rounded-lg"
                />
                <div className="text-[11px] text-gray-500 mt-1 flex justify-between">
                  <span>Auto-computed Rent (20%): ₹{(newActualPrice * 0.20).toLocaleString()}</span>
                  <span>Deposit (30%): ₹{(newActualPrice * 0.30).toLocaleString()}</span>
                </div>
              </div>

              <div>
                <label className="font-semibold block mb-1">Description</label>
                <textarea
                  rows={2}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full p-2.5 border rounded-lg"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddProductModal(false)}
                  className="px-4 py-2 text-gray-600 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addingProduct}
                  className="bg-plum-deep text-white hover:bg-gold hover:text-black px-5 py-2.5 rounded-lg font-bold uppercase tracking-wider transition"
                >
                  {addingProduct ? 'Adding...' : 'Create & Upload Multi-Angle Media'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
