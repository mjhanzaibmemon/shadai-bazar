'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Mic, Camera, MicOff, X } from 'lucide-react';

/**
 * Smart search bar with voice (Web Speech API) and image search.
 *
 * Voice: uses webkitSpeechRecognition with ur-PK/en-PK locale.
 * Image: sends image to /api/search/image (returns similar listings).
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SpeechRecognition = any;

export function SmartSearchBar({
  initialQuery = '',
  className = '',
}: {
  initialQuery?: string;
  className?: string;
}) {
  const router = useRouter();
  const [q, setQ] = useState(initialQuery);
  const [listening, setListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [showImageDrop, setShowImageDrop] = useState(false);
  const [searchLang, setSearchLang] = useState<'en' | 'ur'>('en');
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const Speech = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (Speech) {
      setVoiceSupported(true);
      const rec: SpeechRecognition = new Speech();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = searchLang === 'ur' ? 'ur-PK' : 'en-PK';
      rec.onresult = (event: { results: { transcript: string }[][] }) => {
        const transcript = event.results[0][0].transcript;
        setQ(transcript);
        setListening(false);
        // Auto-submit after voice
        setTimeout(() => goSearch(transcript), 300);
      };
      rec.onerror = () => setListening(false);
      rec.onend = () => setListening(false);
      recognitionRef.current = rec;
    }
  }, [searchLang]);

  const startVoice = () => {
    if (!recognitionRef.current) return;
    try {
      recognitionRef.current.lang = searchLang === 'ur' ? 'ur-PK' : 'en-PK';
      recognitionRef.current.start();
      setListening(true);
    } catch {
      setListening(false);
    }
  };

  const stopVoice = () => {
    recognitionRef.current?.stop();
    setListening(false);
  };

  const goSearch = (query?: string) => {
    const search = query ?? q;
    if (search.trim()) {
      router.push(`/search?q=${encodeURIComponent(search.trim())}`);
    }
  };

  const handleImageSearch = async (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      alert('Image too large (max 5MB)');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = async () => {
      const dataUrl = reader.result as string;
      try {
        const res = await fetch('/api/search/image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: dataUrl }),
        });
        const data = await res.json();
        if (data.suggestedQuery) {
          setQ(data.suggestedQuery);
          router.push(`/search?q=${encodeURIComponent(data.suggestedQuery)}`);
        } else {
          router.push('/search');
        }
      } catch {
        alert('Image search failed. Please try a text search.');
      }
      setShowImageDrop(false);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className={`relative ${className}`}>
      <form
        onSubmit={(e) => { e.preventDefault(); goSearch(); }}
        className="flex items-center gap-1 bg-white rounded-full border-2 border-gray-200 focus-within:border-[#800020] shadow-sm overflow-hidden"
      >
        <Search size={20} className="ml-4 text-gray-400 flex-shrink-0" />
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={searchLang === 'ur' ? 'لہنگا، شیروانی، ساڑی...' : 'Lehenga, sherwani, saree...'}
          className="flex-1 px-3 py-2.5 outline-none bg-transparent text-sm"
          dir={searchLang === 'ur' ? 'rtl' : 'ltr'}
        />

        {/* Language toggle for voice */}
        {voiceSupported && (
          <button
            type="button"
            onClick={() => setSearchLang(searchLang === 'en' ? 'ur' : 'en')}
            className="px-2 py-1 text-xs font-bold text-gray-600 hover:text-[#800020] flex-shrink-0"
            title="Switch voice language"
          >
            {searchLang === 'en' ? 'EN' : 'UR'}
          </button>
        )}

        {/* Voice button */}
        {voiceSupported && (
          <button
            type="button"
            onClick={listening ? stopVoice : startVoice}
            className={`p-2 rounded-full transition-colors flex-shrink-0 ${
              listening ? 'bg-red-500 text-white animate-pulse' : 'text-gray-500 hover:bg-gray-100'
            }`}
            title="Voice search"
          >
            {listening ? <MicOff size={18} /> : <Mic size={18} />}
          </button>
        )}

        {/* Image button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="p-2 text-gray-500 hover:bg-gray-100 rounded-full flex-shrink-0"
          title="Search by image"
        >
          <Camera size={18} />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleImageSearch(e.target.files[0])}
        />

        <button
          type="submit"
          className="bg-[#800020] text-white px-4 py-2.5 font-semibold text-sm hover:bg-[#600018] flex-shrink-0"
        >
          {searchLang === 'ur' ? 'تلاش' : 'Search'}
        </button>
      </form>

      {/* Listening hint */}
      {listening && (
        <div className="absolute top-full mt-2 left-0 right-0 bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm flex items-center gap-2 shadow-lg z-20">
          <span className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
          {searchLang === 'ur' ? 'بولیں... سن رہا ہوں' : 'Listening... speak now'}
        </div>
      )}

      {/* Drop overlay for image */}
      {showImageDrop && (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const file = e.dataTransfer.files[0];
            if (file) handleImageSearch(file);
          }}
          className="absolute inset-0 bg-rose-50/95 border-2 border-dashed border-[#800020] rounded-full flex items-center justify-center z-10"
        >
          <p className="text-sm font-semibold text-[#800020]">Drop an image to search</p>
          <button
            type="button"
            onClick={() => setShowImageDrop(false)}
            className="absolute right-3"
          >
            <X size={18} />
          </button>
        </div>
      )}
    </div>
  );
}
