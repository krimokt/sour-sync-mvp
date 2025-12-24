import Link from 'next/link';

interface QuotationDetailPageProps {
  params: Promise<{ token: string; id: string }>;
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

async function getQuotation(quotationId: string, clientUserId: string, companyId: string) {
  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data, error } = await supabase
      .from('quotations')
      .select('*')
      .eq('id', quotationId)
      .eq('user_id', clientUserId)
      .eq('company_id', companyId)
      .single();

    if (error) {
      console.error('Error fetching quotation:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error fetching quotation:', error);
    return null;
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
    <span className={`px-3 py-1 text-sm font-semibold rounded-full ${statusColors[status] || statusColors.draft}`}>
      {status}
    </span>
  );
}

export default async function QuotationDetailPage({ params }: QuotationDetailPageProps) {
  const { token, id } = await params;
  
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
  const quotation = await getQuotation(id, client.user_id, company.id);

  if (!quotation) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400">Quotation not found</p>
        <Link href={`/c/${token}/quotations`} className="text-blue-600 hover:underline mt-2 inline-block">
          ← Back to Quotations
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Quotation #{quotation.id.slice(0, 8)}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Created on {new Date(quotation.created_at).toLocaleDateString()}
          </p>
        </div>
        <div className="flex items-center gap-4">
          {getStatusBadge(quotation.status || 'draft')}
          <Link
            href={`/c/${token}/quotations`}
            className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
          >
            ← Back
          </Link>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-6">
        {/* Quotation Details */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Details</h2>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</dt>
              <dd className="mt-1">{getStatusBadge(quotation.status || 'draft')}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Amount</dt>
              <dd className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
                {quotation.total ? `$${Number(quotation.total).toFixed(2)}` : '-'}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Created</dt>
              <dd className="mt-1 text-gray-900 dark:text-white">
                {new Date(quotation.created_at).toLocaleString()}
              </dd>
            </div>
            {quotation.updated_at && (
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Updated</dt>
                <dd className="mt-1 text-gray-900 dark:text-white">
                  {new Date(quotation.updated_at).toLocaleString()}
                </dd>
              </div>
            )}
          </dl>
        </div>

        {/* Notes/Description */}
        {quotation.notes && (
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Notes</h3>
            <p className="text-gray-900 dark:text-white">{quotation.notes}</p>
          </div>
        )}

        {/* Action Buttons */}
        {(quotation.status === 'pending' || quotation.status === 'approved') && (
          <div className="flex gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <form action={`/api/client/quotations/${id}/approve`} method="POST">
              <input type="hidden" name="token" value={token} />
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Approve Quotation
              </button>
            </form>
            <form action={`/api/client/quotations/${id}/confirm`} method="POST">
              <input type="hidden" name="token" value={token} />
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Confirm Order
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

