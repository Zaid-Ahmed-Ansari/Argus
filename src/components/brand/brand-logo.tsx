import Image from "next/image";
import Link from "next/link";
import { getLogoUrl } from "@/lib/brand";
import { cn } from "@/lib/utils";

type BrandLogoProps = {
  size?: number;
  showWordmark?: boolean;
  href?: string;
  priority?: boolean;
  className?: string;
  wordmarkClassName?: string;
};

export function BrandLogo({
  size = 36,
  showWordmark = true,
  href,
  priority = false,
  className,
  wordmarkClassName,
}: BrandLogoProps) {
  const content = (
    <>
      <Image
        src={getLogoUrl()}
        alt="Argus"
        width={size}
        height={size}
        priority={priority}
        unoptimized
        className={cn("shrink-0 rounded-md object-contain", className)}
      />
      {showWordmark ? (
        <span
          className={cn(
            "text-base font-semibold tracking-tight text-foreground",
            wordmarkClassName,
          )}
        >
          Argus
        </span>
      ) : null}
    </>
  );

  const classes = cn(
    "flex items-center gap-2.5",
    href && "transition-opacity hover:opacity-85",
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        {content}
      </Link>
    );
  }

  return <div className={classes}>{content}</div>;
}
