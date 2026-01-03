'use client';

import React from 'react';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import { useStore } from '@/context/StoreContext';
import SubscriptionPlansPanel from '@/components/subscription/SubscriptionPlansPanel';

export default function SubscriptionPage() {
  const { company, canManage } = useStore();

  if (!company) return <div>Loading...</div>;

  return (
    <>
      <PageBreadcrumb pageTitle="Subscription" />

      <SubscriptionPlansPanel
        companyId={company.id}
        planName={company.plan}
        canManage={canManage}
        companySlug={company.slug}
        subscriptionPeriodId={company.subscription_period_id ?? null}
        subscriptionStartedAt={company.subscription_started_at ?? null}
        subscriptionExpiresAt={company.subscription_expires_at ?? null}
      />
    </>
  );
}


