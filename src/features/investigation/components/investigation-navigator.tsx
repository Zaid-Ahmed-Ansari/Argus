"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import type { InvestigationNavSection } from "@/types/investigation";

const VIEWPORT_PADDING_PX = 32;
const HEADER_GAP_PX = 16;
const WORKSPACE_HEADER_ID = "investigation-workspace-header";

type PanelRect = {
  top: number;
  left: number;
  width: number;
  height: number;
};

type InvestigationNavigatorProps = {
  sections: InvestigationNavSection[];
  variant: "rail" | "bar";
};

function getScrollRoot(): HTMLElement | null {
  return document.querySelector("main");
}

function useActiveSection(sections: InvestigationNavSection[]) {
  const [activeId, setActiveId] = useState(sections[0]?.id ?? "");

  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    const scrollRoot = getScrollRoot();

    for (const section of sections) {
      const el = document.getElementById(section.id);
      if (!el) continue;

      const observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              setActiveId(section.id);
            }
          }
        },
        {
          root: scrollRoot,
          rootMargin: "-15% 0px -60% 0px",
          threshold: 0,
        },
      );

      observer.observe(el);
      observers.push(observer);
    }

    return () => {
      for (const observer of observers) {
        observer.disconnect();
      }
    };
  }, [sections]);

  return activeId;
}

function getFloatingTop(mainRect: PanelRect): number {
  const header = document.getElementById(WORKSPACE_HEADER_ID);
  if (!header) {
    return mainRect.top + VIEWPORT_PADDING_PX;
  }

  const headerBottom = header.getBoundingClientRect().bottom + HEADER_GAP_PX;
  return Math.max(mainRect.top + VIEWPORT_PADDING_PX, headerBottom);
}

function useMainPanelRect() {
  const [rect, setRect] = useState<PanelRect | null>(null);

  useEffect(() => {
    const main = getScrollRoot();
    if (!main) return;

    const update = () => {
      const next = main.getBoundingClientRect();
      setRect({
        top: next.top,
        left: next.left,
        width: next.width,
        height: next.height,
      });
    };

    update();
    main.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);

    const observer = new ResizeObserver(update);
    observer.observe(main);

    return () => {
      main.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      observer.disconnect();
    };
  }, []);

  return rect;
}

function useRailAnchorRect(anchorRef: React.RefObject<HTMLElement | null>) {
  const [rect, setRect] = useState<PanelRect | null>(null);

  useEffect(() => {
    const anchor = anchorRef.current;
    const main = getScrollRoot();
    if (!anchor || !main) return;

    const update = () => {
      const anchorRect = anchor.getBoundingClientRect();
      setRect({
        top: anchorRect.top,
        left: anchorRect.left,
        width: anchorRect.width,
        height: anchorRect.height,
      });
    };

    update();
    main.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);

    const observer = new ResizeObserver(update);
    observer.observe(anchor);
    observer.observe(main);

    return () => {
      main.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      observer.disconnect();
    };
  }, [anchorRef]);

  return rect;
}

function NavLink({
  section,
  active,
  onNavigate,
  className,
}: {
  section: InvestigationNavSection;
  active: boolean;
  onNavigate: (id: string) => void;
  className?: string;
}) {
  return (
    <a
      href={`#${section.id}`}
      onClick={(event) => {
        event.preventDefault();
        onNavigate(section.id);
      }}
      className={cn(
        "transition-colors",
        active
          ? "font-medium text-foreground"
          : "text-muted-foreground hover:text-foreground",
        className,
      )}
    >
      {section.label}
    </a>
  );
}

export function InvestigationNavigator({
  sections,
  variant,
}: InvestigationNavigatorProps) {
  const activeId = useActiveSection(sections);
  const mainRect = useMainPanelRect();
  const railAnchorRef = useRef<HTMLElement>(null);
  const railAnchorRect = useRailAnchorRect(railAnchorRef);

  const scrollToSection = useCallback((id: string) => {
    const target = document.getElementById(id);
    const main = getScrollRoot();
    if (!target || !main) return;

    const mainTop = main.getBoundingClientRect().top;
    const targetTop = target.getBoundingClientRect().top;
    const nextTop = main.scrollTop + (targetTop - mainTop) - 96;

    main.scrollTo({ top: Math.max(0, nextTop), behavior: "smooth" });
    history.replaceState(null, "", `#${id}`);
  }, []);

  if (variant === "bar") {
    if (!mainRect) {
      return <div className="mb-6 h-11 xl:hidden" aria-hidden />;
    }

    const barTop = getFloatingTop(mainRect);

    return (
      <>
        <div className="mb-6 h-11 xl:hidden" aria-hidden />
        <nav
          aria-label="Investigation sections"
          className="z-30 border-b border-border bg-background/95 py-2 backdrop-blur supports-backdrop-filter:bg-background/80 xl:hidden"
          style={{
            position: "fixed",
            top: barTop,
            left: mainRect.left,
            width: mainRect.width,
          }}
        >
          <div className="flex gap-1 overflow-x-auto px-6 pb-0.5 md:px-8">
            {sections.map((section) => (
              <NavLink
                key={section.id}
                section={section}
                active={activeId === section.id}
                onNavigate={scrollToSection}
                className={cn(
                  "shrink-0 rounded-md px-3 py-1.5 text-xs",
                  activeId === section.id
                    ? "bg-muted text-foreground"
                    : "hover:bg-muted/60",
                )}
              />
            ))}
          </div>
        </nav>
      </>
    );
  }

  if (!mainRect || !railAnchorRect) {
    return (
      <aside
        ref={railAnchorRef}
        className="hidden w-52 shrink-0 xl:block"
        aria-hidden
      />
    );
  }

  const railTop = getFloatingTop(mainRect);

  return (
    <>
      <aside
        ref={railAnchorRef}
        className="hidden w-52 shrink-0 xl:block"
        aria-hidden
      />
      <nav
        aria-label="Investigation sections"
        className="z-20 hidden xl:block"
        style={{
          position: "fixed",
          top: railTop,
          left: railAnchorRect.left,
          width: railAnchorRect.width,
          maxHeight: mainRect.top + mainRect.height - railTop - VIEWPORT_PADDING_PX,
        }}
      >
        <div className="overflow-y-auto rounded-lg border border-border bg-card p-3 shadow-sm">
          <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
            Navigator
          </p>
          <ul className="space-y-0.5 border-l border-border">
            {sections.map((section) => (
              <li key={section.id}>
                <NavLink
                  section={section}
                  active={activeId === section.id}
                  onNavigate={scrollToSection}
                  className={cn(
                    "block border-l-2 py-1.5 pl-3 text-sm",
                    activeId === section.id
                      ? "border-foreground"
                      : "border-transparent",
                  )}
                />
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </>
  );
}
