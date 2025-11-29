'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/context/StoreContext';
import { supabase } from '@/lib/supabase';
import { Globe, CheckCircle, AlertCircle, Copy, ExternalLink, Loader2 } from 'lucide-react';

interface DomainSettings {
  custom_domain: string | null;
  custom_domain_verified: boolean;
}

export default function DomainSettingsPage() {
  const { company } = useStore();
  const [settings, setSettings] = useState<DomainSettings | null>(null);
  const [customDomain, setCustomDomain] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  // Netlify site URL - this should be configured
  const netlifyUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://soursync.com';
  const platformDomain = netlifyUrl.replace('https://', '').replace('http://', '');

  useEffect(() => {
    if (company?.id) {
      fetchSettings();
    }
  }, [company?.id]);

  const fetchSettings = async () => {
    if (!company?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('website_settings')
        .select('custom_domain, custom_domain_verified')
        .eq('company_id', company.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setSettings(data);
        setCustomDomain(data.custom_domain || '');
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!company?.id) return;
    
    setIsSaving(true);
    setMessage(null);

    try {
      // Clean up the domain (remove protocol, www, trailing slashes)
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
          custom_domain_verified: false, // Reset verification when domain changes
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
          const netlifyRes = await fetch('/api/netlfy/add-domain', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ domain: cleanDomain }),
          });
          
          const netlifyData = await netlifyRes.json();
          if (netlifyData.warning) {
            console.warn(netlifyData.warning);
          }
        } catch (err) {
          console.error('Failed to auto-configure Netlify:', err);
          // We don't fail the whole operation since the DB save worked
        }

        setMessage({ type: 'success', text: 'Domain saved! Please configure your DNS records below.' });
        setSettings(prev => prev ? { ...prev, custom_domain: cleanDomain || null, custom_domain_verified: false } : null);
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      setMessage({ type: 'error', text: 'Failed to save settings' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleVerify = async () => {
    if (!company?.id || !settings?.custom_domain) return;
    
    setIsVerifying(true);
    setMessage(null);

    try {
      // Simple verification: try to fetch from the custom domain
      // In production, you might want to check DNS records or use a verification token
      const response = await fetch(`/api/verify-domain?domain=${encodeURIComponent(settings.custom_domain)}`);
      const data = await response.json();

      if (data.verified) {
        await supabase
          .from('website_settings')
          .update({ custom_domain_verified: true })
          .eq('company_id', company.id);

        setSettings(prev => prev ? { ...prev, custom_domain_verified: true } : null);
        setMessage({ type: 'success', text: 'Domain verified successfully!' });
      } else {
        setMessage({ type: 'error', text: 'Domain verification failed. Please check your DNS settings.' });
      }
    } catch (error) {
      console.error('Error verifying domain:', error);
      setMessage({ type: 'error', text: 'Verification failed. Please try again.' });
    } finally {
      setIsVerifying(false);
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
        })
        .eq('company_id', company.id);

      setCustomDomain('');
      setSettings(prev => prev ? { ...prev, custom_domain: null, custom_domain_verified: false } : null);
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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Domain Settings</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Connect your own domain to your storefront, just like Shopify
        </p>
      </div>

      {/* Current URLs */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
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
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div className="flex items-center gap-3">
                {settings.custom_domain_verified ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-yellow-500" />
                )}
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Custom Domain</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {settings.custom_domain}
                    {!settings.custom_domain_verified && (
                      <span className="ml-2 text-yellow-500">(pending verification)</span>
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
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
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
            <div className="flex gap-2">
              {!settings.custom_domain_verified && (
                <button
                  onClick={handleVerify}
                  disabled={isVerifying}
                  className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isVerifying && <Loader2 className="w-4 h-4 animate-spin" />}
                  Verify Domain
                </button>
              )}
              <button
                onClick={handleRemoveDomain}
                disabled={isSaving}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                Remove Domain
              </button>
            </div>
          )}
        </div>
      </div>

      {/* DNS Instructions */}
      {settings?.custom_domain && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            DNS Configuration Instructions
          </h2>
          
          <div className="space-y-6">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              To connect your domain <strong>{settings.custom_domain}</strong>, add the following DNS records at your domain registrar:
            </p>

            {/* Option 1: CNAME */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                Option 1: CNAME Record (Recommended)
              </h3>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 space-y-3">
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Type</p>
                    <p className="font-mono font-medium text-gray-900 dark:text-white">CNAME</p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Name/Host</p>
                    <div className="flex items-center gap-2">
                      <p className="font-mono font-medium text-gray-900 dark:text-white">@</p>
                      <button
                        onClick={() => copyToClipboard('@', 'cname-name')}
                        className="p-1 text-gray-400 hover:text-cyan-500 transition-colors"
                      >
                        {copied === 'cname-name' ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Value/Target</p>
                    <div className="flex items-center gap-2">
                      <p className="font-mono font-medium text-gray-900 dark:text-white text-xs break-all">
                        phenomenal-snickerdoodle-3977a7.netlify.app
                      </p>
                      <button
                        onClick={() => copyToClipboard('phenomenal-snickerdoodle-3977a7.netlify.app', 'cname-value')}
                        className="p-1 text-gray-400 hover:text-cyan-500 transition-colors shrink-0"
                      >
                        {copied === 'cname-value' ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Option 2: A Record */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                Option 2: A Record (If CNAME not supported for root domain)
              </h3>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 space-y-3">
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Type</p>
                    <p className="font-mono font-medium text-gray-900 dark:text-white">A</p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Name/Host</p>
                    <div className="flex items-center gap-2">
                      <p className="font-mono font-medium text-gray-900 dark:text-white">@</p>
                      <button
                        onClick={() => copyToClipboard('@', 'a-name')}
                        className="p-1 text-gray-400 hover:text-cyan-500 transition-colors"
                      >
                        {copied === 'a-name' ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Value (Netlify Load Balancer)</p>
                    <div className="flex items-center gap-2">
                      <p className="font-mono font-medium text-gray-900 dark:text-white">75.2.60.5</p>
                      <button
                        onClick={() => copyToClipboard('75.2.60.5', 'a-value')}
                        className="p-1 text-gray-400 hover:text-cyan-500 transition-colors"
                      >
                        {copied === 'a-value' ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Add domain to Netlify reminder */}
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                ⚠️ Important: Add Domain to Netlify
              </h3>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                You also need to add <strong>{settings.custom_domain}</strong> as a custom domain in Netlify:
              </p>
              <ol className="mt-2 text-sm text-yellow-700 dark:text-yellow-300 list-decimal list-inside space-y-1">
                <li>Go to <a href="https://app.netlify.com" target="_blank" rel="noopener noreferrer" className="underline">Netlify Dashboard</a></li>
                <li>Select your site → Domain settings</li>
                <li>Click &quot;Add custom domain&quot;</li>
                <li>Enter: <strong>{settings.custom_domain}</strong></li>
              </ol>
            </div>

            <p className="text-sm text-gray-500 dark:text-gray-400">
              DNS changes can take up to 48 hours to propagate. Once configured, click &quot;Verify Domain&quot; to confirm your setup.
            </p>
          </div>
        </div>
      )}

      {/* How it works */}
      <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 dark:from-cyan-500/5 dark:to-blue-500/5 rounded-xl border border-cyan-200 dark:border-cyan-800 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          How Custom Domains Work
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-500 font-bold">
              1
            </div>
            <h3 className="font-medium text-gray-900 dark:text-white">Add Your Domain</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Enter your domain name (e.g., mycompany.com) and save.
            </p>
          </div>
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-500 font-bold">
              2
            </div>
            <h3 className="font-medium text-gray-900 dark:text-white">Configure DNS</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Add the DNS records at your domain registrar (GoDaddy, Namecheap, etc.)
            </p>
          </div>
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-500 font-bold">
              3
            </div>
            <h3 className="font-medium text-gray-900 dark:text-white">Go Live!</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Once DNS propagates, your store will be live on your custom domain with SSL.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

