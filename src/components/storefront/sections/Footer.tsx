'use client';

import React from 'react';
import Link from 'next/link';
import { FooterData } from '@/types/website';
import { Facebook, Twitter, Instagram, Linkedin, Youtube } from 'lucide-react';

interface FooterProps {
  data: FooterData;
  themeColor: string;
}

const socialIcons: Record<string, React.ElementType> = {
  facebook: Facebook,
  twitter: Twitter,
  instagram: Instagram,
  linkedin: Linkedin,
  youtube: Youtube,
};

export default function Footer({ data, themeColor }: FooterProps) {
  const {
    columns = [],
    copyright = '© 2024 All rights reserved.',
    showPaymentIcons = false,
    bottomLinks = [],
  } = data;

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {columns.map((column) => (
            <div key={column.id}>
              {column.title && (
                <h3 className="text-lg font-semibold mb-4">{column.title}</h3>
              )}

              {/* Text Column */}
              {column.type === 'text' && column.content && (
                <p className="text-gray-400 text-sm leading-relaxed whitespace-pre-line">
                  {column.content}
                </p>
              )}

              {/* Links Column */}
              {column.type === 'links' && column.links && (
                <ul className="space-y-2">
                  {column.links.map((link, index) => (
                    <li key={index}>
                      <Link
                        href={link.link}
                        className="text-gray-400 hover:text-white text-sm transition-colors"
                      >
                        {link.text}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}

              {/* Contact Column */}
              {column.type === 'contact' && column.content && (
                <div className="text-gray-400 text-sm space-y-2 whitespace-pre-line">
                  {column.content}
                </div>
              )}

              {/* Newsletter Column */}
              {column.type === 'newsletter' && (
                <div>
                  <p className="text-gray-400 text-sm mb-4">
                    {column.content || 'Subscribe to our newsletter for updates.'}
                  </p>
                  <form className="flex gap-2">
                    <input
                      type="email"
                      placeholder="Your email"
                      className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded text-sm text-white placeholder-gray-500 focus:outline-none focus:border-gray-500"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 rounded text-sm font-medium text-white transition-colors"
                      style={{ backgroundColor: themeColor }}
                    >
                      Subscribe
                    </button>
                  </form>
                </div>
              )}

              {/* Social Links Column */}
              {column.type === 'social' && column.socialLinks && (
                <div className="flex gap-4">
                  {column.socialLinks.map((social, index) => {
                    const IconComponent = socialIcons[social.platform.toLowerCase()];
                    return IconComponent ? (
                      <Link
                        key={index}
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-white transition-colors"
                        aria-label={social.platform}
                      >
                        <IconComponent className="w-5 h-5" />
                      </Link>
                    ) : null;
                  })}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Copyright */}
            <p className="text-gray-400 text-sm">{copyright}</p>

            {/* Bottom Links */}
            {bottomLinks.length > 0 && (
              <div className="flex gap-6">
                {bottomLinks.map((link, index) => (
                  <Link
                    key={index}
                    href={link.link}
                    className="text-gray-400 hover:text-white text-sm transition-colors"
                  >
                    {link.text}
                  </Link>
                ))}
              </div>
            )}

            {/* Payment Icons */}
            {showPaymentIcons && (
              <div className="flex gap-2">
                {/* Placeholder payment icons */}
                <div className="w-10 h-6 bg-gray-700 rounded" />
                <div className="w-10 h-6 bg-gray-700 rounded" />
                <div className="w-10 h-6 bg-gray-700 rounded" />
              </div>
            )}
          </div>
        </div>

        {/* Powered by */}
        <div className="mt-6 text-center">
          <p className="text-gray-500 text-xs">
            Powered by <span style={{ color: themeColor }}>SourSync</span>
          </p>
        </div>
      </div>
    </footer>
  );
}

