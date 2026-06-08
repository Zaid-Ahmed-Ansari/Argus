"use client";

import { memo, type ReactNode } from "react";
import { BrandLogo } from "@/components/brand/brand-logo";
import { AppMobileNav } from "@/components/layout/app-mobile-nav";
import { Sidebar } from "@/components/layout/sidebar";
import { PageContainer } from "@/components/layout/page-container";

type AppShellProps = {
  children: ReactNode;
};

function AppShellInner({ children }: AppShellProps) {
  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-muted/30 lg:flex-row">
      <header className="flex shrink-0 items-center border-b border-border bg-background px-4 py-3 lg:hidden">
        <BrandLogo href="/dashboard" size={28} wordmarkClassName="text-base" />
      </header>
      <div className="flex min-h-0 flex-1 overflow-hidden lg:flex-row">
        <Sidebar />
        <main className="min-h-0 flex-1 overflow-y-auto pb-[calc(4.5rem+env(safe-area-inset-bottom))] lg:pb-0">
          <PageContainer className="px-4 py-6 sm:px-6 sm:py-8 md:px-8 md:py-10">
            {children}
          </PageContainer>
        </main>
      </div>
      <AppMobileNav />
    </div>
  );
}

export const AppShell = memo(AppShellInner);
