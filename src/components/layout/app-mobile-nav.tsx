"use client";

import { memo } from "react";
import { usePathname } from "next/navigation";
import { APP_NAV_ITEMS } from "@/lib/app-nav-items";
import { AppNavLink } from "@/components/layout/app-nav-link";

function AppMobileNavInner() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="App navigation"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/90 lg:hidden"
    >
      <div className="mx-auto flex max-w-lg items-stretch justify-around px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1">
        {APP_NAV_ITEMS.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <AppNavLink
              key={item.href}
              href={item.href}
              label={item.label}
              shortLabel={item.shortLabel}
              active={active}
              icon={item.icon}
              variant="mobile"
            />
          );
        })}
      </div>
    </nav>
  );
}

export const AppMobileNav = memo(AppMobileNavInner);
