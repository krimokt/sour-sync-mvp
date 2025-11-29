'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/context/StoreContext';
import { supabase } from '@/lib/supabase';
import { Globe, CheckCircle, AlertCircle, Copy, ExternalLink, Loader2, RefreshCw, CheckCircle2, ShieldCheck, Globe2 } from 'lucide-react';

interface DomainSettings {
  custom_domain: string | null;
  custom_domain_verified: boolean;
  ssl_status?: string;
  dns_status?: string;
  last_checked_at?: string;
}

export default function DomainSettingsPage() {
  const { company } = useStore();
  const [settings, setSettings] = useState<DomainSettings | null>(null);
  const [customDomain, setCustomDomain] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  // Netlify site URL
  const netlifyUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://soursync.com';
  const platformDomain = netlifyUrl.replace('https://', '').replace('http://', '');

  useEffect(() => {
    if (company?.id) {
      fetchSettings();
    }
  }, [company?.id]);

  // Polling Effect for Status
  useEffect(() => {
    let interval: NodeJS.Timeout;
    const shouldPoll = settings?.custom_domain && 
      (settings.dns_status !== 'active' || settings.ssl_status !== 'active');

    if (shouldPoll) {
      // Check every 10s
      interval = setInterval(checkStatus, 10000);
    }
    return () => clearInterval(interval);
  }, [settings?.custom_domain, settings?.dns_status, settings?.ssl_status]);

  const fetchSettings = async () => {
    if (!company?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('website_settings')
        .select('custom_domain, custom_domain_verified, ssl_status, dns_status, last_checked_at')
        .eq('company_id', company.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setSettings(data);
        setCustomDomain(data.custom_domain || '');
        
        // If pending, check status immediately
        if (data.custom_domain && (data.dns_status !== 'active' || data.ssl_status !== 'active')) {
            checkStatus();
        }
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkStatus = async () => {
    if (!company?.id || !settings?.custom_domain) return;
    setIsChecking(true);
    try {
      const res = await fetch('/api/netlfy/check-domain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: settings.custom_domain, companyId: company.id }),
      });
      const data = await res.json();
      if (data.dns_status) {
        setSettings(prev => prev ? { ...prev, ...data } : null);
      }
    } catch (e) {
      console.error('Status check failed', e);
    } finally {
        setIsChecking(false);
    }
  };

  const handleSave = async () => {
    if (!company?.id) return;
    
    setIsSaving(true);
    setMessage(null);

    try {
      // Clean up the domain
      const cleanDomain = customDomain
        .toLowerCase()
        .trim()
        .replace(/^https?:\/\//, '')
        .replace(/^www\./, '')
        .replace(/\/+$/, '');

      // Validate domain format
      const domainRegex = /^[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,}$/;
      if (cleanDomain && !domainRegex.test(cleanDomain)) {
        setMessage({ type: 'error', text: 'Please enter a valid domain (e.g., mycompany.com)' });
        setIsSaving(false);
        return;
      }

      const { error } = await supabase
        .from('website_settings')
        .update({
          custom_domain: cleanDomain || null,
          custom_domain_verified: false,
          ssl_status: 'pending',
          dns_status: 'pending',
        })
        .eq('company_id', company.id);

      if (error) {
        if (error.code === '23505') {
          setMessage({ type: 'error', text: 'This domain is already in use by another store' });
        } else {
          throw error;
        }
      } else {
        // Add domain to Netlify automatically
        try {
          await fetch('/api/netlfy/add-domain', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ domain: cleanDomain }),
          });
        } catch (err) {
          console.error('Failed to auto-configure Netlify:', err);
        }

        setMessage({ type: 'success', text: 'Domain saved! Follow the DNS instructions below.' });
        setSettings(prev => prev ? { 
            ...prev, 
            custom_domain: cleanDomain || null, 
            custom_domain_verified: false,
            ssl_status: 'pending',
            dns_status: 'pending'
        } : null);
        
        // Trigger immediate check
        setTimeout(checkStatus, 2000);
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      setMessage({ type: 'error', text: 'Failed to save settings' });
    } finally {
      setIsSaving(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleRemoveDomain = async () => {
    if (!company?.id) return;
    if (!confirm('Are you sure you want to remove your custom domain?')) return;

    setIsSaving(true);
    try {
      await supabase
        .from('website_settings')
        .update({
          custom_domain: null,
          custom_domain_verified: false,
          ssl_status: 'pending',
          dns_status: 'pending'
        })
        .eq('company_id', company.id);

      setCustomDomain('');
      setSettings(prev => prev ? { ...prev, custom_domain: null, custom_domain_verified: false, ssl_status: 'pending', dns_status: 'pending' } : null);
      setMessage({ type: 'success', text: 'Custom domain removed' });
    } catch (error) {
      console.error('Error removing domain:', error);
      setMessage({ type: 'error', text: 'Failed to remove domain' });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Domain Settings</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Connect your own domain to your storefront. We handle SSL and hosting automatically.
        </p>
      </div>

      {/* Current URLs */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Your Store URLs</h2>
        
        <div className="space-y-4">
          {/* Default URL */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div className="flex items-center gap-3">
              <Globe className="w-5 h-5 text-cyan-500" />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Default URL</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {platformDomain}/site/{company?.slug}
                </p>
              </div>
            </div>
            <a
              href={`${netlifyUrl}/site/${company?.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-gray-400 hover:text-cyan-500 transition-colors"
            >
              <ExternalLink className="w-5 h-5" />
            </a>
          </div>

          {/* Custom Domain */}
          {settings?.custom_domain && (
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
              <div className="flex items-center gap-3">
                {settings.ssl_status === 'active' ? (
                  <ShieldCheck className="w-5 h-5 text-green-500" />
                ) : (
                  <Globe2 className="w-5 h-5 text-cyan-500" />
                )}
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Custom Domain</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                    {settings.custom_domain}
                    
                    {/* Status Badges */}
                    {settings.dns_status === 'active' ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                            DNS Active
                        </span>
                    ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 animate-pulse">
                            Verifying DNS...
                        </span>
                    )}

                    {settings.dns_status === 'active' && (
                        settings.ssl_status === 'active' ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                SSL Secure
                            </span>
                        ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 animate-pulse">
                                Provisioning SSL...
                            </span>
                        )
                    )}
                  </p>
                </div>
              </div>
              <a
                href={`https://${settings.custom_domain}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-gray-400 hover:text-cyan-500 transition-colors"
              >
                <ExternalLink className="w-5 h-5" />
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Custom Domain Configuration */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {settings?.custom_domain ? 'Update Custom Domain' : 'Add Custom Domain'}
        </h2>

        {message && (
          <div className={`mb-4 p-4 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' 
              : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
          }`}>
            {message.text}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Your Domain
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={customDomain}
                onChange={(e) => setCustomDomain(e.target.value)}
                placeholder="mycompany.com"
                className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-6 py-2.5 bg-cyan-500 hover:bg-cyan-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                Save
              </button>
            </div>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Enter your domain without https:// or www (e.g., mycompany.com)
            </p>
          </div>

          {settings?.custom_domain && (
            <div className="flex gap-2 pt-2">
              <button
                onClick={checkStatus}
                disabled={isChecking}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`} />
                Check Status
              </button>
              <button
                onClick={handleRemoveDomain}
                disabled={isSaving}
                className="px-4 py-2 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                Remove Domain
              </button>
            </div>
          )}
        </div>
      </div>

      {/* DNS Instructions - Only show if not fully active */}
      {settings?.custom_domain && settings.ssl_status !== 'active' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm animate-fade-in">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></div>
            Required DNS Configuration
          </h2>
          
          <div className="space-y-6">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              To activate <strong>{settings.custom_domain}</strong>, add ONE of the following records to your domain provider:
            </p>

            {/* Option 1: CNAME (Recommended) */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                Option 1: CNAME Record (Recommended)
                <span className="text-xs font-normal text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">Best for subdomains like www</span>
              </h3>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-100 dark:border-gray-600">
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">Type</p>
                    <p className="font-mono font-bold text-gray-900 dark:text-white">CNAME</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">Host</p>
                    <div className="flex items-center gap-2">
                      <p className="font-mono font-bold text-gray-900 dark:text-white">www</p>
                      <button onClick={() => copyToClipboard('www', 'cname-name')} className="text-gray-400 hover:text-cyan-500">
                        {copied === 'cname-name' ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">Value</p>
                    <div className="flex items-center gap-2">
                      <p className="font-mono font-bold text-gray-900 dark:text-white text-xs truncate max-w-[150px]">phenomenal-snickerdoodle-3977a7.netlify.app</p>
                      <button onClick={() => copyToClipboard('phenomenal-snickerdoodle-3977a7.netlify.app', 'cname-value')} className="text-gray-400 hover:text-cyan-500">
                        {copied === 'cname-value' ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Option 2: A Record */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                Option 2: A Record
                <span className="text-xs font-normal text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">Use for root domain (example.com)</span>
              </h3>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-100 dark:border-gray-600">
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">Type</p>
                    <p className="font-mono font-bold text-gray-900 dark:text-white">A</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">Host</p>
                    <div className="flex items-center gap-2">
                      <p className="font-mono font-bold text-gray-900 dark:text-white">@</p>
                      <button onClick={() => copyToClipboard('@', 'a-name')} className="text-gray-400 hover:text-cyan-500">
                        {copied === 'a-name' ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">Value</p>
                    <div className="flex items-center gap-2">
                      <p className="font-mono font-bold text-gray-900 dark:text-white">75.2.60.5</p>
                      <button onClick={() => copyToClipboard('75.2.60.5', 'a-value')} className="text-gray-400 hover:text-cyan-500">
                        {copied === 'a-value' ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-sm text-gray-500 dark:text-gray-400 italic">
              Note: DNS propagation can take from a few minutes to 24 hours. The status above will update automatically.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
