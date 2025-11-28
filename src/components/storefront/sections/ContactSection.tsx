import React from 'react';

interface ContactSectionProps {
  data: Record<string, unknown>;
  _themeColor?: string;
}

export default function ContactSection({ data }: ContactSectionProps) {
  const email = data.email as string | undefined;
  const phone = data.phone as string | undefined;
  const address = data.address as string | undefined;
  const mapUrl = data.mapUrl as string | undefined;

  return (
    <section className="py-16 bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-12">Get in Touch</h2>
        
        <div className="flex flex-wrap justify-center gap-8 md:gap-16">
          {email && (
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4 text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="font-medium text-gray-900 mb-1">Email</h3>
              <a href={`mailto:${email}`} className="text-gray-600 hover:text-gray-900 transition-colors">
                {email}
              </a>
            </div>
          )}

          {phone && (
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4 text-gray-600">
                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <h3 className="font-medium text-gray-900 mb-1">Phone</h3>
              <a href={`tel:${phone}`} className="text-gray-600 hover:text-gray-900 transition-colors">
                {phone}
              </a>
            </div>
          )}

          {address && (
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4 text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="font-medium text-gray-900 mb-1">Address</h3>
              <p className="text-gray-600 max-w-xs">
                {address}
              </p>
            </div>
          )}
        </div>

        {mapUrl && (
          <div className="mt-12 rounded-xl overflow-hidden shadow-lg h-64 md:h-96">
            <iframe 
              src={mapUrl} 
              width="100%" 
              height="100%" 
              style={{ border: 0 }} 
              allowFullScreen 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        )}
      </div>
    </section>
  );
}
