'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Button from '@/components/ui/button/Button';
import { supabase } from '@/lib/supabase';

type SubscriptionPeriod = {
  id: string;
  code: string;
  name: string;
  duration_days: number;
  is_trial: boolean;
  sort_order: number | null;
  is_active: boolean;
};

function formatDuration(durationDays: number) {
  if (durationDays === 7) return '7 days';
  if (durationDays === 14) return '14 days';
  if (durationDays === 30) return '30 days';
  if (durationDays % 30 === 0) return `${durationDays / 30} months`;
  return `${durationDays} days`;
}

function daysBetween(now: Date, future: Date) {
  const ms = future.getTime() - now.getTime();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

export default function SubscriptionPlansPanel(props: {
  companyId: string;
  planName: string;
  canManage: boolean;
  companySlug?: string;
  subscriptionPeriodId?: string | null;
  subscriptionStartedAt?: string | null;
  subscriptionExpiresAt?: string | null;
}) {
  const { planName } = props;

  const [periods, setPeriods] = useState<SubscriptionPeriod[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Local override so the UI updates immediately after selecting a plan.
  const [selectedPeriodId, setSelectedPeriodId] = useState<string | null>(props.subscriptionPeriodId ?? null);
  const [selectedExpiresAt, setSelectedExpiresAt] = useState<string | null>(props.subscriptionExpiresAt ?? null);
  const [selectedStartedAt, setSelectedStartedAt] = useState<string | null>(props.subscriptionStartedAt ?? null);

  useEffect(() => {
    setSelectedPeriodId(props.subscriptionPeriodId ?? null);
    setSelectedExpiresAt(props.subscriptionExpiresAt ?? null);
    setSelectedStartedAt(props.subscriptionStartedAt ?? null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.subscriptionPeriodId, props.subscriptionExpiresAt, props.subscriptionStartedAt]);

  useEffect(() => {
    let isMounted = true;

    async function loadPeriods() {
      setLoading(true);
      setMessage(null);
      try {
        const { data, error } = await supabase
          .from('subscription_periods')
          .select('id, code, name, duration_days, is_trial, sort_order, is_active')
          .eq('is_active', true)
          .order('sort_order', { ascending: true });

        if (error) throw error;
        if (!isMounted) return;
        setPeriods((data as SubscriptionPeriod[]) || []);
      } catch (e) {
        console.error('Failed to load subscription periods:', e);
        const detail =
          e && typeof e === 'object' && 'message' in e
            ? String((e as { message?: unknown }).message)
            : 'Unknown error';
        if (isMounted)
          setMessage({
            type: 'error',
            text: `Failed to load subscription periods from database. (${detail})`,
          });
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadPeriods();
    return () => {
      isMounted = false;
    };
  }, []);

  const currentPeriod = useMemo(() => {
    if (!selectedPeriodId) return null;
    return periods.find((p) => p.id === selectedPeriodId) || null;
  }, [periods, selectedPeriodId]);

  const expiresInfo = useMemo(() => {
    if (!selectedExpiresAt) return null;
    const expires = new Date(selectedExpiresAt);
    if (Number.isNaN(expires.getTime())) return null;
    const now = new Date();
    const remainingDays = daysBetween(now, expires);
    return { expires, remainingDays };
  }, [selectedExpiresAt]);

  const upgradeEmail = process.env.NEXT_PUBLIC_UPGRADE_CONTACT_EMAIL || 'support@soursync.com';
  const upgradeUrl =
    process.env.NEXT_PUBLIC_UPGRADE_CONTACT_URL ||
    `mailto:${encodeURIComponent(upgradeEmail)}?subject=${encodeURIComponent(
      `Upgrade request${props.companySlug ? ` - ${props.companySlug}` : ''}`
    )}&body=${encodeURIComponent(
      `Hello SourSync,\n\nI would like to upgrade my subscription.${
        props.companySlug ? `\n\nStore: ${props.companySlug}` : ''
      }\n\nThanks.`
    )}`;

  return (
    <>
      {message && (
        <div
          className={`mb-6 p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
              : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'
          }`}
        >
          {message.text}
          <div className="mt-2 text-xs opacity-80">
            Supabase URL: <span className="font-mono">{process.env.NEXT_PUBLIC_SUPABASE_URL || 'NOT SET'}</span>
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03] mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Current plan
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white capitalize">{planName}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {currentPeriod ? (
                <>
                  Period: <span className="font-semibold">{currentPeriod.name}</span>
                  {selectedStartedAt ? (
                    <span className="ml-2">(started {new Date(selectedStartedAt).toLocaleDateString()})</span>
                  ) : null}
                </>
              ) : (
                <>No subscription period set yet.</>
              )}
            </div>
          </div>

          <div className="text-sm text-gray-700 dark:text-gray-300">
            {expiresInfo ? (
              <>
                Expires on <span className="font-semibold">{expiresInfo.expires.toLocaleDateString()}</span>
                <span className="ml-2 text-gray-500 dark:text-gray-400">
                  ({expiresInfo.remainingDays <= 0 ? 'expired' : `${expiresInfo.remainingDays} day(s) left`})
                </span>
              </>
            ) : (
              <span className="text-gray-500 dark:text-gray-400">No expiry date.</span>
            )}
          </div>
        </div>
        <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
          Subscription changes are handled manually (no Stripe). To upgrade, please contact SourSync.
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading ? (
          <div className="text-gray-600 dark:text-gray-400">Loading subscription periods...</div>
        ) : periods.length === 0 ? (
          <div className="text-gray-600 dark:text-gray-400">
            No subscription periods found. Create rows in the `subscription_periods` table.
          </div>
        ) : (
          periods.map((p) => {
            const isCurrent = !!selectedPeriodId && selectedPeriodId === p.id;
            const durationLabel = formatDuration(p.duration_days);
            return (
              <div
                key={p.id}
                className={`relative rounded-2xl border bg-white p-6 shadow-sm dark:bg-white/[0.03] ${
                  isCurrent
                    ? 'border-[#06b6d4] ring-2 ring-[#06b6d4]/20'
                    : 'border-gray-200 dark:border-gray-800'
                }`}
              >
                {isCurrent && (
                  <div className="absolute -top-3 left-6">
                    <span className="inline-flex items-center rounded-full bg-[#06b6d4] px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">
                      Current
                    </span>
                  </div>
                )}

                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-lg font-semibold text-gray-900 dark:text-white">{p.name}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Duration: <span className="font-semibold">{durationLabel}</span>
                      {p.is_trial ? (
                        <span className="ml-2 inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                          Trial
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <Button
                    className="w-full"
                    variant={isCurrent ? 'outline' : 'primary'}
                    disabled={isCurrent}
                    onClick={() => {
                      if (isCurrent) return;
                      window.open(upgradeUrl, '_blank', 'noopener,noreferrer');
                    }}
                  >
                    {isCurrent ? 'Current plan' : 'Contact SourSync to Upgrade'}
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </>
  );
}


