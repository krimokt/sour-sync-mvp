"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function Home() {
  const router = useRouter();
  const { user, company, loading } = useAuth();

  useEffect(() => {
    console.log("Home page effect - loading:", loading, "user:", !!user, "company:", company?.slug);
    
    if (loading) return;
    
    if (user) {
      if (company?.slug) {
        // User has a company - redirect to their dashboard
        // Use window.location for full page navigation to ensure cookies are sent
        console.log("User has company, redirecting to store:", company.slug);
        window.location.href = `/store/${company.slug}`;
      } else {
        // User is logged in but no company found
        console.log("User logged in but no company, redirecting to select-store");
        window.location.href = "/select-store";
      }
    } else {
      // No user - redirect to signin
      console.log("No user detected, redirecting to signin");
      router.push("/signin");
    }
  }, [user, company, loading, router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="text-center">
        <div className="w-12 h-12 mx-auto mb-4 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Loading...</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">Please wait while we redirect you.</p>
      </div>
    </div>
  );
} 