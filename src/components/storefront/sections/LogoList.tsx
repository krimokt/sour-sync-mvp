'use client';

import React from 'react';
import { LogoListData } from '@/types/website';
import Link from 'next/link';

interface LogoListProps {
  data: LogoListData;
  themeColor: string;
}

export default function LogoList({ data }: LogoListProps) {
  const { title, logos, grayscale = true } = data;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-gray-100">
      {title && (
        <p className="text-center text-sm font-medium text-gray-500 uppercase tracking-wider mb-8">
          {title}
        </p>
      )}

      <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
        {logos?.map((logo, index) => {
          const LogoImage = (
            <img
              src={logo.src}
              alt={logo.alt || 'Partner logo'}
              className={`h-12 md:h-16 w-auto object-contain transition-all duration-300 ${
                grayscale ? 'grayscale hover:grayscale-0 opacity-70 hover:opacity-100' : ''
              }`}
            />
          );

          return logo.link ? (
            <Link key={index} href={logo.link} target="_blank" rel="noopener noreferrer">
              {LogoImage}
            </Link>
          ) : (
            <div key={index}>{LogoImage}</div>
          );
        })}
      </div>
    </div>
  );
}

