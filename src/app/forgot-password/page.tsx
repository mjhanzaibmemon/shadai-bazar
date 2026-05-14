'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
    } catch {
      // Intentionally swallow — we always show the same success message.
    } finally {
      setLoading(false);
      setSubmitted(true);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#800020] via-white to-[#d4a853] px-4">
      <div className="w-full max-w-md glass rounded-2xl p-8 shadow-2xl bg-white">
        <h1 className="text-3xl font-bold text-center gradient-gold mb-2">Forgot Password</h1>
        <p className="text-center text-gray-600 mb-8">Enter your email to receive a reset link</p>

        {submitted ? (
          <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg text-center">
            <p className="font-semibold">Check your email</p>
            <p className="text-sm mt-1">If an account exists for {email}, we've sent a password reset link.</p>
            <Link href="/login" className="inline-block mt-4 text-[#800020] font-semibold hover:underline">
              Back to login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#800020] focus:border-transparent"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#800020] to-[#e11d48] text-white font-semibold py-2 rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>

            <p className="text-center text-gray-600 text-sm">
              Remembered it?{' '}
              <Link href="/login" className="text-[#800020] font-semibold hover:underline">
                Back to login
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
