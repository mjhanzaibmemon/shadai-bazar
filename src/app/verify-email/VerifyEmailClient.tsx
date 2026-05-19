'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

type Status = 'loading' | 'success' | 'error';

function VerifyEmailInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const { fetchUser } = useAuth();
  const [status, setStatus] = useState<Status>('loading');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (!token) {
        setStatus('error');
        setErrorMsg('No verification token provided');
        return;
      }
      try {
        const res = await fetch(`/api/auth/verify-email?token=${encodeURIComponent(token)}`);
        const data = await res.json();
        if (cancelled) return;
        if (res.ok && data.verified) {
          await fetchUser();
          setStatus('success');
          setTimeout(() => {
            if (!cancelled) router.push('/');
          }, 2500);
        } else {
          setStatus('error');
          setErrorMsg(data.error || 'Verification failed');
        }
      } catch {
        if (!cancelled) {
          setStatus('error');
          setErrorMsg('Network error');
        }
      }
    }
    run();
    return () => { cancelled = true; };
  }, [token, fetchUser, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#800020] via-white to-[#d4a853] px-4">
      <div className="w-full max-w-md bg-white rounded-2xl p-8 shadow-2xl text-center">
        {status === 'loading' && (
          <>
            <div className="mx-auto h-12 w-12 rounded-full border-4 border-[#800020] border-t-transparent animate-spin mb-6" />
            <h1 className="text-xl font-semibold text-gray-800">Verifying your email…</h1>
            <p className="text-gray-500 mt-2">This will only take a moment.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="mx-auto h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Email Verified! 🎉</h1>
            <p className="text-gray-600 mb-2">Your account is now active. Welcome to Rukhsati!</p>
            <p className="text-gray-500 text-sm mb-6">Redirecting you to home...</p>
            <Link href="/" className="inline-block bg-gradient-to-r from-[#800020] to-[#e11d48] text-white font-semibold py-2 px-6 rounded-lg hover:shadow-lg transition-all">
              Continue Now
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="mx-auto h-16 w-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Verification Failed</h1>
            <p className="text-gray-600 mb-6">{errorMsg || 'This link is invalid or has expired.'}</p>
            <Link href="/login" className="inline-block bg-gradient-to-r from-[#800020] to-[#e11d48] text-white font-semibold py-2 px-6 rounded-lg hover:shadow-lg transition-all">
              Back to Login
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailClient() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#800020] via-white to-[#d4a853] px-4">
        <div className="h-12 w-12 rounded-full border-4 border-[#800020] border-t-transparent animate-spin" />
      </div>
    }>
      <VerifyEmailInner />
    </Suspense>
  );
}
