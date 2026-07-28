"""V3: Subcategory-specific reviews so cables don't get 'battery' reviews.

V2 pooled all templates at the CATEGORY level (electronics), which meant a
USB cable got "battery lasted 8 hours" or "sound is crisp" reviews. V3 pools
at the SUBCATEGORY level (electronics.cable vs electronics.earbuds vs
electronics.led) so every review is topically relevant to what the product
actually IS.

Same output structure as V2:
  - 50-300 reviews per product, variable
  - Rating distribution matches product's avg_rating
  - Working-professional voice
  - ~35% product-name interpolation
  - Split into phase6/data/reviews/{category}.json
"""
import json
import math
import os
import random
import sys
from collections import defaultdict
from pathlib import Path


# ---------- REVIEWER + CITY POOL --------------------------------------------
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
    "Piyush","Jatin","Mohit","Pranav","Utkarsh","Ajay","Vishal","Rishi",
]
LAST_INITIALS = list("ABCDGHJKMNPRSTVYW")
CITIES = ["Bengaluru","Mumbai","Pune","Delhi","Gurugram","Hyderabad","Chennai",
          "Noida","Kolkata","Ahmedabad","Kochi","Chandigarh","Jaipur","Indore",
          "Lucknow","Coimbatore","Nagpur","Bhubaneswar"]

def reviewer_name(rng):
    return f"{rng.choice(FIRST_NAMES)} {rng.choice(LAST_INITIALS)}."


# ============================================================================
# TEMPLATES BY (category, subcategory, sentiment)
# Every entry is a (theme, text) tuple. {p} = product name placeholder.
# ============================================================================

# -------------------- UNIVERSAL (delivery + basic packaging) ----------------
# These are safe to sprinkle sparingly (max ~20% of reviews) since they truly
# apply to any product. But we bias toward subcategory-specific text below.
UNIV_POS = [
    ("delivery", "Ordered at 9 PM before a client call the next morning, arrived in 12 minutes."),
    ("delivery", "Reached in under 15 minutes. Perfect for last-minute needs before Monday standup."),
    ("delivery", "Between sprint calls, needed this urgently. 10 mins flat."),
    ("delivery", "Working late again, ordered from my desk. Delivered while I was still in a meeting."),
    ("value", "Same MRP as any store, delivered to my apartment gate. Won't order elsewhere anymore."),
    ("value", "Compared with the local kirana — Blinkit had a better deal. Saved me a Sunday trip."),
]
UNIV_MIX = [
    ("delivery", "Delivery was on time but the delivery partner rushed off without letting me check."),
    ("value", "Product is fine, but I've seen better deals in local stores. Convenience is the trade-off."),
]
UNIV_NEG = [
    ("delivery", "Delivery took 45 minutes — not what Blinkit usually does. Missed my meeting slot."),
    ("packaging", "Bag was ripped when it reached. Had to inspect everything before accepting."),
]

# ============================================================================
# ELECTRONICS — per subcategory
# ============================================================================

EARBUDS_POS = [
    ("sound", "Sound quality is crisp on Zoom calls — colleagues can hear me clearly, no muffle."),
    ("sound", "Bass is punchy for music, clear for calls. Best-of-both for a working professional."),
    ("battery", "Battery holds through a full 8-hour WFH day plus evening standup. Solid."),
    ("battery", "Charged once, lasted my whole day of client calls. Above the marketed 6-hour spec."),
    ("comfort", "Wore these for a 3-hour call — no ear fatigue, very comfortable design."),
    ("comfort", "Fit is perfect for long Bengaluru commutes. Doesn't fall out."),
    ("connectivity", "Pairs instantly with my work laptop, phone, everything. No connection drops."),
    ("noise_cancel", "ANC actually works — cuts out my building's construction noise during calls."),
    ("noise_cancel", "Ambient mode is great for when I need to hear my delivery person while on a call."),
    ("mic_quality", "Mic clarity is fantastic. No complaints from my team on long project discussions."),
    ("mic_quality", "The {p} handles background noise really well — my kids in the next room aren't audible on calls."),
    ("charging", "Case charges fast — 15 mins gave me 2 hours of use before my next standup."),
    ("build", "The {p} feels premium in hand — no cheap plasticky feel."),
    ("value", "For under ₹2K, this outperforms my old Boat set. Solid earbuds."),
]
EARBUDS_MIX = [
    ("sound", "Sound is good for calls but bass is a bit weak for music."),
    ("battery", "Battery is okay — not the advertised 8 hours, closer to 6 in real use."),
    ("comfort", "Fits fine but gets uncomfortable after 4+ hours of continuous wear."),
    ("noise_cancel", "ANC works but not as strong as premium models. Enough for traffic though."),
]
EARBUDS_NEG = [
    ("battery", "Battery drained within 2 hours of use. Nothing like the spec."),
    ("connectivity", "Kept disconnecting during important calls. Had to switch back to my old set."),
    ("mic_quality", "Mic quality is bad — team said I sounded muffled the whole meeting."),
]

