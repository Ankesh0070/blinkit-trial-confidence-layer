# Phase 1 A/B Test Plan: Trial Confidence Badge on Electronics

## Experiment Overview

**Hypothesis:** Surfacing real, manually curated peer evidence (ratings, review counts, repeat-purchase rates) on electronics product pages will increase the new-category trial rate for electronics among habituated grocery users.

**Grounding:** Per ProblemStatement.md, the information vacuum at the decision point (Force 1) is the primary addressable root cause. Per Pattern B, users demand "good reviews on the specific product I'm considering, not generic suggestions" (R1). Per Architecture.md, the Trial Confidence layer fills this gap by presenting verified peer evidence — never LLM-generated — at the moment of consideration.

## Test Design

### Variants

| Variant | Description | What the User Sees |
| :--- | :--- | :--- |
| **Control** | Current product page, no trust badge | Standard Blinkit electronics product page: product image, name, price, ADD button. No rating, no review count, no repeat-purchase signal. |
| **Treatment** | Product page + Trial Confidence badge | Same page with an additional "Buyer Verified" badge showing: average rating (stars), total ratings count, and repeat-purchase percentage. Clicking the badge expands to show review theme highlights with real user quotes. |

### Allocation

- **Split:** 50/50 random allocation at the user level (not session level — a user stays in their variant across all sessions during the test period).
- **Minimum sample size:** Per standard two-proportion z-test, assuming baseline trial rate of ~2% (directional estimate from corpus category share of electronics at 1.5%) and a minimum detectable effect of 1 percentage point (i.e., trial rate from 2% to 3%), at 80% power and 5% significance, we require approximately **3,800 users per variant**. With Blinkit's user base in a single city, this is achievable within the 4-week test window.
- **Randomisation unit:** User ID, hashed and bucketed. Consistent assignment ensures no cross-contamination.

### Targeting

- **Eligible users:** All users who land on an electronics product page during the test period.
- **Refined cohort for primary analysis:** Habituated grocery regulars (ordering ≥1×/week, tenure ≥3 months, per ProblemStatement.md's target segment) who have not purchased from the electronics category in the past 90 days. This is the cohort the entire project is designed to serve.
- **Intent-to-treat analysis:** All eligible users, regardless of segment, to check for unintended effects.

### Duration

- **4 weeks** (per ImplementationPlan.md Phase 1 timeline).
- Week 1 is burn-in (stabilise assignment, detect instrumentation bugs). Analysis runs on Weeks 2–4.

## Primary Metrics

| Metric | Definition | Success Threshold |
| :--- | :--- | :--- |
| **New-Category Trial Rate** | (Users who add-to-cart and purchase ≥1 electronics item, with no prior electronics purchase in 90 days) / (Total users in variant who viewed ≥1 electronics product page) | Statistically significant lift (p < 0.05) vs. control. No pre-set effect-size target — we are learning, not optimising to a number. |

## Guardrail Metrics (Kill Signals)

Per ProblemStatement.md's counter-metrics/guardrails:

| Guardrail | Definition | Kill Threshold |
| :--- | :--- | :--- |
| **Grocery Completion Rate** | % of grocery checkout sessions completed / initiated, in treatment vs. control | Any degradation ≥0.5 pp (statistically significant). The primary habit loop outranks the growth goal. |
| **Time-to-Checkout (Grocery)** | Median time from first item add to checkout completion for grocery orders | Any increase ≥5% vs. control. |
| **Return/Complaint Rate (Electronics)** | Returns or complaints filed within 7 days of an electronics purchase, treatment vs. control | Any statistically significant increase. A spike means the badge is driving trials into bad experiences — per ProblemStatement.md, this is "worse than no intervention." |

## Secondary / Diagnostic Metrics

| Metric | Why Tracked |
| :--- | :--- |
| **Badge impression rate** | Confirms the badge is rendering correctly and is visible. |
| **Badge click-through rate** | Measures whether users engage with the expanded trust detail — tests if the signal format is compelling. |
| **Cart-add rate on badge-viewed products** | Isolates badge influence from general electronics interest. |
| **Electronics product page dwell time** | Indicates whether the badge is causing users to spend more time evaluating (desired) vs. confusing them (undesired). |

## Instrumentation

### Events to Log

| Event Name | Payload | Trigger |
| :--- | :--- | :--- |
| `trust_badge_impression` | user_id, product_id, variant, timestamp | Badge renders on product card in grid view |
| `trust_badge_click` | user_id, product_id, variant, timestamp | User taps/clicks the badge to expand |
| `trust_detail_impression` | user_id, product_id, variant, timestamp | Expanded trust detail renders in modal |
| `electronics_cart_add` | user_id, product_id, variant, price, timestamp | User adds an electronics item to cart |
| `electronics_purchase` | user_id, order_id, product_id, variant, price, timestamp | Checkout completed with ≥1 electronics item |
| `electronics_return` | user_id, order_id, product_id, variant, timestamp | Return/complaint filed on electronics item |
| `grocery_checkout_complete` | user_id, order_id, variant, duration_ms, timestamp | Grocery order checkout completed |

### Data Quality Checks (Week 1 Burn-in)

- Verify 50/50 split is balanced (no systematic skew by city, device, or tenure).
- Confirm badge renders on all eligible product pages in treatment (no silent failures).
- Confirm control group sees zero badge impressions (no cross-contamination).
- Check for sample-ratio mismatch (SRM) — a standard integrity check before analysis.

## Analysis Plan

### Primary Analysis (End of Week 4)

1. Compute trial rate for the refined cohort (habituated grocery regulars, no prior electronics purchase) in treatment vs. control.
2. Two-proportion z-test, α = 0.05, two-tailed.
3. Report: point estimate of lift, 95% CI, p-value.
4. Check all guardrail metrics. If any guardrail fires, report the experiment as "guardrail violated" regardless of primary metric result.

### Subgroup Analyses

- By user tenure (3–6 months, 6–12 months, 12+ months): does the badge work differently for newer vs. more entrenched users?
- By session intent (search vs. browse): per Pattern E (ProblemStatement.md), most users are in intent mode. Does the badge work better for users who searched for an electronics product (high intent) vs. those who browsed the category page?
- By product price tier (under ₹500, ₹500–1500, above ₹1500): per Pattern C (fee economics), small/cheap trial baskets are disproportionately punished by fees. Does the badge move behaviour more for lower-priced items where fees are a smaller fraction?

### Decision Matrix

| Primary Result | Guardrails | Decision |
| :--- | :--- | :--- |
| Significant lift | All clear | **Proceed to Phase 2** — automate signal production |
| Significant lift | One or more violated | **Pause** — investigate and fix guardrail violation before proceeding |
| No significant lift | All clear | **Pivot** — the information-vacuum hypothesis may not be the primary root cause; revisit fee economics or mental-model interventions |
| No significant lift | One or more violated | **Kill** — intervention is neutral at best and harmful at worst |

## Exit Criteria (Restated from ImplementationPlan.md)

1. Trial rate for electronics is measurably higher in the badge cohort versus holdout (statistical significance, not just directional).
2. Grocery completion rate and time-to-checkout show no degradation.
3. Return/complaint rate on badge-influenced electronics trials does not spike above baseline.
