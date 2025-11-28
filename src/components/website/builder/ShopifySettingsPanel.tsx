'use client';

import React from 'react';
import { WebsiteSection, WebsiteBlock, SectionSettings, BlockSettings, SectionType } from '@/types/website';
import { getSectionTypeName, getBlockTypeName } from './blockTemplates';
import { X, ChevronLeft, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';

interface ShopifySettingsPanelProps {
  selectedSection: WebsiteSection | null;
  selectedBlock: WebsiteBlock | null;
  onUpdateSectionSettings: (sectionId: string, settings: SectionSettings) => void;
  onUpdateSectionData: (sectionId: string, data: Record<string, unknown>) => void;
  onUpdateBlock: (blockId: string, updates: Partial<WebsiteBlock>) => void;
  onClose: () => void;
}

export default function ShopifySettingsPanel({
  selectedSection,
  selectedBlock,
  onUpdateSectionSettings,
  onUpdateSectionData,
  onUpdateBlock,
  onClose,
}: ShopifySettingsPanelProps) {
  if (!selectedSection) return null;

  if (selectedBlock) {
    return (
      <BlockSettingsPanel
        block={selectedBlock}
        onUpdate={onUpdateBlock}
        onBack={onClose}
      />
    );
  }

  return (
    <SectionSettingsPanelComponent
      section={selectedSection}
      onUpdateSettings={(settings) => onUpdateSectionSettings(selectedSection.id, settings)}
      onUpdateData={(data) => onUpdateSectionData(selectedSection.id, data)}
      onClose={onClose}
    />
  );
}

// ============================================
// SECTION SETTINGS PANEL
// ============================================

interface SectionSettingsPanelComponentProps {
  section: WebsiteSection;
  onUpdateSettings: (settings: SectionSettings) => void;
  onUpdateData: (data: Record<string, unknown>) => void;
  onClose: () => void;
}

function SectionSettingsPanelComponent({ section, onUpdateSettings, onUpdateData, onClose }: SectionSettingsPanelComponentProps) {
  const settings = section.settings || {};
  const data = (section.data || {}) as Record<string, unknown>;

  const updateSetting = <K extends keyof SectionSettings>(key: K, value: SectionSettings[K]) => {
    onUpdateSettings({ ...settings, [key]: value });
  };

  const updateData = (key: string, value: unknown) => {
    onUpdateData({ ...data, [key]: value });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="h-14 px-4 flex items-center justify-between border-b border-[#333] shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={onClose}
            className="p-1 hover:bg-[#333] rounded text-gray-400 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-white font-medium">{getSectionTypeName(section.type)}</span>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-[#333] rounded text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Settings */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Section Content - based on section type */}
        {renderSectionContent(section.type, data, updateData)}

        {/* Divider */}
        <div className="border-t border-[#333] my-4" />

        {/* Section Style Settings */}
        <SettingGroup title="Colors">
          <ColorInput
            label="Background"
            value={settings.backgroundColor || '#FFFFFF'}
            onChange={(value) => updateSetting('backgroundColor', value)}
          />
        </SettingGroup>

        <SettingGroup title="Section padding">
          <div className="grid grid-cols-2 gap-3">
            <NumberInput
              label="Top"
              value={settings.paddingTop ?? 64}
              onChange={(value) => updateSetting('paddingTop', value)}
              suffix="px"
            />
            <NumberInput
              label="Bottom"
              value={settings.paddingBottom ?? 64}
              onChange={(value) => updateSetting('paddingBottom', value)}
              suffix="px"
            />
          </div>
        </SettingGroup>

        <SettingGroup title="Layout">
          <SelectInput
            label="Content width"
            value={settings.maxWidth || 'xl'}
            onChange={(value) => updateSetting('maxWidth', value as SectionSettings['maxWidth'])}
            options={[
              { value: 'sm', label: 'Small' },
              { value: 'md', label: 'Medium' },
              { value: 'lg', label: 'Large' },
              { value: 'xl', label: 'Extra Large' },
              { value: '2xl', label: 'Full' },
            ]}
          />
          <AlignmentInput
            label="Content alignment"
            value={settings.contentAlignment || 'center'}
            onChange={(value) => updateSetting('contentAlignment', value)}
          />
        </SettingGroup>

        <SettingGroup title="Background image">
          <TextInput
            label="Image URL"
            value={settings.backgroundImage || ''}
            onChange={(value) => updateSetting('backgroundImage', value)}
            placeholder="https://..."
          />
          {settings.backgroundImage && (
            <ColorInput
              label="Overlay color"
              value={settings.backgroundOverlay || 'rgba(0,0,0,0.3)'}
              onChange={(value) => updateSetting('backgroundOverlay', value)}
            />
          )}
        </SettingGroup>
      </div>
    </div>
  );
}

// ============================================
// SECTION CONTENT EDITORS
// ============================================

function renderSectionContent(
  type: SectionType,
  data: Record<string, unknown>,
  updateData: (key: string, value: unknown) => void
) {
  switch (type) {
    case 'hero':
    case 'hero-banner':
      return (
        <SettingGroup title="Content">
          <TextInput
            label="Heading"
            value={String(data.title || '')}
            onChange={(value) => updateData('title', value)}
          />
          <TextareaInput
            label="Subheading"
            value={String(data.subtitle || '')}
            onChange={(value) => updateData('subtitle', value)}
            rows={3}
          />
          <TextInput
            label="Button text"
            value={String(data.buttonText || data.buttonLabel || '')}
            onChange={(value) => {
              updateData('buttonText', value);
              updateData('buttonLabel', value);
            }}
          />
          <TextInput
            label="Button link"
            value={String(data.buttonLink || '')}
            onChange={(value) => updateData('buttonLink', value)}
            placeholder="/shop"
          />
          <TextInput
            label="Image URL"
            value={String(data.image || data.imageUrl || '')}
            onChange={(value) => {
              updateData('image', value);
              updateData('imageUrl', value);
            }}
            placeholder="https://..."
          />
        </SettingGroup>
      );

    case 'hero-slider':
      const slides = (data.slides as Array<Record<string, unknown>>) || [];
      return (
        <SettingGroup title="Slides">
          {slides.length === 0 && (
            <p className="text-sm text-gray-500">No slides yet. Add slides to customize.</p>
          )}
          {slides.map((slide, index) => (
            <div key={slide.id as string || index} className="p-3 bg-[#2a2a2a] rounded-lg space-y-3 mb-3">
              <p className="text-xs text-gray-500 font-medium">Slide {index + 1}</p>
              <TextInput
                label="Title"
                value={String(slide.title || '')}
                onChange={(value) => {
                  const newSlides = [...slides];
                  newSlides[index] = { ...newSlides[index], title: value };
                  updateData('slides', newSlides);
                }}
              />
              <TextareaInput
                label="Subtitle"
                value={String(slide.subtitle || '')}
                onChange={(value) => {
                  const newSlides = [...slides];
                  newSlides[index] = { ...newSlides[index], subtitle: value };
                  updateData('slides', newSlides);
                }}
                rows={2}
              />
              <TextInput
                label="Button text"
                value={String(slide.buttonText || '')}
                onChange={(value) => {
                  const newSlides = [...slides];
                  newSlides[index] = { ...newSlides[index], buttonText: value };
                  updateData('slides', newSlides);
                }}
              />
              <TextInput
                label="Image URL"
                value={String(slide.image || '')}
                onChange={(value) => {
                  const newSlides = [...slides];
                  newSlides[index] = { ...newSlides[index], image: value };
                  updateData('slides', newSlides);
                }}
                placeholder="https://..."
              />
            </div>
          ))}
        </SettingGroup>
      );

    case 'featured-collection':
    case 'products':
    case 'product-carousel':
      return (
        <SettingGroup title="Content">
          <TextInput
            label="Heading"
            value={String(data.title || '')}
            onChange={(value) => updateData('title', value)}
          />
          <TextInput
            label="Subheading"
            value={String(data.subtitle || '')}
            onChange={(value) => updateData('subtitle', value)}
          />
          <NumberInput
            label="Products to show"
            value={Number(data.limit) || 8}
            onChange={(value) => updateData('limit', value)}
            suffix=""
          />
          <CheckboxInput
            label="Show 'View all' link"
            checked={Boolean(data.showViewAll)}
            onChange={(checked) => updateData('showViewAll', checked)}
          />
          {data.showViewAll && (
            <TextInput
              label="View all link"
              value={String(data.viewAllLink || '')}
              onChange={(value) => updateData('viewAllLink', value)}
              placeholder="/collections/all"
            />
          )}
        </SettingGroup>
      );

    case 'testimonials':
      const testimonials = (data.testimonials as Array<Record<string, unknown>>) || [];
      return (
        <SettingGroup title="Content">
          <TextInput
            label="Heading"
            value={String(data.title || '')}
            onChange={(value) => updateData('title', value)}
          />
          <TextInput
            label="Subheading"
            value={String(data.subtitle || '')}
            onChange={(value) => updateData('subtitle', value)}
          />
          <p className="text-xs text-gray-500 mt-4 mb-2">Testimonials ({testimonials.length})</p>
          {testimonials.map((testimonial, index) => (
            <div key={testimonial.id as string || index} className="p-3 bg-[#2a2a2a] rounded-lg space-y-3 mb-3">
              <TextareaInput
                label="Quote"
                value={String(testimonial.quote || '')}
                onChange={(value) => {
                  const newTestimonials = [...testimonials];
                  newTestimonials[index] = { ...newTestimonials[index], quote: value };
                  updateData('testimonials', newTestimonials);
                }}
                rows={3}
              />
              <TextInput
                label="Author"
                value={String(testimonial.author || '')}
                onChange={(value) => {
                  const newTestimonials = [...testimonials];
                  newTestimonials[index] = { ...newTestimonials[index], author: value };
                  updateData('testimonials', newTestimonials);
                }}
              />
              <TextInput
                label="Role"
                value={String(testimonial.role || '')}
                onChange={(value) => {
                  const newTestimonials = [...testimonials];
                  newTestimonials[index] = { ...newTestimonials[index], role: value };
                  updateData('testimonials', newTestimonials);
                }}
              />
            </div>
          ))}
        </SettingGroup>
      );

    case 'newsletter':
    case 'cta':
      return (
        <SettingGroup title="Content">
          <TextInput
            label="Heading"
            value={String(data.title || '')}
            onChange={(value) => updateData('title', value)}
          />
          <TextareaInput
            label="Description"
            value={String(data.subtitle || '')}
            onChange={(value) => updateData('subtitle', value)}
            rows={3}
          />
          <TextInput
            label="Button text"
            value={String(data.buttonText || '')}
            onChange={(value) => updateData('buttonText', value)}
          />
          <TextInput
            label="Placeholder text"
            value={String(data.placeholder || '')}
            onChange={(value) => updateData('placeholder', value)}
          />
        </SettingGroup>
      );

    case 'image-with-text':
    case 'about':
      return (
        <SettingGroup title="Content">
          <TextInput
            label="Heading"
            value={String(data.title || '')}
            onChange={(value) => updateData('title', value)}
          />
          <TextInput
            label="Subheading"
            value={String(data.subtitle || '')}
            onChange={(value) => updateData('subtitle', value)}
          />
          <TextareaInput
            label="Content"
            value={String(data.content || '')}
            onChange={(value) => updateData('content', value)}
            rows={5}
          />
          <TextInput
            label="Button text"
            value={String(data.buttonText || '')}
            onChange={(value) => updateData('buttonText', value)}
          />
          <TextInput
            label="Button link"
            value={String(data.buttonLink || '')}
            onChange={(value) => updateData('buttonLink', value)}
          />
          <TextInput
            label="Image URL"
            value={String(data.image || data.imageUrl || '')}
            onChange={(value) => {
              updateData('image', value);
              updateData('imageUrl', value);
            }}
            placeholder="https://..."
          />
          <SelectInput
            label="Image position"
            value={String(data.imagePosition || 'right')}
            onChange={(value) => updateData('imagePosition', value)}
            options={[
              { value: 'left', label: 'Left' },
              { value: 'right', label: 'Right' },
            ]}
          />
        </SettingGroup>
      );

    case 'multicolumn':
    case 'services':
      const columns = (data.columns as Array<Record<string, unknown>>) || (data.items as Array<Record<string, unknown>>) || [];
      return (
        <SettingGroup title="Content">
          <TextInput
            label="Heading"
            value={String(data.title || '')}
            onChange={(value) => updateData('title', value)}
          />
          <p className="text-xs text-gray-500 mt-4 mb-2">Columns ({columns.length})</p>
          {columns.map((column, index) => (
            <div key={column.id as string || index} className="p-3 bg-[#2a2a2a] rounded-lg space-y-3 mb-3">
              <TextInput
                label="Title"
                value={String(column.title || '')}
                onChange={(value) => {
                  const newColumns = [...columns];
                  newColumns[index] = { ...newColumns[index], title: value };
                  updateData(data.columns ? 'columns' : 'items', newColumns);
                }}
              />
              <TextareaInput
                label="Description"
                value={String(column.content || column.description || '')}
                onChange={(value) => {
                  const newColumns = [...columns];
                  newColumns[index] = { ...newColumns[index], content: value, description: value };
                  updateData(data.columns ? 'columns' : 'items', newColumns);
                }}
                rows={2}
              />
            </div>
          ))}
        </SettingGroup>
      );

    case 'contact':
    case 'contact-info':
      return (
        <SettingGroup title="Content">
          <TextInput
            label="Heading"
            value={String(data.title || '')}
            onChange={(value) => updateData('title', value)}
          />
          <TextInput
            label="Email"
            value={String(data.email || '')}
            onChange={(value) => updateData('email', value)}
          />
          <TextInput
            label="Phone"
            value={String(data.phone || '')}
            onChange={(value) => updateData('phone', value)}
          />
          <TextareaInput
            label="Address"
            value={String(data.address || '')}
            onChange={(value) => updateData('address', value)}
            rows={2}
          />
          <TextInput
            label="Map embed URL"
            value={String(data.mapUrl || '')}
            onChange={(value) => updateData('mapUrl', value)}
            placeholder="https://maps.google.com/..."
          />
        </SettingGroup>
      );

    case 'promo-banner':
    case 'split-banner':
      const banners = (data.banners as Array<Record<string, unknown>>) || [];
      return (
        <SettingGroup title="Banners">
          {banners.map((banner, index) => (
            <div key={banner.id as string || index} className="p-3 bg-[#2a2a2a] rounded-lg space-y-3 mb-3">
              <p className="text-xs text-gray-500 font-medium">Banner {index + 1}</p>
              <TextInput
                label="Title"
                value={String(banner.title || '')}
                onChange={(value) => {
                  const newBanners = [...banners];
                  newBanners[index] = { ...newBanners[index], title: value };
                  updateData('banners', newBanners);
                }}
              />
              <TextInput
                label="Subtitle"
                value={String(banner.subtitle || '')}
                onChange={(value) => {
                  const newBanners = [...banners];
                  newBanners[index] = { ...newBanners[index], subtitle: value };
                  updateData('banners', newBanners);
                }}
              />
              <TextInput
                label="Button text"
                value={String(banner.buttonText || '')}
                onChange={(value) => {
                  const newBanners = [...banners];
                  newBanners[index] = { ...newBanners[index], buttonText: value };
                  updateData('banners', newBanners);
                }}
              />
              <TextInput
                label="Image URL"
                value={String(banner.image || '')}
                onChange={(value) => {
                  const newBanners = [...banners];
                  newBanners[index] = { ...newBanners[index], image: value };
                  updateData('banners', newBanners);
                }}
              />
            </div>
          ))}
        </SettingGroup>
      );

    default:
      return (
        <SettingGroup title="Content">
          <p className="text-sm text-gray-500">
            No content editor available for this section type.
          </p>
        </SettingGroup>
      );
  }
}

// ============================================
// BLOCK SETTINGS PANEL
// ============================================

interface BlockSettingsPanelProps {
  block: WebsiteBlock;
  onUpdate: (blockId: string, updates: Partial<WebsiteBlock>) => void;
  onBack: () => void;
}

function BlockSettingsPanel({ block, onUpdate, onBack }: BlockSettingsPanelProps) {
  const settings = block.settings || {};

  const updateData = (key: string, value: string | number | boolean) => {
    onUpdate(block.id, { data: { ...block.data, [key]: value } });
  };

  const updateSettings = <K extends keyof BlockSettings>(key: K, value: BlockSettings[K]) => {
    onUpdate(block.id, { settings: { ...settings, [key]: value } });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="h-14 px-4 flex items-center gap-2 border-b border-[#333] shrink-0">
        <button
          onClick={onBack}
          className="p-1 hover:bg-[#333] rounded text-gray-400 hover:text-white transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="text-white font-medium">{getBlockTypeName(block.type)}</span>
      </div>

      {/* Settings */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Content */}
        <SettingGroup title="Content">
          {renderBlockContent(block, updateData)}
        </SettingGroup>

        {/* Style */}
        <SettingGroup title="Style">
          {renderBlockStyle(block, settings, updateSettings)}
        </SettingGroup>

        {/* Spacing */}
        <SettingGroup title="Spacing">
          <div className="grid grid-cols-2 gap-3">
            <NumberInput
              label="Top margin"
              value={settings.marginTop ?? 0}
              onChange={(value) => updateSettings('marginTop', value)}
              suffix="px"
            />
            <NumberInput
              label="Bottom margin"
              value={settings.marginBottom ?? 0}
              onChange={(value) => updateSettings('marginBottom', value)}
              suffix="px"
            />
          </div>
        </SettingGroup>
      </div>
    </div>
  );
}

function renderBlockContent(block: WebsiteBlock, updateData: (key: string, value: string | number | boolean) => void) {
  switch (block.type) {
    case 'heading':
    case 'title':
    case 'subheading':
    case 'subtitle':
      return (
        <TextInput
          label="Text"
          value={String(block.data?.text || '')}
          onChange={(value) => updateData('text', value)}
        />
      );

    case 'paragraph':
    case 'text':
      return (
        <TextareaInput
          label="Text"
          value={String(block.data?.text || '')}
          onChange={(value) => updateData('text', value)}
          rows={4}
        />
      );

    case 'image':
      return (
        <>
          <TextInput
            label="Image URL"
            value={String(block.data?.src || '')}
            onChange={(value) => updateData('src', value)}
            placeholder="https://..."
          />
          <TextInput
            label="Alt text"
            value={String(block.data?.alt || '')}
            onChange={(value) => updateData('alt', value)}
          />
        </>
      );

    case 'button':
      return (
        <>
          <TextInput
            label="Button text"
            value={String(block.data?.text || '')}
            onChange={(value) => updateData('text', value)}
          />
          <TextInput
            label="Link URL"
            value={String(block.data?.link || '')}
            onChange={(value) => updateData('link', value)}
            placeholder="/shop"
          />
        </>
      );

    case 'service-card':
    case 'service-item':
      return (
        <>
          <TextInput
            label="Title"
            value={String(block.data?.title || '')}
            onChange={(value) => updateData('title', value)}
          />
          <TextareaInput
            label="Description"
            value={String(block.data?.description || '')}
            onChange={(value) => updateData('description', value)}
            rows={3}
          />
        </>
      );

    case 'spacer':
      return (
        <RangeInput
          label="Height"
          value={Number(block.data?.height) || 32}
          onChange={(value) => updateData('height', value)}
          min={8}
          max={200}
          suffix="px"
        />
      );

    default:
      return <p className="text-sm text-gray-500">No content settings</p>;
  }
}

function renderBlockStyle(
  block: WebsiteBlock,
  settings: BlockSettings,
  updateSettings: <K extends keyof BlockSettings>(key: K, value: BlockSettings[K]) => void
) {
  switch (block.type) {
    case 'heading':
    case 'title':
    case 'subheading':
    case 'subtitle':
    case 'paragraph':
    case 'text':
      return (
        <>
          <SelectInput
            label="Text size"
            value={settings.fontSize || 'base'}
            onChange={(value) => updateSettings('fontSize', value as BlockSettings['fontSize'])}
            options={[
              { value: 'sm', label: 'Small' },
              { value: 'base', label: 'Medium' },
              { value: 'lg', label: 'Large' },
              { value: 'xl', label: 'Extra large' },
              { value: '2xl', label: '2X large' },
              { value: '3xl', label: '3X large' },
            ]}
          />
          <AlignmentInput
            label="Alignment"
            value={settings.textAlign || 'left'}
            onChange={(value) => updateSettings('textAlign', value)}
          />
          <ColorInput
            label="Text color"
            value={settings.textColor || '#000000'}
            onChange={(value) => updateSettings('textColor', value)}
          />
        </>
      );

    case 'button':
      return (
        <>
          <SelectInput
            label="Style"
            value={settings.buttonVariant || 'primary'}
            onChange={(value) => updateSettings('buttonVariant', value as BlockSettings['buttonVariant'])}
            options={[
              { value: 'primary', label: 'Primary' },
              { value: 'secondary', label: 'Secondary' },
              { value: 'outline', label: 'Outline' },
            ]}
          />
          <SelectInput
            label="Size"
            value={settings.buttonSize || 'md'}
            onChange={(value) => updateSettings('buttonSize', value as BlockSettings['buttonSize'])}
            options={[
              { value: 'sm', label: 'Small' },
              { value: 'md', label: 'Medium' },
              { value: 'lg', label: 'Large' },
            ]}
          />
        </>
      );

    case 'image':
      return (
        <>
          <SelectInput
            label="Width"
            value={settings.imageWidth || 'full'}
            onChange={(value) => updateSettings('imageWidth', value as BlockSettings['imageWidth'])}
            options={[
              { value: 'auto', label: 'Auto' },
              { value: 'half', label: 'Half' },
              { value: 'full', label: 'Full width' },
            ]}
          />
          <SelectInput
            label="Border radius"
            value={settings.borderRadius || 'none'}
            onChange={(value) => updateSettings('borderRadius', value as BlockSettings['borderRadius'])}
            options={[
              { value: 'none', label: 'None' },
              { value: 'sm', label: 'Small' },
              { value: 'md', label: 'Medium' },
              { value: 'lg', label: 'Large' },
              { value: 'xl', label: 'Extra large' },
              { value: 'full', label: 'Full' },
            ]}
          />
        </>
      );

    default:
      return <p className="text-sm text-gray-500">No style settings</p>;
  }
}

// ============================================
// INPUT COMPONENTS
// ============================================

function SettingGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider">{title}</h4>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function TextInput({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-400 mb-1.5">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 text-sm bg-[#2a2a2a] border border-[#444] rounded-lg text-white placeholder-gray-500 focus:border-[#36d399] focus:ring-1 focus:ring-[#36d399] outline-none transition-colors"
      />
    </div>
  );
}

function TextareaInput({
  label,
  value,
  onChange,
  rows = 3,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-400 mb-1.5">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        className="w-full px-3 py-2 text-sm bg-[#2a2a2a] border border-[#444] rounded-lg text-white placeholder-gray-500 focus:border-[#36d399] focus:ring-1 focus:ring-[#36d399] outline-none transition-colors resize-none"
      />
    </div>
  );
}

function NumberInput({
  label,
  value,
  onChange,
  suffix,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  suffix?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-400 mb-1.5">{label}</label>
      <div className="relative">
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value) || 0)}
          className="w-full px-3 py-2 text-sm bg-[#2a2a2a] border border-[#444] rounded-lg text-white focus:border-[#36d399] focus:ring-1 focus:ring-[#36d399] outline-none transition-colors"
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">{suffix}</span>
        )}
      </div>
    </div>
  );
}

