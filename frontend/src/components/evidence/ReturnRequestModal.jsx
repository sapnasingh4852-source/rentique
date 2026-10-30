import React, { useState } from 'react';
import { Camera, CheckCircle2, Upload, X, Sparkles, Loader2, ShieldCheck, AlertCircle } from 'lucide-react';
import api from '../../api/client';

export default function ReturnRequestModal({ rental, isOpen, onClose, onSuccess }) {
  const [returnPhotos, setReturnPhotos] = useState([
    { angle: 'FRONT', label: 'Front View', uploaded: false, publicId: '', secureUrl: '' },
    { angle: 'BACK', label: 'Back View', uploaded: false, publicId: '', secureUrl: '' },
    { angle: 'SIDE', label: 'Side Silhouette', uploaded: false, publicId: '', secureUrl: '' },
    { angle: 'CLOSEUP', label: 'Close-up / Hemline', uploaded: false, publicId: '', secureUrl: '' },
    { angle: 'DAMAGE', label: 'Damage (If Any)', uploaded: false, publicId: '', secureUrl: '' }
  ]);
  const [notes, setNotes] = useState('');
  const [uploadingAngle, setUploadingAngle] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !rental) return null;

  const handleAngleUpload = async (e, angle) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingAngle(angle);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'fashion_rental/evidence/customer_return');
      formData.append('context', `rentalId=${rental._id}|stage=CUSTOMER_RETURN|angle=${angle}`);

      const { data } = await api.post('/evidence/upload-file', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (data.success && data.asset) {
        setReturnPhotos(prev =>
          prev.map(p =>
            p.angle === angle
              ? { ...p, uploaded: true, publicId: data.asset.publicId, secureUrl: data.asset.secureUrl }
              : p
          )
        );
      }
    } catch (err) {
      setError(err.response?.data?.message || `Failed to upload ${angle} photo.`);
    } finally {
      setUploadingAngle(null);
    }
  };

  const handleAutoFillDemoPhotos = () => {
    // One-click filler using the rental's own Cloudinary listing set
    const listing = rental.product?.listingImages || [];
    const viewUrl = (view) => listing.find(image => image.viewType === view)?.secureUrl;
    const front = viewUrl('FRONT');
    const sampleUrls = {
      FRONT: front,
      BACK: viewUrl('BACK') || front,
      SIDE: viewUrl('SIDE') || front,
      CLOSEUP: viewUrl('CLOSEUP') || front,
      DAMAGE: viewUrl('CLOSEUP') || front
    };

    if (!front) {
      setError('No Cloudinary listing images are available for this rental.');
      return;
    }

    setReturnPhotos(prev =>
      prev.map(p => ({
        ...p,
        uploaded: true,
        publicId: `rentique/evidence/return_${p.angle.toLowerCase()}_demo`,
        secureUrl: sampleUrls[p.angle]
      }))
    );
  };

  const handleSubmit = async () => {
    const uploadedItems = returnPhotos.filter(p => p.uploaded);
    if (uploadedItems.length < 2) {
      setError('Please upload at least 2 return verification photos (e.g., Front & Back).');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const payload = {
        returnPhotos: uploadedItems.map(p => ({
          angle: p.angle,
          publicId: p.publicId,
          secureUrl: p.secureUrl
        })),
        notes
      };

      const { data } = await api.post(`/evidence/${rental._id}/customer-return`, payload);

      if (data.success) {
        onSuccess && onSuccess(data.rental);
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Return request submission failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full overflow-hidden shadow-2xl border border-gray-100 my-8">
        {/* Header */}
        <div className="bg-plum-deep text-white px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Camera className="w-4 h-4 text-gold" />
            <h3 className="font-serif font-semibold text-base tracking-wide">
              Return Verification & Pickup Request
            </h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-800 rounded-full transition">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs text-gray-500 font-mono">Rental: #{rental.rentalNumber}</span>
              <h4 className="text-base font-bold text-gray-900 mt-0.5">
                Capture Return Photos Before Pickup
              </h4>
              <p className="text-xs text-gray-500">
                Upload clear condition evidence to Cloudinary to guarantee your deposit refund.
              </p>
            </div>

            {/* Quick Demo button */}
            <button
              onClick={handleAutoFillDemoPhotos}
              className="text-[11px] bg-gold/15 text-goldDark hover:bg-gold/25 font-semibold px-2.5 py-1 rounded-md transition flex items-center"
            >
              <Sparkles className="w-3 h-3 mr-1" />
              Auto-Fill Sample Evidence
            </button>
          </div>

          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 p-2.5 rounded-lg text-xs flex items-center">
              <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Photo Angle Slots Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {returnPhotos.map((photo) => {
              const isUploadingThis = uploadingAngle === photo.angle;

              return (
                <div
                  key={photo.angle}
                  className={`relative rounded-xl border-2 border-dashed p-3 text-center transition flex flex-col justify-between h-36 ${
                    photo.uploaded
                      ? 'border-emerald-500 bg-emerald-50/40'
                      : 'border-gray-200 hover:border-gold bg-gray-50'
                  }`}
                >
                  {photo.uploaded ? (
                    <div className="relative h-20 rounded-lg overflow-hidden mb-1">
                      <img
                        src={photo.secureUrl}
                        alt={photo.label}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-1 right-1 bg-emerald-600 text-white rounded-full p-0.5 shadow">
                        <CheckCircle2 className="w-3 h-3" />
                      </span>
                    </div>
                  ) : (
                    <div className="h-20 flex flex-col items-center justify-center">
                      {isUploadingThis ? (
                        <Loader2 className="w-6 h-6 animate-spin text-gold" />
                      ) : (
                        <Camera className="w-6 h-6 text-gray-400 mb-1" />
                      )}
                      <span className="text-[10px] text-gray-400">
                        {isUploadingThis ? 'Uploading...' : 'Tap to take photo'}
                      </span>
                    </div>
                  )}

                  <div>
                    <span className="text-xs font-semibold text-gray-800 block truncate">
                      {photo.label}
                    </span>
                    <label className="mt-1 block">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleAngleUpload(e, photo.angle)}
                        className="hidden"
                      />
                      <span className="text-[10px] text-goldDark font-bold hover:underline cursor-pointer">
                        {photo.uploaded ? 'Retake Photo' : 'Choose File'}
                      </span>
                    </label>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-medium text-gray-700 block mb-1">
              Condition Notes (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="E.g., Packed carefully into garment bag with all hangers and tag."
              className="w-full text-xs p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold/50 focus:outline-none"
            />
          </div>

          {/* Security Deposit Reminder */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 flex items-start space-x-2">
            <ShieldCheck className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-semibold block">30% Security Deposit Protected</span>
              <span>
                Your ₹{rental.pricing?.securityDeposit?.toLocaleString()} deposit will be refunded to your{' '}
                <strong>{rental.refundPreference === 'APP_WALLET' ? 'App Wallet' : 'Original Payment Source'}</strong> after visual inspection.
              </span>
            </div>
          </div>

          {/* Footer Action */}
          <div className="pt-2 flex items-center justify-end space-x-3 border-t border-gray-100">
            <button
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 text-xs text-gray-600 hover:text-gray-900 font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="bg-plum-deep text-white hover:bg-gold hover:text-black px-6 py-2.5 rounded-lg text-xs font-semibold tracking-wider uppercase transition shadow-md flex items-center"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                  Submitting Return...
                </>
              ) : (
                'Request Return Pickup'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
