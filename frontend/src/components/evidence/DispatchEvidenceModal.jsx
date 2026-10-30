import React, { useState } from 'react';
import { Camera, CheckCircle2, X, Sparkles, Loader2, ShieldCheck, PackageCheck } from 'lucide-react';
import api from '../../api/client';

const ANGLES = [
  { angle: 'FRONT', label: 'Front View' },
  { angle: 'BACK', label: 'Back View' },
  { angle: 'SIDE', label: 'Side Silhouette' },
  { angle: 'CLOSEUP', label: 'Fabric Close-up' },
  { angle: 'TAG', label: 'Authenticity Tag' }
];

/**
 * Boutique dispatch step: capture the 5-angle before-rental condition set for a
 * BOOKED rental. Successful submission locks the dispatch record and moves the
 * rental to DISPATCH_PREPARED, which releases it to the logistics job board.
 */
export default function DispatchEvidenceModal({ rental, isOpen, onClose, onSuccess }) {
  const initialPhotos = () =>
    ANGLES.map(a => ({ angle: a.angle, label: a.label, uploaded: false, publicId: '', secureUrl: '' }));

  const [dispatchPhotos, setDispatchPhotos] = useState(initialPhotos);
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
      formData.append('folder', 'fashion_rental/evidence/before_rental');
      formData.append('context', `rentalId=${rental._id}|stage=BEFORE_RENTAL|angle=${angle}`);

      const { data } = await api.post('/evidence/upload-file', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (data.success && data.asset) {
        setDispatchPhotos(prev =>
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
    const listing = rental.product?.listingImages || [];
    const viewUrl = (view) => listing.find(image => image.viewType === view)?.secureUrl;
    const front = viewUrl('FRONT');

    if (!front) {
      setError('No Cloudinary listing images are available for this rental.');
      return;
    }

    setDispatchPhotos(prev =>
      prev.map(p => ({
        ...p,
        uploaded: true,
        publicId: `rentique/evidence/before_${p.angle.toLowerCase()}_demo`,
        secureUrl: viewUrl(p.angle) || front
      }))
    );
  };

  const handleSubmit = async () => {
    const uploadedItems = dispatchPhotos.filter(p => p.uploaded);
    if (uploadedItems.length < 2) {
      setError('Capture at least 2 condition angles (Front + one more) before dispatch.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const { data } = await api.post(`/evidence/${rental._id}/before-rental`, {
        media: uploadedItems.map(p => ({
          angle: p.angle,
          publicId: p.publicId,
          secureUrl: p.secureUrl,
          resourceType: 'image'
        })),
        notes: 'Dispatch condition set captured by boutique.'
      });

      if (data.success) {
        onSuccess && onSuccess(data.rental);
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Dispatch evidence submission failed.');
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
              Dispatch Condition Proof — #{rental.rentalNumber}
            </h3>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start space-x-2">
            <ShieldCheck className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
            <p className="text-[11px] text-amber-800">
              Photograph the garment from all angles <strong>before it leaves the boutique</strong>. This
              Cloudinary set is the baseline the inspection studio compares the return against. Once
              submitted, the order is released to the logistics partner.
            </p>
          </div>

          {/* Product summary */}
          <div className="flex items-center space-x-3 pb-3 border-b border-gray-100">
            <img
              src={rental.product?.listingImages?.[0]?.secureUrl}
              alt="product"
              className="w-12 h-16 object-cover rounded-lg border"
            />
            <div>
              <h4 className="font-serif text-sm font-bold text-gray-900">{rental.product?.title}</h4>
              <p className="text-xs text-gray-500">
                Customer: <strong>{rental.customer?.name}</strong> · Size {rental.size} ·{' '}
                {rental.delivery?.city || 'Delivery on file'}
              </p>
            </div>
          </div>

          {/* Demo autofill */}
          <div className="flex justify-end">
            <button
              onClick={handleAutoFillDemoPhotos}
              className="text-[11px] bg-gold/15 text-goldDark hover:bg-gold/25 font-bold px-2.5 py-1 rounded transition flex items-center"
            >
              <Sparkles className="w-3 h-3 mr-1" />
              Demo Auto-Fill From Listing
            </button>
          </div>

          {/* Five guided angles */}
          <div className="space-y-2">
            {dispatchPhotos.map(photo => (
              <div
                key={photo.angle}
                className={`flex items-center justify-between p-2.5 rounded-xl border transition ${
                  photo.uploaded ? 'border-emerald-200 bg-emerald-50' : 'border-gray-200 bg-white'
                }`}
              >
                <div className="flex items-center space-x-2">
                  {photo.uploaded ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Camera className="w-4 h-4 text-gray-400" />
                  )}
                  <span className="text-xs font-semibold text-gray-800">{photo.label}</span>
                </div>

                {photo.uploaded ? (
                  <div className="flex items-center space-x-2">
                    <img src={photo.secureUrl} alt={photo.angle} className="w-8 h-10 object-cover rounded border" />
                    <span className="text-[10px] font-bold text-emerald-700 uppercase">Cloudinary ✓</span>
                  </div>
                ) : (
                  <label className="text-[11px] bg-plum-deep text-white hover:bg-gold hover:text-black font-bold px-3 py-1.5 rounded-lg cursor-pointer transition flex items-center">
                    {uploadingAngle === photo.angle ? (
                      <Loader2 className="w-3 h-3 animate-spin mr-1" />
                    ) : (
                      <UploadIcon />
                    )}
                    Upload
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleAngleUpload(e, photo.angle)}
                    />
                  </label>
                )}
              </div>
            ))}
          </div>

          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-xl p-3 text-xs flex items-start space-x-2">
              <AlertIcon />
              <span>{error}</span>
            </div>
          )}

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={submitting || uploadingAngle}
            className="w-full bg-plum-deep text-white hover:bg-gold hover:text-black py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition shadow-md flex items-center justify-center space-x-2 disabled:opacity-60"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                Locking Dispatch Record...
              </>
            ) : (
              <>
                <PackageCheck className="w-4 h-4" />
                Lock Dispatch & Release to Logistics
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function UploadIcon() {
  return (
    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M12 4v12m0-12l-4 4m4-4l4 4" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
    </svg>
  );
}
