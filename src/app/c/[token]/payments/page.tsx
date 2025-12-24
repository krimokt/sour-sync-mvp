import Link from 'next/link';

interface PaymentsPageProps {
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

async function getPayments(clientId: string, companyId: string) {
  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Get payments linked to this client through invoices/quotations
    const { data: payments, error } = await supabase
      .from('payments')
      .select(`
        *,
        invoice:invoices (
          id,
          quotation_id
        )
      `)
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching payments:', error);
      return [];
    }

    // Filter payments that belong to this client's quotations
    const { data: clientQuotations } = await supabase
      .from('quotations')
      .select('id')
      .eq('client_id', clientId)
      .eq('company_id', companyId);

    const quotationIds = (clientQuotations || []).map(q => q.id);
    
    // Filter payments that are linked to client's quotations
    const filteredPayments = (payments || []).filter((payment: any) => {
      if (payment.invoice && payment.invoice.quotation_id) {
        return quotationIds.includes(payment.invoice.quotation_id);
      }
      return false;
    });

    return filteredPayments;
  } catch (error) {
    console.error('Error fetching payments:', error);
    return [];
  }
}

function getStatusBadge(status: string) {
  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    processing: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    failed: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  };

  return (
    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColors[status] || statusColors.pending}`}>
      {status}
    </span>
  );
}

export default async function PaymentsPage({ params }: PaymentsPageProps) {
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
  const payments = await getPayments(client.id, company.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Payments</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            View your invoices and payment status
          </p>
        </div>
        <Link
          href={`/c/${token}`}
          className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
        >
          ← Back to Home
        </Link>
      </div>

      {payments.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
          <p className="text-gray-600 dark:text-gray-400">No payments found</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Payment ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Method
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {payments.map((payment: any) => (
                  <tr key={payment.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      #{payment.id.slice(0, 8)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      ${Number(payment.amount || 0).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(payment.status || 'pending')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(payment.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {payment.payment_method || payment.provider || '-'}
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




