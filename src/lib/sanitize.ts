import DOMPurify from "isomorphic-dompurify";

const SNIPPET_ALLOWED_TAGS = ["b", "strong", "em"];

export function sanitizeSearchSnippet(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: SNIPPET_ALLOWED_TAGS,
    ALLOWED_ATTR: [],
  });
}

export function sanitizeExperimentId(value: string): string | null {
  if (!/^[a-zA-Z0-9_-]{1,64}$/.test(value)) {
    return null;
  }
  return value;
}
