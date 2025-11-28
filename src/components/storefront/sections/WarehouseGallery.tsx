'use client';

import React from 'react';
import { WarehouseGalleryData } from '@/types/website';

interface WarehouseGalleryProps {
  data: WarehouseGalleryData;
  themeColor: string;
}

export default function WarehouseGallery({ data }: WarehouseGalleryProps) {
  const columns = data.columns || 3;

  const getGridCols = (cols: number) => {
    switch (cols) {
      case 2: return 'md:grid-cols-2';
      case 3: return 'md:grid-cols-3';
      case 4: return 'md:grid-cols-4';
      default: return 'md:grid-cols-3';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-12">
        {data.title && (
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {data.title}
          </h2>
        )}
        {data.subtitle && (
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {data.subtitle}
          </p>
        )}
      </div>

      <div className={`grid grid-cols-1 ${getGridCols(columns)} gap-6`}>
        {data.images?.map((img, i) => (
          <div key={i} className="group relative aspect-[4/3] rounded-xl overflow-hidden bg-gray-100">
            <img 
              src={img.src} 
              alt={img.alt || 'Gallery image'} 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            {(img.caption) && (
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                <p className="text-white font-medium">{img.caption}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

