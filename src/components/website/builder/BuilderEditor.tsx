'use client';

import React, { useState } from 'react';
import { WebsiteSection, WebsiteBlock, getSectionDisplayName, getBlockDisplayName, SectionSettings, BlockSettings } from '@/types/website';
import { 
  Settings, 
  Palette, 
  Layout, 
  Eye, 
  Type,
  Image,
  Link,
  AlignLeft,
  AlignCenter,
  AlignRight,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface BuilderEditorProps {
  selectedSection: WebsiteSection | null;
  selectedBlock: WebsiteBlock | null;
  onUpdateSectionSettings: (sectionId: string, settings: SectionSettings) => void;
  onUpdateBlock: (blockId: string, updates: Partial<WebsiteBlock>) => void;
}

type EditorTab = 'content' | 'settings';

export default function BuilderEditor({
  selectedSection,
  selectedBlock,
  onUpdateSectionSettings,
  onUpdateBlock,
}: BuilderEditorProps) {
  const [activeTab, setActiveTab] = useState<EditorTab>('content');

  // Nothing selected
  if (!selectedSection && !selectedBlock) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
          <Settings className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          No selection
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">
          Select a section or block from the left panel to edit its properties.
        </p>
      </div>
    );
  }

  const title = selectedBlock 
    ? getBlockDisplayName(selectedBlock.type)
    : selectedSection 
      ? getSectionDisplayName(selectedSection.type)
      : 'Editor';

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800 shrink-0">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
          {title}
        </h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
          {selectedBlock ? 'Block' : 'Section'} Settings
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-800 shrink-0">
        <button
          onClick={() => setActiveTab('content')}
          className={`flex-1 px-4 py-2.5 text-xs font-medium transition-colors ${
            activeTab === 'content'
              ? 'text-[#06b6d4] border-b-2 border-[#06b6d4]'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Content
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`flex-1 px-4 py-2.5 text-xs font-medium transition-colors ${
            activeTab === 'settings'
              ? 'text-[#06b6d4] border-b-2 border-[#06b6d4]'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Style
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'content' ? (
          selectedBlock ? (
            <BlockContentEditor 
              block={selectedBlock} 
              onUpdate={(updates) => onUpdateBlock(selectedBlock.id, updates)}
            />
          ) : selectedSection ? (
            <SectionContentEditor 
              section={selectedSection} 
              onUpdate={(updates) => onUpdateSectionSettings(selectedSection.id, updates)}
            />
          ) : null
        ) : (
          selectedBlock ? (
            <BlockStyleEditor 
              block={selectedBlock} 
              onUpdate={(settings) => onUpdateBlock(selectedBlock.id, { settings: { ...selectedBlock.settings, ...settings } })}
            />
          ) : selectedSection ? (
            <SectionStyleEditor 
              section={selectedSection} 
              onUpdate={(settings) => onUpdateSectionSettings(selectedSection.id, settings)}
            />
          ) : null
        )}
      </div>
    </div>
  );
}

// ============================================
// SECTION CONTENT EDITOR
// ============================================

interface SectionContentEditorProps {
  section: WebsiteSection;
  onUpdate: (settings: SectionSettings) => void;
}

function SectionContentEditor({ section }: SectionContentEditorProps) {
  const data = section.data as Record<string, unknown>;

  // Different editors based on section type
  switch (section.type) {
    case 'hero-slider':
      return <HeroSliderEditor data={data} onChange={() => {}} />;
    case 'featured-collection':
    case 'product-carousel':
      return <FeaturedCollectionEditor data={data} onChange={() => {}} />;
    case 'testimonials':
      return <TestimonialsEditor data={data} onChange={() => {}} />;
    default:
      return <GenericDataEditor data={data} onChange={() => {}} />;
  }
}

// ============================================
// SECTION STYLE EDITOR
// ============================================

interface SectionStyleEditorProps {
  section: WebsiteSection;
  onUpdate: (settings: SectionSettings) => void;
}

