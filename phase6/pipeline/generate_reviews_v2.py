"""V2: 10x reviews with product-specific voice, split into per-category files.

Improvements over v1:
  - 50-300 reviews per product (10x scale), variable per product
  - Category-specific template pool (25-30 per sentiment) — no generic "product
    is good" fill; every line references the category or a real attribute
  - ~35% of reviews interpolate the product name so the review reads as
    specifically about that SKU
  - Split output: reviews live in phase6/data/reviews/{category}.json,
    main catalog stays slim so the store loads fast
  - Product avg_rating preserved — rating_distribution() is unchanged, just
    with a larger sample size per product
"""
import json
import os
import random
import sys
from collections import defaultdict
from pathlib import Path


# ---------- REVIEWER POOL ----------------------------------------------------
FIRST_NAMES = [
    "Aarav","Aditya","Ankit","Anmol","Arjun","Ayush","Karan","Kartik","Nikhil",
    "Rahul","Rohan","Rohit","Rishabh","Sahil","Siddharth","Tarun","Varun","Vikram",
    "Yash","Aman","Devansh","Gaurav","Harsh","Ishaan","Kabir","Krish","Manav",
    "Priya","Pooja","Anjali","Divya","Isha","Kavya","Meera","Neha","Nisha",
    "Pallavi","Ritika","Shreya","Sneha","Tanvi","Vaishnavi","Aditi","Ananya",
    "Bhavana","Chitra","Deepika","Kritika","Payal","Radhika","Simran","Sonali",
    "Ayesha","Farhan","Imran","Rehan","Zoya","Aliya","Fatima","Rida","Hiba",
    "Arun","Bala","Chandra","Ganesh","Karthik","Naveen","Praveen","Sundar","Ravi",
    "Deepak","Manish","Rajesh","Sanjay","Suresh","Vinay","Amit","Sagar","Harish",
    "Sameer","Ashish","Ashwin","Rajat","Shrey","Aryan","Aryaman","Nishant","Shubham",
    "Snehal","Trisha","Preeti","Ruchi","Deepa","Sakshi","Kriti","Nidhi","Roshni",
    "Piyush","Jatin","Mohit","Pranav","Utkarsh","Karan","Ajay","Vishal","Rishi",
]
LAST_INITIALS = list("ABCDGHJKMNPRSTVYW")


def reviewer_name(rng):
    return f"{rng.choice(FIRST_NAMES)} {rng.choice(LAST_INITIALS)}."


# ---------- CITY POOL --------------------------------------------------------
CITIES = ["Bengaluru", "Mumbai", "Pune", "Delhi", "Gurugram", "Hyderabad",
          "Chennai", "Noida", "Kolkata", "Ahmedabad", "Kochi", "Chandigarh",
          "Jaipur", "Indore", "Lucknow", "Coimbatore", "Nagpur", "Bhubaneswar"]


# ---------- TEMPLATES: (theme, text) tuples ---------------------------------
# {p} is replaced with product name in ~35% of reviews for specificity.
# Voice is consistently Indian working-professional (25-40).
# ----------------------------------------------------------------------------

def T(theme, text):
    """Shorter constructor to keep the tables readable."""
    return (theme, text)


# ---------- ELECTRONICS ------------------------------------------------------
ELECTRONICS_POS = [
    T("sound", "Sound quality is crisp on Zoom calls, colleagues can hear me clearly. No lag."),
    T("battery", "Battery holds through a full 8-hour WFH day plus evening standup — big win."),
    T("battery", "Charged once, lasted my entire day of client calls. Way above what I expected."),
    T("build", "Build feels premium, doesn't feel plasticky like the cheap alternatives I tried."),
    T("build", "The {p} feels solid in hand — no rattles, no loose parts."),
    T("comfort", "Wore these for a 3-hour call, no ear fatigue. Very comfortable design."),
    T("comfort", "Fit is perfect for long commutes — Bengaluru traffic tested and approved."),
    T("connectivity", "Pairs instantly with my work laptop, my phone, everything. No connection drops."),
    T("connectivity", "Multi-device switching works flawlessly. From laptop to phone in 2 seconds."),
    T("value", "For ₹2K, this outperforms my old Boat/JBL. Working from home just got easier."),
    T("value", "Same features as the ₹5K models I saw at Croma. Genuine bargain."),
    T("delivery", "Ordered before a critical demo call, arrived in 10 mins. Blinkit is a WFH lifesaver."),
    T("delivery", "Late-night order for a client meeting the next morning — Blinkit delivered at 11pm. Perfect."),
    T("packaging", "Sealed box, all accessories inside, warranty card included. Genuine product."),
    T("packaging", "Original packaging, tamper-proof. Not the fake stuff you get on some marketplaces."),
    T("audio_quality", "Bass is punchy for my music, clear for calls. Best of both."),
    T("noise_cancel", "ANC actually works — cuts out my building's construction noise during calls."),
    T("noise_cancel", "Ambient mode is great for when I need to hear my delivery person while on a call."),
    T("charging", "Fast charging is legit — 15 mins gave me 2 hours of use before my next standup."),
    T("charging", "USB-C is a blessing, same cable as my laptop and phone. Less desk clutter."),
    T("aesthetic", "Looks clean on my WFH desk setup. Colleagues on video calls have asked what it is."),
    T("first_experience", "The {p} exceeded my expectations. Genuine 5 stars, would buy again for my team too."),
    T("first_experience", "Second day of use and I'm already recommending it to my whole team."),
    T("mic_quality", "Mic clarity is fantastic — no complaints from my team during long project discussions."),
    T("setup", "Plug and play, no complicated setup. Ready to use in under a minute."),
    T("portability", "Slips into my laptop bag easily. My daily WFH-to-cafe kit is complete."),
    T("value", "Way more than I paid for. Loud, clear, and reliable — every SDE should have one."),
    T("first_experience", "Bought after reading reviews — they were right. Great pick."),
]
ELECTRONICS_MIX = [
    T("sound", "Sound is good for the price but bass is a bit weak. Fine for calls, decent for music."),
    T("battery", "Battery is okay — not the advertised 8 hours, closer to 6 in real use. Still enough for a workday."),
    T("build", "Feels a bit plasticky for the price but performs well enough. Function over form."),
    T("comfort", "Fits fine but gets a little uncomfortable after 4+ hours. Take a break between calls."),
    T("connectivity", "Pairs quickly with laptop, but sometimes flakes out with my Android phone. Restart fixes it."),
    T("value", "Product is good but I've seen it cheaper on Amazon during sales. Convenience wins here."),
    T("audio_quality", "Sound is clear enough but audiophiles will find it lacking. Not for critical listening."),
    T("charging", "Charges reasonably fast but not as fast as marketed. Overnight charge is safest."),
    T("mic_quality", "Mic is fine indoors, picks up too much background outdoors. Better for WFH than commute."),
    T("first_experience", "Does the job but doesn't wow. Solid 3-star product at a 4-star price."),
    T("packaging", "Product is good, packaging felt light. Arrived fine but I was nervous handling it."),
    T("noise_cancel", "ANC works but not as strong as premium models. Enough to cut down traffic noise."),
]
ELECTRONICS_NEG = [
    T("battery", "Battery drained within 3 hours of use. Nothing like the marketed spec."),
    T("build", "Started rattling within a week. Feels like a QC miss."),
    T("connectivity", "Kept disconnecting during important calls. Had to switch back to my old set."),
    T("mic_quality", "Mic quality is bad — team said I sounded muffled the whole call. Returning."),
    T("sound", "Sound is tinny, no bass at all. Even my old ₹500 earphones sound better."),
    T("first_experience", "The {p} stopped working after 3 weeks. Returning through the app."),
    T("charging", "Charging port went bad in a month. Now it doesn't hold charge."),
    T("value", "Overpriced for what you get. Don't recommend."),
]

