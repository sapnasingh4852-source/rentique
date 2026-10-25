import React, { useState } from 'react';
import { ShieldAlert, Upload, X, Loader2, Sparkles, CheckCircle2 } from 'lucide-react';
import api from '../../api/client';

export default function DisputeModal({ penalty, isOpen, onClose, onSuccess }) {
  const [disputeReason, setDisputeReason] = useState('');
  const [evidencePhotos, setEvidencePhotos] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !penalty) return null;

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'fashion_rental/evidence/disputes');

      const { data } = await api.post('/evidence/upload-file', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (data.success && data.asset) {
        setEvidencePhotos(prev => [...prev, data.asset]);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload dispute counter-evidence.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!disputeReason.trim()) {
      setError('Please provide the reason why this damage penalty should be reconsidered.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const { data } = await api.post(`/penalties/${penalty._id}/dispute`, {
        disputeReason,
        counterEvidence: evidencePhotos
      });

      if (data.success) {
        onSuccess && onSuccess(data.penalty);
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit dispute.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-gray-100">
        <div className="bg-plum-deep text-white px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 text-gold" />
            <h3 className="font-serif font-semibold text-base">
              Dispute Damage Penalty (₹{penalty.amount})
            </h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-800 rounded-full transition">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-rose-50 border border-rose-200 p-3 rounded-xl text-xs text-rose-800">
            <strong className="block mb-0.5">Penalty Reason Logged by Admin:</strong>
            <span>{penalty.reason}</span>
          </div>

          {error && (
            <div className="bg-rose-100 text-rose-800 p-2.5 rounded-lg text-xs">
              {error}
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1">
              Why do you dispute this charge? *
            </label>
            <textarea
              rows={3}
              value={disputeReason}
              onChange={(e) => setDisputeReason(e.target.value)}
              placeholder="E.g., The faint mark was already present upon delivery as documented in my receive photos..."
              className="w-full text-xs p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold/50 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1">
              Upload Counter-Evidence to Cloudinary (Optional)
            </label>
            <div className="flex items-center space-x-3">
              <label className="border border-gray-300 hover:border-gold px-4 py-2 rounded-lg text-xs font-medium cursor-pointer transition flex items-center space-x-1 bg-gray-50">
                <Upload className="w-3.5 h-3.5 text-gray-600" />
                <span>Upload Photo / Video</span>
                <input type="file" onChange={handleFileUpload} className="hidden" />
              </label>
              {uploading && <Loader2 className="w-4 h-4 animate-spin text-gold" />}
            </div>

            {evidencePhotos.length > 0 && (
              <div className="mt-2 flex gap-2">
                {evidencePhotos.map((photo, i) => (
                  <div key={i} className="w-12 h-12 rounded border overflow-hidden">
                    <img src={photo.secureUrl} alt="evidence" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-2 flex justify-end space-x-3 border-t border-gray-100">
            <button
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 text-xs text-gray-600 font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting || uploading}
              className="bg-plum-deep text-white hover:bg-gold hover:text-black px-5 py-2.5 rounded-lg text-xs font-semibold transition"
            >
              {submitting ? 'Submitting Dispute...' : 'Submit Dispute for Review'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
