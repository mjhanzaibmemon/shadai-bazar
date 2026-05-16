'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function ResetPasswordInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('Missing reset token');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Reset failed');
        setLoading(false);
        return;
      }
      router.push('/login');
    } catch {
      setError('Network error');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#800020] via-white to-[#d4a853] px-4">
      <div className="w-full max-w-md glass rounded-2xl p-8 shadow-2xl bg-white">
        <h1 className="text-3xl font-bold text-center gradient-gold mb-2">Reset Password</h1>
        <p className="text-center text-gray-600 mb-8">Choose a new password for your account</p>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              required
              minLength={6}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#800020] focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Re-enter password"
              required
              minLength={6}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#800020] focus:border-transparent"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#800020] to-[#e11d48] text-white font-semibold py-2 rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>

          <p className="text-center text-gray-600 text-sm">
            <Link href="/login" className="text-[#800020] font-semibold hover:underline">
              Back to login
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default function ResetPasswordClient() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#800020] via-white to-[#d4a853] px-4">
        <div className="h-12 w-12 rounded-full border-4 border-[#800020] border-t-transparent animate-spin" />
      </div>
    }>
      <ResetPasswordInner />
    </Suspense>
  );
}