# ---------- PERSONAL_CARE_BEAUTY --------------------------------------------
BEAUTY_POS = [
    T("effectiveness", "Skin feels much better after 2 weeks of consistent use. Perfect for AC-office skin."),
    T("effectiveness", "Not greasy, absorbs fast — great before a client meeting or video pitch."),
    T("skin_type", "Works well on my combination skin. Non-greasy, non-comedogenic as promised."),
    T("skin_type", "My dry Delhi winter skin loves this. Hydration lasts through the day."),
    T("fragrance", "Fragrance is subtle, office-appropriate. No overwhelming scent."),
    T("fragrance", "The {p} has a light, clean smell — perfect for a professional setting."),
    T("packaging", "Solid pump dispenser, no leaks in the laptop bag. Travel-friendly for offsites."),
    T("packaging", "Well-sealed, hygienic packaging. Not the flimsy stuff you get sometimes."),
    T("value", "Cheaper than Nykaa, delivered same-day. Switched permanently."),
    T("value", "For this quality, ₹500 is a steal. My daily driver now."),
    T("results", "Two weeks in and my colleagues are asking what changed. Definitely working."),
    T("results", "Cystic acne cleared up in a month. Actually delivers on its claims."),
    T("dermatologist", "My dermatologist recommended this brand. Genuine and effective."),
    T("delivery", "Ordered before a big pitch, arrived same day. Skin looked fresh on the video call."),
    T("delivery", "Late-night order, delivered morning. Perfect for my always-on work life."),
    T("first_experience", "Bought after a colleague's recommendation. She was right, it works."),
    T("first_experience", "The {p} is now a staple in my daily routine. Highly recommend."),
    T("sensitivity", "Very sensitive skin here — no reaction at all. Rare find."),
    T("consistency", "Batch after batch, same quality. Reliable purchase."),
    T("winter_care", "Great for the harsh Delhi/Bengaluru winter transitions. Skin stays supple."),
    T("summer_care", "Non-sticky in Mumbai humidity. Doesn't feel heavy on hot days."),
    T("post_gym", "Gentle enough to use after gym without stripping my skin. Post-workout essential."),
    T("makeup_base", "Great base under makeup — no pilling before my morning presentation."),
    T("value", "Half the price of the imported version, similar results. Won't switch back."),
    T("aroma_therapy", "Fragrance genuinely relaxes me after a long project week. Small luxury."),
]
BEAUTY_MIX = [
    T("effectiveness", "Works but takes a couple of weeks to show results. Be patient."),
    T("fragrance", "Fragrance is stronger than I'd like — subtle would be more office-friendly."),
    T("packaging", "Product is good but the pump can be temperamental. Sometimes dispenses too much."),
    T("skin_type", "Works for combination skin but people with very oily skin might find it heavy."),
    T("value", "Effective but not cheap. Wait for a Blinkit discount if possible."),
    T("results", "Some improvement but not dramatic. Might need 2 months to really see the change."),
    T("consistency", "Sometimes the texture feels different between batches. Quality control could be better."),
    T("dermatologist", "Good for daily use but consult a derm if you have specific concerns."),
    T("first_experience", "The {p} is okay — nothing exceptional but nothing wrong either."),
    T("summer_care", "Feels a bit heavy in peak summer. Fine in winter."),
]
BEAUTY_NEG = [
    T("skin_type", "Caused irritation on my sensitive skin. Patch-test before committing."),
    T("effectiveness", "No visible improvement after a month. Wasted money."),
    T("packaging", "Bottle was leaking when it arrived. Had to throw half of it out."),
    T("fragrance", "Fragrance is overpowering, gave me a headache. Not for me."),
    T("first_experience", "Broke out badly using the {p}. Returning."),
]

# ---------- PHARMACY_HEALTH -------------------------------------------------
PHARMA_POS = [
    T("effectiveness", "Long hours at my desk gave me back pain — this helped in just 2 days of use."),
    T("effectiveness", "Cold from my building's AC caught up with me. This helped me recover in time for a client visit."),
    T("brand_trust", "Reliable brand, genuine product. My go-to for the office medicine kit."),
    T("brand_trust", "The {p} is a trusted name — no concerns about authenticity here."),
    T("value", "Same as chemist price, delivered instantly. Perfect when I can't step away from calls."),
    T("value", "Comparable to any local pharmacy, but the convenience of doorstep is unmatched."),
    T("desk_life", "Keeping this in my office drawer for those late-work headaches."),
    T("desk_life", "Perfect for the WFH first-aid kit. Long project weeks need this."),
    T("packaging", "Sealed, verified expiry date visible. Safe medicine."),
    T("packaging", "Original packaging with hologram. Not the fake stuff you sometimes get online."),
    T("delivery", "Ordered when my kid had fever at 11pm — Blinkit delivered before midnight. Grateful."),
    T("delivery", "When I couldn't leave a client call, Blinkit brought it to my desk in 15 minutes."),
    T("family_use", "Keeping stocked for the whole family. Peace of mind for a working parent."),
    T("first_experience", "First time trying this brand — pleasantly effective. Will reorder."),
    T("wfh_essential", "WFH life means more headaches from screen time. This is now a staple."),
    T("wfh_essential", "Anti-acidity after client-dinner catch-ups. Working professional survival kit."),
    T("chronic_use", "Been using this for months for daily needs. Consistent, no side effects."),
    T("post_workout", "For post-gym muscle soreness — works better than the branded competitors I tried."),
    T("recovery", "Recovered from viral fever in 3 days with this. Worked as expected."),
    T("consistency", "Same batch consistency, always effective. Reliable."),
    T("value", "Doorstep price matches the pharmacy. No commission, no markup. Fair."),
    T("dose_form", "Easy to swallow, quick action. Good for busy schedules."),
    T("emergency_stock", "Great to keep on hand for those sudden headaches during quarterly reviews."),
]
PHARMA_MIX = [
    T("effectiveness", "Works but takes longer than the marketed 15 minutes. Give it 30-40 mins."),
    T("taste", "Effective but tastes horrible. Function over form."),
    T("value", "Same as pharmacy, no discount. But the convenience is worth it."),
    T("brand_trust", "Genuine brand, but this batch felt slightly weaker. Might just be my imagination."),
    T("first_experience", "The {p} did the job but I've had faster results with other brands."),
    T("dose_form", "Effective but tablet size is a bit big — hard to swallow for some."),
]
PHARMA_NEG = [
    T("effectiveness", "Didn't help at all — my back pain stayed the same after 5 days."),
    T("packaging", "Bottle was open when it arrived, seal broken. Returned immediately."),
    T("brand_trust", "Suspect this might be counterfeit — smells different from what I'm used to."),
    T("first_experience", "Bad reaction to the {p}. Not for me. Consult a doctor before trying."),
]

# ---------- BABY -------------------------------------------------------------
BABY_POS = [
    T("softness", "Soft on baby's skin — no rashes, no complaints. Been using for months."),
    T("softness", "The {p} is genuinely gentle. My baby's skin has never been better."),
    T("absorbency", "Absorbency is fantastic — no leaks overnight. Working mom life needs this."),
    T("absorbency", "Even during long car rides, no leaks. Reliable for busy families."),
    T("delivery", "Working mom, ran out at 11pm — Blinkit saved the night."),
    T("delivery", "Ordered from my office, arrived before I got home. Life-saver during sprint week."),
    T("bulk_pack", "Bulk pack, best value. Lasts my baby a full month easily."),
    T("bulk_pack", "Great value for the pack size. Worth stocking up for working parents."),
    T("skin_safe", "Dermatologist-tested, works well for my baby's sensitive skin."),
    T("skin_safe", "Hypoallergenic as claimed. Peace of mind for a first-time working parent."),
    T("value", "Same as the pharmacy, but delivered when I need it. Working parent gold."),
    T("value", "Best price I've found. Better than the mall stores near my office."),
    T("packaging", "Well-sealed, hygienic packaging. Batch date is fresh."),
    T("smell", "Fresh, gentle fragrance. Not overpowering like some baby brands."),
    T("smell", "The scent is very light — perfect for baby's delicate nose."),
    T("first_experience", "First time buying this brand — my baby loves it. Reordering."),
    T("consistency", "Same quality every time. Reliable for my baby's daily routine."),
    T("brand_trust", "Trusted brand, safe ingredients. No worries about what's touching my baby."),
    T("brand_trust", "Been using this brand since my first child — always reliable."),
    T("night_ordering", "Ordered at 2am during a diaper emergency. Delivered by 2:20am. Blinkit for the win."),
    T("busy_parent", "Full-time working parent — this app + this product = sanity saver."),
    T("second_child", "Used this for both my kids. Consistent quality across years."),
    T("fit", "Great fit for my growing toddler. No leaks, no chafing."),
    T("value", "Affordable and effective. Working parents need reliable baby essentials."),
]
BABY_MIX = [
    T("absorbency", "Good absorbency but not the best for overnight. Fine for daytime."),
    T("fit", "Fit is a bit tight around the waist for my chubby baby. Size up if unsure."),
    T("skin_safe", "Works for my baby but might not for very sensitive skin. Test first."),
    T("packaging", "Product is good but packaging feels wasteful — too much plastic."),
    T("first_experience", "The {p} is decent but I still prefer another brand. Personal preference."),
    T("value", "Good product, price could be better. Wait for a sale on Blinkit."),
]
BABY_NEG = [
    T("skin_safe", "Gave my baby a rash. Switched to another brand."),
    T("absorbency", "Leaked through within 2 hours. Not the overnight promise it claims."),
    T("first_experience", "Bad experience with the {p}. Baby was uncomfortable. Returning."),
]

