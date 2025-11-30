'use client';

import React from 'react';
import { ImageWithTextData } from '@/types/website';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface ImageWithTextProps {
  data: ImageWithTextData;
  themeColor: string;
}

export default function ImageWithText({ data, themeColor }: ImageWithTextProps) {
  const { title, subtitle, content, image, imagePosition = 'left', buttonText, buttonLink } = data;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
      <div className={`flex flex-col lg:flex-row items-center gap-12 lg:gap-20 ${
        imagePosition === 'right' ? 'lg:flex-row-reverse' : ''
      }`}>
        {/* Image */}
        <div className="w-full lg:w-1/2">
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-lg bg-gray-100">
            {image ? (
              <img src={image} alt={title || ''} className="w-full h-full object-cover" />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">No Image</div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="w-full lg:w-1/2 space-y-6">
          <div>
            {subtitle && (
              <p className="text-sm font-bold uppercase tracking-wider mb-2" style={{ color: themeColor }}>
                {subtitle}
              </p>
            )}
            {title && (
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                {title}
              </h2>
            )}
          </div>
          
          {content && (
            <div className="text-lg text-gray-600 leading-relaxed" dangerouslySetInnerHTML={{ __html: content }} />
          )}

          {buttonText && (
            <div className="pt-4">
              <Link
                href={buttonLink || '#'}
                className="inline-flex items-center px-6 py-3 rounded-lg text-white font-medium transition-transform hover:scale-105"
                style={{ backgroundColor: themeColor }}
              >
                {buttonText}
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}




