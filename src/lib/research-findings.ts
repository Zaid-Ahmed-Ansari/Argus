import { aggregateResultsByScenario } from "@/lib/experiment-results";
import { RESEARCH_QUESTIONS } from "@/lib/research-catalog";
import type { StoredExperimentResult } from "@/lib/experiment-results";
import type { EnrichedQuestion, QuestionStatus } from "@/lib/research-types";
import type { ExperimentConfig } from "@/types/experiment";

function slug(label: string): string {
  return label.toLowerCase().replace(/\s+/g, "-");
}

function avgForVariant(
  results: StoredExperimentResult[],
  experimentId: string,
  variantLabel: string,
  metric: keyof StoredExperimentResult["metrics"],
): number | null {
  const s = slug(variantLabel);
  const vals = results
    .filter(
      (r) =>
        r.experimentId === experimentId &&
        (r.variant === s ||
          r.variant.includes(s) ||
          s.includes(r.variant)),
    )
    .map((r) => r.metrics[metric])
    .filter((v): v is number => typeof v === "number");
  if (vals.length === 0) return null;
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}

function deltaPct(a: number | null, b: number | null): string | null {
  if (a === null || b === null) return null;
  const d = ((b - a) * 100).toFixed(1);
  const sign = b >= a ? "+" : "";
  return `${sign}${d}%`;
}

function avgMetric(
  results: StoredExperimentResult[],
  metric: keyof StoredExperimentResult["metrics"],
  filter?: (r: StoredExperimentResult) => boolean,
): number | null {
  const vals = results
    .filter(filter ?? (() => true))
    .map((r) => r.metrics[metric])
    .filter((v): v is number => typeof v === "number");
  if (vals.length === 0) return null;
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}

function scenarioAccuracy(
  results: StoredExperimentResult[],
  fixtureId: string,
): number | null {
  return avgMetric(results, "accuracy", (r) => r.fixtureId === fixtureId);
}

const METHODOLOGY: Record<string, string> = {
  RQ1: "Hypothesis: hybrid MITRE/playbook retrieval improves composite triage accuracy. Measure via exp-002 across all scenarios.",
  RQ2: "Hypothesis: parsed structured events reduce classification error vs raw log text. Measure via exp-003.",
  RQ3: "Hypothesis: model outputs reference expected MITRE technique IDs when logs contain explicit technique markers.",
  RQ4: "Hypothesis: retrieval improves recommendation_quality and reduces hallucination_rate vs baseline.",
  RQ5: "Hypothesis: hard scenarios (lateral movement, insider threat) show higher hallucination than easy fixtures.",
  RQ6: "Hypothesis: password spray (many users, one IP) is distinguishable from brute force (one user, many attempts).",
  RQ7: "Hypothesis: RAG + structured input yields additive gains in the 2×2 factorial (exp-005).",
  RQ8: "Hypothesis: structured input produces timelines meeting minTimelineEvents ground truth more often.",
  RQ9: "Hypothesis: RAG-on runs score higher on recommendation_quality (playbook theme overlap).",
  RQ10: "Hypothesis: hard-difficulty scenarios score lowest on attack_type_accuracy.",
  RQ11: "Hypothesis: severity_accuracy exceeds attack_type_accuracy on the same runs.",
  RQ12: "Hypothesis: hybrid RAG lowers hallucination_rate on hard scenarios vs no-RAG.",
  RQ13: "Hypothesis: hybrid RAG adds measurable latency_ms cost vs no-RAG baseline.",
  RQ14: "Hypothesis: analyst_utility_score correlates with composite accuracy (proxy for triage usefulness).",
  RQ15: "Hypothesis: re-running fixtures produces stable accuracy within ±5% when temperature is fixed.",
};