HEADPHONES_POS = [
    ("sound", "Full-range sound — great for both music and calls. Rich bass, clean vocals."),
    ("sound", "Studio-grade audio for the price. Great for weekend gaming after work."),
    ("comfort", "Cushioned earcups — wore them for 5-hour design sessions with zero fatigue."),
    ("comfort", "Adjustable band fits my head well — glasses-friendly too."),
    ("noise_cancel", "Passive noise isolation blocks my open-office chatter completely."),
    ("battery", "40-hour battery is real — charge once a week even with heavy WFH use."),
    ("build", "The {p} feels durable — solid hinges, sturdy headband."),
    ("mic_quality", "Boom mic is excellent — my team can hear me clearly on Google Meet."),
    ("connectivity", "Bluetooth pairs quickly with laptop and phone simultaneously."),
    ("value", "For the tier, this competes with headphones twice the price."),
]
HEADPHONES_MIX = [
    ("comfort", "Comfortable for 2-3 hours but earcups get warm on longer sessions."),
    ("sound", "Sound is great but ANC could be stronger — audible traffic on my commute."),
    ("build", "Feels sturdy but the folding hinge worries me. Handle with care."),
]
HEADPHONES_NEG = [
    ("battery", "Battery died within a month. Contact support."),
    ("build", "Padding started peeling off after 2 months of daily WFH use."),
]

POWER_BANK_POS = [
    ("capacity", "20,000 mAh gets me through a full offsite day — laptop + phone + earbuds."),
    ("capacity", "Charged my phone 4 times before needing to top up the {p} itself."),
    ("charging_speed", "18W fast-charging — refills my phone from 0 to 50% in 25 minutes."),
    ("charging_speed", "PD output charges my MacBook Air enough for a 3-hour flight."),
    ("build", "Compact enough for my laptop bag — doesn't add noticeable weight."),
    ("build", "The {p} is well-built — no wobbling ports, feels rugged for daily commute."),
    ("safety", "Original brand — no counterfeit issues. Has all the safety certifications."),
    ("indicators", "LED indicators show exact charge remaining. No guesswork."),
    ("simultaneous", "Charges laptop and phone at the same time. Perfect for coworking days."),
    ("value", "For the mAh, this is the best deal I found. Reliable."),
]
POWER_BANK_MIX = [
    ("capacity", "Actual usable capacity is less than the 20,000 mAh number — expected losses I guess."),
    ("charging_speed", "Not the fastest — 18W is fine but I've seen 45W bricks at similar prices."),
    ("build", "Solid build but a bit heavier than I hoped."),
]
POWER_BANK_NEG = [
    ("capacity", "Charges my phone barely 1.5 times. Not what 10,000 mAh should deliver."),
    ("charging_speed", "Charges very slowly — took 4 hours to top up my phone."),
]

CABLE_POS = [
    ("durability", "Braided sleeve is holding up perfectly after 3 months of daily WFH pull-and-plug."),
    ("durability", "The {p} survives my desk-to-bag-to-office routine — no fraying at the connectors."),
    ("length", "1.5m is the right length for my WFH setup — reaches from wall to laptop without slack."),
    ("length", "Long enough to charge my phone while on a call from across the room."),
    ("data_speed", "Data transfer speeds match what my laptop expects — fast file transfers."),
    ("compatibility", "Works with my Android phone, tablet, and Bluetooth speakers. Universal."),
    ("compatibility", "The {p} is picky about nothing — plugged into 5 different devices, all charge."),
    ("charging", "Fast-charges my OnePlus at the marketed speed. No throttling."),
    ("charging", "Charges my phone from 20% to 80% in 30 minutes on the OEM adapter."),
    ("build", "Sturdy connectors — no wobble in the port after months of use."),
    ("value", "Way cheaper than the OEM cable, same reliability. No brainer."),
    ("value", "Bought 2 — one for office, one for home. Consistent quality on both."),
]
CABLE_MIX = [
    ("durability", "Working fine so far but the plastic near the connector feels thin."),
    ("length", "Slightly shorter than expected — measure your setup before ordering."),
    ("data_speed", "Charges fine but data-transfer speeds are ordinary. Fine for daily use."),
]
CABLE_NEG = [
    ("durability", "Stopped charging after 3 weeks. Fraying near the phone end."),
    ("compatibility", "Doesn't fast-charge my phone despite being marketed as fast-charge compatible."),
]

ADAPTER_POS = [
    ("charging_speed", "Fast-charges my phone at the marketed wattage — no throttling."),
    ("charging_speed", "The {p} tops up my phone from 10% to 60% in 20 mins. Perfect for a quick charge between meetings."),
    ("build", "Compact form-factor — takes minimal space in my laptop bag."),
    ("build", "Doesn't overheat even on continuous charge. Well-designed."),
    ("compatibility", "Works with everything — phone, tablet, wireless earbuds case."),
    ("safety", "BIS-certified and has the correct safety markings. Genuine article."),
    ("safety", "No overheating issues even after 6 months of daily use."),
    ("ports", "Multiple ports let me charge phone + earbuds at the same time."),
    ("value", "Cheaper than the OEM charger and works just as well."),
]
ADAPTER_MIX = [
    ("build", "Works fine but the housing feels lighter than the OEM brick."),
    ("charging_speed", "Advertises 20W but real-world felt closer to 15-17W."),
]
ADAPTER_NEG = [
    ("safety", "Got hot to touch after 15 minutes. Returning."),
    ("charging_speed", "Doesn't fast-charge my phone despite being labelled compatible."),
]

