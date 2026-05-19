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
import { Eye, EyeOff, Send, Mail, Building2, User, LogOut } from 'lucide-react';

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

  // Email settings state
  const [resendApiKey, setResendApiKey] = useState((company as Record<string, string> | null)?.resend_api_key || '');
  const [emailFromDomain, setEmailFromDomain] = useState((company as Record<string, string> | null)?.email_from_domain || '');
  const [showResendKey, setShowResendKey] = useState(false);
  const [isTestingEmail, setIsTestingEmail] = useState(false);

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

  const handleSaveEmailSettings = async () => {
    if (!company?.id || !isOwner) return;
    setIsSaving(true);
    setMessage(null);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase.from('companies') as any)
        .update({ resend_api_key: resendApiKey || null, email_from_domain: emailFromDomain || null })
        .eq('id', company.id);
      if (error) throw error;
      setMessage({ type: 'success', text: 'Email settings saved!' });
    } catch {
      setMessage({ type: 'error', text: 'Failed to save email settings' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestEmail = async () => {
    if (!resendApiKey || !emailFromDomain || !company?.id) return;
    setIsTestingEmail(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/store/${company.slug}/email/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resendApiKey, emailFromDomain }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMessage({ type: 'success', text: `Test email sent to your account email!` });
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Test failed' });
    } finally {
      setIsTestingEmail(false);
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

  if (!company || !profile) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Page header + section nav */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <PageBreadcrumb pageTitle="Settings" />
        <nav className="flex items-center gap-1.5 flex-wrap">
          {[
            { href: '#company', label: 'Company' },
            { href: '#profile', label: 'Profile' },
            ...(isOwner ? [
              { href: '#payment', label: 'Payment' },
              { href: '#quotation', label: 'Quotation' },
              { href: '#email', label: 'Email' },
            ] : []),
            { href: '#account', label: 'Account' },
          ].map(({ href, label }) => (
            <a
              key={href}
              href={href}
              className="px-3 py-1.5 text-xs font-semibold rounded-full border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-[#06b6d4]/8 hover:border-[#06b6d4]/30 hover:text-[#06b6d4] transition-colors"
            >
              {label}
            </a>
          ))}
        </nav>
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl ${
            message.type === 'success'
              ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 border border-green-100 dark:border-green-900'
              : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 border border-red-100 dark:border-red-900'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Company Settings */}
        <div id="company" className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800/80 bg-gray-50/60 dark:bg-white/[0.01]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#06b6d4]/10 flex items-center justify-center flex-shrink-0">
                <Building2 className="w-4 h-4 text-[#06b6d4]" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-gray-800 dark:text-white">Company Settings</h2>
                <p className="text-xs text-gray-400 mt-0.5">Brand, region &amp; plan</p>
              </div>
            </div>
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
          <div className="p-6">
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
                              ? "bg-[#06b6d4]/10 dark:bg-[#06b6d4]/20"
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
        </div>

        {/* Profile Settings */}
        <div id="profile" className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800/80 bg-gray-50/60 dark:bg-white/[0.01]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#0f7aff]/10 flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-[#0f7aff]" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-gray-800 dark:text-white">Profile Settings</h2>
                <p className="text-xs text-gray-400 mt-0.5">Name, contact &amp; role</p>
              </div>
            </div>
          </div>
          <div className="p-6">
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
      </div>

      {/* Payment Settings */}
      {isOwner && (
        <div id="payment">
          <PaymentSettings companyId={company.id} companySlug={company.slug} />
        </div>
      )}

      {/* Quotation Settings */}
      {isOwner && (
        <div id="quotation">
          <QuotationSettings
            companyId={company.id}
            initialCountries={(company.quotation_countries as string[]) || []}
            initialInputFields={
              (company.quotation_input_fields as string[]) || ['product_name', 'product_url', 'quantity', 'product_images', 'variant_specs', 'notes']
            }
          />
        </div>
      )}

      {/* Email Settings */}
      {isOwner && (
        <div id="email" className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800/80 bg-gray-50/60 dark:bg-white/[0.01]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                <Mail className="w-4 h-4 text-amber-500" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-gray-800 dark:text-white">Email Settings</h2>
                <p className="text-xs text-gray-400 mt-0.5">Resend API &amp; sending domain</p>
              </div>
            </div>
          </div>
          <div className="p-6">
          <div className="space-y-4 max-w-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Resend API Key
              </label>
              <div className="relative">
                <input
                  type={showResendKey ? 'text' : 'password'}
                  value={resendApiKey}
                  onChange={e => setResendApiKey(e.target.value)}
                  placeholder="re_xxxxxxxxxxxxxxxxxxxx"
                  className="w-full px-4 py-2.5 pr-11 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#06b6d4]/40 focus:border-[#06b6d4]"
                />
                <button
                  type="button"
                  onClick={() => setShowResendKey(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showResendKey ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-400">Get your key at resend.com → API Keys</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Sending Domain
              </label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400 shrink-0">noreply@</span>
                <input
                  type="text"
                  value={emailFromDomain}
                  onChange={e => setEmailFromDomain(e.target.value.replace(/^noreply@/, ''))}
                  placeholder="yourdomain.com"
                  className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#06b6d4]/40 focus:border-[#06b6d4]"
                />
              </div>
              <p className="mt-1 text-xs text-gray-400">Must be verified in your Resend account</p>
            </div>

            <div className="rounded-xl bg-cyan-50 dark:bg-cyan-950/30 border border-cyan-100 dark:border-cyan-900 p-4 text-xs text-cyan-700 dark:text-cyan-300 space-y-1">
              <p className="font-semibold">Setup checklist</p>
              <p>1. Create a free account at resend.com</p>
              <p>2. Add &amp; verify your domain (adds DNS records)</p>
              <p>3. Create an API key and paste it above</p>
              <p>4. Enter your verified domain and save</p>
            </div>

            <div className="flex items-center gap-3 pt-1">
              <Button
                onClick={handleSaveEmailSettings}
                disabled={isSaving}
                variant="primary"
              >
                {isSaving ? 'Saving...' : 'Save Email Settings'}
              </Button>
              {resendApiKey && emailFromDomain && (
                <Button
                  onClick={handleTestEmail}
                  disabled={isTestingEmail}
                  variant="outline"
                >
                  <Send className="w-4 h-4 mr-1.5" />
                  {isTestingEmail ? 'Sending...' : 'Send Test Email'}
                </Button>
              )}
            </div>
          </div>
          </div>
        </div>
      )}

      {/* Account / Sign Out */}
      <div id="account" className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800/80 bg-gray-50/60 dark:bg-white/[0.01]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center flex-shrink-0">
              <LogOut className="w-4 h-4 text-red-500" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-gray-800 dark:text-white">Account</h2>
              <p className="text-xs text-gray-400 mt-0.5">Session &amp; sign out</p>
            </div>
          </div>
        </div>
        <div className="p-6 flex items-center justify-between gap-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Sign out of your account on this device.
          </p>
          <Button variant="outline" onClick={handleSignOut}>
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
}






