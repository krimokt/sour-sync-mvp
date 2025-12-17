"use client";
import { ThemeToggleButton } from "@/components/common/ThemeToggleButton";

import UserDropdown from "@/components/header/UserDropdown";
import { useSidebar } from "@/context/SidebarContext";
import Image from "next/image";
import Link from "next/link";
import React, { useState ,useEffect,useRef} from "react";
import { PanelLeft, PanelLeftOpen, X, Search, Bell, Maximize, Minimize } from "lucide-react";
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
      <div className="flex flex-col items-center justify-between grow lg:flex-row lg:px-6">
        <div className="flex items-center justify-between w-full gap-2 px-3 py-3 border-b border-gray-200 dark:border-gray-800 sm:gap-4 lg:justify-normal lg:border-b-0 lg:px-0 lg:py-4">
          <button
            className="flex items-center justify-center w-10 h-10 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-[#0f7aff] hover:border-[#0f7aff]/30 dark:hover:text-[#0f7aff] dark:hover:border-[#0f7aff]/30 shadow-sm flex"
            onClick={handleToggle}
            aria-label="Toggle Sidebar"
          >
            {/* Mobile: Show X when open, PanelLeft when closed */}
            {isMobile ? (
              isMobileOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <PanelLeft className="w-5 h-5" />
              )
            ) : (
              /* Desktop: Show PanelLeftOpen when expanded, PanelLeft when collapsed */
              isExpanded ? (
                <PanelLeftOpen className="w-5 h-5" />
              ) : (
                <PanelLeft className="w-5 h-5" />
              )
            )}
          </button>

          <Link href="/" className="flex items-center flex-shrink-0 lg:hidden min-w-0">
            <Image
              width={154}
              height={32}
              className="dark:hidden h-7 sm:h-8 w-auto max-w-[140px] sm:max-w-[154px]"
              src="/images/logo/soursync-logo.svg"
              alt="Soursync Logo"
              priority
              unoptimized
            />
            <Image
              width={154}
              height={32}
              className="hidden dark:block h-7 sm:h-8 w-auto max-w-[140px] sm:max-w-[154px]"
              src="/images/logo/soursync-logo.svg"
              alt="Soursync Logo"
              priority
              unoptimized
            />
          </Link>

          <button
            onClick={toggleApplicationMenu}
            className="flex items-center justify-center w-10 h-10 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-[#0f7aff] hover:border-[#0f7aff]/30 dark:hover:text-[#0f7aff] dark:hover:border-[#0f7aff]/30 shadow-sm lg:hidden flex-shrink-0"
            aria-label="Open Menu"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M5.99902 10.4951C6.82745 10.4951 7.49902 11.1667 7.49902 11.9951V12.0051C7.49902 12.8335 6.82745 13.5051 5.99902 13.5051C5.1706 13.5051 4.49902 12.8335 4.49902 12.0051V11.9951C4.49902 11.1667 5.1706 10.4951 5.99902 10.4951ZM17.999 10.4951C18.8275 10.4951 19.499 11.1667 19.499 11.9951V12.0051C19.499 12.8335 18.8275 13.5051 17.999 13.5051C17.1706 13.5051 16.499 12.8335 16.499 12.0051V11.9951C16.499 11.1667 17.1706 10.4951 17.999 10.4951ZM13.499 11.9951C13.499 11.1667 12.8275 10.4951 11.999 10.4951C11.1706 10.4951 10.499 11.1667 10.499 11.9951V12.0051C10.499 12.8335 11.1706 13.5051 11.999 13.5051C12.8275 13.5051 13.499 12.8335 13.499 12.0051V11.9951Z"
                fill="currentColor"
              />
            </svg>
          </button>

          <div className="hidden lg:block">
            <form className="group">
              <div className="relative">
                <span className="absolute -translate-y-1/2 left-4 top-1/2 pointer-events-none z-10">
                  <Search className="w-4 h-4 text-gray-400 dark:text-gray-500 group-focus-within:text-[#06b6d4] transition-colors" />
                </span>
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Search or type command..."
                  className="h-11 w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 backdrop-blur-sm py-2.5 pl-11 pr-20 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 shadow-sm hover:shadow-md focus:border-[#06b6d4] focus:outline-none focus:ring-2 focus:ring-[#06b6d4]/20 dark:focus:ring-[#06b6d4]/30 dark:focus:border-[#06b6d4] xl:w-[450px] transition-all duration-200"
                />

                <button 
                  type="button"
                  className="absolute right-2.5 top-1/2 inline-flex -translate-y-1/2 items-center gap-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-2 py-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 shadow-sm hover:shadow-md hover:border-[#06b6d4]/30 hover:text-[#06b6d4] dark:hover:border-[#06b6d4]/30 dark:hover:text-[#06b6d4] group-focus-within:border-[#06b6d4]/40 group-focus-within:text-[#06b6d4] group-focus-within:bg-[#06b6d4]/5 dark:group-focus-within:bg-[#06b6d4]/10 transition-all duration-200"
                >
                  <kbd className="px-1 py-0.5 text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded">⌘</kbd>
                  <kbd className="px-1 py-0.5 text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded">K</kbd>
                </button>
              </div>
            </form>
          </div>
        </div>
        <div
          className={`${
            isApplicationMenuOpen ? "flex" : "hidden"
          } items-center justify-between w-full gap-4 px-5 py-4 lg:flex shadow-theme-md lg:justify-end lg:px-0 lg:shadow-none`}
        >
          <div className="flex items-center gap-2 2xsm:gap-3">
            {/* <!-- Dark Mode Toggler --> */}
            <ThemeToggleButton />
            {/* <!-- Dark Mode Toggler --> */}

            {/* <!-- Cart Dropdown (Client routes only) --> */}
            {clientCompanySlug && (
              <ClientCartDropdown companySlug={clientCompanySlug} />
            )}

            {/* <!-- Fullscreen Toggle --> */}
            <button
              onClick={toggleFullscreen}
              className="flex items-center justify-center w-10 h-10 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-[#0f7aff] hover:border-[#0f7aff]/30 dark:hover:text-[#0f7aff] dark:hover:border-[#0f7aff]/30 shadow-sm"
              aria-label="Toggle Fullscreen"
            >
              {isFullscreen ? (
                <Minimize className="w-5 h-5" />
              ) : (
                <Maximize className="w-5 h-5" />
              )}
            </button>

            {/* <!-- Notification Bell --> */}
            <button
              onClick={() => setHasNotifications(!hasNotifications)}
              className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-[#0f7aff] hover:border-[#0f7aff]/30 dark:hover:text-[#0f7aff] dark:hover:border-[#0f7aff]/30 shadow-sm"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              {hasNotifications && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-[#06b6d4] rounded-full ring-2 ring-white dark:ring-gray-900 animate-pulse"></span>
              )}
            </button>
          </div>
          {/* <!-- User Area --> */}
          <UserDropdown /> 
    
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