# ---------- HOME_CLEANING ---------------------------------------------------
CLEAN_POS = [
    T("effectiveness", "WFH means more mess. This handles it well, doesn't smell too chemical."),
    T("effectiveness", "Cleans quickly, no scrubbing needed. Perfect for a quick weekend clean."),
    T("scent", "Sunday morning cleaning routine — this makes it 20 minutes instead of an hour."),
    T("scent", "Fresh scent, not overpowering. Great after a workweek deep-clean."),
    T("value", "Cheaper than the supermarket. Fast delivery, same quality."),
    T("value", "The {p} punches above its price. Won't switch back."),
    T("bulk_pack", "Bulk bottle lasts weeks. Best value for a working parent home."),
    T("residue", "No residue left behind. Floors look clean, not sticky."),
    T("dilution", "Concentrated formula — a little goes a long way. Cost-effective."),
    T("dilution", "Dilutes well, doesn't waste product. Smart formulation."),
    T("stain_removal", "Removed a coffee stain from my white kitchen counter in one wipe."),
    T("stain_removal", "Even old stubborn stains came off. Impressive."),
    T("wfh_life", "WFH parent — need reliable cleaning basics. This delivers."),
    T("wfh_life", "Sunday routine essential. Gets me ready for the next work week."),
    T("delivery", "Ran out on a busy Monday — Blinkit delivered while I was on a call."),
    T("delivery", "Ordered during a client meeting break, arrived by lunch. Perfect timing."),
    T("packaging", "Sturdy bottle, no leaks. Ready to use out of the box."),
    T("packaging", "Well-designed cap — doesn't drip after use. Clean storage."),
    T("first_experience", "First time trying this — impressive results. Reordering."),
    T("multi_surface", "Works on multiple surfaces around my apartment. Versatile."),
    T("safe_for_kids", "Safe for use around my toddler. Reassuring for a working parent."),
    T("safe_for_pets", "My cat doesn't react to the smell. Pet-safe as claimed."),
    T("time_saving", "Cuts my weekend cleaning in half. Time back for family."),
    T("shine", "Left my glass surfaces streak-free. Great finish."),
]
CLEAN_MIX = [
    T("scent", "Cleans well but the smell is strong. Ventilate the room while using."),
    T("effectiveness", "Works on most stains, struggles with the really stubborn ones. Fair."),
    T("packaging", "Product is good but the bottle design could be better. Sometimes hard to grip."),
    T("dilution", "Concentrated but I feel I need to use more than recommended for tough messes."),
    T("first_experience", "The {p} is decent. Not the best I've used, not the worst."),
    T("value", "Good product, price is a bit steep for the size. OK on sale."),
]
CLEAN_NEG = [
    T("effectiveness", "Barely cleans anything. Marketing was misleading."),
    T("scent", "Terrible smell — like industrial chemicals. Won't use again."),
    T("packaging", "Bottle cap broke off in transit, product spilled everywhere. Bad packaging."),
]

# ---------- DAIRY_BREAD_EGGS -------------------------------------------------
DAIRY_POS = [
    T("freshness", "Fresh, ordered morning of a busy work day. Delivered before my 10am standup."),
    T("freshness", "Milk was cold, packaging intact. Better than the corner shop that leaves it out."),
    T("freshness", "Bread was soft, not stale. Fresh stock delivered."),
    T("routine", "Perfect for my daily breakfast routine — order the night before, ready by morning."),
    T("routine", "The {p} is a staple in my kitchen. Consistent quality."),
    T("value", "Same MRP as any store, but I don't have to leave my apartment for it."),
    T("value", "Fair pricing on essentials. Working parent life needs this."),
    T("delivery", "Ordered at 7am, arrived by 7:15am. Breakfast sorted before the day starts."),
    T("delivery", "Late-night craving for a snack — Blinkit delivered fresh bread at 11pm."),
    T("packaging", "Well-packaged, cold-chain maintained. Products arrive cold."),
    T("packaging", "Sealed carton, tamper-proof. Trusted."),
    T("brand_trust", "Standard trusted brand. No surprises, always reliable."),
    T("taste", "Tastes exactly as expected — no off-notes."),
    T("taste", "Fresh, natural taste. Better than the highway pit stops."),
    T("expiry", "Fresh dates on the pack — 5+ days of buffer. Good stock rotation."),
    T("expiry", "Long shelf life, no rush to consume."),
    T("kids_love", "My kids love this — repeat order every week."),
    T("kids_love", "Both my toddlers finished the packet in one sitting. That's a good sign."),
    T("first_experience", "First time trying this variant of the {p} — will reorder."),
    T("morning_essential", "Morning coffee needs milk — this app delivers it before I'm awake."),
    T("busy_family", "Working couple, no time for grocery runs. This keeps our fridge stocked."),
    T("bulk_order", "Ordered a week's worth in one shot. Arrived fresh, well-arranged."),
]
DAIRY_MIX = [
    T("freshness", "Usually fresh, but had one delivery close to expiry. Check the date."),
    T("packaging", "Product is fine but sometimes the milk pouch has minor leaks. Nothing major."),
    T("taste", "Tastes fine but I've had fresher from local dairy vendors. Trade-off for convenience."),
    T("expiry", "Sometimes only 2-3 days of buffer on expiry. Not ideal for bulk orders."),
    T("first_experience", "The {p} is average. Fine for regular use."),
    T("value", "MRP but no discount. Wait for a Blinkit deal."),
]
DAIRY_NEG = [
    T("freshness", "Milk was already sour when it arrived. Had to throw it out."),
    T("expiry", "Received a packet expiring the next day. Not acceptable."),
    T("packaging", "Egg carton was crushed — 6 out of 12 broken. Poor handling."),
]

# ---------- MUNCHIES ---------------------------------------------------------
MUNCHIES_POS = [
    T("taste", "Sprint week essential — perfect crunch between meetings."),
    T("taste", "Late-night code review snack. The {p} won't disappoint."),
    T("freshness", "Fresh packet, no stale packet issue like some other apps."),
    T("freshness", "Crispy right out of the bag. Blinkit rotates stock well."),
    T("packaging", "Sealed pouch, arrived crunchy. No air leaks."),
    T("value", "Same as the kirana, but I get it while still on the call."),
    T("value", "Cheaper than the office pantry vendor. Same product."),
    T("delivery", "Between-meeting snack. Ordered on my standup break, arrived by end of the call."),
    T("delivery", "Team ordering for a Friday chill session — everyone got theirs on time."),
    T("flavor", "This flavor is my go-to for late nights. Not too spicy, not too bland."),
    T("flavor", "Great masala kick. Perfect for a tea-time snack."),
    T("portion", "Perfect single-person portion. Fits my desk drawer."),
    T("portion", "The {p} pack size is right — not too much waste, not too little."),
    T("brand_trust", "Reliable brand, always the same quality. Trust matters."),
    T("first_experience", "First time trying this variant — new favorite."),
    T("late_night", "Late-night deadline food. Working professional survival kit."),
    T("shared_snack", "Team offsite snack — everyone loved it. Big win."),
    T("crunch", "Crunch level is perfect. Not stale, not too hard."),
    T("aftertaste", "No weird aftertaste. Just clean flavor."),
    T("mind_pack", "Great for my minimalist desk setup. Small packet, big flavor."),
]
MUNCHIES_MIX = [
    T("taste", "Tastes fine but not as good as I remembered. Might be a formula change."),
    T("portion", "Packet was smaller than I expected. Shrinkflation?"),
    T("freshness", "Fresh most of the time, but had one soft batch. Check on unboxing."),
    T("value", "Product is fine but I've seen it cheaper at the supermarket. Convenience price."),
    T("first_experience", "The {p} is okay — solid 3 stars. Nothing exciting."),
]
MUNCHIES_NEG = [
    T("freshness", "Stale packet. Blinkit needs to check stock rotation."),
    T("taste", "Off-taste — like the batch was old. Won't reorder this flavor."),
    T("packaging", "Bag was punctured on arrival. Half the packet was crushed."),
]

