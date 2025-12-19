'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Copy, Check, Send, MessageSquare, Mail } from 'lucide-react';

interface GenerateMagicLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  companySlug: string;
  clientId: string;
  clientName?: string;
  clientPhone?: string;
  clientEmail?: string;
}

export default function GenerateMagicLinkModal({
  isOpen,
  onClose,
  companySlug,
  clientId,
  clientName,
  clientPhone,
  clientEmail,
}: GenerateMagicLinkModalProps) {
  const [expiresInDays, setExpiresInDays] = useState(30);
  const [maxUses, setMaxUses] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    setError('');
    setIsLoading(true);
    setGeneratedLink(null);

    try {
      const response = await fetch(
        `/api/store/${companySlug}/clients/${clientId}/magic-link`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            expiresInDays: parseInt(expiresInDays.toString()) || 30,
            maxUses: maxUses ? parseInt(maxUses) : null,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate magic link');
      }

      setGeneratedLink(data.magicLink.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (generatedLink) {
      navigator.clipboard.writeText(generatedLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setGeneratedLink(null);
      setError('');
      setCopied(false);
      onClose();
    }
  };

  const handleShare = (method: 'whatsapp' | 'sms' | 'email') => {
    if (!generatedLink) return;

    const message = `Hello ${clientName || 'there'}, here's your portal link: ${generatedLink}`;

    if (method === 'whatsapp') {
      const whatsappUrl = `https://wa.me/${clientPhone?.replace(/[^\d]/g, '')}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
    } else if (method === 'sms') {
      const smsUrl = `sms:${clientPhone}?body=${encodeURIComponent(message)}`;
      window.open(smsUrl);
    } else if (method === 'email' && clientEmail) {
      const emailUrl = `mailto:${clientEmail}?subject=Your Portal Access&body=${encodeURIComponent(message)}`;
      window.open(emailUrl);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
        <DialogHeader>
          <DialogTitle>Generate Magic Link</DialogTitle>
          <DialogDescription>
            Create a secure link for {clientName || 'this client'} to access their portal without login.
          </DialogDescription>
        </DialogHeader>

        {!generatedLink ? (
          <div className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="expiresInDays" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Expires In (days)
              </Label>
              <Input
                id="expiresInDays"
                type="number"
                min="1"
                max="365"
                value={expiresInDays}
                onChange={(e) => setExpiresInDays(parseInt(e.target.value) || 30)}
                disabled={isLoading}
                className="h-11 bg-white dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 focus:border-brand-500 focus:ring-brand-500/20 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxUses" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Max Uses <span className="text-gray-400 dark:text-gray-500 text-xs font-normal">(optional, leave empty for unlimited)</span>
              </Label>
              <Input
                id="maxUses"
                type="number"
                min="1"
                value={maxUses}
                onChange={(e) => setMaxUses(e.target.value)}
                placeholder="Unlimited"
                disabled={isLoading}
                className="h-11 bg-white dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 focus:border-brand-500 focus:ring-brand-500/20 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button onClick={handleGenerate} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  'Generate Link'
                )}
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <p className="text-sm font-medium text-green-800 dark:text-green-400 mb-2">
                Magic link generated successfully!
              </p>
              <div className="flex items-center gap-2">
                <Input
                  value={generatedLink}
                  readOnly
                  className="font-mono text-sm h-10 bg-white dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCopy}
                  className="shrink-0 h-10 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 mr-1" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-1" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
            </div>

            {(clientPhone || clientEmail) && (
              <div className="space-y-2">
                <Label>Share via</Label>
                <div className="flex gap-2">
                  {clientPhone && (
                    <>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleShare('whatsapp')}
                        className="flex-1"
                      >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        WhatsApp
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleShare('sms')}
                        className="flex-1"
                      >
                        <Send className="w-4 h-4 mr-2" />
                        SMS
                      </Button>
                    </>
                  )}
                  {clientEmail && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleShare('email')}
                      className="flex-1"
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      Email
                    </Button>
                  )}
                </div>
              </div>
            )}

            <DialogFooter>
              <Button onClick={handleClose}>Done</Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

