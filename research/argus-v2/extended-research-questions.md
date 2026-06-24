# Argus Research Questions

Experimental framework comparing **raw telemetry**, **condensed telemetry**, and **RAG-enhanced telemetry** across base model, LoRA, RAG, and LoRA+RAG configurations.

## Classification & Detection

1. Does intelligent log condensation improve attack classification accuracy compared to raw telemetry at equal training compute?
2. Does log condensation improve attack classification **without** increasing false positives on benign activity?
3. Which attack classes benefit most from condensation (high-volume auth attacks vs. chain-based attacks)?
4. Which attack classes degrade under condensation (insider threat, defense evasion)?
5. Does condensation preserve MITRE ATT&CK mapping accuracy when repetitive evidence is summarized?
6. At what condensation ratio (50% vs. 70% token reduction) does model performance inflect negatively?
7. Does raw telemetry outperform condensed input when evaluation incidents contain heavy noise and false leads?
8. Can a model trained on condensed logs generalize to raw logs at inference time (domain shift)?

## RAG & Knowledge Injection

9. Does RAG context improve MITRE ATT&CK technique mapping accuracy over base and LoRA models?
10. Does RAG reduce severity misclassification for Critical-tier incidents?
11. Does RAG improve reasoning quality (indicator citation) without increasing hallucinated IOCs?
12. Which RAG context block contributes most: MITRE, playbook, or historical incident summaries?
13. Does RAG help more on rare classes (Insider Threat, Defense Evasion) than frequent ones (Brute Force)?
14. Does irrelevant RAG context (wrong technique family) hurt classification more than no RAG?
15. What is the optimal RAG context length before diminishing returns or context dilution occur?

## LoRA Fine-Tuning

16. Does LoRA fine-tuning on raw logs outperform zero-shot base model across all 10 classes?
17. Does LoRA reduce hallucinated JSON fields (invalid severity, wrong MITRE IDs)?
18. Does LoRA trained on condensed data match or beat LoRA trained on raw data under VRAM constraints?
19. How sensitive is LoRA performance to `max_seq_length` (2048 vs. 4096) for raw vs. condensed datasets?
20. Does LoRA+RAG outperform LoRA alone on the test split without scenario leakage?

## Combined & Operational

21. Does LoRA+RAG achieve the highest F1 on Critical severity incidents in the test set?
22. What is the cost-performance tradeoff: tokens per inference vs. accuracy across the four model configurations?
23. Does confidence calibration (predicted confidence vs. actual correctness) differ between raw and RAG inputs?
24. Can condensed+LoRA match raw+LoRA accuracy while enabling training on smaller GPUs?
25. How does model performance vary by log source diversity (incidents with 3 vs. 8 source types)?

## Evaluation Methodology

26. Are validation curves stable across seeds, or do small classes (10 test samples each) produce high variance?
27. Does split integrity hold under stratified per-class evaluation (no scenario ID leakage)?
28. Which evaluation metric best reflects SOC utility: attack_type accuracy, MITRE exact match, or weighted severity score?