function SectionStyleEditor({ section, onUpdate }: SectionStyleEditorProps) {
  const settings = section.settings || {};

  return (
    <div className="space-y-6">
      {/* Background */}
      <CollapsibleSection title="Background" icon={Palette} defaultOpen>
        <div className="space-y-4">
          <ColorInput
            label="Background Color"
            value={settings.backgroundColor || ''}
            onChange={(value) => onUpdate({ ...settings, backgroundColor: value })}
          />
          <TextInput
            label="Background Image URL"
            value={settings.backgroundImage || ''}
            onChange={(value) => onUpdate({ ...settings, backgroundImage: value })}
            placeholder="https://..."
          />
          {settings.backgroundImage && (
            <>
              <SelectInput
                label="Background Size"
                value={settings.backgroundSize || 'cover'}
                onChange={(value) => onUpdate({ ...settings, backgroundSize: value as SectionSettings['backgroundSize'] })}
                options={[
                  { value: 'cover', label: 'Cover' },
                  { value: 'contain', label: 'Contain' },
                  { value: 'auto', label: 'Auto' },
                ]}
              />
              <ColorInput
                label="Overlay Color"
                value={settings.backgroundOverlay || ''}
                onChange={(value) => onUpdate({ ...settings, backgroundOverlay: value })}
              />
              <RangeInput
                label="Overlay Opacity"
                value={settings.backgroundOverlayOpacity || 50}
                onChange={(value) => onUpdate({ ...settings, backgroundOverlayOpacity: value })}
                min={0}
                max={100}
                step={5}
              />
            </>
          )}
        </div>
      </CollapsibleSection>

      {/* Spacing */}
      <CollapsibleSection title="Spacing" icon={Layout} defaultOpen>
        <div className="space-y-4">
          <NumberInput
            label="Padding Top"
            value={settings.paddingTop || 0}
            onChange={(value) => onUpdate({ ...settings, paddingTop: value })}
            unit="px"
          />
          <NumberInput
            label="Padding Bottom"
            value={settings.paddingBottom || 0}
            onChange={(value) => onUpdate({ ...settings, paddingBottom: value })}
            unit="px"
          />
          <NumberInput
            label="Min Height"
            value={settings.minHeight || 0}
            onChange={(value) => onUpdate({ ...settings, minHeight: value })}
            unit="px"
          />
        </div>
      </CollapsibleSection>

      {/* Layout */}
      <CollapsibleSection title="Layout" icon={Layout}>
        <div className="space-y-4">
          <SelectInput
            label="Max Width"
            value={settings.maxWidth || 'xl'}
            onChange={(value) => onUpdate({ ...settings, maxWidth: value as SectionSettings['maxWidth'] })}
            options={[
              { value: 'sm', label: 'Small (640px)' },
              { value: 'md', label: 'Medium (768px)' },
              { value: 'lg', label: 'Large (1024px)' },
              { value: 'xl', label: 'Extra Large (1280px)' },
              { value: '2xl', label: '2XL (1536px)' },
              { value: 'full', label: 'Full Width' },
            ]}
          />
          <SelectInput
            label="Content Alignment"
            value={settings.contentAlignment || 'center'}
            onChange={(value) => onUpdate({ ...settings, contentAlignment: value as SectionSettings['contentAlignment'] })}
            options={[
              { value: 'left', label: 'Left' },
              { value: 'center', label: 'Center' },
              { value: 'right', label: 'Right' },
            ]}
          />
          <ToggleInput
            label="Full Width"
            value={settings.fullWidth || false}
            onChange={(value) => onUpdate({ ...settings, fullWidth: value })}
          />
        </div>
      </CollapsibleSection>

      {/* Visibility */}
      <CollapsibleSection title="Visibility" icon={Eye}>
        <div className="space-y-4">
          <ToggleInput
            label="Hide Section"
            value={settings.isHidden || false}
            onChange={(value) => onUpdate({ ...settings, isHidden: value })}
          />
          <ToggleInput
            label="Hide on Mobile"
            value={settings.hideOnMobile || false}
            onChange={(value) => onUpdate({ ...settings, hideOnMobile: value })}
          />
          <ToggleInput
            label="Hide on Desktop"
            value={settings.hideOnDesktop || false}
            onChange={(value) => onUpdate({ ...settings, hideOnDesktop: value })}
          />
        </div>
      </CollapsibleSection>
    </div>
  );
}

