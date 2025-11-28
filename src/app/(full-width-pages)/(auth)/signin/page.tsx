import SignInForm from "@/components/auth/SignInForm";
import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Admin Dashboard for Managing Client Orders Efficiently",
  description: "Admin Dashboard for Managing Client Orders Efficiently",
};

export const dynamic = 'force-dynamic';

export default function SignIn() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignInForm />
    </Suspense>
  );
}
