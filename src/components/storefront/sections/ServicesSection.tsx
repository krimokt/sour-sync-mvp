import React from 'react';

interface ServicesSectionProps {
  data: Record<string, unknown>;
  _themeColor?: string;
}

interface ServiceItem {
  title: string;
  description: string;
  icon?: string;
}

export default function ServicesSection({ data, _themeColor = '#000000' }: ServicesSectionProps) {
  const items = (data.items as ServiceItem[]) || [];
  const themeColor = _themeColor;

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {items.map((item, index) => (
            <div key={index} className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div 
                className="w-12 h-12 rounded-lg flex items-center justify-center mb-6 text-white font-bold text-xl"
                style={{ backgroundColor: themeColor }}
              >
                {index + 1}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
              <p className="text-gray-600 leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
