import GlassAuthForm from "@/components/auth/GlassAuthForm";
import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Sign Up | Soursync",
  description: "Create your Soursync account",
};

export const dynamic = 'force-dynamic';

export default function SignUp() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <GlassAuthForm initialMode="signup" />
    </Suspense>
  );
}
