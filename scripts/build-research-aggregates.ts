import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT = path.join(process.cwd(), "research", "argus-v2");

const CLASS_LABELS = [
  "Benign Activity",
  "Brute Force",
  "Password Spray",
  "Credential Stuffing",
  "Reconnaissance",
  "Privilege Escalation",
  "Defense Evasion",
  "Malware Execution",
  "Data Exfiltration",
  "Insider Threat",
] as const;

type RawRun = {
  Accuracy: number;
  Precision: number;
  Recall: number;
  F1: number;
  "Per Class Accuracy": Record<string, number>;
  "Confusion Matrix": number[][];
  y_true?: string[];
  y_pred?: string[];
  responses?: string[];
};

function parseCsv(text: string) {
  const lines = text.trim().split("\n");
  const headers = lines[0]!.split(",");
  return lines.slice(1).map((line) => {
    const values = line.split(",");
    return Object.fromEntries(
      headers.map((h, i) => [h.trim(), values[i]?.trim() ?? ""]),
    ) as Record<string, string>;
  });
}

function trimMatrix(matrix: number[][]) {
  return matrix.slice(0, 10).map((row) => row.slice(0, 10));
}

function parseFailureRate(yPred?: string[]) {
  if (!yPred?.length) return 0;
  const failures = yPred.filter((p) => p === "UNPARSED").length;
  return failures / yPred.length;
}

function parseModelKey(key: string) {
  const [modelType, ...rest] = key.split(" ");
  const datasetVariant = rest.join(" ").toLowerCase().replace(/\s+/g, "_");
  return {
    id: key.toLowerCase().replace(/\s+/g, "-"),
    label: key,
    modelType: modelType!.toLowerCase() as "base" | "lora",
    datasetVariant: datasetVariant as "raw" | "condensed" | "rag",
  };
}

async function build() {
  const [evalRaw, csvRaw, statsRaw] = await Promise.all([
    readFile(path.join(ROOT, "evaluation_results.json"), "utf8"),
    readFile(path.join(ROOT, "research_summary.csv"), "utf8"),
    readFile(path.join(ROOT, "dataset_statistics.json"), "utf8"),
  ]);

  const evaluation = JSON.parse(evalRaw) as Record<string, RawRun>;
  const leaderboard = parseCsv(csvRaw).map((row) => ({
    model: row.Model!,
    dataset: row.Model!.includes("Raw")
      ? "raw"
      : row.Model!.includes("Condensed")
        ? "condensed"
        : "rag",
    accuracy: Number(row.Accuracy),
    precision: Number(row.Precision),
    recall: Number(row.Recall),
    f1: Number(row.F1),
  }));

  const runs = Object.entries(evaluation).map(([key, run]) => {
    const meta = parseModelKey(key);
    return {
      ...meta,
      metrics: {
        accuracy: run.Accuracy,
        precision: run.Precision,
        recall: run.Recall,
        f1: run.F1,
        perClassAccuracy: run["Per Class Accuracy"],
        parseFailureRate: parseFailureRate(run.y_pred),
      },
      confusionMatrix: {
        labels: [...CLASS_LABELS],
        matrix: trimMatrix(run["Confusion Matrix"]),
      },
    };
  });

  const best = [...leaderboard].sort((a, b) => b.f1 - a.f1)[0]!;

  const aggregates = {
    version: 2,
    generatedAt: new Date().toISOString(),
    overview: {
      totalIncidents: 1000,
      attackCategories: 10,
      trainSamples: 800,
      validationSamples: 100,
      testSamples: 100,
      modelsEvaluated: runs.length,
      bestAccuracy: best.accuracy,
      bestMacroF1: best.f1,
      bestExperiment: best.model,
    },
    leaderboard,
    runs,
    datasetStatistics: JSON.parse(statsRaw),
    classLabels: [...CLASS_LABELS],
  };

  await writeFile(
    path.join(ROOT, "aggregates.json"),
    JSON.stringify(aggregates, null, 2),
  );

  console.log(`Wrote aggregates.json (${runs.length} runs, best: ${best.model})`);
}

build().catch((err) => {
  console.error(err);
  process.exit(1);
});
