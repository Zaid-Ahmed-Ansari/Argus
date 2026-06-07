import Link from "next/link";
import { BrandLogo } from "@/components/brand/brand-logo";
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
      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p className="text-base text-muted-foreground">
            Argus — SOC analyst assistant
          </p>
          <Link
            href="/"
            className="text-base text-muted-foreground transition-colors hover:text-foreground"
          >
            Back to home
          </Link>
        </div>
      </footer>
    </div>
  );
}
