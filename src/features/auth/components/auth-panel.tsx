"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FadeIn } from "@/components/ui/fade-in";
import { cn } from "@/lib/utils";
import { toast } from "@/lib/toast";

type AuthMode = "sign-in" | "sign-up";

type AuthPanelProps = {
  initialMode?: AuthMode;
  logo: React.ReactNode;
};

export function AuthPanel({ initialMode = "sign-in", logo }: AuthPanelProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";

  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const switchMode = (next: AuthMode) => {
    setMode(next);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (mode === "sign-in") {
        const result = await authClient.signIn.email({ email, password });
        if (result.error) {
          const message = result.error.message ?? "Sign in failed";
          setError(message);
          toast.error(message);
          return;
        }
        toast.success("Signed in successfully");
        router.push(callbackUrl);
      } else {
        const result = await authClient.signUp.email({ name, email, password });
        if (result.error) {
          const message = result.error.message ?? "Sign up failed";
          setError(message);
          toast.error(message);
          return;
        }
        toast.success("Account created successfully");
        router.push("/dashboard");
      }

      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Authentication failed";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-muted/40">
      <div className="relative hidden w-[400px] shrink-0 border-r border-border bg-background p-12 lg:flex lg:flex-col lg:justify-between">
        <div
          className="pointer-events-none absolute inset-0 bg-primary/5"
          aria-hidden
        />
        <FadeIn className="relative">
          {logo}
          <p className="mt-10 max-w-xs text-lg leading-relaxed text-muted-foreground">
            SOC analyst assistant for incident log analysis. Upload logs, run
            structured analysis, review results on your dashboard.
          </p>
        </FadeIn>
        <p className="relative text-base text-muted-foreground">
          Structured incident analysis for security teams.
        </p>
      </div>

      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <FadeIn className="w-full max-w-md">
          <div className="lg:hidden">{logo}</div>

          <div className="mt-8 flex gap-8 border-b border-border text-base">
            <button
              type="button"
              onClick={() => switchMode("sign-in")}
              className={cn(
                "pb-3 transition-colors duration-200",
                mode === "sign-in"
                  ? "border-b-2 border-primary font-medium text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => switchMode("sign-up")}
              className={cn(
                "pb-3 transition-colors duration-200",
                mode === "sign-up"
                  ? "border-b-2 border-primary font-medium text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              Sign up
            </button>
          </div>

          <div className="mt-8">
            <h1 className="text-2xl font-semibold tracking-tight">
              {mode === "sign-in" ? "Sign in" : "Create account"}
            </h1>
            <p className="mt-2 text-base text-muted-foreground">
              {mode === "sign-in"
                ? "Access your incidents and analyses."
                : "Email and password registration."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            {error ? (
              <p className="text-base text-destructive">{error}</p>
            ) : null}

            <div
              className={cn(
                "grid transition-all duration-300 ease-out",
                mode === "sign-up"
                  ? "grid-rows-[1fr] opacity-100"
                  : "grid-rows-[0fr] opacity-0",
              )}
            >
              <div className="overflow-hidden">
                <div className="space-y-2 pb-4">
                  <label htmlFor="name" className="text-base font-medium">
                    Name
                  </label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required={mode === "sign-up"}
                    autoComplete="name"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-base font-medium">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-base font-medium">
                Password
                {mode === "sign-up" ? (
                  <span className="font-normal text-muted-foreground">
                    {" "}
                    (min. 8 characters)
                  </span>
                ) : null}
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={mode === "sign-up" ? 8 : undefined}
                autoComplete={
                  mode === "sign-in" ? "current-password" : "new-password"
                }
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading
                ? mode === "sign-in"
                  ? "Signing in..."
                  : "Creating account..."
                : mode === "sign-in"
                  ? "Sign in"
                  : "Create account"}
            </Button>
          </form>

          <p className="mt-8 text-center text-base text-muted-foreground">
            <Link
              href="/"
              className="text-primary underline-offset-4 hover:underline"
            >
              Back to home
            </Link>
          </p>
        </FadeIn>
      </div>
    </div>
  );
}
