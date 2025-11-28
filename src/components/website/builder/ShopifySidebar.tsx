'use client';

import React, { useState } from 'react';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { WebsiteSection, WebsiteBlock, SectionType } from '@/types/website';
import { getSectionTypeName, getAvailableBlockTypes, getBlockTypeName } from './blockTemplates';
import {
  GripVertical,
  ChevronRight,
  ChevronDown,
  Eye,
  EyeOff,
  Trash2,
  Plus,
  Copy,
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
  Type,
  Image,
  MousePointer2,
  Minus,
  Square,
  LayoutGrid,
} from 'lucide-react';

interface ShopifySidebarProps {
  layout: WebsiteSection[];
  selectedSectionId: string | null;
  selectedBlockId: string | null;
  onSelectSection: (id: string | null) => void;
  onSelectBlock: (sectionId: string, blockId: string) => void;
  onAddSection: (type: SectionType) => void;
  onDeleteSection: (id: string) => void;
  onDuplicateSection: (id: string) => void;
  onToggleVisibility: (id: string) => void;
  onAddBlock: (sectionId: string, blockType: WebsiteBlock['type']) => void;
  onDeleteBlock: (sectionId: string, blockId: string) => void;
  onDuplicateBlock: (sectionId: string, blockId: string) => void;
}

// Section type icons
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

// Block type icons
const blockIcons: Partial<Record<WebsiteBlock['type'], React.FC<{ className?: string }>>> = {
  title: Type,
  subtitle: Type,
  text: Type,
  image: Image,
  button: MousePointer2,
  'service-item': Briefcase,
  'product-item': ShoppingBag,
  divider: Minus,
  spacer: Square,
};

// Available section types for adding
const sectionTypes: { type: SectionType; name: string }[] = [
  { type: 'hero', name: 'Slideshow' },
  { type: 'products', name: 'Featured collection' },
  { type: 'services', name: 'Multicolumn' },
  { type: 'testimonials', name: 'Testimonials' },
  { type: 'about', name: 'Rich text' },
  { type: 'gallery', name: 'Image gallery' },
  { type: 'contact', name: 'Contact form' },
  { type: 'cta', name: 'Newsletter' },
];

