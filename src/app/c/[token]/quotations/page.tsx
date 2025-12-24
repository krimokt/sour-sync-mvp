import Link from 'next/link';
import CreateQuotationButton from './CreateQuotationButton';

interface QuotationsPageProps {
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

async function getQuotations(client: any, companyId: string) {
  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Fetch quotations by user_id (client's auth user_id) and company_id
    const { data, error } = await supabase
      .from('quotations')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching quotations:', error);
      return [];
    }

    // Filter quotations that belong to this client by user_id
    // If client has user_id, filter by that; otherwise return empty
    if (client.user_id && data) {
      return data.filter((q: any) => q.user_id === client.user_id);
    }

    return [];
  } catch (error) {
    console.error('Error fetching quotations:', error);
    return [];
  }
}

function getStatusBadge(status: string) {
  const statusColors: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    approved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    confirmed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  };

  return (
    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColors[status] || statusColors.draft}`}>
      {status}
    </span>
  );
}

export default async function QuotationsPage({ params }: QuotationsPageProps) {
  const { token } = await params;
  
  const clientData = await getClientData(token);

  if (!clientData || !clientData.valid) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 dark:text-red-400">Invalid or expired token</p>
        <Link href={`/c/${token}/invalid`} className="text-blue-600 hover:underline mt-2 inline-block">
          Request a new link
        </Link>
      </div>
    );
  }

  const { client, company } = clientData;
  const quotations = await getQuotations(client, company.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Quotations</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            View and manage your quotations
          </p>
        </div>
        <div className="flex items-center gap-3">
          <CreateQuotationButton 
            token={token} 
            allowedCountries={company.quotation_countries || []} 
          />
          <Link
            href={`/c/${token}`}
            className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
          >
            ← Back to Home
          </Link>
        </div>
      </div>

      {quotations.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
          <p className="text-gray-600 dark:text-gray-400">No quotations found</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Quotation ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {quotations.map((quotation: any) => (
                  <tr key={quotation.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      #{quotation.id.slice(0, 8)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(quotation.status || 'draft')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(quotation.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {quotation.total ? `$${Number(quotation.total).toFixed(2)}` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        href={`/c/${token}/quotations/${quotation.id}`}
                        className="text-blue-600 hover:text-blue-700 dark:text-blue-400"
                      >
                        View →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

