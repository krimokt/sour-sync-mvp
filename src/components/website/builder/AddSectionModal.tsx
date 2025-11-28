'use client';

import React from 'react';
import { SectionType } from '@/types/website';
import { sectionTemplates } from './blockTemplates';
import {
  X,
  Sparkles,
  Briefcase,
  ShoppingBag,
  Mail,
  Info,
  Images,
  MessageSquare,
  Megaphone,
  PanelTop,
  PanelBottom,
  LayoutTemplate,
} from 'lucide-react';

interface AddSectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddSection: (type: SectionType) => void;
}

// Map section types to icons
const sectionIcons: Partial<Record<SectionType, React.FC<{ className?: string }>>> = {
  hero: Sparkles,
  services: Briefcase,
  products: ShoppingBag,
  contact: Mail,
  about: Info,
  gallery: Images,
  testimonials: MessageSquare,
  cta: Megaphone,
  header: PanelTop,
  footer: PanelBottom,
};

// Section categories for better organization
const sectionCategories = [
  {
    name: 'Essential',
    types: ['hero', 'services', 'products', 'contact'] as SectionType[],
  },
  {
    name: 'Content',
    types: ['about', 'gallery', 'testimonials', 'cta'] as SectionType[],
  },
  {
    name: 'Layout',
    types: ['header', 'footer'] as SectionType[],
  },
];

export default function AddSectionModal({
  isOpen,
  onClose,
  onAddSection,
}: AddSectionModalProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div
          className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Add Section
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Choose a section type to add to your page
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(80vh-80px)]">
            {sectionCategories.map((category) => (
              <div key={category.name} className="mb-6 last:mb-0">
                <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                  {category.name}
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {category.types.map((type) => {
                    const template = sectionTemplates.find(t => t.type === type);
                    const IconComponent = sectionIcons[type] || LayoutTemplate;
                    
                    if (!template) return null;
                    
                    return (
                      <button
                        key={type}
                        onClick={() => onAddSection(type)}
                        className="flex items-start gap-3 p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-[#06b6d4] hover:bg-[#06b6d4]/5 dark:hover:bg-[#06b6d4]/10 transition-all text-left group"
                      >
                        <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 group-hover:bg-[#06b6d4]/10 transition-colors">
                          <IconComponent className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-[#06b6d4]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-[#06b6d4]">
                            {template.name}
                          </h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">
                            {template.description}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}


