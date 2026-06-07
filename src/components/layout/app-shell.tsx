import { BrandLogo } from "@/components/brand/brand-logo";
import { Sidebar } from "@/components/layout/sidebar";
import { PageContainer } from "@/components/layout/page-container";

type AppShellProps = {
  children: React.ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex h-dvh overflow-hidden bg-muted/30">
      <Sidebar
        logo={
          <BrandLogo
            href="/dashboard"
            size={28}
            wordmarkClassName="text-lg"
          />
        }
      />
      <main className="min-h-0 flex-1 overflow-y-auto">
        <PageContainer className="px-6 py-8 md:px-8 md:py-10">
          {children}
        </PageContainer>
      </main>
    </div>
  );
}