PHONE_STAND_POS = [
    ("stability", "Rock-solid on my WFH desk — doesn't wobble during Zoom calls."),
    ("stability", "The {p} holds my phone steady even when I tap it. No tip-over."),
    ("angle", "Adjustable angle — perfect for both video calls and watching lunch-break shows."),
    ("angle", "Portrait + landscape both work well. Great for reading recipes while cooking."),
    ("build", "Aluminium construction feels premium — not the cheap plastic ones."),
    ("build", "Weight is solid without being heavy. Feels well-made."),
    ("compatibility", "Fits my phone with a case on — most stands don't."),
    ("compatibility", "Works with my iPad Mini too. Versatile for a small desk setup."),
    ("portability", "Folds flat — slips into my laptop sleeve for offsites."),
    ("value", "Simple, effective, honest pricing. Great addition to a WFH desk."),
]
PHONE_STAND_MIX = [
    ("angle", "Adjustable but the joint feels loose — will it hold long-term?"),
    ("build", "Sturdy but the finish scratches easily. Cosmetic issue."),
]
PHONE_STAND_NEG = [
    ("stability", "Wobbles when I tap my phone. Not ideal for scrolling on the stand."),
]

LED_POS = [
    ("brightness", "9W is genuinely bright — replaced a 60W bulb, brighter and cooler."),
    ("brightness", "The {p} lights up my WFH corner perfectly for late-night calls."),
    ("colour", "Warm white tone is easy on the eyes for long work-from-home sessions."),
    ("colour", "Cool daylight tone is perfect for my study desk — feels office-like."),
    ("energy", "Noticeable dip in my electricity bill after switching all bulbs to these."),
    ("longevity", "Been running 12+ hours a day for 4 months — no flicker, no dimming."),
    ("install", "Standard B22 base — plug and play into my existing fixture."),
    ("install", "Screwed in and it just worked. No apps, no setup."),
    ("build", "Solid heatsink — bulb stays cool to the touch even after hours on."),
    ("value", "Bulk-ordered 6 for the whole flat. Same quality across all."),
]
LED_MIX = [
    ("brightness", "Bright but takes a second to warm up to full output."),
    ("colour", "Advertised warm white is a touch cooler than I expected."),
]
LED_NEG = [
    ("longevity", "Bulb died within 2 months. Contact support."),
    ("brightness", "Dimmer than the wattage suggests. Underwhelming."),
]

# ============================================================================
# PERSONAL_CARE_BEAUTY — per subcategory
# ============================================================================

MOISTURIZER_POS = [
    ("hydration", "Skin feels genuinely hydrated all day — great for AC-office skin."),
    ("hydration", "The {p} works for my dry Delhi-winter skin. Non-greasy."),
    ("absorption", "Absorbs in seconds — perfect before a client meeting or morning routine."),
    ("skin_feel", "Non-comedogenic — no breakouts, even on my sensitive combination skin."),
    ("fragrance", "Fragrance is subtle, office-appropriate. Not overpowering."),
    ("results", "Two weeks in and my colleagues asked what changed. It works."),
    ("packaging", "Pump dispenser doesn't leak in my laptop bag. Travel-friendly."),
    ("value", "Cheaper than Nykaa, same-day delivery. Switched permanently."),
]
MOISTURIZER_MIX = [
    ("skin_feel", "Works for combination skin but oily skin might find it heavy."),
    ("fragrance", "Fragrance is stronger than I'd like — subtle would be more office-friendly."),
]
MOISTURIZER_NEG = [
    ("skin_feel", "Broke me out badly. Not for my skin."),
]

FACE_WASH_POS = [
    ("cleanse", "Gentle enough for twice-daily use — doesn't strip my skin after gym."),
    ("cleanse", "Removes sunscreen and pollution from a Delhi commute effectively."),
    ("lather", "Creamy lather — a little goes a long way, bottle lasts weeks."),
    ("skin_feel", "Skin feels clean but not tight after washing. Perfect balance."),
    ("skin_feel", "The {p} suits my sensitive skin — no redness, no dryness."),
    ("results", "Cleared up my morning-shift acne within 3 weeks."),
    ("value", "Cheaper than salons for the same brand. Reliable."),
]
FACE_WASH_MIX = [
    ("lather", "Effective cleanser but doesn't foam much — feels weird."),
    ("cleanse", "Works fine on light makeup but struggles with heavy sunscreen."),
]
FACE_WASH_NEG = [
    ("skin_feel", "Made my skin very dry within days. Returning."),
]

SHAMPOO_POS = [
    ("hair_feel", "Hair feels light and clean without weighing down. Perfect for daily wash."),
    ("hair_feel", "The {p} works for my oily-scalp, dry-ends combination — rare find."),
    ("cleanse", "Cuts through gym sweat and pollution without over-drying."),
    ("dandruff", "Anti-dandruff formula actually works — visible reduction in 2 weeks."),
    ("dandruff", "Kept flakes away through Delhi winter. Trusted brand."),
    ("fragrance", "Subtle fragrance that lingers just enough. Office-appropriate."),
    ("lather", "Rich lather from a small pump. Family pack lasts a month."),
    ("value", "Same MRP as any store, delivered to my door on a Sunday."),
]
SHAMPOO_MIX = [
    ("hair_feel", "Cleans well but I need a conditioner after — a bit stripping alone."),
    ("dandruff", "Works but flakes come back if I skip a wash for 2 days."),
]
SHAMPOO_NEG = [
    ("hair_feel", "Made my scalp itchy. Not for me."),
]

SERUM_POS = [
    ("effectiveness", "The {p} evened out my under-eye pigmentation from too many late-night deploys."),
    ("effectiveness", "Fine lines look smoother after 4 weeks. Genuine active-ingredient formula."),
    ("absorption", "Absorbs quickly under makeup — no pilling before a morning presentation."),
    ("skin_feel", "Doesn't feel heavy under my sunscreen. Perfect layering."),
    ("results", "Skin looks brighter in Zoom video calls. Colleagues noticed."),
    ("dermatologist", "Dermatologist-recommended active concentration. Genuine formulation."),
    ("value", "Half the price of the imported version, similar results."),
]
SERUM_MIX = [
    ("effectiveness", "Takes 4-6 weeks to show results. Be patient."),
    ("skin_feel", "Slightly sticky right after application — dries down in 5 mins."),
]
SERUM_NEG = [
    ("skin_feel", "Caused a mild reaction on my sensitive skin. Patch test first."),
]

