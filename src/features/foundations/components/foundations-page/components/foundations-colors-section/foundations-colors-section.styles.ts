import type { FoundationColorTone } from "./foundations-colors-section.types";

const colorSampleStyles = {
  yellow: "rounded-md border border-category-yellow-border bg-category-yellow-subtle p-3",
  orange: "rounded-md border border-category-orange-border bg-category-orange-subtle p-3",
  red: "rounded-md border border-category-red-border bg-category-red-subtle p-3",
  pink: "rounded-md border border-category-pink-border bg-category-pink-subtle p-3",
  purple: "rounded-md border border-category-purple-border bg-category-purple-subtle p-3",
  blue: "rounded-md border border-category-blue-border bg-category-blue-subtle p-3",
  cyan: "rounded-md border border-category-cyan-border bg-category-cyan-subtle p-3",
  green: "rounded-md border border-category-green-border bg-category-green-subtle p-3",
} as const satisfies Record<FoundationColorTone, string>;

export const foundationsColorsSectionStyles = {
  root: "space-y-4",
  title: "fd-text-section",
  description: "text-muted-foreground",
  grid: "grid grid-cols-2 gap-3 sm:grid-cols-4",
  sample: colorSampleStyles,
} as const;
