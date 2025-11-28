'use client';

import React, { useState } from 'react';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { WebsiteSection, SectionType, getSectionDisplayName, getBlockDisplayName } from '@/types/website';
import { sectionTemplates, sectionCategories, SectionCategory } from './blockTemplates';
import { 
  Plus, 
  ChevronDown, 
  ChevronRight, 
  GripVertical, 
  Trash2, 
  Copy, 
  Eye, 
  EyeOff,
  Layers,
  LayoutGrid,
  Image,
  ShoppingBag,
  FileText,
  MessageSquare,
  Tag,
  Mail,
  LayoutTemplate,
} from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface BuilderSidebarProps {
  layout: WebsiteSection[];
  selectedSectionId: string | null;
  selectedBlockId: string | null;
  onSelectSection: (id: string | null) => void;
  onSelectBlock: (sectionId: string, blockId: string) => void;
  onAddSection: (type: SectionType) => void;
  onDeleteSection: (id: string) => void;
  onDuplicateSection: (id: string) => void;
  onToggleVisibility: (id: string) => void;
  onDeleteBlock: (sectionId: string, blockId: string) => void;
}

type Tab = 'sections' | 'add';

const categoryIcons: Record<string, React.ElementType> = {
  header: LayoutTemplate,
  hero: Image,
  product: ShoppingBag,
  content: FileText,
  testimonial: MessageSquare,
  promo: Tag,
  newsletter: Mail,
  footer: LayoutGrid,
};

