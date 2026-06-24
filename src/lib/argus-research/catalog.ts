import type {
  ArgusAttackCategory,
  ArgusDatasetVariant,
  ExperimentFamily,
  ReportSection,
} from "@/lib/argus-research/types";

export const RESEARCH_POSITIONING =
  "A research initiative investigating how modern LLMs, Retrieval-Augmented Generation, and parameter-efficient fine-tuning can improve automated Security Operations Center incident triage.";

export const RESEARCH_LIMITATIONS =
  "Results were obtained on a synthetic benchmark of 1000 SOC incidents. While the benchmark demonstrates the effectiveness of retrieval-augmented prompting and parameter-efficient fine-tuning for structured incident classification, future work includes evaluation on larger real-world SOC datasets, adversarial incidents, and cross-domain generalization benchmarks.";

export const BASE_MODEL = "unsloth/Qwen3-4B-unsloth-bnb-4bit";

export const LORA_CONFIG = "rank 16, alpha 32, 4-bit quantization (Unsloth)";

export const CATEGORY_DESCRIPTIONS: Record<ArgusAttackCategory, string> = {
  "Benign Activity":
    "Normal user authentication, VPN, and application activity without malicious indicators.",
  "Brute Force":
    "Repeated failed authentication attempts against privileged accounts from a single source.",
  "Password Spray":
    "Low-and-slow attempts across many accounts using common passwords.",
  "Credential Stuffing":
    "Distributed replay of breached username-password pairs across services.",
  Reconnaissance:
    "Port scanning, probing, and pre-attack discovery against internal assets.",
  "Privilege Escalation":
    "Abuse of sudo, setuid binaries, or misconfigurations to obtain elevated access.",
  "Defense Evasion":
    "Log clearing, audit tampering, and techniques to hide attacker presence.",
  "Malware Execution":
    "Suspicious process creation, script execution, and endpoint compromise signals.",
  "Data Exfiltration":
    "Large outbound transfers to rare external destinations after compromise.",
  "Insider Threat":
    "Authorized users abnormally accessing or exporting sensitive data.",
};

export const TELEMETRY_SOURCE_LABELS: Record<string, string> = {
  ssh: "SSH",
  sysmon: "Sysmon",
  firewall: "Firewall",
  vpn: "VPN",
  apache: "Web Logs",
  windows_event: "Windows Events",
  cloudtrail: "CloudTrail",
  m365: "M365",
  suricata: "Suricata IDS",
  azure_ad: "Azure AD",
  nginx: "Nginx",
  dlp: "DLP",
  casb: "CASB",
  hr_feed: "HR Feed",
};

export const VARIANT_LABELS: Record<ArgusDatasetVariant, string> = {
  raw: "Raw Logs",
  condensed: "Condensed Events",
  rag: "RAG Enhanced",
};

export const PRIMARY_RESEARCH_QUESTIONS = [
  {
    id: "RQ1",
    question: "Does RAG improve cybersecurity incident classification?",
    methodology:
      "Compare Base Raw vs Base RAG accuracy and F1 on the 50-sample balanced test split.",
  },
  {
    id: "RQ2",
    question: "Do condensed events outperform raw logs?",
    methodology:
      "Compare token-reduced condensed input against full raw telemetry at equal model capacity.",
  },
  {
    id: "RQ3",
    question: "How effective is LoRA fine-tuning for SOC triage?",
    methodology:
      "Compare Base vs LoRA variants across all three dataset representations.",
  },
  {
    id: "RQ4",
    question: "Which attack classes are easiest to classify?",
    methodology:
      "Rank per-class accuracy across all six model runs.",
  },
  {
    id: "RQ5",
    question: "Which attack classes remain challenging?",
    methodology:
      "Identify classes with lowest per-class accuracy and highest confusion pairs.",
  },
  {
    id: "RQ6",
    question: "How much does structured output improve reliability?",
    methodology:
      "Measure UNPARSED response rate and JSON compliance across raw vs condensed/RAG inputs.",
  },
  {
    id: "RQ7",
    question: "Can compact models achieve production-ready SOC performance?",
    methodology:
      "Evaluate Qwen3-4B (4-bit) with LoRA on condensed and RAG-enhanced datasets.",
  },
  {
    id: "RQ8",
    question: "How does retrieval affect classification accuracy?",
    methodology:
      "Isolate retrieval effect: Base Raw vs Base Condensed vs Base RAG.",
  },
] as const;

