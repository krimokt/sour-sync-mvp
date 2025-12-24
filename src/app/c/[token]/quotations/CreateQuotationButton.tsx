'use client';

import { useState } from 'react';
import Button from '@/components/ui/button/Button';
import { Plus } from 'lucide-react';
import QuotationFormModalWithToken from '@/components/quotation/QuotationFormModalWithToken';

interface CreateQuotationButtonProps {
  token: string;
  allowedCountries?: string[];
}

export default function CreateQuotationButton({ token, allowedCountries = [] }: CreateQuotationButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSuccess = () => {
    // Refresh the page to show the new quotation
    setTimeout(() => {
      window.location.reload();
    }, 2000);
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

