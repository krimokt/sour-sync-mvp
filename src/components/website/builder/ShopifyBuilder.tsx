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
import { WebsiteSection, WebsiteBlock, WebsiteSettings, SectionType, WebsitePage } from '@/types/website';
import ShopifySidebar from './ShopifySidebar';
import ShopifySettingsPanel from './ShopifySettingsPanel';
import ShopifyPreview from './ShopifyPreview';
import TemplateSelector, { WebsiteTemplate } from './TemplateSelector';
import { createSection, createBlockByType } from './blockTemplates';
import { customToast } from '@/utils/toastUtils';
import { 
  Undo2, 
  Redo2, 
  Monitor, 
  Tablet, 
  Smartphone,
  ChevronLeft,
  ChevronDown,
  MoreHorizontal,
  Save,
  Globe,
  Paintbrush,
  FilePlus,
  Check,
  Menu,
  X,
  Layers,
  Settings,
  Eye,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';

interface ShopifyBuilderProps {
  companyId: string;
  companySlug: string;
  initialSettings: WebsiteSettings;
}

type DevicePreview = 'desktop' | 'tablet' | 'mobile';

const showSuccessToast = (msg: string) => customToast({ variant: 'default', title: 'Success', description: msg });
const showErrorToast = (msg: string) => customToast({ variant: 'destructive', title: 'Error', description: msg });

export default function ShopifyBuilder({ companyId, companySlug, initialSettings }: ShopifyBuilderProps) {
  // Layout state
  const [homeLayout, setHomeLayout] = useState<WebsiteSection[]>(() => 
    migrateLayout(initialSettings.homepage_layout_draft || [])
  );
  const [layout, setLayout] = useState<WebsiteSection[]>(homeLayout);
  
  // Pages state
  const [pages, setPages] = useState<WebsitePage[]>([]);
  const [activePage, setActivePage] = useState<WebsitePage | null>(null); // null = Home
  const [showPageSelector, setShowPageSelector] = useState(false);

  // Fetch pages
  useEffect(() => {
    const fetchPages = async () => {
      const { data } = await supabase
        .from('website_pages')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: true });
        
      if (data) {
        const mappedPages = data.map(p => ({ ...p, content: p.content || [] }));
        setPages(mappedPages);
      }
    };
    fetchPages();
  }, [companyId]);

  // Sync layout to memory
  useEffect(() => {
    if (activePage) {
      setPages(prev => prev.map(p => p.id === activePage.id ? { ...p, content: layout } : p));
    } else {
      setHomeLayout(layout);
    }
  }, [layout, activePage]);

  // Selection state
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  
  // UI state
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [devicePreview, setDevicePreview] = useState<DevicePreview>('desktop');
  const [showSettingsPanel, setShowSettingsPanel] = useState(false);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  
  // Mobile/Tablet responsive state
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [mobileActiveTab, setMobileActiveTab] = useState<'sections' | 'preview' | 'settings'>('preview');
  const [isDesktopSidebarCollapsed, setIsDesktopSidebarCollapsed] = useState(false);
  
  // Theme state
  const [themeColors, setThemeColors] = useState({
    primary: initialSettings.primary_color || '#000000',
    secondary: initialSettings.secondary_color || '#ffffff',
    accent: initialSettings.accent_color || '#3b82f6',
  });
  const [themeFonts, setThemeFonts] = useState({
    heading: initialSettings.font_heading || 'Inter',
    body: initialSettings.font_body || 'Inter',
  });
  
  // Active drag item
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeType, setActiveType] = useState<'section' | 'block' | null>(null);

  // DnD Sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Selected items
  const selectedSection = selectedSectionId 
    ? layout.find(s => s.id === selectedSectionId) || null
    : null;
  
  const selectedBlock = selectedSection && selectedBlockId
    ? selectedSection.blocks?.find(b => b.id === selectedBlockId) || null
    : null;

  // Show settings panel when something is selected
  useEffect(() => {
    setShowSettingsPanel(!!selectedSectionId);
  }, [selectedSectionId]);

  // ============================================
  // PAGE HANDLERS
  // ============================================

  const handleSwitchPage = (pageId: string) => {
    if (pageId === 'home') {
      setActivePage(null);
      setLayout(homeLayout);
    } else {
      const page = pages.find(p => p.id === pageId);
      if (page) {
        setActivePage(page);
        setLayout(page.content as WebsiteSection[]);
      }
    }
    setShowPageSelector(false);
    setSelectedSectionId(null);
    setSelectedBlockId(null);
  };

  const handleAddPage = async () => {
    const title = prompt("Enter page title (e.g. About Us, Contact)");
    if (!title) return;
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    
    try {
      const { data, error } = await supabase.from('website_pages').insert({
        company_id: companyId,
        title,
        slug,
        content: [],
        type: 'custom',
        is_published: false
      }).select().single();
      
      if (error) throw error;
      
      if (data) {
        const newPage: WebsitePage = { ...data, content: [] };
        setPages([...pages, newPage]);
        handleSwitchPage(newPage.id);
        showSuccessToast('Page created successfully');
      }
    } catch (err) {
      console.error(err);
      showErrorToast('Failed to create page');
    }
  };

  // ============================================
  // DRAG & DROP HANDLERS
  // ============================================

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);
    const isSection = layout.some(s => s.id === active.id);
    setActiveType(isSection ? 'section' : 'block');
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setActiveType(null);

    if (!over || active.id === over.id) return;

    const activeSectionIndex = layout.findIndex(s => s.id === active.id);
    const overSectionIndex = layout.findIndex(s => s.id === over.id);

    if (activeSectionIndex !== -1 && overSectionIndex !== -1) {
      setLayout(arrayMove(layout, activeSectionIndex, overSectionIndex));
      return;
    }

    if (selectedSectionId) {
      const section = layout.find(s => s.id === selectedSectionId);
      if (section?.blocks) {
        const activeBlockIndex = section.blocks.findIndex(b => b.id === active.id);
        const overBlockIndex = section.blocks.findIndex(b => b.id === over.id);

        if (activeBlockIndex !== -1 && overBlockIndex !== -1) {
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

  const handleAddSection = (type: SectionType) => {
    const newSection = createSection(type);
    setLayout([...layout, newSection]);
    setSelectedSectionId(newSection.id);
    setSelectedBlockId(null);
  };

  const handleSelectSection = (id: string | null) => {
    setSelectedSectionId(id);
    setSelectedBlockId(null);
  };

  const handleSelectBlock = (sectionId: string, blockId: string) => {
    setSelectedSectionId(sectionId);
    setSelectedBlockId(blockId);
  };

  const handleDeleteSection = (id: string) => {
    setLayout(layout.filter(s => s.id !== id));
    if (selectedSectionId === id) {
      setSelectedSectionId(null);
      setSelectedBlockId(null);
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

  const handleUpdateSectionData = (sectionId: string, data: Record<string, unknown>) => {
    setLayout(layout.map(s => {
      if (s.id !== sectionId) return s;
      return { ...s, data };
    }));
  };

  // ============================================
  // TEMPLATE HANDLERS
  // ============================================

  const handleSelectTemplate = (template: WebsiteTemplate) => {
    // Generate new IDs for all sections and their nested items
    const newSections = template.sections.map(section => ({
      ...section,
      id: crypto.randomUUID(),
      blocks: section.blocks?.map(block => ({
        ...block,
        id: crypto.randomUUID(),
      })),
    }));
    
    setLayout(newSections);
    setThemeColors(template.colors);
    setThemeFonts(template.fonts);
    setSelectedSectionId(null);
    setSelectedBlockId(null);
    showSuccessToast(`Template "${template.name}" applied!`);
  };

  const handleUpdateThemeColors = (colors: { primary: string; secondary: string; accent: string }) => {
    setThemeColors(colors);
  };

  const handleUpdateThemeFonts = (fonts: { heading: string; body: string }) => {
    setThemeFonts(fonts);
  };

  // ============================================
  // BLOCK HANDLERS
  // ============================================

  const handleAddBlock = (sectionId: string, blockType: WebsiteBlock['type']) => {
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

  const handleDuplicateBlock = (sectionId: string, blockId: string) => {
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
      const { error } = await supabase
        .from('website_settings')
        .update({ 
          homepage_layout_draft: layout,
          primary_color: themeColors.primary,
          secondary_color: themeColors.secondary,
          accent_color: themeColors.accent,
          font_heading: themeFonts.heading,
          font_body: themeFonts.body,
          updated_at: new Date().toISOString() 
        })
        .eq('company_id', companyId);

      if (error) throw error;
      showSuccessToast('Changes saved');
      sendPreviewUpdate(layout);
    } catch (err) {
      console.error(err);
      showErrorToast('Failed to save');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      const { error } = await supabase
        .from('website_settings')
        .update({ 
          homepage_layout_draft: layout, 
          homepage_layout_published: layout,
          is_published: true,
          updated_at: new Date().toISOString()
        })
        .eq('company_id', companyId);

      if (error) throw error;
      showSuccessToast('Website published!');
    } catch (err) {
      console.error(err);
      showErrorToast('Failed to publish');
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
      console.log('[Builder] Sending layout update to preview:', layoutData.length, 'sections');
      iframe.contentWindow.postMessage({ type: 'LAYOUT_UPDATE', layout: layoutData }, '*');
    } else {
      console.log('[Builder] No iframe found for preview update');
    }
  }, []);

  // Send updates immediately when layout changes (with minimal debounce for performance)
  useEffect(() => {
    const timeout = setTimeout(() => {
      sendPreviewUpdate(layout);
    }, 50); // Very short debounce for responsive updates
    return () => clearTimeout(timeout);
  }, [layout, sendPreviewUpdate]);

  // Listen for preview ready message
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'PREVIEW_READY') {
        console.log('[Builder] Preview is ready, sending initial layout');
        sendPreviewUpdate(layout);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [layout, sendPreviewUpdate]);

  // ============================================
  // RENDER
  // ============================================

  // Sidebar content component (reused in mobile and desktop)
  const SidebarContent = () => (
    <>
      {/* Sidebar Header - Page Selector */}
      <div className="h-14 px-4 flex items-center justify-between border-b border-[#333] relative">
        <button 
          onClick={() => setShowPageSelector(!showPageSelector)}
          className="flex items-center gap-2 px-2 py-1.5 -ml-2 hover:bg-[#333] rounded transition-colors text-left max-w-[200px]"
        >
          <div className="flex flex-col min-w-0">
            <span className="text-xs text-gray-400">Editing:</span>
            <span className="text-sm font-medium text-white truncate">
              {activePage ? activePage.title : 'Home page'}
            </span>
          </div>
          <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
        </button>
        
        <button className="p-1 hover:bg-[#333] rounded text-gray-400 hover:text-white transition-colors">
          <MoreHorizontal className="w-5 h-5" />
        </button>

        {/* Page Selector Dropdown */}
        {showPageSelector && (
          <div className="absolute top-full left-0 w-full bg-[#1a1a1a] border border-[#333] shadow-xl z-50 animate-in fade-in slide-in-from-top-2">
            <div className="p-2 space-y-1">
              <button
                onClick={() => handleSwitchPage('home')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded text-sm transition-colors ${
                  !activePage ? 'bg-[#36d399]/20 text-[#36d399]' : 'text-gray-300 hover:bg-[#333] hover:text-white'
                }`}
              >
                <span>Home page</span>
                {!activePage && <Check className="w-4 h-4" />}
              </button>
              
              {pages.map(page => (
                <button
                  key={page.id}
                  onClick={() => handleSwitchPage(page.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded text-sm transition-colors ${
                    activePage?.id === page.id ? 'bg-[#36d399]/20 text-[#36d399]' : 'text-gray-300 hover:bg-[#333] hover:text-white'
                  }`}
                >
                  <span>{page.title}</span>
                  {activePage?.id === page.id && <Check className="w-4 h-4" />}
                </button>
              ))}

              <div className="h-px bg-[#333] my-1" />
              
              <button
                onClick={handleAddPage}
                className="w-full flex items-center gap-2 px-3 py-2 rounded text-sm text-gray-300 hover:bg-[#333] hover:text-white transition-colors"
              >
                <FilePlus className="w-4 h-4" />
                <span>Create new page</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Sections List */}
      <ShopifySidebar
        layout={layout}
        selectedSectionId={selectedSectionId}
        selectedBlockId={selectedBlockId}
        onSelectSection={(id) => {
          handleSelectSection(id);
          // On mobile, switch to settings tab when selecting
          if (window.innerWidth < 1024) {
            setMobileActiveTab('settings');
            setShowMobileSidebar(false);
          }
        }}
        onSelectBlock={handleSelectBlock}
        onAddSection={handleAddSection}
        onDeleteSection={handleDeleteSection}
        onDuplicateSection={handleDuplicateSection}
        onToggleVisibility={handleToggleSectionVisibility}
        onAddBlock={handleAddBlock}
        onDeleteBlock={handleDeleteBlock}
        onDuplicateBlock={handleDuplicateBlock}
      />
    </>
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex flex-col lg:flex-row h-full bg-[#1a1a1a]">
        {/* Mobile/Tablet Top Header */}
        <div className="lg:hidden flex items-center justify-between h-14 px-4 bg-[#1a1a1a] border-b border-[#333]">
          <button
            onClick={() => setShowMobileSidebar(true)}
            className="p-2 hover:bg-[#333] rounded text-gray-400 hover:text-white transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-1 bg-[#0d0d0d] rounded-lg p-1">
            <button
              onClick={() => setDevicePreview('desktop')}
              className={`p-1.5 rounded transition-colors ${
                devicePreview === 'desktop' ? 'bg-[#333] text-white' : 'text-gray-500'
              }`}
            >
              <Monitor className="w-4 h-4" />
            </button>
            <button
              onClick={() => setDevicePreview('tablet')}
              className={`p-1.5 rounded transition-colors ${
                devicePreview === 'tablet' ? 'bg-[#333] text-white' : 'text-gray-500'
              }`}
            >
              <Tablet className="w-4 h-4" />
            </button>
            <button
              onClick={() => setDevicePreview('mobile')}
              className={`p-1.5 rounded transition-colors ${
                devicePreview === 'mobile' ? 'bg-[#333] text-white' : 'text-gray-500'
              }`}
            >
              <Smartphone className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex items-center gap-1">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="p-2 hover:bg-[#333] rounded text-gray-400 hover:text-white transition-colors disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
            </button>
            <button
              onClick={handlePublish}
              disabled={isPublishing}
              className="px-3 py-1.5 text-sm font-medium text-black bg-[#36d399] hover:bg-[#2bc088] rounded transition-colors disabled:opacity-50"
            >
              Publish
            </button>
          </div>
        </div>

        {/* Mobile Sidebar Overlay */}
        {showMobileSidebar && (
          <div className="lg:hidden fixed inset-0 z-50">
            <div 
              className="absolute inset-0 bg-black/60" 
              onClick={() => setShowMobileSidebar(false)}
            />
            <div className="absolute left-0 top-0 bottom-0 w-[300px] bg-[#1a1a1a] flex flex-col animate-in slide-in-from-left duration-300">
              <div className="h-14 px-4 flex items-center justify-between border-b border-[#333]">
                <span className="text-white font-medium">Sections</span>
                <button
                  onClick={() => setShowMobileSidebar(false)}
                  className="p-2 hover:bg-[#333] rounded text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <SidebarContent />
            </div>
          </div>
        )}

        {/* Desktop Left Sidebar */}
        <div className={`hidden lg:flex bg-[#1a1a1a] border-r border-[#333] flex-col transition-all duration-300 ${
          isDesktopSidebarCollapsed ? 'w-0 overflow-hidden' : 'w-[280px]'
        }`}>
          <SidebarContent />
        </div>

        {/* Center - Preview */}
        <div className="flex-1 flex flex-col bg-[#0d0d0d] min-w-0">
          {/* Desktop Top Bar */}
          <div className="hidden lg:flex h-14 px-4 items-center justify-between bg-[#1a1a1a] border-b border-[#333]">
            {/* Left Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsDesktopSidebarCollapsed(!isDesktopSidebarCollapsed)}
                className="p-2 hover:bg-[#333] rounded text-gray-400 hover:text-white transition-colors"
                title={isDesktopSidebarCollapsed ? 'Show sidebar' : 'Hide sidebar'}
              >
                {isDesktopSidebarCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
              </button>
              <div className="w-px h-6 bg-[#333]" />
              <button className="p-2 hover:bg-[#333] rounded text-gray-400 hover:text-white transition-colors" title="Undo">
                <Undo2 className="w-4 h-4" />
              </button>
              <button className="p-2 hover:bg-[#333] rounded text-gray-400 hover:text-white transition-colors" title="Redo">
                <Redo2 className="w-4 h-4" />
              </button>
            </div>

            {/* Device Toggle */}
            <div className="flex items-center gap-1 bg-[#0d0d0d] rounded-lg p-1">
              <button
                onClick={() => setDevicePreview('desktop')}
                className={`p-2 rounded transition-colors ${
                  devicePreview === 'desktop' 
                    ? 'bg-[#333] text-white' 
                    : 'text-gray-500 hover:text-white'
                }`}
                title="Desktop"
              >
                <Monitor className="w-4 h-4" />
              </button>
              <button
                onClick={() => setDevicePreview('tablet')}
                className={`p-2 rounded transition-colors ${
                  devicePreview === 'tablet' 
                    ? 'bg-[#333] text-white' 
                    : 'text-gray-500 hover:text-white'
                }`}
                title="Tablet"
              >
                <Tablet className="w-4 h-4" />
              </button>
              <button
                onClick={() => setDevicePreview('mobile')}
                className={`p-2 rounded transition-colors ${
                  devicePreview === 'mobile' 
                    ? 'bg-[#333] text-white' 
                    : 'text-gray-500 hover:text-white'
                }`}
                title="Mobile"
              >
                <Smartphone className="w-4 h-4" />
              </button>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowTemplateSelector(true)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-transparent hover:bg-[#333] border border-[#444] rounded transition-colors"
              >
                <Paintbrush className="w-4 h-4" />
                <span className="hidden xl:inline">Theme</span>
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-transparent hover:bg-[#333] border border-[#444] rounded transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span className="hidden xl:inline">{isSaving ? 'Saving...' : 'Save'}</span>
              </button>
              <button
                onClick={handlePublish}
                disabled={isPublishing}
                className="flex items-center gap-2 px-4 py-1.5 text-sm font-medium text-black bg-[#36d399] hover:bg-[#2bc088] rounded transition-colors disabled:opacity-50"
              >
                <Globe className="w-4 h-4" />
                <span className="hidden xl:inline">{isPublishing ? 'Publishing...' : 'Publish'}</span>
              </button>
            </div>
          </div>

          {/* Preview Area */}
          <div className={`flex-1 flex items-center justify-center overflow-hidden ${
            devicePreview === 'desktop' ? 'p-0' : 'p-4'
          }`}>
            <div 
              className={`bg-white shadow-2xl overflow-hidden transition-all duration-300 ${
                devicePreview === 'desktop' 
                  ? 'w-full h-full' 
                  : devicePreview === 'tablet' 
                    ? 'w-[768px] max-w-full h-[calc(100%-32px)] rounded-2xl border-[8px] border-[#1a1a1a]' 
                    : 'w-[375px] max-w-full h-[calc(100%-32px)] rounded-[40px] border-[12px] border-[#1a1a1a] relative'
              }`}
            >
              {/* Mobile notch */}
              {devicePreview === 'mobile' && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-[#1a1a1a] rounded-b-3xl z-10" />
              )}
              <ShopifyPreview
                companySlug={companySlug}
                pageSlug={activePage?.slug}
                devicePreview={devicePreview}
              />
            </div>
          </div>
        </div>

        {/* Desktop Right Sidebar - Settings Panel */}
        <div 
          className={`hidden lg:block bg-[#1a1a1a] border-l border-[#333] transition-all duration-300 overflow-hidden ${
            showSettingsPanel ? 'w-[320px]' : 'w-0'
          }`}
        >
          {showSettingsPanel && (
            <ShopifySettingsPanel
              selectedSection={selectedSection}
              selectedBlock={selectedBlock}
              onUpdateSectionSettings={handleUpdateSectionSettings}
              onUpdateSectionData={handleUpdateSectionData}
              onUpdateBlock={(blockId, updates) => {
                if (selectedSectionId) {
                  handleUpdateBlock(selectedSectionId, blockId, updates);
                }
              }}
              onClose={() => {
                setSelectedSectionId(null);
                setSelectedBlockId(null);
              }}
            />
          )}
        </div>

        {/* Mobile Bottom Navigation */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#1a1a1a] border-t border-[#333] flex items-center justify-around px-4 z-40">
          <button
            onClick={() => {
              setMobileActiveTab('sections');
              setShowMobileSidebar(true);
            }}
            className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${
              mobileActiveTab === 'sections' ? 'text-[#36d399]' : 'text-gray-400'
            }`}
          >
            <Layers className="w-5 h-5" />
            <span className="text-xs">Sections</span>
          </button>
          
          <button
            onClick={() => setMobileActiveTab('preview')}
            className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${
              mobileActiveTab === 'preview' ? 'text-[#36d399]' : 'text-gray-400'
            }`}
          >
            <Eye className="w-5 h-5" />
            <span className="text-xs">Preview</span>
          </button>
          
          <button
            onClick={() => {
              setMobileActiveTab('settings');
              if (!selectedSectionId && layout.length > 0) {
                setSelectedSectionId(layout[0].id);
              }
            }}
            className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${
              mobileActiveTab === 'settings' ? 'text-[#36d399]' : 'text-gray-400'
            }`}
          >
            <Settings className="w-5 h-5" />
            <span className="text-xs">Settings</span>
          </button>
          
          <button
            onClick={() => setShowTemplateSelector(true)}
            className="flex flex-col items-center gap-1 p-2 rounded-lg text-gray-400"
          >
            <Paintbrush className="w-5 h-5" />
            <span className="text-xs">Theme</span>
          </button>
        </div>

        {/* Mobile Settings Panel */}
        {mobileActiveTab === 'settings' && (
          <div className="lg:hidden fixed inset-x-0 bottom-16 top-14 bg-[#1a1a1a] z-30 overflow-y-auto">
            {selectedSection ? (
              <ShopifySettingsPanel
                selectedSection={selectedSection}
                selectedBlock={selectedBlock}
                onUpdateSectionSettings={handleUpdateSectionSettings}
                onUpdateSectionData={handleUpdateSectionData}
                onUpdateBlock={(blockId, updates) => {
                  if (selectedSectionId) {
                    handleUpdateBlock(selectedSectionId, blockId, updates);
                  }
                }}
                onClose={() => {
                  setSelectedSectionId(null);
                  setSelectedBlockId(null);
                  setMobileActiveTab('preview');
                }}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8">
                <Settings className="w-12 h-12 mb-4 opacity-50" />
                <p className="text-center">Select a section from the Sections tab to edit its settings</p>
                <button
                  onClick={() => setShowMobileSidebar(true)}
                  className="mt-4 px-4 py-2 bg-[#333] text-white rounded-lg hover:bg-[#444] transition-colors"
                >
                  Open Sections
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Drag Overlay */}
      <DragOverlay>
        {activeId && activeType === 'section' && (
          <div className="bg-[#333] rounded-lg border border-[#555] p-3 opacity-90 shadow-xl">
            <span className="text-sm font-medium text-white">
              {layout.find(s => s.id === activeId)?.type}
            </span>
          </div>
        )}
        {activeId && activeType === 'block' && (
          <div className="bg-[#333] rounded border border-[#555] p-2 opacity-90 shadow-xl">
            <span className="text-xs text-gray-300">Block</span>
          </div>
        )}
      </DragOverlay>

      {/* Template Selector Modal */}
      <TemplateSelector
        isOpen={showTemplateSelector}
        onClose={() => setShowTemplateSelector(false)}
        onSelectTemplate={handleSelectTemplate}
        currentColors={themeColors}
        currentFonts={themeFonts}
        onUpdateColors={handleUpdateThemeColors}
        onUpdateFonts={handleUpdateThemeFonts}
      />
    </DndContext>
  );
}

// ============================================
// MIGRATION HELPER
// ============================================

function migrateLayout(sections: WebsiteSection[]): WebsiteSection[] {
  return sections.map(section => {
    if (section.blocks && section.blocks.length > 0) {
      return section;
    }

    if (section.data) {
      return convertLegacySection(section);
    }

    return {
      ...section,
      blocks: [],
      settings: section.settings || {},
    };
  });
}

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
    data: section.data,
  };
}

