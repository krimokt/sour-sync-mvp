'use client';

import { useEffect, useState } from 'react';
import { MapPin } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface ClientAddress {
  id: string;
  user_id: string;
  company_id: string;
  full_name: string | null;
  company_name: string | null;
  address_line_1: string | null;
  address_line_2: string | null;
  city: string;
  state: string | null;
  postal_code: string | null;
  country: string;
  phone: string | null;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

const DeliveryAddressSection = ({
  addressId,
  companyId,
}: {
  addressId: string;
  companyId: string;
}): JSX.Element | null => {
  const [address, setAddress] = useState<ClientAddress | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAddress = async () => {
      if (!addressId || !companyId) {
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('client_addresses')
          .select('*')
          .eq('id', addressId)
          .eq('company_id', companyId)
          .single();

        if (!error && data) {
          setAddress(data);
        }
      } catch (err) {
        console.error('Error fetching address:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAddress();
  }, [addressId, companyId]);

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 uppercase tracking-wide flex items-center gap-2">
          <div className="p-1.5 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg">
            <MapPin className="w-4 h-4 text-white" />
          </div>
          Delivery Address
        </h3>
        <p className="text-sm text-gray-500">Loading address...</p>
      </div>
    );
  }

  if (!address) {
    return (
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 uppercase tracking-wide flex items-center gap-2">
          <div className="p-1.5 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg">
            <MapPin className="w-4 h-4 text-white" />
          </div>
          Delivery Address
        </h3>
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded border border-gray-200 dark:border-gray-700 p-4">
          <p className="text-sm text-gray-500">
            Address ID: <span className="font-mono text-xs">{addressId}</span>
          </p>
          <p className="text-sm text-gray-500 mt-2 italic">Address details not found</p>
        </div>
      </div>
    );
  }

  const addressLines = [address.address_line_1, address.address_line_2].filter(Boolean).join(', ');
  const locationParts = [address.city, address.state, address.postal_code].filter(Boolean);

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 uppercase tracking-wide flex items-center gap-2">
        <div className="p-1.5 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg">
          <MapPin className="w-4 h-4 text-white" />
        </div>
        Delivery Address
      </h3>
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded border border-gray-200 dark:border-gray-700 p-4 space-y-2">
        {address.full_name && (
          <div>
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Name:</span>
            <p className="text-sm font-semibold text-gray-900 dark:text-white mt-0.5">{address.full_name}</p>
          </div>
        )}
        {address.company_name && (
          <div>
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Company:</span>
            <p className="text-sm text-gray-700 dark:text-gray-300 mt-0.5">{address.company_name}</p>
          </div>
        )}
        {addressLines && (
          <div>
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Address:</span>
            <p className="text-sm text-gray-700 dark:text-gray-300 mt-0.5">{addressLines}</p>
          </div>
        )}
        {locationParts.length > 0 && (
          <div>
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Location:</span>
            <p className="text-sm text-gray-700 dark:text-gray-300 mt-0.5">{locationParts.join(', ')}</p>
          </div>
        )}
        {address.country && (
          <div>
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Country:</span>
            <p className="text-sm font-semibold text-gray-900 dark:text-white mt-0.5">{address.country}</p>
          </div>
        )}
        {address.phone && (
          <div className="pt-2 mt-2 border-t border-gray-200 dark:border-gray-700">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Phone:</span>
            <p className="text-sm text-gray-700 dark:text-gray-300 mt-0.5">{address.phone}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export function DeliveryAddressSlot({
  addressId,
  companyId,
}: {
  addressId: string | null;
  companyId: string | null;
}): JSX.Element | null {
  if (!addressId || !companyId) return null;
  return <DeliveryAddressSection addressId={addressId} companyId={companyId} />;
}











