import { BrandLogo } from "@/components/brand/brand-logo";
import { SiteFooter } from "@/components/layout/site-footer";
import { LandingHeader } from "@/features/landing/components/landing-header";
import type { LandingUser } from "@/features/landing/types";

type PublicPageShellProps = {
  user: LandingUser | null;
  children: React.ReactNode;
};

export function PublicPageShell({ user, children }: PublicPageShellProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <LandingHeader
        user={user}
        logo={
          <BrandLogo
            href="/"
            size={48}
            priority
            wordmarkClassName="hidden sm:inline text-lg"
          />
        }
      />
      {children}
      <SiteFooter />
    </div>
  );
}
