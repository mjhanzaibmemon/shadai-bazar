'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { CITIES, CATEGORIES, SIZE_LABELS } from '@/lib/constants';
import { Heart, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function ApplyPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    fullName: '',
    cnicNumber: '',
    phone: '',
    city: '',
    fullAddress: '',
    story: '',
    weddingDate: '',
    monthlyIncome: '',
    familySize: '',
    referenceNgo: 'none' as 'edhi' | 'jdc' | 'akhuwat' | 'other' | 'none',
    referenceContact: '',
    neededCategories: [] as string[],
    sizeLabel: '',
    bust: '',
    waist: '',
    hip: '',
    isPubliclyVisible: true,
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push('/login?redirect=/sahara/apply');
  }, [authLoading, isAuthenticated, router]);

  const toggleCat = (id: string) =>
    setForm((p) => ({
      ...p,
      neededCategories: p.neededCategories.includes(id)
        ? p.neededCategories.filter((c) => c !== id)
        : [...p.neededCategories, id],
    }));

  const formatCnic = (v: string) => {
    const d = v.replace(/\D/g, '').slice(0, 13);
    if (d.length <= 5) return d;
    if (d.length <= 12) return `${d.slice(0, 5)}-${d.slice(5)}`;
    return `${d.slice(0, 5)}-${d.slice(5, 12)}-${d.slice(12)}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!/^[0-9]{5}-?[0-9]{7}-?[0-9]$/.test(form.cnicNumber)) return setError('CNIC format invalid');
    if (form.story.length < 50) return setError('Story kam se kam 50 letters');
    if (!form.weddingDate) return setError('Wedding date zaroori hai');
    if (form.neededCategories.length === 0) return setError('Kam se kam ek category select karein');

    setSubmitting(true);
    try {
      const res = await fetch('/api/sahara/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: form.fullName,
          cnicNumber: form.cnicNumber,
          phone: form.phone,
          city: form.city,
          fullAddress: form.fullAddress,
          story: form.story,
          weddingDate: form.weddingDate,
          monthlyIncome: form.monthlyIncome ? parseInt(form.monthlyIncome) : undefined,
          familySize: form.familySize ? parseInt(form.familySize) : undefined,
          referenceNgo: form.referenceNgo,
          referenceContact: form.referenceContact || undefined,
          neededCategories: form.neededCategories,
          sizePreferences: {
            sizeLabel: form.sizeLabel || undefined,
            bust: form.bust ? parseInt(form.bust) : undefined,
            waist: form.waist ? parseInt(form.waist) : undefined,
            hip: form.hip ? parseInt(form.hip) : undefined,
          },
          isPubliclyVisible: form.isPubliclyVisible,
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
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Request Received 💝</h1>
          <p className="text-gray-600 mb-6 leading-relaxed">
            Aapki request submit ho gayi. Hamari team 48 hours mein call karegi aur match karne ki koshish karegi.
            Allah aapki khushi yaadgaar banaye.
          </p>
          <Link href="/sahara" className="block bg-[#800020] text-white py-2.5 rounded-lg font-semibold hover:bg-[#600018]">
            Back to Shaadi Sahara
          </Link>
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
            <Heart size={32} className="text-[#d4a853] fill-[#d4a853]" />
            Apply for Help
          </h1>
          <p className="text-rose-100 mt-2">Hum apki story sun rahe hain. Bahadur banein.</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="mb-5 bg-blue-50 border-2 border-blue-200 rounded-lg p-4 text-sm text-blue-900 flex gap-2">
          <ShieldCheck size={18} className="flex-shrink-0 mt-0.5 text-blue-600" />
          <div>
            <strong>100% Privacy:</strong> Aapka CNIC aur details sirf admin verification ke liye hain. Public par sirf first name + city + story dikhayi jayegi (agar aap allow karein).
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-6 md:p-8 space-y-5">
          {error && (
            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-3 text-red-700 flex gap-2 text-sm">
              <AlertTriangle size={18} /><span>{error}</span>
            </div>
          )}

          <h3 className="font-bold text-gray-800 text-lg">Personal Information</h3>

          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Full Name *">
              <input
                type="text"
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-[#800020] focus:outline-none"
              />
            </Field>
            <Field label="CNIC *">
              <input
                type="text"
                value={form.cnicNumber}
                onChange={(e) => setForm({ ...form, cnicNumber: formatCnic(e.target.value) })}
                placeholder="42101-1234567-1"
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg font-mono"
                maxLength={15}
              />
            </Field>
            <Field label="Phone *">
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="03001234567"
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg"
              />
            </Field>
            <Field label="Wedding Date *">
              <input
                type="date"
                value={form.weddingDate}
                onChange={(e) => setForm({ ...form, weddingDate: e.target.value })}
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg"
              />
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
            <Field label="Full Address *">
              <input
                type="text"
                value={form.fullAddress}
                onChange={(e) => setForm({ ...form, fullAddress: e.target.value })}
                placeholder="House, area"
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg"
              />
            </Field>
          </div>

          <h3 className="font-bold text-gray-800 text-lg pt-4 border-t">Your Story</h3>

          <Field label="Tell us your story *" hint="Apne haalaat, family situation, kyun help chahiye — jo bhi share karna chahein.">
            <textarea
              value={form.story}
              onChange={(e) => setForm({ ...form, story: e.target.value })}
              rows={6}
              maxLength={2000}
              placeholder="Mein apni kahani share karna chahti hu..."
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg resize-none"
            />
            <p className="text-xs text-gray-400 mt-1 text-right">{form.story.length}/2000</p>
          </Field>

          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Monthly Income (Rs.)" hint="Family ka total">
              <input
                type="number"
                min={0}
                value={form.monthlyIncome}
                onChange={(e) => setForm({ ...form, monthlyIncome: e.target.value })}
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg"
              />
            </Field>
            <Field label="Family Size">
              <input
                type="number"
                min={1}
                value={form.familySize}
                onChange={(e) => setForm({ ...form, familySize: e.target.value })}
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg"
              />
            </Field>
          </div>

          <h3 className="font-bold text-gray-800 text-lg pt-4 border-t">NGO Reference (boosts approval 5x)</h3>

          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Reference Through">
              <select
                value={form.referenceNgo}
                onChange={(e) => setForm({ ...form, referenceNgo: e.target.value as typeof form.referenceNgo })}
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg bg-white"
              >
                <option value="none">None / Self</option>
                <option value="edhi">Edhi Foundation</option>
                <option value="jdc">JDC Welfare</option>
                <option value="akhuwat">Akhuwat Foundation</option>
                <option value="other">Other NGO</option>
              </select>
            </Field>
            <Field label="NGO Contact / Reference Letter ID">
              <input
                type="text"
                value={form.referenceContact}
                onChange={(e) => setForm({ ...form, referenceContact: e.target.value })}
                placeholder="Optional"
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg"
              />
            </Field>
          </div>

          <h3 className="font-bold text-gray-800 text-lg pt-4 border-t">What do you need?</h3>

          <Field label="Categories Needed *">
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => toggleCat(c.id)}
                  className={`px-3 py-1.5 rounded-full text-sm border-2 ${
                    form.neededCategories.includes(c.id)
                      ? 'border-[#800020] bg-rose-50 text-[#800020] font-semibold'
                      : 'border-gray-200 text-gray-700'
                  }`}
                >
                  {c.icon} {c.label}
                </button>
              ))}
            </div>
          </Field>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Field label="Size">
              <select
                value={form.sizeLabel}
                onChange={(e) => setForm({ ...form, sizeLabel: e.target.value })}
                className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg bg-white text-sm"
              >
                <option value="">—</option>
                {SIZE_LABELS.map((s) => <option key={s.id} value={s.id}>{s.id}</option>)}
              </select>
            </Field>
            <Field label="Bust (in)">
              <input
                type="number"
                value={form.bust}
                onChange={(e) => setForm({ ...form, bust: e.target.value })}
                className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm"
              />
            </Field>
            <Field label="Waist (in)">
              <input
                type="number"
                value={form.waist}
                onChange={(e) => setForm({ ...form, waist: e.target.value })}
                className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm"
              />
            </Field>
            <Field label="Hip (in)">
              <input
                type="number"
                value={form.hip}
                onChange={(e) => setForm({ ...form, hip: e.target.value })}
                className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm"
              />
            </Field>
          </div>

          <label className="flex items-start gap-2 cursor-pointer pt-4 border-t">
            <input
              type="checkbox"
              checked={form.isPubliclyVisible}
              onChange={(e) => setForm({ ...form, isPubliclyVisible: e.target.checked })}
              className="mt-1 w-5 h-5 accent-[#800020]"
            />
            <span className="text-sm text-gray-700">
              Mein agree karti hu ke meri story (sirf first name, city aur text) public dikhayi ja sakti hai donors ke liye.
              CNIC, phone, address kabhi public nahi honge.
            </span>
          </label>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-gradient-to-r from-[#800020] to-[#d4a853] text-white rounded-lg font-bold shadow-md disabled:opacity-60"
          >
            {submitting ? 'Submitting...' : '💝 Submit My Request'}
          </button>
        </form>
      </div>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block font-semibold text-gray-700 mb-1 text-sm">{label}</label>
      {hint && <p className="text-xs text-gray-500 mb-1.5">{hint}</p>}
      {children}
    </div>
  );
}
