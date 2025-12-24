import { ReactNode } from 'react';
import { redirect } from 'next/navigation';

interface PortalLayoutProps {
  children: ReactNode;
  params: Promise<{ token: string }>;
}

async function validateToken(token: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/client/validate-token?token=${encodeURIComponent(token)}`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Token validation error:', error);
    return null;
  }
}

export default async function PortalLayout({ children, params }: PortalLayoutProps) {
  const { token } = await params;
  
  const validationResult = await validateToken(token);

  if (!validationResult || !validationResult.valid) {
    redirect(`/c/${token}/invalid`);
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </div>
    </div>
  );
}