RAZOR_POS = [
    ("shave_quality", "Close shave without irritation — quick morning routine before standups."),
    ("shave_quality", "The {p} handles my thick beard without tugging."),
    ("blade_life", "Blades last 4-5 shaves before I switch. Fair for the price."),
    ("skin_feel", "No razor burn even without balm. Gentle on skin."),
    ("grip", "Ergonomic grip — no slipping in wet shower conditions."),
    ("value", "Cheaper than gym locker-room shavers, better quality."),
]
RAZOR_MIX = [
    ("blade_life", "Fine but blades don't last as long as marketed — plan to replace weekly."),
]
RAZOR_NEG = [
    ("shave_quality", "Nicks and cuts even on careful shaves. Not for me."),
]

CONCEALER_POS = [
    ("coverage", "Full coverage for my under-eye circles from late-night code reviews."),
    ("coverage", "The {p} covers pigmentation without looking cakey on video calls."),
    ("blend", "Blends seamlessly into skin — no visible edges."),
    ("longevity", "Stays put through a full 9-hour office day, no touch-ups needed."),
    ("skin_feel", "Lightweight — doesn't feel heavy or crease into fine lines."),
    ("shade", "Shade range is realistic for Indian skin tones. Found my exact match."),
]
CONCEALER_MIX = [
    ("longevity", "Great coverage but fades after 6 hours. Fine for a shorter day."),
]
CONCEALER_NEG = [
    ("blend", "Oxidised on my skin within an hour. Changed shade completely."),
]

# ============================================================================
# TEA/COFFEE — per subcategory
# ============================================================================

COFFEE_POS = [
    ("aroma", "Fuel for my 9am standups. Strong, aromatic — exactly what I need."),
    ("aroma", "The {p} smells incredible the moment I open the tin. Fresh."),
    ("strength", "Full-bodied — doesn't need extra sugar. Real coffee for a real workday."),
    ("strength", "Perfect kick for late-night code reviews. Not bitter."),
    ("taste", "Rich, smooth, no burnt aftertaste. Great morning cup."),
    ("routine", "Daily morning brew — the reason I make it through 9am calls."),
    ("value", "Same price as D-Mart but doorstep. Office-pantry favourite."),
    ("packaging", "Airtight tin locks freshness. Aroma lasts weeks."),
]
COFFEE_MIX = [
    ("strength", "Strength varies between batches — not always consistent."),
    ("aroma", "Aroma is good but fades a couple weeks after opening."),
]
COFFEE_NEG = [
    ("taste", "Bitter and thin — not what I expected from this brand."),
]

TEA_POS = [
    ("aroma", "Fragrant leaves — the {p} smells fresh even before brewing."),
    ("taste", "Classic strong chai — perfect with milk and adrak."),
    ("taste", "Green tea has a clean, subtle flavour. Perfect for my afternoon slump."),
    ("brew", "Brews to a rich colour in 3 minutes. Consistent every cup."),
    ("routine", "Post-lunch green tea for my 3pm slump. Been ordering for months."),
    ("value", "Best price on this brand. Family monthly stock."),
    ("packaging", "Sealed pouch preserves aroma. Fresh stock."),
]
TEA_MIX = [
    ("taste", "Good tea but slightly weaker than my previous batch."),
]
TEA_NEG = [
    ("aroma", "Aroma is flat — feels like old stock."),
]

HEALTHDRINK_POS = [
    ("taste", "Kids love the {p} — the only health drink they finish without complaining."),
    ("nutrition", "Full spectrum of vitamins listed. Peace of mind for a busy working parent."),
    ("mixability", "Dissolves smoothly in cold and warm milk. No lumps."),
    ("energy", "Notice more energy through my long WFH days after 2 weeks."),
    ("value", "Same MRP as any store. Delivered on schedule."),
]
HEALTHDRINK_MIX = [
    ("taste", "Kids find it a bit too sweet. Would prefer a milder version."),
]
HEALTHDRINK_NEG = [
    ("mixability", "Doesn't dissolve fully — leaves grit at the bottom."),
]

# ============================================================================
# SUPPLEMENTS — per subcategory
# ============================================================================

WHEY_POS = [
    ("effectiveness", "Post-workout recovery — muscle soreness reduced noticeably in 2 weeks."),
    ("effectiveness", "The {p} helped me hit my daily protein target without meal-prep struggle."),
    ("authenticity", "Verified authenticity code — genuine product, not the fake stuff on random sites."),
    ("mixability", "Mixes smoothly with a shaker — no clumps, no residue."),
    ("taste", "Chocolate flavour is great — drinks like a milkshake."),
    ("taste", "Doesn't taste like chalk unlike some brands. Actually enjoyable."),
    ("scoop_size", "Scoop is generous — full 24g protein per serving as advertised."),
    ("value", "Same as HealthKart, delivered in 15 mins. No 3-day wait."),
]
WHEY_MIX = [
    ("taste", "Effective but flavour is meh. Try the chocolate variant instead."),
    ("mixability", "Mostly smooth but leaves a bit of foam on top."),
]
WHEY_NEG = [
    ("authenticity", "Taste felt way off from what I've been using — suspect this batch is fake."),
]

