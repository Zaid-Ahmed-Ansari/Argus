import type { InvestigationReport } from "@/types/investigation";

/** Rich SOC investigation fixture — maps to future multi-incident analysis API. */
export const MOCK_INVESTIGATION_REPORT: InvestigationReport = {
  id: "inv-mock-001",
  title: "Multi-Stage Authentication Abuse & Privilege Escalation",
  status: "INVESTIGATING",
  generatedAt: new Date().toISOString(),
  commandCenter: {
    totalIncidents: 8,
    critical: 5,
    high: 2,
    medium: 1,
    low: 0,
    confidence: 91,
    logsProcessed: 57,
    processingTimeMs: 4200,
  },
  detectedIncidents: [
    {
      id: "inc-1",
      title: "Brute Force Attack",
      attackType: "brute_force",
      severity: "HIGH",
      confidence: 95,
      description:
        "Repeated failed logins from the same source IP targeting a single service account.",
      mitreTechniques: ["T1110"],
      evidence: [
        "47 failed authentication events within 12 minutes",
        "Single source IP 203.0.113.44 across all attempts",
        "Account lockout triggered at 09:14 UTC",
      ],
      affectedUsers: ["svc-backup"],
      sourceIps: ["203.0.113.44"],
    },
    {
      id: "inc-2",
      title: "Password Spray",
      attackType: "password_spray",
      severity: "HIGH",
      confidence: 92,
      description:
        "Low-and-slow password attempts against multiple user accounts from one external IP.",
      mitreTechniques: ["T1110.003"],
      evidence: [
        "12 distinct usernames targeted with common passwords",
        "Inter-attempt delay averaging 45 seconds",
        "No successful authentication during spray window",
      ],
      affectedUsers: ["j.doe", "a.smith", "k.chen", "m.patel"],
      sourceIps: ["198.51.100.17"],
    },
    {
      id: "inc-3",
      title: "Credential Stuffing",
      attackType: "credential_stuffing",
      severity: "CRITICAL",
      confidence: 96,
      description:
        "Multiple successful logins from the same source using previously breached credentials.",
      mitreTechniques: ["T1078"],
      evidence: [
        "3 successful authentications within 4 minutes",
        "Geolocation mismatch — login from unusual region",
        "MFA challenge not present on VPN portal",
      ],
      affectedUsers: ["j.doe", "finance-bot"],
      sourceIps: ["203.0.113.88", "203.0.113.90"],
    },
    {
      id: "inc-4",
      title: "Valid Account Abuse",
      attackType: "account_takeover",
      severity: "CRITICAL",
      confidence: 94,
      description:
        "Compromised account used for lateral movement to internal file share.",
      mitreTechniques: ["T1078", "T1021"],
      evidence: [
        "SMB session opened to FS-01 within 8 minutes of login",
        "Unusual access time — outside business hours",
      ],
      affectedUsers: ["j.doe"],
      sourceIps: ["10.20.5.14"],
    },
    {
      id: "inc-5",
      title: "Privilege Escalation",
      attackType: "privilege_escalation",
      severity: "CRITICAL",
      confidence: 97,
      description:
        "Compromised user added to Domain Admins and assigned privileged token.",
      mitreTechniques: ["T1068", "T1098"],
      evidence: [
        "User j.doe added to Administrators group at 12:01 UTC",
        "Privileged token assignment logged by AD",
        "No corresponding change ticket in ITSM",
      ],
      affectedUsers: ["j.doe"],
      sourceIps: ["10.20.5.14"],
    },
    {
      id: "inc-6",
      title: "Defense Evasion",
      attackType: "defense_evasion",
      severity: "CRITICAL",
      confidence: 89,
      description:
        "Endpoint protection service disabled on workstation WS-447.",
      mitreTechniques: ["T1562.001"],
      evidence: [
        "EDR agent stop command issued by compromised account",
        "Windows Defender real-time protection toggled off",
      ],
      affectedUsers: ["j.doe"],
      sourceIps: ["10.20.5.14"],
    },
    {
      id: "inc-7",
      title: "Data Collection",
      attackType: "collection",
      severity: "CRITICAL",
      confidence: 88,
      description:
        "Bulk archive creation of finance and HR directories on file server.",
      mitreTechniques: ["T1560", "T1005"],
      evidence: [
        "2.4 GB archive created in C:\\Users\\j.doe\\AppData\\Local\\Temp",
        "Access to \\\\FS-01\\Finance and \\\\FS-01\\HR paths",
      ],
      affectedUsers: ["j.doe"],
      sourceIps: ["10.20.5.14"],
    },
    {
      id: "inc-8",
      title: "Data Exfiltration",
      attackType: "data_exfiltration",
      severity: "MEDIUM",
      confidence: 85,
      description:
        "Large outbound transfer to external cloud storage endpoint.",
      mitreTechniques: ["T1041", "T1567"],
      evidence: [
        "1.8 GB HTTPS upload to unknown cloud storage domain",
        "DLP alert suppressed — policy gap on encrypted channel",
      ],
      affectedUsers: ["j.doe"],
      sourceIps: ["10.20.5.14"],
    },
  ],
  attackChain: [
    {
      id: "initial-access",
      name: "Initial Access",
      order: 0,
      description: "External authentication abuse against VPN and web portals.",
    },
    {
      id: "credential-access",
      name: "Credential Access",
      order: 1,
      description: "Brute force, spray, and stuffing to obtain valid credentials.",
    },
    {
      id: "privilege-escalation",
      name: "Privilege Escalation",
      order: 2,
      description: "Administrative group membership and token assignment.",
    },
    {
      id: "defense-evasion",
      name: "Defense Evasion",
      order: 3,
      description: "Security tooling disabled on compromised endpoint.",
    },
    {
      id: "collection",
      name: "Collection",
      order: 4,
      description: "Sensitive data staged for exfiltration.",
    },
    {
      id: "exfiltration",
      name: "Exfiltration",
      order: 5,
      description: "Outbound transfer to external infrastructure.",
    },
  ],
  mitreTechniques: [
    {
      id: "T1110",
      name: "Brute Force",
      description: "Adversaries attempt to gain access by guessing credentials.",
      confidence: 95,
      relatedEventIds: ["evt-1", "evt-2"],
    },
    {
      id: "T1110.003",
      name: "Password Spray",
      description:
        "Adversaries use a single password against many accounts.",
      confidence: 92,
      relatedEventIds: ["evt-3", "evt-4"],
    },
    {
      id: "T1078",
      name: "Valid Accounts",
      description:
        "Adversaries use legitimate credentials to access environments.",
      confidence: 96,
      relatedEventIds: ["evt-5", "evt-6"],
    },
    {
      id: "T1068",
      name: "Privilege Escalation",
      description:
        "Adversaries exploit vulnerabilities to elevate permissions.",
      confidence: 97,
      relatedEventIds: ["evt-9", "evt-10"],
    },
    {
      id: "T1562",
      name: "Impair Defenses",
      description: "Adversaries disable security tools to avoid detection.",
      confidence: 89,
      relatedEventIds: ["evt-11"],
    },
    {
      id: "T1041",
      name: "Exfiltration Over C2 Channel",
      description: "Data exfiltrated over existing command and control.",
      confidence: 85,
      relatedEventIds: ["evt-14"],
    },
  ],
  timelineStages: [
    {
      id: "initial-access",
      name: "Initial Access",
      events: [
        {
          id: "evt-1",
          timestamp: "2026-06-04T09:00:00Z",
          event: "Failed login attempts detected against VPN portal",
          source: "auth-vpn-01",
          stageId: "initial-access",
        },
        {
          id: "evt-2",
          timestamp: "2026-06-04T09:14:00Z",
          event: "Account svc-backup locked after brute force threshold",
          source: "active-directory",
          stageId: "initial-access",
        },
      ],
    },
    {
      id: "credential-access",
      name: "Credential Access",
      events: [
        {
          id: "evt-3",
          timestamp: "2026-06-04T10:00:00Z",
          event: "Password spray detected — 12 usernames, single source IP",
          source: "siem-correlation",
          stageId: "credential-access",
        },
        {
          id: "evt-4",
          timestamp: "2026-06-04T10:22:00Z",
          event: "Spray source IP 198.51.100.17 blocked at perimeter",
          source: "firewall",
          stageId: "credential-access",
        },
        {
          id: "evt-5",
          timestamp: "2026-06-04T11:00:00Z",
          event: "Credential stuffing successful — j.doe authenticated",
          source: "auth-vpn-01",
          stageId: "credential-access",
        },
        {
          id: "evt-6",
          timestamp: "2026-06-04T11:04:00Z",
          event: "Second successful login — finance-bot from 203.0.113.90",
          source: "auth-vpn-01",
          stageId: "credential-access",
        },
      ],
    },
    {
      id: "privilege-escalation",
      name: "Privilege Escalation",
      events: [
        {
          id: "evt-9",
          timestamp: "2026-06-04T12:01:00Z",
          event: "User j.doe added to Domain Administrators",
          source: "active-directory",
          stageId: "privilege-escalation",
        },
        {
          id: "evt-10",
          timestamp: "2026-06-04T12:01:30Z",
          event: "Privileged token assigned to session",
          source: "active-directory",
          stageId: "privilege-escalation",
        },
      ],
    },
    {
      id: "defense-evasion",
      name: "Defense Evasion",
      events: [
        {
          id: "evt-11",
          timestamp: "2026-06-04T12:18:00Z",
          event: "EDR agent stopped on WS-447",
          source: "endpoint-edr",
          stageId: "defense-evasion",
        },
        {
          id: "evt-12",
          timestamp: "2026-06-04T12:19:00Z",
          event: "Windows Defender real-time protection disabled",
          source: "ws-447",
          stageId: "defense-evasion",
        },
      ],
    },
    {
      id: "collection",
      name: "Collection",
      events: [
        {
          id: "evt-13",
          timestamp: "2026-06-04T13:05:00Z",
          event: "Archive created — finance and HR file shares",
          source: "fs-01",
          stageId: "collection",
        },
      ],
    },
    {
      id: "exfiltration",
      name: "Exfiltration",
      events: [
        {
          id: "evt-14",
          timestamp: "2026-06-04T13:42:00Z",
          event: "1.8 GB outbound transfer to external cloud storage",
          source: "proxy-logs",
          stageId: "exfiltration",
        },
      ],
    },
  ],
  rootCauseFindings: [
    {
      id: "rc-1",
      finding:
        "Weak authentication controls allowed repeated login attempts without progressive backoff.",
    },
    {
      id: "rc-2",
      finding:
        "Multi-factor authentication was not enforced on the VPN authentication portal.",
    },
    {
      id: "rc-3",
      finding:
        "Administrative privilege assignment controls failed — no change ticket correlated.",
    },
    {
      id: "rc-4",
      finding:
        "Security tooling could be disabled by compromised standard user sessions.",
    },
    {
      id: "rc-5",
      finding:
        "Data loss prevention controls did not prevent exfiltration over encrypted channels.",
    },
  ],
  recommendations: {
    immediate: [
      "Isolate workstation WS-447 and reset credentials for j.doe and finance-bot",
      "Revoke active sessions and remove j.doe from privileged groups",
      "Block known malicious source IPs at perimeter and VPN gateway",
    ],
    shortTerm: [
      "Review all privileged account changes in the last 72 hours",
      "Hunt for persistence mechanisms on WS-447 and adjacent hosts",
      "Validate EDR tamper-protection policies across the fleet",
    ],
    longTerm: [
      "Enforce MFA on all remote access paths",
      "Implement privileged access management for admin group changes",
      "Expand DLP coverage for cloud storage egress channels",
    ],
  },
  metadata: {
    model: "gemini-2.5-flash",
    knowledgeSources: ["MITRE ATT&CK", "Security Playbooks"],
    logsProcessed: 57,
    incidentsDetected: 8,
    confidence: 91,
    analysisTimeMs: 4200,
    promptVersion: "v3",
    provider: "gemini",
    usedRag: true,
  },
  researchInsights: [
    {
      id: "ri-1",
      title: "Finding 1",
      finding:
        "Credential stuffing led to successful account compromise after spray and brute force reconnaissance.",
    },
    {
      id: "ri-2",
      title: "Finding 2",
      finding:
        "Privilege escalation followed authentication abuse within 61 minutes — indicating automated post-exploitation.",
    },
    {
      id: "ri-3",
      title: "Finding 3",
      finding:
        "Defense evasion actions preceded data collection, suggesting deliberate anti-forensics behavior.",
    },
    {
      id: "ri-4",
      title: "Finding 4",
      finding:
        "The attack followed a classic multi-stage intrusion pattern aligned with MITRE ATT&CK kill chain.",
    },
  ],
};