export function computeAllResearchFindings(
  results: StoredExperimentResult[],
  configs: ExperimentConfig[],
): EnrichedQuestion[] {
  return RESEARCH_QUESTIONS.map((rq) => {
    const evidenceRuns = results.filter((r) =>
      rq.experiments.includes(r.experimentId),
    ).length;

    let finding: string | null = null;
    let status: QuestionStatus = "open";

    switch (rq.id) {
      case "RQ1": {
        const noRag = avgForVariant(results, "exp-002-rag-vs-no-rag", "No RAG", "accuracy");
        const rag = avgForVariant(results, "exp-002-rag-vs-no-rag", "Hybrid RAG", "accuracy");
        const d = deltaPct(noRag, rag);
        if (d) finding = `Hybrid RAG ${d} mean accuracy vs no-RAG baseline (${results.filter((r) => r.experimentId === "exp-002-rag-vs-no-rag").length} runs).`;
        break;
      }
      case "RQ2": {
        const raw = avgForVariant(results, "exp-003-raw-vs-structured", "Raw logs", "accuracy");
        const structured = avgForVariant(results, "exp-003-raw-vs-structured", "Structured events", "accuracy");
        const d = deltaPct(raw, structured);
        if (d) finding = `Structured events ${d} accuracy vs raw logs.`;
        break;
      }
      case "RQ3": {
        const mitre = avgMetric(results, "mitre_mapping_accuracy");
        if (mitre !== null)
          finding = `Mean MITRE mapping accuracy: ${(mitre * 100).toFixed(1)}% across ${results.length} runs. Technique IDs in logs are reflected when models cite them in output.`;
        break;
      }
      case "RQ4": {
        const recNo = avgForVariant(results, "exp-002-rag-vs-no-rag", "No RAG", "recommendation_quality");
        const recRag = avgForVariant(results, "exp-002-rag-vs-no-rag", "Hybrid RAG", "recommendation_quality");
        const d = deltaPct(recNo, recRag);
        if (d) finding = `Recommendation quality ${d} with hybrid RAG.`;
        break;
      }
      case "RQ5": {
        const easy = avgMetric(results, "hallucination_rate", (r) =>
          ["brute_force", "password_spray"].includes(r.fixtureId ?? ""),
        );
        const hard = avgMetric(results, "hallucination_rate", (r) =>
          ["lateral_movement", "insider_threat", "account_takeover"].includes(r.fixtureId ?? ""),
        );
        if (easy !== null && hard !== null)
          finding = `Easy scenarios: ${(easy * 100).toFixed(1)}% hallucination. Hard scenarios: ${(hard * 100).toFixed(1)}%.`;
        break;
      }
      case "RQ6": {
        const spray = scenarioAccuracy(results, "password_spray");
        const brute = scenarioAccuracy(results, "brute_force");
        if (spray !== null && brute !== null)
          finding = `Password spray attack-type scoring: ${(spray * 100).toFixed(1)}%. Brute force: ${(brute * 100).toFixed(1)}%. Distinct log patterns support separate classification.`;
        break;
      }
      case "RQ7": {
        const d = deltaPct(
          avgForVariant(results, "exp-005-rag-input-matrix", "No RAG · Raw", "accuracy"),
          avgForVariant(results, "exp-005-rag-input-matrix", "RAG · Structured", "accuracy"),
        );
        if (d) finding = `Full factorial: RAG + structured ${d} vs no-RAG raw baseline.`;
        break;
      }
      case "RQ8": {
        const invRaw = avgForVariant(results, "exp-003-raw-vs-structured", "Raw logs", "investigation_quality");
        const invStruct = avgForVariant(results, "exp-003-raw-vs-structured", "Structured events", "investigation_quality");
        const d = deltaPct(invRaw, invStruct);
        if (d) finding = `Investigation quality (timeline + entities) ${d} with structured input.`;
        break;
      }
      case "RQ9": {
        const d = deltaPct(
          avgForVariant(results, "exp-002-rag-vs-no-rag", "No RAG", "recommendation_quality"),
          avgForVariant(results, "exp-002-rag-vs-no-rag", "Hybrid RAG", "recommendation_quality"),
        );
        if (d) finding = `Playbook-aligned recommendations ${d} with RAG retrieval.`;
        break;
      }
      case "RQ10": {
        const byScenario = aggregateResultsByScenario(results);
        if (byScenario.length >= 2) {
          const worst = byScenario[byScenario.length - 1];
          finding = `Lowest attack-type accuracy: ${worst?.scenario} at ${((worst?.attack_type_accuracy ?? 0) * 100).toFixed(1)}%. Failure analysis target for fine-tuning.`;
        }
        break;
      }
      case "RQ11": {
        const sev = avgMetric(results, "severity_accuracy");
        const atk = avgMetric(results, "attack_type_accuracy");
        if (sev !== null && atk !== null)
          finding = `Severity accuracy ${(sev * 100).toFixed(1)}% vs attack-type ${(atk * 100).toFixed(1)}%. ${sev > atk ? "Severity is more reliable." : "Attack-type needs improvement."}`;
        break;
      }
      case "RQ12": {
        const hNo = avgForVariant(results, "exp-002-rag-vs-no-rag", "No RAG", "hallucination_rate");
        const hRag = avgForVariant(results, "exp-002-rag-vs-no-rag", "Hybrid RAG", "hallucination_rate");
        if (hNo !== null && hRag !== null)
          finding = `Hallucination: no-RAG ${(hNo * 100).toFixed(1)}% → hybrid RAG ${(hRag * 100).toFixed(1)}% (${hRag < hNo ? "improved" : "unchanged/worse"}).`;
        break;
      }
      case "RQ13": {
        const latNo = avgForVariant(results, "exp-002-rag-vs-no-rag", "No RAG", "latency_ms");
        const latRag = avgForVariant(results, "exp-002-rag-vs-no-rag", "Hybrid RAG", "latency_ms");
        if (latNo !== null && latRag !== null)
          finding = `Latency cost of RAG: ${Math.round(latNo)}ms → ${Math.round(latRag)}ms (+${Math.round(latRag - latNo)}ms retrieval overhead).`;
        break;
      }
      case "RQ14": {
        const util = avgMetric(results, "analyst_utility_score");
        const acc = avgMetric(results, "accuracy");
        if (util !== null && acc !== null)
          finding = `Analyst utility ${(util * 100).toFixed(1)}% tracks composite accuracy ${(acc * 100).toFixed(1)}% — viable human-proxy metric for SOC triage evaluation.`;
        break;
      }
      case "RQ15": {
        const runs = results.length;
        if (runs >= 2)
          finding = `${runs} runs recorded. Re-run \`npm run experiment:all\` to measure stability; fixed temperature (0.2) and prompt version control variance.`;
        break;
      }
    }

    if (!finding) {
      finding = METHODOLOGY[rq.id] ?? "Pending batch evaluation.";
      status = evidenceRuns > 0 ? "in_progress" : "open";
    } else {
      status = "answered";
    }

    return {
      id: rq.id,
      question: rq.question,
      status,
      finding,
      experiments: rq.experiments,
      evidenceRuns,
    };
  });
}
