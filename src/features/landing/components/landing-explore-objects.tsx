"use client";

import { useEffect, useRef, useState } from "react";
import { Lock, Shield, Terminal, FileSearch, Radar } from "lucide-react";
import { cn } from "@/lib/utils";

type ExploreObject = {
  id: string;
  icon: typeof Shield;
  left: string;
  top: string;
  size: number;
  depth: number;
  drift: number;
  rotate: number;
};

const OBJECTS: ExploreObject[] = [
  { id: "shield", icon: Shield, left: "8%", top: "12%", size: 44, depth: 0.15, drift: 18, rotate: -12 },
  { id: "terminal", icon: Terminal, left: "82%", top: "18%", size: 40, depth: 0.22, drift: -14, rotate: 8 },
  { id: "lock", icon: Lock, left: "72%", top: "62%", size: 36, depth: 0.28, drift: 22, rotate: -6 },
  { id: "search", icon: FileSearch, left: "14%", top: "58%", size: 38, depth: 0.2, drift: -20, rotate: 10 },
  { id: "radar", icon: Radar, left: "48%", top: "8%", size: 32, depth: 0.12, drift: 12, rotate: 0 },
  { id: "shield-2", icon: Shield, left: "90%", top: "78%", size: 28, depth: 0.35, drift: -16, rotate: 14 },
];

export function LandingExploreObjects() {
  const [scrollY, setScrollY] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotion = () => setReducedMotion(mq.matches);
    updateMotion();
    mq.addEventListener("change", updateMotion);

    const onScroll = () => {
      if (rafRef.current !== null) return;
      rafRef.current = window.requestAnimationFrame(() => {
        setScrollY(window.scrollY);
        rafRef.current = null;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
      }
      mq.removeEventListener("change", updateMotion);
    };
  }, []);

  if (reducedMotion) {
    return null;
  }

  return (
    <div
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      aria-hidden
    >
      {OBJECTS.map((obj) => {
        const Icon = obj.icon;
        const translateY = scrollY * obj.depth;
        const translateX = Math.sin((scrollY + obj.drift * 10) / 120) * obj.drift;
        const rotate = obj.rotate + scrollY * 0.02 * (obj.depth * 10);

        return (
          <div
            key={obj.id}
            className="absolute"
            style={{
              left: obj.left,
              top: obj.top,
              width: obj.size,
              height: obj.size,
              transform: `translate3d(${translateX}px, ${translateY}px, 0) rotate(${rotate}deg)`,
            }}
          >
            <div
              className={cn(
                "flex size-full items-center justify-center rounded-2xl border border-border/50 bg-background/40 text-muted-foreground/40 shadow-sm backdrop-blur-sm",
                "landing-explore-float",
              )}
              style={{ animationDelay: `${OBJECTS.indexOf(obj) * 0.4}s` }}
            >
              <Icon className="size-[55%]" strokeWidth={1.5} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
