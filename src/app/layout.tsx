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
    template: "%s | Soursync",
    default: "Soursync | Global Sourcing OS",
  },
  description: "The All-In-One Operating System for Global Sourcing. Manage quotations, logistics, and your B2B storefront instantly.",
  icons: {
    icon: "/images/logo/soursync-logo.svg",
    shortcut: "/images/logo/soursync-logo.svg",
    apple: "/images/logo/soursync-logo.svg",
  },
  openGraph: {
    title: "Soursync | Global Sourcing OS",
    description: "The All-In-One Operating System for Global Sourcing. Manage quotations, logistics, and your B2B storefront instantly.",
    url: "https://soursync.com",
    siteName: "Soursync",
    images: [
      {
        url: "/images/logo/soursync-logo.svg", // Ideally this should be a 1200x630 png
        width: 800,
        height: 600,
        alt: "Soursync Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Soursync | Global Sourcing OS",
    description: "The All-In-One Operating System for Global Sourcing.",
    images: ["/images/logo/soursync-logo.svg"],
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
