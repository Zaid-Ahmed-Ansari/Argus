import {
  LayoutDashboard,
  Upload,
  ShieldAlert,
  FlaskConical,
  type LucideIcon,
} from "lucide-react";

export type AppNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  shortLabel?: string;
};

export const APP_NAV_ITEMS: AppNavItem[] = [
  { href: "/dashboard", label: "Dashboard", shortLabel: "Home", icon: LayoutDashboard },
  { href: "/upload", label: "Upload", icon: Upload },
  { href: "/incidents", label: "Incidents", icon: ShieldAlert },
  { href: "/research", label: "Research", icon: FlaskConical },
];
