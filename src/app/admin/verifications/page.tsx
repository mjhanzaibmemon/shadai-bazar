'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ShieldCheck, CheckCircle2, XCircle, Eye } from 'lucide-react';

interface VerificationRequest {
  _id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  verification: {
    cnicNumber?: string;
    cnicFrontImage?: string;
    cnicBackImage?: string;
    selfieWithCnic?: string;
    status: string;
    submittedAt?: string;
  };
}

export default function AdminVerificationsPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [list, setList] = useState<VerificationRequest[]>([]);
  const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [selected, setSelected] = useState<VerificationRequest | null>(null);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      router.push('/');
      return;
    }
    fetchList();
  }, [isAuthenticated, user, filter, router]);

  const fetchList = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/verify?status=${filter}`);
      if (res.ok) {
        const data = await res.json();
        setList(data.users || []);
      }
    } finally {
      setLoading(false);
    }
  };

  const decide = async (userId: string, decision: 'approve' | 'reject') => {
    if (decision === 'reject' && !reason) {
      alert('Please provide a rejection reason');
      return;
    }
    try {
      const res = await fetch('/api/admin/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          decision,
          rejectionReason: decision === 'reject' ? reason : undefined,
        }),
      });
      if (res.ok) {
        setSelected(null);
        setReason('');
        fetchList();
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (!isAuthenticated || user?.role !== 'admin') return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-[#800020] to-[#e11d48] text-white py-8 shadow">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <ShieldCheck size={28} /> Seller Verification Queue
          </h1>
          <p className="text-rose-100 mt-2">Review CNIC documents and approve/reject verification requests</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-2 mb-6">
          {(['pending', 'approved', 'rejected'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                filter === f
                  ? 'bg-[#800020] text-white'
                  : 'bg-white text-gray-700 border border-gray-200 hover:border-[#800020]'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-600">Loading...</div>
        ) : list.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-8 text-center text-gray-600">
            No {filter} verification requests
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">User</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">CNIC</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">Submitted</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {list.map((u) => (
                  <tr key={u._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-gray-800">{u.name}</p>
                      <p className="text-xs text-gray-500">{u.email} · {u.phone}</p>
                    </td>
                    <td className="px-4 py-3 font-mono text-sm">{u.verification.cnicNumber}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {u.verification.submittedAt
                        ? new Date(u.verification.submittedAt).toLocaleDateString()
                        : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setSelected(u)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded text-sm font-semibold hover:bg-blue-100"
                      >
                        <Eye size={14} /> Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Review modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-3xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-800">{selected.name}</h2>
                <p className="text-sm text-gray-500">
                  {selected.email} · {selected.phone} · {selected.city}
                </p>
                <p className="text-sm text-gray-700 mt-1">
                  CNIC: <strong className="font-mono">{selected.verification.cnicNumber}</strong>
                </p>
              </div>
              <button
                onClick={() => { setSelected(null); setReason(''); }}
                className="text-gray-500 hover:text-gray-800 text-2xl leading-none"
              >
                ×
              </button>
            </div>

            <div className="grid sm:grid-cols-3 gap-3 mb-4">
              {[
                ['Front', selected.verification.cnicFrontImage],
                ['Back', selected.verification.cnicBackImage],
                ['Selfie', selected.verification.selfieWithCnic],
              ].map(([label, src]) => (
                <div key={label as string} className="border rounded-lg overflow-hidden">
                  <p className="text-xs font-semibold p-2 bg-gray-50 border-b">{label}</p>
                  {src ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={src as string} alt={label as string} className="w-full aspect-video object-contain" />
                  ) : (
                    <div className="aspect-video flex items-center justify-center text-gray-400 text-sm">No image</div>
                  )}
                </div>
              ))}
            </div>

            {filter === 'pending' && (
              <>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Rejection reason (only required if rejecting)"
                  rows={2}
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm mb-3"
                />
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => decide(selected._id, 'reject')}
                    className="px-4 py-2 bg-red-50 text-red-700 border border-red-200 rounded font-semibold hover:bg-red-100 flex items-center gap-1"
                  >
                    <XCircle size={16} /> Reject
                  </button>
                  <button
                    onClick={() => decide(selected._id, 'approve')}
                    className="px-4 py-2 bg-green-600 text-white rounded font-semibold hover:bg-green-700 flex items-center gap-1"
                  >
                    <CheckCircle2 size={16} /> Approve
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