MULTIVITAMIN_POS = [
    ("effectiveness", "Daily energy is up since I started — WFH desk-life needed this."),
    ("effectiveness", "The {p} helped with my immunity during flu season. Genuine effect."),
    ("dose_form", "Easy-to-swallow tablets — small size, no aftertaste."),
    ("nutrition", "Balanced full-spectrum vitamins. All the essentials in one pill."),
    ("value", "Cheaper than the pharmacy near my office. Reliable stock."),
]
MULTIVITAMIN_MIX = [
    ("effectiveness", "Takes 3-4 weeks to notice. Be patient with vitamins."),
]
MULTIVITAMIN_NEG = [
    ("dose_form", "Tablets are large — hard to swallow."),
]

OMEGA3_POS = [
    ("effectiveness", "Joint stiffness from long desk hours reduced in 3 weeks."),
    ("effectiveness", "The {p} helped my dry eyes from screen-time. Genuine benefit."),
    ("purity", "IFOS-certified purity — no fishy burp aftertaste."),
    ("dose_form", "Softgels are easy to swallow. No fishy taste."),
    ("value", "Same as GNC, delivered fast. No wait."),
]
OMEGA3_MIX = [
    ("dose_form", "Slight fishy aftertaste sometimes. Take with meals."),
]
OMEGA3_NEG = [
    ("purity", "Strong fishy burps after every dose. Not for me."),
]

BAR_POS = [
    ("taste", "Actually tastes good — not the sawdust bars of the past."),
    ("taste", "The {p} is my go-to between-meeting snack for a protein boost."),
    ("nutrition", "20g protein, low sugar — hits my macros without a compromise."),
    ("portable", "Slips into my laptop bag. Perfect for offsite days."),
    ("value", "Cheaper than the office pantry vendor."),
]
BAR_MIX = [
    ("taste", "Some flavours are better than others — chocolate is safer."),
]
BAR_NEG = [
    ("taste", "Artificial aftertaste. Won't reorder."),
]

# ============================================================================
# PHARMACY_HEALTH — per subcategory
# ============================================================================

PAIN_RELIEF_POS = [
    ("effectiveness", "Long desk hours give me back pain — this helped in 2 days."),
    ("effectiveness", "The {p} worked for my post-workout muscle soreness. Fast relief."),
    ("brand_trust", "Reliable brand — genuine product, verified batch."),
    ("delivery", "Ordered when I couldn't leave a client call — Blinkit delivered to my desk in 15 mins."),
    ("value", "Same as pharmacy price, delivered instantly."),
]
PAIN_RELIEF_MIX = [
    ("effectiveness", "Works but takes longer than the marketed 15 mins. Give it 30."),
]
PAIN_RELIEF_NEG = [
    ("effectiveness", "Didn't help my back pain after 5 days of use."),
]

COLD_RELIEF_POS = [
    ("effectiveness", "Caught a cold from my building's AC — recovered in time for a client visit."),
    ("effectiveness", "The {p} helped me recover from viral fever in 3 days."),
    ("brand_trust", "Trusted brand — my go-to for the family medicine cabinet."),
    ("value", "Same as chemist price. No markup."),
]
COLD_RELIEF_MIX = [
    ("effectiveness", "Fine but slower-acting than the branded competitors."),
]
COLD_RELIEF_NEG = [
    ("effectiveness", "Didn't touch my cold. Wasted purchase."),
]

ANTISEPTIC_POS = [
    ("effectiveness", "Perfect for the office first-aid drawer. Small cuts heal fast."),
    ("safety", "Non-stinging formulation — safe for family use."),
    ("value", "Best price on Dettol. Reliable stock."),
]
ANTISEPTIC_MIX = [
    ("smell", "Effective but the smell is very medicinal. Ventilate the room."),
]
ANTISEPTIC_NEG = [
    ("effectiveness", "Wound didn't heal any faster than with water. Underwhelming."),
]

ANTACID_POS = [
    ("effectiveness", "Post-client-dinner acidity — fast relief in 15 mins."),
    ("effectiveness", "The {p} handles my stress-eating heartburn. Working-life essential."),
    ("value", "Same as pharmacy, delivered fast."),
]
ANTACID_MIX = [
    ("effectiveness", "Works but not as fast as advertised. Give it 30 mins."),
]
ANTACID_NEG = [
    ("effectiveness", "Didn't touch my acidity. Not for me."),
]

MULTIVIT_POS = [
    ("effectiveness", "Daily energy noticeably better after 3 weeks of consistent use."),
    ("dose_form", "Easy-to-swallow tablet. No aftertaste."),
    ("value", "Cheaper than the pharmacy near my office."),
]
MULTIVIT_MIX = [
    ("effectiveness", "Fine but effects are subtle — hard to attribute directly."),
]
MULTIVIT_NEG = [
    ("dose_form", "Tablet is huge. Hard to swallow."),
]

ORS_POS = [
    ("taste", "Doesn't taste bad — my kids drink it without a fuss during viral fevers."),
    ("effectiveness", "Rehydrated me quickly after a summer dehydration episode."),
    ("value", "Best price. Family monthly stock for the medicine cabinet."),
]
ORS_MIX = [
    ("taste", "Slightly salty aftertaste. Effective though."),
]
ORS_NEG = []

# ============================================================================
# BABY — per subcategory
# ============================================================================

