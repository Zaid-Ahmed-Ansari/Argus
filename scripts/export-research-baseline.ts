/**
 * Copies experiment results into experiments/baseline/ for git + Vercel deploy.
 * Baseline files ship with the repo so /research has data without a writable disk.
 *
 * Usage: npm run experiment:baseline
 */
import { copyFile, mkdir, readdir, stat } from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const SOURCE = path.join(ROOT, "experiments", "results");
const TARGET = path.join(ROOT, "experiments", "baseline");

async function main() {
  await mkdir(TARGET, { recursive: true });

  let files: string[] = [];
  try {
    files = await readdir(SOURCE);
  } catch {
    console.error(`No results directory at ${SOURCE}. Run npm run experiment:all first.`);
    process.exit(1);
  }

  const jsonFiles = files.filter((f) => f.endsWith(".json"));
  if (jsonFiles.length === 0) {
    console.error("No JSON results found. Run npm run experiment:all first.");
    process.exit(1);
  }

  let copied = 0;
  for (const file of jsonFiles) {
    await copyFile(path.join(SOURCE, file), path.join(TARGET, file));
    copied++;
  }

  const bytes = (
    await Promise.all(
      jsonFiles.map(async (f) => (await stat(path.join(TARGET, f))).size),
    )
  ).reduce((a, b) => a + b, 0);

  console.log(
    `Exported ${copied} result file(s) to experiments/baseline/ (${(bytes / 1024).toFixed(1)} KB)`,
  );
  console.log("Commit experiments/baseline/ so /research works on Vercel.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
