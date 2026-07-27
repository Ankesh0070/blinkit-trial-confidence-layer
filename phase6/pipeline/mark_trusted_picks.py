"""Add a 'Blinkit Trusted' badge to select high-trust products.

Analog to Amazon's Choice / Flipkart Assured. A product qualifies if:
  A) It clears the strict quality bar:
     - avg_rating       >= 4.3
     - total_ratings    >= 500
     - repeat_purchase% >= 55
  B) Or it's a top-3 product in its category by a composite score, so
     every category has at least 3 Trusted Picks (no empty categories).

Writes:
  trust_signals.trusted_pick        (bool)
  trust_signals.trusted_pick_reason (short human string, shown in UI)
  trust_signals.trusted_pick_score  (float, so UI can rank)
"""
import json
import math
import sys
from pathlib import Path
from collections import defaultdict


# ---------- CRITERIA ---------------------------------------------------------
STRICT_MIN_RATING = 4.3
STRICT_MIN_TOTAL_RATINGS = 500
STRICT_MIN_REPEAT_PCT = 55

MIN_PER_CATEGORY = 3   # top-up floor so every category has some Trusted Picks


def composite_score(p: dict) -> float:
    """A single number to rank products within a category.

    rating drives most of the weight; a log of ratings tempers products
    that are only rated by a handful of users; repeat purchase adds a
    small kicker for products people come back to.
    """
    ts = p["trust_signals"]
    r = ts["avg_rating"]                  # 0-5
    n = ts["total_ratings"]               # up to ~5000
    rep = ts["repeat_purchase_pct"]       # 0-100
    return r * math.log10(max(n, 10)) * (1 + rep / 200)


def strict_reason(p: dict) -> str:
    """Explain why the strict rule fired — user-facing string."""
    ts = p["trust_signals"]
    parts = [
        f"{ts['avg_rating']}★ from {ts['total_ratings']:,}+ ratings",
        f"{ts['repeat_purchase_pct']}% reorder rate",
    ]
    return " · ".join(parts)


def topup_reason(p: dict, rank_in_cat: int) -> str:
    ts = p["trust_signals"]
    ordinal = ["#1", "#2", "#3"][rank_in_cat] if rank_in_cat < 3 else f"#{rank_in_cat+1}"
    return f"{ordinal} in this category · {ts['avg_rating']}★ · {ts['total_ratings']:,}+ ratings"


def main():
    root = Path(__file__).resolve().parents[1]
    data_path = root / "data" / "trust_signals_automated.json"
    if not data_path.exists():
        print(f"ERROR: {data_path} not found", file=sys.stderr)
        sys.exit(1)

    print(f"Reading {data_path}...")
    with open(data_path, encoding="utf-8") as f:
        data = json.load(f)

    products = data.get("products", [])
    print(f"Loaded {len(products)} products\n")

    # First pass: reset flags on every product
    for p in products:
        ts = p.setdefault("trust_signals", {})
        ts.pop("trusted_pick", None)
        ts.pop("trusted_pick_reason", None)
        ts.pop("trusted_pick_score", None)

    # Second pass: mark all products that clear the strict quality bar
    strict_count = 0
    for p in products:
        ts = p["trust_signals"]
        if (ts["avg_rating"] >= STRICT_MIN_RATING
                and ts["total_ratings"] >= STRICT_MIN_TOTAL_RATINGS
                and ts["repeat_purchase_pct"] >= STRICT_MIN_REPEAT_PCT):
            ts["trusted_pick"] = True
            ts["trusted_pick_reason"] = strict_reason(p)
            ts["trusted_pick_score"] = round(composite_score(p), 3)
            strict_count += 1

    # Third pass: top-up per category so every category has at least MIN_PER_CATEGORY
    # Trusted Picks. Rank all products in the category by composite_score, pick
    # top-N that aren't already flagged.
    by_cat: dict[str, list[dict]] = defaultdict(list)
    for p in products:
        by_cat[p["category"]].append(p)

    topup_count = 0
    for cat, cat_products in by_cat.items():
        already_flagged = sum(1 for p in cat_products if p["trust_signals"].get("trusted_pick"))
        need = MIN_PER_CATEGORY - already_flagged
        if need <= 0:
            continue
        # Rank unflagged products by composite score, pick top `need`
        unflagged = [p for p in cat_products if not p["trust_signals"].get("trusted_pick")]
        unflagged.sort(key=composite_score, reverse=True)
        for rank_in_cat, p in enumerate(unflagged[:need]):
            ts = p["trust_signals"]
            ts["trusted_pick"] = True
            ts["trusted_pick_reason"] = topup_reason(p, rank_in_cat)
            ts["trusted_pick_score"] = round(composite_score(p), 3)
            topup_count += 1

    # Write back
    total_picks = strict_count + topup_count
    print(f"Strict-rule picks : {strict_count}")
    print(f"Top-up picks       : {topup_count}")
    print(f"Total Trusted Picks: {total_picks} ({100 * total_picks / len(products):.1f}%)\n")

    # Per-category breakdown
    per_cat = defaultdict(int)
    for p in products:
        if p["trust_signals"].get("trusted_pick"):
            per_cat[p["category"]] += 1
    print("Per-category coverage:")
    for cat in sorted(per_cat):
        print(f"  {cat:25} {per_cat[cat]:3}")

    data.setdefault("pipeline_metadata", {})["trusted_picks_enabled"] = True
    data["pipeline_metadata"]["trusted_picks_total"] = total_picks
    data["pipeline_metadata"]["trusted_pick_rule"] = (
        f"avg>=4.3 AND ratings>={STRICT_MIN_TOTAL_RATINGS} AND repeat>={STRICT_MIN_REPEAT_PCT}%, "
        f"topped up to {MIN_PER_CATEGORY} per category by composite score."
    )

    print(f"\nWriting {data_path}...")
    with open(data_path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print("Done.")


if __name__ == "__main__":
    main()
