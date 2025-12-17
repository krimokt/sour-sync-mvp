'use client';

import React, { useState } from 'react';
import { WebsiteSection } from '@/types/website';
import { Check, Palette, Type, X, ChevronRight, Sparkles } from 'lucide-react';

// ============================================
// TEMPLATE DEFINITIONS
// ============================================

export interface WebsiteTemplate {
  id: string;
  name: string;
  description: string;
  category: 'logistics';
  preview: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
  sections: WebsiteSection[];
}

export const websiteTemplates: WebsiteTemplate[] = [
  {
    id: 'global-logistics',
    name: 'Global Logistics',
    description: 'Professional template for sourcing and shipping companies with e-commerce features',
    category: 'logistics',
    preview: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600',
    colors: {
      primary: '#0ea5e9',
      secondary: '#f8fafc',
      accent: '#f59e0b',
    },
    fonts: {
      heading: 'Roboto',
      body: 'Inter',
    },
    sections: [
      {
        id: crypto.randomUUID(),
        type: 'header',
        name: 'Header',
        data: {
          menuStyle: 'logistics',
          logoPosition: 'left',
          showContactStrip: true,
          contactEmail: 'contact@logistics.com',
          contactPhone: '+1 (555) 123-4567',
          navigation: [
            { label: 'Home', link: '/' },
            { label: 'Products', link: '/products' },
            { label: 'Services', link: '/services' },
            { label: 'Track Order', link: '/track' },
          ],
          ctaText: 'Sign In',
          ctaLink: '/signin', // Will be resolved to /site/[companySlug]/signin
          showCart: true,
          showAccount: true,
        },
        settings: {
          stickyHeader: true,
        },
      },
      {
        id: crypto.randomUUID(),
        type: 'hero-slider',
        name: 'Hero',
        data: {
          slides: [
            {
              id: crypto.randomUUID(),
              title: 'Global Sourcing Made Simple',
              subtitle: 'We help you find reliable suppliers, ensure quality, and ship globally. Your all-in-one sourcing partner.',
              buttonText: 'Sign Up',
              buttonLink: '/signin', // Will show signup tab
              secondaryButtonText: 'Sign In',
              secondaryButtonLink: '/signin',
              image: 'https://images.unsplash.com/photo-1494412651409-8963ce7935a7?w=1200',
              overlayColor: '#0f172a',
              overlayOpacity: 0.6,
            },
            {
              id: crypto.randomUUID(),
              title: 'Quality Products, Fast Delivery',
              subtitle: 'Shop from our curated catalog or request custom sourcing. We handle everything from factory to your door.',
              buttonText: 'Shop Now',
              buttonLink: '/products',
              secondaryButtonText: 'Our Services',
              secondaryButtonLink: '/services',
              image: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=1200',
              overlayColor: '#0f172a',
              overlayOpacity: 0.6,
            },
          ],
          height: 650,
        },
        settings: { paddingTop: 0, paddingBottom: 0 },
      },
      {
        id: crypto.randomUUID(),
        type: 'logo-list',
        name: 'Partners',
        data: {
          title: 'Trusted by 500+ Businesses Worldwide',
          logos: [
            { src: 'https://placehold.co/200x80/png?text=DHL', alt: 'DHL' },
            { src: 'https://placehold.co/200x80/png?text=FedEx', alt: 'FedEx' },
            { src: 'https://placehold.co/200x80/png?text=UPS', alt: 'UPS' },
            { src: 'https://placehold.co/200x80/png?text=Maersk', alt: 'Maersk' },
            { src: 'https://placehold.co/200x80/png?text=Alibaba', alt: 'Alibaba' },
          ],
          grayscale: true,
        },
        settings: { paddingTop: 40, paddingBottom: 40, backgroundColor: '#ffffff' },
      },
      {
        id: crypto.randomUUID(),
        type: 'featured-collection',
        name: 'Featured Products',
        data: {
          title: 'Popular Products',
          subtitle: 'Browse our most requested items or request a custom quote',
          limit: 8,
          columns: 4,
          layout: 'grid',
          showPrice: true,
          showAddToCart: true,
          showQuoteButton: true,
        },
        settings: { backgroundColor: '#f8fafc', paddingTop: 80, paddingBottom: 80 },
      },
      {
        id: crypto.randomUUID(),
        type: 'multicolumn',
        name: 'Our Services',
        data: {
          title: 'Comprehensive Sourcing Solutions',
          subtitle: 'From factory to your doorstep, we handle everything.',
          columns: [
            { id: crypto.randomUUID(), icon: 'Search', title: 'Product Sourcing', content: 'We find the best manufacturers with the lowest MOQ and best prices.' },
            { id: crypto.randomUUID(), icon: 'CheckCircle', title: 'Quality Inspection', content: 'Strict QC checks before shipping to ensure zero defects.' },
            { id: crypto.randomUUID(), icon: 'Package', title: 'Warehousing', content: 'Free warehousing for 30 days. Consolidate your shipments easily.' },
            { id: crypto.randomUUID(), icon: 'Truck', title: 'Global Shipping', content: 'Fast and affordable shipping via Air, Sea, or Rail (DDP/DDU).' },
          ],
          columnsDesktop: 4,
        },
        settings: { backgroundColor: '#ffffff', paddingTop: 100, paddingBottom: 100 },
      },
      {
        id: crypto.randomUUID(),
        type: 'process-steps',
        name: 'How It Works',
        data: {
          title: 'Simple Process',
          subtitle: 'Get started in 4 easy steps',
          steps: [
            { number: '01', title: 'Browse or Request', description: 'Shop from our catalog or submit a custom sourcing request.' },
            { number: '02', title: 'Get Quote & Pay', description: 'Receive pricing and pay securely via bank transfer or card.' },
            { number: '03', title: 'Quality Check', description: 'We inspect your goods and send photos before shipping.' },
            { number: '04', title: 'Track & Receive', description: 'Track your shipment in real-time until delivery.' },
          ],
        },
        settings: { backgroundColor: '#f0f9ff', paddingTop: 100, paddingBottom: 100 },
      },
      {
        id: crypto.randomUUID(),
        type: 'multicolumn',
        name: 'Why Choose Us',
        data: {
          title: 'Why 1,000+ Clients Trust Us',
          columns: [
            { id: crypto.randomUUID(), icon: 'DollarSign', title: 'Best Prices', content: 'Direct factory access means you get the best rates.' },
            { id: crypto.randomUUID(), icon: 'ShieldCheck', title: '100% Safe', content: 'Secure payments and guaranteed delivery.' },
            { id: crypto.randomUUID(), icon: 'Headphones', title: '24/7 Support', content: 'Dedicated agent for your business needs.' },
          ],
          columnsDesktop: 3,
        },
        settings: { backgroundColor: '#ffffff', paddingTop: 100, paddingBottom: 100 },
      },
      {
        id: crypto.randomUUID(),
        type: 'testimonials',
        name: 'Testimonials',
        data: {
          title: 'What Our Clients Say',
          testimonials: [
            { id: crypto.randomUUID(), name: 'John Smith', role: 'E-commerce Owner', content: 'Best sourcing partner I have worked with. Fast, reliable, and professional.', avatar: 'https://randomuser.me/api/portraits/men/1.jpg', rating: 5 },
            { id: crypto.randomUUID(), name: 'Sarah Johnson', role: 'Amazon Seller', content: 'They helped me scale my business from 10 to 1000 orders per month.', avatar: 'https://randomuser.me/api/portraits/women/2.jpg', rating: 5 },
            { id: crypto.randomUUID(), name: 'Mike Chen', role: 'Dropshipper', content: 'Quality inspection saved me thousands in returns. Highly recommend!', avatar: 'https://randomuser.me/api/portraits/men/3.jpg', rating: 5 },
          ],
        },
        settings: { backgroundColor: '#f8fafc', paddingTop: 80, paddingBottom: 80 },
      },
      {
        id: crypto.randomUUID(),
        type: 'quote-form',
        name: 'Get Quote',
        data: {
          title: 'Ready to Get Started?',
          subtitle: 'Request a free quote or create an account to start ordering.',
          fields: [
            { name: 'name', label: 'Your Name', type: 'text', required: true },
            { name: 'email', label: 'Email Address', type: 'email', required: true },
            { name: 'phone', label: 'Phone / WhatsApp', type: 'text', required: true },
            { name: 'product', label: 'Product Details / Link', type: 'textarea', required: true },
          ],
          submitText: 'Submit Request',
        },
        settings: { backgroundColor: '#0f172a', paddingTop: 100, paddingBottom: 100 },
      },
      {
        id: crypto.randomUUID(),
        type: 'footer',
        name: 'Footer',
        data: {
          columns: [
            {
              id: crypto.randomUUID(),
              type: 'text',
              title: 'Company Name',
              content: 'Your trusted partner for global sourcing and logistics solutions.',
            },
            {
              id: crypto.randomUUID(),
              type: 'links',
              title: 'Shop',
              links: [
                { text: 'All Products', link: '/products' },
                { text: 'Get Quote', link: '/quote' },
                { text: 'Track Order', link: '/track' },
                { text: 'My Account', link: '/account' },
              ],
            },
            {
              id: crypto.randomUUID(),
              type: 'links',
              title: 'Company',
              links: [
                { text: 'About Us', link: '/about' },
                { text: 'Services', link: '/services' },
                { text: 'Contact', link: '/contact' },
                { text: 'Terms & Conditions', link: '/terms' },
              ],
            },
            {
              id: crypto.randomUUID(),
              type: 'contact',
              title: 'Contact Us',
              content: 'Email: support@company.com\nWhatsApp: +1 234 567 8900',
            },
          ],
          copyright: '© 2024 Company Name. All rights reserved.',
          showPaymentIcons: true,
        },
        settings: { backgroundColor: '#1e293b', paddingTop: 60, paddingBottom: 60 },
      },
    ],
  },
];

