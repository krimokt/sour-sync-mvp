'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Instagram, Twitter, Facebook, ChevronLeft, ChevronRight } from 'lucide-react';
import { AnnouncementBarData } from '@/types/website';

interface AnnouncementBarProps {
  data: AnnouncementBarData;
  themeColor?: string;
}

const socialIcons: Record<string, React.ElementType> = {
  instagram: Instagram,
  twitter: Twitter,
  facebook: Facebook,
};

export default function AnnouncementBar({ data, themeColor = '#ffffff' }: AnnouncementBarProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const announcements = data.announcements || [];

  // Auto-rotate announcements
  useEffect(() => {
    if (!data.autoRotate || announcements.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % announcements.length);
    }, data.rotationSpeed || 4000);
    return () => clearInterval(interval);
  }, [data.autoRotate, data.rotationSpeed, announcements.length]);

  const nextAnnouncement = () => {
    setCurrentIndex((prev) => (prev + 1) % announcements.length);
  };

  const prevAnnouncement = () => {
    setCurrentIndex((prev) => (prev - 1 + announcements.length) % announcements.length);
  };

  if (announcements.length === 0) return null;

  return (
    <div className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-2 text-sm">
          {/* Social Links (Left) */}
          {data.showSocialLinks && data.socialLinks && data.socialLinks.length > 0 && (
            <div className="hidden md:flex items-center gap-4">
              {data.socialLinks.map((social, index) => {
                const IconComponent = socialIcons[social.platform.toLowerCase()];
                return IconComponent ? (
                  <Link
                    key={index}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white/80 hover:text-white transition-colors"
                    aria-label={social.platform}
                  >
                    <IconComponent className="w-4 h-4" />
                  </Link>
                ) : null;
              })}
            </div>
          )}

          {/* Announcements (Center) */}
          <div className="flex-1 flex items-center justify-center">
            {announcements.length > 1 && (
              <button
                onClick={prevAnnouncement}
                className="p-1 text-white/60 hover:text-white transition-colors mr-2"
                aria-label="Previous announcement"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}
            
            <div className="relative overflow-hidden">
              <div 
                className="flex transition-transform duration-500 ease-out"
                style={{ transform: `translateX(-${currentIndex * 100}%)` }}
              >
                {announcements.map((announcement, index) => (
                  <div 
                    key={index}
                    className="flex-shrink-0 w-full text-center whitespace-nowrap"
                  >
                    {announcement.link ? (
                      <Link 
                        href={announcement.link}
                        className="hover:underline"
                      >
                        {announcement.text}
                        <span className="ml-2 font-semibold" style={{ color: themeColor }}>
                          learn more
                        </span>
                      </Link>
                    ) : (
                      <span>{announcement.text}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {announcements.length > 1 && (
              <button
                onClick={nextAnnouncement}
                className="p-1 text-white/60 hover:text-white transition-colors ml-2"
                aria-label="Next announcement"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Language/Currency Selectors (Right) */}
          <div className="hidden md:flex items-center gap-4">
            {data.showLanguageSelector && (
              <select className="bg-transparent text-white/80 hover:text-white text-sm border-none cursor-pointer focus:outline-none">
                <option value="en" className="text-gray-900">English</option>
                <option value="es" className="text-gray-900">Español</option>
                <option value="fr" className="text-gray-900">Français</option>
              </select>
            )}
            {data.showCurrencySelector && (
              <select className="bg-transparent text-white/80 hover:text-white text-sm border-none cursor-pointer focus:outline-none">
                <option value="USD" className="text-gray-900">United States USD $</option>
                <option value="EUR" className="text-gray-900">Europe EUR €</option>
                <option value="GBP" className="text-gray-900">United Kingdom GBP £</option>
              </select>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

