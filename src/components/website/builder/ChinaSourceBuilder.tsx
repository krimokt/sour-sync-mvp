'use client';

import React, { useState, useEffect } from 'react';
import BuilderForm from './chinasource-builder-components/BuilderForm';
import { LandingPageTemplate } from './chinasource-builder-components/LandingPageTemplate';
import { CertificateManagerButton } from './chinasource-builder-components/CertificateManager';
import type { Certificate } from './chinasource-types';
import { generateLandingPageContent } from './chinasource-services/gemini';
import { AppState, FormData, GeneratedContent, ProductTile } from './chinasource-types';
import { WebsiteSettings } from '@/types/website';
import { supabase } from '@/lib/supabase';
import { customToast } from '@/utils/toastUtils';
import { Save, Globe, ArrowLeft, ExternalLink } from 'lucide-react';

/** Fetch top 6 published products for the company, shaped for the builder. */
async function fetchTopProducts(companyId: string, companySlug: string): Promise<ProductTile[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase.from('products') as any)
    .select('id, name, images, price')
    .eq('company_id', companyId)
    .eq('is_published', true)
    .order('created_at', { ascending: false })
    .limit(6);
  return ((data || []) as Array<{ id: string; name: string; images?: string[] | null; price?: number | string | null }>)
    .map((p) => {
      // Postgres numeric serializes as string through PostgREST — normalize to number.
      const priceNum =
        p.price == null || p.price === '' ? null : (typeof p.price === 'number' ? p.price : Number(p.price));
      return {
        id: p.id,
        name: p.name,
        image: p.images?.[0] || null,
        price: priceNum != null && Number.isFinite(priceNum) ? priceNum : null,
        href: `/site/${companySlug}/products/${p.id}`,
      };
    });
}

/** Merge a fresh products snapshot into existing builder content. */
function withProducts(content: GeneratedContent, items: ProductTile[]): GeneratedContent {
  if (items.length === 0) return content;
  return {
    ...content,
    products: {
      title: content.products?.title || 'Featured products',
      subtitle: content.products?.subtitle || 'Hand-picked from our catalog',
      items,
    },
  };
}

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
        // Draft builder data is stored in website_settings_private (not publicly readable)
        // Apply filters after casting to keep TS happy with non-generated table types
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: privateRow, error: privateError } = await (supabase.from('website_settings_private') as any)
          .select('builder_data')
          .eq('company_id', companyId)
          .single();

        if (privateError) {
          // Ignore; we'll fall back to legacy or starting fresh
        }

        const savedData = privateRow?.builder_data as { formData: FormData; generatedContent: GeneratedContent } | null | undefined;
        if (savedData?.formData && savedData?.generatedContent) {
          setFormData(savedData.formData);
          // Refresh the product list on every visit so the catalog stays in sync.
          const tiles = await fetchTopProducts(companyId, companySlug);
          setGeneratedContent(withProducts(savedData.generatedContent, tiles));
          setAppState('preview');
          return;
        }

        // Backwards compat: if initial settings still contains builder_data (older schema), use it
        const legacySaved = (initialSettings as WebsiteSettings & { builder_data?: { formData: FormData; generatedContent: GeneratedContent } }).builder_data;
        if (legacySaved?.formData && legacySaved?.generatedContent) {
          setFormData(legacySaved.formData);
          const tiles = await fetchTopProducts(companyId, companySlug);
          setGeneratedContent(withProducts(legacySaved.generatedContent, tiles));
          setAppState('preview');
        }
      } catch (error) {
        console.error('Error loading saved data:', error);
      }
    };

    loadSavedData();
  }, [companyId, initialSettings]);

  const handleFormSubmit = async (data: FormData) => {
    setFormData(data);
    setAppState('generating');

    try {
      const content = await generateLandingPageContent(data);
      const tiles = await fetchTopProducts(companyId, companySlug);
      setGeneratedContent(withProducts(content, tiles));
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
      // Draft data goes to the private table
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase.from('website_settings_private') as any)
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
      // Save draft to private table
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: privateError } = await (supabase.from('website_settings_private') as any)
        .update({ 
          builder_data: {
            formData,
            generatedContent,
          },
          updated_at: new Date().toISOString() 
        })
        .eq('company_id', companyId);

      if (privateError) throw privateError;

      // Published builder data is stored on website_settings (public, but gated by is_published)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: publicError } = await (supabase.from('website_settings') as any)
        .update({
          published_builder_data: {
            formData,
            generatedContent,
          },
          is_published: true,
          updated_at: new Date().toISOString(),
        })
        .eq('company_id', companyId);

      if (publicError) throw publicError;
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
            <CertificateManagerButton
              companyId={companyId}
              certificates={generatedContent?.certificates?.items || []}
              onChange={(items) => {
                setGeneratedContent((prev) => {
                  if (!prev) return prev;
                  return {
                    ...prev,
                    certificates: {
                      title: prev.certificates?.title || 'Certifications',
                      subtitle: prev.certificates?.subtitle,
                      items,
                    },
                  };
                });
              }}
            />
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

