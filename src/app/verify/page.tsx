'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
  ShieldCheck, Upload, CheckCircle2, Clock, XCircle, AlertTriangle, Camera,
} from 'lucide-react';

type VerifStatus = 'unverified' | 'pending' | 'approved' | 'rejected';

export default function VerifyPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();

  const [status, setStatus] = useState<VerifStatus>('unverified');
  const [rejectionReason, setRejectionReason] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [cnic, setCnic] = useState('');
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const [selfie, setSelfie] = useState('');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login?redirect=/verify');
      return;
    }
    if (isAuthenticated) fetchStatus();
  }, [authLoading, isAuthenticated, router]);

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/verify');
      if (res.ok) {
        const data = await res.json();
        setStatus(data.status);
        setRejectionReason(data.rejectionReason);
      }
    } finally {
      setLoading(false);
    }
  };

  const readImage = (file: File, setter: (v: string) => void) => {
    if (file.size > 5 * 1024 * 1024) {
      setError(`Image too large (max 5MB): ${file.name}`);
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => setter(reader.result as string);
    reader.readAsDataURL(file);
  };

  const formatCnic = (v: string) => {
    const d = v.replace(/\D/g, '').slice(0, 13);
    if (d.length <= 5) return d;
    if (d.length <= 12) return `${d.slice(0, 5)}-${d.slice(5)}`;
    return `${d.slice(0, 5)}-${d.slice(5, 12)}-${d.slice(12)}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!front || !back || !selfie) {
      setError('Please upload all 3 photos');
      return;
    }
    if (!/^[0-9]{5}-?[0-9]{7}-?[0-9]$/.test(cnic)) {
      setError('CNIC format invalid (e.g. 42101-1234567-1)');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cnicNumber: cnic,
          cnicFrontImage: front,
          cnicBackImage: back,
          selfieWithCnic: selfie,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Submission failed');
      } else {
        setStatus('pending');
      }
    } catch {
      setError('Network error');
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 via-white to-amber-50">
      <div className="bg-gradient-to-r from-[#800020] to-[#e11d48] text-white">
        <div className="container mx-auto px-4 py-10">
          <div className="flex items-center gap-3 mb-2">
            <ShieldCheck size={32} className="text-[#d4a853]" />
            <h1 className="text-3xl md:text-4xl font-bold">Become a Verified Seller</h1>
          </div>
          <p className="text-rose-100 max-w-2xl">
            Apni identity verify karein aur ✅ Verified badge paayein.
            Verified sellers <strong className="text-[#d4a853]">3x faster sales</strong> kartey hain aur premium pricing power milti hai.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10 max-w-3xl">
        {/* Status banner */}
        {status === 'approved' && (
          <div className="mb-6 bg-green-50 border-2 border-green-300 rounded-xl p-5 flex gap-3 items-start">
            <CheckCircle2 className="text-green-600 flex-shrink-0 mt-0.5" size={28} />
            <div>
              <h3 className="font-bold text-green-900 mb-1">✓ You are Verified!</h3>
              <p className="text-sm text-green-800">
                Aapka verified badge ab har listing par show hoga. Ab buyers aap par zyada bharosa karenge.
              </p>
            </div>
          </div>
        )}

        {status === 'pending' && (
          <div className="mb-6 bg-amber-50 border-2 border-amber-300 rounded-xl p-5 flex gap-3 items-start">
            <Clock className="text-amber-700 flex-shrink-0 mt-0.5" size={28} />
            <div>
              <h3 className="font-bold text-amber-900 mb-1">Under Review</h3>
              <p className="text-sm text-amber-800">
                Aapke documents 24-48 hours mein review honge. Approval ki email aapko mil jayegi.
              </p>
            </div>
          </div>
        )}

        {status === 'rejected' && (
          <div className="mb-6 bg-red-50 border-2 border-red-300 rounded-xl p-5 flex gap-3 items-start">
            <XCircle className="text-red-600 flex-shrink-0 mt-0.5" size={28} />
            <div>
              <h3 className="font-bold text-red-900 mb-1">Verification Rejected</h3>
              <p className="text-sm text-red-800 mb-1">{rejectionReason || 'Documents could not be verified.'}</p>
              <p className="text-sm text-red-800">Please re-submit with clear, high-quality photos.</p>
            </div>
          </div>
        )}

        {/* Benefits */}
        {status !== 'approved' && (
          <div className="mb-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="font-bold text-gray-800 mb-4">Why get verified?</h2>
            <ul className="grid md:grid-cols-2 gap-3 text-sm text-gray-700">
              <li className="flex gap-2">
                <CheckCircle2 size={18} className="text-green-600 flex-shrink-0" />
                <span><strong>3x more buyer trust</strong> — badge on every listing</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 size={18} className="text-green-600 flex-shrink-0" />
                <span><strong>Higher prices</strong> — verified sellers earn ~30% more</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 size={18} className="text-green-600 flex-shrink-0" />
                <span><strong>Priority in search</strong> — verified appear first</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 size={18} className="text-green-600 flex-shrink-0" />
                <span><strong>Access to Escrow</strong> — secure payments</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 size={18} className="text-green-600 flex-shrink-0" />
                <span><strong>Shaadi Sahara</strong> — donate to verified brides</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 size={18} className="text-green-600 flex-shrink-0" />
                <span><strong>Free</strong> — 24-48 hour approval</span>
              </li>
            </ul>
          </div>
        )}

        {/* Form */}
        {(status === 'unverified' || status === 'rejected') && (
          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-6 md:p-8 space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Submit Verification Documents</h2>

            {error && (
              <div className="bg-red-50 border-2 border-red-200 rounded-lg p-3 text-red-700 flex gap-2 items-start text-sm">
                <AlertTriangle size={18} className="flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                CNIC Number *
              </label>
              <input
                type="text"
                value={cnic}
                onChange={(e) => setCnic(formatCnic(e.target.value))}
                placeholder="42101-1234567-1"
                maxLength={15}
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-[#800020] focus:outline-none text-lg tracking-wider"
              />
              <p className="text-xs text-gray-500 mt-1">
                13-digit CNIC. Hyphens auto-add ho jayenge.
              </p>
            </div>

            <ImageUploadCard
              title="CNIC Front Side *"
              hint="Original photo, dono sides clear ho. Saaf rakho, koi finger na ho image par."
              value={front}
              onChange={(f) => readImage(f, setFront)}
            />

            <ImageUploadCard
              title="CNIC Back Side *"
              hint="Address wala side. Sab kuch visible ho."
              value={back}
              onChange={(f) => readImage(f, setBack)}
            />

            <ImageUploadCard
              title="Selfie with CNIC *"
              hint="Apna face aur CNIC dono visible ho. Achi roshni mein ek photo lein."
              value={selfie}
              onChange={(f) => readImage(f, setSelfie)}
            />

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-900">
              <strong>🔒 Privacy:</strong> Aapke documents sirf admin team verify karne ke liye dekhegi.
              Yeh kabhi public nahi honge, na hi buyers ko share kiye jayenge.
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-gradient-to-r from-[#800020] to-[#d4a853] text-white rounded-lg font-bold shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed transition-all"
            >
              {submitting ? 'Submitting...' : '🛡️ Submit for Verification'}
            </button>
          </form>
        )}

        {status === 'approved' && (
          <Link
            href="/sell"
            className="block text-center bg-[#800020] text-white py-3 rounded-lg font-bold hover:bg-[#600018] transition-colors"
          >
            Start Selling →
          </Link>
        )}
      </div>
    </div>
  );
}

function ImageUploadCard({
  title, hint, value, onChange,
}: {
  title: string; hint: string; value: string; onChange: (f: File) => void;
}) {
  return (
    <div>
      <label className="block font-semibold text-gray-700 mb-1">{title}</label>
      <p className="text-xs text-gray-500 mb-2">{hint}</p>
      {value ? (
        <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden border-2 border-green-300">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt={title} className="w-full h-full object-contain" />
          <label className="absolute bottom-2 right-2 bg-white border-2 border-gray-200 px-3 py-1.5 rounded text-xs font-semibold cursor-pointer hover:bg-gray-50 shadow flex items-center gap-1">
            <Camera size={14} /> Re-upload
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && onChange(e.target.files[0])}
            />
          </label>
        </div>
      ) : (
        <label className="aspect-video flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-300 hover:border-[#800020] rounded-lg cursor-pointer hover:bg-rose-50 transition-colors text-gray-500">
          <Upload size={28} />
          <span className="text-sm font-semibold">Click to upload</span>
          <span className="text-xs">Max 5MB · JPG, PNG</span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && onChange(e.target.files[0])}
          />
        </label>
      )}
    </div>
  );
}
