# Quantitative Survey Design: National Rollout Validation

## 1. Objective
To validate the initial "Trial Confidence" problem hypothesis beyond the initial Tier-2 pilot city (Varanasi), ensuring the root cause (friction caused by generic star ratings lacking context) applies at a national scale, specifically in Metro and Tier-3 demographic segments.

This addresses the "Sampling Bias Validation Gap" outlined in `EdgeCases.md`.

## 2. Target Audience
- **Sample Size:** 5,000 active quick-commerce users.
- **Demographic Split:**
  - 40% Metro (Delhi NCR, Mumbai, Bangalore)
  - 30% Tier-2 (Lucknow, Jaipur, Indore - Control group to compare against Varanasi)
  - 30% Tier-3 (Aligarh, Hubli, etc.)
- **Usage Profile:** Users who have placed >5 grocery orders in the last 60 days, but 0 non-grocery orders.

## 3. Core Questionnaire

**Q1. When buying electronics or beauty products, which app do you prefer?**
- [ ] Amazon / Flipkart
- [ ] Nykaa / Purplle (Beauty only)
- [ ] Blinkit / Zepto / Instamart
- [ ] Local Offline Stores

**Q2. (If Blinkit/Q-comm is NOT selected) Why do you prefer other platforms for these categories?**
- [ ] Better Pricing / Discounts
- [ ] Wider Selection of Brands
- [ ] Easier Returns / Warranty processing
- [ ] **I am unsure if the products are genuine / I don't trust the reviews.** *(Target Hypothesis)*

**Q3. When looking at a 4.5-star rating on a quick-commerce app for a high-value item (e.g. Earbuds), you typically think:**
- [ ] It's a great product, I can buy it safely.
- [ ] The rating is probably just about fast delivery, not the product quality. *(Inverted Root Cause Test)*
- [ ] The ratings are likely fake.
- [ ] I need to read the actual reviews to be sure.

**Q4. A/B Mockup Test**
*(Users are shown two mockups of a product page: one with generic stars (Control), one with the Phase 3 Trial Confidence Badges (Variant))*
**Which page makes you more likely to complete the purchase?**
- [ ] Option A (Control)
- [ ] Option B (Variant)
- [ ] Neither, I still wouldn't buy it here.

## 4. Success Criteria
The Phase 4 scale-up is considered validated if:
1. > 35% of Metro users select "Unsure if genuine / Don't trust reviews" in Q2.
2. Option B (Variant) in Q4 is chosen by > 65% of the total respondents.
3. The response distribution in Tier-3 matches the Varanasi baseline within a 5% margin of error.
