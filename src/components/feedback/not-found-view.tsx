import Link from "next/link";
import { FileQuestion } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type NotFoundViewProps = {
  title?: string;
  description?: string;
  homeHref?: string;
  homeLabel?: string;
};

export function NotFoundView({
  title = "Page not found",
  description = "The page you are looking for does not exist or may have been moved.",
  homeHref = "/",
  homeLabel = "Back to home",
}: NotFoundViewProps) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 py-16 text-center">
      <div className="flex size-14 items-center justify-center rounded-full border border-border bg-muted">
        <FileQuestion className="size-7 text-muted-foreground" />
      </div>
      <h1 className="mt-6 text-3xl font-semibold tracking-tight">{title}</h1>
      <p className="mt-3 max-w-md text-base text-muted-foreground">
        {description}
      </p>
      <Link href={homeHref} className={cn(buttonVariants({ size: "lg" }), "mt-8")}>
        {homeLabel}
      </Link>
    </div>
  );
}