# ---------- COLD_DRINKS_JUICES ----------------------------------------------
DRINKS_POS = [
    T("temperature", "Post-lunch coma fix. Perfect fizz, cold on arrival."),
    T("temperature", "Chilled and delivered fast. Perfect for a hot summer WFH afternoon."),
    T("temperature", "The {p} came ice-cold — Blinkit's cold-chain is real."),
    T("value", "Cheaper than the office pantry vendor. Same product."),
    T("value", "Same MRP as the supermarket, no markup."),
    T("delivery", "Ordered a case for a team Friday chill session. Everyone was happy."),
    T("delivery", "Sunday brunch essential. Ordered while still in bed."),
    T("taste", "Refreshing, no watered-down feeling. Full-strength flavor."),
    T("taste", "Perfect balance of sweet and tangy. Not too sugary."),
    T("packaging", "Sealed bottle, no leaks in the delivery bag. Safe."),
    T("packaging", "Well-packed, insulated bag kept everything cold."),
    T("hydration", "Post-workout hydration. Working professional gym life needs this."),
    T("hydration", "Long meeting days — this keeps me going."),
    T("freshness", "Fresh stock — checked the batch date, days from packaging."),
    T("kids_treat", "Kids' after-school treat. Ordered while I was on a client call."),
    T("kids_treat", "My daughter's favorite. She asks for it after school every day."),
    T("summer_essential", "Peak summer in Delhi — this is my daily order. Life-saving."),
    T("post_meal", "Post-lunch fizz to shake off the afternoon slump. Working."),
    T("first_experience", "First time trying this — refreshing. Reordering."),
    T("brand_trust", "Trusted brand, standard quality."),
    T("juice_variety", "Pulpy, not the diluted stuff. Genuine juice."),
    T("bulk_order", "Team ordering for an offsite — 12 pack arrived perfectly cold."),
]
DRINKS_MIX = [
    T("temperature", "Not as cold as I hoped. Fine for a home fridge to top up."),
    T("taste", "Tastes fine but the sugar is more than I expected. Not for regular drinking."),
    T("packaging", "Product is good but the plastic bottle feels flimsy."),
    T("value", "Fair price but no savings vs the local store. Convenience premium."),
    T("first_experience", "The {p} is okay — solid choice but nothing wow."),
]
DRINKS_NEG = [
    T("freshness", "Expired can — noticed only after opening. Blinkit needs to check stock."),
    T("temperature", "Room temperature on arrival, defeats the purpose of a cold drink."),
    T("packaging", "Bottle leaked during transit. Half the drink was gone."),
]

# ---------- TEA_COFFEE -------------------------------------------------------
TEACOFF_POS = [
    T("aroma", "Fuel for my 9am standups. Strong, aromatic — exactly what I need."),
    T("aroma", "The {p} smells incredible when brewed. Perfect start to a work day."),
    T("strength", "Late-night code review companion. Perfect kick."),
    T("strength", "Full-bodied, doesn't need extra sugar. Real coffee."),
    T("taste", "Rich, smooth — no bitter aftertaste."),
    T("taste", "Blends perfectly with milk. Great morning cup."),
    T("value", "Same price as D-Mart but doorstep. No brainer."),
    T("value", "Office pantry favorite. Bought for team stock."),
    T("delivery", "Client visit prep — served this at the meeting, got compliments."),
    T("delivery", "Ran out on a Monday morning — Blinkit saved my standup."),
    T("packaging", "Airtight tin/pouch. Freshness locked in for weeks."),
    T("packaging", "Well-sealed, aroma preserved. No leakage."),
    T("routine", "Daily morning routine. This is what gets me through 9am calls."),
    T("routine", "The {p} is my afternoon-slump savior. Between-meeting essential."),
    T("first_experience", "First time trying this brand — will switch permanently."),
    T("green_tea", "Post-lunch green tea for my afternoon slump. Been using this for months."),
    T("brand_trust", "Reliable brand, consistent quality. Trust matters."),
    T("caffeine_kick", "Late-night deadline fuel. Strong, no jitters."),
    T("caffeine_kick", "Weekend catch-up on emails needs this. Real caffeine hit."),
    T("evening_calm", "Post-work chamomile — helps me disconnect after a long day."),
    T("gift_worthy", "Ordered as a gift for a colleague — she loved the packaging and taste."),
    T("bulk_order", "Team stock, everyone loves it. Office pantry MVP."),
]
TEACOFF_MIX = [
    T("aroma", "Good aroma but doesn't last as long as I hoped. Store airtight."),
    T("strength", "Strength varies between batches. Not always consistent."),
    T("value", "Great taste but wait for a Blinkit sale. Slightly pricey."),
    T("packaging", "Product is good but the pouch is flimsy. Transfer to a proper container."),
    T("first_experience", "The {p} is decent — fine for daily use, not a special cup."),
]
TEACOFF_NEG = [
    T("freshness", "Batch felt old — aroma was flat. Not the freshness I paid for."),
    T("taste", "Bitter and thin. Not what I expected from this brand."),
    T("packaging", "Pouch was torn on arrival, coffee spilled."),
]

# ---------- SUPPLEMENTS ------------------------------------------------------
SUPP_POS = [
    T("effectiveness", "Gym after work. This gives me sustained energy through the evening session."),
    T("effectiveness", "IT life meant weight gain — this helps me stay on track with my macros."),
    T("effectiveness", "The {p} actually delivers on its claims. Feeling the difference in 2 weeks."),
    T("authenticity", "Genuine product, authentic seal. Not the fake stuff you get on some sites."),
    T("authenticity", "Verified through the brand's authenticity code. Real deal."),
    T("value", "Same as HealthKart, delivered in 15 minutes. No wait."),
    T("value", "Cheaper than the gym vendor at my building. Fresh stock too."),
    T("recovery", "Post-workout recovery, feel the difference in a week."),
    T("recovery", "Muscle soreness reduced significantly. Working professional gym life needs this."),
    T("mixability", "Mixes smoothly with milk or water. No clumps."),
    T("mixability", "Blends with a shaker, no need for a blender. Perfect for office bags."),
    T("taste", "Doesn't taste like chalk unlike some other brands. Actually enjoyable."),
    T("taste", "Chocolate flavor is great — drinks like a milkshake."),
    T("delivery", "Ordered before my evening workout — arrived in time."),
    T("delivery", "Weekend gym stock ordered on Friday night, ready for Saturday session."),
    T("brand_trust", "Trusted brand, been using this for years. Reliable."),
    T("packaging", "Sealed tub with scoop inside. Fresh batch."),
    T("packaging", "Well-sealed, no product spilled during transit."),
    T("first_experience", "First time trying — will reorder. My new go-to."),
    T("weight_gain", "Helped me put on 3kg of clean muscle in 2 months. Legit."),
    T("weight_gain", "IT desk job means weight loss struggle — this helps me hit calorie targets."),
    T("multivitamin", "Daily energy is up since I started this. Working professional essential."),
    T("multivitamin", "Immunity boost during flu season. Office AC + travel = need this."),
    T("nutrition_label", "Nutrition label matches the brand's site. Genuine composition."),
    T("scoop_size", "Scoop is generous — full protein per serving as advertised."),
]
SUPP_MIX = [
    T("effectiveness", "Works but takes 3-4 weeks to notice. Be patient."),
    T("taste", "Effective but the flavor is meh. Chocolate is safer."),
    T("mixability", "Mostly mixes well but leaves a bit of foam on top."),
    T("value", "Same as competitors, no real savings. But delivery is faster than online alternatives."),
    T("first_experience", "The {p} is decent — I've tried better but also worse."),
    T("packaging", "Product is fine but scoop was missing in my pack. Contact support for a replacement."),
]
SUPP_NEG = [
    T("authenticity", "This felt fake — taste was way off from what I've been using for years."),
    T("effectiveness", "No difference after 6 weeks. Not what I hoped for."),
    T("packaging", "Tub was damaged in transit, seal was broken. Returned."),
    T("first_experience", "Bad reaction to the {p} — stomach discomfort. Not for me."),
]

