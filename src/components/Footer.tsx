'use client';

import Link from 'next/link';
import { Mail, Phone, MapPin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gradient-to-r from-[#1a1a1a] to-[#2d2d2d] text-white mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <h3 className="text-2xl font-bold mb-4">
              💍 <span className="text-[#d4a853]">Shaadi</span> Bazaar
            </h3>
            <p className="text-gray-400">
              Pakistan's premier marketplace for wedding and occasion wear. Buy and sell at 40-70% cheaper prices.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4 text-[#d4a853]">Quick Links</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/search" className="hover:text-white transition-colors">
                  Browse Listings
                </Link>
              </li>
              <li>
                <Link href="/sell" className="hover:text-white transition-colors">
                  Sell an Item
                </Link>
              </li>
              <li>
                <Link href="/sahara" className="hover:text-white transition-colors flex items-center gap-1">
                  🎁 Shaadi Sahara
                </Link>
              </li>
              <li>
                <Link href="/verify" className="hover:text-white transition-colors flex items-center gap-1">
                  🛡️ Get Verified
                </Link>
              </li>
              <li>
                <Link href="/my-wedding" className="hover:text-white transition-colors">
                  My Wedding
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-semibold mb-4 text-[#d4a853]">Categories</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link href="/category/bridal" className="hover:text-white transition-colors">
                  Bridal Wear
                </Link>
              </li>
              <li>
                <Link href="/category/groom" className="hover:text-white transition-colors">
                  Groom Wear
                </Link>
              </li>
              <li>
                <Link href="/category/guest-women" className="hover:text-white transition-colors">
                  Guest — Women
                </Link>
              </li>
              <li>
                <Link href="/category/guest-men" className="hover:text-white transition-colors">
                  Guest — Men
                </Link>
              </li>
              <li>
                <Link href="/category/jewelry" className="hover:text-white transition-colors">
                  Jewelry
                </Link>
              </li>
              <li>
                <Link href="/size-guide" className="hover:text-white transition-colors">
                  📏 Size Guide
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4 text-[#d4a853]">Get in Touch</h4>
            <div className="space-y-2 text-gray-400 mb-4">
              <p>📧 support@rukhsati.pk</p>
              <p>📱 +92 300 1234567</p>
              <p>🕐 Mon-Fri: 10 AM - 6 PM</p>
            </div>
            <div className="flex gap-4">
              <a href="mailto:support@rukhsati.pk" className="hover:text-[#d4a853] transition-colors" aria-label="Email">
                <Mail size={20} />
              </a>
              <a href="tel:+923001234567" className="hover:text-[#d4a853] transition-colors" aria-label="Phone">
                <Phone size={20} />
              </a>
              <a href="#" className="hover:text-[#d4a853] transition-colors" aria-label="Location">
                <MapPin size={20} />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 pt-8 flex flex-col md:flex-row justify-between items-center text-gray-400 text-sm">
          <p>&copy; 2024 Rukhsati. All rights reserved.</p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <Link href="#" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="#" className="hover:text-white transition-colors">
              Terms & Conditions
            </Link>
            <Link href="#" className="hover:text-white transition-colors">
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
