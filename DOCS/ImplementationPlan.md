# Implementation Plan: Trial Confidence Layer

## The Sequencing Logic

The instinct is to build the full Architecture.md system and launch it. That instinct is wrong here, for a specific reason: the single highest-impact failure mode in EdgeCases.md — hallucination of trust signals — is also the one most likely to occur if the pipeline is rushed to production without validation. Pattern B in ProblemStatement.md establishes that credible peer evidence is the *only* trust currency users accept, and that users explicitly reject generic platform suggestions. If the Trial Confidence layer surfaces a single fabricated or misattributed trust signal in its first week, it doesn't just fail — it confirms the user's pre-existing mental model that Blinkit cannot be trusted outside groceries (per Pattern D). The damage would be permanent, per the first-experience-determinism dynamic documented in Pattern A.

So the sequencing logic is: prove the trust signal is credible *before* putting it in front of users. Everything follows from that.

The second constraint on sequencing is data density. Category_coverage.csv shows a 24× gap between the densest non-grocery category (electronics, 509 corpus mentions) and the sparsest (intimate_personal, 21 mentions). Per the sparse-category failure mode in EdgeCases.md, an AI-powered trust signal built on 21 data points is not a trust signal — it's a guess. Categories must be phased by density, not launched simultaneously.

The third constraint is the cold-start problem from EdgeCases.md: the system needs a user's category purchase history (the 90-day lookback from ProblemStatement.md's CCAR metric) to know whether a category is "new" to them. This data pipeline must exist before the serving layer can render anything personalised. But building the full User Category Profile Builder before testing whether the trust signal itself works is over-engineering. The answer is to start with a manually curated, non-personalised version of the trust signal, test whether it moves behaviour at all, and then layer on personalisation.

---

## Phase 1 — Prove the Signal: Manually Curated Trust Badges on Electronics (Weeks 1–4)

**Goal:** Answer the foundational question — does surfacing real peer evidence at the point of decision actually increase trial rate in a new category? If it doesn't, everything downstream is moot.

**What gets built:**
A manually curated, static version of the Trial Confidence module for a single category: **electronics**. Electronics is chosen first for three reasons. First, it has the densest non-grocery signal in the corpus (509 mentions per category_coverage.csv — more than double the next non-grocery category). Second, it has the highest volume of non-grocery complaints in consumer_forum_complaints (23 of the 48 explicitly tagged non-grocery complaints), giving us the clearest baseline of known friction. Third, the interview data provides the sharpest evidence of first-experience-determinism failure in this exact category: R5 received faulty electronics three separate times and will never try again (per Pattern A, ProblemStatement.md).

The module is simple: a trust badge rendered on electronics product pages showing the product's real average rating, real review count, and real repeat-purchase percentage — all pulled manually from Blinkit's first-party review and transaction data by a product analyst, not computed by the Gemini pipeline. This is intentionally low-tech. Per the hallucination mitigation in Architecture.md, trust signals must be retrieval-based, never generative. Starting with manual curation guarantees zero hallucination risk while we test whether the signal itself has value.

No personalisation. No "new to you" logic. No User Category Profile Builder. Every user who lands on an electronics product page sees the badge. This tests the signal's raw efficacy before adding the complexity of personalisation.

**What gets measured:**
*   **Primary:** New-category trial rate for electronics (cart adds and purchases from users who have not previously purchased electronics on Blinkit, identified via a simple historical query, not the full profile builder).
*   **Guardrails:** Core-order friction (grocery completion rate and time-to-checkout — per ProblemStatement.md, the primary habit loop must not degrade). Return/complaint rate on electronics orders placed by users who saw the badge versus a holdout.

**Exit criteria to proceed:**
*   Trial rate for electronics is measurably higher in the badge cohort versus holdout (statistical significance, not just directional).
*   Grocery completion rate and time-to-checkout show no degradation.
*   Return/complaint rate on badge-influenced electronics trials does not spike above baseline — if it does, the badge is driving trials into bad experiences, which per ProblemStatement.md's guardrail logic is "worse than no intervention."

**Kill/pivot criteria:**
*   If trial rate shows no lift after 4 weeks of exposure to a meaningful user sample, the hypothesis that peer evidence at the decision point changes behaviour is invalidated. This would require revisiting the root-cause analysis — perhaps the information vacuum (Force 1, ProblemStatement.md) is less causal than the fee economics (Force 3) or specialist mental model (Force 4), and the solution direction needs to shift entirely.
*   If return/complaint rate spikes, the intervention is actively harmful. Stop immediately, investigate whether the badge is inadvertently steering users toward low-quality products.

