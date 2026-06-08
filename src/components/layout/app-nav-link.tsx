"use client";

import Link from "next/link";
import { memo, type ComponentType } from "react";
import { cn } from "@/lib/utils";

type AppNavLinkProps = {
  href: string;
  label: string;
  shortLabel?: string;
  active: boolean;
  icon: ComponentType<{ className?: string }>;
  variant: "sidebar" | "mobile";
};

function NavLinkContent({
  label,
  shortLabel,
  active,
  icon: Icon,
  variant,
}: Omit<AppNavLinkProps, "href">) {
  if (variant === "mobile") {
    return (
      <span
        className={cn(
          "flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-md px-1 py-2 text-[10px] font-medium",
          active ? "text-foreground" : "text-muted-foreground",
        )}
      >
        <Icon className={cn("size-5 shrink-0", active && "text-primary")} />
        <span className="truncate">{shortLabel ?? label}</span>
      </span>
    );
  }

  return (
    <span
      className={cn(
        "flex h-11 items-center gap-3 rounded-md px-3 text-[1.05rem] transition-[background-color,color,opacity] duration-150",
        active
          ? "border-l-2 border-primary bg-accent pl-[10px] font-medium text-accent-foreground"
          : "text-muted-foreground hover:bg-muted/80 hover:text-foreground",
      )}
    >
      <Icon
        className={cn(
          "size-[18px] shrink-0",
          active ? "text-primary" : "opacity-70",
        )}
      />
      {label}
    </span>
  );
}

export const AppNavLink = memo(function AppNavLink({
  href,
  label,
  shortLabel,
  active,
  icon,
  variant,
}: AppNavLinkProps) {
  return (
    <Link href={href} prefetch scroll={variant === "sidebar"}>
      <NavLinkContent
        label={label}
        shortLabel={shortLabel}
        active={active}
        icon={icon}
        variant={variant}
      />
    </Link>
  );
});