// ============================================
// FONT OPTIONS
// ============================================

export const fontOptions = [
  { value: 'Inter', label: 'Inter', style: 'font-sans' },
  { value: 'Roboto', label: 'Roboto', style: 'font-sans' },
  { value: 'Poppins', label: 'Poppins', style: 'font-sans' },
  { value: 'Montserrat', label: 'Montserrat', style: 'font-sans' },
  { value: 'Open Sans', label: 'Open Sans', style: 'font-sans' },
  { value: 'Lato', label: 'Lato', style: 'font-sans' },
  { value: 'DM Sans', label: 'DM Sans', style: 'font-sans' },
  { value: 'Space Grotesk', label: 'Space Grotesk', style: 'font-sans' },
  { value: 'Playfair Display', label: 'Playfair Display', style: 'font-serif' },
  { value: 'Libre Baskerville', label: 'Libre Baskerville', style: 'font-serif' },
];

// ============================================
// THEME SETTINGS COMPONENT
// ============================================

interface ThemeSettingsProps {
  colors: { primary: string; secondary: string; accent: string };
  fonts: { heading: string; body: string };
  onUpdateColors: (colors: { primary: string; secondary: string; accent: string }) => void;
  onUpdateFonts: (fonts: { heading: string; body: string }) => void;
}

