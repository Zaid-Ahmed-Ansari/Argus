import type { ExperimentCategory } from "@/types/experiment";
import type { ScenarioDifficulty } from "@/services/eval/ground-truth";

export type ResearchScenario = {
  id: string;
  name: string;
  description: string;
  mitre: string[];
  severity: string;
  difficulty: ScenarioDifficulty;
  logLines: number;
  sources: string;
};

export type ResearchQuestion = {
  id: string;
  question: string;
  experiments: string[];
};

export type PlannedExperiment = {
  id: string;
  name: string;
  category: ExperimentCategory;
  status: "active" | "planned";
  configFile?: string;
};

export const RESEARCH_SCENARIOS: ResearchScenario[] = [
  {
    id: "brute_force",
    name: "Brute Force",
    description:
      "Repeated failed SSH logins against privileged accounts followed by a successful authentication from the same source IP.",
    mitre: ["T1110.001"],
    severity: "HIGH",
    difficulty: "easy",
    logLines: 10,
    sources: "sshd",
  },
  {
    id: "password_spray",
    name: "Password Spray",
    description:
      "Single source IP attempts one password against many distinct user accounts within a short window.",
    mitre: ["T1110.003"],
    severity: "HIGH",
    difficulty: "easy",
    logLines: 12,
    sources: "sshd, auth",
  },
  {
    id: "credential_stuffing",
    name: "Credential Stuffing",
    description:
      "Distributed IPs replay a breached credential pair across SSH and web login endpoints.",
    mitre: ["T1110.004"],
    severity: "HIGH",
    difficulty: "medium",
    logLines: 14,
    sources: "sshd, nginx",
  },
  {
    id: "privilege_escalation",
    name: "Privilege Escalation",
    description:
      "Low-privilege web service account abuses sudo and setuid binaries to obtain root access.",
    mitre: ["T1548"],
    severity: "CRITICAL",
    difficulty: "medium",
    logLines: 11,
    sources: "sudo, auditd",
  },
  {
    id: "lateral_movement",
    name: "Lateral Movement",
    description:
      "Service account pivots across internal hosts via SMB and RDP within minutes.",
    mitre: ["T1021"],
    severity: "HIGH",
    difficulty: "hard",
    logLines: 13,
    sources: "smb, rdp, winlog",
  },
  {
    id: "suspicious_admin_activity",
    name: "Suspicious Admin Activity",
    description:
      "Privileged admin performs off-hours destructive commands: firewall flush, user deletion, audit stop.",
    mitre: ["T1078.004"],
    severity: "HIGH",
    difficulty: "medium",
    logLines: 10,
    sources: "auditd, bash",
  },
  {
    id: "account_takeover",
    name: "Account Takeover",
    description:
      "Impossible travel, MFA fatigue, and malicious inbox rules indicate compromised user account.",
    mitre: ["T1078"],
    severity: "CRITICAL",
    difficulty: "hard",
    logLines: 12,
    sources: "okta, exchange, vpn",
  },
  {
    id: "data_exfiltration",
    name: "Data Exfiltration",
    description:
      "Service account uploads labeled finance data to rare external destination at high volume.",
    mitre: ["T1041"],
    severity: "CRITICAL",
    difficulty: "hard",
    logLines: 11,
    sources: "proxy, firewall, dlp",
  },
  {
    id: "web_shell",
    name: "Web Shell Activity",
    description:
      "Attacker uploads and invokes PHP web shell with remote command execution parameters.",
    mitre: ["T1505.003"],
    severity: "CRITICAL",
    difficulty: "medium",
    logLines: 10,
    sources: "apache, waf",
  },
  {
    id: "insider_threat",
    name: "Insider Threat",
    description:
      "Departing employee bulk-accesses HR/legal files, copies to USB, and syncs to personal cloud.",
    mitre: ["T1530"],
    severity: "HIGH",
    difficulty: "hard",
    logLines: 12,
    sources: "file audit, edr, dlp",
  },
];

export const RESEARCH_QUESTIONS: ResearchQuestion[] = [
  {
    id: "RQ1",
    question:
      "Does Retrieval-Augmented Generation improve LLM-based SOC triage accuracy across diverse attack scenarios?",
    experiments: ["exp-002-rag-vs-no-rag", "exp-004-scenario-benchmark"],
  },
  {
    id: "RQ2",
    question:
      "Do structured security events improve attack classification compared to raw logs?",
    experiments: ["exp-003-raw-vs-structured", "exp-005-rag-input-matrix"],
  },
  {
    id: "RQ3",
    question:
      "Can LLMs reliably map incidents to MITRE ATT&CK techniques from sparse log evidence?",
    experiments: ["exp-002-rag-vs-no-rag", "exp-004-scenario-benchmark"],
  },
  {
    id: "RQ4",
    question:
      "Does hybrid (FTS + semantic) retrieval outperform no retrieval for recommendation quality?",
    experiments: ["exp-002-rag-vs-no-rag"],
  },
  {
    id: "RQ5",
    question:
      "How does hallucination rate vary by scenario difficulty (easy vs hard fixtures)?",
    experiments: ["exp-004-scenario-benchmark"],
  },
  {
    id: "RQ6",
    question:
      "Can LLMs distinguish password spray from brute force using authentication logs alone?",
    experiments: ["exp-004-scenario-benchmark"],
  },
  {
    id: "RQ7",
    question:
      "Does combining RAG and structured input produce additive gains over either alone?",
    experiments: ["exp-005-rag-input-matrix"],
  },
  {
    id: "RQ8",
    question:
      "Are LLM-generated investigation timelines complete enough for analyst handoff?",
    experiments: ["exp-003-raw-vs-structured"],
  },
  {
    id: "RQ9",
    question:
      "Do playbook-aligned recommendations score higher under ground-truth theme evaluation?",
    experiments: ["exp-002-rag-vs-no-rag"],
  },
  {
    id: "RQ10",
    question:
      "Which attack scenarios produce the lowest attack-type accuracy (failure analysis)?",
    experiments: ["exp-004-scenario-benchmark"],
  },
  {
    id: "RQ11",
    question:
      "Is severity classification more reliable than attack-type classification across scenarios?",
    experiments: ["exp-004-scenario-benchmark"],
  },
  {
    id: "RQ12",
    question:
      "Does RAG reduce fabricated attack types (hallucination rate) on hard scenarios?",
    experiments: ["exp-002-rag-vs-no-rag"],
  },
  {
    id: "RQ13",
    question:
      "What is the latency cost of hybrid retrieval per scenario at fixed log volume?",
    experiments: ["exp-002-rag-vs-no-rag"],
  },
  {
    id: "RQ14",
    question:
      "Can analyst utility score serve as a composite proxy for human-judged triage quality?",
    experiments: ["exp-004-scenario-benchmark"],
  },
  {
    id: "RQ15",
    question:
      "How stable are cross-scenario benchmarks when re-run on the same fixtures?",
    experiments: ["exp-004-scenario-benchmark"],
  },
];

