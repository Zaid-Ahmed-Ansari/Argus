type StructuredAuthEvent = {
  timestamp?: string;
  service: string;
  event: "failed_login" | "successful_login" | "session_opened" | "other";
  user?: string;
  sourceIp?: string;
  raw: string;
};

function parseAuthLine(line: string): StructuredAuthEvent {
  const trimmed = line.trim();
  const timestampMatch = trimmed.match(/^([A-Z][a-z]{2}\s+\d{1,2}\s+\d{2}:\d{2}:\d{2})/);
  const failed = trimmed.match(/Failed password for (\S+) from (\S+)/i);
  const accepted = trimmed.match(/Accepted password for (\S+) from (\S+)/i);
  const session = trimmed.match(/session opened for user (\S+)/i);

  if (failed) {
    return {
      timestamp: timestampMatch?.[1],
      service: "sshd",
      event: "failed_login",
      user: failed[1],
      sourceIp: failed[2],
      raw: trimmed,
    };
  }

  if (accepted) {
    return {
      timestamp: timestampMatch?.[1],
      service: "sshd",
      event: "successful_login",
      user: accepted[1],
      sourceIp: accepted[2],
      raw: trimmed,
    };
  }

  if (session) {
    return {
      timestamp: timestampMatch?.[1],
      service: "sshd",
      event: "session_opened",
      user: session[1],
      raw: trimmed,
    };
  }

  return {
    timestamp: timestampMatch?.[1],
    service: "unknown",
    event: "other",
    raw: trimmed,
  };
}

export function structureAuthLogs(raw: string): string {
  const events = raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map(parseAuthLine);

  return JSON.stringify({ events, eventCount: events.length }, null, 2);
}

export function formatLogsForAnalysis(
  raw: string,
  inputFormat: "RAW" | "STRUCTURED" = "RAW",
): string {
  if (inputFormat === "STRUCTURED") {
    return structureAuthLogs(raw);
  }
  return raw;
}
