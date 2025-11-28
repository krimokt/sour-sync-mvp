import React from 'react';
import Link from 'next/link';

interface HeroSectionProps {
  data: Record<string, unknown>;
  _themeColor?: string;
}

export default function HeroSection({ data, _themeColor = '#000000' }: HeroSectionProps) {
  const title = data.title as string;
  const subtitle = data.subtitle as string;
  const imageUrl = data.imageUrl as string | undefined;
  const buttonLabel = data.buttonLabel as string | undefined;
  const buttonLink = data.buttonLink as string | undefined;
  const themeColor = _themeColor;
  return (
    <section className="relative bg-gray-900 text-white py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {imageUrl && (
        <div className="absolute inset-0 z-0">
          <img 
            src={imageUrl} 
            alt={title} 
            className="w-full h-full object-cover opacity-40"
          />
        </div>
      )}
      <div className="relative z-10 max-w-7xl mx-auto text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
          {title}
        </h1>
        <p className="text-xl md:text-2xl text-gray-300 mb-10 max-w-3xl mx-auto">
          {subtitle}
        </p>
        {buttonLabel && (
          <Link
            href={buttonLink || '/products'}
            className="inline-flex items-center px-8 py-4 rounded-lg text-lg font-medium transition-transform hover:scale-105"
            style={{ backgroundColor: themeColor }}
          >
            {buttonLabel}
          </Link>
        )}
      </div>
    </section>
  );
}


