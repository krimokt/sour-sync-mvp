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
import { Loader2, UserPlus, Mail, User, Building2, Link2, AlertCircle } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

interface InviteClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  companySlug: string;
  onSuccess?: (clientData?: { id: string; email?: string; fullName?: string; phone?: string }) => void;
}

export default function InviteClientModal({
  isOpen,
  onClose,
  companySlug,
  onSuccess,
}: InviteClientModalProps) {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [generateMagicLink, setGenerateMagicLink] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch(`/api/store/${companySlug}/clients/invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          fullName: fullName.trim(),
          companyName: companyName.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to invite client');
      }

      // Success - prepare client data for magic link generation if requested
      const clientData = generateMagicLink && data.client ? {
        id: data.client.id,
        email: email.trim(),
        fullName: fullName.trim(),
        phone: data.client.phone_e164 || undefined,
      } : undefined;

      // Reset form and close
      setEmail('');
      setFullName('');
      setCompanyName('');
      const shouldGenerateMagicLink = generateMagicLink;
      setGenerateMagicLink(true); // Reset to default
      onClose();
      if (onSuccess) {
        onSuccess(shouldGenerateMagicLink ? clientData : undefined);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setEmail('');
      setFullName('');
      setCompanyName('');
      setError('');
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[540px] bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
        <DialogHeader className="space-y-3 pb-2">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-500/10 dark:bg-brand-500/20">
              <UserPlus className="h-5 w-5 text-brand-500" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-white">
                Create New Client
              </DialogTitle>
              <DialogDescription className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Add a new client to your system and optionally generate a magic link for portal access.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800/50 dark:bg-red-900/20">
              <AlertCircle className="h-5 w-5 shrink-0 text-red-600 dark:text-red-400 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-800 dark:text-red-400">Error</p>
                <p className="mt-1 text-sm text-red-700 dark:text-red-300">{error}</p>
              </div>
            </div>
          )}

          <div className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-400" />
                Email Address <span className="text-gray-400 dark:text-gray-500 text-xs">(optional)</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="client@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="h-11 bg-white dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 focus:border-brand-500 focus:ring-brand-500/20"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <User className="h-4 w-4 text-gray-400" />
                Full Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="fullName"
                type="text"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                disabled={isLoading}
                className="h-11 bg-white dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 focus:border-brand-500 focus:ring-brand-500/20"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="companyName" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <Building2 className="h-4 w-4 text-gray-400" />
                Company Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="companyName"
                type="text"
                placeholder="Client Company Inc."
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                required
                disabled={isLoading}
                className="h-11 bg-white dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 focus:border-brand-500 focus:ring-brand-500/20"
              />
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30 p-4">
            <div className="flex items-start space-x-3">
              <Checkbox
                id="generateMagicLink"
                checked={generateMagicLink}
                onCheckedChange={(checked) => setGenerateMagicLink(checked)}
                disabled={isLoading}
                className="mt-0.5"
              />
              <div className="flex-1 space-y-1">
                <Label
                  htmlFor="generateMagicLink"
                  className="text-sm font-medium cursor-pointer text-gray-900 dark:text-gray-100 flex items-center gap-2"
                >
                  <Link2 className="h-4 w-4 text-brand-500" />
                  Generate magic link
                </Label>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Automatically create a magic link for instant client portal access without login
                </p>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
              className="h-10 px-4"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
              className="h-10 px-6 bg-brand-500 hover:bg-brand-600 dark:bg-brand-500 dark:hover:bg-brand-600 text-white"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Create Client
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

