'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { PromoBannerData } from '@/types/website';

interface PromoBannerProps {
  data: PromoBannerData;
  themeColor?: string;
}

export default function PromoBanner({ data, themeColor = '#000000' }: PromoBannerProps) {
  const banners = data.banners || [];
  const layout = data.layout || 'split';

  if (banners.length === 0) return null;

  if (layout === 'single' && banners[0]) {
    return <SingleBanner banner={banners[0]} themeColor={themeColor} />;
  }

  if (layout === 'triple' && banners.length >= 3) {
    return <TripleBanner banners={banners.slice(0, 3)} themeColor={themeColor} />;
  }

  // Default: Split layout
  return <SplitBanner banners={banners.slice(0, 2)} themeColor={themeColor} />;
}

// Single Banner Component
interface BannerItem {
  id: string;
  title: string;
  subtitle?: string;
  badge?: string;
  buttonText?: string;
  buttonLink?: string;
  image?: string;
  backgroundColor?: string;
  textColor?: string;
}

function SingleBanner({ banner }: { banner: BannerItem; themeColor?: string }) {
  return (
    <section className="py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <Link
          href={banner.buttonLink || '#'}
          className="group block relative overflow-hidden rounded-2xl aspect-[21/9] md:aspect-[3/1]"
          style={{ backgroundColor: banner.backgroundColor || '#f3f4f6' }}
        >
          {banner.image && (
            <img
              src={banner.image}
              alt={banner.title}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />
          <div className="relative h-full flex items-center p-8 md:p-12">
            <div className="text-white max-w-lg">
              {banner.badge && (
                <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium mb-4">
                  {banner.badge}
                </span>
              )}
              <h2 className="text-3xl md:text-5xl font-bold mb-4">
                {banner.title}
              </h2>
              {banner.subtitle && (
                <p className="text-lg text-white/90 mb-6">
                  {banner.subtitle}
                </p>
              )}
              {banner.buttonText && (
                <span 
                  className="inline-flex items-center gap-2 text-lg font-medium group-hover:gap-4 transition-all duration-300"
                >
                  {banner.buttonText}
                  <ArrowRight className="w-5 h-5" />
                </span>
              )}
            </div>
          </div>
        </Link>
      </div>
    </section>
  );
}

// Split Banner Component (2 banners side by side)
function SplitBanner({ banners }: { banners: BannerItem[]; themeColor?: string }) {
  const [banner1, banner2] = banners;

  return (
    <section className="py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-4 md:gap-6">
          {/* Banner 1 - Large Style */}
          {banner1 && (
            <Link
              href={banner1.buttonLink || '#'}
              className="group relative overflow-hidden rounded-2xl aspect-square md:aspect-[4/3]"
              style={{ backgroundColor: banner1.backgroundColor || '#fef3c7' }}
            >
              {banner1.image && (
                <img
                  src={banner1.image}
                  alt={banner1.title}
                  className="absolute right-0 bottom-0 h-full w-auto object-contain transition-transform duration-700 group-hover:scale-105"
                />
              )}
              <div className="relative h-full p-6 md:p-8 flex flex-col justify-between">
                <div>
                  {banner1.badge && (
                    <span className="inline-block px-3 py-1 bg-black/10 rounded-full text-sm font-medium mb-3" style={{ color: banner1.textColor || '#1f2937' }}>
                      {banner1.badge}
                    </span>
                  )}
                  <h2 className="text-2xl md:text-3xl font-bold" style={{ color: banner1.textColor || '#1f2937' }}>
                    {banner1.title}
                  </h2>
                  {banner1.subtitle && (
                    <p className="text-sm md:text-base mt-2 opacity-80" style={{ color: banner1.textColor || '#1f2937' }}>
                      {banner1.subtitle}
                    </p>
                  )}
                </div>
                {banner1.buttonText && (
                  <span 
                    className="inline-flex items-center gap-2 text-sm font-semibold group-hover:gap-3 transition-all duration-300 mt-4"
                    style={{ color: banner1.textColor || '#1f2937' }}
                  >
                    {banner1.buttonText}
                    <ArrowRight className="w-4 h-4" />
                  </span>
                )}
              </div>
            </Link>
          )}

          {/* Banner 2 - Different Style */}
          {banner2 && (
            <Link
              href={banner2.buttonLink || '#'}
              className="group relative overflow-hidden rounded-2xl aspect-square md:aspect-[4/3]"
              style={{ backgroundColor: banner2.backgroundColor || '#dbeafe' }}
            >
              {banner2.image && (
                <img
                  src={banner2.image}
                  alt={banner2.title}
                  className="absolute right-0 bottom-0 h-full w-auto object-contain transition-transform duration-700 group-hover:scale-105"
                />
              )}
              <div className="relative h-full p-6 md:p-8 flex flex-col justify-center">
                <div className="max-w-[60%]">
                  <h2 className="text-3xl md:text-4xl font-bold" style={{ color: banner2.textColor || '#1f2937' }}>
                    {banner2.title}
                  </h2>
                  {banner2.subtitle && (
                    <p className="text-sm md:text-base mt-2 opacity-80" style={{ color: banner2.textColor || '#1f2937' }}>
                      {banner2.subtitle}
                    </p>
                  )}
                  {banner2.buttonText && (
                    <span 
                      className="inline-flex items-center gap-2 text-sm font-semibold group-hover:gap-3 transition-all duration-300 mt-4"
                      style={{ color: banner2.textColor || '#1f2937' }}
                    >
                      {banner2.buttonText}
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  )}
                </div>
              </div>
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}

// Triple Banner Component
function TripleBanner({ banners }: { banners: BannerItem[]; themeColor?: string }) {
  return (
    <section className="py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-3 gap-4 md:gap-6">
          {banners.map((banner, index) => (
            <Link
              key={banner.id || index}
              href={banner.buttonLink || '#'}
              className="group relative overflow-hidden rounded-2xl aspect-[4/5]"
              style={{ backgroundColor: banner.backgroundColor || '#f3f4f6' }}
            >
              {banner.image && (
                <img
                  src={banner.image}
                  alt={banner.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="relative h-full p-6 flex flex-col justify-end text-white">
                {banner.badge && (
                  <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-medium mb-2 w-fit">
                    {banner.badge}
                  </span>
                )}
                <h3 className="text-xl font-bold">
                  {banner.title}
                </h3>
                {banner.subtitle && (
                  <p className="text-sm text-white/80 mt-1">
                    {banner.subtitle}
                  </p>
                )}
                {banner.buttonText && (
                  <span className="inline-flex items-center gap-2 text-sm font-medium mt-3 group-hover:gap-3 transition-all duration-300">
                    {banner.buttonText}
                    <ArrowRight className="w-4 h-4" />
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

