import GlassAuthForm from "@/components/auth/GlassAuthForm";
import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Sign In | Soursync",
  description: "Sign in to your Soursync dashboard",
};

export const dynamic = 'force-dynamic';

export default function SignIn() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <GlassAuthForm initialMode="signin" />
    </Suspense>
  );
}
