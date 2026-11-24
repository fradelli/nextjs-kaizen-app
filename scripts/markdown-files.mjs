import { existsSync, readdirSync } from "node:fs";
import { resolve, sep } from "node:path";

// Shared file helpers for the documentation checks.

export function toPosix(path) {
  return path.split(sep).join("/");
}

export function walkMarkdown(directory) {
  if (!existsSync(directory)) {
    return [];
  }

  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = resolve(directory, entry.name);

    if (entry.isDirectory()) {
      return walkMarkdown(path);
    }

    return entry.isFile() && entry.name.endsWith(".md") ? [path] : [];
  });
}

export function withoutCodeFences(text) {
  return text.replace(/^```[\s\S]*?^```/gm, "");
}
