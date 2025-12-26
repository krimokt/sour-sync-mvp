'use client';

import React, { useState, useRef } from 'react';
import { Upload, ArrowRight, Loader2, CheckCircle2, Plus, Sparkles, X, Wand2 } from 'lucide-react';
import { FormData, ThemeColor, TemplateId } from '../chinasource-types';

interface BuilderFormProps {
  onSubmit: (data: FormData) => void;
  isGenerating: boolean;
}

const SUGGESTED_SERVICES = [
  "Product Sourcing", "Factory Audits", "Quality Control", 
  "Logistics & Shipping", "Customs Clearance", "Sample Consolidation",
  "Supplier Verification", "Price Negotiation", "OEM/ODM Development"
];

const SUGGESTED_MARKETS = [
  "USA", "European Union", "United Kingdom", "Australia", 
  "Middle East", "Latin America", "Southeast Asia", "Global"
];

const BuilderForm: React.FC<BuilderFormProps> = ({ onSubmit, isGenerating }) => {
  const [step, setStep] = useState(1);
  const [useMagicPrompt, setUseMagicPrompt] = useState(false);
  const [magicPrompt, setMagicPrompt] = useState('');
  
  const [formData, setFormData] = useState<FormData>({
    companyName: '',
    logo: null,
    logoUrl: null,
    services: '',
    countries: '',
    themeColor: 'amber',
    templateId: 'industrial',
    email: '',
    phone: '',
    whatsapp: '',
    wechat: '',
    facebook: '',
    instagram: '',
    linkedin: '',
    twitter: '',
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const toggleSelection = (field: 'services' | 'countries', item: string) => {
    setFormData((prev) => {
      const currentItems = prev[field] ? prev[field].split(',').map(i => i.trim()).filter(i => i !== "") : [];
      let newItems;
      if (currentItems.includes(item)) {
        newItems = currentItems.filter(i => i !== item);
      } else {
        newItems = [...currentItems, item];
      }
      return { ...prev, [field]: newItems.join(', ') };
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      setFormData((prev) => ({ ...prev, logo: file, logoUrl: url }));
    }
  };

  const handleColorSelect = (color: ThemeColor) => {
    setFormData(prev => ({ ...prev, themeColor: color }));
  };

  const handleTemplateSelect = (id: TemplateId) => {
    setFormData(prev => ({ ...prev, templateId: id }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (useMagicPrompt) {
      onSubmit({ ...formData, services: magicPrompt });
    } else {
      onSubmit(formData);
    }
  };

  const isSelected = (field: 'services' | 'countries', item: string) => {
    return formData[field].split(',').map(i => i.trim()).includes(item);
  };

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      {/* Progress Header */}
      <div className="max-w-xl w-full mb-8 flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
           <div className="bg-amber-500 p-2 rounded-lg">
             <Sparkles className="text-white w-5 h-5" />
           </div>
           <div>
             <h2 className="text-lg font-bold text-slate-900 leading-tight">Builder</h2>
             <p className="text-xs text-slate-500">Step {step} of 3</p>
           </div>
        </div>
        {!useMagicPrompt && (
          <div className="flex gap-1">
            {[1, 2, 3].map(i => (
              <div key={i} className={`h-1.5 w-8 rounded-full transition-colors ${step >= i ? 'bg-amber-500' : 'bg-slate-200'}`} />
            ))}
          </div>
        )}
      </div>

      <div className="max-w-xl w-full bg-white rounded-3xl shadow-2xl shadow-slate-200/50 overflow-hidden border border-slate-100">
        <form onSubmit={handleSubmit} className="p-8 md:p-10">
          
          {/* STEP 1: IDENTITY */}
          {step === 1 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="mb-8 flex justify-between items-start">
                <div>
                  <h1 className="text-2xl font-black text-slate-900 mb-2">Build your landing page</h1>
                  <p className="text-slate-500 text-sm">Let&apos;s start with your company name.</p>
                </div>
                <button 
                  type="button"
                  onClick={() => setUseMagicPrompt(!useMagicPrompt)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase transition-all ${useMagicPrompt ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                >
                  <Wand2 size={12} /> {useMagicPrompt ? 'Classic Mode' : 'Magic Prompt'}
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Company Name</label>
                <input 
                  type="text" 
                  name="companyName" 
                  required 
                  value={formData.companyName} 
                  onChange={handleInputChange} 
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-slate-900 focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 outline-none transition-all" 
                  placeholder="e.g., Global Sourcing Partners" 
                />
              </div>

              {useMagicPrompt ? (
                <div className="animate-fadeIn">
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">What does your company do?</label>
                  <textarea 
                    value={magicPrompt}
                    onChange={(e) => setMagicPrompt(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-slate-900 focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 outline-none transition-all h-32" 
                    placeholder="Describe your sourcing business in a few sentences... e.g., 'We source high-end furniture from Foshan for European retailers with full QC and shipping logistics.'"
                  />
                  <div className="pt-6">
                    <button 
                      type="submit" 
                      disabled={isGenerating || !formData.companyName || !magicPrompt}
                      className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-slate-800 disabled:opacity-50 transition-all shadow-xl shadow-slate-900/10 uppercase tracking-widest text-sm"
                    >
                      {isGenerating ? <Loader2 className="animate-spin" /> : <>Generate Page <Sparkles size={18} /></>}
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Company Logo (Optional)</label>
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="cursor-pointer bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center hover:bg-slate-100 hover:border-amber-300 transition-all group"
                    >
                      {formData.logoUrl ? (
                        <div className="relative">
                          <img src={formData.logoUrl} alt="Preview" className="h-16 object-contain" />
                          <button 
                            onClick={(e) => { e.stopPropagation(); setFormData(prev => ({ ...prev, logo: null, logoUrl: null })); }}
                            className="absolute -top-2 -right-2 bg-white shadow-md rounded-full p-1 text-slate-400 hover:text-red-500"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center text-slate-400 group-hover:text-amber-500">
                          <Upload className="w-8 h-8 mb-2" />
                          <span className="text-xs font-bold">Click to upload logo</span>
                        </div>
                      )}
                      <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                    </div>
                  </div>

                  <div className="pt-4">
                    <button 
                      type="button" 
                      onClick={nextStep}
                      disabled={!formData.companyName}
                      className="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-slate-800 disabled:opacity-50 transition-all shadow-xl shadow-slate-900/10"
                    >
                      Continue <ArrowRight size={18} />
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* STEP 2: SERVICES & MARKETS */}
          {!useMagicPrompt && step === 2 && (
            <div className="space-y-8 animate-fadeIn">
              <div className="mb-6">
                <h1 className="text-2xl font-black text-slate-900 mb-2">What do you do?</h1>
                <p className="text-slate-500 text-sm">Select what you offer and where you operate.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-3">Core Services</label>
                <div className="flex flex-wrap gap-2 mb-4">
                  {SUGGESTED_SERVICES.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => toggleSelection('services', s)}
                      className={`text-xs px-4 py-2 rounded-full border transition-all flex items-center gap-1.5 font-medium ${
                        isSelected('services', s) 
                        ? 'bg-amber-500 border-amber-500 text-white shadow-lg shadow-amber-500/20' 
                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-400'
                      }`}
                    >
                      {isSelected('services', s) ? <CheckCircle2 size={12} /> : <Plus size={12} />}
                      {s}
                    </button>
                  ))}
                </div>
                <textarea 
                  name="services" 
                  value={formData.services} 
                  onChange={handleInputChange} 
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-slate-900 text-sm focus:ring-4 focus:ring-amber-500/10 outline-none transition-all h-24" 
                  placeholder="Or type custom services..." 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-3">Target Markets</label>
                <div className="flex flex-wrap gap-2 mb-4">
                  {SUGGESTED_MARKETS.map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => toggleSelection('countries', m)}
                      className={`text-xs px-4 py-2 rounded-full border transition-all flex items-center gap-1.5 font-medium ${
                        isSelected('countries', m) 
                        ? 'bg-slate-900 border-slate-900 text-white shadow-lg shadow-slate-900/20' 
                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-400'
                      }`}
                    >
                      {isSelected('countries', m) ? <CheckCircle2 size={12} /> : <Plus size={12} />}
                      {m}
                    </button>
                  ))}
                </div>
                <input 
                  type="text"
                  name="countries" 
                  value={formData.countries} 
                  onChange={handleInputChange} 
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-slate-900 text-sm focus:ring-4 focus:ring-amber-500/10 outline-none transition-all" 
                  placeholder="Or type custom markets..." 
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={prevStep} className="w-1/3 bg-slate-100 text-slate-600 font-bold py-4 rounded-2xl hover:bg-slate-200 transition-all">Back</button>
                <button type="button" onClick={nextStep} className="w-2/3 bg-slate-900 text-white font-bold py-4 rounded-2xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10">Next</button>
              </div>
            </div>
          )}

          {/* STEP 3: STYLE & GENERATION */}
          {!useMagicPrompt && step === 3 && (
            <div className="space-y-8 animate-fadeIn">
              <div className="mb-6">
                <h1 className="text-2xl font-black text-slate-900 mb-2">Style your site</h1>
                <p className="text-slate-500 text-sm">Choose a vibe and generate your page.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-4 tracking-widest text-center">Select Template</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => handleTemplateSelect('industrial')}
                    className={`group relative p-4 rounded-2xl border-2 transition-all ${formData.templateId === 'industrial' ? 'border-amber-500 bg-amber-50 ring-4 ring-amber-500/10' : 'border-slate-100 bg-slate-50 hover:border-slate-200'}`}
                  >
                    <div className="aspect-video bg-white rounded-lg mb-3 overflow-hidden border border-slate-100 shadow-sm relative">
                      <div className="absolute top-0 left-0 w-full h-2 bg-slate-800"></div>
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1/2 h-4 bg-amber-200 rounded-full"></div>
                    </div>
                    <div className={`text-xs font-black uppercase tracking-tighter text-center ${formData.templateId === 'industrial' ? 'text-amber-600' : 'text-slate-400'}`}>Industrial</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleTemplateSelect('modern')}
                    className={`group relative p-4 rounded-2xl border-2 transition-all ${formData.templateId === 'modern' ? 'border-blue-500 bg-blue-50 ring-4 ring-blue-500/10' : 'border-slate-100 bg-slate-50 hover:border-slate-200'}`}
                  >
                    <div className="aspect-video bg-white rounded-lg mb-3 overflow-hidden border border-slate-100 shadow-sm relative">
                      <div className="absolute top-2 left-2 w-1/3 h-2 bg-blue-500 rounded-full"></div>
                      <div className="absolute top-6 right-2 w-1/2 h-10 bg-slate-100 rounded-lg"></div>
                    </div>
                    <div className={`text-xs font-black uppercase tracking-tighter text-center ${formData.templateId === 'modern' ? 'text-blue-600' : 'text-slate-400'}`}>Modern</div>
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <label className="block text-xs font-bold text-slate-400 uppercase mb-4 text-center">Brand Color</label>
                <div className="flex justify-center gap-4">
                  {(['amber', 'blue', 'red', 'emerald', 'indigo'] as ThemeColor[]).map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => handleColorSelect(color)}
                      className={`w-10 h-10 rounded-full transition-all ring-offset-4 ${
                        color === 'amber' ? 'bg-amber-500' : 
                        color === 'blue' ? 'bg-blue-600' : 
                        color === 'red' ? 'bg-red-600' : 
                        color === 'emerald' ? 'bg-emerald-600' : 'bg-indigo-600'
                      } ${formData.themeColor === color ? 'ring-2 ring-slate-900 scale-125 shadow-lg' : 'hover:scale-110 opacity-70'}`}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-6">
                <button type="button" onClick={prevStep} className="w-1/3 bg-slate-100 text-slate-600 font-bold py-4 rounded-2xl hover:bg-slate-200 transition-all">Back</button>
                <button
                  type="submit"
                  disabled={isGenerating}
                  className={`w-2/3 ${formData.templateId === 'industrial' ? 'bg-amber-500' : 'bg-blue-600'} text-white font-black py-4 rounded-2xl shadow-xl flex items-center justify-center gap-2 hover:brightness-110 disabled:opacity-50 transition-all uppercase tracking-widest text-sm`}
                >
                  {isGenerating ? <Loader2 className="animate-spin" /> : <>Generate Now <Sparkles size={18} /></>}
                </button>
              </div>
            </div>
          )}

        </form>
      </div>

      <p className="mt-8 text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em]">Powered by SourSync.com</p>
    </div>
  );
};

export default BuilderForm;
