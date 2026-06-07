export class LlmJsonParseError extends Error {
  constructor(
    message: string,
    readonly rawPreview?: string,
  ) {
    super(message);
    this.name = "LlmJsonParseError";
  }
}

function stripCodeFence(raw: string): string {
  const trimmed = raw.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  return fenced?.[1]?.trim() ?? trimmed;
}

/** Walk from first `{` and return the balanced object substring. */
function extractBalancedObject(text: string): string | null {
  const start = text.indexOf("{");
  if (start === -1) return null;

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let i = start; i < text.length; i++) {
    const ch = text[i];

    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (ch === "\\") {
        escaped = true;
      } else if (ch === '"') {
        inString = false;
      }
      continue;
    }

    if (ch === '"') {
      inString = true;
      continue;
    }

    if (ch === "{") depth++;
    if (ch === "}") {
      depth--;
      if (depth === 0) {
        return text.slice(start, i + 1);
      }
    }
  }

  return null;
}

function repairCommonJsonIssues(json: string): string {
  let repaired = json.trim();

  // Smart quotes → ASCII
  repaired = repaired.replace(/[\u201C\u201D]/g, '"');

  // Trailing commas before } or ]
  repaired = repaired.replace(/,\s*([}\]])/g, "$1");

  // Remove stray control chars outside strings (rare Gemini glitch)
  repaired = repaired.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "");

  return repaired;
}

/** Close brackets if the model truncated mid-response. */
function closeTruncatedObject(json: string): string {
  let inString = false;
  let escaped = false;
  const stack: ("{" | "[")[] = [];

  for (let i = 0; i < json.length; i++) {
    const ch = json[i];

    if (inString) {
      if (escaped) escaped = false;
      else if (ch === "\\") escaped = true;
      else if (ch === '"') inString = false;
      continue;
    }

    if (ch === '"') {
      inString = true;
      continue;
    }

    if (ch === "{") stack.push("{");
    else if (ch === "[") stack.push("[");
    else if (ch === "}" && stack.at(-1) === "{") stack.pop();
    else if (ch === "]" && stack.at(-1) === "[") stack.pop();
  }

  let closed = json;
  if (inString) closed += '"';

  while (stack.length > 0) {
    const open = stack.pop();
    closed += open === "{" ? "}" : "]";
  }

  return closed;
}

function tryParse<T>(json: string): T | null {
  try {
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}

function candidatesFromRaw(raw: string): string[] {
  const base = stripCodeFence(raw);
  const extracted = extractBalancedObject(base);
  const slice =
    extracted ??
    (() => {
      const start = base.indexOf("{");
      const end = base.lastIndexOf("}");
      if (start === -1 || end === -1 || end <= start) return null;
      return base.slice(start, end + 1);
    })();

  if (!slice) return [];

  const repaired = repairCommonJsonIssues(slice);
  const truncated = repairCommonJsonIssues(closeTruncatedObject(slice));

  return [...new Set([slice, repaired, truncated])];
}

export function parseLlmJson<T>(raw: string): T {
  if (!raw.trim()) {
    throw new LlmJsonParseError("LLM response was empty");
  }

  const candidates = candidatesFromRaw(raw);
  if (candidates.length === 0) {
    throw new LlmJsonParseError(
      "LLM response did not contain a JSON object",
      raw.slice(0, 500),
    );
  }

  let lastError: unknown;
  for (const candidate of candidates) {
    const parsed = tryParse<T>(candidate);
    if (parsed !== null) {
      return parsed;
    }
    try {
      JSON.parse(candidate);
    } catch (error) {
      lastError = error;
    }
  }

  const message =
    lastError instanceof Error
      ? lastError.message
      : "Failed to parse LLM JSON response";

  throw new LlmJsonParseError(message, raw.slice(0, 500));
}
