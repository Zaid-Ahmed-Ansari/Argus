import { PublicPageShell } from "@/components/layout/public-page-shell";
import { ResearchShell } from "@/features/research/layout/research-shell";
import { getSession } from "@/lib/auth-session";
import { createPageMetadata } from "@/lib/site-metadata";
import type { LandingUser } from "@/features/landing/types";

export const metadata = createPageMetadata(
  "Research Lab",
  "AI-powered SOC incident classification research platform — ARGUS-1000 dataset, Qwen3-4B evaluation, LoRA fine-tuning, and reproducible benchmarks.",
  "/research",
);

export const revalidate = 86400;

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
