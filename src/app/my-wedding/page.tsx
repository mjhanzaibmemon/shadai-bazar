'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Calendar, Heart, Share2, Wallet, Sparkles, Copy, Check } from 'lucide-react';

interface WeddingProfile {
  weddingDate?: string;
  role: 'bride' | 'groom' | 'family' | 'guest' | 'none';
  budget: number;
  spent: number;
  shareToken?: string;
}

interface WishlistItem {
  _id: string;
  title: string;
  price: number;
  originalPrice?: number;
  images: string[];
  city: string;
  status: string;
}

export default function MyWeddingPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();

  const [profile, setProfile] = useState<WeddingProfile | null>(null);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [copied, setCopied] = useState(false);

  // Edit state
  const [date, setDate] = useState('');
  const [role, setRole] = useState<WeddingProfile['role']>('none');
  const [budget, setBudget] = useState('');
  const [spent, setSpent] = useState('');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push('/login?redirect=/my-wedding');
    if (isAuthenticated) load();
  }, [authLoading, isAuthenticated, router]);

  const load = async () => {
    try {
      const res = await fetch('/api/profile/wedding');
      if (res.ok) {
        const data = await res.json();
        setProfile(data.profile);
        setWishlist(data.wishlist || []);
        if (data.profile) {
          setDate(data.profile.weddingDate ? data.profile.weddingDate.split('T')[0] : '');
          setRole(data.profile.role || 'none');
          setBudget(String(data.profile.budget || ''));
          setSpent(String(data.profile.spent || ''));
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const save = async () => {
    const res = await fetch('/api/profile/wedding', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        weddingDate: date || undefined,
        role,
        budget: budget ? parseInt(budget) : 0,
        spent: spent ? parseInt(spent) : 0,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      setProfile(data.profile);
      setEditing(false);
    }
  };

  const copyShareLink = () => {
    if (!profile?.shareToken) return;
    const url = `${window.location.origin}/wishlist/shared/${profile.shareToken}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Calculate countdown
  const daysLeft = profile?.weddingDate
    ? Math.max(0, Math.ceil((new Date(profile.weddingDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;

  const budgetPct = profile?.budget ? Math.min(100, (profile.spent / profile.budget) * 100) : 0;
  const budgetColor = budgetPct < 75 ? 'green' : budgetPct < 95 ? 'amber' : 'red';

  if (authLoading || loading) {
    return <div className="min-h-screen flex items-center justify-center"><p>Loading...</p></div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 via-white to-amber-50">
      <div className="bg-gradient-to-r from-[#800020] to-[#e11d48] text-white">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-3">
            <Sparkles size={32} className="text-[#d4a853]" />
            My Wedding Dashboard
          </h1>
          <p className="text-rose-100 mt-2">Countdown, budget, wishlist — sab ek jaga.</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-5xl space-y-6">
        {/* ── Countdown card ────────────────────────── */}
        <div className="bg-white rounded-xl shadow p-6 md:p-8 border border-rose-100">
          <div className="flex items-start justify-between gap-3 flex-wrap mb-4">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Calendar size={22} className="text-[#800020]" /> Wedding Countdown
            </h2>
            <button
              onClick={() => setEditing(!editing)}
              className="text-sm font-semibold text-[#800020] hover:text-[#600018]"
            >
              {editing ? 'Cancel' : profile?.weddingDate ? 'Edit' : 'Set up'}
            </button>
          </div>

          {editing ? (
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold mb-1">Wedding Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 border-2 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Your Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as WeddingProfile['role'])}
                    className="w-full px-3 py-2 border-2 rounded-lg bg-white"
                  >
                    <option value="none">—</option>
                    <option value="bride">Bride (Dulhan)</option>
                    <option value="groom">Groom (Dulha)</option>
                    <option value="family">Family Member</option>
                    <option value="guest">Guest</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Budget (Rs.)</label>
                  <input
                    type="number"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="w-full px-3 py-2 border-2 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Spent So Far (Rs.)</label>
                  <input
                    type="number"
                    value={spent}
                    onChange={(e) => setSpent(e.target.value)}
                    className="w-full px-3 py-2 border-2 rounded-lg"
                  />
                </div>
              </div>
              <button
                onClick={save}
                className="px-5 py-2 bg-[#800020] text-white rounded-lg font-semibold"
              >
                Save Profile
              </button>
            </div>
          ) : profile?.weddingDate ? (
            <div className="text-center py-6">
              <p className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-[#800020] to-[#d4a853] bg-clip-text text-transparent">
                {daysLeft}
              </p>
              <p className="text-gray-600 mt-2">days until your wedding 💍</p>
              <p className="text-sm text-gray-500 mt-1">
                {new Date(profile.weddingDate).toLocaleDateString('en-PK', {
                  weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
                })}
              </p>
            </div>
          ) : (
            <p className="text-center text-gray-500 py-6">Set your wedding date to start the countdown.</p>
          )}
        </div>

        {/* ── Budget tracker ────────────────────────── */}
        {profile?.budget && profile.budget > 0 && (
          <div className="bg-white rounded-xl shadow p-6 md:p-8 border border-rose-100">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2 mb-4">
              <Wallet size={22} className="text-[#800020]" /> Budget Tracker
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Spent</span>
                <span className="font-bold">Rs. {profile.spent.toLocaleString()} / Rs. {profile.budget.toLocaleString()}</span>
              </div>
              <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all bg-${budgetColor}-500`}
                  style={{ width: `${budgetPct}%` }}
                />
              </div>
              <p className={`text-sm font-semibold text-${budgetColor}-700`}>
                {budgetPct < 75
                  ? `✓ On track — Rs. ${(profile.budget - profile.spent).toLocaleString()} left`
                  : budgetPct < 95
                  ? `⚠️ Watch out — only Rs. ${(profile.budget - profile.spent).toLocaleString()} remaining`
                  : `🛑 Over budget by Rs. ${(profile.spent - profile.budget).toLocaleString()}`}
              </p>
            </div>
          </div>
        )}

        {/* ── Wishlist + Family share ───────────────── */}
        <div className="bg-white rounded-xl shadow p-6 md:p-8 border border-rose-100">
          <div className="flex flex-wrap justify-between items-start gap-3 mb-4">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Heart size={22} className="text-rose-500 fill-rose-500" /> My Wishlist ({wishlist.length})
            </h2>
            {profile?.shareToken && (
              <button
                onClick={copyShareLink}
                className="inline-flex items-center gap-2 text-sm bg-amber-50 border-2 border-amber-200 text-amber-900 px-3 py-1.5 rounded-lg font-semibold hover:bg-amber-100"
              >
                {copied ? <Check size={16} /> : <Share2 size={16} />}
                {copied ? 'Link copied!' : 'Share with family'}
              </button>
            )}
          </div>

          {!profile?.shareToken && (
            <p className="text-sm text-gray-500 mb-3">
              Set up your profile above to get a shareable family link.
            </p>
          )}

          {wishlist.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Heart size={32} className="mx-auto text-rose-200 mb-2" />
              <p className="mb-3">No items in wishlist yet.</p>
              <Link href="/" className="text-[#800020] font-semibold hover:underline">
                Browse listings →
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {wishlist.map((item) => (
                <Link
                  key={item._id}
                  href={`/listing/${item._id}`}
                  className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                >
                  {item.images[0] && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={item.images[0]} alt={item.title} className="w-full aspect-square object-cover" />
                  )}
                  <div className="p-2.5">
                    <p className="text-sm font-semibold text-gray-800 line-clamp-1">{item.title}</p>
                    <p className="text-sm font-bold text-[#800020]">Rs. {item.price.toLocaleString()}</p>
                    <p className="text-[10px] text-gray-500">{item.city}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