# ---------- BOOKS ------------------------------------------------------------
BOOKS_POS = [
    T("content", "Weekend read after a hectic project week. Sealed cover, brand new."),
    T("content", "The {p} was a great pick — kept me hooked all Sunday."),
    T("condition", "Publisher-sealed, brand new. Not a used copy in disguise."),
    T("condition", "Perfect condition, no dents or scratches. Ready to gift."),
    T("delivery", "Ordered as a gift for a colleague's farewell. Delivered in time."),
    T("delivery", "Book club pick — everyone got theirs same-day. Amazing."),
    T("value", "Same as Amazon but no 2-day wait. Instant reading."),
    T("value", "Cheaper than the airport bookstore. Better selection too."),
    T("print_quality", "Hardcover feels premium, paper quality is thick and non-glaring."),
    T("print_quality", "Font size is comfortable for reading before bed."),
    T("paperback", "Paperback is lightweight — easy for commute reading."),
    T("author_love", "Author's writing style is engaging. Loved every page."),
    T("first_experience", "First book by this author — will read more."),
    T("weekend_read", "Perfect weekend companion after a hectic sprint week."),
    T("weekend_read", "The {p} was my Sunday-morning read with coffee. Bliss."),
    T("gift_worthy", "Bought as a gift, arrived beautifully packaged. Colleague loved it."),
    T("cover_design", "Cover design is stunning — display-worthy on my shelf."),
    T("self_help", "Actionable insights, not the fluff other self-help books have."),
    T("academic", "Great for exam prep — clear explanations, well-structured."),
    T("children", "My 8-year-old loved it. Age-appropriate illustrations."),
    T("relaxation", "After-work reading — helps me disconnect from work brain."),
    T("book_club", "Perfect pick for our monthly book club. Sparked great discussion."),
    T("bulk_order", "Ordered 4 copies for the office reading club. Uniform delivery."),
]
BOOKS_MIX = [
    T("content", "Content is great but the pace lags in the middle. Push through."),
    T("condition", "Book was fine but had a small dent on the corner. Minor cosmetic issue."),
    T("value", "Same price as online, no discount. Convenience of same-day is the value."),
    T("print_quality", "Print quality is okay but paper is a bit thin. OK for reading, not premium."),
    T("first_experience", "The {p} is decent — good for a one-time read."),
]
BOOKS_NEG = [
    T("condition", "Book arrived with torn pages. Poor packaging."),
    T("content", "Content didn't live up to the hype. Skimmed the second half."),
]

# ---------- STATIONERY_GAMES -------------------------------------------------
STAT_POS = [
    T("build_quality", "Perfect for a client presentation. Smooth writing, no smudge."),
    T("build_quality", "The {p} feels premium — solid grip, professional look."),
    T("write_smooth", "Ink flows smoothly, no scratchiness. Great for long note-taking sessions."),
    T("write_smooth", "No blotting, no drying out. Reliable pen for daily meetings."),
    T("delivery", "Ordered for a team offsite game night. Arrived before the offsite started."),
    T("delivery", "Last-minute client meeting prep — ordered pens at 8am, arrived by 9."),
    T("value", "Cheaper than the office supply store, delivered fast."),
    T("value", "Best value for the pack size. Great for team stock."),
    T("game_quality", "Cards are sturdy, high-quality print. Long-lasting."),
    T("game_quality", "Chess board is beautifully finished. Weighted pieces feel premium."),
    T("family_fun", "Family game night essential. Everyone loved it."),
    T("family_fun", "Weekend family time — perfect for a break from work."),
    T("office_supplies", "Office desk essential. My preferred pen for signing docs."),
    T("office_supplies", "Bulk pack for the team. Everyone thanked me."),
    T("art_supplies", "Great for my weekend hobby. Colors are vibrant, lasts long."),
    T("first_experience", "First time buying this — will reorder for the office."),
    T("gift_worthy", "Ordered as a farewell gift for a colleague. Nice presentation."),
    T("bulk_order", "10 notebooks for a project team — all arrived in perfect condition."),
    T("smoothness", "Writes smoothly on every paper type I've tried. Impressive."),
    T("aesthetic", "Looks great on my WFH desk. Colleagues on Zoom have commented."),
    T("students", "Kids' school supplies — good quality, fair price."),
]
STAT_MIX = [
    T("write_smooth", "Writes fine but the ink runs out faster than expected. Buy in bulk."),
    T("value", "Product is good but the pen is more expensive than at Stationery Mart. OK for the convenience."),
    T("game_quality", "Cards are okay but not as sturdy as premium brands. Fine for casual play."),
    T("first_experience", "The {p} is decent — solid 3 stars."),
]
STAT_NEG = [
    T("build_quality", "Pen tip broke within a week. Poor build."),
    T("game_quality", "Missing pieces from the game. Wasted evening."),
]

# ---------- SPIRITUAL --------------------------------------------------------
SPIRIT_POS = [
    T("aroma", "Sunday morning ritual essential. Fragrance is calming after a long week."),
    T("aroma", "The {p} has a soothing aroma — perfect for meditation."),
    T("burn_quality", "Burns evenly, long-lasting. Great value for the pack."),
    T("burn_quality", "No excessive smoke, clean burn. Suitable for indoor pooja."),
    T("delivery", "Ordered for a home pooja on a working day — arrived on time."),
    T("delivery", "Last-minute festival prep — Blinkit came through."),
    T("value", "Local temple prasadam shop price, same product."),
    T("value", "Cheaper than the market outside temples, same quality."),
    T("nostalgia", "Reminds me of home. Small comfort during a stressful project month."),
    T("nostalgia", "The scent takes me back to my childhood home. Precious."),
    T("packaging", "Well-packed, no breakage. Ready for use."),
    T("packaging", "Sealed pouch, aroma preserved."),
    T("authentic", "Genuine, temple-grade. Not the cheap alternatives."),
    T("authentic", "The {p} is what my grandmother would have bought."),
    T("first_experience", "First time trying this brand — will reorder."),
    T("festival_ready", "Ordered for Diwali/Pooja setup. Everything I needed in one order."),
    T("festival_ready", "Perfect for the festive week. Fast delivery matters."),
    T("daily_puja", "Daily morning pooja essential. Consistent quality."),
    T("relaxation", "Post-work aroma therapy. Helps me disconnect."),
    T("brand_trust", "Trusted brand, always fresh. Reliable."),
]
SPIRIT_MIX = [
    T("aroma", "Fragrance is nice but doesn't last as long as expected. Get 2 packets."),
    T("burn_quality", "Burns okay but some sticks are shorter than others. Inconsistent."),
    T("value", "Good product, price could be better. OK on offer."),
    T("first_experience", "The {p} is decent — nothing special."),
]
SPIRIT_NEG = [
    T("aroma", "Fragrance was overpowering, gave me a headache."),
    T("burn_quality", "Sticks broke easily. Poor quality control."),
]