DIAPER_POS = [
    ("absorbency", "No leaks overnight — working-parent essential."),
    ("absorbency", "The {p} handles heavy pees during long car rides. Reliable."),
    ("softness", "Soft against baby's skin — no rashes even in humid Mumbai weather."),
    ("fit", "Fits well around thighs — no gaps, no leaks."),
    ("skin_safe", "Hypoallergenic, dermatologist-tested. Peace of mind."),
    ("delivery", "Ordered at 11pm during a diaper emergency. Delivered by 2am. Life-saver."),
    ("value", "Bulk pack — best value for a full-time working parent."),
]
DIAPER_MIX = [
    ("absorbency", "Good for daytime, need to change for overnight."),
    ("fit", "Runs slightly small for my chubby baby. Size up."),
]
DIAPER_NEG = [
    ("skin_safe", "Gave my baby a rash. Switched brands."),
]

BABY_LOTION_POS = [
    ("skin_feel", "Baby's skin stays soft and moisturised through the day."),
    ("skin_feel", "The {p} is gentle enough for daily use. No irritation."),
    ("fragrance", "Light baby fragrance — not overpowering."),
    ("absorption", "Absorbs quickly, no greasy residue on baby's clothes."),
    ("value", "Bulk pack, best price. Working mom essential."),
]
BABY_LOTION_MIX = [
    ("fragrance", "Fragrance is nice but stronger than I expected for a baby product."),
]
BABY_LOTION_NEG = [
    ("skin_feel", "Baby got a rash. Sensitive skin — patch test first."),
]

BABY_POWDER_POS = [
    ("smoothness", "Silky finish — keeps baby comfortable in humid weather."),
    ("fragrance", "Light, classic baby fragrance. Not overpowering."),
    ("safety", "Talc-free formulation — safer for baby's respiratory system."),
    ("value", "Same as pharmacy, delivered fast."),
]
BABY_POWDER_MIX = [
    ("fragrance", "Slightly stronger fragrance than expected."),
]
BABY_POWDER_NEG = []

BABY_WASH_POS = [
    ("skin_safe", "Tear-free formulation — bath time is stress-free."),
    ("skin_safe", "The {p} is gentle on baby's skin. No dryness after."),
    ("lather", "Rich lather from a small pump. Bottle lasts long."),
    ("fragrance", "Light baby fragrance — soothing."),
    ("value", "Bulk pack, best price."),
]
BABY_WASH_MIX = [
    ("lather", "Effective but doesn't foam as much as I expected."),
]
BABY_WASH_NEG = []

BABY_SOAP_POS = [
    ("skin_feel", "Gentle enough for daily use. Baby's skin stays soft."),
    ("value", "Best price on this brand."),
]
BABY_SOAP_MIX = [
    ("skin_feel", "Fine but soap dissolves faster than expected."),
]
BABY_SOAP_NEG = []

BABY_CEREAL_POS = [
    ("nutrition", "Balanced nutrition — my baby loves the {p} for breakfast."),
    ("mixability", "Mixes smoothly with milk or water. No clumps."),
    ("taste", "Baby finishes the whole bowl. That's a good sign."),
    ("value", "Same MRP as any store."),
]
BABY_CEREAL_MIX = [
    ("taste", "Baby ate it but wasn't excited. Fine for maintenance."),
]
BABY_CEREAL_NEG = []

# ============================================================================
# HOME_CLEANING — per subcategory
# ============================================================================

DETERGENT_POS = [
    ("stain", "Removes gym-week sweat stains without pre-treatment."),
    ("stain", "The {p} tackled a coffee stain on my office shirt. Impressed."),
    ("fragrance", "Fresh fragrance — clothes smell clean, not overly perfumed."),
    ("dilution", "Concentrated — a small cap does a full load. Cost-effective."),
    ("value", "Bulk bottle lasts weeks. Great for working-couple households."),
]
DETERGENT_MIX = [
    ("fragrance", "Cleans well but fragrance is strong. Not for sensitive noses."),
]
DETERGENT_NEG = [
    ("stain", "Barely touched a mud stain on my kid's uniform. Underwhelming."),
]

FLOOR_CLEANER_POS = [
    ("effectiveness", "Cleans quickly, no residue — Sunday cleaning takes 20 mins instead of 45."),
    ("fragrance", "Fresh citrus fragrance lingers just enough. Perfect for a WFH space."),
    ("safety", "Pet-safe as claimed — cat doesn't react to the smell."),
    ("value", "Bulk bottle, best value."),
]
FLOOR_CLEANER_MIX = [
    ("fragrance", "Cleans well but the smell is strong. Ventilate."),
]
FLOOR_CLEANER_NEG = [
    ("effectiveness", "Barely cleans stains. Misleading marketing."),
]

TOILET_CLEANER_POS = [
    ("effectiveness", "Handles a week's build-up in one application. No scrubbing."),
    ("effectiveness", "The {p} keeps my toilet bowl sparkling with a weekly clean."),
    ("value", "Best price on this brand."),
]
TOILET_CLEANER_MIX = [
    ("fragrance", "Effective but the chemical smell is strong."),
]
TOILET_CLEANER_NEG = []

GLASS_CLEANER_POS = [
    ("effectiveness", "Streak-free finish on my desk glass. Perfect after a coffee spill."),
    ("effectiveness", "The {p} left my kitchen windows crystal-clear. Impressed."),
    ("value", "Same MRP as any store."),
]
GLASS_CLEANER_MIX = [
    ("effectiveness", "Works but needs 2 sprays for stubborn spots."),
]
GLASS_CLEANER_NEG = []

