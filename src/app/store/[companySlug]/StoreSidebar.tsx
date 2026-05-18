'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useSidebar } from '@/context/SidebarContext';
import { useStore } from '@/context/StoreContext';
import {
  LayoutDashboard, Package, Send, Truck, CreditCard,
  BadgeDollarSign, Globe, Link2, Settings, ChevronDown,
  MoreHorizontal, Users, Wallet, FileCheck, Landmark,
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
        { icon: <LayoutDashboard className="w-[17px] h-[17px]" />, name: 'Dashboard',         path: bp },
        { icon: <Send            className="w-[17px] h-[17px]" />, name: 'Quotations',        path: `${bp}/quotations` },
        { icon: <Package         className="w-[17px] h-[17px]" />, name: 'Products',          path: `${bp}/products` },
        { icon: <Truck           className="w-[17px] h-[17px]" />, name: 'Shipment Tracking', path: `${bp}/shipping` },
        { icon: <Users           className="w-[17px] h-[17px]" />, name: 'Clients',           path: `${bp}/clients` },
        { icon: <Wallet className="w-[17px] h-[17px]" />, name: 'Payments', path: `${bp}/payments` },
      ],
    },
    {
      label: 'Storefront',
      color: '#0f7aff',
      items: [
        { icon: <Globe  className="w-[17px] h-[17px]" />, name: 'Website Builder', path: `${bp}/website` },
        { icon: <Link2  className="w-[17px] h-[17px]" />, name: 'Domain',          path: `${bp}/domain` },
      ],
    },
    {
      label: 'Account',
      color: '#94a3b8',
      items: [
        { icon: <BadgeDollarSign className="w-[17px] h-[17px]" />, name: 'Subscription', path: `${bp}/subscription` },
        { icon: <Settings        className="w-[17px] h-[17px]" />, name: 'Settings',     path: `${bp}/settings` },
      ],
    },
  ];

  const expiredGroups: NavGroup[] = [
    {
      label: 'Operations',
      color: '#06b6d4',
      items: [
        { icon: <LayoutDashboard className="w-[17px] h-[17px]" />, name: 'Dashboard',    path: bp },
        { icon: <BadgeDollarSign className="w-[17px] h-[17px]" />, name: 'Subscription', path: `${bp}/subscription` },
      ],
    },
  ];

  const groups = isSubscriptionExpired ? expiredGroups : allGroups;

  const [openSubmenu, setOpenSubmenu] = useState<{ groupIdx: number; itemIdx: number } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>({});
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const isActive = useCallback((path: string) => {
    if (path === bp) return pathname === bp;
    return pathname.startsWith(path);
  }, [pathname, bp]);

  // Auto-open submenu for active sub-item
  useEffect(() => {
    groups.forEach((group, groupIdx) => {
      group.items.forEach((item, itemIdx) => {
        item.subItems?.forEach(sub => {
          if (isActive(sub.path)) setOpenSubmenu({ groupIdx, itemIdx });
        });
      });
    });
  }, [pathname, isActive]);

  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu.groupIdx}-${openSubmenu.itemIdx}`;
      const el = subMenuRefs.current[key];
      if (el) setSubMenuHeight(prev => ({ ...prev, [key]: el.scrollHeight }));
    }
  }, [openSubmenu]);

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
      <div className={`flex items-center h-16 px-4 border-b border-gray-100 dark:border-gray-800 flex-shrink-0 ${!showLabels ? 'justify-center' : ''}`}>
        <Link href={bp} className="flex items-center gap-2.5">
          {showLabels ? (
            <Image src="/images/logo/soursync-logo.svg" alt="SourSync" width={130} height={32} className="h-8 w-auto" />
          ) : (
            <Image src="/images/logo/soursync-logo.svg" alt="SourSync" width={28} height={28} className="h-7 w-7" />
          )}
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex flex-col flex-1 overflow-y-auto no-scrollbar py-3">
        {groups.map((group, groupIdx) => (
          <div key={group.label} className={groupIdx > 0 ? 'mt-1' : ''}>

            {/* Group separator + label */}
            {groupIdx > 0 && (
              <div className="mx-3 mb-1 h-px bg-gray-100 dark:bg-gray-800" />
            )}

            {showLabels ? (
              <div className="flex items-center gap-2 px-4 pt-3 pb-1.5">
                {/* Colored group indicator */}
                <span
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ background: group.color }}
                />
                <span className="text-[10px] font-bold uppercase tracking-[0.1em] select-none"
                  style={{ color: group.color }}>
                  {group.label}
                </span>
              </div>
            ) : groupIdx === 0 ? (
              <div className="flex justify-center pt-3 pb-1.5 text-gray-400">
                <MoreHorizontal className="w-4 h-4" />
              </div>
            ) : null}

            {/* Items */}
            <ul className="px-2 flex flex-col gap-0.5">
              {group.items.map((item, itemIdx) => {
                const active = isActive(item.path);
                const hasSubItems = !!item.subItems?.length;
                const subKey = `${groupIdx}-${itemIdx}`;
                const subOpen = openSubmenu?.groupIdx === groupIdx && openSubmenu?.itemIdx === itemIdx;
                const anySubActive = item.subItems?.some(s => isActive(s.path));

                return (
                  <li key={item.name}>
                    {hasSubItems ? (
                      <button
                        onClick={() => setOpenSubmenu(subOpen ? null : { groupIdx, itemIdx })}
                        className={`ss-item group w-full ${(active || anySubActive) ? 'ss-item-active' : 'ss-item-inactive'} ${!showLabels ? 'justify-center' : ''}`}
                      >
                        <span className={(active || anySubActive) ? 'ss-icon-active' : 'ss-icon-inactive'}>
                          {item.icon}
                        </span>
                        {showLabels && <span className="ss-label">{item.name}</span>}
                        {showLabels && (
                          <ChevronDown className={`ml-auto w-3.5 h-3.5 flex-shrink-0 transition-transform duration-200 ${subOpen ? 'rotate-180 text-[#06b6d4]' : 'text-gray-300 dark:text-gray-600'}`} />
                        )}
                      </button>
                    ) : (
                      <Link
                        href={item.path}
                        className={`ss-item group ${active ? 'ss-item-active' : 'ss-item-inactive'} ${!showLabels ? 'justify-center' : ''}`}
                      >
                        <span className={active ? 'ss-icon-active' : 'ss-icon-inactive'}>{item.icon}</span>
                        {showLabels && <span className="ss-label">{item.name}</span>}
                      </Link>
                    )}

                    {/* Sub-items */}
                    {hasSubItems && showLabels && (
                      <div
                        ref={el => { subMenuRefs.current[subKey] = el; }}
                        className="overflow-hidden transition-[height] duration-200 ease-out"
                        style={{ height: subOpen ? `${subMenuHeight[subKey] ?? 0}px` : '0px' }}
                      >
                        <ul className="mt-0.5 ml-[30px] mr-1 flex flex-col gap-0.5 pb-1">
                          {item.subItems!.map(sub => {
                            const subActive = isActive(sub.path);
                            return (
                              <li key={sub.name}>
                                <Link
                                  href={sub.path}
                                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-[12.5px] font-medium transition-colors
                                    ${subActive
                                      ? 'bg-[#06b6d4]/10 text-[#06b6d4]'
                                      : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-300'
                                    }`}
                                >
                                  <span className={`w-1 h-1 rounded-full flex-shrink-0 ${subActive ? 'bg-[#06b6d4]' : 'bg-gray-300 dark:bg-gray-600'}`} />
                                  {sub.name}
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    )}
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
