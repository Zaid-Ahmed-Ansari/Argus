"use client";

import { cn } from "@/lib/utils";

type FadeInProps = {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
};

export function FadeIn({
  children,
  className,
  delay = 0,
  duration = 500,
}: FadeInProps) {
  return (
    <div
      className={cn(
        "animate-in fade-in slide-in-from-bottom-2 fill-mode-both",
        className,
      )}
      style={{
        animationDelay: `${delay}ms`,
        animationDuration: `${duration}ms`,
        animationFillMode: "both",
      }}
    >
      {children}
    </div>
  );
}

type StaggerGroupProps = {
  children: React.ReactNode;
  className?: string;
  stagger?: number;
};

export function StaggerGroup({
  children,
  className,
  stagger = 80,
}: StaggerGroupProps) {
  const items = Array.isArray(children) ? children : [children];

  return (
    <div className={className}>
      {items.map((child, i) => (
        <FadeIn key={i} delay={i * stagger}>
          {child}
        </FadeIn>
      ))}
    </div>
  );
}
