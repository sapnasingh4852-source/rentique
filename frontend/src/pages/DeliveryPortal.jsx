import React, { useState, useEffect } from 'react';
import { Truck, Camera, CheckCircle2, Upload, MapPin, Phone, ShieldCheck, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function DeliveryPortal() {
  const { user } = useAuth();
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRental, setSelectedRental] = useState(null);
  const [pickupMedia, setPickupMedia] = useState([]);
  const [notes, setNotes] = useState('');
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const fetchDeliveryRentals = async () => {
    try {
      const { data } = await api.get('/delivery/jobs');
      if (data.success) {
        setRentals(data.rentals || []);
      }
    } catch (err) {
      console.error('Failed to load logistics tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveryRentals();
  }, []);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'fashion_rental/evidence/delivery_pickup');
      if (selectedRental) {
        formData.append('context', `rentalId=${selectedRental._id}|stage=DELIVERY_PICKUP`);
      }

      const { data } = await api.post('/evidence/upload-file', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (data.success && data.asset) {
        setPickupMedia(prev => [...prev, data.asset]);
      }
    } catch (err) {
      alert('Upload failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setUploading(false);
    }
  };

  const handleAutoFillDemoEvidence = () => {
    const frontImage = selectedRental?.product?.listingImages?.find(
      image => image.viewType === 'FRONT'
    );
    if (!frontImage?.secureUrl) {
      alert('No Cloudinary listing image available for this rental.');
      return;
    }
    setPickupMedia([
      {
        angle: 'FRONT',
        publicId: frontImage.publicId,
        secureUrl: frontImage.secureUrl,
        resourceType: 'image'
      }
    ]);
    setNotes('Collected from customer. Handover garment bag verified intact.');
  };

  const handleSubmitPickup = async () => {
    if (!selectedRental) return;
    if (pickupMedia.length === 0) {
      alert('Please take or upload at least one pickup condition photo.');
      return;
    }

    setSubmitting(true);
    try {
      const { data } = await api.post(`/evidence/${selectedRental._id}/delivery-pickup`, {
        media: pickupMedia,
        notes: notes || 'Product collected in good sealed bag.'
      });

      if (data.success) {
        setSuccessMsg(`Pickup evidence for Rental #${selectedRental.rentalNumber} recorded to Cloudinary! Item queued for hub inspection.`);
        setSelectedRental(null);
        setPickupMedia([]);
        setNotes('');
        fetchDeliveryRentals();
      }
    } catch (err) {
      alert('Failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const outboundTasks = rentals.filter(r => ['DISPATCH_PREPARED', 'OUT_FOR_DELIVERY'].includes(r.status));
  const pickupTasks = rentals.filter(r => r.status === 'RETURN_REQUESTED');

  const handleDeliveryTransition = async (rental, nextStatus) => {
    setSubmitting(true);
    try {
      const { data } = await api.put(`/delivery/${rental._id}/delivery-status`, { status: nextStatus });
      if (data.success) {
        setSuccessMsg(data.message);
        setSelectedRental(null);
        setPickupMedia([]);
        setNotes('');
        fetchDeliveryRentals();
      }
    } catch (err) {
      alert('Failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="bg-plum-deep text-white p-6 sm:p-8 rounded-3xl border border-gray-800 shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center space-x-2 text-gold text-xs font-semibold mb-1">
            <Truck className="w-4 h-4" />
            <span>EXPRESS LOGISTICS PARTNER APP</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold">
            Delivery & Return Pickup Portal
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Active Driver: <strong>{user?.name}</strong> • Route: Bengaluru Urban Hub #4
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/10 text-xs">
          <span className="text-gray-300 block">Open Jobs:</span>
          <span className="text-xl font-bold text-gold">{outboundTasks.length + pickupTasks.length} Assigned</span>
        </div>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg('')} className="text-emerald-900 font-bold hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Task List & Pickup Station */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Task Cards */}
        <div className="lg:col-span-6 space-y-4">
          <h3 className="font-serif text-lg font-bold text-gray-900">
            Assigned Pickups & Dispatches
          </h3>

          {loading ? (
            <div className="p-8 text-center text-xs text-gray-400">Loading assignments...</div>
          ) : outboundTasks.length + pickupTasks.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl border border-gray-100 text-center text-xs text-gray-500">
              No delivery or pickup jobs assigned right now.
            </div>
          ) : (
            [...outboundTasks, ...pickupTasks].map(rental => {
              const isOutbound = ['DISPATCH_PREPARED', 'OUT_FOR_DELIVERY'].includes(rental.status);
              const badgeClass =
                rental.status === 'RETURN_REQUESTED'
                  ? 'bg-amber-100 text-amber-800'
                  : rental.status === 'OUT_FOR_DELIVERY'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-purple-100 text-purple-800';

              return (
              <div
                key={rental._id}
                onClick={() => {
                  setSelectedRental(rental);
                  setPickupMedia([]);
                  setSuccessMsg('');
                }}
                className={`bg-white p-5 rounded-2xl border cursor-pointer transition shadow-sm space-y-3 ${
                  selectedRental?._id === rental._id
                    ? 'border-gold ring-2 ring-gold/30 shadow-md'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex justify-between items-center text-xs">
                  <span className="font-mono font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded">
                    #{rental.rentalNumber}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${badgeClass}`}>
                    {isOutbound ? 'DELIVERY' : 'PICKUP'} · {rental.status}
                  </span>
                </div>

                <div className="flex items-center space-x-3">
                  <img
                    src={rental.product?.listingImages?.[0]?.secureUrl}
                    alt="product"
                    className="w-12 h-16 object-cover rounded-lg border"
                  />
                  <div>
                    <h4 className="font-serif text-sm font-bold text-gray-900">{rental.product?.title}</h4>
                    <p className="text-xs text-gray-500">Customer: <strong>{rental.customer?.name}</strong></p>
                    <div className="flex items-center text-[11px] text-gray-500 mt-1">
                      <MapPin className="w-3 h-3 mr-1 text-gray-400" />
                      <span>
                        {rental.delivery
                          ? `${rental.delivery.addressLine1}, ${rental.delivery.city} — ${rental.delivery.pincode}`
                          : `${rental.customer?.address?.street}, ${rental.customer?.address?.city}`}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-gray-100 text-xs">
                  <span className="text-gray-500">
                    {isOutbound
                      ? rental.status === 'DISPATCH_PREPARED'
                        ? 'Collect from boutique & start delivery'
                        : 'Delivered? Mark it complete'
                      : 'Tap to record pickup evidence'}
                  </span>
                  <span className="text-goldDark font-bold">Select Task →</span>
                </div>
              </div>
              );
            })
          )}
        </div>

        {/* Evidence Submission Panel */}
        <div className="lg:col-span-6">
          {selectedRental && ['DISPATCH_PREPARED', 'OUT_FOR_DELIVERY'].includes(selectedRental.status) ? (
            /* Outbound delivery panel */
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-5">
              <div className="flex justify-between items-start pb-3 border-b border-gray-100">
                <div>
                  <span className="text-xs text-gray-400 font-mono">Task: #{selectedRental.rentalNumber}</span>
                  <h3 className="font-serif text-lg font-bold text-gray-900">
                    Outbound Delivery — To Customer
                  </h3>
                  <p className="text-xs text-gray-500">
                    Collect the sealed garment bag from the boutique and hand it over to the customer.
                  </p>
                </div>
                <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] ${
                  selectedRental.status === 'OUT_FOR_DELIVERY' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                }`}>
                  {selectedRental.status}
                </span>
              </div>

              {/* Order details */}
              <div className="flex items-start space-x-3">
                <img
                  src={selectedRental.product?.listingImages?.[0]?.secureUrl}
                  alt="product"
                  className="w-14 h-18 object-cover rounded-lg border"
                />
                <div className="text-xs space-y-1">
                  <h4 className="font-serif text-sm font-bold text-gray-900">{selectedRental.product?.title}</h4>
                  <p className="text-gray-600">Size <strong>{selectedRental.size}</strong> · {selectedRental.rentalDurationDays} day(s) rental</p>
                  <p className="text-gray-600">
                    Deliver to: <strong>{selectedRental.delivery?.fullName}</strong> · {selectedRental.delivery?.phone}
                  </p>
                  <p className="text-gray-500">
                    {selectedRental.delivery?.addressLine1}{selectedRental.delivery?.addressLine2 ? `, ${selectedRental.delivery.addressLine2}` : ''}, {selectedRental.delivery?.city}, {selectedRental.delivery?.state} — {selectedRental.delivery?.pincode}
                  </p>
                  {selectedRental.paymentStatus === 'PENDING' && selectedRental.paymentMethod === 'COD' && (
                    <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-lg px-3 py-2 font-semibold">
                      💵 Cash on delivery — collect ₹{selectedRental.pricing?.totalPaidInitial?.toLocaleString('en-IN')} at handover.
                    </div>
                  )}
                </div>
              </div>

              {/* Progress */}
              <div className="flex items-center text-[11px] text-gray-500 space-x-2">
                <span className={selectedRental.status === 'DISPATCH_PREPARED' ? 'font-bold text-purple-700' : 'text-emerald-600 font-bold'}>
                  1. Boutique dispatched
                </span>
                <span>→</span>
                <span className={selectedRental.status === 'OUT_FOR_DELIVERY' ? 'font-bold text-blue-700' : ''}>
                  2. Out for delivery
                </span>
                <span>→</span>
                <span>3. Delivered</span>
              </div>

              <div className="bg-blue-50 border border-blue-200 text-blue-900 p-3 rounded-xl text-xs space-y-1">
                <span className="font-bold flex items-center">
                  <ShieldCheck className="w-4 h-4 mr-1 text-blue-600" />
                  Delivery Partner Protocol
                </span>
                <p className="text-[11px] text-blue-800">
                  Collect from the boutique only after its dispatch proof is locked. Hand the sealed bag to the
                  customer — they verify condition in their dashboard after delivery.
                </p>
              </div>

              <div className="flex space-x-3">
                {selectedRental.status === 'DISPATCH_PREPARED' && (
                  <button
                    onClick={() => handleDeliveryTransition(selectedRental, 'OUT_FOR_DELIVERY')}
                    disabled={submitting}
                    className="flex-1 bg-plum-deep text-white hover:bg-gold hover:text-black py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition shadow-md flex items-center justify-center disabled:opacity-60"
                  >
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : <Truck className="w-4 h-4 mr-1.5" />}
                    Start Delivery
                  </button>
                )}
                {selectedRental.status === 'OUT_FOR_DELIVERY' && (
                  <button
                    onClick={() => handleDeliveryTransition(selectedRental, 'DELIVERED')}
                    disabled={submitting}
                    className="flex-1 bg-emerald-600 text-white hover:bg-emerald-700 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition shadow-md flex items-center justify-center disabled:opacity-60"
                  >
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : <CheckCircle2 className="w-4 h-4 mr-1.5" />}
                    Mark Delivered
                  </button>
                )}
              </div>
            </div>
          ) : selectedRental ? (
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-5">
              <div className="flex justify-between items-start pb-3 border-b border-gray-100">
                <div>
                  <span className="text-xs text-gray-400 font-mono">Task: #{selectedRental.rentalNumber}</span>
                  <h3 className="font-serif text-lg font-bold text-gray-900">
                    Submit Pickup Condition Evidence
                  </h3>
                  <p className="text-xs text-gray-500">
                    Upload photos/videos to Cloudinary upon collecting garment from customer.
                  </p>
                </div>

                <button
                  onClick={handleAutoFillDemoEvidence}
                  className="text-[11px] bg-gold/15 text-goldDark hover:bg-gold/25 font-bold px-2.5 py-1 rounded transition flex items-center"
                >
                  <Sparkles className="w-3 h-3 mr-1" />
                  Demo Auto-Fill
                </button>
              </div>

              {/* Upload Dropzone */}
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  Take or Upload Return Condition Photos *
                </label>
                <label className="border-2 border-dashed border-gray-300 hover:border-gold rounded-xl p-6 text-center cursor-pointer transition block bg-gray-50 hover:bg-white">
                  <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <span className="text-xs font-bold text-gray-800 block">Take Photo / Upload Video</span>
                  <span className="text-[10px] text-gray-500 block mt-0.5">Captures high-res proof directly to Cloudinary</span>
                  <input
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>

                {uploading && (
                  <div className="flex items-center justify-center space-x-2 text-xs text-goldDark font-semibold py-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Streaming asset to Cloudinary...</span>
                  </div>
                )}

                {/* Previews */}
                {pickupMedia.length > 0 && (
                  <div className="mt-3 flex gap-2">
                    {pickupMedia.map((m, idx) => (
                      <div key={idx} className="relative w-16 h-20 rounded-lg overflow-hidden border">
                        <img src={m.secureUrl} alt="pickup" className="w-full h-full object-cover" />
                        <span className="absolute bottom-0 inset-x-0 bg-black/70 text-[8px] text-white text-center">
                          Cloudinary
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Notes */}
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  Handover Condition Notes
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="E.g., Garment collected in protective zipper sleeve. Customer verified return."
                  className="w-full text-xs p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold/50 focus:outline-none"
                />
              </div>

              {/* Important Rule Notice (From prompt section 6) */}
              <div className="bg-blue-50 border border-blue-200 text-blue-900 p-3 rounded-xl text-xs space-y-1">
                <span className="font-bold flex items-center">
                  <ShieldCheck className="w-4 h-4 mr-1 text-blue-600" />
                  Delivery Partner Protocol
                </span>
                <p className="text-[11px] text-blue-800">
                  Delivery partners do NOT charge damage penalties. Your uploaded evidence is transferred to the Admin Visual Inspection Hub for final deposit refund clearance.
                </p>
              </div>

              <button
                onClick={handleSubmitPickup}
                disabled={submitting || uploading}
                className="w-full bg-plum-deep text-white hover:bg-gold hover:text-black py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition shadow-md flex items-center justify-center space-x-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                    Submitting Evidence...
                  </>
                ) : (
                  'Complete Collection & Send to Inspection Hub'
                )}
              </button>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 p-12 text-center text-xs text-gray-500">
              <Camera className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <span>Select an assigned rental task on the left to capture and upload return condition proof.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
