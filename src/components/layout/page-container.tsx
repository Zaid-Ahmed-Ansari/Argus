import { cn } from "@/lib/utils";

type PageContainerProps = {
  children: React.ReactNode;
  className?: string;
  size?: "default" | "narrow" | "wide";
};

const widths = {
  narrow: "max-w-2xl",
  default: "max-w-4xl",
  wide: "max-w-5xl",
};

export function PageContainer({
  children,
  className,
  size = "wide",
}: PageContainerProps) {
  return (
    <div className={cn("mx-auto w-full", widths[size], className)}>
      {children}
    </div>
  );
}
