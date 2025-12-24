import Link from 'next/link';

interface ShippingPageProps {
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

async function getShipments(clientId: string, companyId: string) {
  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Get shipments linked to this client's quotations
    const { data: clientQuotations } = await supabase
      .from('quotations')
      .select('id')
      .eq('client_id', clientId)
      .eq('company_id', companyId);

    const quotationIds = (clientQuotations || []).map(q => q.id);

    if (quotationIds.length === 0) {
      return [];
    }

    // Get shipments for these quotations
    const { data: shipments, error } = await supabase
      .from('shipments')
      .select('*')
      .in('quotation_id', quotationIds)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching shipments:', error);
      return [];
    }

    return shipments || [];
  } catch (error) {
    console.error('Error fetching shipments:', error);
    return [];
  }
}

function getStatusBadge(status: string) {
  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    processing: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    in_transit: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    delivered: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  };

  return (
    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColors[status] || statusColors.pending}`}>
      {status}
    </span>
  );
}

export default async function ShippingPage({ params }: ShippingPageProps) {
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
  const shipments = await getShipments(client.id, company.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Shipping</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Track your shipments and deliveries
          </p>
        </div>
        <Link
          href={`/c/${token}`}
          className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
        >
          ← Back to Home
        </Link>
      </div>

      {shipments.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
          <p className="text-gray-600 dark:text-gray-400">No shipments found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {shipments.map((shipment: any) => (
            <div
              key={shipment.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Shipment #{shipment.id.slice(0, 8)}
                  </h3>
                  {shipment.tracking_number && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Tracking: {shipment.tracking_number}
                    </p>
                  )}
                </div>
                {getStatusBadge(shipment.status || 'pending')}
              </div>

              <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {shipment.carrier && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Carrier</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white">{shipment.carrier}</dd>
                  </div>
                )}
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Created</dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                    {new Date(shipment.created_at).toLocaleDateString()}
                  </dd>
                </div>
                {shipment.estimated_delivery && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Estimated Delivery</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                      {new Date(shipment.estimated_delivery).toLocaleDateString()}
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}




