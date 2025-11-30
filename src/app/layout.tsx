import { Outfit } from "next/font/google";
import "./globals.css";
import { Metadata } from "next";

import { SidebarProvider } from "@/context/SidebarContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster as UIToaster } from "@/components/ui/toaster";
import { Toaster } from "sonner";
import { SupabaseProvider } from '@/context/SupabaseProvider'

const outfit = Outfit({
  variable: "--font-outfit-sans",
  subsets: ["latin"],
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
    <html lang="en">
      <body className={`${outfit.variable} dark:bg-gray-900`}>
        <ThemeProvider>
          <AuthProvider>
            <SupabaseProvider>
              <SidebarProvider>{children}</SidebarProvider>
            </SupabaseProvider>
          </AuthProvider>
        </ThemeProvider>
        <UIToaster />
        <Toaster />
      </body>
    </html>
  );
}
