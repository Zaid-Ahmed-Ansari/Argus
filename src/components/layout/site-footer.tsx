import Link from "next/link";
import { GITHUB_URL } from "@/lib/site-metadata";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <p className="text-lg font-semibold tracking-tight text-foreground">
              Argus
            </p>
            <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
              AI-Assisted Security Operations Center Analyst
            </p>
          </div>

          <nav
            aria-label="Footer"
            className="flex flex-wrap gap-x-8 gap-y-3 text-sm"
          >
            <Link
              href={GITHUB_URL}
              className="text-muted-foreground transition-colors hover:text-foreground"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </Link>
            <Link
              href="/research"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              Research
            </Link>
            <Link
              href="https://github.com/Zaid-Ahmed-Ansari/Argus/blob/main/docs/README.md"
              className="text-muted-foreground transition-colors hover:text-foreground"
              target="_blank"
              rel="noopener noreferrer"
            >
              Documentation
            </Link>
          </nav>
        </div>

        <p className="mt-8 border-t border-border pt-6 text-sm text-muted-foreground">
          Built by{" "}
          <Link
            href="https://github.com/Zaid-Ahmed-Ansari"
            className="font-medium text-foreground transition-colors hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Zaid Ahmed
          </Link>
        </p>
      </div>
    </footer>
  );
}