GARBAGE_BAGS_POS = [
    ("build", "Sturdy — doesn't tear even under heavy kitchen waste."),
    ("size", "Correct size for my kitchen bin. Fits well."),
    ("value", "Bulk pack, best price. Monthly stock."),
]
GARBAGE_BAGS_MIX = [
    ("build", "Fine for light waste, tears with heavier loads."),
]
GARBAGE_BAGS_NEG = [
    ("build", "Tore within a day of use. Not durable."),
]

AIR_FRESHENER_POS = [
    ("fragrance", "Fresh, subtle fragrance — perfect for my WFH space."),
    ("longevity", "Lasts a week per spray. Long-lasting."),
    ("value", "Best price on this brand."),
]
AIR_FRESHENER_MIX = [
    ("fragrance", "Fresh but fragrance fades after a few hours."),
]
AIR_FRESHENER_NEG = []

# ============================================================================
# TEMPLATE MAP (category, subcategory) → (positive, mixed, negative)
# For untabulated categories, we fall back to CATEGORY-level pools from v2
# (imported below).
# ============================================================================

SUB_POOLS = {
    ("electronics", "earbuds"):     (EARBUDS_POS, EARBUDS_MIX, EARBUDS_NEG),
    ("electronics", "headphones"):  (HEADPHONES_POS, HEADPHONES_MIX, HEADPHONES_NEG),
    ("electronics", "power_bank"):  (POWER_BANK_POS, POWER_BANK_MIX, POWER_BANK_NEG),
    ("electronics", "cable"):       (CABLE_POS, CABLE_MIX, CABLE_NEG),
    ("electronics", "adapter"):     (ADAPTER_POS, ADAPTER_MIX, ADAPTER_NEG),
    ("electronics", "phone_stand"): (PHONE_STAND_POS, PHONE_STAND_MIX, PHONE_STAND_NEG),
    ("electronics", "led"):         (LED_POS, LED_MIX, LED_NEG),

    ("personal_care_beauty", "moisturizer"): (MOISTURIZER_POS, MOISTURIZER_MIX, MOISTURIZER_NEG),
    ("personal_care_beauty", "face_wash"):   (FACE_WASH_POS, FACE_WASH_MIX, FACE_WASH_NEG),
    ("personal_care_beauty", "shampoo"):     (SHAMPOO_POS, SHAMPOO_MIX, SHAMPOO_NEG),
    ("personal_care_beauty", "serum"):       (SERUM_POS, SERUM_MIX, SERUM_NEG),
    ("personal_care_beauty", "razor"):       (RAZOR_POS, RAZOR_MIX, RAZOR_NEG),
    ("personal_care_beauty", "concealer"):   (CONCEALER_POS, CONCEALER_MIX, CONCEALER_NEG),

    ("tea_coffee", "coffee"):      (COFFEE_POS, COFFEE_MIX, COFFEE_NEG),
    ("tea_coffee", "tea"):         (TEA_POS, TEA_MIX, TEA_NEG),
    ("tea_coffee", "healthdrink"): (HEALTHDRINK_POS, HEALTHDRINK_MIX, HEALTHDRINK_NEG),

    ("supplements", "whey_protein"):  (WHEY_POS, WHEY_MIX, WHEY_NEG),
    ("supplements", "plant_protein"): (WHEY_POS, WHEY_MIX, WHEY_NEG),
    ("supplements", "multivitamin"):  (MULTIVITAMIN_POS, MULTIVITAMIN_MIX, MULTIVITAMIN_NEG),
    ("supplements", "omega3"):        (OMEGA3_POS, OMEGA3_MIX, OMEGA3_NEG),
    ("supplements", "bar"):           (BAR_POS, BAR_MIX, BAR_NEG),
    ("supplements", "beauty"):        (MULTIVITAMIN_POS, MULTIVITAMIN_MIX, MULTIVITAMIN_NEG),

    ("pharmacy_health", "pain_relief"):      (PAIN_RELIEF_POS, PAIN_RELIEF_MIX, PAIN_RELIEF_NEG),
    ("pharmacy_health", "cold_relief"):      (COLD_RELIEF_POS, COLD_RELIEF_MIX, COLD_RELIEF_NEG),
    ("pharmacy_health", "antiseptic"):       (ANTISEPTIC_POS, ANTISEPTIC_MIX, ANTISEPTIC_NEG),
    ("pharmacy_health", "antacid"):          (ANTACID_POS, ANTACID_MIX, ANTACID_NEG),
    ("pharmacy_health", "multivitamin"):     (MULTIVIT_POS, MULTIVIT_MIX, MULTIVIT_NEG),
    ("pharmacy_health", "oral_rehydration"): (ORS_POS, ORS_MIX, ORS_NEG),

    ("baby", "diaper"):       (DIAPER_POS, DIAPER_MIX, DIAPER_NEG),
    ("baby", "baby_lotion"):  (BABY_LOTION_POS, BABY_LOTION_MIX, BABY_LOTION_NEG),
    ("baby", "baby_powder"):  (BABY_POWDER_POS, BABY_POWDER_MIX, BABY_POWDER_NEG),
    ("baby", "baby_wash"):    (BABY_WASH_POS, BABY_WASH_MIX, BABY_WASH_NEG),
    ("baby", "baby_soap"):    (BABY_SOAP_POS, BABY_SOAP_MIX, BABY_SOAP_NEG),
    ("baby", "baby_cereal"):  (BABY_CEREAL_POS, BABY_CEREAL_MIX, BABY_CEREAL_NEG),

    ("home_cleaning", "detergent"):       (DETERGENT_POS, DETERGENT_MIX, DETERGENT_NEG),
    ("home_cleaning", "floor_cleaner"):   (FLOOR_CLEANER_POS, FLOOR_CLEANER_MIX, FLOOR_CLEANER_NEG),
    ("home_cleaning", "toilet_cleaner"):  (TOILET_CLEANER_POS, TOILET_CLEANER_MIX, TOILET_CLEANER_NEG),
    ("home_cleaning", "glass_cleaner"):   (GLASS_CLEANER_POS, GLASS_CLEANER_MIX, GLASS_CLEANER_NEG),
    ("home_cleaning", "garbage_bags"):    (GARBAGE_BAGS_POS, GARBAGE_BAGS_MIX, GARBAGE_BAGS_NEG),
    ("home_cleaning", "air_freshener"):   (AIR_FRESHENER_POS, AIR_FRESHENER_MIX, AIR_FRESHENER_NEG),
    ("home_cleaning", "dishwash"):        (DETERGENT_POS, DETERGENT_MIX, DETERGENT_NEG),
    ("home_cleaning", "utensil_cleaner"): (DETERGENT_POS, DETERGENT_MIX, DETERGENT_NEG),
}


