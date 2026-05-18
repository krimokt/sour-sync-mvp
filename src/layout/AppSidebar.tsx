"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useParams } from "next/navigation";
import { useSidebar } from "../context/SidebarContext";
import { ChevronDownIcon, HorizontaLDots } from "../icons/index";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
};

type NavGroup = {
  label: string;
  items: NavItem[];
};

const DashboardIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/>
    <rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/>
  </svg>
);
const QuotationIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z"/>
    <path d="m21.854 2.147-10.94 10.939"/>
  </svg>
);
const ShipmentIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/>
    <path d="M15 18H9"/>
    <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/>
    <circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/>
  </svg>
);
const ClientsIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);
const PaymentIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/>
  </svg>
);
const ProductIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z"/>
    <path d="M12 22V12"/><polyline points="3.29 7 12 12 20.71 7"/><path d="m7.5 4.27 9 5.15"/>
  </svg>
);
const SubscriptionIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"/>
    <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 18V6"/>
  </svg>
);
const WebsiteIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>
  </svg>
);
const DomainIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 17H7A5 5 0 0 1 7 7h2"/><path d="M15 7h2a5 5 0 1 1 0 10h-2"/>
    <line x1="8" x2="16" y1="12" y2="12"/>
  </svg>
);
const SettingsIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

const navGroups: NavGroup[] = [
  {
    label: "Operations",
    items: [
      { name: "Dashboard", icon: <DashboardIcon />, path: "/dashboard-home" },
      { name: "Quotations", icon: <QuotationIcon />, path: "/quotation" },
      { name: "Shipment Tracking", icon: <ShipmentIcon />, path: "/shipment-tracking" },
      { name: "Clients", icon: <ClientsIcon />, path: "/clients" },
      { name: "Payments", icon: <PaymentIcon />, path: "/payment" },
    ],
  },
  {
    label: "Store",
    items: [
      { name: "Products", icon: <ProductIcon />, path: "/products" },
      { name: "Subscription", icon: <SubscriptionIcon />, path: "/subscription" },
      { name: "Website Builder", icon: <WebsiteIcon />, path: "/website" },
      { name: "Domain", icon: <DomainIcon />, path: "/domain" },
    ],
  },
  {
    label: "Account",
    items: [
      { name: "Settings", icon: <SettingsIcon />, path: "/settings" },
    ],
  },
];

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered, isManuallyToggled } = useSidebar();
  const pathname = usePathname();
  const params = useParams();
  const companySlug = params?.companySlug as string;
  const [openSubmenu, setOpenSubmenu] = useState<{ groupIdx: number; itemIdx: number } | null>(null);
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>({});

  const getPath = useCallback((path: string) => {
    if (!path) return '';
    if (path.startsWith('http') || path.startsWith('/store')) return path;
    return companySlug ? `/store/${companySlug}${path}` : path;
  }, [companySlug]);

  const isActive = useCallback((path: string) => {
    const full = getPath(path);
    return pathname === full || pathname?.startsWith(`${full}/`);
  }, [pathname, getPath]);

  const showLabels = isExpanded || isHovered || isMobileOpen;

  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu.groupIdx}-${openSubmenu.itemIdx}`;
      const el = subMenuRefs.current[key];
      if (el) {
        setSubMenuHeight(prev => ({ ...prev, [key]: el.scrollHeight }));
      }
    }
  }, [openSubmenu]);

  return (
    <aside
      className={`fixed mt-16 lg:mt-0 top-0 left-0 h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 z-50 flex flex-col transition-all duration-300 ease-in-out
        ${isExpanded || isMobileOpen || isHovered ? "w-[290px]" : "w-[90px]"}
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && !isManuallyToggled && setIsHovered(true)}
      onMouseLeave={() => !isManuallyToggled && setIsHovered(false)}
    >
      {/* Logo */}
      <div className={`flex items-center py-6 px-5 ${!showLabels ? "lg:justify-center" : ""}`}>
        <Link href="/">
          {showLabels ? (
            <Image src="/images/logo/soursync-logo.svg" alt="SourSync" width={140} height={36} />
          ) : (
            <Image src="/images/logo/soursync-logo.svg" alt="SourSync" width={32} height={32} />
          )}
        </Link>
      </div>

      {/* Nav */}
      <div className="flex flex-col flex-1 overflow-y-auto no-scrollbar px-3 pb-6">
        {navGroups.map((group, groupIdx) => (
          <div key={group.label}>
            {/* Group separator (not before first group) */}
            {groupIdx > 0 && <div className="my-2 h-px bg-gray-100 dark:bg-gray-800" />}

            {/* Group label */}
            {showLabels ? (
              <span className="block px-2 pt-3 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-gray-400 dark:text-gray-500">
                {group.label}
              </span>
            ) : groupIdx === 0 ? (
              <div className="flex justify-center pt-3 pb-1.5 text-gray-400">
                <HorizontaLDots />
              </div>
            ) : null}

            {/* Items */}
            <ul className="flex flex-col gap-0.5">
              {group.items.map((item, itemIdx) => {
                const hasSubItems = !!item.subItems?.length;
                const active = item.path ? isActive(item.path) : false;
                const subKey = `${groupIdx}-${itemIdx}`;
                const subOpen = openSubmenu?.groupIdx === groupIdx && openSubmenu?.itemIdx === itemIdx;

                return (
                  <li key={item.name}>
                    {hasSubItems ? (
                      <button
                        onClick={() => setOpenSubmenu(subOpen ? null : { groupIdx, itemIdx })}
                        className={`sidebar-item group w-full ${active ? "sidebar-item-active" : "sidebar-item-inactive"} ${!showLabels ? "lg:justify-center" : ""}`}
                      >
                        <span className={`sidebar-icon ${active ? "sidebar-icon-active" : "sidebar-icon-inactive"}`}>
                          {item.icon}
                        </span>
                        {showLabels && <span className="sidebar-label">{item.name}</span>}
                        {showLabels && (
                          <ChevronDownIcon className={`ml-auto w-4 h-4 transition-transform duration-200 ${subOpen ? "rotate-180 text-[#06b6d4]" : "text-gray-400"}`} />
                        )}
                      </button>
                    ) : (
                      item.path && (
                        <Link
                          href={getPath(item.path)}
                          className={`sidebar-item group ${active ? "sidebar-item-active" : "sidebar-item-inactive"} ${!showLabels ? "lg:justify-center" : ""}`}
                        >
                          <span className={`sidebar-icon ${active ? "sidebar-icon-active" : "sidebar-icon-inactive"}`}>
                            {item.icon}
                          </span>
                          {showLabels && <span className="sidebar-label">{item.name}</span>}
                        </Link>
                      )
                    )}

                    {hasSubItems && showLabels && (
                      <div
                        ref={el => { subMenuRefs.current[subKey] = el; }}
                        className="overflow-hidden transition-all duration-300"
                        style={{ height: subOpen ? `${subMenuHeight[subKey] ?? 0}px` : "0px" }}
                      >
                        <ul className="mt-1 ml-8 flex flex-col gap-0.5">
                          {item.subItems!.map(sub => (
                            <li key={sub.name}>
                              <Link
                                href={getPath(sub.path)}
                                className={`menu-dropdown-item ${isActive(sub.path) ? "menu-dropdown-item-active" : "menu-dropdown-item-inactive"}`}
                              >
                                {sub.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </aside>
  );
};

export default AppSidebar;
