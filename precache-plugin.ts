import type { Plugin } from "vite";
import { createHash } from "node:crypto";
import { readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join, relative, sep } from "node:path";

const SW_FILENAME = "sw.js";
const EXCLUDE = new Set([`/${SW_FILENAME}`, "/_headers", "/.assetsignore"]);

function listFiles(dir: string, base: string = dir): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) {
      out.push(...listFiles(full, base));
    } else {
      out.push("/" + relative(base, full).split(sep).join("/"));
    }
  }
  return out;
}

export function precache(outDir = "dist/client"): Plugin {
  return {
    name: "precache-sw",
    apply: "build",
    closeBundle: {
      order: "post",
      handler() {
        const swPath = join(outDir, SW_FILENAME);
        let template: string;
        try {
          template = readFileSync(swPath, "utf8");
        } catch {
          return;
        }
        if (!template.includes("__PRECACHE_MANIFEST__")) return;

        const manifest = listFiles(outDir)
          .filter((p) => !EXCLUDE.has(p))
          .sort();

        const hash = createHash("sha256")
          .update(manifest.join("\n"))
          .digest("hex")
          .slice(0, 8);

        const filled = template
          .replace("__PRECACHE_MANIFEST__", JSON.stringify(manifest))
          .replace("__PRECACHE_HASH__", hash);
        writeFileSync(swPath, filled);
      },
    },
  };
}
