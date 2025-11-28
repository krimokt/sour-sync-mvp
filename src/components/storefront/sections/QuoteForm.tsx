'use client';

import React from 'react';
import { QuoteFormData } from '@/types/website';

interface QuoteFormProps {
  data: QuoteFormData;
  themeColor: string;
}

export default function QuoteForm({ data, themeColor }: QuoteFormProps) {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 md:p-12">
        <div className="text-center mb-10">
          {data.title && (
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {data.title}
            </h2>
          )}
          {data.subtitle && (
            <p className="text-gray-600">
              {data.subtitle}
            </p>
          )}
        </div>

        <form className="space-y-6">
          {data.fields?.map((field, index) => (
            <div key={index}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {field.label} {field.required && <span className="text-red-500">*</span>}
              </label>
              
              {field.type === 'textarea' ? (
                <textarea
                  name={field.name}
                  required={field.required}
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:border-transparent outline-none transition-shadow"
                  style={{ '--tw-ring-color': themeColor } as React.CSSProperties}
                />
              ) : field.type === 'select' ? (
                <select
                  name={field.name}
                  required={field.required}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:border-transparent outline-none transition-shadow bg-white"
                  style={{ '--tw-ring-color': themeColor } as React.CSSProperties}
                >
                  <option value="">Select an option</option>
                  {field.options?.map((opt, i) => (
                    <option key={i} value={opt}>{opt}</option>
                  ))}
                </select>
              ) : (
                <input
                  type={field.type}
                  name={field.name}
                  required={field.required}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:border-transparent outline-none transition-shadow"
                  style={{ '--tw-ring-color': themeColor } as React.CSSProperties}
                />
              )}
            </div>
          ))}

          <button
            type="submit"
            className="w-full py-4 px-6 rounded-xl text-white font-medium text-lg transition-transform hover:scale-[1.02] active:scale-[0.98]"
            style={{ backgroundColor: themeColor }}
          >
            {data.submitText || 'Request Quote'}
          </button>
        </form>
      </div>
    </div>
  );
}

