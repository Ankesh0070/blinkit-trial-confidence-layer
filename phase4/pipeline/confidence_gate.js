const fs = require('fs');

/**
 * SIMULATED PHASE 3 PIPELINE - CONFIDENCE THRESHOLD GATE
 * 
 * In production, this module sits between the UI and the Trust Signals Cache.
 * It evaluates the user's profile and decides:
 * 1. Should we show Trust Signals for this category? (Only if it's a new trial)
 * 2. Should we recommend this category at all? (Cold start fallback vs Personalised)
 */

function evaluateConfidenceGate(userProfile, categoryId, categoryDensityFlag) {
    console.log(`\nEvaluating Gate for User: ${userProfile.user_id}, Category: ${categoryId}`);
    
    // Check 1: Data Density
    if (categoryDensityFlag === 'sparse') {
        console.log("-> GATE CLOSED: Category data is sparse. Falling back to static defaults.");
        return { show_ai_signals: false, reason: "sparse_category" };
    }

    // Check 2: Has the user already purchased this in the last 90 days?
    const hasPurchased = userProfile.categories_purchased_90d.includes(categoryId);
    if (hasPurchased) {
        console.log("-> GATE CLOSED: User already habituated. Suppressing Trial Confidence UI.");
        return { show_ai_signals: false, reason: "already_habituated_90d" };
    }

    // Check 3: Does the user have ANY cross-category history? (Cold Start)
    const hasCrossCategoryHistory = userProfile.categories_purchased_90d.length > 1;
    if (!hasCrossCategoryHistory) {
        console.log("-> GATE OPEN (COLD START): User has no cross-category history. Recommending dense categories to build habit.");
        return { show_ai_signals: true, reason: "cold_start_recommendation" };
    }

    console.log("-> GATE OPEN: User has cross-category history, but this category is new to them.");
    return { show_ai_signals: true, reason: "personalised_trial_recommendation" };
}

// Simulated Execution
console.log("=== Confidence Threshold Gate Simulation ===");
const mockUser = {
    user_id: "user_b",
    categories_purchased_90d: ["groceries_fresh", "electronics"]
};
evaluateConfidenceGate(mockUser, 'pharmacy_health', 'dense');
evaluateConfidenceGate(mockUser, 'electronics', 'dense');
evaluateConfidenceGate(mockUser, 'pet', 'sparse');
