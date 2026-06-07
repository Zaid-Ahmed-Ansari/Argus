export const SAMPLE_LOG_LINES = [
  "2025-06-04T12:01:03Z sshd[1842]: Failed password for admin from 192.168.1.50 port 22",
  "2025-06-04T12:01:08Z sshd[1842]: Failed password for admin from 192.168.1.50 port 22",
  "2025-06-04T12:02:01Z sshd[1901]: Failed password for root from 10.0.0.99 port 22",
  "2025-06-04T12:03:15Z sshd[1842]: Failed password for admin from 192.168.1.51 port 22",
  "2025-06-04T12:04:01Z sshd[1842]: Accepted password for admin from 192.168.1.50 port 22",
];

export const MOCK_ANALYSIS = {
  attackType: "Brute Force (T1110)",
  severity: "HIGH" as const,
  summary:
    "Multiple failed SSH login attempts against privileged accounts from three source IPs, followed by a successful admin authentication from 192.168.1.50.",
  timeline: [
    {
      time: "12:01:03",
      event: "Failed login — admin from 192.168.1.50",
    },
    {
      time: "12:02:01",
      event: "Failed login — root from 10.0.0.99",
    },
    {
      time: "12:04:01",
      event: "Successful admin login from 192.168.1.50",
    },
  ],
  recommendations: [
    "Verify legitimacy of the successful admin session",
    "Enable MFA on privileged accounts",
    "Block or rate-limit offending source IPs",
  ],
};
