'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
  CATEGORIES,
  SUB_CATEGORIES,
  OCCASIONS,
  CITIES,
  CONDITIONS,
  FABRICS,
  COLORS,
  BRANDS,
  WORK_TYPES,
  SIZE_LABELS,
  WOMEN_MEASUREMENTS,
  MEN_MEASUREMENTS,
  DELIVERY_OPTIONS,
  LISTING_TYPES,
  type CategoryId,
} from '@/lib/constants';
import {
  Camera, X, ChevronLeft, ChevronRight, Ruler, AlertTriangle,
  CheckCircle2, Info, Sparkles, Plus,
} from 'lucide-react';

const TOTAL_STEPS = 5;

type FormData = {
  category: string;
  subCategory: string;
  gender: 'women' | 'men' | 'kids' | 'unisex';
  occasion: string[];
  title: string;
  description: string;
  brand: string;
  color: string;
  fabric: string;
  workType: string;
  condition: string;
  listingType: 'sell' | 'rent' | 'both';
  sizeLabel: string;
  size: Record<string, number | undefined>;
  price: string;
  originalPrice: string;
  rentPricePerDay: string;
  rentDuration: string;
  images: string[];
  damageDisclosed: boolean;
  defects: string;
  hasOriginalReceipt: boolean;
  city: string;
  area: string;
  deliveryOptions: string[];
};

const initialForm: FormData = {
  category: '',
  subCategory: '',
  gender: 'women',
  occasion: [],
  title: '',
  description: '',
  brand: '',
  color: '',
  fabric: '',
  workType: '',
  condition: '',
  listingType: 'sell',
  sizeLabel: '',
  size: {},
  price: '',
  originalPrice: '',
  rentPricePerDay: '',
  rentDuration: '3',
  images: [],
  damageDisclosed: false,
  defects: '',
  hasOriginalReceipt: false,
  city: '',
  area: '',
  deliveryOptions: ['pickup'],
};

