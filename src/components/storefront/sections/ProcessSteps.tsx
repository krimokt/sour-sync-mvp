'use client';

import React from 'react';
import { ProcessStepsData } from '@/types/website';

interface ProcessStepsProps {
  data: ProcessStepsData;
  themeColor: string;
}

export default function ProcessSteps({ data, themeColor }: ProcessStepsProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-16">
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

      <div className="grid md:grid-cols-4 gap-8 relative">
        {/* Connecting Line (Desktop only) */}
        <div className="hidden md:block absolute top-8 left-0 w-full h-0.5 bg-gray-200 -z-10" />

        {data.steps?.map((step, index) => (
          <div key={index} className="relative flex flex-col items-center text-center">
            <div 
              className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white mb-6 border-4 border-white shadow-sm"
              style={{ backgroundColor: themeColor }}
            >
              {step.number || index + 1}
            </div>
            {step.image && (
              <div className="w-full aspect-video rounded-lg overflow-hidden mb-6 bg-gray-100">
                <img src={step.image} alt={step.title} className="w-full h-full object-cover" />
              </div>
            )}
            <h3 className="text-xl font-semibold text-gray-900 mb-3">{step.title}</h3>
            <p className="text-gray-600 text-sm leading-relaxed">{step.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}



