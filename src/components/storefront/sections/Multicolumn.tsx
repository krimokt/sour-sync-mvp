'use client';

import React from 'react';
import { MulticolumnData } from '@/types/website';
import Link from 'next/link';
import * as Icons from 'lucide-react';

interface MulticolumnProps {
  data: MulticolumnData;
  themeColor: string;
}

export default function Multicolumn({ data, themeColor }: MulticolumnProps) {
  const { title, subtitle, columns, columnsDesktop = 3 } = data;

  const getGridCols = (cols: number) => {
    switch (cols) {
      case 2: return 'md:grid-cols-2';
      case 3: return 'md:grid-cols-3';
      case 4: return 'md:grid-cols-4';
      default: return 'md:grid-cols-3';
    }
  };

  // Dynamic icon rendering
  const renderIcon = (iconName: string) => {
    const Icon = (Icons as unknown as Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>>)[iconName];
    if (!Icon) return null;
    return <Icon className="w-8 h-8" style={{ color: themeColor }} />;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-12">
        {title && (
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {title}
          </h2>
        )}
        {subtitle && (
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {subtitle}
          </p>
        )}
      </div>

      <div className={`grid grid-cols-1 ${getGridCols(columnsDesktop || 3)} gap-8`}>
        {columns?.map((col) => (
          <div key={col.id} className="flex flex-col items-center text-center p-6 rounded-xl hover:bg-gray-50 transition-colors">
            {/* Media (Icon or Image) */}
            <div className="mb-6">
              {col.image ? (
                <div className="relative w-full aspect-video rounded-lg overflow-hidden mb-4">
                  <img src={col.image} alt={col.title || ''} className="object-cover w-full h-full" />
                </div>
              ) : col.icon ? (
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4 mx-auto">
                  {renderIcon(col.icon)}
                </div>
              ) : null}
            </div>

            {/* Content */}
            {col.title && (
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {col.title}
              </h3>
            )}
            {col.content && (
              <div className="text-gray-600 leading-relaxed mb-4 prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: col.content }} />
            )}

            {/* Button */}
            {col.buttonText && col.buttonLink && (
              <Link
                href={col.buttonLink}
                className="mt-auto inline-flex items-center text-sm font-medium hover:underline"
                style={{ color: themeColor }}
              >
                {col.buttonText} <Icons.ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