# ---------- JEWELLERY --------------------------------------------------------
JWL_POS = [
    T("look", "Office-wear appropriate — subtle, not flashy. Perfect for a client meeting."),
    T("look", "The {p} looks premium — got compliments on video calls."),
    T("finish", "Polished finish, no rough edges. Ready to wear out of the box."),
    T("finish", "Fine detailing, better than the mall stores near my office."),
    T("delivery", "Bought as a small gift for a colleague. Well-packed, looked premium."),
    T("delivery", "Ordered during lunch break, arrived before I left work. Perfect for evening plans."),
    T("value", "Cheaper than the mall store, same brand. Delivered in the office lunch break."),
    T("value", "Great value for the design and quality."),
    T("everyday_wear", "Everyday wear, doesn't tarnish. Been wearing this for weeks."),
    T("everyday_wear", "Comfortable enough to wear from morning meetings to evening dinner."),
    T("packaging", "Beautiful box, gift-ready. No extra wrapping needed."),
    T("packaging", "Well-protected packaging, no damage."),
    T("skin_safe", "No skin irritation. Safe for sensitive skin."),
    T("skin_safe", "Nickel-free — no reactions after weeks of daily wear."),
    T("first_experience", "First time buying from this brand — impressed. Will reorder."),
    T("occasion", "Ordered for a colleague's wedding. Elegant and understated."),
    T("occasion", "Anniversary gift for my wife — she loved it. Perfect for a working couple."),
    T("size", "Sized perfectly as per the product page. No returns needed."),
    T("hallmark", "Hallmark verified — genuine gold/silver."),
    T("hallmark", "The {p} came with authenticity certificate. Peace of mind."),
]
JWL_MIX = [
    T("look", "Looks great but tarnished slightly after 2 months. Might need a polish."),
    T("size", "Size ran slightly small for my ring finger. Check sizing chart carefully."),
    T("value", "Good but I've seen better prices at brand outlets. Buying online for convenience."),
    T("first_experience", "The {p} is decent — solid piece but not showstopping."),
    T("packaging", "Product is fine but the box felt lightweight for a jewellery brand."),
]
JWL_NEG = [
    T("skin_safe", "Caused an allergic reaction — turned my finger green in a week."),
    T("look", "Looked much better in the photos. Real thing is underwhelming."),
    T("finish", "Rough edges, unfinished feel. Poor QC."),
]

# ---------- SPORTS_OUTDOOR ---------------------------------------------------
SPORTS_POS = [
    T("build_quality", "Weekend cricket with office colleagues. Solid build, no complaints."),
    T("build_quality", "The {p} feels durable — will last many weekend games."),
    T("grip", "Grip is comfortable — no slipping during sweaty long sessions."),
    T("weight", "Well-balanced weight — easy to swing for hours."),
    T("weight", "Lighter than my old one — faster reflexes."),
    T("delivery", "Ordered for a team building event. Arrived in time, went great."),
    T("delivery", "Weekend session — Blinkit delivered while I was at brunch."),
    T("value", "Cheaper than sports stores near me. Fast delivery, same quality."),
    T("value", "Great value for the tier. Recommended for casual players."),
    T("beginner", "Perfect for beginners like me. Started playing after 5 years — this works."),
    T("beginner", "Getting back into sports after WFH inactivity. This is a good start."),
    T("stress_buster", "After-work stress buster — badminton on weekdays."),
    T("stress_buster", "Weekend cricket session with the office crew. Highly recommended."),
    T("packaging", "Well-packed, no damage in transit."),
    T("first_experience", "First time buying sports gear online — pleasantly surprised."),
    T("fitness_gear", "Great for my post-work fitness routine. Working professional needs this."),
    T("fitness_gear", "Used the {p} for my weekend runs. Comfortable, no issues."),
    T("kids_gear", "My son loves it. Perfect for weekend outdoor play."),
    T("durability", "Been using for months — no wear and tear. Solid."),
]
SPORTS_MIX = [
    T("weight", "Balance is fine but feels slightly heavy after long sessions. OK for casual."),
    T("grip", "Grip is decent but wears out with heavy sweat. Rewrap regularly."),
    T("value", "Good product, price could be better. Fair for the tier."),
    T("first_experience", "The {p} is okay — good for beginners, not for pros."),
]
SPORTS_NEG = [
    T("build_quality", "Broke within 3 weekend games. Not durable at all."),
    T("grip", "Grip came off within a month. Poor quality."),
]

# ---------- ATTA_RICE_DAL ----------------------------------------------------
ARD_POS = [
    T("quality", "Regular monthly staple. Same quality as always, delivered to door."),
    T("quality", "The {p} makes soft, fluffy rotis. Exactly what I need."),
    T("value", "Bulk pack, best rate. Saves me a trip to the supermarket."),
    T("value", "Best price on this brand. Working parent life needs this."),
    T("packaging", "Sealed pack, no leakage. Fresh stock."),
    T("packaging", "Well-packed with a proper seal. No pest concerns."),
    T("delivery", "Working parent — this arriving quickly means I can cook dinner without stress."),
    T("delivery", "Ordered before Sunday meal prep — arrived in time. Reliable."),
    T("cooking", "Cooks well, no clumping. Great for weekday meal prep."),
    T("cooking", "Dal cooks in 2 whistles — perfect for busy weeknights."),
    T("brand_trust", "Genuine, sealed pack. Not the local repack you get elsewhere."),
    T("brand_trust", "Reliable brand, been using for years."),
    T("first_experience", "First time trying this variant — will reorder."),
    T("monthly_stock", "Monthly staple, ordered every 30 days like clockwork."),
    T("family_favorite", "My family loves it. Weekly dal-chawal essential."),
    T("nutrition", "Multigrain atta — healthy for a family. Notice the difference."),
    T("nutrition", "Basmati rice — long grains, aromatic. Perfect for biryani weekends."),
    T("consistency", "Same batch quality every time. Reliable."),
]
ARD_MIX = [
    T("packaging", "Packaging could be sturdier. Half a kilo spilled once during unpacking."),
    T("quality", "Usually good but had one batch that felt off. Might just be my imagination."),
    T("value", "Fair price, but I've seen better deals on Amazon Fresh."),
    T("first_experience", "The {p} is decent — nothing exceptional."),
]
ARD_NEG = [
    T("packaging", "Bag was torn on arrival, half the atta spilled in the delivery bag."),
    T("quality", "Rice had small stones — had to clean thoroughly. Poor sourcing."),
]

# ---------- MASALA_OIL -------------------------------------------------------
MOIL_POS = [
    T("quality", "Working parent — need reliable pantry stock. This delivers."),
    T("quality", "The {p} adds the perfect flavor to my dishes. Trusted brand."),
    T("authenticity", "Same brand my mom used, genuine seal. Trust matters here."),
    T("authenticity", "Authentic taste — real spices, not fillers."),
    T("value", "Bulk 5L pack, best price around. Lasts my family a month easily."),
    T("value", "Cheaper than the supermarket in my building."),
    T("packaging", "Sealed can/pouch, no leaks. Fresh stock."),
    T("packaging", "Well-sealed, aroma preserved."),
    T("cooking", "Essential for daily cooking. No compromise on quality."),
    T("cooking", "Adds authentic flavor — my wife noticed the difference."),
    T("delivery", "Cooking essential, monthly reorder. Never had a bad batch."),
    T("delivery", "Ran out during weekend cooking — Blinkit saved dinner."),
    T("brand_trust", "Trusted brand, consistent quality."),
    T("first_experience", "First time trying this — will reorder."),
    T("bulk_order", "Family-size pack, best value. Working couple needs this."),
]
MOIL_MIX = [
    T("value", "Product is good but price fluctuates. Sometimes MRP, sometimes discounted."),
    T("packaging", "Packaging is fine but the pour cap is stiff. Hard to use."),
    T("first_experience", "The {p} is okay — solid but not exceptional."),
]
MOIL_NEG = [
    T("authenticity", "Suspicious taste — felt diluted. Might be counterfeit."),
    T("packaging", "Cap broke on arrival, oil spilled everywhere."),
]

