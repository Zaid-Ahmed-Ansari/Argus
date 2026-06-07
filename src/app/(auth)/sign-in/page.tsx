import { Suspense } from "react";
import { BrandLogo } from "@/components/brand/brand-logo";
import { AuthPanel } from "@/features/auth/components/auth-panel";

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-base text-muted-foreground">
          Loading...
        </div>
      }
    >
      <AuthPanel
        initialMode="sign-in"
        logo={<BrandLogo href="/" size={36} wordmarkClassName="text-xl" />}
      />
    </Suspense>
  );
}
