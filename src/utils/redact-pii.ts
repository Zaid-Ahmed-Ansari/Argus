/**
 * Best-effort PII redaction before logs are stored or sent to AI providers.
 * Not a guarantee of full anonymization — users should still avoid real production data.
 */

const PLACEHOLDERS = {
  email: "[REDACTED_EMAIL]",
  ip: "[REDACTED_IP]",
  user: "[REDACTED_USER]",
  ssn: "[REDACTED_SSN]",
  card: "[REDACTED_CARD]",
  phone: "[REDACTED_PHONE]",
  token: "[REDACTED_TOKEN]",
  mac: "[REDACTED_MAC]",
  secret: "[REDACTED_SECRET]",
} as const;

const IPV4 =
  /\b(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\b/g;

const IPV6 =
  /\b(?:[0-9a-fA-F]{1,4}:){2,7}[0-9a-fA-F]{0,4}\b|\b::(?:[0-9a-fA-F]{1,4}:){0,6}[0-9a-fA-F]{0,4}\b/g;

const EMAIL = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

const SSN = /\b\d{3}-\d{2}-\d{4}\b/g;

const CREDIT_CARD = /\b(?:\d[ -]?){13,19}\d\b/g;

const PHONE =
  /\b(?:\+?\d{1,3}[-.\s]?)?(?:\(?\d{2,4}\)?[-.\s]?)?\d{3,4}[-.\s]?\d{3,4}\b/g;

const JWT = /\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/g;

const MAC = /\b(?:[0-9A-Fa-f]{2}[:-]){5}[0-9A-Fa-f]{2}\b/g;

const PEM_BLOCK =
  /-----BEGIN[A-Z ]+-----[\s\S]*?-----END[A-Z ]+-----/g;

/** Common OpenSSH / auth log username patterns */
const AUTH_USER_PATTERNS = [
  /Failed password for (?:invalid user )?(\S+)/gi,
  /Accepted (?:password|publickey) for (\S+)/gi,
  /session opened for user (\S+)/gi,
  /Disconnected from (?:user )?(\S+)/gi,
  /Invalid user (\S+)/gi,
  /authentication failure; logname=\S* uid=\S* euid=\S* tty=\S* ruser=\S* rhost=\S*\s+user=(\S+)/gi,
] as const;

function redactAuthUsernames(line: string): string {
  let result = line;
  for (const pattern of AUTH_USER_PATTERNS) {
    result = result.replace(pattern, (match, user: string) =>
      match.replace(user, PLACEHOLDERS.user),
    );
  }
  return result;
}

export function redactPii(text: string): string {
  if (!text) return text;

  let result = text
    .replace(PEM_BLOCK, PLACEHOLDERS.secret)
    .replace(JWT, PLACEHOLDERS.token)
    .replace(EMAIL, PLACEHOLDERS.email)
    .replace(SSN, PLACEHOLDERS.ssn)
    .replace(MAC, PLACEHOLDERS.mac)
    .replace(IPV4, PLACEHOLDERS.ip)
    .replace(IPV6, PLACEHOLDERS.ip)
    .replace(CREDIT_CARD, PLACEHOLDERS.card)
    .replace(PHONE, (match) =>
      match.replace(/\d/g, "").length >= 7 ? PLACEHOLDERS.phone : match,
    );

  result = result
    .split("\n")
    .map((line) => redactAuthUsernames(line))
    .join("\n");

  return result;
}

/** Prepare log text for persistence and AI analysis. */
export function prepareLogContent(raw: string): string {
  return redactPii(raw.trim());
}
