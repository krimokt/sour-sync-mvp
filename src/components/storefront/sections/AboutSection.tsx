import React from 'react';

interface AboutSectionProps {
  data: Record<string, unknown>;
  _themeColor?: string;
}

export default function AboutSection({ data }: AboutSectionProps) {
  const title = data.title as string;
  const content = data.content as string;
  const imageUrl = data.imageUrl as string | undefined;

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="order-2 lg:order-1">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              {title}
            </h2>
            <div className="prose prose-lg text-gray-600 whitespace-pre-line">
              {content}
            </div>
          </div>
          
          {imageUrl && (
            <div className="order-1 lg:order-2 relative h-64 md:h-96 rounded-2xl overflow-hidden shadow-lg">
              <img 
                src={imageUrl} 
                alt={title}
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
