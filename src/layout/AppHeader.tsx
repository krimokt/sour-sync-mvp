"use client";
import { ThemeToggleButton } from "@/components/common/ThemeToggleButton";

import UserDropdown from "@/components/header/UserDropdown";
import HeaderSearch from "@/components/header/HeaderSearch";
import { useSidebar } from "@/context/SidebarContext";
import React, { useState ,useEffect,useRef} from "react";
import { PanelLeft, PanelLeftOpen, X, Bell, Maximize, Minimize } from "lucide-react";
import { usePathname } from "next/navigation";
import ClientCartDropdown from "@/components/cart/ClientCartDropdown";

interface AppHeaderProps {
  companySlug?: string;
}

const AppHeader: React.FC<AppHeaderProps> = ({ companySlug }) => {
  const [isApplicationMenuOpen, setApplicationMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hasNotifications, setHasNotifications] = useState(false);

  const { isExpanded, isMobileOpen, toggleSidebar, toggleMobileSidebar } = useSidebar();
  const pathname = usePathname();
  
  // Detect if we're on a client route
  const isClientRoute = pathname?.startsWith('/client/');
  const clientCompanySlug = companySlug || (isClientRoute ? pathname.split('/')[2] : null);

  // Store slug for search (only on /store/ routes)
  const storeSlug = pathname?.startsWith('/store/') ? pathname.split('/')[2] : null;

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleToggle = () => {
    if (window.innerWidth >= 1024) {
      toggleSidebar();
    } else {
      toggleMobileSidebar();
    }
  };

  const toggleApplicationMenu = () => {
    setApplicationMenuOpen(!isApplicationMenuOpen);
  };
  
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        setIsFullscreen(true);
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      });
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <header className="sticky top-0 flex w-full bg-white border-gray-200 z-30 dark:border-gray-800 dark:bg-gray-900 lg:border-b lg:border-b-[#06b6d4]/10">
      <div className="flex items-center justify-between grow lg:flex-row lg:px-5 py-3">
        {/* Left zone */}
        <div className="flex items-center gap-2">
          <button className="hdr2-icon" onClick={handleToggle} aria-label="Toggle Sidebar">
            {isMobile ? (isMobileOpen ? <X className="w-5 h-5" /> : <PanelLeft className="w-5 h-5" />) : (isExpanded ? <PanelLeftOpen className="w-5 h-5" /> : <PanelLeft className="w-5 h-5" />)}
          </button>
          <div className="hdr2-divider hidden lg:block" />
          {storeSlug ? (
            <HeaderSearch companySlug={storeSlug} inputRef={inputRef} width={340} />
          ) : (
            <div className="hidden lg:block relative">
              <input ref={inputRef} type="text" placeholder="Search…" className="hdr2-search" style={{ width: 340 }} readOnly />
            </div>
          )}
        </div>
        {/* Right zone */}
        <div className="flex items-center gap-3">
          <div className="hdr2-divider hidden lg:block" />
          <div className="flex items-center gap-1">
            <ThemeToggleButton />
            {clientCompanySlug && <ClientCartDropdown companySlug={clientCompanySlug} />}
            <button className="hdr2-icon" onClick={toggleFullscreen} aria-label="Fullscreen">
              {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
            </button>
            <button className="hdr2-icon relative" onClick={() => setHasNotifications(!hasNotifications)} aria-label="Notifications">
              <Bell className="w-5 h-5" />
              {hasNotifications && <span className="hdr2-notif-dot" />}
            </button>
          </div>
          <div className="hdr2-divider hidden lg:block" />
          <UserDropdown />
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