function RangeInput({
  label,
  value,
  onChange,
  min,
  max,
  suffix,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  suffix?: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-xs font-medium text-gray-400">{label}</label>
        <span className="text-xs text-gray-500">{value}{suffix}</span>
      </div>
      <input
        type="range"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        min={min}
        max={max}
        className="w-full h-1.5 bg-[#333] rounded-lg appearance-none cursor-pointer accent-[#36d399]"
      />
    </div>
  );
}

function ColorInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-400 mb-1.5">{label}</label>
      <div className="flex gap-2">
        <div className="relative">
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-10 h-10 rounded-lg border border-[#444] cursor-pointer"
          />
        </div>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 px-3 py-2 text-sm bg-[#2a2a2a] border border-[#444] rounded-lg text-white focus:border-[#36d399] focus:ring-1 focus:ring-[#36d399] outline-none transition-colors"
        />
      </div>
    </div>
  );
}

function SelectInput({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-400 mb-1.5">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 text-sm bg-[#2a2a2a] border border-[#444] rounded-lg text-white focus:border-[#36d399] focus:ring-1 focus:ring-[#36d399] outline-none transition-colors"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}

function AlignmentInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: 'left' | 'center' | 'right';
  onChange: (value: 'left' | 'center' | 'right') => void;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-400 mb-1.5">{label}</label>
      <div className="flex gap-1 bg-[#2a2a2a] p-1 rounded-lg border border-[#444]">
        {(['left', 'center', 'right'] as const).map((align) => (
          <button
            key={align}
            onClick={() => onChange(align)}
            className={`flex-1 p-2 rounded transition-colors ${
              value === align 
                ? 'bg-[#36d399] text-black' 
                : 'text-gray-400 hover:text-white hover:bg-[#333]'
            }`}
          >
            {align === 'left' && <AlignLeft className="w-4 h-4 mx-auto" />}
            {align === 'center' && <AlignCenter className="w-4 h-4 mx-auto" />}
            {align === 'right' && <AlignRight className="w-4 h-4 mx-auto" />}
          </button>
        ))}
      </div>
    </div>
  );
}

function CheckboxInput({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4 rounded border-[#444] bg-[#2a2a2a] text-[#36d399] focus:ring-[#36d399] focus:ring-offset-0"
      />
      <span className="text-sm text-gray-300">{label}</span>
    </label>
  );
}
