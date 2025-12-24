import { redirect } from 'next/navigation';

interface PortalHomeProps {
  params: Promise<{ token: string }>;
}

async function getClientData(token: string) {
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
    console.error('Error fetching client data:', error);
    return null;
  }
}

async function getRecentQuotations(clientUserId: string, companyId: string) {
  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data, error } = await supabase
      .from('quotations')
      .select('*')
      .eq('user_id', clientUserId)
      .eq('company_id', companyId)
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) {
      console.error('Error fetching quotations:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching quotations:', error);
    return [];
  }
}

export default async function PortalHome({ params }: PortalHomeProps) {
  const { token } = await params;
  
  const clientData = await getClientData(token);

  if (!clientData || !clientData.valid) {
    redirect(`/c/${token}/invalid`);
  }

  const { client, company } = clientData;
  const quotations = await getRecentQuotations(client.user_id, company.id);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Welcome, {client.name || 'Client'}!
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Access your quotations, payments, and shipping information.
        </p>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <a
          href={`/c/${token}/quotations`}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Quotations</h3>
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            View and manage your quotations
          </p>
        </a>

        <a
          href={`/c/${token}/payments`}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Payments</h3>
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            View invoices and payment status
          </p>
        </a>

        <a
          href={`/c/${token}/shipping`}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Shipping</h3>
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Track your shipments and deliveries
          </p>
        </a>
      </div>

      {/* Recent Quotations */}
      {quotations.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Quotations</h2>
            <a
              href={`/c/${token}/quotations`}
              className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
            >
              View all
            </a>
          </div>
          <div className="space-y-3">
            {quotations.map((quotation: any) => (
              <div
                key={quotation.id}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
              >
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    Quotation #{quotation.id.slice(0, 8)}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {new Date(quotation.created_at).toLocaleDateString()}
                  </p>
                </div>
                <a
                  href={`/c/${token}/quotations/${quotation.id}`}
                  className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
                >
                  View →
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