export const EXPERIMENT_FAMILIES: ExperimentFamily[] = [
  {
    id: "family-a",
    name: "Dataset Representation",
    description:
      "Compare raw telemetry, condensed events, and RAG-enhanced context as model inputs.",
    experiments: [
      {
        id: "exp-a-raw",
        familyId: "family-a",
        name: "Raw Logs",
        goal: "Establish baseline classification on full multi-source telemetry.",
        dataset: "argus_raw_v2 (1000 incidents)",
        model: BASE_MODEL,
        methodology:
          "Full log text (~964 avg tokens) with structured JSON output prompt.",
        metrics: "Accuracy, Precision, Recall, F1, per-class accuracy",
        findings: "",
      },
      {
        id: "exp-a-condensed",
        familyId: "family-a",
        name: "Condensed Events",
        goal: "Test whether 90% token reduction preserves classification signal.",
        dataset: "argus_condensed_v2 (1000 incidents)",
        model: BASE_MODEL,
        methodology:
          "Aggregated event summaries (~96 avg tokens) with same label schema.",
        metrics: "Accuracy, Precision, Recall, F1, per-class accuracy",
        findings: "",
      },
      {
        id: "exp-a-rag",
        familyId: "family-a",
        name: "RAG Enhanced",
        goal: "Inject MITRE/playbook context alongside incident telemetry.",
        dataset: "argus_rag_v2 (1000 incidents)",
        model: BASE_MODEL,
        methodology:
          "Condensed telemetry plus retrieved security knowledge (~136 avg tokens).",
        metrics: "Accuracy, Precision, Recall, F1, per-class accuracy",
        findings: "",
      },
    ],
  },
  {
    id: "family-b",
    name: "Model Comparison",
    description:
      "Compare zero-shot base Qwen3-4B against LoRA fine-tuned adapters.",
    experiments: [
      {
        id: "exp-b-base",
        familyId: "family-b",
        name: "Base Qwen3",
        goal: "Measure out-of-the-box SOC classification without fine-tuning.",
        dataset: "All three variants",
        model: BASE_MODEL,
        methodology: "Prompt-only classification with JSON output constraint.",
        metrics: "Accuracy, F1 across raw/condensed/RAG",
        findings: "",
      },
      {
        id: "exp-b-lora-raw",
        familyId: "family-b",
        name: "LoRA Fine-Tuned (Raw)",
        goal: "Assess LoRA on full telemetry.",
        dataset: "argus_raw_v2 train split (800)",
        model: `${BASE_MODEL} + LoRA (${LORA_CONFIG})`,
        methodology: "SFT on raw logs with attack_type JSON labels.",
        metrics: "Accuracy, F1, parse failure rate",
        findings: "",
      },
      {
        id: "exp-b-lora-condensed",
        familyId: "family-b",
        name: "LoRA Fine-Tuned (Condensed)",
        goal: "Assess LoRA on token-efficient condensed events.",
        dataset: "argus_condensed_v2 train split (800)",
        model: `${BASE_MODEL} + LoRA (${LORA_CONFIG})`,
        methodology: "SFT on condensed events — best VRAM efficiency.",
        metrics: "Accuracy, F1 (target: 100% on test split)",
        findings: "",
      },
      {
        id: "exp-b-lora-rag",
        familyId: "family-b",
        name: "LoRA Fine-Tuned (RAG)",
        goal: "Combine fine-tuning with retrieval-augmented context.",
        dataset: "argus_rag_v2 train split (800)",
        model: `${BASE_MODEL} + LoRA (${LORA_CONFIG})`,
        methodology: "SFT on RAG-enhanced incidents with playbook context.",
        metrics: "Accuracy, F1 (target: 100% on test split)",
        findings: "",
      },
    ],
  },
  {
    id: "family-c",
    name: "Prompting & Output Structure",
    description:
      "Evaluate structured JSON output reliability and parsing consistency.",
    experiments: [
      {
        id: "exp-c-json",
        familyId: "family-c",
        name: "Structured JSON Output",
        goal: "Enforce machine-parseable attack_type classification.",
        dataset: "Test split (50 samples)",
        model: "All six configurations",
        methodology:
          'System prompt requires {"attack_type":"..."} only — no markdown or chain-of-thought.',
        metrics: "Parse failure rate, UNPARSED count",
        findings: "",
      },
      {
        id: "exp-c-consistency",
        familyId: "family-c",
        name: "Classification Consistency",
        goal: "Measure label stability across input representations.",
        dataset: "Paired raw/condensed/RAG incidents",
        model: "Base and LoRA",
        methodology:
          "Same incident ID evaluated under three representation variants.",
        metrics: "Cross-variant agreement rate",
        findings: "",
      },
    ],
  },
];

