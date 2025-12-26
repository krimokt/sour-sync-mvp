'use client';

import React, { useState, useEffect } from 'react';
import BuilderForm from './chinasource-builder-components/BuilderForm';
import { LandingPageTemplate } from './chinasource-builder-components/LandingPageTemplate';
import { generateLandingPageContent } from './chinasource-services/gemini';
import { AppState, FormData, GeneratedContent } from './chinasource-types';
import { WebsiteSettings } from '@/types/website';
import { supabase } from '@/lib/supabase';
import { customToast } from '@/utils/toastUtils';
import { Save, Globe, ArrowLeft, ExternalLink } from 'lucide-react';

interface ChinaSourceBuilderProps {
  companyId: string;
  companySlug: string; // Kept for consistency with interface, may be used in future
  initialSettings: WebsiteSettings;
}

const showSuccessToast = (msg: string) => customToast({ variant: 'default', title: 'Success', description: msg });
const showErrorToast = (msg: string) => customToast({ variant: 'destructive', title: 'Error', description: msg });

export default function ChinaSourceBuilder({ companyId, companySlug, initialSettings }: ChinaSourceBuilderProps) {
  const [appState, setAppState] = useState<AppState>('input');
  const [formData, setFormData] = useState<FormData | null>(null);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  // Load saved data on mount
  useEffect(() => {
    const loadSavedData = async () => {
      try {
        // Try to load saved FormData and GeneratedContent from a custom field
        // We'll store it in a JSON field - let's use a custom field in website_settings
        // For now, we'll check if there's existing data in homepage_layout_draft
        // If it's in the old format, we'll start fresh
        // If we add a new field like 'builder_data', we can use that
        
        // For now, check if initialSettings has any saved builder data
        // This is a simplified version - in production you might want to add a dedicated field
        const savedData = (initialSettings as WebsiteSettings & { builder_data?: { formData: FormData; generatedContent: GeneratedContent } }).builder_data;
        if (savedData) {
          setFormData(savedData.formData);
          setGeneratedContent(savedData.generatedContent);
          setAppState('preview');
        }
      } catch (error) {
        console.error('Error loading saved data:', error);
      }
    };

    loadSavedData();
  }, [initialSettings]);

  const handleFormSubmit = async (data: FormData) => {
    setFormData(data);
    setAppState('generating');

    try {
      const content = await generateLandingPageContent(data);
      setGeneratedContent(content);
      setAppState('preview');
    } catch (error) {
      console.error("Failed to generate content", error);
      showErrorToast("Something went wrong generating your site. Please try again.");
      setAppState('input');
    }
  };

  const handleEdit = () => {
    setAppState('input');
  };

  const handleSave = async () => {
    if (!formData || !generatedContent) {
      showErrorToast('No content to save');
      return;
    }

    setIsSaving(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase.from('website_settings') as any)
        .update({ 
          builder_data: {
            formData,
            generatedContent,
          },
          updated_at: new Date().toISOString() 
        })
        .eq('company_id', companyId);

      if (error) throw error;
      showSuccessToast('Changes saved');
    } catch (err) {
      console.error(err);
      showErrorToast('Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!formData || !generatedContent) {
      showErrorToast('No content to publish');
      return;
    }

    setIsPublishing(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase.from('website_settings') as any)
        .update({ 
          builder_data: {
            formData,
            generatedContent,
          },
          published_builder_data: {
            formData,
            generatedContent,
          },
          is_published: true,
          updated_at: new Date().toISOString() 
        })
        .eq('company_id', companyId);

      if (error) throw error;
      showSuccessToast('Website published successfully! Your site is now live.');
    } catch (err) {
      console.error(err);
      showErrorToast('Failed to publish website');
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="w-full relative" style={{ minHeight: '100vh' }}>
      {/* Header with Save/Publish buttons when in preview mode */}
      {appState === 'preview' && formData && generatedContent && (
        <div className="fixed top-0 left-0 right-0 z-[100] bg-white border-b border-gray-300 h-16 flex items-center justify-between px-6 shadow-md" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <button
            onClick={handleEdit}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors z-[101]"
            type="button"
          >
            <ArrowLeft size={16} />
            Edit
          </button>
          
          <div className="flex items-center gap-3 z-[101]">
            <button
              onClick={handleSave}
              disabled={isSaving || isPublishing}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 border border-gray-300"
              type="button"
            >
              <Save size={16} />
              {isSaving ? 'Saving...' : 'Save Draft'}
            </button>
            
            <button
              onClick={handlePublish}
              disabled={isSaving || isPublishing}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 shadow-sm"
              type="button"
            >
              <Globe size={16} />
              {isPublishing ? 'Publishing...' : 'Publish to View Site'}
            </button>
            
            <a
              href={`/site/${companySlug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors border border-gray-300"
              aria-label="View published website"
            >
              <ExternalLink size={16} />
              View Site
            </a>
          </div>
        </div>
      )}

      <div className={appState === 'preview' ? 'pt-16' : ''} style={{ overflow: 'visible' }}>
        {appState === 'input' || appState === 'generating' ? (
          <BuilderForm onSubmit={handleFormSubmit} isGenerating={appState === 'generating'} />
        ) : (
          formData && generatedContent && (
            <LandingPageTemplate 
              data={formData} 
              content={generatedContent} 
              onEdit={handleEdit}
              hasTopBar={true}
            />
          )
        )}
      </div>
    </div>
  );
}

