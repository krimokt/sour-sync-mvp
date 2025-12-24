'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ClientSignUpPage({ params }: { params: { companySlug: string } }) {
  const router = useRouter();

  useEffect(() => {
    // Redirect to signin page with signup mode
    router.replace(`/site/${params.companySlug}/signin?mode=signup`);
  }, [router, params.companySlug]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 mx-auto mb-4 border-4 border-gray-300 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-600">Redirecting...</p>
      </div>
    </div>
  );
}