export default function ShopifySidebar({
  layout,
  selectedSectionId,
  selectedBlockId,
  onSelectSection,
  onSelectBlock,
  onAddSection,
  onDeleteSection,
  onDuplicateSection,
  onToggleVisibility,
  onAddBlock,
  onDeleteBlock,
  onDuplicateBlock,
}: ShopifySidebarProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [showAddModal, setShowAddModal] = useState(false);

  const toggleExpand = (sectionId: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      return next;
    });
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Template Section Header */}
      <div className="px-4 py-3 border-b border-[#333]">
        <div className="flex items-center gap-2 text-gray-400 text-sm">
          <LayoutGrid className="w-4 h-4" />
          <span>Template</span>
        </div>
      </div>

      {/* Sections List */}
      <div className="flex-1 overflow-y-auto">
        <SortableContext
          items={layout.map(s => s.id)}
          strategy={verticalListSortingStrategy}
        >
          {layout.map((section) => (
            <SectionRow
              key={section.id}
              section={section}
              isSelected={selectedSectionId === section.id}
              selectedBlockId={selectedBlockId}
              isExpanded={expandedSections.has(section.id)}
              onSelect={() => onSelectSection(section.id)}
              onSelectBlock={(blockId) => onSelectBlock(section.id, blockId)}
              onToggleExpand={() => toggleExpand(section.id)}
              onDelete={() => onDeleteSection(section.id)}
              onDuplicate={() => onDuplicateSection(section.id)}
              onToggleVisibility={() => onToggleVisibility(section.id)}
              onAddBlock={(blockType) => onAddBlock(section.id, blockType)}
              onDeleteBlock={(blockId) => onDeleteBlock(section.id, blockId)}
              onDuplicateBlock={(blockId) => onDuplicateBlock(section.id, blockId)}
            />
          ))}
        </SortableContext>

        {/* Add Section Button */}
        <div className="p-3 border-t border-[#333]">
          <button
            onClick={() => setShowAddModal(true)}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-medium text-white bg-[#333] hover:bg-[#444] rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add section
          </button>
        </div>
      </div>

      {/* Add Section Modal */}
      {showAddModal && (
        <AddSectionModal
          onAdd={(type) => {
            onAddSection(type);
            setShowAddModal(false);
          }}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </div>
  );
}

// ============================================
// SECTION ROW
// ============================================

interface SectionRowProps {
  section: WebsiteSection;
  isSelected: boolean;
  selectedBlockId: string | null;
  isExpanded: boolean;
  onSelect: () => void;
  onSelectBlock: (blockId: string) => void;
  onToggleExpand: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onToggleVisibility: () => void;
  onAddBlock: (blockType: WebsiteBlock['type']) => void;
  onDeleteBlock: (blockId: string) => void;
  onDuplicateBlock: (blockId: string) => void;
}

function SectionRow({
  section,
  isSelected,
  selectedBlockId,
  isExpanded,
  onSelect,
  onSelectBlock,
  onToggleExpand,
  onDelete,
  onDuplicate,
  onToggleVisibility,
  onAddBlock,
  onDeleteBlock,
  onDuplicateBlock,
}: SectionRowProps) {
  const [showBlockMenu, setShowBlockMenu] = useState(false);
  const isHidden = section.settings?.isHidden;
  const IconComponent = sectionIcons[section.type] || Square;
  const hasBlocks = section.blocks && section.blocks.length > 0;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className={`group ${isHidden ? 'opacity-50' : ''}`}>
      {/* Section Header */}
      <div
        className={`flex items-center gap-1 px-3 py-2.5 cursor-pointer transition-colors border-l-2 ${
          isSelected 
            ? 'bg-[#2a2a2a] border-[#36d399]' 
            : 'border-transparent hover:bg-[#252525]'
        }`}
        onClick={onSelect}
      >
        {/* Drag Handle */}
        <button
          className="p-1 text-gray-500 hover:text-gray-300 cursor-grab active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="w-4 h-4" />
        </button>

        {/* Expand Toggle */}
        {hasBlocks && (
          <button
            className="p-1 text-gray-500 hover:text-gray-300"
            onClick={(e) => {
              e.stopPropagation();
              onToggleExpand();
            }}
          >
            {isExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
        )}
        {!hasBlocks && <div className="w-6" />}

        {/* Icon */}
        <IconComponent className={`w-4 h-4 ${isSelected ? 'text-[#36d399]' : 'text-gray-400'}`} />

        {/* Name */}
        <span className={`flex-1 text-sm truncate ${isSelected ? 'text-white' : 'text-gray-300'}`}>
          {getSectionTypeName(section.type)}
        </span>

        {/* Actions */}
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            className="p-1 text-gray-500 hover:text-gray-300"
            onClick={(e) => {
              e.stopPropagation();
              onToggleVisibility();
            }}
            title={isHidden ? 'Show' : 'Hide'}
          >
            {isHidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          </button>
          <button
            className="p-1 text-gray-500 hover:text-gray-300"
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate();
            }}
            title="Duplicate"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button
            className="p-1 text-gray-500 hover:text-red-400"
            onClick={(e) => {
              e.stopPropagation();
              if (confirm('Delete this section?')) onDelete();
            }}
            title="Delete"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Blocks (when expanded) */}
      {isExpanded && hasBlocks && (
        <div className="pl-8 border-l border-[#333] ml-6">
          {section.blocks?.map((block) => (
            <BlockRow
              key={block.id}
              block={block}
              isSelected={selectedBlockId === block.id}
              onSelect={() => onSelectBlock(block.id)}
              onDelete={() => onDeleteBlock(block.id)}
              onDuplicate={() => onDuplicateBlock(block.id)}
            />
          ))}

          {/* Add Block Button */}
          <div className="relative py-2">
            <button
              onClick={() => setShowBlockMenu(!showBlockMenu)}
              className="flex items-center gap-1 text-xs text-[#36d399] hover:text-[#4ade80] transition-colors"
            >
              <Plus className="w-3 h-3" />
              Add block
            </button>

            {showBlockMenu && (
              <BlockMenu
                sectionType={section.type}
                onAdd={(type) => {
                  onAddBlock(type);
                  setShowBlockMenu(false);
                }}
                onClose={() => setShowBlockMenu(false)}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// BLOCK ROW
// ============================================

interface BlockRowProps {
  block: WebsiteBlock;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
}

function BlockRow({ block, isSelected, onSelect, onDelete, onDuplicate }: BlockRowProps) {
  const IconComponent = blockIcons[block.type] || Square;
  
  // Get preview text
  const text = block.data?.text;
  const title = block.data?.title;
  const previewText = typeof text === 'string' ? text.slice(0, 20) : 
                      typeof title === 'string' ? title.slice(0, 20) : 
                      getBlockTypeName(block.type);

  return (
    <div
      className={`group flex items-center gap-2 px-2 py-1.5 cursor-pointer transition-colors rounded ${
        isSelected ? 'bg-[#333]' : 'hover:bg-[#2a2a2a]'
      }`}
      onClick={onSelect}
    >
      <IconComponent className={`w-3 h-3 ${isSelected ? 'text-[#36d399]' : 'text-gray-500'}`} />
      <span className={`flex-1 text-xs truncate ${isSelected ? 'text-white' : 'text-gray-400'}`}>
        {previewText}
      </span>
      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          className="p-0.5 text-gray-500 hover:text-gray-300"
          onClick={(e) => {
            e.stopPropagation();
            onDuplicate();
          }}
        >
          <Copy className="w-3 h-3" />
        </button>
        <button
          className="p-0.5 text-gray-500 hover:text-red-400"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}

// ============================================
// BLOCK MENU
// ============================================

interface BlockMenuProps {
  sectionType: SectionType;
  onAdd: (type: WebsiteBlock['type']) => void;
  onClose: () => void;
}

function BlockMenu({ sectionType, onAdd, onClose }: BlockMenuProps) {
  const availableTypes = getAvailableBlockTypes(sectionType);

  return (
    <>
      <div className="fixed inset-0 z-10" onClick={onClose} />
      <div className="absolute left-0 top-full mt-1 z-20 bg-[#2a2a2a] rounded-lg shadow-xl border border-[#444] py-1 min-w-[140px]">
        {availableTypes.map(type => {
          const IconComponent = blockIcons[type] || Square;
          return (
            <button
              key={type}
              onClick={() => onAdd(type)}
              className="flex items-center gap-2 w-full px-3 py-2 text-xs text-gray-300 hover:bg-[#333] hover:text-white transition-colors"
            >
              <IconComponent className="w-3 h-3" />
              {getBlockTypeName(type)}
            </button>
          );
        })}
      </div>
    </>
  );
}

// ============================================
// ADD SECTION MODAL
// ============================================

interface AddSectionModalProps {
  onAdd: (type: SectionType) => void;
  onClose: () => void;
}

function AddSectionModal({ onAdd, onClose }: AddSectionModalProps) {
  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-50" onClick={onClose} />
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-[#1a1a1a] rounded-xl shadow-2xl w-full max-w-lg border border-[#333]">
          {/* Header */}
          <div className="px-6 py-4 border-b border-[#333]">
            <h2 className="text-lg font-semibold text-white">Add section</h2>
            <p className="text-sm text-gray-400 mt-1">Choose a section type to add to your page</p>
          </div>

          {/* Content */}
          <div className="p-4 grid grid-cols-2 gap-3 max-h-[400px] overflow-y-auto">
            {sectionTypes.map(({ type, name }) => {
              const IconComponent = sectionIcons[type] || Square;
              return (
                <button
                  key={type}
                  onClick={() => onAdd(type)}
                  className="flex items-center gap-3 p-4 rounded-lg border border-[#333] hover:border-[#36d399] hover:bg-[#252525] transition-all text-left group"
                >
                  <div className="p-2 rounded-lg bg-[#333] group-hover:bg-[#36d399]/20 transition-colors">
                    <IconComponent className="w-5 h-5 text-gray-400 group-hover:text-[#36d399]" />
                  </div>
                  <span className="text-sm font-medium text-gray-300 group-hover:text-white">{name}</span>
                </button>
              );
            })}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-[#333] flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