export const METRIC_DEFINITIONS: { key: string; label: string; description: string }[] = [
  {
    key: "accuracy",
    label: "Composite Accuracy",
    description:
      "Weighted blend of severity, attack type, keywords, timeline, MITRE, investigation, and triage scores.",
  },
  {
    key: "attack_type_accuracy",
    label: "Attack Type Accuracy",
    description: "Token overlap and exact match against labeled attackType.",
  },
  {
    key: "severity_accuracy",
    label: "Severity Accuracy",
    description: "Exact match on LOW / MEDIUM / HIGH / CRITICAL.",
  },
  {
    key: "mitre_mapping_accuracy",
    label: "MITRE Mapping Accuracy",
    description: "Fraction of expected technique IDs mentioned in model output.",
  },
  {
    key: "investigation_quality",
    label: "Investigation Quality",
    description: "Timeline depth, keyword coverage, and entity recall in analysis.",
  },
  {
    key: "recommendation_quality",
    label: "Recommendation Quality",
    description: "Overlap with expected SOC playbook themes (block, MFA, isolate, etc.).",
  },
  {
    key: "triage_completeness",
    label: "Triage Completeness",
    description: "Whether all required output fields are populated meaningfully.",
  },
  {
    key: "analyst_utility_score",
    label: "Analyst Utility Score",
    description:
      "Human-proxy composite: accuracy + investigation + recommendations − hallucination.",
  },
  {
    key: "hallucination_rate",
    label: "Hallucination Rate",
    description: "Fraction of forbidden attack terms incorrectly present (lower is better).",
  },
  {
    key: "latency_ms",
    label: "Latency",
    description: "Wall-clock analysis time in milliseconds.",
  },
];

export const PLANNED_EXPERIMENTS: PlannedExperiment[] = [
  { id: "exp-002", name: "RAG vs No RAG", category: "rag", status: "active", configFile: "rag-vs-no-rag.json" },
  { id: "exp-003", name: "Raw vs Structured", category: "input", status: "active", configFile: "raw-vs-structured.json" },
  { id: "exp-004", name: "Cross-Scenario Benchmark", category: "scenario", status: "active", configFile: "scenario-benchmark.json" },
  { id: "exp-005", name: "RAG × Input Matrix", category: "rag", status: "active", configFile: "rag-input-combined.json" },
  { id: "M1", name: "Gemini Flash vs Pro", category: "model", status: "planned" },
  { id: "P1", name: "Zero-shot vs Few-shot", category: "prompt", status: "planned" },
  { id: "P2", name: "Chain-of-Thought", category: "prompt", status: "planned" },
  { id: "R2", name: "FTS vs Vector vs Hybrid", category: "rag", status: "planned" },
  { id: "K1", name: "MITRE-only RAG", category: "knowledge", status: "planned" },
  { id: "A1", name: "LLM + Log Search Tool", category: "agent", status: "planned" },
];

export const CATEGORY_LABELS: Record<ExperimentCategory, string> = {
  rag: "RAG Experiments",
  input: "Input Engineering",
  scenario: "Scenario Benchmarks",
  prompt: "Prompt Engineering",
  model: "Model Comparison",
  knowledge: "Security Knowledge",
  agent: "Agent / Tools",
};

export const PAPER_SECTIONS = [
  { title: "Abstract", summary: "LLM-assisted SOC triage with hybrid RAG across 10 labeled attack scenarios." },
  { title: "Introduction", summary: "Analyst overload, copilot opportunities, and measurable research contributions." },
  { title: "Related Work", summary: "LLMs in cybersecurity, RAG, MITRE ATT&CK knowledge bases, SOC automation." },
  { title: "Methodology", summary: "Argus architecture, ground-truth construction, metric definitions." },
  { title: "Experimental Design", summary: "10 scenarios × 4 active experiment axes, batch evaluation protocol." },
  { title: "Results", summary: "Per-scenario accuracy tables, RAG gains, failure case analysis." },
  { title: "Discussion", summary: "When RAG helps, trust requirements, human-in-the-loop implications." },
  { title: "Limitations", summary: "Synthetic logs, single primary model, keyword-based ground truth." },
  { title: "Future Work", summary: "Real SIEM data, fine-tuned models, multi-agent investigation." },
];