export default function SellPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>(initialForm);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login?redirect=/sell');
    }
  }, [authLoading, isAuthenticated, router]);

  const update = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setError('');
  };

  const updateSize = (key: string, value: string) => {
    const num = value === '' ? undefined : parseFloat(value);
    setForm((prev) => ({ ...prev, size: { ...prev.size, [key]: num } }));
  };

  const toggleOccasion = (id: string) => {
    setForm((prev) => ({
      ...prev,
      occasion: prev.occasion.includes(id)
        ? prev.occasion.filter((o) => o !== id)
        : [...prev.occasion, id],
    }));
  };

  const toggleDelivery = (id: string) => {
    setForm((prev) => ({
      ...prev,
      deliveryOptions: prev.deliveryOptions.includes(id)
        ? prev.deliveryOptions.filter((o) => o !== id)
        : [...prev.deliveryOptions, id],
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const remaining = 10 - form.images.length;

    files.slice(0, remaining).forEach((file) => {
      if (file.size > 5 * 1024 * 1024) {
        setError(`"${file.name}" is too large (max 5MB)`);
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm((prev) => ({ ...prev, images: [...prev.images, reader.result as string] }));
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (idx: number) => {
    setForm((prev) => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }));
  };

  const validateStep = (s: number): string | null => {
    if (s === 1) {
      if (!form.category) return 'Please choose a category';
      if (!form.subCategory) return 'Please pick a specific dress type';
      if (form.occasion.length === 0) return 'Choose at least one occasion';
    }
    if (s === 2) {
      if (form.title.length < 5) return 'Title must be at least 5 characters';
      if (form.description.length < 20) return 'Description must be at least 20 characters';
      if (!form.fabric) return 'Please select a fabric';
      if (!form.condition) return 'Please select condition';
    }
    if (s === 3) {
      if (!form.sizeLabel) return 'Please select a size label (M, L, etc.) or "Custom"';
    }
    if (s === 4) {
      if (!form.price || parseInt(form.price) < 100) return 'Price must be at least Rs. 100';
      if (form.images.length === 0) return 'Please upload at least 1 photo';
      if (!form.damageDisclosed) return 'You must confirm the damage disclosure checkbox';
      if (form.listingType !== 'sell' && !form.rentPricePerDay) {
        return 'Please enter rent price per day';
      }
    }
    if (s === 5) {
      if (!form.city) return 'Please select your city';
      if (form.deliveryOptions.length === 0) return 'Choose at least one delivery option';
    }
    return null;
  };

  const goNext = () => {
    const err = validateStep(step);
    if (err) {
      setError(err);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (step < TOTAL_STEPS) setStep(step + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goBack = () => {
    if (step > 1) setStep(step - 1);
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async () => {
    const err = validateStep(5);
    if (err) {
      setError(err);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setSubmitting(true);
    setError('');

    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category,
        subCategory: form.subCategory,
        gender: form.gender,
        occasion: form.occasion,
        price: parseInt(form.price),
        originalPrice: form.originalPrice ? parseInt(form.originalPrice) : undefined,
        listingType: form.listingType,
        rentPricePerDay: form.rentPricePerDay ? parseInt(form.rentPricePerDay) : undefined,
        rentDuration: form.rentDuration ? parseInt(form.rentDuration) : undefined,
        condition: form.condition,
        fabric: form.fabric,
        workType: form.workType || undefined,
        brand: form.brand || undefined,
        color: form.color || undefined,
        sizeLabel: form.sizeLabel,
        size: form.size,
        images: form.images,
        defects: form.defects || undefined,
        damageDisclosed: form.damageDisclosed,
        hasOriginalReceipt: form.hasOriginalReceipt,
        city: form.city,
        area: form.area || undefined,
        deliveryOptions: form.deliveryOptions,
      };

      const res = await fetch('/api/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to create listing');
        setSubmitting(false);
        return;
      }
      router.push(`/listing/${data.listing._id}`);
    } catch (e) {
      console.error(e);
      setError('Network error — please try again');
      setSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  const subCats = form.category ? SUB_CATEGORIES[form.category as CategoryId] || [] : [];
  const measurements = form.gender === 'men' ? MEN_MEASUREMENTS : WOMEN_MEASUREMENTS;

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 via-white to-amber-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#800020] to-[#e11d48] text-white">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-2">✨ Sell Your Wedding Wear</h1>
          <p className="text-rose-100">
            5 quick steps · Earn back 40-70% of original cost · Help others save money
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-2 text-sm">
            <span className="font-semibold text-[#800020]">Step {step} of {TOTAL_STEPS}</span>
            <span className="text-gray-500">{Math.round((step / TOTAL_STEPS) * 100)}% complete</span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#800020] to-[#d4a853] transition-all duration-500"
              style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
            />
          </div>
          <div className="hidden md:flex justify-between mt-3 text-xs text-gray-500">
            <StepLabel n={1} cur={step} label="What" />
            <StepLabel n={2} cur={step} label="Details" />
            <StepLabel n={3} cur={step} label="Size" />
            <StepLabel n={4} cur={step} label="Price & Photos" />
            <StepLabel n={5} cur={step} label="Delivery" />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-lg text-red-700 flex gap-2 items-start">
            <AlertTriangle size={20} className="flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-md p-6 md:p-8">
          {/* STEP 1 */}
          {step === 1 && (
            <div className="space-y-8">
              <header>
                <h2 className="text-2xl font-bold text-gray-800">Aap kya bech rahe hain?</h2>
                <p className="text-gray-600 mt-1">Category aur dress type select karein.</p>
              </header>

              <div>
                <label className="block font-semibold text-gray-700 mb-3">Main Category *</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {CATEGORIES.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => { update('category', c.id); update('subCategory', ''); }}
                      className={`p-4 border-2 rounded-xl text-left transition-all ${
                        form.category === c.id
                          ? 'border-[#800020] bg-rose-50 shadow-md'
                          : 'border-gray-200 hover:border-rose-300 hover:bg-rose-50/50'
                      }`}
                    >
                      <div className="text-3xl mb-1">{c.icon}</div>
                      <div className="font-semibold text-sm">{c.label}</div>
                      <div className="text-xs text-gray-500">{c.tagline}</div>
                    </button>
                  ))}
                </div>
              </div>

              {form.category && (
                <div>
                  <label className="block font-semibold text-gray-700 mb-3">Specific Type *</label>
                  <div className="flex flex-wrap gap-2">
                    {subCats.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => update('subCategory', s.id)}
                        className={`px-4 py-2 rounded-full text-sm font-medium border-2 transition-all ${
                          form.subCategory === s.id
                            ? 'border-[#800020] bg-[#800020] text-white'
                            : 'border-gray-200 text-gray-700 hover:border-[#800020]'
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {form.category && !['jewelry', 'footwear', 'accessories'].includes(form.category) && (
                <div>
                  <label className="block font-semibold text-gray-700 mb-3">For Whom?</label>
                  <div className="flex flex-wrap gap-2">
                    {(['women', 'men', 'kids', 'unisex'] as const).map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => update('gender', g)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium border-2 capitalize transition-all ${
                          form.gender === g
                            ? 'border-[#800020] bg-rose-50 text-[#800020]'
                            : 'border-gray-200 text-gray-700 hover:border-rose-300'
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Occasion * <span className="text-xs text-gray-500 font-normal">(select all that apply)</span>
                </label>
                <p className="text-xs text-gray-500 mb-3">
                  Buyers iss filter se search karte hain — har woh function jisme yeh dress pehni ja sakti hai woh select karein.
                </p>
                <div className="flex flex-wrap gap-2">
                  {OCCASIONS.map((o) => (
                    <button
                      key={o.id}
                      type="button"
                      onClick={() => toggleOccasion(o.id)}
                      className={`px-4 py-2 rounded-full text-sm font-medium border-2 transition-all flex items-center gap-1.5 ${
                        form.occasion.includes(o.id)
                          ? 'border-[#d4a853] bg-amber-50 text-amber-900'
                          : 'border-gray-200 text-gray-700 hover:border-amber-300'
                      }`}
                    >
                      <span>{o.icon}</span>
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div className="space-y-6">
              <header>
                <h2 className="text-2xl font-bold text-gray-800">Tell us about it</h2>
                <p className="text-gray-600 mt-1">Detail jitna acha, sales utni jaldi.</p>
              </header>

              <Field label="Listing Title *" hint="50-60 characters ideal. Example: 'Maroon Bridal Lehenga with Heavy Zardozi (HSY)'">
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => update('title', e.target.value)}
                  placeholder="Catchy title likhein..."
                  maxLength={100}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-[#800020] focus:outline-none"
                />
                <CharCount cur={form.title.length} max={100} />
              </Field>

              <Field
                label="Detailed Description *"
                hint="Cheezein jo zaroor batayein: original price, kab kharidi, kitni baar pehni, koi alterations, fabric quality, kaam ki details."
              >
                <textarea
                  value={form.description}
                  onChange={(e) => update('description', e.target.value)}
                  rows={5}
                  maxLength={2000}
                  placeholder="Apni dress ki kahani likhein..."
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-[#800020] focus:outline-none resize-none"
                />
                <CharCount cur={form.description.length} max={2000} />
              </Field>

              <div className="grid md:grid-cols-2 gap-5">
                <Field label="Brand / Designer" hint="If unbranded, select 'Unbranded'">
                  <select
                    value={form.brand}
                    onChange={(e) => update('brand', e.target.value)}
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-[#800020] focus:outline-none bg-white"
                  >
                    <option value="">Select brand</option>
                    {BRANDS.map((b) => (<option key={b} value={b}>{b}</option>))}
                  </select>
                </Field>

                <Field label="Fabric *">
                  <select
                    value={form.fabric}
                    onChange={(e) => update('fabric', e.target.value)}
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-[#800020] focus:outline-none bg-white"
                  >
                    <option value="">Select fabric</option>
                    {FABRICS.map((f) => (<option key={f} value={f}>{f}</option>))}
                  </select>
                </Field>

                <Field label="Embroidery / Work">
                  <select
                    value={form.workType}
                    onChange={(e) => update('workType', e.target.value)}
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-[#800020] focus:outline-none bg-white"
                  >
                    <option value="">Select work type</option>
                    {WORK_TYPES.map((w) => (<option key={w} value={w}>{w}</option>))}
                  </select>
                </Field>

                <Field label="Condition *">
                  <select
                    value={form.condition}
                    onChange={(e) => update('condition', e.target.value)}
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-[#800020] focus:outline-none bg-white"
                  >
                    <option value="">Select condition</option>
                    {CONDITIONS.map((c) => (
                      <option key={c.id} value={c.id}>{c.label} — {c.description}</option>
                    ))}
                  </select>
                </Field>
              </div>

              <Field label="Primary Color">
                <div className="flex flex-wrap gap-2">
                  {COLORS.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => update('color', c.id)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-full border-2 text-sm transition-all ${
                        form.color === c.id
                          ? 'border-[#800020] bg-rose-50 text-[#800020] font-semibold'
                          : 'border-gray-200 text-gray-700 hover:border-rose-300'
                      }`}
                    >
                      <span className="w-5 h-5 rounded-full border border-gray-300" style={{ background: c.hex }} />
                      {c.label}
                    </button>
                  ))}
                </div>
              </Field>

              <Field label="How are you offering this?" hint="Renting bhi karwana hai? 'Sale or Rent' choose karein.">
                <div className="grid grid-cols-3 gap-2">
                  {LISTING_TYPES.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => update('listingType', t.id)}
                      className={`py-3 px-4 rounded-lg border-2 font-semibold text-sm transition-all ${
                        form.listingType === t.id
                          ? 'border-[#800020] bg-rose-50 text-[#800020]'
                          : 'border-gray-200 text-gray-700 hover:border-rose-300'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </Field>
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div className="space-y-6">
              <header className="flex items-start justify-between flex-wrap gap-3">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Size & Measurements</h2>
                  <p className="text-gray-600 mt-1">Sahi size = quick sale + happy buyers.</p>
                </div>
                <Link
                  href="/size-guide"
                  target="_blank"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-900 border-2 border-amber-200 rounded-lg font-semibold text-sm hover:bg-amber-100 transition-colors"
                >
                  <Ruler size={16} />
                  Open Size Guide
                </Link>
              </header>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900 flex gap-2">
                  <Info size={18} className="flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Quick tip:</strong> Soft cloth measuring tape use karein. Body ke saath flush rakhein (na tight, na loose).
                    Numbers <strong>inches mein</strong> likhein.
                  </span>
                </p>
              </div>

              <Field
                label="Size Label *"
                hint="Standard size jo dress ki hai. Custom-tailored ho toh 'Custom / Free Size' choose karein."
              >
                <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
                  {SIZE_LABELS.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => update('sizeLabel', s.id)}
                      className={`py-2 px-3 rounded-lg border-2 font-bold text-sm transition-all ${
                        form.sizeLabel === s.id
                          ? 'border-[#800020] bg-[#800020] text-white'
                          : 'border-gray-200 text-gray-700 hover:border-rose-300'
                      }`}
                      title={s.label}
                    >
                      {s.id}
                    </button>
                  ))}
                </div>
              </Field>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="font-semibold text-gray-700">Detailed Measurements (inches)</label>
                  <span className="text-xs text-gray-500">{form.gender === 'men' ? "Men's" : "Women's"} measurements</span>
                </div>
                <p className="text-xs text-gray-500 mb-4">
                  Jitne zyada measurements aap denge, utni jaldi buyers trust karenge. <strong>Required</strong> fields ke ilawa baaki bhi bharein agar pata ho.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {measurements.map((m) => (
                    <div
                      key={m.key}
                      className={`p-3 border-2 rounded-lg ${
                        m.required ? 'border-rose-200 bg-rose-50/40' : 'border-gray-200 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-sm font-semibold text-gray-700">
                          {m.label}
                          <span className="text-xs text-gray-500 ml-1.5">({m.urdu})</span>
                          {m.required && (
                            <span className="ml-2 text-[10px] font-bold uppercase bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded">
                              Required
                            </span>
                          )}
                        </label>
                      </div>
                      <p className="text-[11px] text-gray-500 mb-2 leading-snug">{m.howTo}</p>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min={1}
                          step={0.5}
                          value={form.size[m.key] ?? ''}
                          onChange={(e) => updateSize(m.key, e.target.value)}
                          placeholder="0"
                          className="w-full px-3 py-2 border-2 border-gray-200 rounded-md focus:border-[#800020] focus:outline-none text-sm"
                        />
                        <span className="text-xs text-gray-500 whitespace-nowrap">inches</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 4 */}
          {step === 4 && (
            <div className="space-y-6">
              <header>
                <h2 className="text-2xl font-bold text-gray-800">Pricing & Photos</h2>
                <p className="text-gray-600 mt-1">Honest pricing aur achi photos = guaranteed sale.</p>
              </header>

              <div className="grid md:grid-cols-2 gap-5">
                <Field
                  label={form.listingType === 'rent' ? 'Reference Price (Rs.)' : 'Selling Price (Rs.) *'}
                  hint="40-70% off original price recommended."
                >
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">Rs.</span>
                    <input
                      type="number"
                      min={100}
                      value={form.price}
                      onChange={(e) => update('price', e.target.value)}
                      placeholder="15000"
                      className="w-full pl-12 pr-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-[#800020] focus:outline-none"
                    />
                  </div>
                </Field>

                <Field label="Original Price (Rs.)" hint="Kitne ki kharidi thi? Buyers ko discount dikhega.">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">Rs.</span>
                    <input
                      type="number"
                      min={0}
                      value={form.originalPrice}
                      onChange={(e) => update('originalPrice', e.target.value)}
                      placeholder="45000"
                      className="w-full pl-12 pr-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-[#800020] focus:outline-none"
                    />
                  </div>
                </Field>

                {form.listingType !== 'sell' && (
                  <>
                    <Field label="Rent Price per Day (Rs.) *">
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">Rs.</span>
                        <input
                          type="number"
                          min={100}
                          value={form.rentPricePerDay}
                          onChange={(e) => update('rentPricePerDay', e.target.value)}
                          placeholder="2000"
                          className="w-full pl-12 pr-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-[#800020] focus:outline-none"
                        />
                      </div>
                    </Field>
                    <Field label="Standard Rental Period (days)">
                      <input
                        type="number"
                        min={1}
                        value={form.rentDuration}
                        onChange={(e) => update('rentDuration', e.target.value)}
                        placeholder="3"
                        className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-[#800020] focus:outline-none"
                      />
                    </Field>
                  </>
                )}
              </div>

              <Field
                label={`Photos * (${form.images.length}/10)`}
                hint="Bright daylight mein khichein. Front, back, close-up of work, tag — sab dikhao."
              >
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                  {form.images.map((img, idx) => (
                    <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border-2 border-gray-200 group">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img} alt={`Upload ${idx + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={14} />
                      </button>
                      {idx === 0 && (
                        <span className="absolute bottom-1 left-1 bg-[#d4a853] text-[#800020] text-[10px] font-bold px-1.5 py-0.5 rounded">
                          MAIN
                        </span>
                      )}
                    </div>
                  ))}
                  {form.images.length < 10 && (
                    <label className="aspect-square rounded-lg border-2 border-dashed border-gray-300 hover:border-[#800020] flex flex-col items-center justify-center cursor-pointer hover:bg-rose-50 transition-colors text-gray-500">
                      <Camera size={28} />
                      <span className="text-xs font-semibold mt-1">Add Photo</span>
                      <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
                    </label>
                  )}
                </div>
              </Field>

              <div className="border-2 border-amber-300 bg-amber-50 rounded-xl p-5 space-y-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="text-amber-700 flex-shrink-0 mt-0.5" size={22} />
                  <div>
                    <h3 className="font-bold text-amber-900">Damage Disclosure (Mandatory)</h3>
                    <p className="text-sm text-amber-900 mt-1">
                      Buyer protection ke liye honest hona zaroori hai. Jhoot bolne par account suspend ho sakta hai.
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Koi defects / issues hain? <span className="text-gray-500 font-normal">(stains, alterations, missing buttons, tarnish, etc.)</span>
                  </label>
                  <textarea
                    value={form.defects}
                    onChange={(e) => update('defects', e.target.value)}
                    rows={3}
                    placeholder="E.g. 'Slight pen mark on inside of waistband, not visible when worn.' — or 'No defects'"
                    className="w-full px-4 py-2 border-2 border-amber-200 rounded-lg focus:border-amber-500 focus:outline-none text-sm"
                  />
                </div>

                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.damageDisclosed}
                    onChange={(e) => update('damageDisclosed', e.target.checked)}
                    className="mt-1 w-5 h-5 accent-[#800020] cursor-pointer"
                  />
                  <span className="text-sm text-gray-700">
                    <strong>I confirm I have honestly disclosed all defects, damages, or alterations.</strong>{' '}
                    Photos sahi aur recent hain (last 30 days). Misrepresentation par account permanently suspend ho sakta hai.
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.hasOriginalReceipt}
                    onChange={(e) => update('hasOriginalReceipt', e.target.checked)}
                    className="w-5 h-5 accent-[#800020] cursor-pointer"
                  />
                  <span className="text-sm text-gray-700">
                    I have the <strong>original receipt</strong> / proof of purchase (boosts buyer trust 3x)
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* STEP 5 */}
          {step === 5 && (
            <div className="space-y-6">
              <header>
                <h2 className="text-2xl font-bold text-gray-800">Delivery & Final Review</h2>
                <p className="text-gray-600 mt-1">Buyer ko kaise dena chahte hain.</p>
              </header>

              <div className="grid md:grid-cols-2 gap-5">
                <Field label="City *">
                  <select
                    value={form.city}
                    onChange={(e) => update('city', e.target.value)}
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-[#800020] focus:outline-none bg-white"
                  >
                    <option value="">Select city</option>
                    {CITIES.map((c) => (<option key={c} value={c}>{c}</option>))}
                  </select>
                </Field>

                <Field label="Area / Town (optional)" hint="Example: Defence, Gulshan, Bahria">
                  <input
                    type="text"
                    value={form.area}
                    onChange={(e) => update('area', e.target.value)}
                    placeholder="Defence Phase 5"
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-[#800020] focus:outline-none"
                  />
                </Field>
              </div>

              <Field label="Delivery Options *" hint="Jitne zyada options denge, utni offers milengi.">
                <div className="grid sm:grid-cols-2 gap-2">
                  {DELIVERY_OPTIONS.map((d) => (
                    <label
                      key={d.id}
                      className={`flex items-center gap-2 p-3 border-2 rounded-lg cursor-pointer transition-all ${
                        form.deliveryOptions.includes(d.id)
                          ? 'border-[#800020] bg-rose-50'
                          : 'border-gray-200 hover:border-rose-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={form.deliveryOptions.includes(d.id)}
                        onChange={() => toggleDelivery(d.id)}
                        className="w-4 h-4 accent-[#800020]"
                      />
                      <span className="text-sm font-medium text-gray-700">{d.label}</span>
                    </label>
                  ))}
                </div>
              </Field>

              <div className="bg-gradient-to-br from-rose-50 to-amber-50 border-2 border-[#d4a853] rounded-xl p-6">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Sparkles size={20} className="text-[#d4a853]" />
                  Final Preview
                </h3>
                <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                  <Row k="Title" v={form.title} />
                  <Row k="Category" v={`${CATEGORIES.find((c) => c.id === form.category)?.label} → ${subCats.find((s) => s.id === form.subCategory)?.label}`} />
                  <Row k="Price" v={`Rs. ${parseInt(form.price || '0').toLocaleString()}`} />
                  {form.originalPrice && <Row k="Original" v={`Rs. ${parseInt(form.originalPrice).toLocaleString()}`} />}
                  {form.listingType !== 'sell' && form.rentPricePerDay && (
                    <Row k="Rent/day" v={`Rs. ${parseInt(form.rentPricePerDay).toLocaleString()}`} />
                  )}
                  <Row k="Size" v={form.sizeLabel} />
                  <Row k="Condition" v={CONDITIONS.find((c) => c.id === form.condition)?.label || ''} />
                  <Row k="Fabric" v={form.fabric} />
                  {form.brand && <Row k="Brand" v={form.brand} />}
                  <Row k="Photos" v={`${form.images.length} uploaded`} />
                  <Row k="City" v={form.city} />
                  <Row k="Occasions" v={form.occasion.map((o) => OCCASIONS.find((x) => x.id === o)?.label).join(', ')} />
                </dl>
                {form.damageDisclosed && (
                  <div className="mt-4 flex items-center gap-2 text-green-700 text-sm font-semibold">
                    <CheckCircle2 size={18} />
                    Damage disclosure confirmed ✓
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-6">
          <button
            type="button"
            onClick={goBack}
            disabled={step === 1}
            className="flex items-center gap-1 px-5 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <ChevronLeft size={18} /> Back
          </button>

          {step < TOTAL_STEPS ? (
            <button
              type="button"
              onClick={goNext}
              className="flex items-center gap-1 px-6 py-2.5 bg-[#800020] text-white rounded-lg font-semibold hover:bg-[#600018] transition-all"
            >
              Next Step <ChevronRight size={18} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#800020] to-[#d4a853] text-white rounded-lg font-semibold shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed transition-all"
            >
              {submitting ? 'Posting...' : (<><Plus size={18} /> Post Listing</>)}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper components
function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block font-semibold text-gray-700 mb-1">{label}</label>
      {hint && <p className="text-xs text-gray-500 mb-2">{hint}</p>}
      {children}
    </div>
  );
}

function CharCount({ cur, max }: { cur: number; max: number }) {
  return (
    <p className={`text-xs mt-1 text-right ${cur > max * 0.9 ? 'text-amber-600' : 'text-gray-400'}`}>
      {cur}/{max}
    </p>
  );
}

function StepLabel({ n, cur, label }: { n: number; cur: number; label: string }) {
  return (
    <span className={n === cur ? 'text-[#800020] font-semibold' : n < cur ? 'text-gray-700' : 'text-gray-400'}>
      {n}. {label}
    </span>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <>
      <dt className="text-gray-500">{k}</dt>
      <dd className="font-semibold text-gray-800 truncate">{v || '—'}</dd>
    </>
  );
}
