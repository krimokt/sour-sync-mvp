'use client';

import React from 'react';
import { PricingTableData } from '@/types/website';
import { Check } from 'lucide-react';

interface PricingTableProps {
  data: PricingTableData;
  themeColor: string;
}

export default function PricingTable({ data, themeColor }: PricingTableProps) {
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

      <div className="grid md:grid-cols-3 gap-8">
        {data.plans?.map((plan) => (
          <div 
            key={plan.id} 
            className={`relative p-8 bg-white rounded-2xl border ${plan.isPopular ? 'border-2 shadow-xl scale-105 z-10' : 'border-gray-200 shadow-sm hover:shadow-md transition-shadow'}`}
            style={plan.isPopular ? { borderColor: plan.highlightColor || themeColor } : {}}
          >
            {plan.isPopular && (
              <div 
                className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 px-4 py-1 rounded-full text-sm font-medium text-white uppercase tracking-wider"
                style={{ backgroundColor: plan.highlightColor || themeColor }}
              >
                Most Popular
              </div>
            )}
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{plan.name}</h3>
            <p className="text-gray-500 text-sm mb-6">{plan.description}</p>
            <div className="flex items-baseline mb-8">
              <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
              {plan.period && <span className="text-gray-500 ml-2">/{plan.period}</span>}
            </div>
            <ul className="space-y-4 mb-8">
              {plan.features?.map((feature, i) => (
                <li key={i} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-500 shrink-0" />
                  <span className="text-gray-600 text-sm">{feature}</span>
                </li>
              ))}
            </ul>
            <a
              href={plan.buttonLink || '#'}
              className={`block w-full py-3 px-6 rounded-xl text-center font-medium transition-colors ${
                plan.isPopular 
                  ? 'text-white hover:opacity-90' 
                  : 'text-gray-900 bg-gray-100 hover:bg-gray-200'
              }`}
              style={plan.isPopular ? { backgroundColor: plan.highlightColor || themeColor } : {}}
            >
              {plan.buttonText || 'Get Started'}
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}