// ============================================
// BLOCK CONTENT EDITOR
// ============================================

interface BlockContentEditorProps {
  block: WebsiteBlock;
  onUpdate: (updates: Partial<WebsiteBlock>) => void;
}

function BlockContentEditor({ block, onUpdate }: BlockContentEditorProps) {
  const data = block.data as Record<string, unknown>;

  const updateData = (key: string, value: unknown) => {
    onUpdate({ data: { ...data, [key]: value } });
  };

  switch (block.type) {
    case 'heading':
    case 'subheading':
    case 'paragraph':
      return (
        <div className="space-y-4">
          <TextInput
            label="Text"
            value={(data.text as string) || ''}
            onChange={(value) => updateData('text', value)}
            multiline={block.type === 'paragraph'}
          />
          {block.type === 'heading' && (
            <SelectInput
              label="Heading Level"
              value={(data.level as string) || 'h2'}
              onChange={(value) => updateData('level', value)}
              options={[
                { value: 'h1', label: 'H1' },
                { value: 'h2', label: 'H2' },
                { value: 'h3', label: 'H3' },
                { value: 'h4', label: 'H4' },
                { value: 'h5', label: 'H5' },
                { value: 'h6', label: 'H6' },
              ]}
            />
          )}
        </div>
      );

    case 'image':
      return (
        <div className="space-y-4">
          <TextInput
            label="Image URL"
            value={(data.src as string) || ''}
            onChange={(value) => updateData('src', value)}
            placeholder="https://..."
          />
          <TextInput
            label="Alt Text"
            value={(data.alt as string) || ''}
            onChange={(value) => updateData('alt', value)}
            placeholder="Describe the image"
          />
          <TextInput
            label="Link (optional)"
            value={(data.link as string) || ''}
            onChange={(value) => updateData('link', value)}
            placeholder="https://..."
          />
        </div>
      );

    case 'button':
      return (
        <div className="space-y-4">
          <TextInput
            label="Button Text"
            value={(data.text as string) || ''}
            onChange={(value) => updateData('text', value)}
          />
          <TextInput
            label="Link URL"
            value={(data.link as string) || ''}
            onChange={(value) => updateData('link', value)}
            placeholder="https:// or /page"
          />
          <ToggleInput
            label="Open in New Tab"
            value={(data.openInNewTab as boolean) || false}
            onChange={(value) => updateData('openInNewTab', value)}
          />
        </div>
      );

    case 'testimonial-card':
      return (
        <div className="space-y-4">
          <TextInput
            label="Quote"
            value={(data.quote as string) || ''}
            onChange={(value) => updateData('quote', value)}
            multiline
          />
          <TextInput
            label="Author Name"
            value={(data.author as string) || ''}
            onChange={(value) => updateData('author', value)}
          />
          <TextInput
            label="Role/Title"
            value={(data.role as string) || ''}
            onChange={(value) => updateData('role', value)}
          />
          <NumberInput
            label="Rating"
            value={(data.rating as number) || 5}
            onChange={(value) => updateData('rating', value)}
            min={1}
            max={5}
          />
          <TextInput
            label="Avatar URL"
            value={(data.avatar as string) || ''}
            onChange={(value) => updateData('avatar', value)}
            placeholder="https://..."
          />
        </div>
      );

    case 'service-card':
    case 'feature-card':
      return (
        <div className="space-y-4">
          <TextInput
            label="Title"
            value={(data.title as string) || ''}
            onChange={(value) => updateData('title', value)}
          />
          <TextInput
            label="Description"
            value={(data.description as string) || ''}
            onChange={(value) => updateData('description', value)}
            multiline
          />
          <TextInput
            label="Icon Name"
            value={(data.icon as string) || ''}
            onChange={(value) => updateData('icon', value)}
            placeholder="e.g., Star, Heart, Package"
          />
          <TextInput
            label="Link (optional)"
            value={(data.link as string) || ''}
            onChange={(value) => updateData('link', value)}
          />
        </div>
      );

    case 'spacer':
      return (
        <div className="space-y-4">
          <NumberInput
            label="Height"
            value={(data.height as number) || 40}
            onChange={(value) => updateData('height', value)}
            unit="px"
            min={8}
            max={200}
          />
        </div>
      );

    case 'divider':
      return (
        <div className="space-y-4">
          <SelectInput
            label="Style"
            value={(data.style as string) || 'solid'}
            onChange={(value) => updateData('style', value)}
            options={[
              { value: 'solid', label: 'Solid' },
              { value: 'dashed', label: 'Dashed' },
              { value: 'dotted', label: 'Dotted' },
            ]}
          />
          <NumberInput
            label="Thickness"
            value={(data.thickness as number) || 1}
            onChange={(value) => updateData('thickness', value)}
            unit="px"
            min={1}
            max={10}
          />
          <ColorInput
            label="Color"
            value={(data.color as string) || '#e5e7eb'}
            onChange={(value) => updateData('color', value)}
          />
        </div>
      );

    default:
      return <GenericDataEditor data={data} onChange={(newData) => onUpdate({ data: newData })} />;
  }
}