# ---------- INSTANT_FROZEN ---------------------------------------------------
INSTA_POS = [
    T("convenience", "Sprint week dinner solution. 5 min from packet to plate."),
    T("convenience", "Late-night hunger + WFH deadline = this. Life-saver."),
    T("convenience", "The {p} is my go-to for busy weeknights."),
    T("taste", "Tastes great for an instant meal. Better than most takeout."),
    T("taste", "Well-seasoned, no bland factor."),
    T("delivery", "Ordered before a critical release deployment. Ate at my desk, saved my evening."),
    T("delivery", "Hostel/PG friendly. Bachelor essential."),
    T("value", "Cheaper than Zomato dinner, faster than cooking from scratch."),
    T("value", "Best price on this brand. Working professional survival food."),
    T("packaging", "Sealed pouch, no punctures. Fresh."),
    T("packaging", "Well-packed, frozen items arrived properly frozen."),
    T("shelf_life", "Long shelf life, stocks well in my freezer."),
    T("shelf_life", "Perfect for stocking for those emergency-dinner weeks."),
    T("first_experience", "First time trying — will reorder."),
    T("family_favorite", "My whole family loves it. Weekend dinner essential."),
    T("busy_week", "Sprint weeks need this. Working professional survival kit."),
    T("weekend_treat", "Weekend movie night snack. Ordered while starting Netflix."),
]
INSTA_MIX = [
    T("taste", "Tastes okay — not the best but does the job when I'm too tired to cook."),
    T("convenience", "Cooking time is longer than the 5 mins claimed. More like 8-10."),
    T("value", "Product is fine but the pack size feels small for the price."),
    T("first_experience", "The {p} is decent — occasional convenience food."),
]
INSTA_NEG = [
    T("taste", "Tastes artificial. Won't reorder."),
    T("packaging", "Frozen pack arrived thawed. Refrozen but quality suffered."),
]

# ---------- INTIMATE_PERSONAL ------------------------------------------------
INT_POS = [
    T("discretion", "Discreet packaging as expected. Delivery partner didn't ask, no awkwardness."),
    T("discretion", "Neutral packaging, arrived quickly. Perfect for hostel/PG order privacy."),
    T("comfort", "The {p} is comfortable for all-day use. Working woman essential."),
    T("comfort", "No irritation, gentle formulation. Sensitive skin friendly."),
    T("value", "Same as chemist price, delivered to door. Convenience wins."),
    T("value", "Bulk pack, best rate. Monthly stock."),
    T("brand_trust", "Reliable brand, standard quality. Nothing to complain about."),
    T("brand_trust", "Trusted brand, been using for years."),
    T("delivery", "Ordered during a busy work day — arrived without hassle."),
    T("delivery", "Working woman life needs this app. Discreet, fast, reliable."),
    T("absorbency", "Great absorbency, no leaks during long meetings."),
    T("absorbency", "Overnight protection works well. Peaceful sleep."),
    T("packaging", "Well-sealed, hygienic. Trusted for personal care."),
    T("first_experience", "First time trying this brand — pleasantly effective."),
]
INT_MIX = [
    T("comfort", "Comfortable but the fit isn't as flexible as claimed. Sizing runs small."),
    T("value", "Same price as pharmacy, no discount. Convenience premium."),
    T("first_experience", "The {p} is fine — nothing special."),
]
INT_NEG = [
    T("comfort", "Caused irritation. Not for my skin type."),
    T("packaging", "Box was damaged, thought about returning."),
]

# ---------- PET --------------------------------------------------------------
PET_POS = [
    T("pet_love", "My dog loves it. Ordered before a long weekend so we wouldn't run out."),
    T("pet_love", "My cat is picky but ate the {p} without a fuss. Big win."),
    T("quality", "High-quality ingredients, my pet's coat looks healthier."),
    T("quality", "Vet-recommended, working well for my old dog."),
    T("value", "Cheaper than the pet store near me, and I don't have to lug the bag home."),
    T("value", "Best price on this brand. Monthly stock."),
    T("delivery", "Bought during a client visit — arrived before I finished my call. Life-saver."),
    T("delivery", "Ran out on a Sunday — Blinkit delivered before my dog's dinner time."),
    T("packaging", "Sealed bag, kibble is fresh."),
    T("packaging", "Well-packed, no spillage."),
    T("wfh_pet", "Working from home means my pet gets attention — this keeps her happy."),
    T("wfh_pet", "WFH parent to a rescue — this brand keeps my dog healthy."),
    T("first_experience", "First time trying — my pet loves it. Reordering."),
    T("brand_trust", "Trusted brand, been using for years. My pet is thriving."),
    T("nutrition", "Balanced nutrition, my vet approved this brand."),
    T("weight_management", "My pet's weight is stable — perfect maintenance food."),
]
PET_MIX = [
    T("pet_love", "My pet ate it but wasn't excited. Fine for maintenance."),
    T("value", "Product is good but shipping-time premium. Same as offline."),
    T("first_experience", "The {p} is decent — will try other brands too."),
]
PET_NEG = [
    T("quality", "My dog vomited after eating this. Might be a batch issue."),
    T("packaging", "Bag was torn, some kibble spilled."),
]

# ---------- VEGETABLES_FRUITS ------------------------------------------------
VF_POS = [
    T("freshness", "Fresh, not the wilted stock some quick-commerce apps send."),
    T("freshness", "The {p} arrived crisp and fresh. Better than the local sabziwala today."),
    T("ripeness", "Ripe fruits, ate one immediately after unpacking."),
    T("ripeness", "Perfect ripeness — not too green, not overripe."),
    T("delivery", "Ordered before a Sunday meal prep — fresh, good quality."),
    T("delivery", "Sunday cooking session — arrived in time, prepped by lunch."),
    T("value", "Comparable to my local sabzi wala. Convenience wins on busy work days."),
    T("value", "Best price on seasonal produce."),
    T("packaging", "Well-packed, no bruising."),
    T("packaging", "Fresh produce packaging keeps everything crisp."),
    T("nutrition", "Farm-fresh, feels healthier."),
    T("nutrition", "Organic option — visible difference in taste."),
    T("weekend_stock", "Weekend stock — lasts my working couple through the week."),
    T("first_experience", "First time ordering fresh produce online — pleasantly surprised."),
    T("family_cooking", "Perfect for my family's daily cooking. Reliable."),
]
VF_MIX = [
    T("freshness", "Usually fresh but had one order with wilted greens. Check on arrival."),
    T("ripeness", "Bananas were still green — will need 2-3 days to ripen."),
    T("value", "Slightly more expensive than the local vendor. Convenience premium."),
    T("first_experience", "The {p} was okay — not the freshest but usable."),
]
VF_NEG = [
    T("freshness", "Half the greens were spoiled on arrival. Waste."),
    T("ripeness", "Apples were mealy — old stock."),
]

# ---------- BISCUITS_BAKERY --------------------------------------------------
BIS_POS = [
    T("taste", "Between-meeting snack. Not too sweet, perfect with my chai."),
    T("taste", "The {p} pairs perfectly with my morning coffee."),
    T("freshness", "Fresh biscuits, no stale packet issue."),
    T("freshness", "Crunchy, right out of the pack."),
    T("value", "Family pack, best value. Weekly stock for the office desk."),
    T("value", "Same MRP as the supermarket, no premium."),
    T("delivery", "Kids' after-school snack. Ordered during my lunch break, arrived by their school time."),
    T("delivery", "Ordered while on a client call — arrived before the call ended."),
    T("packaging", "Well-packed, no breakage."),
    T("packaging", "Sealed pouch, freshness preserved."),
    T("kids_favorite", "My kids' favorite — reordered every week."),
    T("chai_time", "Perfect chai-time snack. Between-standups essential."),
    T("first_experience", "First time trying this variant — new favorite."),
    T("bulk_order", "Team ordering for the office pantry — everyone loved it."),
]
BIS_MIX = [
    T("taste", "Tastes fine but not as good as my childhood memory. Formula change maybe."),
    T("freshness", "Sometimes fresh, sometimes soft. Batch dependent."),
    T("first_experience", "The {p} is fine — solid biscuit."),
]
BIS_NEG = [
    T("freshness", "Stale packet. Blinkit needs to check stock."),
    T("packaging", "Half the biscuits were crushed. Poor handling."),
]

