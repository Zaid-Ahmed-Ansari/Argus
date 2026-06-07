import { PublicPageShell } from "@/components/layout/public-page-shell";
import { getSession } from "@/lib/auth-session";
import type { LandingUser } from "@/features/landing/types";

export default async function ExperimentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  const user: LandingUser | null = session?.user
    ? { name: session.user.name, email: session.user.email }
    : null;

  return <PublicPageShell user={user}>{children}</PublicPageShell>;
}
