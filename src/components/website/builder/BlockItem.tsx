'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { WebsiteBlock } from '@/types/website';
import { getBlockTypeName } from './blockTemplates';
import {
  GripVertical,
  Copy,
  Trash2,
  Text,
  Image,
  MousePointer2,
  Package,
  Square,
} from 'lucide-react';

interface BlockItemProps {
  block: WebsiteBlock;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
}


export default function BlockItem({
  block,
  isSelected,
  onSelect,
  onDelete,
  onDuplicate,
}: BlockItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  // Map block types to icons
  const getIconForBlockType = (type: string) => {
    if (type.includes('text') || type.includes('heading')) return Text;
    if (type.includes('image')) return Image;
    if (type.includes('button')) return MousePointer2;
    if (type.includes('product')) return Package;
    return Square;
  };
  const IconComponent = getIconForBlockType(block.type);

  // Get preview text from block data
  const getPreviewText = () => {
    const text = block.data?.text;
    const title = block.data?.title;
    const src = block.data?.src;
    
    if (typeof text === 'string' && text) {
      return text.slice(0, 30) + (text.length > 30 ? '...' : '');
    }
    if (typeof title === 'string' && title) {
      return title.slice(0, 30) + (title.length > 30 ? '...' : '');
    }
    if (src) {
      return 'Image';
    }
    return getBlockTypeName(block.type);
  };

  return (
    <div ref={setNodeRef} style={style} className="group">
      <div
        className={`flex items-center gap-1 px-2 py-1.5 rounded cursor-pointer transition-colors ${
          isSelected
            ? 'bg-[#0f7aff]/10 border border-[#0f7aff]/30'
            : 'hover:bg-gray-50 dark:hover:bg-gray-800/50 border border-transparent'
        }`}
        onClick={onSelect}
      >
        {/* Drag Handle */}
        <button
          className="p-0.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-grab active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="w-3 h-3" />
        </button>

        {/* Icon */}
        <IconComponent className={`w-3 h-3 ${isSelected ? 'text-[#0f7aff]' : 'text-gray-400 dark:text-gray-500'}`} />

        {/* Name/Preview */}
        <span className={`flex-1 text-xs truncate ${
          isSelected ? 'text-[#0f7aff]' : 'text-gray-600 dark:text-gray-400'
        }`}>
          {getPreviewText()}
        </span>

        {/* Actions */}
        <div className={`flex items-center gap-0.5 ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}>
          <button
            className="p-0.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate();
            }}
            title="Duplicate block"
          >
            <Copy className="w-3 h-3" />
          </button>
          <button
            className="p-0.5 text-gray-400 hover:text-red-500"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            title="Delete block"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}