// ============================================
// BLOCK STYLE EDITOR
// ============================================

interface BlockStyleEditorProps {
  block: WebsiteBlock;
  onUpdate: (settings: BlockSettings) => void;
}

function BlockStyleEditor({ block, onUpdate }: BlockStyleEditorProps) {
  const settings = block.settings || {};

  return (
    <div className="space-y-6">
      {/* Typography */}
      {['heading', 'subheading', 'paragraph', 'rich-text'].includes(block.type) && (
        <CollapsibleSection title="Typography" icon={Type} defaultOpen>
          <div className="space-y-4">
            <SelectInput
              label="Font Size"
              value={settings.fontSize || 'base'}
              onChange={(value) => onUpdate({ ...settings, fontSize: value as BlockSettings['fontSize'] })}
              options={[
                { value: 'xs', label: 'Extra Small' },
                { value: 'sm', label: 'Small' },
                { value: 'base', label: 'Base' },
                { value: 'lg', label: 'Large' },
                { value: 'xl', label: 'XL' },
                { value: '2xl', label: '2XL' },
                { value: '3xl', label: '3XL' },
                { value: '4xl', label: '4XL' },
              ]}
            />
            <SelectInput
              label="Font Weight"
              value={settings.fontWeight || 'normal'}
              onChange={(value) => onUpdate({ ...settings, fontWeight: value as BlockSettings['fontWeight'] })}
              options={[
                { value: 'light', label: 'Light' },
                { value: 'normal', label: 'Normal' },
                { value: 'medium', label: 'Medium' },
                { value: 'semibold', label: 'Semibold' },
                { value: 'bold', label: 'Bold' },
              ]}
            />
            <div className="flex gap-2">
              <button
                onClick={() => onUpdate({ ...settings, textAlign: 'left' })}
                className={`flex-1 p-2 rounded-lg border ${settings.textAlign === 'left' ? 'border-[#06b6d4] bg-[#06b6d4]/10' : 'border-gray-200 dark:border-gray-700'}`}
              >
                <AlignLeft className="w-4 h-4 mx-auto" />
              </button>
              <button
                onClick={() => onUpdate({ ...settings, textAlign: 'center' })}
                className={`flex-1 p-2 rounded-lg border ${settings.textAlign === 'center' ? 'border-[#06b6d4] bg-[#06b6d4]/10' : 'border-gray-200 dark:border-gray-700'}`}
              >
                <AlignCenter className="w-4 h-4 mx-auto" />
              </button>
              <button
                onClick={() => onUpdate({ ...settings, textAlign: 'right' })}
                className={`flex-1 p-2 rounded-lg border ${settings.textAlign === 'right' ? 'border-[#06b6d4] bg-[#06b6d4]/10' : 'border-gray-200 dark:border-gray-700'}`}
              >
                <AlignRight className="w-4 h-4 mx-auto" />
              </button>
            </div>
            <ColorInput
              label="Text Color"
              value={settings.textColor || ''}
              onChange={(value) => onUpdate({ ...settings, textColor: value })}
            />
          </div>
        </CollapsibleSection>
      )}

      {/* Button Style */}
      {block.type === 'button' && (
        <CollapsibleSection title="Button Style" icon={Link} defaultOpen>
          <div className="space-y-4">
            <SelectInput
              label="Variant"
              value={settings.buttonVariant || 'primary'}
              onChange={(value) => onUpdate({ ...settings, buttonVariant: value as BlockSettings['buttonVariant'] })}
              options={[
                { value: 'primary', label: 'Primary' },
                { value: 'secondary', label: 'Secondary' },
                { value: 'outline', label: 'Outline' },
                { value: 'ghost', label: 'Ghost' },
              ]}
            />
            <SelectInput
              label="Size"
              value={settings.buttonSize || 'md'}
              onChange={(value) => onUpdate({ ...settings, buttonSize: value as BlockSettings['buttonSize'] })}
              options={[
                { value: 'xs', label: 'Extra Small' },
                { value: 'sm', label: 'Small' },
                { value: 'md', label: 'Medium' },
                { value: 'lg', label: 'Large' },
                { value: 'xl', label: 'Extra Large' },
              ]}
            />
            <ToggleInput
              label="Full Width"
              value={settings.buttonFullWidth || false}
              onChange={(value) => onUpdate({ ...settings, buttonFullWidth: value })}
            />
          </div>
        </CollapsibleSection>
      )}

      {/* Image Style */}
      {block.type === 'image' && (
        <CollapsibleSection title="Image Style" icon={Image} defaultOpen>
          <div className="space-y-4">
            <SelectInput
              label="Width"
              value={settings.imageWidth || 'full'}
              onChange={(value) => onUpdate({ ...settings, imageWidth: value as BlockSettings['imageWidth'] })}
              options={[
                { value: 'auto', label: 'Auto' },
                { value: 'full', label: 'Full Width' },
                { value: 'half', label: 'Half' },
                { value: 'third', label: 'Third' },
              ]}
            />
            <SelectInput
              label="Object Fit"
              value={settings.objectFit || 'cover'}
              onChange={(value) => onUpdate({ ...settings, objectFit: value as BlockSettings['objectFit'] })}
              options={[
                { value: 'cover', label: 'Cover' },
                { value: 'contain', label: 'Contain' },
                { value: 'fill', label: 'Fill' },
              ]}
            />
            <SelectInput
              label="Border Radius"
              value={settings.borderRadius || 'none'}
              onChange={(value) => onUpdate({ ...settings, borderRadius: value as BlockSettings['borderRadius'] })}
              options={[
                { value: 'none', label: 'None' },
                { value: 'sm', label: 'Small' },
                { value: 'md', label: 'Medium' },
                { value: 'lg', label: 'Large' },
                { value: 'xl', label: 'Extra Large' },
                { value: '2xl', label: '2XL' },
                { value: 'full', label: 'Full (Circle)' },
              ]}
            />
          </div>
        </CollapsibleSection>
      )}

      {/* Spacing */}
      <CollapsibleSection title="Spacing" icon={Layout}>
        <div className="space-y-4">
          <NumberInput
            label="Margin Bottom"
            value={settings.marginBottom || 0}
            onChange={(value) => onUpdate({ ...settings, marginBottom: value })}
            unit="px"
          />
          <NumberInput
            label="Margin Top"
            value={settings.marginTop || 0}
            onChange={(value) => onUpdate({ ...settings, marginTop: value })}
            unit="px"
          />
        </div>
      </CollapsibleSection>

      {/* Appearance */}
      <CollapsibleSection title="Appearance" icon={Palette}>
        <div className="space-y-4">
          <ColorInput
            label="Background Color"
            value={settings.backgroundColor || ''}
            onChange={(value) => onUpdate({ ...settings, backgroundColor: value })}
          />
          <SelectInput
            label="Shadow"
            value={settings.shadow || 'none'}
            onChange={(value) => onUpdate({ ...settings, shadow: value as BlockSettings['shadow'] })}
            options={[
              { value: 'none', label: 'None' },
              { value: 'sm', label: 'Small' },
              { value: 'md', label: 'Medium' },
              { value: 'lg', label: 'Large' },
              { value: 'xl', label: 'Extra Large' },
            ]}
          />
        </div>
      </CollapsibleSection>
    </div>
  );
}

