'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useI18n } from '@/context/I18nContext';
import { useRouter } from 'next/navigation';
import {
  Menu, X, User, LogOut, ShieldCheck, Heart, Package, Sparkles,
  Languages, Gift,
} from 'lucide-react';
import { useState } from 'react';
import { SmartSearchBar } from './SmartSearchBar';

export function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const { locale, setLocale, t } = useI18n();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const toggleLocale = () => setLocale(locale === 'en' ? 'ur' : 'en');

  return (
    <nav className="sticky top-0 z-50 bg-gradient-to-r from-[#800020] to-[#e11d48] shadow-xl">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center gap-3">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <div className="text-xl md:text-2xl font-bold text-white">
              💍 <span className="text-[#d4a853]">Rukhsati</span>
            </div>
          </Link>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md">
            <SmartSearchBar className="w-full" />
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/sahara"
              className="text-white hover:text-[#d4a853] font-semibold text-sm flex items-center gap-1"
              title="Shaadi Sahara — Donation platform"
            >
              <Gift size={16} /> Sahara
            </Link>

            {isAuthenticated ? (
              <>
                <Link
                  href="/sell"
                  className="px-3 py-1.5 bg-[#d4a853] text-[#800020] rounded-lg font-bold hover:bg-white transition-all text-sm"
                >
                  ➕ {t('nav.sell')}
                </Link>

                <button
                  onClick={toggleLocale}
                  className="text-white hover:text-[#d4a853] p-1.5 rounded font-semibold text-xs border border-white/30"
                  title="Toggle language / زبان تبدیل کریں"
                >
                  <Languages size={14} className="inline mr-1" />
                  {locale === 'en' ? 'اردو' : 'EN'}
                </button>

                <div className="relative group">
                  <button className="text-white hover:text-[#d4a853] flex items-center gap-1.5 text-sm">
                    <User size={18} />
                    {user?.name?.split(' ')[0]}
                  </button>
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl hidden group-hover:block py-2">
                    <DropLink href="/my-wedding" icon={Sparkles} label={t('nav.my-wedding')} />
                    <DropLink href="/my-listings" icon={Package} label={t('nav.my-listings')} />
                    <DropLink href="/orders" icon={ShieldCheck} label={t('nav.orders')} />
                    <DropLink href="/verify" icon={ShieldCheck} label={t('nav.verify')} />
                    <DropLink href="/size-guide" icon={Heart} label={t('nav.size-guide')} />
                    {user?.role === 'admin' && (
                      <DropLink href="/admin" icon={ShieldCheck} label="Admin Panel" />
                    )}
                    <hr className="my-1" />
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100 flex items-center gap-2 text-sm"
                    >
                      <LogOut size={14} /> {t('nav.logout')}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <button
                  onClick={toggleLocale}
                  className="text-white hover:text-[#d4a853] p-1.5 rounded font-semibold text-xs border border-white/30"
                >
                  {locale === 'en' ? 'اردو' : 'EN'}
                </button>
                <Link href="/login" className="text-white hover:text-[#d4a853] font-semibold text-sm">
                  {t('nav.login')}
                </Link>
                <Link
                  href="/signup"
                  className="px-3 py-1.5 bg-[#d4a853] text-[#800020] rounded-lg font-bold hover:bg-white transition-all text-sm"
                >
                  {t('nav.signup')}
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-white hover:text-[#d4a853]"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile search always visible */}
        <div className="md:hidden mt-3">
          <SmartSearchBar />
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden mt-3 pb-2 space-y-1 border-t border-white/20 pt-3">
            <MobileLink href="/" label={t('nav.home')} />
            <MobileLink href="/sahara" label="🎁 Shaadi Sahara" />
            <MobileLink href="/size-guide" label={t('nav.size-guide')} />

            {isAuthenticated ? (
              <>
                <MobileLink href="/sell" label={`➕ ${t('nav.sell')}`} />
                <MobileLink href="/my-wedding" label={t('nav.my-wedding')} />
                <MobileLink href="/my-listings" label={t('nav.my-listings')} />
                <MobileLink href="/orders" label={t('nav.orders')} />
                <MobileLink href="/verify" label={t('nav.verify')} />
                {user?.role === 'admin' && <MobileLink href="/admin" label="Admin" />}
                <button
                  onClick={toggleLocale}
                  className="w-full text-left text-white hover:text-[#d4a853] py-2 font-semibold"
                >
                  🌐 {locale === 'en' ? 'اردو میں دیکھیں' : 'View in English'}
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full text-left text-white hover:text-[#d4a853] py-2 font-semibold"
                >
                  {t('nav.logout')}
                </button>
              </>
            ) : (
              <>
                <MobileLink href="/login" label={t('nav.login')} />
                <MobileLink href="/signup" label={t('nav.signup')} />
                <button
                  onClick={toggleLocale}
                  className="w-full text-left text-white hover:text-[#d4a853] py-2 font-semibold"
                >
                  🌐 {locale === 'en' ? 'اردو' : 'English'}
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

function DropLink({ href, icon: Icon, label }: { href: string; icon: typeof User; label: string }) {
  return (
    <Link href={href} className="block px-4 py-2 text-gray-800 hover:bg-gray-100 text-sm flex items-center gap-2">
      <Icon size={14} className="text-[#800020]" />
      {label}
    </Link>
  );
}

function MobileLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="block text-white hover:text-[#d4a853] py-2 font-semibold">
      {label}
    </Link>
  );
}
