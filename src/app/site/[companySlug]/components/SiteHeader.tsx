'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface Company {
  name: string;
  slug: string;
  logo_url: string | null;
  website_settings: {
    theme_color?: string;
  } | null;
}

interface SiteHeaderProps {
  company: Company;
}

export default function SiteHeader({ company }: SiteHeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const themeColor = company.website_settings?.theme_color || '#3B82F6';

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href={`/site/${company.slug}`} className="flex items-center gap-3">
            {company.logo_url ? (
              <Image
                src={company.logo_url}
                alt={company.name}
                width={40}
                height={40}
                className="rounded-lg object-cover"
              />
            ) : (
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-lg"
                style={{ backgroundColor: themeColor }}
              >
                {company.name.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="text-xl font-semibold text-gray-900">
              {company.name}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link 
              href={`/site/${company.slug}`}
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Home
            </Link>
            <Link 
              href={`/site/${company.slug}/products`}
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Products
            </Link>
            <Link 
              href={`/site/${company.slug}/products`}
              className="px-4 py-2 rounded-lg text-white transition-colors"
              style={{ backgroundColor: themeColor }}
            >
              Browse Catalog
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <nav className="md:hidden py-4 border-t border-gray-100">
            <div className="flex flex-col gap-4">
              <Link 
                href={`/site/${company.slug}`}
                className="text-gray-600 hover:text-gray-900 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                href={`/site/${company.slug}/products`}
                className="text-gray-600 hover:text-gray-900 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Products
              </Link>
              <Link 
                href={`/site/${company.slug}/products`}
                className="px-4 py-2 rounded-lg text-white text-center transition-colors"
                style={{ backgroundColor: themeColor }}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Browse Catalog
              </Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}




