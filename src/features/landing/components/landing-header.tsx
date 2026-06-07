"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  LogOut,
  Menu,
  Upload,
  User,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { authClient } from "@/lib/auth-client";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";
import type { LandingUser } from "@/features/landing/types";

type LandingHeaderProps = {
  user: LandingUser | null;
  logo: React.ReactNode;
};

const navLinks = [
  { href: "/#features", label: "Features" },
  { href: "/#how-it-works", label: "How it works" },
  { href: "/research", label: "Research" },
];

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0];
  const last = parts[parts.length - 1];
  if (!first) return "?";
  if (parts.length === 1) return first.slice(0, 2).toUpperCase();
  return `${first[0] ?? ""}${last?.[0] ?? ""}`.toUpperCase();
}

export function LandingHeader({ user, logo }: LandingHeaderProps) {
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await authClient.signOut();
      toast.success("Signed out");
      router.refresh();
    } catch (error) {
      toast.error(error, "Failed to sign out");
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 sm:px-6">
        <div className="shrink-0">{logo}</div>

        <NavigationMenu className="mx-auto hidden max-w-none flex-1 justify-center md:flex">
          <NavigationMenuList className="gap-2">
            {navLinks.map((link) => (
              <NavigationMenuItem key={link.href}>
                <NavigationMenuLink
                  href={link.href}
                  className={navigationMenuTriggerStyle()}
                >
                  {link.label}
                </NavigationMenuLink>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>

        <div className="ml-auto flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  aria-label="Open menu"
                />
              }
            >
              <Menu className="size-5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuGroup>
                <DropdownMenuLabel>Navigate</DropdownMenuLabel>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              {navLinks.map((link) => (
                <DropdownMenuItem key={link.href} render={<Link href={link.href} />}>
                  {link.label}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              {user ? (
                <>
                  <DropdownMenuItem render={<Link href="/dashboard" />}>
                    <LayoutDashboard className="size-4" />
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem render={<Link href="/upload" />}>
                    <Upload className="size-4" />
                    Upload logs
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="size-4" />
                    Sign out
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuItem render={<Link href="/sign-in" />}>
                    Sign in
                  </DropdownMenuItem>
                  <DropdownMenuItem render={<Link href="/sign-up" />}>
                    Create account
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="outline"
                    className="hidden gap-2 md:inline-flex"
                  />
                }
              >
                <span className="flex size-6 items-center justify-center rounded-full bg-muted text-xs font-semibold">
                  {getInitials(user.name)}
                </span>
                <span className="max-w-32 truncate">{user.name}</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col gap-1">
                      <p className="text-sm font-medium leading-none">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem render={<Link href="/dashboard" />}>
                  <LayoutDashboard className="size-4" />
                  Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem render={<Link href="/upload" />}>
                  <Upload className="size-4" />
                  Upload logs
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="size-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden items-center gap-3 md:flex">
              <Link
                href="/sign-in"
                className={cn(buttonVariants({ variant: "ghost" }))}
              >
                Sign in
              </Link>
              <Link href="/sign-up" className={cn(buttonVariants())}>
                Create account
              </Link>
            </div>
          )}

          {user ? (
            <Link
              href="/dashboard"
              className={cn(buttonVariants(), "md:hidden")}
            >
              <User className="size-4" />
              Account
            </Link>
          ) : null}
        </div>
      </div>
    </header>
  );
}
