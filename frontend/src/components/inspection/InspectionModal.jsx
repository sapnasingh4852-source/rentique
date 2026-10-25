import React, { useState } from 'react';
import { ShieldCheck, AlertTriangle, CheckCircle2, Split, X, Loader2, DollarSign } from 'lucide-react';
import { getInspectionImageUrl } from '../../services/cloudinaryUtils';
import api from '../../api/client';

export default function InspectionModal({ rental, isOpen, onClose, onSuccess }) {
  const [selectedAngle, setSelectedAngle] = useState('FRONT');
  const [condition, setCondition] = useState('NO_DAMAGE');
  const [damageDescription, setDamageDescription] = useState('');
  const [damageFee, setDamageFee] = useState(0);
  const [beforeVsAfterNotes, setBeforeVsAfterNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !rental) return null;

  const evidence = rental.evidence || {};
  const beforeList = evidence.beforeRental || [];
  const returnList = evidence.customerReturn || [];
  const deliveryList = evidence.deliveryPartnerReturn || [];

  const beforeImg = beforeList.find(b => b.angle === selectedAngle) || beforeList[0];
  const afterImg = returnList.find(r => r.angle === selectedAngle) || returnList[0] || deliveryList[0];

  const knownAngles = ['FRONT', 'BACK', 'SIDE', 'LEFT', 'RIGHT', 'CLOSEUP', 'TAG'];
  const evidenceAngles = Array.from(
    new Set([...beforeList, ...returnList, ...deliveryList].map(item => item.angle).filter(Boolean))
  );
  const orderedAngles = [
    ...knownAngles.filter(angle => evidenceAngles.includes(angle)),
    ...evidenceAngles.filter(angle => !knownAngles.includes(angle))
  ];

  const securityDeposit = rental.pricing?.securityDeposit || 30000;
  const lateFee = rental.pricing?.lateFee || 0;
  const lateDays = rental.pricing?.lateDays || 0;
  const damageFeeNum = Math.max(0, Number(damageFee) || 0);

  const totalDeductions = lateFee + damageFeeNum;
  const finalRefund = Math.max(0, securityDeposit - totalDeductions);

  const handleSubmit = async () => {
    if (condition !== 'NO_DAMAGE' && damageFeeNum <= 0) {
      setError('Please enter a damage fee or select No Damage.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const { data } = await api.post(`/inspections/${rental._id}`, {
        condition,
        damageDescription,
        damageFee: damageFeeNum,
        beforeVsAfterNotes: beforeVsAfterNotes || `Inspected ${selectedAngle} view. ${condition.replace('_', ' ')}.`
      });

      if (data.success) {
        onSuccess && onSuccess(data.rental);
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Inspection finalization failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto font-sans">
      <div className="bg-white rounded-3xl max-w-5xl w-full overflow-hidden shadow-2xl border border-[#E8E3D9] flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-[#0F0F11] text-white px-6 py-4 flex justify-between items-center border-b border-[#24242A]">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-white/5 text-[#C8A26A] flex items-center justify-center border border-[#C8A26A]/40">
              <Split className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif font-normal text-lg tracking-wide text-[#E8DBC3]">
                Visual Inspection Studio: #{rental.rentalNumber}
              </h3>
              <span className="text-[11px] text-gray-400 font-light">
                Garment: <strong className="text-white font-medium">{rental.product?.title}</strong> • Customer: <strong className="text-white font-medium">{rental.customer?.name}</strong>
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-[10px] uppercase tracking-wider bg-white/10 text-[#E8DBC3] border border-white/15 px-3 py-1 rounded-full font-bold">
              {rental.status}
            </span>
            <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full transition">
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl text-xs flex items-center">
              <AlertTriangle className="w-4 h-4 mr-2 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Angle Filter Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-[#FAF8F5] p-3 rounded-2xl border border-[#E8E3D9]">
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-bold text-[#7A5C2D] uppercase tracking-[0.2em]">
                Comparison Angle:
              </span>
              {orderedAngles.map(angle => (
                <button
                  key={angle}
                  onClick={() => setSelectedAngle(angle)}
                  className={`text-[11px] px-3.5 py-1 rounded-full font-semibold transition ${
                    selectedAngle === angle
                      ? 'bg-[#0F0F11] text-white shadow-sm'
                      : 'bg-white text-gray-600 hover:bg-gray-100 border border-[#E8E3D9]'
                  }`}
                >
                  {angle}
                </button>
              ))}
            </div>

            <div className="text-[10px] uppercase tracking-widest text-gray-400 font-mono">
              Cloudinary Side-by-Side Engine
            </div>
          </div>

          {/* Side-by-Side Visual Comparison Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* BEFORE RENTAL CARD */}
            <div className="bg-[#FAF8F5] rounded-3xl p-5 border border-[#E8E3D9] flex flex-col space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest flex items-center">
                  <ShieldCheck className="w-4 h-4 mr-1 text-emerald-600" />
                  BEFORE RENTAL (DISPATCH PROOF)
                </span>
                <span className="text-[9px] bg-emerald-100 text-emerald-900 font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                  {beforeImg ? beforeImg.angle : 'FRONT'}
                </span>
              </div>

              <div className="relative aspect-[3/4] bg-white rounded-2xl overflow-hidden border border-[#E8E3D9] shadow-inner flex items-center justify-center">
                {beforeImg ? (
                  <img
                    src={getInspectionImageUrl(beforeImg.secureUrl)}
                    alt="Before Rental"
                    className="w-full h-full object-cover object-top hover:scale-125 transition duration-500 cursor-zoom-in"
                  />
                ) : (
                  <span className="text-xs text-gray-400 font-light">No before-dispatch photo logged</span>
                )}
                <div className="absolute bottom-2 left-2 bg-[#0F0F11]/80 text-white text-[9px] px-2.5 py-1 rounded-md backdrop-blur-sm font-light">
                  {beforeImg?.caption || 'Verified pristine before dispatch'}
                </div>
              </div>

              {beforeList.length > 0 && (
                <div>
                  <span className="text-[9px] font-bold text-[#7A5C2D] uppercase tracking-[0.16em]">
                    Cloudinary dispatch set · {beforeList.length} guided angles
                  </span>
                  <div className="mt-1.5 grid grid-cols-5 gap-1.5">
                    {beforeList.map(image => (
                      <button
                        type="button"
                        key={image.angle}
                        onClick={() => setSelectedAngle(image.angle)}
                        className={`overflow-hidden rounded-lg border-2 bg-white transition ${
                          selectedAngle === image.angle
                            ? 'border-emerald-600 shadow-sm'
                            : 'border-transparent opacity-70 hover:opacity-100'
                        }`}
                        aria-label={`Compare ${image.angle} dispatch proof`}
                      >
                        <img
                          src={getInspectionImageUrl(image.secureUrl)}
                          alt={`Before rental ${image.angle}`}
                          className="h-14 w-full object-cover object-top"
                        />
                        <span className="block bg-white px-0.5 py-0.5 text-[8px] font-bold uppercase tracking-wider text-gray-600">
                          {image.angle}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="text-[11px] text-gray-500 font-light">
                Logged by: <strong className="text-gray-900 font-medium">Operations Admin</strong> • Condition: <strong className="text-emerald-700 font-medium">EXCELLENT</strong>
              </div>
            </div>

            {/* AFTER RETURN CARD */}
            <div className="bg-[#FAF8F5] rounded-3xl p-5 border border-[#E8E3D9] flex flex-col space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-[#B91C1C] uppercase tracking-widest flex items-center">
                  <AlertTriangle className="w-4 h-4 mr-1 text-[#B91C1C]" />
                  AFTER RETURN (INSPECTION PROOF)
                </span>
                <span className="text-[9px] bg-rose-100 text-rose-900 font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                  {afterImg ? afterImg.angle : 'RETURN'}
                </span>
              </div>

              <div className="relative aspect-[3/4] bg-white rounded-2xl overflow-hidden border border-[#E8E3D9] shadow-inner flex items-center justify-center">
                {afterImg ? (
                  <img
                    src={getInspectionImageUrl(afterImg.secureUrl)}
                    alt="After Return"
                    className="w-full h-full object-cover object-top hover:scale-125 transition duration-500 cursor-zoom-in"
                  />
                ) : (
                  <span className="text-xs text-gray-400 font-light">No return photo logged</span>
                )}
                <div className="absolute bottom-2 left-2 bg-[#0F0F11]/80 text-white text-[9px] px-2.5 py-1 rounded-md backdrop-blur-sm font-light">
                  {afterImg?.caption || 'Customer/Delivery return condition'}
                </div>
              </div>

              <div className="text-[11px] text-gray-500 font-light">
                Uploaded by: <strong className="text-gray-900 font-medium">{afterImg?.uploadedByRole || 'Customer / Delivery'}</strong>
              </div>
            </div>
          </div>

          {/* Condition Evaluation Form */}
          <div className="bg-[#FAF8F5] rounded-3xl p-6 border border-[#E8E3D9] space-y-5">
            <h4 className="font-serif text-lg font-normal text-[#0F0F11]">
              Damage Grading & Penalty Assessment
            </h4>

            {/* Radio Condition Selector */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <label
                onClick={() => {
                  setCondition('NO_DAMAGE');
                  setDamageFee(0);
                  setDamageDescription('No visible wear or damage.');
                }}
                className={`p-4 rounded-2xl border cursor-pointer text-center transition ${
                  condition === 'NO_DAMAGE'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-950 font-bold ring-2 ring-emerald-400'
                    : 'border-[#E8E3D9] bg-white hover:bg-gray-50 text-gray-700'
                }`}
              >
                <CheckCircle2 className="w-5 h-5 mx-auto mb-1 text-emerald-600" />
                <span className="text-xs block font-bold">No Damage</span>
                <span className="text-[10px] text-gray-500 font-light">Full 100% deposit refund</span>
              </label>

              <label
                onClick={() => {
                  setCondition('MINOR_DAMAGE');
                  setDamageFee(500);
                  setDamageDescription('Minor removable spot / hemline scuff requiring special cleaning.');
                }}
                className={`p-4 rounded-2xl border cursor-pointer text-center transition ${
                  condition === 'MINOR_DAMAGE'
                    ? 'border-amber-500 bg-amber-50 text-amber-950 font-bold ring-2 ring-amber-400'
                    : 'border-[#E8E3D9] bg-white hover:bg-gray-50 text-gray-700'
                }`}
              >
                <AlertTriangle className="w-5 h-5 mx-auto mb-1 text-amber-600" />
                <span className="text-xs block font-bold">Minor Damage</span>
                <span className="text-[10px] text-gray-500 font-light">Dry clean / minor stitching</span>
              </label>

              <label
                onClick={() => {
                  setCondition('MAJOR_DAMAGE');
                  setDamageFee(2500);
                  setDamageDescription('Fabric tear, zipper replacement, or permanent marking.');
                }}
                className={`p-4 rounded-2xl border cursor-pointer text-center transition ${
                  condition === 'MAJOR_DAMAGE'
                    ? 'border-rose-500 bg-rose-50 text-rose-950 font-bold ring-2 ring-rose-400'
                    : 'border-[#E8E3D9] bg-white hover:bg-gray-50 text-gray-700'
                }`}
              >
                <ShieldCheck className="w-5 h-5 mx-auto mb-1 text-rose-600" />
                <span className="text-xs block font-bold">Major Damage</span>
                <span className="text-[10px] text-gray-500 font-light">Severe restoration penalty</span>
              </label>
            </div>

            {/* Description & Fee */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="text-[10px] font-bold text-gray-600 uppercase tracking-wider block mb-1">
                  Damage Description & Assessment Notes
                </label>
                <input
                  type="text"
                  value={damageDescription}
                  onChange={(e) => setDamageDescription(e.target.value)}
                  placeholder="E.g., Small mark near right hemline..."
                  className="w-full text-xs p-2.5 bg-white border border-[#E8E3D9] rounded-xl focus:border-[#C8A26A] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-600 uppercase tracking-wider block mb-1">
                  Damage Fee (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  value={damageFee}
                  onChange={(e) => setDamageFee(e.target.value)}
                  disabled={condition === 'NO_DAMAGE'}
                  className="w-full text-xs p-2.5 bg-white border border-[#E8E3D9] rounded-xl focus:border-[#C8A26A] focus:outline-none font-bold text-rose-600"
                />
              </div>
            </div>

            {/* Financial Ledger Widget */}
            <div className="bg-white rounded-2xl p-5 border border-[#E8E3D9] space-y-3">
              <h5 className="font-serif text-sm font-medium text-[#0F0F11] flex items-center">
                <DollarSign className="w-4 h-4 text-[#C8A26A] mr-1" />
                Security Deposit Settlement Ledger
              </h5>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#E8E3D9]">
                  <span className="text-gray-400 block text-[10px] uppercase tracking-wider">Original Deposit</span>
                  <span className="font-serif text-lg font-bold text-[#0F0F11]">₹{securityDeposit.toLocaleString()}</span>
                </div>

                <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#E8E3D9]">
                  <span className="text-gray-400 block text-[10px] uppercase tracking-wider">Late Fee ({lateDays}d)</span>
                  <span className="font-serif text-lg font-bold text-amber-700">- ₹{lateFee.toLocaleString()}</span>
                </div>

                <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#E8E3D9]">
                  <span className="text-gray-400 block text-[10px] uppercase tracking-wider">Damage Penalty</span>
                  <span className="font-serif text-lg font-bold text-rose-700">- ₹{damageFeeNum.toLocaleString()}</span>
                </div>

                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                  <span className="text-emerald-800 font-bold block text-[10px] uppercase tracking-wider">Final Refund</span>
                  <span className="font-serif text-xl font-bold text-emerald-700">₹{finalRefund.toLocaleString()}</span>
                </div>
              </div>

              <div className="text-[11px] text-gray-600 bg-[#FAF8F5] p-2.5 rounded-xl border border-[#E8E3D9] flex items-center justify-between font-light">
                <span>
                  Customer Destination:{' '}
                  <strong className="text-[#0F0F11] font-medium">{rental.refundPreference === 'APP_WALLET' ? 'App Wallet (Instant Credit)' : 'Original Payment Source Card'}</strong>
                </span>
                <span className="text-emerald-700 font-semibold text-[10px] uppercase tracking-wider">Authorized</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#FAF8F5] px-6 py-4 flex items-center justify-between border-t border-[#E8E3D9]">
          <button
            onClick={onClose}
            disabled={submitting}
            className="px-4 py-2 text-xs text-gray-500 hover:text-black font-semibold uppercase tracking-wider"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="bg-[#0F0F11] text-white hover:bg-[#C8A26A] hover:text-[#0F0F11] px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-[0.18em] transition shadow-md flex items-center space-x-1.5"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                Approving & Settling...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Approve Inspection & Process Refund (₹{finalRefund.toLocaleString()})</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
