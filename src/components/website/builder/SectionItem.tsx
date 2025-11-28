'use client';

import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { WebsiteSection, WebsiteBlock } from '@/types/website';
import { getSectionTypeName, getAvailableBlockTypes, getBlockTypeName } from './blockTemplates';
import BlockItem from './BlockItem';
import {
  GripVertical,
  ChevronRight,
  ChevronDown,
  Eye,
  EyeOff,
  Copy,
  Trash2,
  Plus,
  Briefcase,
  ShoppingBag,
  Square,
  Image,
  LayoutTemplate,
} from 'lucide-react';

interface SectionItemProps {
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


export default function SectionItem({
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
}: SectionItemProps) {
  const [showAddBlockMenu, setShowAddBlockMenu] = useState(false);
  
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

  const isHidden = section.settings?.isHidden;
  // Map section types to icons
  const getIconForSectionType = (type: string) => {
    if (type.includes('hero')) return Image;
    if (type.includes('header')) return LayoutTemplate;
    if (type.includes('footer')) return LayoutTemplate;
    if (type.includes('product')) return ShoppingBag;
    if (type.includes('service')) return Briefcase;
    return Square;
  };
  const IconComponent = getIconForSectionType(section.type);
  const availableBlockTypes = getAvailableBlockTypes(section.type);

  const handleAddBlock = (type: WebsiteBlock['type']) => {
    onAddBlock(type);
    setShowAddBlockMenu(false);
  };

  return (
    <div ref={setNodeRef} style={style} className="group">
      {/* Section Header */}
      <div
        className={`flex items-center gap-1 px-2 py-2 rounded-lg cursor-pointer transition-colors ${
          isSelected
            ? 'bg-[#06b6d4]/10 border border-[#06b6d4]/30'
            : 'hover:bg-gray-100 dark:hover:bg-gray-800 border border-transparent'
        } ${isHidden ? 'opacity-50' : ''}`}
        onClick={onSelect}
      >
        {/* Drag Handle */}
        <button
          className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-grab active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="w-4 h-4" />
        </button>

        {/* Expand/Collapse */}
        <button
          className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
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

        {/* Icon */}
        <IconComponent className={`w-4 h-4 ${isSelected ? 'text-[#06b6d4]' : 'text-gray-500 dark:text-gray-400'}`} />

        {/* Name */}
        <span className={`flex-1 text-sm font-medium truncate ${
          isSelected ? 'text-[#06b6d4]' : 'text-gray-700 dark:text-gray-300'
        }`}>
          {getSectionTypeName(section.type)}
        </span>

        {/* Actions (visible on hover or selected) */}
        <div className={`flex items-center gap-0.5 ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}>
          <button
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            onClick={(e) => {
              e.stopPropagation();
              onToggleVisibility();
            }}
            title={isHidden ? 'Show section' : 'Hide section'}
          >
            {isHidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          </button>
          <button
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate();
            }}
            title="Duplicate section"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button
            className="p-1 text-gray-400 hover:text-red-500"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            title="Delete section"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Blocks (when expanded) */}
      {isExpanded && (
        <div className="ml-4 mt-1 pl-4 border-l-2 border-gray-200 dark:border-gray-700">
          {section.blocks && section.blocks.length > 0 ? (
            <SortableContext
              items={section.blocks.map(b => b.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-1">
                {section.blocks.map((block) => (
                  <BlockItem
                    key={block.id}
                    block={block}
                    isSelected={selectedBlockId === block.id}
                    onSelect={() => onSelectBlock(block.id)}
                    onDelete={() => onDeleteBlock(block.id)}
                    onDuplicate={() => onDuplicateBlock(block.id)}
                  />
                ))}
              </div>
            </SortableContext>
          ) : (
            <div className="py-2 text-xs text-gray-400 dark:text-gray-500 text-center">
              No blocks
            </div>
          )}

          {/* Add Block Button */}
          <div className="relative mt-2">
            <button
              onClick={() => setShowAddBlockMenu(!showAddBlockMenu)}
              className="flex items-center gap-1 px-2 py-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-[#06b6d4] hover:bg-[#06b6d4]/10 rounded w-full transition-colors"
            >
              <Plus className="w-3 h-3" />
              Add Block
            </button>

            {/* Add Block Dropdown */}
            {showAddBlockMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowAddBlockMenu(false)}
                />
                <div className="absolute left-0 top-full mt-1 z-20 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 min-w-[160px]">
                  {availableBlockTypes.map(type => (
                    <button
                      key={type}
                      onClick={() => handleAddBlock(type)}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      {getBlockTypeName(type)}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}


