'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { CATEGORIES, SUB_CATEGORIES, CITIES, SIZE_LABELS, type CategoryId } from '@/lib/constants';
import { Heart, Camera, X, CheckCircle2, AlertTriangle, Gift } from 'lucide-react';

export default function DonatePage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    subCategory: '',
    sizeLabel: '',
    city: '',
    estimatedValue: '',
    images: [] as string[],
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push('/login?redirect=/sahara/donate');
  }, [authLoading, isAuthenticated, router]);

  const subCats = form.category ? SUB_CATEGORIES[form.category as CategoryId] || [] : [];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const remaining = 10 - form.images.length;
    files.slice(0, remaining).forEach((file) => {
      if (file.size > 5 * 1024 * 1024) {
        setError(`Image too large: ${file.name}`);
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => setForm((p) => ({ ...p, images: [...p.images, reader.result as string] }));
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.title.length < 5) return setError('Title kam se kam 5 letters');
    if (form.description.length < 20) return setError('Description kam se kam 20 letters');
    if (!form.category || !form.city || form.images.length === 0) return setError('Saari required fields fill karein');

    setSubmitting(true);
    try {
      const res = await fetch('/api/sahara/donations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          estimatedValue: form.estimatedValue ? parseInt(form.estimatedValue) : 0,
        }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error || 'Submission failed');
      else setSubmitted(true);
    } catch {
      setError('Network error');
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading) return <div className="min-h-screen flex items-center justify-center"><p>Loading...</p></div>;

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 to-amber-50 px-4">
        <div className="bg-white rounded-2xl shadow-xl p-10 max-w-md text-center">
          <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-5">
            <CheckCircle2 size={48} className="text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Shukriya! 💝</h1>
          <p className="text-gray-600 mb-6 leading-relaxed">
            Aapka donation submit ho gaya. Hamari team isay verify kar ke kisi behan ke saath match karegi.
            Aapko email aur SMS par updates milengi.
          </p>
          <div className="flex flex-col gap-2">
            <Link href="/sahara" className="bg-[#800020] text-white py-2.5 rounded-lg font-semibold hover:bg-[#600018]">
              See Other Stories
            </Link>
            <Link href="/" className="text-gray-600 py-2 hover:text-[#800020]">Back to Home</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white">
      <div className="bg-gradient-to-r from-[#800020] to-[#e11d48] text-white">
        <div className="container mx-auto px-4 py-10">
          <Link href="/sahara" className="text-rose-100 text-sm hover:text-white">← Back to Shaadi Sahara</Link>
          <h1 className="text-3xl md:text-4xl font-bold mt-3 flex items-center gap-3">
            <Gift size={32} className="text-[#d4a853]" />
            Donate a Wedding Dress
          </h1>
          <p className="text-rose-100 mt-2">Aapki dress kisi ki shaadi yaadgaar bana de.</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="mb-5 bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-900 flex gap-2">
          <Heart size={18} className="flex-shrink-0 mt-0.5 fill-amber-700 text-amber-700" />
          <span>
            <strong>Tax/CSR receipt:</strong> Donation ke baad estimated value ki tax receipt aapki email par bhej di jayegi.
          </span>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-6 md:p-8 space-y-5">
          {error && (
            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-3 text-red-700 flex gap-2 text-sm">
              <AlertTriangle size={18} /><span>{error}</span>
            </div>
          )}

          <Field label="Dress Title *">
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Maroon Bridal Lehenga (donating)"
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-[#800020] focus:outline-none"
              maxLength={100}
            />
          </Field>

          <Field label="Description *" hint="Recipient ko batayein: condition, color, kab pehni thi, koi defects?">
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={4}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-[#800020] focus:outline-none resize-none"
            />
          </Field>

          <div>
            <label className="block font-semibold text-gray-700 mb-2">Category *</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {CATEGORIES.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setForm({ ...form, category: c.id, subCategory: '' })}
                  className={`p-3 border-2 rounded-lg text-left ${
                    form.category === c.id ? 'border-[#800020] bg-rose-50' : 'border-gray-200'
                  }`}
                >
                  <span className="text-xl">{c.icon}</span>
                  <p className="text-xs font-semibold mt-1">{c.label}</p>
                </button>
              ))}
            </div>
          </div>

          {form.category && (
            <Field label="Specific Type">
              <select
                value={form.subCategory}
                onChange={(e) => setForm({ ...form, subCategory: e.target.value })}
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg bg-white"
              >
                <option value="">Select type</option>
                {subCats.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            </Field>
          )}

          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Size">
              <select
                value={form.sizeLabel}
                onChange={(e) => setForm({ ...form, sizeLabel: e.target.value })}
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg bg-white"
              >
                <option value="">Select size</option>
                {SIZE_LABELS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            </Field>
            <Field label="City *">
              <select
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg bg-white"
              >
                <option value="">Select city</option>
                {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
          </div>

          <Field label="Estimated Value (Rs.) — for tax receipt" hint="Approximately kitne ki khareedi thi?">
            <input
              type="number"
              min={0}
              value={form.estimatedValue}
              onChange={(e) => setForm({ ...form, estimatedValue: e.target.value })}
              placeholder="50000"
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-[#800020] focus:outline-none"
            />
          </Field>

          <Field label={`Photos * (${form.images.length}/10)`} hint="Honest photos lagaayein.">
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {form.images.map((img, i) => (
                <div key={i} className="relative aspect-square rounded-lg overflow-hidden border-2 border-gray-200 group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img} alt={`${i + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, images: form.images.filter((_, idx) => idx !== i) })}
                    className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
              {form.images.length < 10 && (
                <label className="aspect-square rounded-lg border-2 border-dashed border-gray-300 hover:border-[#800020] flex flex-col items-center justify-center cursor-pointer text-gray-500 hover:bg-rose-50">
                  <Camera size={24} />
                  <span className="text-xs mt-1">Add</span>
                  <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
                </label>
              )}
            </div>
          </Field>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-gradient-to-r from-[#800020] to-[#d4a853] text-white rounded-lg font-bold shadow-md disabled:opacity-60"
          >
            {submitting ? 'Submitting...' : '🎁 Donate this dress'}
          </button>
        </form>
      </div>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block font-semibold text-gray-700 mb-1">{label}</label>
      {hint && <p className="text-xs text-gray-500 mb-1.5">{hint}</p>}
      {children}
    </div>
  );
}
