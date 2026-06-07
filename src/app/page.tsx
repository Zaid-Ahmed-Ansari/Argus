import { LandingPage } from "@/features/landing/landing-page";
import { getSession } from "@/lib/auth-session";
import type { LandingUser } from "@/features/landing/types";

export default async function Home() {
  const session = await getSession();

  const user: LandingUser | null = session?.user
    ? {
        name: session.user.name,
        email: session.user.email,
      }
    : null;

  return <LandingPage user={user} />;
}
