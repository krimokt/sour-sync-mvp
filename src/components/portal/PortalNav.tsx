'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FileText, CreditCard, Truck } from 'lucide-react';
import { useMagicLink } from './MagicLinkProvider';

export default function PortalNav() {
  const pathname = usePathname();
  const { data } = useMagicLink();

  const navItems = [
    {
      name: 'Quotations',
      href: `/c/${pathname.split('/')[2]}/quotations`,
      icon: FileText,
      scope: 'view',
    },
    {
      name: 'Payments',
      href: `/c/${pathname.split('/')[2]}/payments`,
      icon: CreditCard,
      scope: 'pay',
    },
    {
      name: 'Shipping',
      href: `/c/${pathname.split('/')[2]}/shipping`,
      icon: Truck,
      scope: 'track',
    },
  ].filter((item) => data.scopes.includes(item.scope));

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex gap-1 py-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all rounded-lg ${
                  isActive
                    ? 'bg-[#06b6d4]/10 text-[#06b6d4]'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
