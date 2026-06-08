import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { SITE_DESCRIPTION, SITE_TITLE } from "@/lib/site-metadata";

export const alt = SITE_TITLE;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const FEATURES = [
  "Incident Detection",
  "Threat Investigation",
  "MITRE ATT&CK Mapping",
  "Research Laboratory",
] as const;

export default async function OpenGraphImage() {
  const logoBuffer = await readFile(join(process.cwd(), "public", "logo.png"));
  const logoSrc = `data:image/png;base64,${logoBuffer.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#ffffff",
          color: "#0a0a0a",
          padding: "64px 72px",
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(#f0f0f0 1px, transparent 1px), linear-gradient(90deg, #f0f0f0 1px, transparent 1px)",
            backgroundSize: "48px 48px",
            opacity: 0.65,
          }}
        />

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 28,
            position: "relative",
          }}
        >
          <img
            src={logoSrc}
            alt=""
            width={88}
            height={88}
            style={{ borderRadius: 12 }}
          />
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div
              style={{
                fontSize: 64,
                fontWeight: 700,
                letterSpacing: "0.08em",
              }}
            >
              ARGUS
            </div>
            <div style={{ fontSize: 26, color: "#404040", maxWidth: 720 }}>
              AI-Powered Security Operations Center Analyst
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 16,
            position: "relative",
          }}
        >
          {FEATURES.map((label) => (
            <div
              key={label}
              style={{
                border: "1px solid #d4d4d4",
                borderRadius: 8,
                padding: "12px 20px",
                fontSize: 20,
                fontWeight: 500,
                backgroundColor: "#ffffff",
              }}
            >
              {label}
            </div>
          ))}
        </div>

        <div
          style={{
            fontSize: 18,
            color: "#737373",
            position: "relative",
            maxWidth: 900,
            lineHeight: 1.4,
          }}
        >
          {SITE_DESCRIPTION}
        </div>
      </div>
    ),
    { ...size },
  );
}
