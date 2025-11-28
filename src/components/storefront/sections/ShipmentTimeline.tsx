'use client';

import React from 'react';
import { ShipmentTimelineData } from '@/types/website';
import { CheckCircle2, Circle, Clock, Package } from 'lucide-react';

interface ShipmentTimelineProps {
  data: ShipmentTimelineData;
  themeColor: string;
}

export default function ShipmentTimeline({ data, themeColor }: ShipmentTimelineProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {data.title && (
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          {data.title}
        </h2>
      )}
      <div className="relative">
        {/* Line */}
        <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gray-200" />
        
        <div className="space-y-12">
          {data.steps?.map((step, index) => {
            const isEven = index % 2 === 0;
            const Icon = step.status === 'completed' ? CheckCircle2 : 
                        step.status === 'current' ? Clock : Circle;
            
            return (
              <div key={index} className={`relative flex items-center ${isEven ? 'flex-row' : 'flex-row-reverse'}`}>
                {/* Content */}
                <div className={`w-1/2 ${isEven ? 'pr-8 text-right' : 'pl-8 text-left'}`}>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
                
                {/* Icon Node */}
                <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center justify-center w-10 h-10 rounded-full bg-white border-4 border-gray-100 shadow-sm z-10">
                  <Icon 
                    className={`w-6 h-6 ${
                      step.status === 'completed' ? 'text-green-500' : 
                      step.status === 'current' ? 'text-blue-500' : 'text-gray-300'
                    }`}
                    style={step.status === 'current' ? { color: themeColor } : {}}
                  />
                </div>
                
                {/* Spacer for opposite side */}
                <div className="w-1/2" />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