**Key risk retired:** Hallucination of trust signals (EdgeCases.md P0 blocker). By using manually curated data, this risk is fully eliminated in Phase 1. The phase also validates the core assumption from ProblemStatement.md's Key Assumptions to Validate: whether in-app peer evidence can substitute for a friend's recommendation.

**Team:** 1 PM, 1 product analyst (manual data curation), 1 front-end engineer (badge UI), 1 data analyst (A/B test setup and measurement). No ML engineer needed yet.

---

## Phase 2 — Automate and Expand: Pipeline-Driven Signals Across Dense Categories (Weeks 5–10)

**Goal:** Replace manual curation with the automated Review Aggregation Service and Gemini Classification Pipeline from Architecture.md, and expand from electronics to the next tier of data-dense categories.

**Why this phase depends on Phase 1:** Phase 1 proves the signal works. Phase 2 automates the signal's production. If Phase 1 had failed, this entire pipeline would have been wasted engineering effort — which is why the manual-first approach was correct.

**What gets built:**
*   The **Review Aggregation Service** (Architecture.md): a scheduled batch job computing per-product trust signal rollups (average rating, review count, repeat-purchase rate) from first-party data, writing to a low-latency cache. This replaces the analyst's manual spreadsheet with a daily-cadence automated pipeline.
*   The **Gemini Classification Pipeline** is connected to first-party review data (not just the public corpus from Part 1) to classify incoming reviews by theme, sentiment, and confidence. Per the false-confidence failure mode in EdgeCases.md, the pipeline's confidence scores undergo a manual QA round before being used to gate any user-facing output: a random sample of 200+ classifications plus a targeted review of the lowest-confidence 10% bucket.
*   **Category expansion** to **personal_care_beauty** (233 corpus mentions) and **pharmacy_health** (152 mentions). These are the next two categories by data density after electronics. Pharmacy_health is included with a caveat flagged in EdgeCases.md: its adoption barriers may include medical trust, not just peer evidence. This phase will produce signal on whether the trust badge works differently for pharmacy — if the trial-rate lift is significantly lower than electronics, it validates the category-specific root-cause disconnect edge case and pharmacy should be treated differently in later phases.

**What gets measured:**
*   **Primary:** New-category trial rate and second-purchase rate (within 30 days) for electronics, personal_care_beauty, and pharmacy_health. The second-purchase rate is introduced here because Phase 1 was too short to measure it. Per ProblemStatement.md, this is "the real test" — a trial that doesn't repeat has likely burned the category permanently.
*   **New:** Category-abandonment rate (users who trial then never return). Per ProblemStatement.md's guardrails, a rise here means the intervention is driving trials into bad experiences at scale.
*   **Continued guardrails:** Grocery completion rate, time-to-checkout, return/complaint rate on newly-trialled categories.

**Exit criteria to proceed:**
*   Automated pipeline produces trust signals whose accuracy (verified by manual QA) matches or exceeds the manually curated signals from Phase 1.
*   Trial-rate lift sustains across all three categories (with pharmacy noted separately).
*   Second-purchase rate within 30 days is positive — users who trial are repeating, not burning the category.
*   Category-abandonment rate does not rise.

**Kill/pivot criteria:**
*   If the automated pipeline's trust signals are measurably less accurate than the manual curation (detected via the QA sample), do not proceed. The pipeline needs recalibration before it can be trusted at scale — per the false-confidence/miscalibration failure mode in EdgeCases.md.
*   If second-purchase rate is flat or declining while trial rate is rising, the intervention is generating trials that don't stick. Per Pattern A (ProblemStatement.md), this means the badge is successfully prompting first trials but the underlying product experience is failing. This is the exact scenario the category-abandonment guardrail exists to catch. Action: pause expansion, investigate product-quality issues in the trialled categories, and consider whether the MVP should exclude specific products with high return rates from badge eligibility.

**Key risk retired:** False confidence/miscalibration (EdgeCases.md P1). The manual QA process validates pipeline accuracy before trusting it for user-facing output. Also partially retires the category-specific root-cause disconnect edge case by testing whether pharmacy_health responds differently to the same intervention.

**Team:** Add 1 ML/data engineer (pipeline automation), 1 back-end engineer (Review Aggregation Service and cache infrastructure). PM, front-end engineer, and data analyst continue from Phase 1.

---

## Phase 3 — Personalise: User Category Profiles and the Confidence Gate (Weeks 11–16)

**Goal:** Make the system aware of each user's individual category history, so the Trial Confidence module renders only for categories that are genuinely new to that specific user — and suppresses itself when data is insufficient.

