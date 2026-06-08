"use client";

import { memo, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { APP_NAV_ITEMS } from "@/lib/app-nav-items";
import { AppNavLink } from "@/components/layout/app-nav-link";
import { BrandLogo } from "@/components/brand/brand-logo";
import { Button } from "@/components/ui/button";
import { toast } from "@/lib/toast";

function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-1 flex-col gap-1 px-3">
      {APP_NAV_ITEMS.map((item) => {
        const active =
          pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <AppNavLink
            key={item.href}
            href={item.href}
            label={item.label}
            active={active}
            icon={item.icon}
            variant="sidebar"
          />
        );
      })}
    </nav>
  );
}

const MemoizedSidebarNav = memo(SidebarNav);

function SidebarInner() {
  const router = useRouter();

  useEffect(() => {
    for (const { href } of APP_NAV_ITEMS) {
      router.prefetch(href);
    }
  }, [router]);

  const handleSignOut = async () => {
    try {
      await authClient.signOut();
      toast.success("Signed out");
      router.push("/sign-in");
      router.refresh();
    } catch (error) {
      toast.error(error, "Failed to sign out");
    }
  };

  return (
    <aside className="hidden h-full w-[260px] shrink-0 flex-col border-r border-border bg-sidebar lg:flex">
      <div className="px-5 py-6">
        <BrandLogo href="/dashboard" size={28} wordmarkClassName="text-lg" />
        <p className="mt-2 text-base text-muted-foreground">SOC assistant</p>
      </div>

      <MemoizedSidebarNav />

      <div className="border-t border-border p-3">
        <Button
          variant="ghost"
          className="h-11 w-full justify-start gap-3 px-3 text-base text-muted-foreground"
          onClick={handleSignOut}
        >
          <LogOut className="size-[18px]" />
          Sign out
        </Button>
      </div>
    </aside>
  );
}

export const Sidebar = memo(SidebarInner);
