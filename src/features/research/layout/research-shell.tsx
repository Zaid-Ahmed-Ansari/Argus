import { ResearchMobileNav } from "@/features/research/layout/research-mobile-nav";
import { ResearchSidebar } from "@/features/research/layout/research-sidebar";

type ResearchShellProps = {
  children: React.ReactNode;
};

export function ResearchShell({ children }: ResearchShellProps) {
  return (
    <div className="research-lab min-h-[calc(100vh-4rem)] bg-background text-foreground">
      <ResearchMobileNav />
      <div className="flex">
        <ResearchSidebar />
        <main className="min-w-0 flex-1 bg-background">{children}</main>
      </div>
    </div>
  );
}
