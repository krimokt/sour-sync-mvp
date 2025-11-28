'use client';

import React from 'react';
import Link from 'next/link';
import { HeroBannerData } from '@/types/website';
import { ArrowRight } from 'lucide-react';

interface HeroBannerProps {
  data: HeroBannerData;
  themeColor: string;
}

export default function HeroBanner({ data, themeColor }: HeroBannerProps) {
  const {
    title = 'Welcome',
    subtitle,
    buttonText,
    buttonLink,
    secondaryButtonText,
    secondaryButtonLink,
    image,
    imagePosition = 'background',
    textAlignment = 'center',
    overlayColor = '#000000',
    overlayOpacity = 0.5,
  } = data;

  const isBackground = imagePosition === 'background';
  const isRight = imagePosition === 'right';

  // Background Image Layout
  if (isBackground) {
    return (
      <div className="relative flex items-center justify-center overflow-hidden min-h-[400px] md:min-h-[600px]">
        {/* Background Image */}
        {image && (
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${image})` }}
          />
        )}

        {/* Overlay */}
        <div 
          className="absolute inset-0"
          style={{ backgroundColor: overlayColor, opacity: overlayOpacity }}
        />

        {/* Content */}
        <div className={`relative z-10 container mx-auto px-4 py-20 text-${textAlignment} text-white`}>
          <h2 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            {title}
          </h2>
          {subtitle && (
            <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto opacity-90">
              {subtitle}
            </p>
          )}
          
          <div className={`flex flex-wrap gap-4 ${
            textAlignment === 'center' ? 'justify-center' : 
            textAlignment === 'right' ? 'justify-end' : 'justify-start'
          }`}>
            {buttonText && buttonLink && (
              <Link 
                href={buttonLink}
                className="inline-flex items-center px-8 py-3 rounded-md font-medium transition-transform hover:scale-105"
                style={{ backgroundColor: themeColor, color: '#ffffff' }}
              >
                {buttonText}
              </Link>
            )}
            {secondaryButtonText && secondaryButtonLink && (
              <Link 
                href={secondaryButtonLink}
                className="inline-flex items-center px-8 py-3 rounded-md font-medium bg-white text-gray-900 hover:bg-gray-100 transition-colors"
              >
                {secondaryButtonText}
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Split Layout (Left/Right)
  return (
    <div className="container mx-auto px-4 py-12 md:py-20">
      <div className={`flex flex-col md:flex-row items-center gap-8 md:gap-16 ${isRight ? 'md:flex-row-reverse' : ''}`}>
        {/* Image */}
        <div className="w-full md:w-1/2">
          {image ? (
            <img 
              src={image} 
              alt={title} 
              className="w-full h-auto rounded-lg shadow-lg object-cover aspect-[4/3]"
            />
          ) : (
            <div className="w-full aspect-[4/3] bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
              No Image
            </div>
          )}
        </div>

        {/* Content */}
        <div className={`w-full md:w-1/2 text-${textAlignment}`}>
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
            {title}
          </h2>
          {subtitle && (
            <p className="text-lg text-gray-600 mb-8">
              {subtitle}
            </p>
          )}
          
          <div className={`flex flex-wrap gap-4 ${
            textAlignment === 'center' ? 'justify-center' : 
            textAlignment === 'right' ? 'justify-end' : 'justify-start'
          }`}>
            {buttonText && buttonLink && (
              <Link 
                href={buttonLink}
                className="inline-flex items-center px-8 py-3 rounded-md font-medium text-white transition-transform hover:scale-105"
                style={{ backgroundColor: themeColor }}
              >
                {buttonText}
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            )}
            {secondaryButtonText && secondaryButtonLink && (
              <Link 
                href={secondaryButtonLink}
                className="inline-flex items-center px-8 py-3 rounded-md font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
              >
                {secondaryButtonText}
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

