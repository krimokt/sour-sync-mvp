'use client';

import React from 'react';
import { ContactInfoData } from '@/types/website';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';

interface ContactInfoProps {
  data: ContactInfoData;
  themeColor: string;
}

export default function ContactInfo({ data, themeColor }: ContactInfoProps) {
  const {
    title = 'Get in Touch',
    email,
    phone,
    address,
    hours,
    showMap = true,
    mapUrl
  } = data;

  return (
    <div className="container mx-auto px-4">
      <div className="flex flex-col lg:flex-row gap-12">
        {/* Contact Details */}
        <div className={`flex-1 ${!showMap ? 'text-center lg:text-left' : ''}`}>
          <h2 className="text-3xl font-bold mb-8 text-gray-900">{title}</h2>
          
          <div className="space-y-6">
            {address && (
              <div className="flex items-start gap-4">
                <div className="shrink-0 w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                  <MapPin className="w-5 h-5" style={{ color: themeColor }} />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-1">Visit Us</h3>
                  <p className="text-gray-600 whitespace-pre-line">{address}</p>
                </div>
              </div>
            )}

            {email && (
              <div className="flex items-start gap-4">
                <div className="shrink-0 w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                  <Mail className="w-5 h-5" style={{ color: themeColor }} />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-1">Email Us</h3>
                  <a href={`mailto:${email}`} className="text-gray-600 hover:text-gray-900 transition-colors">
                    {email}
                  </a>
                </div>
              </div>
            )}

            {phone && (
              <div className="flex items-start gap-4">
                <div className="shrink-0 w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                  <Phone className="w-5 h-5" style={{ color: themeColor }} />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-1">Call Us</h3>
                  <a href={`tel:${phone}`} className="text-gray-600 hover:text-gray-900 transition-colors">
                    {phone}
                  </a>
                </div>
              </div>
            )}

            {hours && (
              <div className="flex items-start gap-4">
                <div className="shrink-0 w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                  <Clock className="w-5 h-5" style={{ color: themeColor }} />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-1">Opening Hours</h3>
                  <p className="text-gray-600 whitespace-pre-line">{hours}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Map */}
        {showMap && (
          <div className="flex-1 h-[400px] bg-gray-100 rounded-2xl overflow-hidden relative">
            {mapUrl ? (
              <iframe
                src={mapUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <MapPin className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Map will appear here</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}





