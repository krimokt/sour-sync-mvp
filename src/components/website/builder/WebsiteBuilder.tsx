'use client';

import React, { useState, useCallback, useEffect } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { supabase } from '@/lib/supabase';
import { WebsiteSection, WebsiteBlock, WebsiteSettings } from '@/types/website';
import BuilderSidebar from './BuilderSidebar';
import BuilderEditor from './BuilderEditor';
import BuilderPreview from './BuilderPreview';
import { createSection, createBlockByType } from './blockTemplates';
import { customToast } from '@/utils/toastUtils';
import { Monitor, Tablet, Smartphone } from 'lucide-react';

interface WebsiteBuilderProps {
  companyId: string;
  companySlug: string;
  initialSettings: WebsiteSettings;
}

type DevicePreview = 'desktop' | 'tablet' | 'mobile';

const showSuccessToast = (msg: string) => customToast({ variant: 'default', title: 'Success', description: msg });
const showErrorToast = (msg: string) => customToast({ variant: 'destructive', title: 'Error', description: msg });

export default function WebsiteBuilder({ companyId, companySlug, initialSettings }: WebsiteBuilderProps) {
  // Layout state - migrated sections with blocks support
  const [layout, setLayout] = useState<WebsiteSection[]>(() => 
    migrateLayout(initialSettings.homepage_layout_draft || [])
  );
  
  // Selection state
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  
  // UI state
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [devicePreview, setDevicePreview] = useState<DevicePreview>('desktop');
  
  // Active drag item for overlay
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeType, setActiveType] = useState<'section' | 'block' | null>(null);

  // DnD Sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Get selected section and block
  const selectedSection = selectedSectionId 
    ? layout.find(s => s.id === selectedSectionId) || null
    : null;
  
  const selectedBlock = selectedSection && selectedBlockId
    ? selectedSection.blocks?.find(b => b.id === selectedBlockId) || null
    : null;

  // ============================================
  // DRAG & DROP HANDLERS
  // ============================================

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);
    
    // Determine if dragging a section or block
    const isSection = layout.some(s => s.id === active.id);
    setActiveType(isSection ? 'section' : 'block');
  };

  const handleDragOver = () => {
    // Handle drag over for moving blocks between sections
    // This is optional for MVP - can be added later
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    setActiveId(null);
    setActiveType(null);

    if (!over || active.id === over.id) return;

    // Check if we're reordering sections
    const activeSectionIndex = layout.findIndex(s => s.id === active.id);
    const overSectionIndex = layout.findIndex(s => s.id === over.id);

    if (activeSectionIndex !== -1 && overSectionIndex !== -1) {
      // Reorder sections
      setLayout(arrayMove(layout, activeSectionIndex, overSectionIndex));
      return;
    }

    // Check if we're reordering blocks within a section
    if (selectedSectionId) {
      const section = layout.find(s => s.id === selectedSectionId);
      if (section?.blocks) {
        const activeBlockIndex = section.blocks.findIndex(b => b.id === active.id);
        const overBlockIndex = section.blocks.findIndex(b => b.id === over.id);

        if (activeBlockIndex !== -1 && overBlockIndex !== -1) {
          // Reorder blocks within section
          setLayout(layout.map(s => {
            if (s.id !== selectedSectionId) return s;
            return {
              ...s,
              blocks: arrayMove(s.blocks || [], activeBlockIndex, overBlockIndex),
            };
          }));
        }
      }
    }
  };

  // ============================================
  // SECTION HANDLERS
  // ============================================

  const handleAddSection = (type: WebsiteSection['type']) => {
    const newSection = createSection(type);
    setLayout([...layout, newSection]);
    setSelectedSectionId(newSection.id);
    setSelectedBlockId(null);
  };

  const handleDeleteSection = (id: string) => {
    if (confirm('Are you sure you want to delete this section?')) {
      setLayout(layout.filter(s => s.id !== id));
      if (selectedSectionId === id) {
        setSelectedSectionId(null);
        setSelectedBlockId(null);
      }
    }
  };

  const handleDuplicateSection = (id: string) => {
    const sectionToDuplicate = layout.find(s => s.id === id);
    if (!sectionToDuplicate) return;

    const duplicatedSection: WebsiteSection = {
      ...sectionToDuplicate,
      id: crypto.randomUUID(),
      blocks: sectionToDuplicate.blocks?.map(b => ({
        ...b,
        id: crypto.randomUUID(),
      })),
    };

    const index = layout.findIndex(s => s.id === id);
    const newLayout = [...layout];
    newLayout.splice(index + 1, 0, duplicatedSection);
    setLayout(newLayout);
  };

  const handleToggleSectionVisibility = (id: string) => {
    setLayout(layout.map(s => {
      if (s.id !== id) return s;
      return {
        ...s,
        settings: {
          ...s.settings,
          isHidden: !s.settings?.isHidden,
        },
      };
    }));
  };

  const handleUpdateSectionSettings = (sectionId: string, settings: WebsiteSection['settings']) => {
    setLayout(layout.map(s => {
      if (s.id !== sectionId) return s;
      return { ...s, settings };
    }));
  };

  // ============================================
  // BLOCK HANDLERS
  // ============================================

  // TODO: Re-enable when block-level UI is implemented
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _handleAddBlock = (sectionId: string, blockType: WebsiteBlock['type']) => {
    const newBlock = createBlockByType(blockType);
    setLayout(layout.map(s => {
      if (s.id !== sectionId) return s;
      return {
        ...s,
        blocks: [...(s.blocks || []), newBlock],
      };
    }));
    setSelectedBlockId(newBlock.id);
  };

  const handleDeleteBlock = (sectionId: string, blockId: string) => {
    setLayout(layout.map(s => {
      if (s.id !== sectionId) return s;
      return {
        ...s,
        blocks: s.blocks?.filter(b => b.id !== blockId) || [],
      };
    }));
    if (selectedBlockId === blockId) {
      setSelectedBlockId(null);
    }
  };

  const handleUpdateBlock = (sectionId: string, blockId: string, updates: Partial<WebsiteBlock>) => {
    setLayout(layout.map(s => {
      if (s.id !== sectionId) return s;
      return {
        ...s,
        blocks: s.blocks?.map(b => {
          if (b.id !== blockId) return b;
          return { ...b, ...updates };
        }) || [],
      };
    }));
  };

  // TODO: Re-enable when block-level UI is implemented
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _handleDuplicateBlock = (sectionId: string, blockId: string) => {
    const section = layout.find(s => s.id === sectionId);
    const blockToDuplicate = section?.blocks?.find(b => b.id === blockId);
    if (!blockToDuplicate) return;

    const duplicatedBlock: WebsiteBlock = {
      ...blockToDuplicate,
      id: crypto.randomUUID(),
    };

    setLayout(layout.map(s => {
      if (s.id !== sectionId) return s;
      const blocks = s.blocks || [];
      const index = blocks.findIndex(b => b.id === blockId);
      const newBlocks = [...blocks];
      newBlocks.splice(index + 1, 0, duplicatedBlock);
      return { ...s, blocks: newBlocks };
    }));
  };

  // ============================================
  // SAVE & PUBLISH
  // ============================================

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { error } = await (
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        supabase.from('website_settings') as any
      )
        .update({ 
          homepage_layout_draft: layout, 
          updated_at: new Date().toISOString() 
        })
        .eq('company_id', companyId);

      if (error) throw error;
      showSuccessToast('Draft saved successfully');
      
      // Send update to preview iframe
      sendPreviewUpdate(layout);
    } catch (err) {
      console.error(err);
      showErrorToast('Failed to save draft');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      const { error } = await (
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        supabase.from('website_settings') as any
      )
        .update({ 
          homepage_layout_draft: layout, 
          homepage_layout_published: layout,
          is_published: true,
          updated_at: new Date().toISOString()
        })
        .eq('company_id', companyId);

      if (error) throw error;
      showSuccessToast('Website published successfully!');
    } catch (err) {
      console.error(err);
      showErrorToast('Failed to publish website');
    } finally {
      setIsPublishing(false);
    }
  };

  // ============================================
  // PREVIEW COMMUNICATION
  // ============================================

  const sendPreviewUpdate = useCallback((layoutData: WebsiteSection[]) => {
    const iframe = document.getElementById('preview-frame') as HTMLIFrameElement;
    if (iframe?.contentWindow) {
      iframe.contentWindow.postMessage(
        { type: 'LAYOUT_UPDATE', layout: layoutData },
        '*'
      );
    }
  }, []);

  // Debounced layout update to preview
  useEffect(() => {
    const timeout = setTimeout(() => {
      sendPreviewUpdate(layout);
    }, 300);
    return () => clearTimeout(timeout);
  }, [layout, sendPreviewUpdate]);

  // ============================================
  // RENDER
  // ============================================

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex flex-col h-full bg-gray-100 dark:bg-gray-900">
        {/* Header */}
        <div className="h-14 px-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between bg-white dark:bg-gray-900 shrink-0">
          <div className="flex items-center gap-3">
            <h1 className="text-sm font-semibold text-gray-900 dark:text-white">Website Builder</h1>
            <span className="px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded text-xs font-medium">
              Draft
            </span>
          </div>
          
          {/* Preview Device Toggle */}
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setDevicePreview('desktop')}
              className={`p-1.5 rounded ${devicePreview === 'desktop' ? 'bg-white dark:bg-gray-700 shadow-sm' : 'hover:bg-white/50 dark:hover:bg-gray-700/50'}`}
              title="Desktop"
            >
              <Monitor className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>
            <button
              onClick={() => setDevicePreview('tablet')}
              className={`p-1.5 rounded ${devicePreview === 'tablet' ? 'bg-white dark:bg-gray-700 shadow-sm' : 'hover:bg-white/50 dark:hover:bg-gray-700/50'}`}
              title="Tablet"
            >
              <Tablet className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>
            <button
              onClick={() => setDevicePreview('mobile')}
              className={`p-1.5 rounded ${devicePreview === 'mobile' ? 'bg-white dark:bg-gray-700 shadow-sm' : 'hover:bg-white/50 dark:hover:bg-gray-700/50'}`}
              title="Mobile"
            >
              <Smartphone className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg disabled:opacity-50 transition-colors"
            >
              {isSaving ? 'Saving...' : 'Save Draft'}
            </button>
            <button
              onClick={handlePublish}
              disabled={isPublishing}
              className="px-3 py-1.5 text-sm font-medium text-white bg-[#06b6d4] hover:bg-[#0891b2] rounded-lg disabled:opacity-50 shadow-sm transition-colors"
            >
              {isPublishing ? 'Publishing...' : 'Publish'}
            </button>
          </div>
        </div>

        {/* Workspace */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Sidebar: Sections & Blocks */}
          <div className="w-72 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex flex-col overflow-hidden">
            <BuilderSidebar
              layout={layout}
              selectedSectionId={selectedSectionId}
              selectedBlockId={selectedBlockId}
              onSelectSection={(id) => {
                setSelectedSectionId(id);
                setSelectedBlockId(null);
              }}
              onSelectBlock={(sectionId, blockId) => {
                setSelectedSectionId(sectionId);
                setSelectedBlockId(blockId);
              }}
              onAddSection={handleAddSection}
              onDeleteSection={handleDeleteSection}
              onDuplicateSection={handleDuplicateSection}
              onToggleVisibility={handleToggleSectionVisibility}
              onDeleteBlock={handleDeleteBlock}
            />
          </div>

          {/* Center: Live Preview */}
          <div className="flex-1 flex flex-col overflow-hidden bg-gray-200 dark:bg-gray-800">
            <div className="flex-1 flex items-center justify-center p-6 overflow-hidden">
              <div 
                className={`bg-white dark:bg-gray-900 rounded-lg shadow-2xl overflow-hidden transition-all duration-300 h-full ${
                  devicePreview === 'desktop' ? 'w-full' : 
                  devicePreview === 'tablet' ? 'w-[768px]' : 'w-[375px]'
                }`}
              >
                <BuilderPreview 
                  companySlug={companySlug}
                />
              </div>
            </div>
          </div>

          {/* Right Sidebar: Settings Panel */}
          <div className="w-80 border-l border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex flex-col overflow-hidden">
            <BuilderEditor
              selectedSection={selectedSection}
              selectedBlock={selectedBlock}
              onUpdateSectionSettings={handleUpdateSectionSettings}
              onUpdateBlock={(blockId, updates) => {
                if (selectedSectionId) {
                  handleUpdateBlock(selectedSectionId, blockId, updates);
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* Drag Overlay */}
      <DragOverlay>
        {activeId && activeType === 'section' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border-2 border-[#06b6d4] p-3 opacity-90">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {layout.find(s => s.id === activeId)?.type}
            </span>
          </div>
        )}
        {activeId && activeType === 'block' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border-2 border-[#0f7aff] p-2 opacity-90">
            <span className="text-sm text-gray-600 dark:text-gray-400">Block</span>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}

// ============================================
// MIGRATION HELPER
// ============================================

/**
 * Migrate old section.data format to new section.blocks format
 */
function migrateLayout(sections: WebsiteSection[]): WebsiteSection[] {
  return sections.map(section => {
    // If already has blocks, return as-is
    if (section.blocks && section.blocks.length > 0) {
      return section;
    }

    // If has legacy data, convert to blocks
    if (section.data) {
      return convertLegacySection(section);
    }

    // If empty, create default blocks for the section type
    return {
      ...section,
      blocks: [],
      settings: section.settings || {},
    };
  });
}

/**
 * Convert legacy section data to block format
 */
function convertLegacySection(section: WebsiteSection): WebsiteSection {
  const blocks: WebsiteBlock[] = [];
  const data = section.data as Record<string, unknown> | undefined;

  if (!data) {
    return {
      ...section,
      blocks: [],
      settings: section.settings || {},
    };
  }

  switch (section.type) {
    case 'hero':
      if (data.title) {
        blocks.push({
          id: crypto.randomUUID(),
          type: 'title',
          data: { text: data.title },
          settings: { fontSize: '3xl', fontWeight: 'bold', textAlign: 'center' },
        });
      }
      if (data.subtitle) {
        blocks.push({
          id: crypto.randomUUID(),
          type: 'subtitle',
          data: { text: data.subtitle },
          settings: { fontSize: 'lg', textAlign: 'center', textColor: '#6B7280' },
        });
      }
      if (data.imageUrl) {
        blocks.push({
          id: crypto.randomUUID(),
          type: 'image',
          data: { src: data.imageUrl, alt: 'Hero image' },
          settings: { imageWidth: 'full', objectFit: 'cover' },
        });
      }
      if (data.buttonLabel) {
        blocks.push({
          id: crypto.randomUUID(),
          type: 'button',
          data: { text: data.buttonLabel, link: data.buttonLink || '#' },
          settings: { buttonVariant: 'primary', buttonSize: 'lg' },
        });
      }
      break;

    case 'services':
      if (data.items && Array.isArray(data.items)) {
        data.items.forEach((item: { title?: string; description?: string; icon?: string }) => {
          blocks.push({
            id: crypto.randomUUID(),
            type: 'service-item',
            data: { title: item.title || '', description: item.description || '', icon: item.icon },
            settings: {},
          });
        });
      }
      break;

    case 'contact':
      if (data.email || data.phone || data.address) {
        const contactText = [
          data.email && `Email: ${data.email}`,
          data.phone && `Phone: ${data.phone}`,
          data.address && `Address: ${data.address}`,
        ].filter(Boolean).join('\n');
        
        blocks.push({
          id: crypto.randomUUID(),
          type: 'text',
          data: { text: contactText },
          settings: {},
        });
      }
      break;

    case 'about':
      if (data.title) {
        blocks.push({
          id: crypto.randomUUID(),
          type: 'title',
          data: { text: data.title },
          settings: { fontSize: '2xl', fontWeight: 'bold' },
        });
      }
      if (data.content) {
        blocks.push({
          id: crypto.randomUUID(),
          type: 'text',
          data: { text: data.content },
          settings: {},
        });
      }
      if (data.imageUrl) {
        blocks.push({
          id: crypto.randomUUID(),
          type: 'image',
          data: { src: data.imageUrl, alt: 'About image' },
          settings: {},
        });
      }
      break;

    default:
      // For unknown types, try to convert any text/title/subtitle fields
      if (data.title) {
        blocks.push({
          id: crypto.randomUUID(),
          type: 'title',
          data: { text: data.title },
          settings: {},
        });
      }
      if (data.subtitle) {
        blocks.push({
          id: crypto.randomUUID(),
          type: 'subtitle',
          data: { text: data.subtitle },
          settings: {},
        });
      }
      break;
  }

  return {
    ...section,
    blocks,
    settings: section.settings || {},
    // Keep data for backward compatibility during transition
    data: section.data,
  };
}
