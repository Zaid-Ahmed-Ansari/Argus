import { BrandLogo } from "@/components/brand/brand-logo";
import { LandingCta } from "@/features/landing/components/landing-cta";
import { LandingFeatures } from "@/features/landing/components/landing-features";
import { LandingExploreObjects } from "@/features/landing/components/landing-explore-objects";
import { LandingHeader } from "@/features/landing/components/landing-header";
import { LandingHero } from "@/features/landing/components/landing-hero";
import { HowItWorks } from "@/features/landing/components/how-it-works";
import { LogSnippetSection } from "@/features/landing/components/log-snippet-section";
import { DashboardPreview } from "@/features/landing/components/dashboard-preview";
import { SiteFooter } from "@/components/layout/site-footer";
import type { LandingUser } from "@/features/landing/types";

type LandingPageProps = {
  user: LandingUser | null;
};

export function LandingPage({ user }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <LandingExploreObjects />
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

      <main>
        <LandingHero user={user} />
        <LandingFeatures />
        <HowItWorks />
        <LogSnippetSection />
        <DashboardPreview />
        <LandingCta user={user} />
      </main>

      <SiteFooter />
    </div>
  );
}