// ============================================
// SPECIFIC SECTION EDITORS
// ============================================

function HeroSliderEditor({ data, onChange }: { data: Record<string, unknown>; onChange: (data: Record<string, unknown>) => void }) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">Edit hero slider content in the preview or data panel.</p>
      <ToggleInput
        label="Autoplay"
        value={(data.autoplay as boolean) || false}
        onChange={(value) => onChange({ ...data, autoplay: value })}
      />
      <NumberInput
        label="Autoplay Speed"
        value={(data.autoplaySpeed as number) || 5000}
        onChange={(value) => onChange({ ...data, autoplaySpeed: value })}
        unit="ms"
      />
      <ToggleInput
        label="Show Arrows"
        value={(data.showArrows as boolean) || true}
        onChange={(value) => onChange({ ...data, showArrows: value })}
      />
      <ToggleInput
        label="Show Dots"
        value={(data.showDots as boolean) || false}
        onChange={(value) => onChange({ ...data, showDots: value })}
      />
    </div>
  );
}

function FeaturedCollectionEditor({ data, onChange }: { data: Record<string, unknown>; onChange: (data: Record<string, unknown>) => void }) {
  return (
    <div className="space-y-4">
      <TextInput
        label="Title"
        value={(data.title as string) || ''}
        onChange={(value) => onChange({ ...data, title: value })}
      />
      <TextInput
        label="Subtitle"
        value={(data.subtitle as string) || ''}
        onChange={(value) => onChange({ ...data, subtitle: value })}
      />
      <NumberInput
        label="Products to Show"
        value={(data.limit as number) || 8}
        onChange={(value) => onChange({ ...data, limit: value })}
        min={1}
        max={20}
      />
      <ToggleInput
        label="Show Quick Add"
        value={(data.showQuickAdd as boolean) || true}
        onChange={(value) => onChange({ ...data, showQuickAdd: value })}
      />
      <ToggleInput
        label="Show Wishlist"
        value={(data.showWishlist as boolean) || true}
        onChange={(value) => onChange({ ...data, showWishlist: value })}
      />
      <ToggleInput
        label="Show Rating"
        value={(data.showRating as boolean) || true}
        onChange={(value) => onChange({ ...data, showRating: value })}
      />
    </div>
  );
}

