"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Upload,
  ShieldAlert,
  FlaskConical,
  LogOut,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "@/lib/toast";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/upload", label: "Upload", icon: Upload },
  { href: "/incidents", label: "Incidents", icon: ShieldAlert },
  { href: "/research", label: "Research", icon: FlaskConical },
];

type SidebarProps = {
  logo: React.ReactNode;
};

export function Sidebar({ logo }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

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
    <aside className="flex h-full w-[260px] shrink-0 flex-col border-r border-border bg-sidebar">
      <div className="px-5 py-6">
        {logo}
        <p className="mt-2 text-base text-muted-foreground">SOC assistant</p>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active =
            pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex h-11 items-center gap-3 rounded-md px-3 text-[1.05rem] transition-[background-color,color,transform] duration-200",
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
            </Link>
          );
        })}
      </nav>

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
