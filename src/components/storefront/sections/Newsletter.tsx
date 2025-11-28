'use client';

import React from 'react';
import { NewsletterData } from '@/types/website';
import { Mail } from 'lucide-react';

interface NewsletterProps {
  data: NewsletterData;
  themeColor: string;
}

export default function Newsletter({ data, themeColor }: NewsletterProps) {
  const {
    title = 'Subscribe to our newsletter',
    subtitle = 'Get the latest updates and offers.',
    buttonText = 'Subscribe',
    placeholder = 'Enter your email',
    image,
    layout = 'simple' // simple, with-image, full-width
  } = data;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle newsletter subscription
    alert('Thanks for subscribing!');
  };

  if (layout === 'with-image' && image) {
    return (
      <div className="container mx-auto px-4">
        <div className="bg-gray-50 rounded-2xl overflow-hidden">
          <div className="flex flex-col md:flex-row">
            <div className="md:w-1/2 relative h-64 md:h-auto">
              <img 
                src={image} 
                alt={title} 
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
            <div className="md:w-1/2 p-8 md:p-16 flex flex-col justify-center">
              <h2 className="text-3xl font-bold mb-4 text-gray-900">{title}</h2>
              {subtitle && <p className="text-gray-600 mb-8">{subtitle}</p>}
              
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <input
                  type="email"
                  placeholder={placeholder}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:border-transparent outline-none transition-shadow"
                  style={{ ['--tw-ring-color' as any]: themeColor }}
                  required
                />
                <button
                  type="submit"
                  className="px-6 py-3 rounded-lg font-medium text-white transition-opacity hover:opacity-90 w-full sm:w-auto"
                  style={{ backgroundColor: themeColor }}
                >
                  {buttonText}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4">
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-6">
          <Mail className="w-6 h-6 text-gray-600" />
        </div>
        
        <h2 className="text-3xl font-bold mb-4 text-gray-900">{title}</h2>
        {subtitle && <p className="text-gray-600 mb-8">{subtitle}</p>}

        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
          <input
            type="email"
            placeholder={placeholder}
            className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:border-transparent outline-none transition-shadow"
            style={{ ['--tw-ring-color' as any]: themeColor }}
            required
          />
          <button
            type="submit"
            className="px-6 py-3 rounded-lg font-medium text-white transition-opacity hover:opacity-90 whitespace-nowrap"
            style={{ backgroundColor: themeColor }}
          >
            {buttonText}
          </button>
        </form>
      </div>
    </div>
  );
}