function TestimonialsEditor({ data, onChange }: { data: Record<string, unknown>; onChange: (data: Record<string, unknown>) => void }) {
  return (
    <div className="space-y-4">
      <TextInput
        label="Title"
        value={(data.title as string) || ''}
        onChange={(value) => onChange({ ...data, title: value })}
      />
      <TextInput
        label="Subtitle"
        value={(data.subtitle as string) || ''}
        onChange={(value) => onChange({ ...data, subtitle: value })}
      />
      <ToggleInput
        label="Show Rating Stars"
        value={(data.showRating as boolean) || true}
        onChange={(value) => onChange({ ...data, showRating: value })}
      />
      <ToggleInput
        label="Show Avatars"
        value={(data.showAvatar as boolean) || true}
        onChange={(value) => onChange({ ...data, showAvatar: value })}
      />
    </div>
  );
}

function GenericDataEditor({ data, onChange }: { data: Record<string, unknown>; onChange: (data: Record<string, unknown>) => void }) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Edit section data by modifying the JSON below.
      </p>
      <textarea
        value={JSON.stringify(data, null, 2)}
        onChange={(e) => {
          try {
            const parsed = JSON.parse(e.target.value);
            onChange(parsed);
          } catch {
            // Invalid JSON, ignore
          }
        }}
        className="w-full h-64 p-3 text-xs font-mono bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg resize-none focus:ring-2 focus:ring-[#06b6d4] focus:border-transparent"
      />
    </div>
  );
}

