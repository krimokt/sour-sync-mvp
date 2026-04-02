'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useStore } from '@/context/StoreContext';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import Button from '@/components/ui/button/Button';
import PaymentSettings from '@/components/settings/PaymentSettings';
import QuotationSettings from '@/components/settings/QuotationSettings';
import { countries as countryCodes } from 'country-flag-icons';
import { CloseIcon } from '@/icons';

// Helper function to get emoji flag from country code
const getCountryEmoji = (countryCode: string): string => {
  try {
    const codePoints = countryCode
      .toUpperCase()
      .split('')
      .map(char => 127397 + char.charCodeAt(0));
    
    return String.fromCodePoint(...codePoints);
  } catch (error) {
    console.warn(`Failed to generate emoji for country code: ${countryCode}`, error);
    return '🏳️'; // Default flag emoji
  }
};

// Helper function to get country name from code
const getCountryName = (code: string): string => {
  if (!code) return code;
  
  // Filter out subdivision codes (codes with hyphens like "GB-ENG", "ES-CT")
  // These are ISO 3166-2 subdivision codes, not ISO 3166-1 country codes
  if (code.includes('-')) {
    // Extract the country part (before the hyphen)
    const countryCode = code.split('-')[0];
    code = countryCode;
  }
  
  // Validate it's a 2-letter country code
  if (code.length !== 2) {
    return code;
  }
  
  try {
    const displayNames = new Intl.DisplayNames(['en'], { type: 'region' });
    const name = displayNames.of(code.toUpperCase());
    return name || code;
  } catch (error) {
    // Silently return the code if DisplayNames fails
    return code;
  }
};

// Type for country data
interface CountryData {
  code: string;
  name: string;
  emoji: string;
}

