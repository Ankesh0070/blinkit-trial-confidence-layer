# Gemini Classification Pipeline — QA Plan

## Context
Per `ImplementationPlan.md` (Phase 2), the Trial Confidence Layer relies on the Gemini Classification Pipeline to automatically extract themes, sentiment, and confidence scores from raw reviews. 

The primary risk identified in `EdgeCases.md` is **False Confidence/Miscalibration** — the model surfacing a low-confidence or hallucinated trust signal and presenting it as verified. To mitigate this, a manual QA round is required before the automated pipeline's output is approved for user-facing deployment.

## Methodology

### 1. Stratified Random Sampling
The QA team will evaluate a stratified random sample of **200+ review classifications** from the pipeline's output. The sample will be stratified across the three Phase 2 target categories:
* Electronics (~100 classifications)
* Beauty & Personal Care (~60 classifications)
* Pharmacy & Health (~40 classifications)

### 2. Targeted Low-Confidence Review
In addition to the random sample, the team will manually review **100% of the lowest-confidence 10% bucket**. 
* Goal: Determine if the model is correctly identifying ambiguous/low-signal reviews and assigning them low confidence scores.
* Action: If the model is assigning *high* confidence to ambiguous reviews, the temperature/prompting must be recalibrated.

### 3. Accuracy Metrics
For each review in the QA sample, a human analyst will evaluate:
1. **Theme Accuracy:** Did the model correctly map the review text to the canonical theme? (Yes/No)
2. **Sentiment Accuracy:** Did the model correctly identify the sentiment (Positive/Negative/Mixed) based on the text context, ignoring generic star ratings? (Yes/No)

### 4. Exit Criteria for Pipeline Approval
To pass QA and replace the Phase 1 manual curation, the automated pipeline must achieve:
* **Theme Accuracy ≥ 95%** on the random sample
* **Sentiment Accuracy ≥ 90%** on the random sample
* **Zero instances** of high-confidence scores assigned to fabricated or explicitly contradictory data.

### Status (Phase 2 Prototype)
* **Status:** `PENDING_QA`
* **Note:** The current `trust_signals_automated.json` has `qa_verified: false`. The prototype UI includes a toggle to simulate QA approval.
