'use client';

import { useState } from 'react';
import Button from '@/components/ui/button/Button';
import { Plus } from 'lucide-react';
import QuotationFormModalWithToken from '@/components/quotation/QuotationFormModalWithToken';

interface CreateQuotationButtonProps {
  token: string;
  allowedCountries?: string[];
  onSuccess?: () => void;
}

export default function CreateQuotationButton({ token, allowedCountries = [], onSuccess }: CreateQuotationButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSuccess = () => {
    // Call the onSuccess callback if provided, otherwise reload the page
    if (onSuccess) {
      setTimeout(() => {
        onSuccess();
      }, 2000);
    } else {
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    }
  };

  return (
    <>
      <Button
        variant="primary"
        onClick={() => setIsOpen(true)}
        startIcon={<Plus className="w-4 h-4" />}
      >
        Create Quote
      </Button>

      <QuotationFormModalWithToken
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        token={token}
        onSuccess={handleSuccess}
        allowedCountries={allowedCountries}
      />
    </>
  );
}

