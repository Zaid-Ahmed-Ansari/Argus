"use client";

import { configureBoneyard } from "boneyard-js/react";
import "@/bones/registry";

configureBoneyard({
  animate: "shimmer",
  color: "oklch(0.97 0 0)",
  darkColor: "oklch(0.269 0 0)",
  shimmerColor: "oklch(0.99 0 0)",
  darkShimmerColor: "oklch(0.32 0 0)",
  speed: "1.8s",
  transition: 300,
  stagger: 60,
});

export function BoneyardInit() {
  return null;
}