# ---------- SWEET_TOOTH ------------------------------------------------------
SWEET_POS = [
    T("taste", "Team birthday celebration at the office. Delivered right on time."),
    T("taste", "The {p} melted just right — chocolate lover approved."),
    T("temperature", "Chocolate arrived cool, not melted. Perfect condition."),
    T("temperature", "Ice cream arrived frozen solid. Blinkit's cold-chain works."),
    T("indulgence", "Post-sprint reward for myself. Sometimes you deserve a treat."),
    T("indulgence", "Small treat after a hard week. Chocolate lover approved."),
    T("delivery", "Ordered as a small thank-you for my delivery partner. Nice gesture."),
    T("delivery", "Late-night sweet craving — delivered in 12 minutes."),
    T("value", "Same brand price as any store. Getting it delivered is the flex."),
    T("value", "Great value pack, lasts a few evenings."),
    T("packaging", "Sealed, insulated packaging."),
    T("occasion", "For a colleague's birthday celebration — perfect timing."),
    T("occasion", "Team offsite dessert — everyone loved it."),
    T("first_experience", "First time trying — new favorite indulgence."),
    T("kids_love", "My kids' favorite — Sunday movie night essential."),
]
SWEET_MIX = [
    T("temperature", "Chocolate was slightly soft — melted but still good."),
    T("taste", "Tastes fine but the sugar is more than I remember. Perhaps my tastebuds."),
    T("first_experience", "The {p} is decent — solid sweet."),
]
SWEET_NEG = [
    T("temperature", "Ice cream arrived half-melted. Blinkit needs better cold packaging."),
    T("freshness", "Chocolate had a chalky white bloom — old stock."),
]

# ---------- TEMPLATE POOL LOOKUP --------------------------------------------
POOLS = {
    "electronics": (ELECTRONICS_POS, ELECTRONICS_MIX, ELECTRONICS_NEG),
    "personal_care_beauty": (BEAUTY_POS, BEAUTY_MIX, BEAUTY_NEG),
    "pharmacy_health": (PHARMA_POS, PHARMA_MIX, PHARMA_NEG),
    "baby": (BABY_POS, BABY_MIX, BABY_NEG),
    "home_cleaning": (CLEAN_POS, CLEAN_MIX, CLEAN_NEG),
    "dairy_bread_eggs": (DAIRY_POS, DAIRY_MIX, DAIRY_NEG),
    "munchies": (MUNCHIES_POS, MUNCHIES_MIX, MUNCHIES_NEG),
    "cold_drinks_juices": (DRINKS_POS, DRINKS_MIX, DRINKS_NEG),
    "tea_coffee": (TEACOFF_POS, TEACOFF_MIX, TEACOFF_NEG),
    "supplements": (SUPP_POS, SUPP_MIX, SUPP_NEG),
    "books": (BOOKS_POS, BOOKS_MIX, BOOKS_NEG),
    "stationery_games": (STAT_POS, STAT_MIX, STAT_NEG),
    "spiritual": (SPIRIT_POS, SPIRIT_MIX, SPIRIT_NEG),
    "jewellery": (JWL_POS, JWL_MIX, JWL_NEG),
    "sports_outdoor": (SPORTS_POS, SPORTS_MIX, SPORTS_NEG),
    "atta_rice_dal": (ARD_POS, ARD_MIX, ARD_NEG),
    "masala_oil": (MOIL_POS, MOIL_MIX, MOIL_NEG),
    "instant_frozen": (INSTA_POS, INSTA_MIX, INSTA_NEG),
    "intimate_personal": (INT_POS, INT_MIX, INT_NEG),
    "pet": (PET_POS, PET_MIX, PET_NEG),
    "vegetables_fruits": (VF_POS, VF_MIX, VF_NEG),
    "biscuits_bakery": (BIS_POS, BIS_MIX, BIS_NEG),
    "sweet_tooth": (SWEET_POS, SWEET_MIX, SWEET_NEG),
}


def pool_for(category, sentiment):
    pos, mix, neg = POOLS.get(category, ([], [], []))
    if sentiment == "positive":
        return pos or [T("product_quality", "Solid, would buy again.")]
    if sentiment == "mixed":
        return mix or [T("product_quality", "Decent, does the job.")]
    return neg or [T("product_quality", "Didn't work out for me.")]


# ---------- RATING / DATE / GENERATION --------------------------------------
def rating_distribution(avg):
    if avg >= 4.5: return [1, 2, 6, 25, 66]
    if avg >= 4.0: return [1, 3, 10, 35, 51]
    if avg >= 3.5: return [3, 7, 20, 40, 30]
    if avg >= 3.0: return [8, 15, 30, 30, 17]
    return [20, 25, 25, 20, 10]


def sentiment_for_rating(stars):
    return "positive" if stars >= 4 else "mixed" if stars == 3 else "negative"


def relative_date(rng):
    r = rng.random()
    if r < 0.3:
        d = rng.randint(1, 30)
        return f"{d} day{'s' if d != 1 else ''} ago"
    if r < 0.7:
        w = rng.randint(1, 12)
        return f"{w} week{'s' if w != 1 else ''} ago"
    m = rng.randint(3, 11)
    return f"{m} months ago"


def render_text(template_text, product_name, rng):
    """Interpolate {p} with product name ~35% of the time; else strip the placeholder."""
    if "{p}" not in template_text:
        return template_text
    if rng.random() < 0.35:
        return template_text.replace("{p}", product_name)
    # Fallback: replace {p} with a natural pronoun ("this", "it", etc.)
    return template_text.replace("the {p}", "this").replace("{p}", "this")


def generate_reviews_for_product(product):
    pid = product["product_id"]
    category = product["category"]
    name = product["product_name"]
    avg = product["trust_signals"]["avg_rating"]

    rng = random.Random(hash(pid) & 0xFFFFFFFF)
    n = rng.randint(50, 300)          # 10x of previous 5-30
    weights = rating_distribution(avg)

    reviews = []
    for i in range(n):
        stars = rng.choices([1, 2, 3, 4, 5], weights=weights, k=1)[0]
        sentiment = sentiment_for_rating(stars)
        pool = pool_for(category, sentiment)
        theme, text_tmpl = rng.choice(pool)
        text = render_text(text_tmpl, name, rng)

        reviews.append({
            "reviewer": reviewer_name(rng),
            "city": rng.choice(CITIES),
            "rating": stars,
            "date": relative_date(rng),
            "verified": rng.random() < 0.78,
            "theme": theme,
            "sentiment": sentiment,
            "text": text,
        })

    return reviews


# ---------- MAIN -------------------------------------------------------------
def main():
    root = Path(__file__).resolve().parents[1]
    data_path = root / "data" / "trust_signals_automated.json"
    reviews_dir = root / "data" / "reviews"
    reviews_dir.mkdir(parents=True, exist_ok=True)

    print(f"Reading {data_path}...")
    with open(data_path, encoding="utf-8") as f:
        data = json.load(f)

    products = data.get("products", [])
    print(f"Loaded {len(products)} products\n")

    # Bucket reviews by category, and strip the old `reviews` field off products
    reviews_by_cat = defaultdict(dict)
    total = 0
    counts = []

    for p in products:
        pid = p["product_id"]
        cat = p["category"]
        # Drop old inline reviews from main catalog
        p["trust_signals"].pop("reviews", None)

        revs = generate_reviews_for_product(p)
        reviews_by_cat[cat][pid] = revs
        n = len(revs)
        counts.append(n)
        total += n
        # Store a small summary on the product for UI display without loading reviews
        p["trust_signals"]["reviews_count"] = n

    # Write per-category review files
    for cat, m in reviews_by_cat.items():
        out = reviews_dir / f"{cat}.json"
        with open(out, "w", encoding="utf-8") as f:
            json.dump(m, f, ensure_ascii=False, indent=1)
        size_kb = os.path.getsize(out) // 1024
        print(f"  {cat:25} {len(m):3} products, "
              f"{sum(len(v) for v in m.values()):>6} reviews, "
              f"{size_kb:>5} KB")

    # Write slim catalog back
    data.setdefault("pipeline_metadata", {})["reviews_generated"] = True
    data["pipeline_metadata"]["reviews_per_product_range"] = "50-300"
    data["pipeline_metadata"]["total_reviews_generated"] = total
    data["pipeline_metadata"]["reviews_split_by_category"] = True

    with open(data_path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    catalog_kb = os.path.getsize(data_path) // 1024
    print(f"\nMain catalog: {catalog_kb:,} KB (slim)")
    print(f"Total reviews: {total:,}")
    print(f"Per product — min: {min(counts)}, max: {max(counts)}, avg: {total / len(counts):.1f}")


if __name__ == "__main__":
    main()