export const REPORT_SECTIONS: ReportSection[] = [
  {
    id: "abstract",
    title: "Abstract",
    summary: "ARGUS-1000: LLM, RAG, and LoRA for SOC incident classification.",
  },
  {
    id: "introduction",
    title: "Introduction",
    summary: "SOC analyst overload and the case for AI-assisted triage.",
  },
  {
    id: "problem",
    title: "Problem Statement",
    summary: "Automated multi-class incident classification from security telemetry.",
  },
  {
    id: "dataset",
    title: "Dataset Construction",
    summary: "1000 synthetic incidents, 10 classes, 3 representations, stratified splits.",
  },
  {
    id: "methodology",
    title: "Methodology",
    summary: "Data pipeline, RAG injection, LoRA fine-tuning, evaluation protocol.",
  },
  {
    id: "setup",
    title: "Experimental Setup",
    summary: "Qwen3-4B base, 6 model×dataset configurations, 50-sample test set.",
  },
  {
    id: "architecture",
    title: "Model Architecture",
    summary: `${BASE_MODEL} with ${LORA_CONFIG}.`,
  },
  {
    id: "metrics",
    title: "Evaluation Metrics",
    summary: "Accuracy, Precision, Recall, F1, confusion matrix, per-class accuracy.",
  },
  {
    id: "results",
    title: "Results",
    summary: "Leaderboard and per-class analysis from evaluation runs.",
  },
  {
    id: "discussion",
    title: "Discussion",
    summary: "When RAG and LoRA help; implications for SOC automation.",
  },
  {
    id: "limitations",
    title: "Limitations",
    summary: "Synthetic data, 50-sample test set, parse failures on raw input.",
  },
  {
    id: "future",
    title: "Future Work",
    summary: "Real SIEM data, larger models, multi-label MITRE mapping.",
  },
  {
    id: "references",
    title: "References",
    summary: "MITRE ATT&CK, LoRA, RAG, Qwen3, SOC automation literature.",
  },
];

export const PROGRESS_STEPS = [
  {
    id: "dataset",
    label: "ARGUS-1000 dataset",
    status: "complete" as const,
    detail: "1000 incidents · 10 classes · 3 variants",
  },
  {
    id: "baseline",
    label: "Base model evaluation",
    status: "complete" as const,
    detail: "Qwen3-4B on raw, condensed, RAG",
  },
  {
    id: "lora",
    label: "LoRA fine-tuning",
    status: "complete" as const,
    detail: "Adapters per dataset variant",
  },
  {
    id: "eval",
    label: "Benchmark & analysis",
    status: "complete" as const,
    detail: "Confusion matrices · per-class metrics",
  },
  {
    id: "opensource",
    label: "Open-source model roadmap",
    status: "active" as const,
    detail: "Production deployment evaluation",
  },
];

export const EXPERIMENT_PROGRESSION = [
  { stage: "Raw Logs", detail: "Full telemetry baseline" },
  { stage: "Condensed", detail: "90% token reduction" },
  { stage: "RAG Enhanced", detail: "Knowledge injection" },
  { stage: "LoRA", detail: "Parameter-efficient fine-tuning" },
];
