import { PublicPageShell } from "@/components/layout/public-page-shell";
import { ResearchShell } from "@/features/research/layout/research-shell";
import { getSession } from "@/lib/auth-session";
import type { LandingUser } from "@/features/landing/types";

export const metadata = {
  title: "Research Lab — Argus",
  description:
    "Interactive AI research laboratory for SOC log triage evaluation.",
};

export default async function ResearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  const user: LandingUser | null = session?.user
    ? { name: session.user.name, email: session.user.email }
    : null;

  return (
    <PublicPageShell user={user}>
      <ResearchShell>{children}</ResearchShell>
    </PublicPageShell>
  );
}