**Why this phase depends on Phase 2:** Phase 2 proves the automated pipeline produces accurate signals. Phase 3 layers personalisation on top. Without the pipeline, there is nothing to personalise. Without pipeline accuracy validation, personalisation would amplify errors rather than improve relevance.

**What gets built:**
*   The **User Category Profile Builder** (Architecture.md): an event-driven pipeline consuming order events, maintaining each user's purchase history with recency weighting and the 90-day lookback window tied to CCAR. This enables the system to distinguish "new to this user" from "new to the platform."
*   The **Confidence Threshold Gate** (Architecture.md): routes users to the Trial Confidence module only when the system has sufficient signal. Per the cold-start failure mode in EdgeCases.md, users with no cross-category purchase history are routed to static category-level defaults (top-rated items in the user's pin code), not a low-confidence AI recommendation presented as confident.
*   The **Recommendation Diversity Monitor** (E5 in Architecture.md's diagram): tracks the ratio of novel categories shown versus accepted per user per session. This directly addresses the recommendation feedback loop/narrowing failure mode in EdgeCases.md — if the system starts reinforcing grocery-only behaviour because that's what has historical engagement, this monitor catches it and triggers rebalancing.

**What gets measured:**
*   **North star (CCAR):** For the first time, the full Cross-Category Activation Rate can be measured as defined in ProblemStatement.md — MAC who purchase from ≥1 new L2 category (90-day lookback) as a percentage of total MAC. This is the first phase where the user profile infrastructure exists to compute it properly.
*   **Supporting:** Trial rate, second-purchase rate, trial basket economics (fees as % of trial-order value — per ProblemStatement.md), distinct L2 categories purchased per user per month.
*   **Counter-metric (new):** Recommendation diversity — categories shown versus accepted. A declining ratio is an early-warning signal for the narrowing loop.
*   **Continued guardrails:** All previous guardrails persist.

**Exit criteria to proceed:**
*   CCAR shows a statistically significant increase over the pre-intervention baseline (which is now measurable because the user profile infrastructure exists).
*   Recommendation diversity ratio remains stable or improves — no evidence of the narrowing feedback loop.
*   Cold-start fallback (static defaults) produces a trial rate that is not zero — i.e., the fallback is a reasonable experience, not a dead end.

**Kill/pivot criteria:**
*   If CCAR does not move despite trial rate increasing, the problem has shifted from "users don't try" to "users try but don't sustain." This would suggest the product experience in these categories is the binding constraint, not the information vacuum — which per ProblemStatement.md's scope would require escalation to the QA/returns operational programme (flagged as out of scope but a real root-cause contributor).
*   If the diversity monitor shows a narrowing trend within the first 4 weeks of personalisation, the model is reinforcing existing habits. Action: introduce a hard floor constraint — a minimum percentage of recommendations must come from categories the user has never purchased.

**Key risk retired:** Cold-start problem and recommendation feedback loop (both EdgeCases.md). The confidence gate and diversity monitor are purpose-built mitigations for these.

**Team:** Add 1 back-end engineer (user profile infrastructure), 1 data engineer (event pipeline and CCAR computation). ML engineer from Phase 2 builds the diversity monitor. Total team by this phase: 1 PM, 2 back-end engineers, 1 front-end engineer, 1 ML/data engineer, 1 data analyst.

---

## Phase 4 — Scale and Validate: Baby Category, Broader Survey, Full Monitoring (Weeks 17–22)

**Goal:** Expand to the next category tier, validate whether the Varanasi-derived insights generalise, and build the full monitoring dashboard that makes the system operationally sustainable.

**Why this phase depends on Phase 3:** Phase 3 proves that the personalised, automated system moves CCAR. Phase 4 tests whether the approach generalises to categories with different dynamics and user populations with different contexts.

**What gets built:**
*   **Category expansion to baby** (41 corpus mentions per category_coverage.csv). Baby is chosen specifically because it represents a test of the "inverted root cause" edge case from EdgeCases.md: baby products may have inherently long replacement cycles, meaning the second-purchase rate metric will behave differently. If we treat baby the same as electronics, we risk misclassifying satisfied-but-dormant users as burned users. This phase produces the data to distinguish between the two.
*   The **full Monitoring Dashboard** (Architecture.md): Looker or Metabase dashboards with automated alerts on all guardrail metrics — category-abandonment rate, core-order friction, return/complaint rate on newly-trialled categories, and recommendation diversity. Per Architecture.md, a spike in category-abandonment triggers an immediate review.
*   A **broader quantitative survey** outside Varanasi — targeting metro and Tier-3 users, and a wider income band — to pressure-test the segment definition and root-cause narrative from ProblemStatement.md. Per EdgeCases.md's sampling bias validation gap, the qualitative foundation of the entire project rests on 7 interviews from one tier-2 city. Before scaling rollout, this must be validated.

**What gets measured:**
*   All metrics from Phase 3, plus baby-specific analysis: does second-purchase rate differ from electronics and personal care due to purchase-cycle length rather than experience quality? If so, the 30-day second-purchase window needs category-specific adjustment.
*   Survey results: do metro users exhibit the same specialist-platform mental model (Pattern D) and first-experience-determinism (Pattern A) as the Varanasi sample?

**Exit criteria for full rollout:**
*   CCAR lift sustained across all launched categories.
*   Survey confirms (or forces revision of) the target segment definition.
*   Monitoring dashboard is operational with automated alerts.
*   Baby category data disambiguates the "burned" vs. "dormant" user question from EdgeCases.md.

**Key risk retired:** Sampling bias validation gap (EdgeCases.md). Also retires the inverted-root-cause edge case (infrequent need) by producing category-specific purchase-cycle data.

**Team:** Same as Phase 3, plus 1 UX researcher (survey design and analysis).

## Phase 5 — Full Category Expansion (Sparse Overrides)

**Goal:** Expand the prototype to include all remaining long-tail categories (`home_cleaning`, `pet`, `intimate_personal`), overriding their data sparsity flags to demonstrate the UI scale-out and how the Confidence Gate behaves when rendering low-density but highly specific AI signals.

**Why this phase depends on Phase 4:** Phase 4 successfully tested a single sparse category (Baby). Phase 5 scales this override to the entire remaining catalog.

**What gets built:**
* **Category expansion:** Integration of Home & Cleaning, Pet Care, and Intimate & Personal into the Recommendation Strip and Category Navigation.
* **Dashboard updates:** The Category Abandonment chart tracks these highly specific verticals.
* **Sparse overrides:** We intentionally override the `density_flag` constraints to allow AI extraction on <35 mentions, validating the prompt robustness against hallucinations on micro-corpuses.

---

## What Is Deliberately Sequenced Last (and Why)

**Fee economics interventions** are deliberately excluded from all phases. Per ProblemStatement.md, fee restructuring is finance-owned and out of scope. The Trial Confidence layer is designed to work within the current fee structure. If finance later introduces trial-basket fee reductions, the two interventions compound — the trust signal makes the user willing to try, and the lower fee removes the economic penalty on the small, cautious basket that Pattern C documents. But sequencing one does not require waiting for the other.

**A conversational discovery agent** (the chat-based assistant mentioned as a possibility in EdgeCases.md) is deliberately deferred. It introduces the adversarial/manipulated-input failure mode, which the current architecture eliminates entirely by not having a user-facing LLM interaction surface. The Trial Confidence layer is a display component, not a conversational one — it reads from a cache, not a live model. Adding a chat agent is a fundamentally different risk profile that should only be considered after the display-based MVP has proven its value and the monitoring infrastructure is mature enough to catch misuse.

**QA and returns process re-engineering** is flagged in ProblemStatement.md as a genuine root-cause contributor but a separate operational programme. The implementation plan accounts for this by monitoring return/complaint rate on newly-trialled categories as a guardrail at every phase. If the guardrail fires — meaning the Trial Confidence layer is successfully driving trials, but those trials are failing due to product quality — the correct response is not to fix it within this project but to escalate to the operations team with the data this system has now produced.

### Phase 6: Premium UI Integration (Stitch Migration)
*Goal: Migrate the basic vanilla CSS prototype to a state-of-the-art Tailwind design.*

1. **New `phase6` Sandbox:** Create a separate `phase6` directory to preserve the working baseline of Phase 4/5. Update the Node server to serve Phase 6 static files.
2. **Tailwind HTML Migration:** Merge the Stitch AI HTML templates (`home`, `electronics_grid`, `pdp`) into a unified `phase6/prototype/index.html`.
3. **Dynamic Logic Rewiring (`app.js`):** Completely rewrite the frontend JavaScript rendering functions (`renderRecommendationStrip`, `renderCategoryNav`, `renderProducts`) to output the sophisticated Tailwind DOM structures instead of vanilla CSS divs.
4. **Product Detail Sheet (PDP):** Introduce an interactive Bottom Sheet Modal that opens upon clicking any product card, dynamically pulling and displaying its AI Trust Signals (average rating, repeat purchase rate, and the highlighted review theme).
5. **Dashboard Upgrade:** Replace the simple HTML dashboard with the premium `blinkit_guardrail_metrics_dashboard`.
