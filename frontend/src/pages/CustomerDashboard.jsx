import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Wallet, RotateCcw, Award, CheckCircle2, AlertTriangle, ArrowRightLeft, Camera, Clock } from 'lucide-react';
import api from '../api/client';
import ReceiveVerificationModal from '../components/evidence/ReceiveVerificationModal';
import ReturnRequestModal from '../components/evidence/ReturnRequestModal';
import DisputeModal from '../components/inspection/DisputeModal';

export default function CustomerDashboard() {
  const { user, refreshMe } = useAuth();
  const [rentals, setRentals] = useState([]);
  const [penalties, setPenalties] = useState([]);
  const [loading, setLoading] = useState(true);

  // Active modals
  const [selectedRentalForReceive, setSelectedRentalForReceive] = useState(null);
  const [selectedRentalForReturn, setSelectedRentalForReturn] = useState(null);
  const [selectedPenaltyForDispute, setSelectedPenaltyForDispute] = useState(null);
  const [updatingPrefId, setUpdatingPrefId] = useState(null);

  const fetchDashboardData = async () => {
    try {
      const [rentalRes, penRes] = await Promise.all([
        api.get('/rentals/my-rentals'),
        api.get('/penalties/my-penalties').catch(() => ({ data: { penalties: [] } }))
      ]);

      if (rentalRes.data.success) {
        setRentals(rentalRes.data.rentals || []);
      }
      if (penRes.data?.success) {
        setPenalties(penRes.data.penalties || []);
      }
    } catch (err) {
      console.error('Dashboard data load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleTogglePreference = async (rentalId, currentPref) => {
    const nextPref = currentPref === 'APP_WALLET' ? 'ORIGINAL_PAYMENT_METHOD' : 'APP_WALLET';
    setUpdatingPrefId(rentalId);

    try {
      const { data } = await api.put(`/rentals/${rentalId}/refund-preference`, {
        refundPreference: nextPref
      });

      if (data.success) {
        setRentals(prev => prev.map(r => r._id === rentalId ? { ...r, refundPreference: nextPref } : r));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update preference');
    } finally {
      setUpdatingPrefId(null);
    }
  };

  const activeRentals = rentals.filter(r => ['BOOKED', 'DISPATCH_PREPARED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'RETURN_REQUESTED', 'UNDER_INSPECTION'].includes(r.status));
  const completedRentals = rentals.filter(r => r.status === 'COMPLETED');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12 font-sans">
      {/* 1. VIP Member Profile, Trust Score & Loyalty Perks Bar */}
      <div className="indian-maroon-dark text-white rounded-3xl p-6 sm:p-10 border border-[#D4AF37]/30 shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-[#D4AF37]/15 to-transparent pointer-events-none"></div>

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          {/* Avatar & Greetings */}
          <div className="md:col-span-5 flex items-center space-x-4">
            <div className="relative flex-shrink-0">
              <img
                src={user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
                alt={user?.name}
                className="w-16 h-16 rounded-full object-cover border-2 border-[#D4AF37] shadow-lg"
              />
              <span className="absolute bottom-0 right-0 bg-emerald-500 w-4 h-4 rounded-full ring-2 ring-[#1A0B10]"></span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="font-royal text-2xl sm:text-3xl font-bold tracking-wide text-white">{user?.name}</h2>
                <span className="text-[9px] uppercase tracking-widest bg-[#D4AF37]/20 text-[#FDE68A] font-bold px-2 py-0.5 rounded-full border border-[#D4AF37]/40">
                  {user?.loyaltyTier || 'SILVER'}
                </span>
              </div>
              <p className="text-xs text-amber-100/70 mt-1 font-light">{user?.email} • Rentique Verified Customer</p>
            </div>
          </div>

          {/* Trust Score & Perks Widget */}
          <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 md:pt-0 border-t md:border-t-0 md:border-l border-[#24242A] md:pl-8">
            <div className="bg-white/5 p-4 rounded-2xl border border-white/10 shadow-sm">
              <span className="text-[10px] uppercase tracking-wider text-gray-400 block mb-1">Trust Score</span>
              <div className="flex items-center space-x-1.5 text-[#C8A26A] font-serif text-2xl font-bold">
                <ShieldCheck className="w-5 h-5 text-[#C8A26A]" />
                <span>{user?.trustScore || 96}/100</span>
              </div>
              <span className="text-[10px] text-emerald-400 font-medium block mt-0.5">⭐ Trusted Renter</span>
            </div>

            <div className="bg-white/5 p-4 rounded-2xl border border-white/10 shadow-sm">
              <span className="text-[10px] uppercase tracking-wider text-gray-400 block mb-1">App Wallet</span>
              <div className="flex items-center space-x-1.5 text-emerald-400 font-serif text-2xl font-bold">
                <Wallet className="w-5 h-5 text-emerald-400" />
                <span>₹{(user?.walletBalance || 0).toLocaleString()}</span>
              </div>
              <span className="text-[10px] text-gray-400 block mt-0.5 font-light">Instant Refund Ready</span>
            </div>

            <div className="bg-white/5 p-4 rounded-2xl border border-white/10 col-span-2 sm:col-span-1 shadow-sm">
              <span className="text-[10px] uppercase tracking-wider text-gray-400 block mb-1">Tier Discount</span>
              <div className="flex items-center space-x-1.5 text-[#E8DBC3] font-serif text-2xl font-bold">
                <Award className="w-5 h-5 text-[#C8A26A]" />
                <span>{user?.loyaltyTier === 'GOLD' ? '10% OFF' : '5% OFF'}</span>
              </div>
              <span className="text-[10px] text-gray-400 block mt-0.5 font-light">{user?.successfulReturns || 5} clean returns</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Active Rentals */}
      <div className="space-y-5">
        <div className="flex justify-between items-center border-b border-[#E8E3D9] pb-3">
          <div>
            <h3 className="font-serif text-2xl font-normal text-[#0F0F11]">Active & In-Progress Rentals</h3>
            <p className="text-xs text-gray-500 font-light">Track dispatch status, receive verification, and return pickups.</p>
          </div>
          <span className="text-[10px] uppercase tracking-wider font-bold bg-[#FAF8F5] text-[#7A5C2D] border border-[#E8E3D9] px-3 py-1 rounded-full">
            {activeRentals.length} Active
          </span>
        </div>

        {activeRentals.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-[#E8E3D9] text-center font-light">
            <RotateCcw className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-xs text-gray-500">No active rentals right now.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activeRentals.map(rental => {
              const product = rental.product || {};
              const images = product.listingImages || [];
              const frontImg = images[0]?.secureUrl || 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=400&q=80';

              const dueDateStr = new Date(rental.dueDate).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
              });

              const msDiff = new Date(rental.dueDate).getTime() - new Date().getTime();
              const daysRemaining = Math.ceil(msDiff / (1000 * 60 * 60 * 24));

              return (
                <div
                  key={rental._id}
                  className="bg-white rounded-3xl border border-[#E8E3D9] p-6 shadow-aesthetic hover:shadow-aesthetic-hover transition duration-300 space-y-4"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 border-b border-[#E8E3D9] gap-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-bold text-[#0F0F11] bg-[#FAF8F5] px-2.5 py-1 rounded-lg border border-[#E8E3D9]">
                        #{rental.rentalNumber}
                      </span>
                      <span className="text-xs text-gray-300">•</span>
                      <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#9E7A45]">
                        {product.brand}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className={`text-[10px] uppercase tracking-wider font-bold px-3 py-1 rounded-full border ${
                        rental.status === 'UNDER_INSPECTION'
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : rental.status === 'RETURN_REQUESTED'
                          ? 'bg-blue-50 text-blue-800 border-blue-200'
                          : rental.status === 'DELIVERED'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-gray-50 text-gray-800 border-gray-200'
                      }`}>
                        {rental.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                    {/* Product Info */}
                    <div className="md:col-span-5 flex items-center space-x-4">
                      <img
                        src={frontImg}
                        alt={product.title}
                        className="w-16 h-20 object-cover object-top rounded-xl border border-[#E8E3D9] shadow-sm flex-shrink-0"
                      />
                      <div>
                        <h4 className="font-serif text-base font-medium text-[#0F0F11] line-clamp-1">
                          {product.title}
                        </h4>
                        <div className="text-xs text-gray-500 mt-1 font-light">
                          Rent: <strong>₹{rental.pricing?.rentalPrice?.toLocaleString()}</strong> • Deposit: <strong>₹{rental.pricing?.securityDeposit?.toLocaleString()}</strong>
                        </div>
                        <div className="text-[11px] text-gray-400 mt-1 flex items-center space-x-1">
                          <Clock className="w-3 h-3 text-gray-400" />
                          <span>Due: {dueDateStr} ({daysRemaining >= 0 ? `${daysRemaining} days left` : `${Math.abs(daysRemaining)} days overdue`})</span>
                        </div>
                      </div>
                    </div>

                    {/* Refund Preference Selector UI */}
                    <div className="md:col-span-4 bg-[#FAF8F5] p-3.5 rounded-2xl border border-[#E8E3D9] text-xs">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] uppercase tracking-wider font-bold text-gray-500">Refund Destination:</span>
                        <button
                          onClick={() => handleTogglePreference(rental._id, rental.refundPreference)}
                          disabled={updatingPrefId === rental._id}
                          className="text-[10px] uppercase tracking-wider text-[#9E7A45] hover:underline font-bold"
                        >
                          {updatingPrefId === rental._id ? 'Updating...' : 'Change'}
                        </button>
                      </div>
                      <div className="flex items-center space-x-1.5 text-[#0F0F11] font-medium text-xs">
                        {rental.refundPreference === 'APP_WALLET' ? (
                          <>
                            <Wallet className="w-3.5 h-3.5 text-emerald-600" />
                            <span>App Wallet (Instant Credit)</span>
                          </>
                        ) : (
                          <>
                            <ArrowRightLeft className="w-3.5 h-3.5 text-[#9E7A45]" />
                            <span>Original Payment Method (Card)</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="md:col-span-3 flex flex-col gap-2">
                      {rental.status === 'DELIVERED' && (
                        <button
                          onClick={() => setSelectedRentalForReceive(rental)}
                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold tracking-wider uppercase py-2.5 px-3 rounded-full transition flex items-center justify-center space-x-1 shadow-sm"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Verify Receive Condition</span>
                        </button>
                      )}

                      {['DELIVERED', 'DISPATCH_PREPARED', 'OUT_FOR_DELIVERY'].includes(rental.status) && (
                        <button
                          onClick={() => setSelectedRentalForReturn(rental)}
                          className="w-full bg-[#0F0F11] hover:bg-[#C8A26A] hover:text-[#0F0F11] text-white text-xs font-semibold tracking-wider uppercase py-2.5 px-3 rounded-full transition flex items-center justify-center space-x-1 shadow-sm"
                        >
                          <Camera className="w-3.5 h-3.5" />
                          <span>Request Return (Photos)</span>
                        </button>
                      )}

                      {rental.status === 'UNDER_INSPECTION' && (
                        <span className="text-[11px] text-center text-amber-900 bg-amber-50 p-2.5 rounded-xl border border-amber-200/80 font-medium">
                          🔍 Side-by-Side Visual Review in Progress
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. Settled Refunds */}
      <div className="space-y-4">
        <h3 className="font-serif text-2xl font-normal text-[#0F0F11] border-b border-[#E8E3D9] pb-3">
          Completed Rentals & Settled Refunds
        </h3>

        {completedRentals.length === 0 ? (
          <div className="bg-white p-6 rounded-2xl border border-[#E8E3D9] text-center text-xs text-gray-400 font-light">
            No completed rentals yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {completedRentals.map(rental => (
              <div key={rental._id} className="bg-white rounded-2xl p-5 border border-[#E8E3D9] shadow-sm space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-mono font-bold text-[#0F0F11]">#{rental.rentalNumber}</span>
                  <span className="text-emerald-800 font-bold bg-emerald-50 px-3 py-0.5 rounded-full border border-emerald-200 text-[10px] uppercase tracking-wider">
                    Refund Settled: ₹{rental.pricing?.calculatedRefund?.toLocaleString()}
                  </span>
                </div>
                <h4 className="font-serif text-base font-medium text-[#0F0F11]">{rental.product?.title}</h4>
                <div className="text-xs text-gray-500 flex justify-between pt-2 border-t border-[#E8E3D9] font-light">
                  <span>Refunded To: <strong>{rental.refundPreference === 'APP_WALLET' ? 'App Wallet' : 'Original Card/Source'}</strong></span>
                  <span className="text-emerald-700 font-medium">Inspected & Cleared</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4. Active Damage Penalties & Dispute Center */}
      {penalties.length > 0 && (
        <div className="space-y-4 pt-6 border-t border-[#E8E3D9]">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-[#B91C1C]" />
            <h3 className="font-serif text-2xl font-normal text-[#0F0F11]">
              Inspection Notices & Dispute Hub
            </h3>
          </div>
          <p className="text-xs text-gray-500 font-light">
            You can contest any damage penalty by uploading counter-evidence from your delivery receipt.
          </p>

          <div className="space-y-3">
            {penalties.map(p => (
              <div key={p._id} className="bg-rose-50/60 border border-rose-200 rounded-2xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-rose-900 uppercase tracking-wider">Penalty Notice: ₹{p.amount}</span>
                    <span className="text-[9px] bg-rose-200/70 text-rose-900 px-2.5 py-0.5 rounded font-bold uppercase tracking-wider">
                      Status: {p.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-700 mt-1 font-light">{p.reason}</p>
                </div>

                {p.status === 'APPLIED' && (
                  <button
                    onClick={() => setSelectedPenaltyForDispute(p)}
                    className="bg-[#0F0F11] text-white hover:bg-[#C8A26A] hover:text-[#0F0F11] px-5 py-2.5 rounded-full text-xs font-semibold tracking-wider uppercase transition flex-shrink-0"
                  >
                    Dispute Penalty
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active Modals */}
      {selectedRentalForReceive && (
        <ReceiveVerificationModal
          rental={selectedRentalForReceive}
          isOpen={true}
          onClose={() => setSelectedRentalForReceive(null)}
          onSuccess={() => {
            fetchDashboardData();
            refreshMe();
          }}
        />
      )}

      {selectedRentalForReturn && (
        <ReturnRequestModal
          rental={selectedRentalForReturn}
          isOpen={true}
          onClose={() => setSelectedRentalForReturn(null)}
          onSuccess={() => {
            fetchDashboardData();
            refreshMe();
          }}
        />
      )}

      {selectedPenaltyForDispute && (
        <DisputeModal
          penalty={selectedPenaltyForDispute}
          isOpen={true}
          onClose={() => setSelectedPenaltyForDispute(null)}
          onSuccess={() => {
            fetchDashboardData();
            refreshMe();
          }}
        />
      )}
    </div>
  );
}
