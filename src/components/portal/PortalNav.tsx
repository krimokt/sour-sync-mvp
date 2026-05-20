'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, FileText, CreditCard, Truck } from 'lucide-react';
import { useMagicLink } from './MagicLinkProvider';

export default function PortalNav() {
  const pathname = usePathname();
  const { data } = useMagicLink();
  const token = pathname.split('/')[2];

  const allItems = [
    { name: 'Overview', href: `/c/${token}`, icon: LayoutDashboard, scope: null as string | null, exact: true },
    { name: 'Quotations', href: `/c/${token}/quotations`, icon: FileText, scope: 'view', exact: false },
    { name: 'Payments', href: `/c/${token}/payments`, icon: CreditCard, scope: 'pay', exact: false },
    { name: 'Shipping', href: `/c/${token}/shipping`, icon: Truck, scope: 'track', exact: false },
  ];

  const navItems = allItems.filter(item => item.scope === null || data.scopes.includes(item.scope));

  return (
    <nav className="bg-white dark:bg-gray-950 border-b border-gray-100 dark:border-gray-800 sticky top-14 z-30">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex gap-0.5 overflow-x-auto scrollbar-none py-1.5">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-[#06b6d4]/10 text-[#06b6d4]'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-900'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {item.name}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
