import React, { useState } from 'react';
import { CheckCircle2, AlertTriangle, Upload, Video, Image as ImageIcon, X, ShieldAlert, Sparkles, Loader2 } from 'lucide-react';
import api from '../../api/client';

export default function ReceiveVerificationModal({ rental, isOpen, onClose, onSuccess }) {
  const [conditionStatus, setConditionStatus] = useState('RECEIVED_CORRECTLY');
  const [issueDescription, setIssueDescription] = useState('');
  const [images, setImages] = useState([]);
  const [videos, setVideos] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !rental) return null;

  const handleFileUpload = async (e, type = 'image') => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    setError('');

    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', 'fashion_rental/evidence/customer_receive');
        formData.append('context', `rentalId=${rental._id}|stage=CUSTOMER_RECEIVE|kind=${type}`);

        // Post to backend upload endpoint which streams to Cloudinary
        const { data } = await api.post('/evidence/upload-file', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });

        if (data.success && data.asset) {
          if (type === 'video' || data.asset.resourceType === 'video') {
            setVideos(prev => [...prev, data.asset]);
          } else {
            setImages(prev => [...prev, data.asset]);
          }
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'File upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    const isIssue = conditionStatus !== 'RECEIVED_CORRECTLY';
    if (isIssue && !issueDescription.trim()) {
      setError('Please provide a brief description of the issue.');
      return;
    }
    if (isIssue && images.length === 0 && videos.length === 0) {
      setError('Please upload at least one Cloudinary photo or video showing the defect/damage.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const { data } = await api.post(`/evidence/${rental._id}/customer-receive`, {
        conditionStatus,
        issueDescription,
        images,
        videos
      });

      if (data.success) {
        onSuccess && onSuccess(data.rental);
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  const options = [
    { id: 'RECEIVED_CORRECTLY', label: '✓ Received correctly', desc: 'Item is pristine and matches description perfectly.', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
    { id: 'DAMAGED', label: '⚠ Product damaged', desc: 'Stain, tear, rip, or broken seam noticed upon arrival.', color: 'text-rose-700 bg-rose-50 border-rose-200' },
    { id: 'DEFECTIVE', label: '⚠ Product defective', desc: 'Broken zipper, missing button, or hardware failure.', color: 'text-amber-700 bg-amber-50 border-amber-200' },
    { id: 'WRONG_PRODUCT', label: '⚠ Wrong product', desc: 'Different size, color, or item arrived.', color: 'text-blue-700 bg-blue-50 border-blue-200' },
    { id: 'MISSING_ACCESSORY', label: '⚠ Missing accessory', desc: 'Missing belt, brooch, dust bag, or dupatta.', color: 'text-purple-700 bg-purple-50 border-purple-200' }
  ];

  const isIssueSelected = conditionStatus !== 'RECEIVED_CORRECTLY';

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full overflow-hidden shadow-2xl border border-gray-100 my-8">
        {/* Header */}
        <div className="bg-plum-deep text-white px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-gold" />
            <h3 className="font-serif font-semibold text-base tracking-wide">
              Customer Receive Verification
            </h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-800 rounded-full transition">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          <div>
            <span className="text-xs text-gray-500 font-mono">
              Rental: #{rental.rentalNumber} • {rental.product?.title || 'Garment'}
            </span>
            <h4 className="text-lg font-bold text-gray-900 mt-1">
              Did you receive the product in good condition?
            </h4>
            <p className="text-xs text-gray-500 mt-0.5">
              Please verify condition right after delivery to safeguard your 30% refundable security deposit.
            </p>
          </div>

          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 px-3.5 py-2.5 rounded-lg text-xs flex items-center">
              <ShieldAlert className="w-4 h-4 mr-2 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Condition Options */}
          <div className="space-y-2">
            {options.map((opt) => (
              <label
                key={opt.id}
                className={`flex items-start p-3 rounded-xl border cursor-pointer transition ${
                  conditionStatus === opt.id
                    ? `${opt.color} ring-2 ring-current font-semibold`
                    : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                }`}
              >
                <input
                  type="radio"
                  name="conditionStatus"
                  value={opt.id}
                  checked={conditionStatus === opt.id}
                  onChange={(e) => setConditionStatus(e.target.value)}
                  className="mt-0.5 mr-3 accent-gold"
                />
                <div>
                  <div className="text-xs font-semibold">{opt.label}</div>
                  <div className="text-[11px] text-gray-500 font-normal">{opt.desc}</div>
                </div>
              </label>
            ))}
          </div>

          {/* Upload Proof Area (if issue reported) */}
          {isIssueSelected && (
            <div className="bg-amber-50/60 border border-amber-200 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-900 flex items-center">
                  <AlertTriangle className="w-3.5 h-3.5 mr-1 text-amber-600" />
                  7-Day Defective Policy: Cloudinary Evidence Required
                </span>
                <span className="text-[10px] text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                  Photos & Videos
                </span>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-700 block mb-1">
                  Issue Description *
                </label>
                <textarea
                  rows={2}
                  value={issueDescription}
                  onChange={(e) => setIssueDescription(e.target.value)}
                  placeholder="E.g., Zipper gets stuck halfway, or light stain near right pocket..."
                  className="w-full text-xs p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold/50 focus:outline-none"
                />
              </div>

              {/* Upload buttons */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <label className="border-2 border-dashed border-gray-300 hover:border-gold rounded-lg p-3 text-center cursor-pointer transition bg-white block">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleFileUpload(e, 'image')}
                    className="hidden"
                  />
                  <ImageIcon className="w-5 h-5 mx-auto text-gray-400 mb-1" />
                  <span className="text-[11px] font-semibold text-gray-700 block">Upload Photos</span>
                  <span className="text-[9px] text-gray-400">JPEG, PNG, WebP</span>
                </label>

                <label className="border-2 border-dashed border-gray-300 hover:border-gold rounded-lg p-3 text-center cursor-pointer transition bg-white block">
                  <input
                    type="file"
                    accept="video/*"
                    onChange={(e) => handleFileUpload(e, 'video')}
                    className="hidden"
                  />
                  <Video className="w-5 h-5 mx-auto text-gray-400 mb-1" />
                  <span className="text-[11px] font-semibold text-gray-700 block">Upload Video</span>
                  <span className="text-[9px] text-gray-400">MP4, WebM (e.g. zip test)</span>
                </label>
              </div>

              {uploading && (
                <div className="flex items-center justify-center space-x-2 text-xs text-goldDark py-1 font-medium">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Uploading to Cloudinary CDN...</span>
                </div>
              )}

              {/* Uploaded Evidence Previews */}
              {(images.length > 0 || videos.length > 0) && (
                <div className="pt-2">
                  <span className="text-[11px] font-semibold text-gray-600 block mb-1">
                    Uploaded Cloudinary Assets:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {images.map((img, i) => (
                      <div key={i} className="relative w-14 h-14 rounded-md overflow-hidden border border-gray-200">
                        <img src={img.secureUrl} alt="defect" className="w-full h-full object-cover" />
                        <span className="absolute bottom-0 inset-x-0 bg-black/70 text-[8px] text-white text-center">Photo</span>
                      </div>
                    ))}
                    {videos.map((vid, i) => (
                      <div key={i} className="relative w-14 h-14 rounded-md overflow-hidden border border-gray-200 bg-black flex items-center justify-center">
                        <Video className="w-5 h-5 text-gold" />
                        <span className="absolute bottom-0 inset-x-0 bg-black/70 text-[8px] text-white text-center">Video</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action Footer */}
          <div className="pt-2 flex items-center justify-end space-x-3 border-t border-gray-100">
            <button
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 text-xs text-gray-600 hover:text-gray-900 font-medium transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting || uploading}
              className="bg-plum-deep text-white hover:bg-gold hover:text-black px-6 py-2.5 rounded-lg text-xs font-semibold tracking-wider uppercase transition shadow-md flex items-center"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                  Submitting...
                </>
              ) : (
                'Confirm Verification'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
