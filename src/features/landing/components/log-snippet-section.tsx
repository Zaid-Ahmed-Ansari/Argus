import { SAMPLE_LOG_LINES } from "@/features/landing/constants";

export function LogSnippetSection() {
  return (
    <section className="border-b border-border">
      <div className="mx-auto grid max-w-6xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:gap-16">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
            Raw input
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground md:text-xl">
            Typical SSH authentication logs. Multiple failed attempts against
            privileged accounts, then a successful login from the same source.
          </p>
          <ul className="mt-8 space-y-2 text-lg text-muted-foreground">
            <li>1 MB upload limit with validation</li>
            <li>Search across stored log content</li>
            <li>Log data treated as untrusted in prompts</li>
          </ul>
        </div>

        <div className="overflow-hidden rounded-md border border-border bg-card shadow-sm">
          <div className="border-b border-border bg-muted/50 px-4 py-3">
            <span className="font-mono text-base text-muted-foreground">
              sample-auth-bruteforce.log
            </span>
          </div>
          <pre className="overflow-x-auto p-5 font-mono text-base leading-relaxed">
            {SAMPLE_LOG_LINES.map((line, i) => (
              <code key={line} className="block text-foreground/90">
                <span className="mr-4 select-none text-muted-foreground">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {line.includes("Failed") ? (
                  <>
                    {line.split("Failed")[0]}
                    <span className="font-medium text-destructive">Failed</span>
                    {line.split("Failed")[1]}
                  </>
                ) : (
                  line
                )}
              </code>
            ))}
          </pre>
        </div>
      </div>
    </section>
  );
}
