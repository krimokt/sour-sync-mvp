'use client';

import React from 'react';
import Link from 'next/link';
import { HeaderData } from '@/types/website';
import { Search, ShoppingBag, User, Menu, Phone, Mail } from 'lucide-react';

interface HeaderSectionProps {
  data: HeaderData;
  themeColor: string;
}

export default function HeaderSection({ data, themeColor }: HeaderSectionProps) {
  const menuStyle = data.menuStyle || 'minimal';
  const isSticky = data.stickyHeader;

  // Common Elements
  const Logo = () => (
    <Link href="/" className="flex items-center gap-2">
      {data.logo ? (
        <img src={data.logo.src} alt={data.logo.alt || 'Logo'} className="h-10 w-auto object-contain" />
      ) : (
        <span className="text-xl font-bold">Store Name</span>
      )}
    </Link>
  );

  const Navigation = ({ className = '' }: { className?: string }) => (
    <nav className={`hidden md:flex items-center gap-8 ${className}`}>
      {data.navigation?.map((item, i) => (
        <Link 
          key={i} 
          href={item.link} 
          className="text-sm font-medium text-gray-700 hover:text-black transition-colors"
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );

  const Actions = ({ className = '' }: { className?: string }) => (
    <div className={`flex items-center gap-4 ${className}`}>
      {data.showSearch && (
        <button className="text-gray-700 hover:text-black">
          <Search className="w-5 h-5" />
        </button>
      )}
      {data.showAccount && (
        <Link href="/account" className="text-gray-700 hover:text-black">
          <User className="w-5 h-5" />
        </Link>
      )}
      {data.showCart && (
        <Link href="/cart" className="text-gray-700 hover:text-black relative">
          <ShoppingBag className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-black text-white text-[10px] flex items-center justify-center rounded-full">0</span>
        </Link>
      )}
      {data.ctaText && (
        <Link 
          href={data.ctaLink || '#'}
          className="hidden md:inline-flex px-5 py-2 rounded-full text-sm font-medium text-white transition-transform hover:scale-105"
          style={{ backgroundColor: themeColor }}
        >
          {data.ctaText}
        </Link>
      )}
      <button className="md:hidden text-gray-700">
        <Menu className="w-6 h-6" />
      </button>
    </div>
  );

  const wrapperClasses = `w-full bg-white z-50 border-b border-gray-100 transition-all ${isSticky ? 'sticky top-0 shadow-sm' : 'relative'}`;

  // Render based on Template
  const renderTemplate = () => {
    switch (menuStyle) {
      case 'split': // Template 2: Split Navigation
        return (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
            <div className="flex items-center gap-12">
              <Logo />
            </div>
            <div className="flex items-center gap-8">
              <Navigation />
              <div className="h-6 w-px bg-gray-200 hidden md:block" />
              <Actions />
            </div>
          </div>
        );

      case 'centered': // Template 3: Centered Logo
        return (
          <div className="flex flex-col">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full h-20 flex items-center justify-between relative">
              <div className="w-1/3">
                <button className="text-gray-700 md:hidden">
                  <Menu className="w-6 h-6" />
                </button>
                <div className="hidden md:block">
                  {data.showSearch && (
                    <button className="flex items-center gap-2 text-sm text-gray-500 hover:text-black">
                      <Search className="w-4 h-4" />
                      <span>Search</span>
                    </button>
                  )}
                </div>
              </div>
              <div className="flex justify-center w-1/3">
                <Logo />
              </div>
              <div className="w-1/3 flex justify-end">
                <Actions />
              </div>
            </div>
            <div className="hidden md:flex justify-center py-4 border-t border-gray-100">
              <Navigation />
            </div>
          </div>
        );

      case 'logistics': // Template 4: Logo + Contact Strip
        return (
          <div className="flex flex-col">
            {/* Top Contact Strip */}
            <div className="bg-gray-900 text-white py-2 px-4">
              <div className="max-w-7xl mx-auto flex justify-between items-center text-xs">
                <div className="flex items-center gap-6">
                  {data.contactPhone && (
                    <a href={`tel:${data.contactPhone}`} className="flex items-center gap-2 hover:text-gray-300">
                      <Phone className="w-3 h-3" />
                      {data.contactPhone}
                    </a>
                  )}
                  {data.contactEmail && (
                    <a href={`mailto:${data.contactEmail}`} className="flex items-center gap-2 hover:text-gray-300">
                      <Mail className="w-3 h-3" />
                      {data.contactEmail}
                    </a>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <Link href="/track-order" className="hover:text-gray-300">Track Order</Link>
                  <Link href="/support" className="hover:text-gray-300">Support</Link>
                </div>
              </div>
            </div>
            {/* Main Header */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 w-full flex items-center justify-between">
              <Logo />
              <Navigation />
              <Actions />
            </div>
          </div>
        );

      case 'minimal': // Template 1: Minimal Left Logo (Default)
      default:
        return (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
            <div className="flex items-center gap-12">
              <Logo />
              <Navigation />
            </div>
            <Actions />
          </div>
        );
    }
  };

  return (
    <header className={wrapperClasses}>
      {renderTemplate()}
    </header>
  );
}



