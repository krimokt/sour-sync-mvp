'use client';

import { useState, useEffect, useCallback } from 'react';
import { useStore } from '@/context/StoreContext';
import { supabase } from '@/lib/supabase';
import { Globe, Copy, ExternalLink, Loader2, RefreshCw, CheckCircle2, ShieldCheck, Globe2, Clock, Check, Circle } from 'lucide-react';

interface DnsRecord {
  type: string;
  host: string;
  value: string;
}

interface DomainSettings {
  custom_domain: string | null;
  custom_domain_verified: boolean;
  ssl_status?: string;
  dns_status?: string;
  last_checked_at?: string;
  netlify_dns_records?: DnsRecord[];
  netlify_domain_id?: string;
  domain_registered_at?: string;
  dns_verified_at?: string;
  ssl_provisioned_at?: string;
}

// Progress steps for domain setup
const DOMAIN_STEPS = [
  { id: 'registered', label: 'Domain Registered', description: 'Domain added to Netlify' },
  { id: 'dns_pending', label: 'DNS Configuration', description: 'Waiting for DNS to propagate' },
  { id: 'dns_verified', label: 'DNS Verified', description: 'DNS is pointing correctly' },
  { id: 'ssl_provisioning', label: 'SSL Certificate', description: 'Provisioning secure certificate' },
  { id: 'active', label: 'Domain Active', description: 'Your domain is live!' },
];

function getStepStatus(settings: DomainSettings | null): { [key: string]: 'completed' | 'current' | 'pending' } {
  if (!settings?.custom_domain) {
    return {
      registered: 'pending',
      dns_pending: 'pending',
      dns_verified: 'pending',
      ssl_provisioning: 'pending',
      active: 'pending',
    };
  }

  const dnsActive = settings.dns_status === 'active';
  const sslActive = settings.ssl_status === 'active';

  if (sslActive && dnsActive) {
    return {
      registered: 'completed',
      dns_pending: 'completed',
      dns_verified: 'completed',
      ssl_provisioning: 'completed',
      active: 'completed',
    };
  }

  if (dnsActive && !sslActive) {
    return {
      registered: 'completed',
      dns_pending: 'completed',
      dns_verified: 'completed',
      ssl_provisioning: 'current',
      active: 'pending',
    };
  }

  // DNS not yet verified
  return {
    registered: 'completed',
    dns_pending: 'current',
    dns_verified: 'pending',
    ssl_provisioning: 'pending',
    active: 'pending',
  };
}

