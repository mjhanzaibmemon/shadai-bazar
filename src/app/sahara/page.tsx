'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Heart, Gift, Users, Sparkles, ArrowRight } from 'lucide-react';

interface PublicRequest {
  _id: string;
  fullName: string;
  city: string;
  story: string;
  weddingDate: string;
  neededCategories: string[];
  status: string;
  referenceNgo?: string;
}

interface Donation {
  _id: string;
  title: string;
  city: string;
  category: string;
  images: string[];
  donor: { name: string };
  createdAt: string;
}

export default function SaharaLandingPage() {
  const [requests, setRequests] = useState<PublicRequest[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/sahara/requests').then((r) => (r.ok ? r.json() : { requests: [] })),
      fetch('/api/sahara/donations').then((r) => (r.ok ? r.json() : { donations: [] })),
    ]).then(([rq, dn]) => {
      setRequests(rq.requests || []);
      setDonations(dn.donations || []);
      setLoading(false);
    });
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* ── Hero ─────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-[#800020] via-[#a01030] to-[#e11d48] text-white">
        <div className="container mx-auto px-4 py-16 md:py-24 text-center">
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur px-4 py-1.5 rounded-full text-sm font-semibold mb-5 border border-white/20">
            <Heart size={16} className="text-[#d4a853] fill-[#d4a853]" /> Pakistan's first wedding wear donation platform
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            <span className="text-[#d4a853]">Shaadi</span> Sahara
            <span className="block text-2xl md:text-3xl mt-3 font-normal text-rose-100">
              Apni shaadi ki dress kisi aur ki shaadi bana do
            </span>
          </h1>
          <p className="max-w-2xl mx-auto text-rose-100 leading-relaxed mb-8">
            Kayi behnein humari Pakistan mein shaadi ki dress nahi le sakti maali halaat ki wajah se.
            Aap ki ek used dress un ki zindagi ka sabse khaas din bana sakti hai.
            <strong className="text-white"> 100% free</strong>, verified recipients, platform delivery covers.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/sahara/donate"
              className="bg-[#d4a853] text-[#800020] px-7 py-3 rounded-lg font-bold shadow-lg hover:shadow-xl transition-all inline-flex items-center justify-center gap-2"
            >
              <Gift size={20} /> Donate a Dress
            </Link>
            <Link
              href="/sahara/apply"
              className="bg-white/10 backdrop-blur border-2 border-white/40 text-white px-7 py-3 rounded-lg font-bold hover:bg-white/20 transition-all inline-flex items-center justify-center gap-2"
            >
              <Heart size={20} /> Apply for Help
            </Link>
          </div>
        </div>
      </section>

      {/* ── Impact stats ────────────────────────────── */}
      <section className="py-12 bg-gradient-to-b from-rose-50 to-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { num: donations.length, label: 'Dresses Donated', icon: Gift },
              { num: requests.length, label: 'Brides Helped', icon: Heart },
              { num: '100%', label: 'Free for Recipients', icon: Sparkles },
              { num: '24-48h', label: 'Review Time', icon: Users },
            ].map(({ num, label, icon: Icon }) => (
              <div key={label} className="bg-white rounded-xl p-5 text-center shadow-sm border border-rose-100">
                <Icon size={28} className="mx-auto text-[#800020] mb-2" />
                <p className="text-3xl font-bold text-[#800020]">{num}</p>
                <p className="text-xs text-gray-600 mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ────────────────────────────── */}
      <section className="py-14 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-10 text-gray-800">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              {
                step: '1', title: 'Donor donates', emoji: '🎁',
                text: 'Verified seller apni used wedding dress donate karti hai (sell ke bajaye).'
              },
              {
                step: '2', title: 'Recipient applies', emoji: '🤲',
                text: 'Zaroorat-mand dulhan apni story share karti hai with NGO reference (Edhi, JDC, Akhuwat).'
              },
              {
                step: '3', title: 'Admin matches', emoji: '✨',
                text: 'Hamari team review kar ke best match karti hai. Delivery platform cover karta hai.'
              },
            ].map((s) => (
              <div key={s.step} className="relative p-6 bg-gradient-to-br from-rose-50 to-amber-50 rounded-xl border border-rose-100">
                <div className="absolute -top-3 -left-3 w-10 h-10 bg-[#800020] text-white rounded-full flex items-center justify-center font-bold text-lg">
                  {s.step}
                </div>
                <div className="text-4xl mb-3">{s.emoji}</div>
                <h3 className="font-bold text-gray-800 mb-2">{s.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stories / requests ──────────────────────── */}
      <section className="py-14 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex items-end justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-800">Stories That Need You 💌</h2>
              <p className="text-gray-600 mt-1">Privacy ke liye sirf first name aur city dikhayi gayi hai.</p>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12 text-gray-600">Loading stories...</div>
          ) : requests.length === 0 ? (
            <div className="bg-white rounded-xl p-10 text-center text-gray-600">
              <Heart size={36} className="mx-auto text-rose-300 mb-3" />
              <p>Abhi koi pending stories nahi hain. Aap pehlay ho jo donate karein!</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {requests.slice(0, 6).map((r) => (
                <div key={r._id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-200 to-amber-200 flex items-center justify-center text-xl">
                      💝
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-gray-800">{r.fullName}</p>
                      <p className="text-xs text-gray-500">{r.city} · Wedding {new Date(r.weddingDate).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed line-clamp-4">{r.story}</p>
                  {r.referenceNgo && r.referenceNgo !== 'none' && (
                    <span className="inline-block mt-3 text-xs font-semibold bg-green-50 text-green-700 px-2 py-0.5 rounded">
                      Verified via {r.referenceNgo.toUpperCase()}
                    </span>
                  )}
                  <Link
                    href="/sahara/donate"
                    className="mt-3 text-sm font-semibold text-[#800020] hover:text-[#600018] flex items-center gap-1"
                  >
                    Help her <ArrowRight size={14} />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Recent donations ────────────────────────── */}
      {donations.length > 0 && (
        <section className="py-14 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Recent Donations 🎁</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {donations.slice(0, 8).map((d) => (
                <div key={d._id} className="bg-white rounded-xl overflow-hidden border border-gray-100 hover:shadow-md transition-shadow">
                  {d.images[0] && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={d.images[0]} alt={d.title} className="w-full aspect-square object-cover" />
                  )}
                  <div className="p-3">
                    <p className="text-sm font-semibold text-gray-800 line-clamp-1">{d.title}</p>
                    <p className="text-xs text-gray-500">by {d.donor?.name} · {d.city}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CTA ─────────────────────────────────────── */}
      <section className="py-16 bg-gradient-to-br from-[#800020] to-[#e11d48] text-white">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <Sparkles size={36} className="mx-auto text-[#d4a853] mb-3" />
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ek dress = Ek zindagi ka khoobsurat din
          </h2>
          <p className="text-rose-100 mb-6">
            Aapki shaadi ki dress closet mein dabbi hai. Yeh kisi behan ki khushi ban sakti hai.
            5 minutes lagte hain donate karne mein.
          </p>
          <Link
            href="/sahara/donate"
            className="inline-flex items-center gap-2 bg-[#d4a853] text-[#800020] px-8 py-3 rounded-lg font-bold shadow-lg hover:shadow-xl"
          >
            Donate Now <ArrowRight size={20} />
          </Link>
        </div>
      </section>
    </div>
  );
}
