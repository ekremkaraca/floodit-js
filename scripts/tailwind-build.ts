import { watch } from "node:fs";
import path from "node:path";
import { compile } from "tailwindcss";

const INPUT_CSS = "src/styles/tailwind.css";
const OUTPUT_CSS = "src/styles/app.css";
const CONTENT_GLOB = "src/**/*.{html,js}";

const args = new Set(Bun.argv.slice(2));
const isWatchMode = args.has("--watch");
const isMinifyMode = args.has("--minify");

function extractCandidateTokens(text: string): string[] {
  const matches = text.match(/[A-Za-z0-9_:/.[\]()%!-]+/g) ?? [];
  // Include all tokens that look like CSS classes (start with letter, may contain special chars)
  return matches.filter((token) => /^[a-z]/i.test(token) && token.length > 1);
}

async function collectCandidates(): Promise<string[]> {
  const candidates = new Set<string>();
  const glob = new Bun.Glob(CONTENT_GLOB);

  for await (const file of glob.scan(".")) {
    const content = await Bun.file(file).text();
    for (const token of extractCandidateTokens(content)) {
      candidates.add(token);
    }
  }

  return Array.from(candidates);
}

async function buildTailwind() {
  const css = await Bun.file(INPUT_CSS).text();
  const compiler = await compile(css, {
    base: process.cwd(),
    from: INPUT_CSS,
    loadModule: async (id) => {
      throw new Error(`Unsupported Tailwind module import: ${id}`);
    },
    loadStylesheet: async (id, base) => {
      let filePath: string;

      if (id.startsWith(".") || id.startsWith("/")) {
        filePath = path.resolve(base, id);
      } else if (id === "tailwindcss") {
        filePath = path.resolve(process.cwd(), "node_modules/tailwindcss/index.css");
      } else if (id.startsWith("tailwindcss/")) {
        const cssPath = id.endsWith(".css") ? id : `${id}.css`;
        filePath = path.resolve(process.cwd(), "node_modules", cssPath);
      } else {
        throw new Error(`Unsupported stylesheet import: ${id}`);
      }

      return {
        path: filePath,
        base: path.dirname(filePath),
        content: await Bun.file(filePath).text(),
      };
    },
  });

  const candidates = await collectCandidates();
  const output = compiler.build(candidates);
  await Bun.write(OUTPUT_CSS, output);
  console.log(
    `[tailwind] wrote ${OUTPUT_CSS} with ${candidates.length} candidates${isMinifyMode ? " (minify via bun build)" : ""}`
  );
}

async function runWatchMode() {
  let timer: ReturnType<typeof setTimeout> | null = null;
  let running = false;
  let queued = false;

  const scheduleBuild = () => {
    if (running) {
      queued = true;
      return;
    }
    if (timer) clearTimeout(timer);
    timer = setTimeout(async () => {
      running = true;
      try {
        await buildTailwind();
      } catch (error) {
        console.error("[tailwind] build failed", error);
      } finally {
        running = false;
        if (queued) {
          queued = false;
          scheduleBuild();
        }
      }
    }, 100);
  };

  await buildTailwind();
  console.log("[tailwind] watching src/ for changes");

  watch("src", { recursive: true }, (_eventType, filename) => {
    if (!filename) return;
    // Skip the output CSS file to avoid infinite rebuild loop
    if (filename.includes('app.css')) return;
    if (!/\.(css|html|js)$/.test(filename)) return;
    scheduleBuild();
  });
}

if (isWatchMode) {
  await runWatchMode();
  await new Promise(() => {});
} else {
  await buildTailwind();
}