# ---------- FALLBACK: category-level pools (from v2) for the remaining ------
# For categories where subcategory-level content isn't dramatically different
# (like books, jewellery, spiritual, munchies, dairy) we can reuse v2's pools.
def _load_v2_category_pool(sentiment_key):
    """Import v2 category-level pools without pulling in the full file."""
    # These are re-imported lazily so this file doesn't have to duplicate them.
    import importlib.util
    v2_path = Path(__file__).parent / "generate_reviews_v2.py"
    spec = importlib.util.spec_from_file_location("v2", v2_path)
    v2 = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(v2)
    return v2.POOLS  # {category: (pos, mix, neg)}


V2_POOLS = None


def pool_for(category, subcategory, sentiment):
    global V2_POOLS
    key = (category, subcategory)
    if key in SUB_POOLS:
        pos, mix, neg = SUB_POOLS[key]
    else:
        if V2_POOLS is None:
            V2_POOLS = _load_v2_category_pool("positive")
        pos, mix, neg = V2_POOLS.get(category, ([], [], []))

    if sentiment == "positive":
        return pos + UNIV_POS[:4] if pos else UNIV_POS
    if sentiment == "mixed":
        return mix + UNIV_MIX[:2] if mix else UNIV_MIX
    return neg + UNIV_NEG[:1] if neg else UNIV_NEG


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
    if "{p}" not in template_text:
        return template_text
    if rng.random() < 0.35:
        return template_text.replace("{p}", product_name)
    # Fix "The {p} ..." → "This ..." (capital T at start of sentence)
    out = template_text.replace("The {p}", "This").replace("the {p}", "this").replace("{p}", "this")
    return out


def generate_reviews_for_product(product):
    pid = product["product_id"]
    category = product["category"]
    subcategory = product.get("subcategory", "")
    name = product["product_name"]
    avg = product["trust_signals"]["avg_rating"]

    rng = random.Random(hash(pid) & 0xFFFFFFFF)
    n = rng.randint(50, 300)
    weights = rating_distribution(avg)

    reviews = []
    for _ in range(n):
        stars = rng.choices([1, 2, 3, 4, 5], weights=weights, k=1)[0]
        sentiment = sentiment_for_rating(stars)
        pool = pool_for(category, subcategory, sentiment)
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

    reviews_by_cat = defaultdict(dict)
    total = 0
    counts = []
    subcategory_specific = 0

    for p in products:
        pid = p["product_id"]
        cat = p["category"]
        sub = p.get("subcategory", "")
        # Clear any old reviews field
        p["trust_signals"].pop("reviews", None)

        revs = generate_reviews_for_product(p)
        reviews_by_cat[cat][pid] = revs
        n = len(revs)
        counts.append(n)
        total += n
        p["trust_signals"]["reviews_count"] = n

        if (cat, sub) in SUB_POOLS:
            subcategory_specific += 1

    for cat, m in reviews_by_cat.items():
        out = reviews_dir / f"{cat}.json"
        with open(out, "w", encoding="utf-8") as f:
            json.dump(m, f, ensure_ascii=False, indent=1)
        size_kb = os.path.getsize(out) // 1024
        print(f"  {cat:25} {len(m):3} products, "
              f"{sum(len(v) for v in m.values()):>6} reviews, "
              f"{size_kb:>5} KB")

    data.setdefault("pipeline_metadata", {})["reviews_generated"] = True
    data["pipeline_metadata"]["reviews_per_product_range"] = "50-300"
    data["pipeline_metadata"]["total_reviews_generated"] = total
    data["pipeline_metadata"]["reviews_split_by_category"] = True
    data["pipeline_metadata"]["subcategory_targeted"] = True
    data["pipeline_metadata"]["products_with_subcategory_specific_reviews"] = subcategory_specific

    with open(data_path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    catalog_kb = os.path.getsize(data_path) // 1024
    print(f"\nMain catalog: {catalog_kb:,} KB")
    print(f"Total reviews: {total:,}")
    print(f"Products with SUBCATEGORY-SPECIFIC reviews: {subcategory_specific}/{len(products)}")
    print(f"Per product — min: {min(counts)}, max: {max(counts)}, avg: {total / len(counts):.1f}")


if __name__ == "__main__":
    main()
