'use client';

import React, { useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useSidebar } from '@/context/SidebarContext';
import { useStore } from '@/context/StoreContext';
import {
  LayoutDashboard, Package, Send, Truck,
  BadgeDollarSign, Globe, Link2, Settings,
  MoreHorizontal, Users, Wallet, Search, FileText, Building2,
} from 'lucide-react';

type SubItem = { name: string; path: string };
type NavItem = {
  name: string;
  icon: React.ReactNode;
  path: string;
  subItems?: SubItem[];
};
type NavGroup = {
  label: string;
  color: string; // dot color
  items: NavItem[];
};

interface StoreSidebarProps {
  companySlug: string;
}

const StoreSidebar: React.FC<StoreSidebarProps> = ({ companySlug }) => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered, isManuallyToggled } = useSidebar();
  const { company } = useStore();
  const pathname = usePathname();
  const bp = `/store/${companySlug}`;

  const isSubscriptionExpired = (() => {
    const expiresAt = company?.subscription_expires_at;
    if (!expiresAt) return false;
    const dt = new Date(expiresAt);
    if (Number.isNaN(dt.getTime())) return false;
    return dt.getTime() <= Date.now();
  })();

  const allGroups: NavGroup[] = [
    {
      label: 'Operations',
      color: '#06b6d4',
      items: [
        { icon: <LayoutDashboard className="w-[22px] h-[22px]" />, name: 'Dashboard',         path: bp },
        { icon: <Send            className="w-[22px] h-[22px]" />, name: 'Quotations',        path: `${bp}/quotations` },
        { icon: <Package         className="w-[22px] h-[22px]" />, name: 'Products',          path: `${bp}/products` },
        { icon: <Truck           className="w-[22px] h-[22px]" />, name: 'Shipment Tracking', path: `${bp}/shipping` },
        { icon: <Users           className="w-[22px] h-[22px]" />, name: 'Clients',           path: `${bp}/clients` },
        { icon: <Wallet          className="w-[22px] h-[22px]" />, name: 'Payments',          path: `${bp}/payments` },
      ],
    },
    {
      label: 'Storefront',
      color: '#0f7aff',
      items: [
        { icon: <Globe  className="w-[22px] h-[22px]" />, name: 'Website Builder', path: `${bp}/website` },
        { icon: <Building2 className="w-[22px] h-[22px]" />, name: 'Case Studies',  path: `${bp}/case-studies` },
        { icon: <FileText className="w-[22px] h-[22px]" />, name: 'Blog',           path: `${bp}/blog` },
        { icon: <Search className="w-[22px] h-[22px]" />, name: 'SEO',             path: `${bp}/seo` },
        { icon: <Link2  className="w-[22px] h-[22px]" />, name: 'Domain',          path: `${bp}/domain` },
      ],
    },
    {
      label: 'Account',
      color: '#94a3b8',
      items: [
        { icon: <BadgeDollarSign className="w-[22px] h-[22px]" />, name: 'Subscription', path: `${bp}/subscription` },
        { icon: <Settings        className="w-[22px] h-[22px]" />, name: 'Settings',     path: `${bp}/settings` },
      ],
    },
  ];

  const expiredGroups: NavGroup[] = [
    {
      label: 'Operations',
      color: '#06b6d4',
      items: [
        { icon: <LayoutDashboard className="w-[22px] h-[22px]" />, name: 'Dashboard',    path: bp },
        { icon: <BadgeDollarSign className="w-[22px] h-[22px]" />, name: 'Subscription', path: `${bp}/subscription` },
      ],
    },
  ];

  const groups = isSubscriptionExpired ? expiredGroups : allGroups;

  const isActive = useCallback((path: string) => {
    if (path === bp) return pathname === bp;
    return pathname.startsWith(path);
  }, [pathname, bp]);

  const showLabels = isExpanded || isHovered || isMobileOpen;

  return (
    <aside
      className={`fixed mt-16 lg:mt-0 top-0 left-0 h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 z-50 flex flex-col transition-[width] duration-300 ease-out
        ${isExpanded || isMobileOpen || isHovered ? 'w-[272px]' : 'w-[72px]'}
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && !isManuallyToggled && setIsHovered(true)}
      onMouseLeave={() => !isManuallyToggled && setIsHovered(false)}
    >
      {/* Logo */}
      <div
        className={`flex items-center border-b border-gray-100 dark:border-gray-800 flex-shrink-0 ${!showLabels ? 'justify-center' : ''}`}
        style={{ height: 76, padding: '0 16px' }}
      >
        <Link href={bp} className="flex items-center gap-2.5">
          {showLabels ? (
            <div className="flex flex-col gap-0.5">
              <Image src="/images/logo/soursync-logo.svg" alt="SourSync" width={150} height={36} style={{ height: 36, width: 'auto' }} />
              <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#06b6d4' }}>
                Sourcing Platform
              </span>
            </div>
          ) : (
            <Image src="/images/logo/soursync-logo.svg" alt="SourSync" width={32} height={32} style={{ height: 32, width: 32 }} />
          )}
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex flex-col flex-1 overflow-y-auto no-scrollbar">
        {groups.map((group, groupIdx) => (
          <div key={group.label} className={groupIdx > 0 ? 'mt-1' : ''}>
            {showLabels ? (
              <div className="v3-header">
                {groupIdx > 0 && <div className="v3-hr" style={{ color: group.color }} />}
                <span className="v3-group-text" style={{ color: group.color }}>{group.label}</span>
                <div className="v3-hr" style={{ color: group.color }} />
              </div>
            ) : groupIdx === 0 ? (
              <div className="flex justify-center pt-4 pb-2 text-gray-400">
                <MoreHorizontal className="w-4 h-4" />
              </div>
            ) : null}
            <ul className="px-2 flex flex-col gap-1">
              {group.items.map((item) => {
                const active = isActive(item.path);
                return (
                  <li key={item.name}>
                    <Link
                      href={item.path}
                      className={`ss-item group ${active ? 'ss-item-active' : 'ss-item-inactive'} ${!showLabels ? 'justify-center' : ''}`}
                    >
                      <span className={active ? 'ss-icon-active' : 'ss-icon-inactive'}>{item.icon}</span>
                      {showLabels && <span className="ss-label">{item.name}</span>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Bottom — company name pill */}
      {showLabels && company && (
        <div className="flex-shrink-0 px-4 py-3 border-t border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2.5 px-2 py-2 rounded-lg bg-gray-50 dark:bg-gray-800">
            <div className="w-6 h-6 rounded-md bg-[#06b6d4]/15 flex items-center justify-center flex-shrink-0">
              <span className="text-[10px] font-bold text-[#06b6d4] uppercase">
                {company.name?.charAt(0) || 'S'}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 truncate">{company.name}</p>
              <p className="text-[10px] text-gray-400 truncate">Sourcing Agent</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

export default StoreSidebar;
