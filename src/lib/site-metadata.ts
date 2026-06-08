import type { Metadata } from "next";

export const SITE_NAME = "Argus";

export const SITE_TITLE =
  "Argus — AI-Powered Security Operations Center Analyst";

export const SITE_DESCRIPTION =
  "Argus is an AI-assisted cybersecurity investigation platform that transforms raw security logs into actionable intelligence using Large Language Models, Retrieval-Augmented Generation (RAG), attack-chain analysis, and MITRE ATT&CK mapping.";

export const SITE_KEYWORDS = [
  "cybersecurity",
  "SOC",
  "security operations center",
  "AI",
  "LLM",
  "RAG",
  "MITRE ATT&CK",
  "incident response",
  "threat detection",
  "security analytics",
  "research",
];

export const GITHUB_URL = "https://github.com/Zaid-Ahmed-Ansari/Argus";

export const AUTHOR = {
  name: "Zaid Ahmed Ansari",
  url: "https://github.com/Zaid-Ahmed-Ansari",
} as const;

export function getSiteUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "http://localhost:3000";
}

type CreateMetadataOptions = {
  title?: string;
  description?: string;
  path?: string;
  noIndex?: boolean;
};

export function createPageMetadata(
  title: string,
  description: string,
  path: string,
): Metadata {
  const pageTitle = `${title} | ${SITE_NAME}`;
  const base = createMetadata({ description, path });
  return {
    ...base,
    title: pageTitle,
    openGraph: {
      ...base.openGraph,
      title: pageTitle,
      description,
    },
    twitter: {
      ...base.twitter,
      title: pageTitle,
      description,
    },
  };
}

export function createMetadata(options: CreateMetadataOptions = {}): Metadata {
  const baseUrl = getSiteUrl();
  const canonicalPath = options.path ?? "/";
  const canonical = new URL(canonicalPath, baseUrl).toString();

  const title = options.title ?? SITE_TITLE;
  const description = options.description ?? SITE_DESCRIPTION;

  return {
    metadataBase: new URL(baseUrl),
    title: {
      default: SITE_TITLE,
      template: `%s | ${SITE_NAME}`,
    },
    description,
    keywords: SITE_KEYWORDS,
    authors: [{ name: AUTHOR.name, url: AUTHOR.url }],
    creator: AUTHOR.name,
    applicationName: SITE_NAME,
    alternates: {
      canonical,
    },
    openGraph: {
      type: "website",
      locale: "en_US",
      url: canonical,
      siteName: SITE_NAME,
      title,
      description,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      creator: `@${AUTHOR.url.split("/").pop()}`,
    },
    robots: options.noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
    icons: {
      icon: [
        { url: "/favicon.svg", type: "image/svg+xml" },
        { url: "/favicon.ico", sizes: "32x32", type: "image/x-icon" },
      ],
      apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
    },
  };
}
