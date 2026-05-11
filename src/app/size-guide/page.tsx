'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Ruler,
  Info,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  WOMENS_SIZE_CHART,
  MENS_SIZE_CHART,
  WOMEN_MEASUREMENTS,
  MEN_MEASUREMENTS,
} from '@/lib/constants';

type Audience = 'women' | 'men';

export default function SizeGuidePage() {
  const [audience, setAudience] = useState<Audience>('women');
  const [openTip, setOpenTip] = useState<string | null>('bust');

  const measurements = audience === 'women' ? WOMEN_MEASUREMENTS : MEN_MEASUREMENTS;
  const chart = audience === 'women' ? WOMENS_SIZE_CHART : MENS_SIZE_CHART;

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 via-white to-amber-50">
      {/* ── Hero ─────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-[#800020] to-[#e11d48] text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="flex items-center gap-3 mb-3">
            <Ruler size={32} className="text-[#d4a853]" />
            <h1 className="text-3xl md:text-4xl font-bold">Size & Measurement Guide</h1>
          </div>
          <p className="text-rose-100 max-w-2xl">
            Sahi size aur measurements lena seekhain — sellers ke liye listing improve karne ka aur buyers ke liye sahi fit
            choose karne ka complete guide. <span className="text-[#d4a853] font-semibold">(English + Roman Urdu)</span>
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10 space-y-10">
        {/* ── Audience toggle ─────────────────────────────── */}
        <div className="flex justify-center">
          <div className="inline-flex bg-white shadow rounded-full p-1 border border-gray-200">
            <button
              onClick={() => setAudience('women')}
              className={`px-6 py-2 rounded-full font-semibold transition-all ${
                audience === 'women'
                  ? 'bg-[#800020] text-white shadow'
                  : 'text-gray-600 hover:text-[#800020]'
              }`}
            >
              👗 Women's Sizing
            </button>
            <button
              onClick={() => setAudience('men')}
              className={`px-6 py-2 rounded-full font-semibold transition-all ${
                audience === 'men'
                  ? 'bg-[#800020] text-white shadow'
                  : 'text-gray-600 hover:text-[#800020]'
              }`}
            >
              🕴️ Men's Sizing
            </button>
          </div>
        </div>

        {/* ── Quick tips banner ──────────────────────────── */}
        <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <Info className="text-amber-600 flex-shrink-0 mt-1" size={24} />
            <div>
              <h3 className="font-bold text-amber-900 mb-2">5 Pro Tips for Accurate Measurements</h3>
              <ul className="space-y-1.5 text-sm text-amber-900">
                <li>✔️ <strong>Soft measuring tape</strong> use karein (cloth or plastic), metal nahi.</li>
                <li>✔️ Patli si t-shirt ke upar measure karein — heavy clothes mein nahi.</li>
                <li>✔️ <strong>Tape neither tight nor loose</strong> — bilkul body ke saath flush.</li>
                <li>✔️ <strong>Doosre insaan</strong> se measure karwana zyada accurate hota hai.</li>
                <li>✔️ Numbers <em>inches</em> mein note karein (default standard).</li>
              </ul>
            </div>
          </div>
        </div>

        {/* ── Visual measurement diagram ─────────────────── */}
        <section className="bg-white rounded-xl shadow-md p-6 md:p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center gap-2">
            📏 How to Measure — Step by Step
          </h2>
          <p className="text-gray-600 mb-6">
            Har measurement par click karein details ke liye. Daily 100+ sellers ki listings yeh follow karke 2x faster sell ho rahi hain.
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Visual body diagram (CSS-based) */}
            <div className="bg-gradient-to-br from-rose-50 to-amber-50 rounded-xl p-6 flex items-center justify-center border border-rose-100">
              <BodyDiagram audience={audience} highlighted={openTip} />
            </div>

            {/* Measurement instructions */}
            <div className="space-y-2">
              {measurements.map((m) => {
                const isOpen = openTip === m.key;
                return (
                  <div
                    key={m.key}
                    className={`border rounded-lg overflow-hidden transition-all ${
                      isOpen ? 'border-[#800020] bg-rose-50' : 'border-gray-200 bg-white'
                    }`}
                  >
                    <button
                      onClick={() => setOpenTip(isOpen ? null : m.key)}
                      className="w-full flex items-center justify-between p-3 hover:bg-rose-50 transition-colors"
                    >
                      <div className="flex items-center gap-2 text-left">
                        <span
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                            m.required
                              ? 'bg-[#800020] text-white'
                              : 'bg-gray-200 text-gray-700'
                          }`}
                        >
                          {measurements.indexOf(m) + 1}
                        </span>
                        <div>
                          <span className="font-semibold text-gray-800">{m.label}</span>
                          <span className="text-xs text-gray-500 ml-2">({m.urdu})</span>
                          {m.required && (
                            <span className="ml-2 text-[10px] font-bold uppercase bg-rose-100 text-rose-700 px-2 py-0.5 rounded">
                              Required
                            </span>
                          )}
                        </div>
                      </div>
                      {isOpen ? (
                        <ChevronUp size={18} className="text-gray-500" />
                      ) : (
                        <ChevronDown size={18} className="text-gray-500" />
                      )}
                    </button>
                    {isOpen && (
                      <div className="px-4 pb-4 pt-1 text-sm text-gray-700 leading-relaxed">
                        <p className="flex gap-2 items-start">
                          <CheckCircle2 size={16} className="text-green-600 flex-shrink-0 mt-0.5" />
                          <span>{m.howTo}</span>
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── Size chart ──────────────────────────────────── */}
        <section className="bg-white rounded-xl shadow-md p-6 md:p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            📊 {audience === 'women' ? "Women's" : "Men's"} Standard Size Chart
          </h2>
          <p className="text-gray-600 mb-5">
            International standard. Apni measurements ke hisaab se size label choose karein (XS/S/M/L/XL).
            All measurements in <strong>inches</strong>.
          </p>

          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full text-sm">
              <thead className="bg-gradient-to-r from-[#800020] to-[#e11d48] text-white">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Size</th>
                  {audience === 'women' ? (
                    <>
                      <th className="px-4 py-3 text-left font-semibold">Bust (Seenah)</th>
                      <th className="px-4 py-3 text-left font-semibold">Waist (Kamar)</th>
                      <th className="px-4 py-3 text-left font-semibold">Hip (Kohlay)</th>
                      <th className="px-4 py-3 text-left font-semibold">Shoulder</th>
                    </>
                  ) : (
                    <>
                      <th className="px-4 py-3 text-left font-semibold">Chest</th>
                      <th className="px-4 py-3 text-left font-semibold">Waist</th>
                      <th className="px-4 py-3 text-left font-semibold">Shoulder</th>
                      <th className="px-4 py-3 text-left font-semibold">Length</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {chart.map((row, i) => (
                  <tr
                    key={row.label}
                    className={i % 2 === 0 ? 'bg-white' : 'bg-rose-50/40'}
                  >
                    <td className="px-4 py-3 font-bold text-[#800020]">{row.label}</td>
                    {audience === 'women' ? (
                      <>
                        <td className="px-4 py-3">{(row as typeof WOMENS_SIZE_CHART[number]).chest}"</td>
                        <td className="px-4 py-3">{row.waist}"</td>
                        <td className="px-4 py-3">{(row as typeof WOMENS_SIZE_CHART[number]).hip}"</td>
                        <td className="px-4 py-3">{row.shoulder}"</td>
                      </>
                    ) : (
                      <>
                        <td className="px-4 py-3">{(row as typeof MENS_SIZE_CHART[number]).chest}"</td>
                        <td className="px-4 py-3">{row.waist}"</td>
                        <td className="px-4 py-3">{row.shoulder}"</td>
                        <td className="px-4 py-3">{(row as typeof MENS_SIZE_CHART[number]).length}"</td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-5 p-4 bg-blue-50 border border-blue-200 rounded-lg flex gap-3">
            <Info className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
            <p className="text-sm text-blue-900">
              <strong>Tip:</strong> Agar aapki bust 36" hai aur waist 30" hai, toh aap probably <strong>L size</strong> ki hain
              (chest M ki hai but waist L ki). <em>Custom measurements</em> dena hamesha better hai pehle se cut dress ke liye.
            </p>
          </div>
        </section>

        {/* ── Dress-specific tips ─────────────────────────── */}
        <section className="bg-white rounded-xl shadow-md p-6 md:p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-5">
            🎯 Dress-Specific Measurement Tips
          </h2>

          <div className="grid md:grid-cols-2 gap-4">
            {audience === 'women' ? (
              <>
                <TipCard emoji="👰" title="Bridal Lehenga / Gharara">
                  Lehenga ki length sabse zaroori hai — waist se floor tak measure karein (heels pehne hue,
                  agar baat ban rahi hai). Choli ke liye bust + armhole zaroor measure karein.
                </TipCard>
                <TipCard emoji="💃" title="Saree / Saree Blouse">
                  Saree mein sirf <strong>blouse measurements</strong> matter karte hain — bust, waist, armhole,
                  shoulder, sleeve. Saree length mostly standard 5.5 yards.
                </TipCard>
                <TipCard emoji="👗" title="Anarkali / Maxi / Frock">
                  <strong>Bust + waist + length (kandhe se floor tak)</strong>. Frock flair check karein —
                  ghutnon par kitna ghera hai woh bhi mention karein.
                </TipCard>
                <TipCard emoji="🪡" title="Sharara / Palazzo">
                  Waist + hip + <strong>bottom length (waist se ankle tak)</strong> + ghera (around the bottom
                  hem). Sharara ka flare khaas important hota hai.
                </TipCard>
              </>
            ) : (
              <>
                <TipCard emoji="🤵" title="Sherwani / Prince Coat">
                  Sherwani <strong>knee tak ya us se thoda lamba</strong> hoti hai. Chest + waist + shoulder
                  zaroori. Length: kandhe se ghutnay tak measure karein.
                </TipCard>
                <TipCard emoji="👕" title="Kurta / Kurta Pajama">
                  Kurta length usually <strong>kandhe se ghutne ke upar</strong> (modern) ya ghutne tak
                  (traditional). Sleeve length wrist tak.
                </TipCard>
                <TipCard emoji="🩳" title="Shalwar / Pajama">
                  Waist + inseam (crotch se ankle tak) + bottom width (mohri). Waist drawstring wali ho
                  toh range likh dein (e.g., 30-36").
                </TipCard>
                <TipCard emoji="👔" title="Western Suit / Tuxedo">
                  Chest + waist + jacket length + shoulder + sleeve. Pant inseam alag. Jacket size US/UK
                  standard mein hota hai (38, 40, 42 = chest in inches).
                </TipCard>
              </>
            )}
          </div>
        </section>

        {/* ── Trust / Honesty banner ─────────────────────── */}
        <section className="bg-gradient-to-br from-rose-50 to-amber-50 border-2 border-[#d4a853] rounded-xl p-6 md:p-8">
          <div className="flex items-start gap-3">
            <AlertTriangle className="text-amber-700 flex-shrink-0 mt-1" size={28} />
            <div>
              <h3 className="font-bold text-xl text-gray-800 mb-2">
                Honest Measurements = Faster Sales + Happy Buyers
              </h3>
              <p className="text-gray-700 leading-relaxed">
                <strong>Galat measurements likhne se aapki rating tabah ho jati hai.</strong> Buyer expectation manage karna mushkil
                ho jata hai aur returns barhte hain. Time lagao, sahi measurements likho — Shaadi Bazaar par
                <strong> verified sellers</strong> 3x zyada paise kamate hain quick sellers se. Apna size carefully measure karein
                aur kabhi guess na karein!
              </p>
              <div className="mt-4 flex flex-col sm:flex-row gap-3">
                <Link
                  href="/sell"
                  className="inline-flex items-center justify-center gap-2 bg-[#800020] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#600018] transition-colors"
                >
                  Start Listing Your Dress →
                </Link>
                <Link
                  href="/"
                  className="inline-flex items-center justify-center gap-2 bg-white text-[#800020] border-2 border-[#800020] px-6 py-3 rounded-lg font-semibold hover:bg-rose-50 transition-colors"
                >
                  Browse Listings
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Visual body diagram — pure CSS, no images needed
// ─────────────────────────────────────────────────────────────
function BodyDiagram({
  audience,
  highlighted,
}: {
  audience: Audience;
  highlighted: string | null;
}) {
  // Map measurement keys to label positions on the body
  const labels: Record<string, { top: string; left: string; label: string }> = {
    shoulder:     { top: '12%', left: '50%', label: 'Shoulder' },
    bust:         { top: '24%', left: '50%', label: 'Bust' },
    chest:        { top: '24%', left: '50%', label: 'Chest' },
    waist:        { top: '40%', left: '50%', label: 'Waist' },
    hip:          { top: '52%', left: '50%', label: 'Hip' },
    sleeve:       { top: '32%', left: '82%', label: 'Sleeve' },
    armhole:      { top: '24%', left: '78%', label: 'Armhole' },
    neckDepth:    { top: '14%', left: '50%', label: 'Neck Depth' },
    neck:         { top: '12%', left: '50%', label: 'Neck' },
    length:       { top: '46%', left: '50%', label: 'Length' },
    bottomLength: { top: '78%', left: '50%', label: 'Bottom Length' },
    inseam:       { top: '70%', left: '50%', label: 'Inseam' },
  };

  return (
    <div className="relative w-48 h-96">
      {/* Body silhouette */}
      <svg viewBox="0 0 100 200" className="w-full h-full">
        {/* Head */}
        <circle cx="50" cy="14" r="10" fill="#fbcfe8" stroke="#800020" strokeWidth="0.8" />
        {/* Neck */}
        <rect x="46" y="22" width="8" height="6" fill="#fbcfe8" stroke="#800020" strokeWidth="0.8" />
        {/* Torso */}
        <path
          d={
            audience === 'women'
              ? 'M 30 30 L 70 30 L 75 50 L 70 80 L 60 90 L 40 90 L 30 80 L 25 50 Z'
              : 'M 30 30 L 70 30 L 72 55 L 68 85 L 32 85 L 28 55 Z'
          }
          fill="#fce7f3"
          stroke="#800020"
          strokeWidth="0.8"
        />
        {/* Arms */}
        <path d="M 30 32 L 18 60 L 16 85" stroke="#800020" strokeWidth="1" fill="none" />
        <path d="M 70 32 L 82 60 L 84 85" stroke="#800020" strokeWidth="1" fill="none" />
        {/* Lower body */}
        <path
          d={
            audience === 'women'
              ? 'M 32 90 L 68 90 L 75 130 L 62 170 L 55 195 L 45 195 L 38 170 L 25 130 Z'
              : 'M 32 85 L 68 85 L 70 130 L 60 195 L 40 195 L 30 130 Z'
          }
          fill="#fce7f3"
          stroke="#800020"
          strokeWidth="0.8"
        />

        {/* Highlight line based on measurement */}
        {highlighted && labels[highlighted] && (
          <line
            x1={highlighted === 'sleeve' ? '70' : '25'}
            y1={
              highlighted === 'shoulder' || highlighted === 'neck' || highlighted === 'neckDepth'
                ? '28'
                : highlighted === 'bust' || highlighted === 'chest' || highlighted === 'armhole'
                ? '45'
                : highlighted === 'waist'
                ? '75'
                : highlighted === 'hip'
                ? '95'
                : highlighted === 'length'
                ? '90'
                : highlighted === 'sleeve'
                ? '32'
                : highlighted === 'bottomLength'
                ? '160'
                : highlighted === 'inseam'
                ? '140'
                : '50'
            }
            x2={highlighted === 'sleeve' ? '82' : '75'}
            y2={
              highlighted === 'shoulder' || highlighted === 'neck' || highlighted === 'neckDepth'
                ? '28'
                : highlighted === 'bust' || highlighted === 'chest' || highlighted === 'armhole'
                ? '45'
                : highlighted === 'waist'
                ? '75'
                : highlighted === 'hip'
                ? '95'
                : highlighted === 'length'
                ? '90'
                : highlighted === 'sleeve'
                ? '85'
                : highlighted === 'bottomLength'
                ? '160'
                : highlighted === 'inseam'
                ? '140'
                : '50'
            }
            stroke="#d4a853"
            strokeWidth="2"
            strokeDasharray="2,1"
          />
        )}
      </svg>

      {/* Label badge for highlighted measurement */}
      {highlighted && labels[highlighted] && (
        <div
          className="absolute bg-[#d4a853] text-[#800020] text-xs font-bold px-2 py-1 rounded shadow-md whitespace-nowrap pointer-events-none"
          style={{
            top: labels[highlighted].top,
            left: labels[highlighted].left,
            transform: 'translate(-50%, -50%)',
          }}
        >
          {labels[highlighted].label}
        </div>
      )}
    </div>
  );
}

function TipCard({
  emoji,
  title,
  children,
}: {
  emoji: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-gray-200 rounded-lg p-5 hover:border-[#800020] hover:shadow-md transition-all bg-white">
      <h4 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
        <span className="text-2xl">{emoji}</span>
        <span>{title}</span>
      </h4>
      <p className="text-sm text-gray-600 leading-relaxed">{children}</p>
    </div>
  );
}
