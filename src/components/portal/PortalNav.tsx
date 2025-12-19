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
    <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-8">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-2 px-3 py-4 border-b-2 transition-colors ${
                  isActive
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