export default function BuilderSidebar({
  layout,
  selectedSectionId,
  selectedBlockId,
  onSelectSection,
  onSelectBlock,
  onAddSection,
  onDeleteSection,
  onDuplicateSection,
  onToggleVisibility,
  onDeleteBlock,
}: BuilderSidebarProps) {
  const [activeTab, setActiveTab] = useState<Tab>('sections');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState<SectionCategory | 'all'>('all');

  const toggleExpanded = (sectionId: string) => {
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

  const filteredTemplates = selectedCategory === 'all' 
    ? sectionTemplates 
    : sectionTemplates.filter(t => t.category === selectedCategory);

  return (
    <div className="flex flex-col h-full">
      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-800 shrink-0">
        <button
          onClick={() => setActiveTab('sections')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'sections'
              ? 'text-[#06b6d4] border-b-2 border-[#06b6d4]'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <Layers className="w-4 h-4" />
            Sections
          </div>
        </button>
        <button
          onClick={() => setActiveTab('add')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'add'
              ? 'text-[#06b6d4] border-b-2 border-[#06b6d4]'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <Plus className="w-4 h-4" />
            Add Section
          </div>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'sections' ? (
          <SectionsList
            layout={layout}
            selectedSectionId={selectedSectionId}
            selectedBlockId={selectedBlockId}
            expandedSections={expandedSections}
            onSelectSection={onSelectSection}
            onSelectBlock={onSelectBlock}
            onToggleExpanded={toggleExpanded}
            onDeleteSection={onDeleteSection}
            onDuplicateSection={onDuplicateSection}
            onToggleVisibility={onToggleVisibility}
            onDeleteBlock={onDeleteBlock}
          />
        ) : (
          <AddSectionPanel
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            templates={filteredTemplates}
            onAddSection={(type) => {
              onAddSection(type);
              setActiveTab('sections');
            }}
          />
        )}
      </div>
    </div>
  );
}

// ============================================
// SECTIONS LIST TAB
// ============================================

interface SectionsListProps {
  layout: WebsiteSection[];
  selectedSectionId: string | null;
  selectedBlockId: string | null;
  expandedSections: Set<string>;
  onSelectSection: (id: string | null) => void;
  onSelectBlock: (sectionId: string, blockId: string) => void;
  onToggleExpanded: (sectionId: string) => void;
  onDeleteSection: (id: string) => void;
  onDuplicateSection: (id: string) => void;
  onToggleVisibility: (id: string) => void;
  onDeleteBlock: (sectionId: string, blockId: string) => void;
}

function SectionsList({
  layout,
  selectedSectionId,
  selectedBlockId,
  expandedSections,
  onSelectSection,
  onSelectBlock,
  onToggleExpanded,
  onDeleteSection,
  onDuplicateSection,
  onToggleVisibility,
  onDeleteBlock,
}: SectionsListProps) {
  if (layout.length === 0) {
    return (
      <div className="p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
          <Layers className="w-8 h-8 text-gray-400" />
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          No sections yet. Add your first section to start building your page.
        </p>
      </div>
    );
  }

  return (
    <div className="p-2">
      <SortableContext items={layout.map(s => s.id)} strategy={verticalListSortingStrategy}>
        {layout.map((section) => (
          <SortableSectionItem
            key={section.id}
            section={section}
            isSelected={selectedSectionId === section.id}
            isExpanded={expandedSections.has(section.id)}
            selectedBlockId={selectedSectionId === section.id ? selectedBlockId : null}
            onSelect={() => onSelectSection(section.id)}
            onToggleExpand={() => onToggleExpanded(section.id)}
            onDelete={() => onDeleteSection(section.id)}
            onDuplicate={() => onDuplicateSection(section.id)}
            onToggleVisibility={() => onToggleVisibility(section.id)}
            onSelectBlock={(blockId) => onSelectBlock(section.id, blockId)}
            onDeleteBlock={(blockId) => onDeleteBlock(section.id, blockId)}
          />
        ))}
      </SortableContext>
    </div>
  );
}

// ============================================
// SORTABLE SECTION ITEM
// ============================================

interface SortableSectionItemProps {
  section: WebsiteSection;
  isSelected: boolean;
  isExpanded: boolean;
  selectedBlockId: string | null;
  onSelect: () => void;
  onToggleExpand: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onToggleVisibility: () => void;
  onSelectBlock: (blockId: string) => void;
  onDeleteBlock: (blockId: string) => void;
}

function SortableSectionItem({
  section,
  isSelected,
  isExpanded,
  selectedBlockId,
  onSelect,
  onToggleExpand,
  onDelete,
  onDuplicate,
  onToggleVisibility,
  onSelectBlock,
  onDeleteBlock,
}: SortableSectionItemProps) {
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
  };

  const isHidden = section.settings?.isHidden;
  const hasBlocks = section.blocks && section.blocks.length > 0;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`mb-2 rounded-lg overflow-hidden transition-all duration-200 ${
        isDragging ? 'opacity-50 shadow-xl' : ''
      } ${
        isSelected 
          ? 'ring-2 ring-[#06b6d4] bg-[#06b6d4]/5' 
          : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750'
      }`}
    >
      {/* Section Header */}
      <div
        className={`flex items-center gap-2 p-2 cursor-pointer ${isHidden ? 'opacity-50' : ''}`}
        onClick={onSelect}
      >
        {/* Drag Handle */}
        <button
          {...attributes}
          {...listeners}
          className="p-1 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="w-4 h-4" />
        </button>

        {/* Expand/Collapse */}
        {hasBlocks && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleExpand();
            }}
            className="p-0.5 text-gray-400 hover:text-gray-600"
          >
            {isExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
        )}
        {!hasBlocks && <div className="w-5" />}

        {/* Section Name */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
            {section.name || getSectionDisplayName(section.type)}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {section.type}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleVisibility();
            }}
            className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
            title={isHidden ? 'Show section' : 'Hide section'}
          >
            {isHidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate();
            }}
            className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
            title="Duplicate section"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-1.5 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
            title="Delete section"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Blocks List */}
      {isExpanded && hasBlocks && (
        <div className="px-2 pb-2 pl-8">
          {section.blocks!.map((block) => (
            <div
              key={block.id}
              onClick={(e) => {
                e.stopPropagation();
                onSelectBlock(block.id);
              }}
              className={`flex items-center gap-2 p-2 rounded-md cursor-pointer transition-colors ${
                selectedBlockId === block.id
                  ? 'bg-[#0f7aff]/10 text-[#0f7aff]'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <GripVertical className="w-3.5 h-3.5" />
              <span className="text-sm flex-1 truncate">
                {getBlockDisplayName(block.type)}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteBlock(block.id);
                }}
                className="p-1 rounded text-gray-400 hover:text-red-500"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================
// ADD SECTION PANEL
// ============================================

interface AddSectionPanelProps {
  selectedCategory: SectionCategory | 'all';
  onSelectCategory: (category: SectionCategory | 'all') => void;
  templates: typeof sectionTemplates;
  onAddSection: (type: SectionType) => void;
}

function AddSectionPanel({
  selectedCategory,
  onSelectCategory,
  templates,
  onAddSection,
}: AddSectionPanelProps) {
  return (
    <div className="p-4">
      {/* Category Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => onSelectCategory('all')}
          className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
            selectedCategory === 'all'
              ? 'bg-[#06b6d4] text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          All
        </button>
        {sectionCategories.map((cat) => {
          const Icon = categoryIcons[cat.id] || LayoutGrid;
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors flex items-center gap-1.5 ${
                selectedCategory === cat.id
                  ? 'bg-[#06b6d4] text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              <Icon className="w-3 h-3" />
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 gap-3">
        {templates.map((template) => (
          <button
            key={template.id}
            onClick={() => onAddSection(template.type)}
            className="group relative p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-[#06b6d4] hover:shadow-md transition-all duration-200 text-left"
          >
            {/* Thumbnail Placeholder */}
            <div className="aspect-video rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 mb-3 flex items-center justify-center overflow-hidden">
              {template.thumbnail ? (
                <img src={template.thumbnail} alt={template.name} className="w-full h-full object-cover" />
              ) : (
                <div className="text-gray-400 dark:text-gray-500">
                  {(() => {
                    const Icon = categoryIcons[template.category] || LayoutGrid;
                    return <Icon className="w-8 h-8" />;
                  })()}
                </div>
              )}
            </div>

            {/* Info */}
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1 group-hover:text-[#06b6d4] transition-colors">
              {template.name}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
              {template.description}
            </p>

            {/* Add Indicator */}
            <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-[#06b6d4] text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Plus className="w-4 h-4" />
            </div>
          </button>
        ))}
      </div>

      {/* Quick Add Section Types */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
          Quick Add
        </h4>
        <div className="grid grid-cols-2 gap-2">
          {['hero-slider', 'featured-collection', 'testimonials', 'newsletter', 'promo-banner', 'image-with-text'].map((type) => (
            <button
              key={type}
              onClick={() => onAddSection(type as SectionType)}
              className="px-3 py-2 text-xs font-medium rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-[#06b6d4] hover:text-white transition-colors text-left"
            >
              {getSectionDisplayName(type as SectionType)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
