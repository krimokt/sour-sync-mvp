import "./globals.css";
import { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";

import { SidebarProvider } from "@/context/SidebarContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster as UIToaster } from "@/components/ui/toaster";
import { Toaster } from "sonner";
import { SupabaseProvider } from '@/context/SupabaseProvider';
import { QueryProvider } from '@/providers/QueryProvider';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    template: "%s | Soursync Global Management",
    default: "Soursync Global Management | Streamline Your Global Sourcing Operations",
  },
  description: "Soursync Global Management - The comprehensive platform for managing global sourcing, supply chains, and B2B operations. Streamline quotations, logistics, inventory, and multi-tenant storefronts with enterprise-grade tools.",
  keywords: ["global sourcing", "supply chain management", "B2B platform", "logistics", "quotation management", "multi-tenant SaaS", "international trade"],
  authors: [{ name: "Soursync" }],
  creator: "Soursync",
  publisher: "Soursync",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://soursync.com"),
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/images/logo/soursync-logo.svg", type: "image/svg+xml" },
    ],
    shortcut: "/favicon.ico",
    apple: "/images/logo/soursync-logo.svg",
  },
  openGraph: {
    title: "Soursync Global Management | Streamline Your Global Sourcing Operations",
    description: "The comprehensive platform for managing global sourcing, supply chains, and B2B operations. Streamline quotations, logistics, inventory, and multi-tenant storefronts with enterprise-grade tools.",
    url: "https://soursync.com",
    siteName: "Soursync Global Management",
    images: [
      {
        url: "/images/logo/soursync-logo.svg",
        width: 1200,
        height: 630,
        alt: "Soursync Global Management Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Soursync Global Management | Streamline Your Global Sourcing Operations",
    description: "The comprehensive platform for managing global sourcing, supply chains, and B2B operations.",
    images: ["/images/logo/soursync-logo.svg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={plusJakartaSans.variable}>
      <body className="font-jakarta dark:bg-gray-900">
        <ThemeProvider>
          <AuthProvider>
            <QueryProvider>
              <SupabaseProvider>
                <SidebarProvider>{children}</SidebarProvider>
              </SupabaseProvider>
            </QueryProvider>
          </AuthProvider>
        </ThemeProvider>
        <UIToaster />
        <Toaster />
      {/* impeccable-live-start */}
<script src="http://localhost:8400/live.js"></script>
{/* impeccable-live-end */}
</body>
    </html>
  );
}