function formatTimestamp(isoString: string | undefined | null): string {
  if (!isoString) return '';
  try {
    const date = new Date(isoString);
    return date.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '';
  }
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

  const fetchSettings = useCallback(async () => {
    if (!company?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('website_settings')
        .select('custom_domain, custom_domain_verified, ssl_status, dns_status, last_checked_at, netlify_dns_records, netlify_domain_id, domain_registered_at, dns_verified_at, ssl_provisioned_at')
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
  }, [company?.id]);

  const checkStatus = useCallback(async () => {
    if (!company?.id || !settings?.custom_domain) return;
    setIsChecking(true);
    try {
      const res = await fetch('/api/netlify/check-domain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: settings.custom_domain, companyId: company.id }),
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error('Status check failed:', errorData);
        return;
      }
      
      // Refresh from database after check
      await fetchSettings();
    } catch (e) {
      console.error('Status check failed', e);
    } finally {
      setIsChecking(false);
    }
  }, [company?.id, settings?.custom_domain, fetchSettings]);

  useEffect(() => {
    if (company?.id) {
      fetchSettings();
    }
  }, [company?.id, fetchSettings]);

  // Polling Effect for Status
  useEffect(() => {
    let interval: NodeJS.Timeout;
    const shouldPoll = settings?.custom_domain && 
      (settings.dns_status !== 'active' || settings.ssl_status !== 'active');

    if (shouldPoll) {
      // Initial check
      checkStatus();
      // Check every 10s
      interval = setInterval(checkStatus, 10000);
    }
    return () => clearInterval(interval);
  }, [settings?.custom_domain, settings?.dns_status, settings?.ssl_status, checkStatus]);

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

      // Register domain with Netlify API
      const registerRes = await fetch('/api/netlify/register-domain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: cleanDomain, companyId: company.id }),
      });

      const registerData = await registerRes.json();

      if (!registerRes.ok) {
        setMessage({ type: 'error', text: registerData.error || 'Failed to register domain' });
        setIsSaving(false);
        return;
      }

      setMessage({ type: 'success', text: 'Domain registered! Configure your DNS records below.' });
      
      // Refresh settings to get DNS records
      await fetchSettings();
      
      // Trigger immediate status check
      setTimeout(checkStatus, 2000);
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
          dns_status: 'pending',
          netlify_dns_records: [],
          netlify_domain_id: null,
          domain_registered_at: null,
          dns_verified_at: null,
          ssl_provisioned_at: null,
        })
        .eq('company_id', company.id);

      setCustomDomain('');
      setSettings(prev => prev ? { 
        ...prev, 
        custom_domain: null, 
        custom_domain_verified: false, 
        ssl_status: 'pending', 
        dns_status: 'pending',
        netlify_dns_records: [],
        netlify_domain_id: undefined,
        domain_registered_at: undefined,
        dns_verified_at: undefined,
        ssl_provisioned_at: undefined,
      } : null);
      setMessage({ type: 'success', text: 'Custom domain removed' });
    } catch (error) {
      console.error('Error removing domain:', error);
      setMessage({ type: 'error', text: 'Failed to remove domain' });
    } finally {
      setIsSaving(false);
    }
  };

  // Get DNS records from settings or use defaults
  const dnsRecords: DnsRecord[] = settings?.netlify_dns_records && settings.netlify_dns_records.length > 0
    ? settings.netlify_dns_records
    : [
        { type: 'A', host: '@', value: '75.2.60.5' },
        { type: 'CNAME', host: 'www', value: 'phenomenal-snickerdoodle-3977a7.netlify.app' },
      ];

  const stepStatuses = getStepStatus(settings);

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
                  <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2 flex-wrap">
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

      {/* Progress Steps - Only show when domain is set but not fully active */}
      {settings?.custom_domain && settings.ssl_status !== 'active' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Setup Progress</h2>
          
          <div className="space-y-4">
            {DOMAIN_STEPS.map((step, index) => {
              const status = stepStatuses[step.id];
              const isLast = index === DOMAIN_STEPS.length - 1;
              
              return (
                <div key={step.id} className="relative flex gap-4">
                  {/* Connector line */}
                  {!isLast && (
                    <div className={`absolute left-[15px] top-8 w-0.5 h-full -mb-4 ${
                      status === 'completed' ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'
                    }`} />
                  )}
                  
                  {/* Step icon */}
                  <div className={`relative z-10 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    status === 'completed' 
                      ? 'bg-green-500 text-white' 
                      : status === 'current'
                        ? 'bg-cyan-500 text-white animate-pulse'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
                  }`}>
                    {status === 'completed' ? (
                      <Check className="w-4 h-4" />
                    ) : status === 'current' ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Circle className="w-4 h-4" />
                    )}
                  </div>
                  
                  {/* Step content */}
                  <div className="flex-1 pb-4">
                    <p className={`text-sm font-medium ${
                      status === 'completed' 
                        ? 'text-green-600 dark:text-green-400' 
                        : status === 'current'
                          ? 'text-cyan-600 dark:text-cyan-400'
                          : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {step.label}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {step.description}
                    </p>
                    
                    {/* Timestamps */}
                    {step.id === 'registered' && settings.domain_registered_at && (
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTimestamp(settings.domain_registered_at)}
                      </p>
                    )}
                    {step.id === 'dns_verified' && settings.dns_verified_at && (
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        DNS Verified at {formatTimestamp(settings.dns_verified_at)}
                      </p>
                    )}
                    {step.id === 'active' && settings.ssl_provisioned_at && (
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        SSL Secured at {formatTimestamp(settings.ssl_provisioned_at)}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

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
              Add the following DNS records at your domain registrar (GoDaddy, Namecheap, Cloudflare, etc.):
            </p>

            {/* Dynamic DNS Records from Netlify */}
            <div className="space-y-4">
              {dnsRecords.map((record, index) => (
                <div key={index} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-100 dark:border-gray-600">
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                      record.type === 'A' 
                        ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                        : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                    }`}>
                      {record.type}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {record.type === 'A' ? 'Root domain (@)' : 'Subdomain (www)'}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">Type</p>
                      <p className="font-mono font-bold text-gray-900 dark:text-white">{record.type}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">Host / Name</p>
                      <div className="flex items-center gap-2">
                        <p className="font-mono font-bold text-gray-900 dark:text-white">{record.host}</p>
                        <button 
                          onClick={() => copyToClipboard(record.host, `host-${index}`)} 
                          className="text-gray-400 hover:text-cyan-500"
                        >
                          {copied === `host-${index}` ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">Value / Points to</p>
                      <div className="flex items-center gap-2">
                        <p className="font-mono font-bold text-gray-900 dark:text-white text-xs truncate max-w-[200px]" title={record.value}>
                          {record.value}
                        </p>
                        <button 
                          onClick={() => copyToClipboard(record.value, `value-${index}`)} 
                          className="text-gray-400 hover:text-cyan-500 flex-shrink-0"
                        >
                          {copied === `value-${index}` ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-100 dark:border-blue-800">
              <p className="text-sm text-blue-700 dark:text-blue-400">
                <strong>Tip:</strong> For root domain ({settings.custom_domain}), use the A record. 
                For www.{settings.custom_domain}, use the CNAME record. 
                You can set up both for full coverage.
              </p>
            </div>

            <p className="text-sm text-gray-500 dark:text-gray-400 italic flex items-center gap-2">
              <Clock className="w-4 h-4" />
              DNS propagation can take from a few minutes to 24 hours. We check automatically every 10 seconds.
            </p>
          </div>
        </div>
      )}

      {/* Success State - Show when fully active */}
      {settings?.custom_domain && settings.ssl_status === 'active' && settings.dns_status === 'active' && (
        <div className="bg-gradient-to-r from-green-50 to-cyan-50 dark:from-green-900/20 dark:to-cyan-900/20 rounded-xl border border-green-200 dark:border-green-800 p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-green-700 dark:text-green-400">
                Domain Active & Secured
              </h2>
              <p className="text-sm text-green-600 dark:text-green-500">
                Your custom domain <strong>{settings.custom_domain}</strong> is live with SSL encryption.
              </p>
              {settings.ssl_provisioned_at && (
                <p className="text-xs text-green-500 dark:text-green-600 mt-1">
                  SSL secured at {formatTimestamp(settings.ssl_provisioned_at)}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
