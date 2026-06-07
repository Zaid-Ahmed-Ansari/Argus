import { ShieldAlert } from "lucide-react";
import { MOCK_ANALYSIS } from "@/features/landing/constants";
import type { LandingUser } from "@/features/landing/types";
import { LandingHeroActions } from "@/features/landing/components/landing-hero-actions";

type LandingHeroProps = {
  user: LandingUser | null;
};

export function LandingHero({ user }: LandingHeroProps) {
  return (
    <section className="landing-grid relative overflow-hidden border-b border-border">
      <div className="mx-auto grid max-w-6xl gap-12 px-4 py-20 sm:px-6 md:py-28 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16">
        <div>
          
           

          <h1 className="mt-5 max-w-2xl text-4xl font-semibold leading-[1.1] tracking-tight md:text-5xl lg:text-[3.5rem]">
            Security log analysis for{" "}
            <span className="underline decoration-foreground/20 underline-offset-4">
              SOC investigators
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-xl leading-relaxed text-muted-foreground">
            Upload authentication logs, receive structured incident analysis,
            and review timelines and recommendations on a persistent dashboard.
          </p>

          <LandingHeroActions user={user} />
        </div>

        <article className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          <header className="flex items-center justify-between border-b border-border bg-muted/40 px-4 py-3">
            <div className="flex items-center gap-2">
              <ShieldAlert className="size-5" />
              <span className="text-base font-medium">Analysis preview</span>
            </div>
            <span className="rounded-md border border-border bg-muted px-2.5 py-1 font-mono text-sm font-medium">
              {MOCK_ANALYSIS.severity}
            </span>
          </header>

          <div className="space-y-4 p-5">
            <div>
              <p className="text-sm uppercase tracking-wide text-muted-foreground">
                Attack type
              </p>
              <p className="mt-1 font-mono text-base font-medium">
                {MOCK_ANALYSIS.attackType}
              </p>
            </div>

            <p className="text-base leading-relaxed text-muted-foreground">
              {MOCK_ANALYSIS.summary}
            </p>

            <div className="rounded-md border border-border bg-muted/30 p-3">
              <p className="text-sm font-medium text-muted-foreground">
                Timeline
              </p>
              <ul className="mt-2 space-y-2">
                {MOCK_ANALYSIS.timeline.map((item) => (
                  <li
                    key={item.time}
                    className="grid grid-cols-[1fr_4fr] gap-2 text-base"
                  >
                    <span className="font-mono text-sm text-muted-foreground">
                      {item.time}
                    </span>
                    <span className="text-foreground/90">{item.event}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
