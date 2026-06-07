"use client";

import { useEffect, useState } from "react";
import { motion, useSpring, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

type AnimatedMetricProps = {
  label: string;
  value: number | null;
  format?: "number" | "percent" | "rate";
  tone?: "default" | "success" | "warning" | "critical";
};

function formatDisplay(
  value: number,
  format: "number" | "percent" | "rate",
): string {
  if (format === "percent" || format === "rate") return `${(value * 100).toFixed(1)}%`;
  return Math.round(value).toString();
}

const TONE = {
  default: "text-foreground",
  success: "text-success",
  warning: "text-warning",
  critical: "text-critical",
};

export function AnimatedMetric({
  label,
  value,
  format = "number",
  tone = "default",
}: AnimatedMetricProps) {
  const spring = useSpring(0, { stiffness: 60, damping: 20 });
  const display = useTransform(spring, (v) => formatDisplay(v, format));
  const [text, setText] = useState("—");

  useEffect(() => {
    if (value === null) {
      setText("—");
      return;
    }
    spring.set(value);
    return display.on("change", (v) => setText(v));
  }, [value, spring, display]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="surface-card px-5 py-5"
    >
      <p className="metric-label">{label}</p>
      <p className={cn("metric-value mt-2", TONE[tone])}>{text}</p>
    </motion.div>
  );
}
