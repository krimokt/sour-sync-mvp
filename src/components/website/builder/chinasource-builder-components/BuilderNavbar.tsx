'use client';

import React, { useEffect, useState } from 'react';
import { ArrowUpRight, LogIn, Menu, X } from 'lucide-react';
import type { FormData, GeneratedContent, ThemeColor } from '../chinasource-types';

const themeAccent: Record<ThemeColor, { hex: string }> = {
  amber:   { hex: '#f59e0b' },
  blue:    { hex: '#2563eb' },
  red:     { hex: '#dc2626' },
  emerald: { hex: '#059669' },
  indigo:  { hex: '#4f46e5' },
  zinc:    { hex: '#18181b' },
};

interface BuilderNavbarProps {
  data: FormData;
  content: GeneratedContent;
  companySlug: string;
  hideSidebar?: boolean;
  hasTopBar?: boolean;
  // When true (on sub-pages), in-page anchors route back to the home page
  linkToHome?: boolean;
}

export default function BuilderNavbar({
  data,
  content,
  companySlug,
  hideSidebar = true,
  hasTopBar = false,
  linkToHome = false,
}: BuilderNavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const accent = themeAccent[data.themeColor] || themeAccent.blue;
  const ctaColor = { hex: '#2596be', hover: '#1f7fa0' };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinks = [
    ...(content.products?.items?.length ? ['Products'] : []),
    'Solutions',
    'Process',
    'Certifications',
    'About',
    'Contact',
  ];

  const homeBase = linkToHome ? `/site/${companySlug}` : '';
  const signInHref = `/site/${companySlug}/signin`;
  const anchorHref = (label: string) => {
    if (label === 'Products') return `/site/${companySlug}/products`;
    return `${homeBase}#${label.toLowerCase()}`;
  };

  return (
    <>
      <nav
        className={`fixed ${hasTopBar ? 'top-16' : 'top-0'} ${!hideSidebar ? 'left-80' : 'left-0'} right-0 z-40 transition-all duration-300
          ${scrolled
            ? 'bg-white/85 backdrop-blur-xl backdrop-saturate-150 shadow-[0_1px_0_rgba(15,23,42,0.06),0_8px_24px_-12px_rgba(15,23,42,0.12)]'
            : 'bg-white/95 backdrop-blur-xl shadow-[0_1px_0_rgba(15,23,42,0.06)]'
          }`}
      >
        <div className="max-w-6xl mx-auto px-6 lg:px-10">
          <div className={`flex items-center justify-between transition-all duration-300 ${scrolled ? 'h-14' : 'h-20'}`}>
            <a href={`/site/${companySlug}`} className="group flex items-center gap-2.5 flex-shrink-0">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold transition-shadow"
                style={{
                  background: accent.hex,
                  boxShadow: `0 1px 0 rgba(255,255,255,0.18) inset, 0 4px 14px -4px ${accent.hex}66`,
                }}
              >
                {data.companyName.charAt(0).toUpperCase()}
              </div>
              <span className="font-semibold text-[15px] tracking-tight text-slate-900">
                {data.companyName}
              </span>
            </a>

            <div className="hidden lg:flex items-center gap-0.5">
              {navLinks.map(label => (
                <a
                  key={label}
                  href={anchorHref(label)}
                  className="relative px-3.5 py-2 rounded-lg text-[13.5px] font-medium transition-all duration-200 text-slate-600 hover:text-slate-900"
                  onMouseEnter={(e) => { e.currentTarget.style.background = `${accent.hex}10`; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = ''; }}
                >
                  {label}
                </a>
              ))}
            </div>

            <div className="hidden lg:flex items-center gap-2">
              <a
                href={signInHref}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[13.5px] font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 transition-colors"
              >
                <LogIn size={14} />
                Client Portal
              </a>
              <a
                href={linkToHome ? `/site/${companySlug}#contact` : '#contact'}
                className="group inline-flex items-center gap-1.5 hover:gap-3 text-white px-5 py-2 rounded-lg font-semibold text-[13.5px] transition-all duration-300 ease-in-out"
                style={{
                  background: ctaColor.hex,
                  boxShadow: `0 8px 18px -8px ${ctaColor.hex}99, 0 1px 0 rgba(255,255,255,0.22) inset`,
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = ctaColor.hover; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = ctaColor.hex; }}
              >
                Get a Quote
                <ArrowUpRight size={14} />
              </a>
            </div>

            <div className="flex lg:hidden items-center gap-2">
              <a
                href={signInHref}
                className="p-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                <LogIn size={18} />
              </a>
              <button
                onClick={() => setMobileOpen(v => !v)}
                className="p-2 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
                aria-label="Toggle menu"
              >
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {mobileOpen && (
        <div className={`fixed ${hasTopBar ? 'top-[calc(4rem+3.5rem)]' : 'top-14'} ${!hideSidebar ? 'left-80' : 'left-0'} right-0 z-39 bg-white border-b border-gray-100 shadow-lg`}>
          <div className="max-w-6xl mx-auto px-6 py-4 flex flex-col gap-1">
            {navLinks.map(label => (
              <a
                key={label}
                href={anchorHref(label)}
                onClick={() => setMobileOpen(false)}
                className="px-4 py-3 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
              >
                {label}
              </a>
            ))}
            <div className="h-px bg-gray-100 my-1" />
            <a
              href={signInHref}
              className="px-4 py-3 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <LogIn size={15} /> Client Portal
            </a>
            <a
              href={linkToHome ? `/site/${companySlug}#contact` : '#contact'}
              onClick={() => setMobileOpen(false)}
              className="mt-1 group flex items-center justify-center gap-2 hover:gap-4 text-white px-5 py-3 rounded-lg font-semibold text-sm transition-all duration-300 ease-in-out"
              style={{
                background: ctaColor.hex,
                boxShadow: `0 10px 24px -10px ${ctaColor.hex}99, 0 1px 0 rgba(255,255,255,0.22) inset`,
              }}
            >
              Get a Quote <ArrowUpRight size={14} />
            </a>
          </div>
        </div>
      )}
    </>
  );
}
