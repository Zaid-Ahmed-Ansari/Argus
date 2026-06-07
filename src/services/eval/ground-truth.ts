import { readFile } from "node:fs/promises";
import path from "node:path";
import type { GroundTruthSpec } from "@/services/eval/metrics";

export type ScenarioDifficulty = "easy" | "medium" | "hard";

export type EvalFixture = {
  fixtureId: string;
  scenario: string;
  difficulty: ScenarioDifficulty;
  logFile: string;
  groundTruth: GroundTruthSpec;
};

export type FixtureIndexEntry = {
  id: string;
  scenario: string;
  difficulty: ScenarioDifficulty;
  mitre: string[];
};

const FIXTURE_IDS = [
  "brute_force",
  "password_spray",
  "credential_stuffing",
  "privilege_escalation",
  "lateral_movement",
  "suspicious_admin_activity",
  "account_takeover",
  "data_exfiltration",
  "web_shell",
  "insider_threat",
] as const;

export type FixtureId = (typeof FIXTURE_IDS)[number];

export const DEFAULT_FIXTURE_ID: FixtureId = "brute_force";

function fixturePath(fixtureId: string): string {
  return path.join(
    process.cwd(),
    "datasets",
    fixtureId,
    "ground-truth.json",
  );
}

export async function loadEvalFixture(
  fixtureId: string = DEFAULT_FIXTURE_ID,
): Promise<EvalFixture> {
  const filePath = fixturePath(fixtureId);
  const raw = await readFile(filePath, "utf-8");
  return JSON.parse(raw) as EvalFixture;
}

export async function loadAllEvalFixtures(): Promise<EvalFixture[]> {
  return Promise.all(FIXTURE_IDS.map((id) => loadEvalFixture(id)));
}

export async function loadFixtureIndex(): Promise<FixtureIndexEntry[]> {
  const indexPath = path.join(
    process.cwd(),
    "datasets",
    "eval",
    "fixtures-index.json",
  );
  const raw = await readFile(indexPath, "utf-8");
  const parsed = JSON.parse(raw) as { fixtures: FixtureIndexEntry[] };
  return parsed.fixtures;
}

export async function loadEvalLogs(fixture: EvalFixture): Promise<string> {
  const filePath = path.join(process.cwd(), fixture.logFile);
  return readFile(filePath, "utf-8");
}

export function isValidFixtureId(id: string): id is FixtureId {
  return (FIXTURE_IDS as readonly string[]).includes(id);
}

export function getFixtureIds(): readonly FixtureId[] {
  return FIXTURE_IDS;
}
