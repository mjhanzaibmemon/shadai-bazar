'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Search, Menu, X, User, LogOut } from 'lucide-react';
import { useState } from 'react';

export function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <nav className="sticky top-0 z-50 bg-gradient-to-r from-[#800020] to-[#e11d48] shadow-xl">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center gap-4">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <div className="text-2xl font-bold text-white">
              💍 <span className="text-[#d4a853]">Shaadi</span> Bazaar
            </div>
          </Link>

          {/* Search Bar - Hidden on mobile */}
          <form
            onSubmit={handleSearch}
            className="hidden md:flex flex-1 max-w-md bg-white rounded-full overflow-hidden"
          >
            <input
              type="text"
              placeholder="Search listings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-4 py-2 outline-none text-gray-800"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-[#800020] text-white hover:bg-[#e11d48] transition-colors"
            >
              <Search size={20} />
            </button>
          </form>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            {isAuthenticated ? (
              <>
                <Link
                  href="/sell"
                  className="px-4 py-2 bg-[#d4a853] text-white rounded-lg font-semibold hover:bg-white hover:text-[#800020] transition-all"
                >
                  ➕ Sell
                </Link>
                <Link
                  href="/my-listings"
                  className="text-white hover:text-[#d4a853] transition-colors"
                >
                  My Ads
                </Link>
                <div className="relative group">
                  <button className="text-white hover:text-[#d4a853] transition-colors flex items-center gap-2">
                    <User size={20} />
                    {user?.name}
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl hidden group-hover:block">
                    <Link href="/profile" className="block px-4 py-2 text-gray-800 hover:bg-gray-100">
                      Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100 flex items-center gap-2"
                    >
                      <LogOut size={16} /> Logout
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-white hover:text-[#d4a853] font-semibold transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="px-4 py-2 bg-[#d4a853] text-white rounded-lg font-semibold hover:bg-white hover:text-[#800020] transition-all"
                >
                  Sign Up
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

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden mt-4 space-y-2">
            <form onSubmit={handleSearch} className="flex gap-2 mb-4">
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-3 py-2 rounded-lg text-gray-800"
              />
              <button type="submit" className="bg-white px-3 py-2 rounded-lg">
                <Search size={18} className="text-[#800020]" />
              </button>
            </form>

            {isAuthenticated ? (
              <>
                <Link href="/" className="block text-white hover:text-[#d4a853] py-2">
                  Home
                </Link>
                <Link href="/sell" className="block text-white hover:text-[#d4a853] py-2">
                  ➕ Sell Item
                </Link>
                <Link href="/my-listings" className="block text-white hover:text-[#d4a853] py-2">
                  My Ads
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left text-white hover:text-[#d4a853] py-2"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="block text-white hover:text-[#d4a853] py-2">
                  Login
                </Link>
                <Link href="/signup" className="block text-white hover:text-[#d4a853] py-2">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
