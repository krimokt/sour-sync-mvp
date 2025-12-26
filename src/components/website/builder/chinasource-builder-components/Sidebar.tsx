'use client';

import React, { useRef } from 'react';
import { GeneratedContent, ThemeColor, TemplateId } from '../chinasource-types';
import { 
  ChevronDown, ChevronRight, Layout, Image as ImageIcon, 
  Link as LinkIcon, Palette, Settings, Zap, HelpCircle, 
  Eye, Copy, ShieldCheck
} from 'lucide-react';

interface SidebarProps {
  content: GeneratedContent;
  onUpdate: (path: string, value: unknown) => void;
  activeSection: string | null;
  onSectionClick: (section: string) => void;
  themeColor: ThemeColor;
  onThemeChange: (color: ThemeColor) => void;
  templateId: TemplateId;
  onTemplateChange: (id: TemplateId) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  content, onUpdate, activeSection, onSectionClick, themeColor, onThemeChange, templateId, onTemplateChange
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const currentUploadPath = useRef<string>('');

  const handleImageUpload = (path: string) => {
    currentUploadPath.current = path;
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const url = URL.createObjectURL(e.target.files[0]);
      onUpdate(currentUploadPath.current, url);
    }
  };

  const sections = [
    { id: 'hero', label: '1. HERO CONVERSION', icon: Layout },
    { id: 'solutions', label: '2. SOLUTIONS GRID', icon: Settings },
    { id: 'howItWorks', label: '3. PROCESS FLOW', icon: HelpCircle },
    { id: 'about', label: '4. TRUST & ABOUT', icon: ShieldCheck },
    { id: 'contact', label: '5. CONTACT HUB', icon: LinkIcon },
    { id: 'theme', label: 'GLOBAL STYLING', icon: Palette },
  ];

  return (
    <div className="w-80 bg-white border-r border-gray-100 h-screen flex flex-col fixed left-0 top-0 z-[60] overflow-hidden shadow-2xl">
      <div className="p-6 border-b border-gray-50 bg-gray-50/50">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-black text-xs text-gray-900 uppercase tracking-[0.2em]">Sourcing Engine</h2>
          <span className="flex items-center gap-1 bg-emerald-500/10 text-emerald-600 px-2 py-1 rounded-full text-[9px] font-black animate-pulse">
            <Zap size={10} fill="currentColor" /> LIVE
          </span>
        </div>
        
        {/* Trust Score Logic Simulation */}
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
           <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Page Trust Score</span>
              <span className="text-[10px] font-black text-emerald-500 uppercase">High</span>
           </div>
           <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 w-[92%] rounded-full shadow-lg shadow-emerald-500/20" />
           </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-4">
        {sections.map((section) => {
          const isActive = activeSection === section.id;
          const Icon = section.icon;

          return (
            <div key={section.id} className="px-4">
              <button
                onClick={() => onSectionClick(isActive ? '' : section.id)}
                className={`w-full flex items-center justify-between p-4 rounded-xl transition-all mb-1 ${isActive ? 'bg-gray-900 text-white shadow-xl' : 'text-gray-500 hover:bg-gray-50'}`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={18} />
                  <span className="font-black text-[10px] uppercase tracking-widest">{section.label}</span>
                </div>
                {isActive ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </button>

              {isActive && (
                <div className="p-5 bg-gray-50 rounded-2xl mb-4 space-y-4 animate-fadeIn border border-gray-100">
                  {section.id === 'theme' && (
                    <>
                      <div className="space-y-4">
                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Layout Engine</label>
                        <div className="grid grid-cols-2 gap-2">
                           {(['industrial', 'modern', 'minimal'] as TemplateId[]).map(t => (
                              <button 
                                key={t}
                                onClick={() => onTemplateChange(t)}
                                className={`px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-tighter border transition-all ${templateId === t ? 'bg-gray-900 text-white border-gray-900 shadow-lg' : 'bg-white text-gray-400 border-gray-200 hover:border-gray-300'}`}
                              >
                                {t}
                              </button>
                           ))}
                        </div>
                      </div>

                      <div className="space-y-4 pt-4 border-t border-gray-200">
                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block">Brand Visualizer</label>
                        <div className="flex flex-wrap gap-3">
                          {(['amber', 'blue', 'red', 'emerald', 'indigo', 'zinc'] as ThemeColor[]).map((c) => (
                             <button
                               key={c}
                               onClick={() => onThemeChange(c)}
                               className={`w-10 h-10 rounded-2xl border-4 ${themeColor === c ? 'border-gray-900 scale-110 shadow-2xl' : 'border-white'} transition-all shadow-md`}
                               style={{ backgroundColor: c === 'amber' ? '#f59e0b' : c === 'blue' ? '#2563eb' : c === 'red' ? '#dc2626' : c === 'emerald' ? '#10b981' : c === 'indigo' ? '#6366f1' : '#18181b' }}
                             />
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {section.id === 'hero' && (
                    <>
                      <div className="space-y-3">
                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Tagline</label>
                        <input type="text" value={content.hero.tagline} onChange={(e) => onUpdate('hero.tagline', e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl p-3 text-[11px] font-bold focus:ring-2 focus:ring-gray-900 outline-none" />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Hero Image</label>
                        <button onClick={() => handleImageUpload('hero.backgroundImage')} className="w-full group bg-white border-2 border-dashed border-gray-200 rounded-2xl p-6 flex flex-col items-center justify-center hover:border-gray-900 transition-all">
                           <ImageIcon className="text-gray-300 mb-2 group-hover:text-gray-900" size={24} />
                           <span className="text-[9px] font-black text-gray-400 uppercase group-hover:text-gray-900">Upload New Visual</span>
                        </button>
                      </div>
                    </>
                  )}

                  {section.id === 'howItWorks' && (
                    <>
                      <div className="space-y-3">
                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Process Title</label>
                        <input type="text" value={content.howItWorks.title} onChange={(e) => onUpdate('howItWorks.title', e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl p-3 text-[11px] font-bold focus:ring-2 focus:ring-gray-900 outline-none" />
                      </div>
                      <div className="space-y-3 pt-4 border-t border-gray-200">
                        <div className="flex items-center justify-between">
                          <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Process Steps</label>
                          <span className="text-[9px] font-black text-gray-500">{content.howItWorks.steps.length} steps</span>
                        </div>
                        <div className="space-y-3">
                          {content.howItWorks.steps.map((step, idx) => (
                            <div key={idx} className="bg-white p-4 rounded-xl border border-gray-200 space-y-2">
                              <div className="flex items-center gap-2 mb-2">
                                <div className="w-6 h-6 rounded-full bg-gray-900 text-white flex items-center justify-center text-[10px] font-black">
                                  {idx + 1}
                                </div>
                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Step {idx + 1}</span>
                              </div>
                              <input
                                type="text"
                                value={step.title}
                                onChange={(e) => {
                                  const newSteps = [...content.howItWorks.steps];
                                  newSteps[idx].title = e.target.value;
                                  onUpdate('howItWorks.steps', newSteps);
                                }}
                                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-[11px] font-black focus:ring-2 focus:ring-gray-900 outline-none"
                                placeholder="Step title"
                              />
                              <textarea
                                value={step.description}
                                onChange={(e) => {
                                  const newSteps = [...content.howItWorks.steps];
                                  newSteps[idx].description = e.target.value;
                                  onUpdate('howItWorks.steps', newSteps);
                                }}
                                rows={2}
                                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-[10px] font-bold focus:ring-2 focus:ring-gray-900 outline-none resize-none"
                                placeholder="Step description"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {section.id === 'about' && (
                    <>
                       {content.about.trustMetrics.map((m, i) => (
                          <div key={i} className="bg-white p-4 rounded-xl border border-gray-200 space-y-2">
                             <input type="text" value={m.label} onChange={(e) => onUpdate(`about.trustMetrics.${i}.label`, e.target.value)} className="w-full text-[10px] font-black uppercase text-gray-400 outline-none" placeholder="Label" />
                             <div className="flex gap-2">
                                <input type="text" value={m.value} onChange={(e) => onUpdate(`about.trustMetrics.${i}.value`, e.target.value)} className="w-full text-lg font-black outline-none" placeholder="Value" />
                                <input type="text" value={m.suffix || ''} onChange={(e) => onUpdate(`about.trustMetrics.${i}.suffix`, e.target.value)} className="w-12 text-lg font-black text-gray-400 outline-none" placeholder="+" />
                             </div>
                          </div>
                       ))}
                    </>
                  )}

                  {section.id === 'contact' && (
                    <>
                      <div className="space-y-3">
                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Contact Title</label>
                        <input type="text" value={content.contact.title} onChange={(e) => onUpdate('contact.title', e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl p-3 text-[11px] font-bold focus:ring-2 focus:ring-gray-900 outline-none" />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Email</label>
                        <input type="email" value={content.contact.email} onChange={(e) => onUpdate('contact.email', e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl p-3 text-[11px] font-bold focus:ring-2 focus:ring-gray-900 outline-none" />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Address</label>
                        <textarea value={content.contact.address} onChange={(e) => onUpdate('contact.address', e.target.value)} rows={2} className="w-full bg-white border border-gray-200 rounded-xl p-3 text-[11px] font-bold focus:ring-2 focus:ring-gray-900 outline-none resize-none" />
                      </div>
                      <div className="space-y-3 pt-4 border-t border-gray-200">
                        <div className="flex items-center justify-between">
                          <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Social Media</label>
                          <button
                            onClick={() => {
                              const currentSocials = content.contact.socialMedia || [];
                              const newSocials = [...currentSocials, { platform: 'instagram' as const, url: '' }];
                              onUpdate('contact.socialMedia', newSocials);
                            }}
                            className="text-[9px] font-black text-gray-900 uppercase tracking-widest hover:text-gray-600 transition"
                          >
                            + Add
                          </button>
                        </div>
                        <div className="space-y-2">
                          {(content.contact.socialMedia || []).map((social, idx) => (
                            <div key={idx} className="bg-white p-3 rounded-xl border border-gray-200 space-y-2">
                              <div className="flex gap-2">
                                <select
                                  value={social.platform}
                                  onChange={(e) => {
                                    const newSocials = [...(content.contact.socialMedia || [])];
                                    newSocials[idx].platform = e.target.value as 'instagram' | 'linkedin' | 'wechat';
                                    onUpdate('contact.socialMedia', newSocials);
                                  }}
                                  className="flex-1 bg-white border border-gray-200 rounded-lg px-2 py-1.5 text-[10px] font-black uppercase tracking-tighter focus:ring-2 focus:ring-gray-900 outline-none"
                                >
                                  <option value="instagram">Instagram</option>
                                  <option value="linkedin">LinkedIn</option>
                                  <option value="wechat">WeChat</option>
                                </select>
                                <button
                                  onClick={() => {
                                    const newSocials = [...(content.contact.socialMedia || [])];
                                    newSocials.splice(idx, 1);
                                    onUpdate('contact.socialMedia', newSocials);
                                  }}
                                  className="px-2 py-1.5 bg-red-500 text-white rounded-lg text-[10px] font-black hover:bg-red-600 transition"
                                >
                                  ×
                                </button>
                              </div>
                              <input
                                type="url"
                                value={social.url}
                                onChange={(e) => {
                                  const newSocials = [...(content.contact.socialMedia || [])];
                                  newSocials[idx].url = e.target.value;
                                  onUpdate('contact.socialMedia', newSocials);
                                }}
                                placeholder="https://..."
                                className="w-full bg-white border border-gray-200 rounded-lg px-2 py-1.5 text-[10px] font-bold focus:ring-2 focus:ring-gray-900 outline-none"
                              />
                            </div>
                          ))}
                          {(!content.contact.socialMedia || content.contact.socialMedia.length === 0) && (
                            <div className="text-[10px] text-gray-400 italic text-center py-2">No social media links</div>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
      
      <div className="p-6 bg-gray-50 space-y-3">
        <button className="w-full bg-gray-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-2xl flex items-center justify-center gap-2 hover:bg-black transition-all">
          <Eye size={14} /> Preview Site
        </button>
        <button className="w-full bg-white border-2 border-gray-200 text-gray-600 py-4 rounded-2xl font-black uppercase tracking-widest text-[11px] flex items-center justify-center gap-2 hover:bg-gray-50 transition-all">
          <Copy size={14} /> Export Code
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