function ThemeSettings({ colors, fonts, onUpdateColors, onUpdateFonts }: ThemeSettingsProps) {
  const colorPresets = [
    { primary: '#0ea5e9', secondary: '#f8fafc', accent: '#f59e0b', name: 'Sky Blue' },
    { primary: '#10b981', secondary: '#f0fdf4', accent: '#f97316', name: 'Emerald' },
    { primary: '#6366f1', secondary: '#f5f3ff', accent: '#ec4899', name: 'Indigo' },
    { primary: '#1e293b', secondary: '#f8fafc', accent: '#3b82f6', name: 'Slate' },
    { primary: '#dc2626', secondary: '#fef2f2', accent: '#facc15', name: 'Red' },
    { primary: '#0f172a', secondary: '#ffffff', accent: '#0ea5e9', name: 'Dark' },
  ];

  return (
    <div className="space-y-6">
      {/* Colors Section */}
      <div>
        <h3 className="text-sm font-medium text-white mb-4 flex items-center gap-2">
          <Palette className="w-4 h-4" />
          Colors
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-gray-400 mb-2">Primary Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={colors.primary}
                onChange={(e) => onUpdateColors({ ...colors, primary: e.target.value })}
                className="w-10 h-10 rounded cursor-pointer border-0"
              />
              <input
                type="text"
                value={colors.primary}
                onChange={(e) => onUpdateColors({ ...colors, primary: e.target.value })}
                className="flex-1 bg-[#333] border border-[#444] rounded px-3 py-2 text-sm text-white"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-xs text-gray-400 mb-2">Secondary Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={colors.secondary}
                onChange={(e) => onUpdateColors({ ...colors, secondary: e.target.value })}
                className="w-10 h-10 rounded cursor-pointer border-0"
              />
              <input
                type="text"
                value={colors.secondary}
                onChange={(e) => onUpdateColors({ ...colors, secondary: e.target.value })}
                className="flex-1 bg-[#333] border border-[#444] rounded px-3 py-2 text-sm text-white"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-xs text-gray-400 mb-2">Accent Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={colors.accent}
                onChange={(e) => onUpdateColors({ ...colors, accent: e.target.value })}
                className="w-10 h-10 rounded cursor-pointer border-0"
              />
              <input
                type="text"
                value={colors.accent}
                onChange={(e) => onUpdateColors({ ...colors, accent: e.target.value })}
                className="flex-1 bg-[#333] border border-[#444] rounded px-3 py-2 text-sm text-white"
              />
            </div>
          </div>
        </div>

        {/* Color Presets */}
        <div className="mt-4">
          <label className="block text-xs text-gray-400 mb-2">Quick presets</label>
          <div className="grid grid-cols-3 gap-2">
            {colorPresets.map((preset, i) => (
              <button
                key={i}
                onClick={() => onUpdateColors(preset)}
                className="flex items-center gap-2 p-2 rounded border border-[#444] hover:border-[#666] transition-colors"
                title={preset.name}
              >
                <div className="flex gap-1">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: preset.primary }} />
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: preset.accent }} />
                </div>
                <span className="text-xs text-gray-400 truncate">{preset.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Typography Section */}
      <div>
        <h3 className="text-sm font-medium text-white mb-4 flex items-center gap-2">
          <Type className="w-4 h-4" />
          Typography
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-gray-400 mb-2">Heading Font</label>
            <select
              value={fonts.heading}
              onChange={(e) => onUpdateFonts({ ...fonts, heading: e.target.value })}
              className="w-full bg-[#333] border border-[#444] rounded px-3 py-2 text-sm text-white"
            >
              {fontOptions.map((font) => (
                <option key={font.value} value={font.value}>
                  {font.label}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-xs text-gray-400 mb-2">Body Font</label>
            <select
              value={fonts.body}
              onChange={(e) => onUpdateFonts({ ...fonts, body: e.target.value })}
              className="w-full bg-[#333] border border-[#444] rounded px-3 py-2 text-sm text-white"
            >
              {fontOptions.map((font) => (
                <option key={font.value} value={font.value}>
                  {font.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// TEMPLATE SELECTOR COMPONENT
// ============================================

interface TemplateSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: WebsiteTemplate) => void;
  currentColors: { primary: string; secondary: string; accent: string };
  currentFonts: { heading: string; body: string };
  onUpdateColors: (colors: { primary: string; secondary: string; accent: string }) => void;
  onUpdateFonts: (fonts: { heading: string; body: string }) => void;
}

export default function TemplateSelector({
  isOpen,
  onClose,
  onSelectTemplate,
  currentColors,
  currentFonts,
  onUpdateColors,
  onUpdateFonts,
}: TemplateSelectorProps) {
  const [activeTab, setActiveTab] = useState<'templates' | 'theme'>('theme');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleApplyTemplate = () => {
    const template = websiteTemplates.find((t) => t.id === selectedTemplate);
    if (template) {
      onSelectTemplate(template);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex p-2 sm:p-4 lg:p-8">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/80" onClick={onClose} />

      {/* Modal */}
      <div className="relative flex flex-col w-full max-w-4xl mx-auto bg-[#1a1a1a] rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl max-h-full">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-[#333]">
          <div className="flex items-center gap-2 sm:gap-4">
            <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-[#36d399]" />
            <h2 className="text-lg sm:text-xl font-semibold text-white">Customize Your Store</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#333] rounded-lg transition-colors text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#333]">
          <button
            onClick={() => setActiveTab('theme')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'theme'
                ? 'text-[#36d399] border-b-2 border-[#36d399]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Theme Settings
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'templates'
                ? 'text-[#36d399] border-b-2 border-[#36d399]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Templates
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {activeTab === 'theme' ? (
            <ThemeSettings
              colors={currentColors}
              fonts={currentFonts}
              onUpdateColors={onUpdateColors}
              onUpdateFonts={onUpdateFonts}
            />
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-gray-400">
                Select a template to replace your current layout. This will overwrite all existing sections.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {websiteTemplates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => setSelectedTemplate(template.id)}
                    className={`relative group rounded-xl overflow-hidden border-2 transition-all ${
                      selectedTemplate === template.id
                        ? 'border-[#36d399] ring-2 ring-[#36d399]/30'
                        : 'border-[#333] hover:border-[#555]'
                    }`}
                  >
                    <div className="aspect-video bg-[#0d0d0d] relative">
                      <img
                        src={template.preview}
                        alt={template.name}
                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                      />
                      {selectedTemplate === template.id && (
                        <div className="absolute inset-0 bg-[#36d399]/20 flex items-center justify-center">
                          <Check className="w-10 h-10 text-[#36d399]" />
                        </div>
                      )}
                    </div>
                    <div className="p-4 bg-[#1a1a1a]">
                      <h3 className="font-medium text-white text-left">{template.name}</h3>
                      <p className="text-xs text-gray-400 text-left mt-1">{template.description}</p>
                      <div className="flex items-center gap-2 mt-3">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: template.colors.primary }}
                        />
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: template.colors.accent }}
                        />
                        <span className="text-xs text-gray-500 ml-auto">
                          {template.sections.length} sections
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {selectedTemplate && (
                <div className="flex justify-end pt-4 border-t border-[#333]">
                  <button
                    onClick={handleApplyTemplate}
                    className="flex items-center gap-2 px-6 py-2.5 bg-[#36d399] hover:bg-[#2bc088] text-black font-medium rounded-lg transition-colors"
                  >
                    Apply Template
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