// ============================================
// REUSABLE INPUT COMPONENTS
// ============================================

interface CollapsibleSectionProps {
  title: string;
  icon?: React.ElementType;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

function CollapsibleSection({ title, icon: Icon, defaultOpen = false, children }: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors"
      >
        <div className="flex items-center gap-2">
          {Icon && <Icon className="w-4 h-4 text-gray-500" />}
          <span className="text-sm font-medium text-gray-900 dark:text-white">{title}</span>
        </div>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-gray-500" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-500" />
        )}
      </button>
      {isOpen && <div className="p-4 space-y-4">{children}</div>}
    </div>
  );
}

interface TextInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  multiline?: boolean;
}

function TextInput({ label, value, onChange, placeholder, multiline }: TextInputProps) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
        {label}
      </label>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={3}
          className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-[#06b6d4] focus:border-transparent resize-none"
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-[#06b6d4] focus:border-transparent"
        />
      )}
    </div>
  );
}

interface NumberInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  unit?: string;
}

function NumberInput({ label, value, onChange, min, max, unit }: NumberInputProps) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
        {label}
      </label>
      <div className="flex items-center gap-2">
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          min={min}
          max={max}
          className="flex-1 px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-[#06b6d4] focus:border-transparent"
        />
        {unit && <span className="text-xs text-gray-500">{unit}</span>}
      </div>
    </div>
  );
}

interface ColorInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

function ColorInput({ label, value, onChange }: ColorInputProps) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
        {label}
      </label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value || '#ffffff'}
          onChange={(e) => onChange(e.target.value)}
          className="w-10 h-10 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#000000"
          className="flex-1 px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-[#06b6d4] focus:border-transparent"
        />
      </div>
    </div>
  );
}

interface SelectInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}

function SelectInput({ label, value, onChange, options }: SelectInputProps) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-[#06b6d4] focus:border-transparent"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

interface ToggleInputProps {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
}

function ToggleInput({ label, value, onChange }: ToggleInputProps) {
  return (
    <div className="flex items-center justify-between">
      <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
      <button
        onClick={() => onChange(!value)}
        className={`relative w-10 h-6 rounded-full transition-colors ${
          value ? 'bg-[#06b6d4]' : 'bg-gray-200 dark:bg-gray-700'
        }`}
      >
        <span
          className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
            value ? 'translate-x-4' : ''
          }`}
        />
      </button>
    </div>
  );
}

interface RangeInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
}

function RangeInput({ label, value, onChange, min, max, step = 1 }: RangeInputProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
        <span className="text-xs text-gray-500">{value}%</span>
      </div>
      <input
        type="range"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        min={min}
        max={max}
        step={step}
        className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#06b6d4]"
      />
    </div>
  );
}
