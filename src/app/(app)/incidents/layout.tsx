import { createPageMetadata } from "@/lib/site-metadata";

export const metadata = createPageMetadata(
  "Incidents",
  "Review AI-analyzed security incidents, timelines, severity classifications, and investigation history.",
  "/incidents",
);

export default function IncidentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
