# Argus evaluation datasets

## Structure

```text
datasets/
├── brute_force/              sample.log + ground-truth.json
├── password_spray/
├── credential_stuffing/
├── privilege_escalation/
├── lateral_movement/
├── suspicious_admin_activity/
├── account_takeover/
├── data_exfiltration/
├── web_shell/
├── insider_threat/
├── eval/
│   └── fixtures-index.json
└── knowledge/                RAG seed documents
```

## Ground truth schema (v2)

Each `ground-truth.json` includes:

- `attackType`, `severity`, `mitreTechniques`
- `requiredKeywords`, `forbiddenKeywords`
- `minTimelineEvents`, `expectedRecommendationThemes`
- `requiredEntities` (users, IPs, hosts)

## Run evaluation

```bash
npm run experiment:all
npm run experiment:scenario -- brute_force password_spray
```

See [docs/research-roadmap.md](../docs/research-roadmap.md) and [docs/experiments.md](../docs/experiments.md).