export default function SettingsPage() {
  const { company, profile, isOwner } = useStore();
  const { signOut } = useAuth();
  
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  // Company form state
  const [companyName, setCompanyName] = useState(company?.name || '');
  const [country, setCountry] = useState(company?.country || '');
  const [currency, setCurrency] = useState(company?.currency || 'USD');
  const [countrySearchQuery, setCountrySearchQuery] = useState('');
  const [logoUrl, setLogoUrl] = useState(company?.logo_url || '');
  const [logoPreview, setLogoPreview] = useState(company?.logo_url || '');
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Profile form state
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [phone, setPhone] = useState(profile?.phone || '');

  // Invoice settings state
  const [invoiceColor, setInvoiceColor] = useState('#7c3aed');
  const [invoiceTaxLabel, setInvoiceTaxLabel] = useState('Tax');
  const [invoiceTaxNumber, setInvoiceTaxNumber] = useState('');
  const [invoiceTaxRate, setInvoiceTaxRate] = useState('0');
  const [invoicePaymentTerms, setInvoicePaymentTerms] = useState('');
  const [invoiceFooterText, setInvoiceFooterText] = useState('');
  const [isSavingInvoiceSettings, setIsSavingInvoiceSettings] = useState(false);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !company?.id) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Please select an image file' });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Image size must be less than 5MB' });
      return;
    }

    setIsUploadingLogo(true);
    setMessage(null);

    try {
      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${company.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      // Delete old logo if it exists
      if (logoUrl && logoUrl.includes('/storage/v1/object/public/')) {
        try {
          const oldPath = logoUrl.split('/storage/v1/object/public/company-logos/')[1];
          if (oldPath) {
            await supabase.storage.from('company-logos').remove([oldPath]);
          }
        } catch (error) {
          console.warn('Error deleting old logo:', error);
        }
      }

      // Upload to Supabase Storage
      const { data, error: uploadError } = await supabase.storage
        .from('company-logos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        // Try uploading to a different bucket if company-logos doesn't exist
        const { data: altData, error: altError } = await supabase.storage
          .from('product-images')
          .upload(`logos/${fileName}`, file, {
            cacheControl: '3600',
            upsert: false,
          });

        if (altError) throw altError;

        const { data: urlData } = supabase.storage
          .from('product-images')
          .getPublicUrl(altData.path);
        
        setLogoUrl(urlData.publicUrl);
        setLogoPreview(urlData.publicUrl);
      } else {
        // Get public URL
        const { data: urlData } = supabase.storage
          .from('company-logos')
          .getPublicUrl(data.path);
        
        setLogoUrl(urlData.publicUrl);
        setLogoPreview(urlData.publicUrl);
      }

      setMessage({ type: 'success', text: 'Logo uploaded successfully! Click "Save Company Settings" to apply.' });
    } catch (error) {
      console.error('Error uploading logo:', error);
      setMessage({ type: 'error', text: 'Failed to upload logo. Please try again.' });
    } finally {
      setIsUploadingLogo(false);
      // Reset file input
      e.target.value = '';
    }
  };

  const handleRemoveLogo = () => {
    setLogoUrl('');
    setLogoPreview('');
  };

  const handleSaveCompany = async () => {
    if (!company?.id || !isOwner) return;
    
    setIsSaving(true);
    setMessage(null);
    
    try {
      const { error } = await (
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        supabase.from('companies') as any
      )
        .update({
          name: companyName,
          country,
          currency,
          logo_url: logoUrl || null,
        })
        .eq('id', company.id);

      if (error) throw error;
      
      setMessage({ type: 'success', text: 'Company settings saved successfully!' });
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving company:', error);
      setMessage({ type: 'error', text: 'Failed to save company settings' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!profile?.id) return;
    
    setIsSaving(true);
    setMessage(null);
    
    try {
      const { error } = await (
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        supabase.from('profiles') as any
      )
        .update({
          full_name: fullName,
          phone,
        })
        .eq('id', profile.id);

      if (error) throw error;
      
      setMessage({ type: 'success', text: 'Profile saved successfully!' });
    } catch (error) {
      console.error('Error saving profile:', error);
      setMessage({ type: 'error', text: 'Failed to save profile' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  // Build countries list
  const countries = useMemo(() => {
    const displayNames = new Intl.DisplayNames(['en'], { type: 'region' });
    const countryList: CountryData[] = countryCodes
      .map((code) => {
        try {
          const name = displayNames.of(code);
          if (!name) return null;
          
          return {
            code: code.toLowerCase(),
            name: name,
            emoji: getCountryEmoji(code)
          };
        } catch (error) {
          // Skip invalid country codes
          console.warn(`Invalid country code: ${code}`, error);
          return null;
        }
      })
      .filter((country): country is CountryData => country !== null)
      .sort((a, b) => a.name.localeCompare(b.name));
    
    return countryList;
  }, []);

  // Filter countries based on search query
  const filteredCountries = useMemo(() => {
    if (!countrySearchQuery.trim()) return countries;
    return countries.filter(country => 
      country.name.toLowerCase().includes(countrySearchQuery.toLowerCase()) || 
      country.code.toLowerCase().includes(countrySearchQuery.toLowerCase())
    );
  }, [countries, countrySearchQuery]);

  const handleCountrySearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCountrySearchQuery(value);
    // If input is cleared, clear the country selection
    if (!value.trim() && country) {
      setCountry('');
    }
  };

  // Sync logo URL when company data changes
  useEffect(() => {
    if (company?.logo_url) {
      setLogoUrl(company.logo_url);
      setLogoPreview(company.logo_url);
    }
  }, [company?.logo_url]);

  // Fetch invoice settings from website_settings
  useEffect(() => {
    if (!company?.id) return;
    const fetchInvoiceSettings = async () => {
      const { data } = await supabase
        .from('website_settings')
        .select('primary_color, invoice_tax_label, invoice_tax_number, invoice_tax_rate, invoice_payment_terms, invoice_footer_text')
        .eq('company_id', company.id)
        .single();
      if (data) {
        if (data.primary_color) setInvoiceColor(data.primary_color);
        if (data.invoice_tax_label) setInvoiceTaxLabel(data.invoice_tax_label);
        if (data.invoice_tax_number) setInvoiceTaxNumber(data.invoice_tax_number);
        if (data.invoice_tax_rate != null) setInvoiceTaxRate(String(data.invoice_tax_rate));
        if (data.invoice_payment_terms) setInvoicePaymentTerms(data.invoice_payment_terms);
        if (data.invoice_footer_text) setInvoiceFooterText(data.invoice_footer_text);
      }
    };
    fetchInvoiceSettings();
  }, [company?.id]);

  const handleSaveInvoiceSettings = async () => {
    if (!company?.id || !isOwner) return;
    setIsSavingInvoiceSettings(true);
    setMessage(null);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase.from('website_settings') as any)
        .upsert(
          {
            company_id: company.id,
            primary_color: invoiceColor,
            invoice_tax_label: invoiceTaxLabel || 'Tax',
            invoice_tax_number: invoiceTaxNumber || null,
            invoice_tax_rate: parseFloat(invoiceTaxRate) || 0,
            invoice_payment_terms: invoicePaymentTerms || null,
            invoice_footer_text: invoiceFooterText || null,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'company_id' }
        );
      if (error) throw error;
      setMessage({ type: 'success', text: 'Invoice settings saved!' });
    } catch (error) {
      console.error('Error saving invoice settings:', error);
      setMessage({ type: 'error', text: 'Failed to save invoice settings' });
    } finally {
      setIsSavingInvoiceSettings(false);
    }
  };

  if (!company || !profile) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <PageBreadcrumb pageTitle="Settings" />

      {message && (
        <div
          className={`mb-6 p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
              : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Company Settings */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
              Company Settings
            </h2>
            {isOwner && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? 'Cancel' : 'Edit'}
              </Button>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <Label>Company Logo</Label>
              <div className="mt-2 flex items-center gap-4">
                {logoPreview ? (
                  <div className="relative">
                    <img
                      src={logoPreview}
                      alt="Company logo"
                      className="h-20 w-20 object-contain rounded-lg border border-gray-200 dark:border-gray-700"
                    />
                    {isEditing && (
                      <button
                        type="button"
                        onClick={handleRemoveLogo}
                        className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                        title="Remove logo"
                      >
                        <CloseIcon className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="h-20 w-20 flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                    <span className="text-gray-400 text-xs text-center px-2">No logo</span>
                  </div>
                )}
                {isEditing && (
                  <div className="flex-1">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      disabled={isUploadingLogo}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={isUploadingLogo}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {isUploadingLogo ? 'Uploading...' : logoPreview ? 'Change Logo' : 'Upload Logo'}
                    </Button>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      JPG, PNG or GIF (max. 5MB)
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div>
              <Label>Company Name</Label>
              {isEditing ? (
                <Input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                />
              ) : (
                <p className="text-gray-800 dark:text-white">{company.name}</p>
              )}
            </div>

            <div>
              <Label>Store URL</Label>
              <p className="text-gray-600 dark:text-gray-400">
                soursync.com/store/<span className="font-medium">{company.slug}</span>
              </p>
            </div>

            <div>
              <Label>Country</Label>
              {isEditing ? (
                <div className="space-y-2">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search countries..."
                      value={country && !countrySearchQuery 
                        ? countries.find(c => c.code === country)?.name || "" 
                        : countrySearchQuery}
                      onChange={handleCountrySearchChange}
                      onFocus={() => {
                        // When user focuses on input, clear it if it shows the selected country name
                        if (country && countrySearchQuery === countries.find(c => c.code === country)?.name) {
                          setCountrySearchQuery("");
                        }
                      }}
                      className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
                    />
                    {country && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setCountry("");
                          setCountrySearchQuery("");
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                        title="Clear selection"
                      >
                        <CloseIcon className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  
                  <div className={`overflow-y-auto border border-gray-300 rounded-md transition-all duration-200 ${
                    country ? 'h-auto max-h-[60px]' : 'h-[200px]'
                  }`}>
                    {filteredCountries.length === 0 ? (
                      <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                        No countries found matching your search.
                      </div>
                    ) : (
                      filteredCountries.map((countryOption) => (
                        <div
                          key={countryOption.code}
                          onClick={() => {
                            setCountry(countryOption.code);
                            setCountrySearchQuery(countryOption.name);
                          }}
                          className={`flex items-center gap-2 p-3 cursor-pointer border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                            country === countryOption.code
                              ? "bg-[#06b6d4]/10 dark:bg-[#06b6d4]/20 border-l-2 border-l-[#06b6d4] dark:border-l-[#06b6d4]"
                              : ""
                          }`}
                        >
                          <span className="text-xl">{countryOption.emoji}</span>
                          <span className="text-gray-900 dark:text-white">{countryOption.name}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-gray-800 dark:text-white">
                  {country ? getCountryName(country) : '-'}
                </p>
              )}
            </div>

            <div>
              <Label>Currency</Label>
              {isEditing ? (
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:border-gray-700 dark:bg-gray-800"
                >
                  <option value="USD">USD - US Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="GBP">GBP - British Pound</option>
                  <option value="CNY">CNY - Chinese Yuan</option>
                  <option value="JPY">JPY - Japanese Yen</option>
                </select>
              ) : (
                <p className="text-gray-800 dark:text-white">{company.currency}</p>
              )}
            </div>

            <div>
              <Label>Plan</Label>
              <p className="text-gray-800 dark:text-white capitalize">{company.plan}</p>
            </div>

            <div>
              <Label>Status</Label>
              <span
                className={`inline-flex px-2 py-1 text-sm rounded-full ${
                  company.status === 'active'
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                }`}
              >
                {company.status}
              </span>
            </div>

            {isEditing && isOwner && (
              <Button
                className="w-full"
                onClick={handleSaveCompany}
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : 'Save Company Settings'}
              </Button>
            )}
          </div>
        </div>

        {/* Profile Settings */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">
            Profile Settings
          </h2>

          <div className="space-y-4">
            <div>
              <Label>Full Name</Label>
              <Input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>

            <div>
              <Label>Email</Label>
              <p className="text-gray-600 dark:text-gray-400">{profile.email}</p>
              <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
            </div>

            <div>
              <Label>Phone</Label>
              <Input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Your phone number"
              />
            </div>

            <div>
              <Label>Role</Label>
              <p className="text-gray-800 dark:text-white capitalize">{profile.role}</p>
            </div>

            <Button
              className="w-full"
              onClick={handleSaveProfile}
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Profile'}
            </Button>
          </div>
        </div>
      </div>

      {/* Payment Settings */}
      {isOwner && (
        <div className="mt-6">
          <PaymentSettings companyId={company.id} companySlug={company.slug} />
        </div>
      )}

      {/* Quotation Settings */}
      {isOwner && (
        <div className="mt-6">
          <QuotationSettings 
            companyId={company.id} 
            initialCountries={(company.quotation_countries as string[]) || []}
            initialInputFields={
              (company.quotation_input_fields as string[]) || ['product_name', 'product_url', 'quantity', 'product_images', 'variant_specs', 'notes']
            }
          />
        </div>
      )}

      {/* Invoice Settings */}
      {isOwner && (
        <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
            Invoice Settings
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Customize how your invoices look and what information they include.
          </p>

          <div className="space-y-6">
            {/* Accent color */}
            <div>
              <Label>Accent Color</Label>
              <div className="flex items-center gap-3 mt-2">
                <input
                  type="color"
                  value={invoiceColor}
                  onChange={(e) => setInvoiceColor(e.target.value)}
                  className="w-10 h-10 rounded cursor-pointer border border-gray-300 dark:border-gray-600"
                  style={{ padding: '2px' }}
                />
                <input
                  type="text"
                  value={invoiceColor}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (/^#[0-9a-fA-F]{0,6}$/.test(val)) {
                      setInvoiceColor(val);
                    }
                  }}
                  className="w-28 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  placeholder="#7c3aed"
                />
                <div
                  className="h-10 flex-1 rounded-lg border border-gray-200 dark:border-gray-700"
                  style={{ backgroundColor: invoiceColor, maxWidth: '120px' }}
                />
              </div>
              <div className="flex gap-2 mt-2 flex-wrap">
                {[
                  { color: '#7c3aed', name: 'Purple' },
                  { color: '#2563eb', name: 'Blue' },
                  { color: '#059669', name: 'Green' },
                  { color: '#dc2626', name: 'Red' },
                  { color: '#d97706', name: 'Amber' },
                  { color: '#0f172a', name: 'Slate' },
                ].map((preset) => (
                  <button
                    key={preset.color}
                    onClick={() => setInvoiceColor(preset.color)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-colors text-xs ${
                      invoiceColor === preset.color
                        ? 'border-gray-900 dark:border-white bg-gray-50 dark:bg-gray-800'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-400'
                    }`}
                    title={preset.name}
                  >
                    <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: preset.color }} />
                    <span className="text-gray-600 dark:text-gray-400">{preset.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Tax / VAT */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label>Tax Label</Label>
                <input
                  type="text"
                  value={invoiceTaxLabel}
                  onChange={(e) => setInvoiceTaxLabel(e.target.value)}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  placeholder="Tax / VAT / GST"
                />
              </div>
              <div>
                <Label>Tax Rate (%)</Label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={invoiceTaxRate}
                  onChange={(e) => setInvoiceTaxRate(e.target.value)}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  placeholder="0"
                />
              </div>
              <div>
                <Label>Tax / Registration Number</Label>
                <input
                  type="text"
                  value={invoiceTaxNumber}
                  onChange={(e) => setInvoiceTaxNumber(e.target.value)}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  placeholder="e.g. GB123456789"
                />
              </div>
            </div>

            {/* Payment terms */}
            <div>
              <Label>Payment Terms</Label>
              <div className="flex gap-2 mt-1 flex-wrap">
                {['Due on receipt', 'Net 7', 'Net 15', 'Net 30', 'Net 60'].map((term) => (
                  <button
                    key={term}
                    onClick={() => setInvoicePaymentTerms(invoicePaymentTerms === term ? '' : term)}
                    className={`px-3 py-1.5 rounded-lg border text-xs transition-colors ${
                      invoicePaymentTerms === term
                        ? 'border-gray-900 dark:border-white bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white'
                        : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-400'
                    }`}
                  >
                    {term}
                  </button>
                ))}
              </div>
              <input
                type="text"
                value={invoicePaymentTerms}
                onChange={(e) => setInvoicePaymentTerms(e.target.value)}
                className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                placeholder="Custom payment terms…"
              />
            </div>

            {/* Footer text */}
            <div>
              <Label>Invoice Footer Text</Label>
              <textarea
                value={invoiceFooterText}
                onChange={(e) => setInvoiceFooterText(e.target.value)}
                rows={2}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white resize-none"
                placeholder="e.g. Thank you for your business! Bank details: …"
              />
            </div>

            {/* Live mini-preview */}
            <div>
              <span className="text-xs text-gray-500 dark:text-gray-400">Preview</span>
              <div className="mt-2 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden" style={{ maxWidth: '320px' }}>
                <div style={{ height: '3px', backgroundColor: invoiceColor }} />
                <div className="p-3 flex justify-between items-start">
                  <div>
                    <div className="text-xs font-semibold text-gray-800 dark:text-white">Your Company</div>
                    {invoiceTaxNumber && (
                      <div className="text-[10px] text-gray-400">{invoiceTaxLabel}: {invoiceTaxNumber}</div>
                    )}
                  </div>
                  <div style={{ color: invoiceColor }} className="text-sm font-bold">INVOICE</div>
                </div>
                <div className="px-3 pb-3 space-y-1">
                  {parseFloat(invoiceTaxRate) > 0 && (
                    <div className="flex justify-between text-[10px] text-gray-500">
                      <span>{invoiceTaxLabel} ({invoiceTaxRate}%)</span>
                      <span>$12.50</span>
                    </div>
                  )}
                  <div className="flex justify-between text-[10px] border-t pt-1" style={{ borderColor: `${invoiceColor}40` }}>
                    <span className="text-gray-500">Total Due</span>
                    <span style={{ color: invoiceColor }} className="font-bold">$125.00</span>
                  </div>
                  {invoicePaymentTerms && (
                    <div className="text-[10px] text-gray-400">{invoicePaymentTerms}</div>
                  )}
                </div>
              </div>
            </div>

            <Button
              onClick={handleSaveInvoiceSettings}
              disabled={isSavingInvoiceSettings}
              className="mt-2"
            >
              {isSavingInvoiceSettings ? 'Saving…' : 'Save Invoice Settings'}
            </Button>
          </div>
        </div>
      )}

      {/* Sign Out Section */}
      <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
          Account
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Sign out of your account on this device.
        </p>
        <Button variant="outline" onClick={handleSignOut}>
          Sign Out
        </Button>
      </div>
    </>
  );
}






