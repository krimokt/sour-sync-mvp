'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import { Menu, X, ShoppingBag } from 'lucide-react';

interface StoreHeaderProps {
  companyName?: string;
  logoUrl?: string;
  themeColor?: string;
}

export default function StoreHeader({ companyName, logoUrl, themeColor = '#3B82F6' }: StoreHeaderProps) {
  const params = useParams();
  const pathname = usePathname();
  const companySlug = params.companySlug as string;
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: `/site/${companySlug}`, label: 'Home' },
    { href: `/site/${companySlug}/products`, label: 'Products' },
    { href: `/site/${companySlug}/services`, label: 'Services' },
    { href: `/site/${companySlug}/track`, label: 'Track Order' },
  ];

  const isActive = (href: string) => {
    if (href === `/site/${companySlug}`) {
      return pathname === href;
    }
    return pathname?.startsWith(href);
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href={`/site/${companySlug}`} className="flex items-center gap-3">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={companyName || 'Store'}
                className="h-10 w-auto object-contain"
              />
            ) : (
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-lg"
                style={{ backgroundColor: themeColor }}
              >
                {(companyName || 'S').charAt(0).toUpperCase()}
              </div>
            )}
            <span className="text-xl font-semibold text-gray-900 hidden sm:block">
              {companyName || 'Store'}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors ${
                  isActive(link.href)
                    ? 'text-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                style={isActive(link.href) ? { color: themeColor } : {}}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {/* Checkout Button */}
            <Link
              href={`/site/${companySlug}/checkout`}
              className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors hover:opacity-90"
              style={{ backgroundColor: themeColor }}
            >
              <ShoppingBag className="w-4 h-4" />
              Checkout
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6 text-gray-600" />
              ) : (
                <Menu className="w-6 h-6 text-gray-600" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <nav className="lg:hidden py-4 border-t border-gray-100">
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive(link.href)
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href={`/site/${companySlug}/checkout`}
                className="mt-2 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors"
                style={{ backgroundColor: themeColor }}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <ShoppingBag className="w-4 h-4" />
                Checkout
              </Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
