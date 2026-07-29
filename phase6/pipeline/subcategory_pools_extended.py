"""Extended subcategory pools for the remaining 16 categories.

v3 covered electronics, personal_care_beauty, tea_coffee, supplements,
pharmacy_health, baby, and home_cleaning.  This file adds the rest so
every single (category, subcategory) pair in the 1,150-SKU catalog has
its own product-specific template pool.
"""

def T(theme, text):
    return (theme, text)


# ============================================================================
# ATTA_RICE_DAL — atta, dal, flour, rice
# ============================================================================
ATTA_POS = [
    T("softness", "Rotis come out soft and stay soft — WFH lunch essential."),
    T("softness", "The {p} makes fluffy rotis without kneading struggle. Great for busy weekdays."),
    T("nutrition", "Multigrain feels healthier — notice better energy through my WFH day."),
    T("nutrition", "Fibre-rich, keeps me full through long standups."),
    T("packaging", "Sealed pouch, no pest concerns. Fresh stock."),
    T("value", "Bulk 10kg pack, best rate. Monthly stock for working parents."),
    T("delivery", "Ordered before Sunday meal prep — arrived in time to cook for the week."),
]
ATTA_MIX = [
    T("softness", "Rotis are okay — needed a bit more water than expected."),
    T("packaging", "Bag was a bit torn on arrival. Contents were fine."),
]
ATTA_NEG = [
    T("packaging", "Bag was torn, half spilled during unpacking."),
]

RICE_POS = [
    T("grain", "Basmati grains are long and separate perfectly. Biryani weekend essential."),
    T("grain", "The {p} cooks fluffy every time — no clumping."),
    T("aroma", "Aromatic — my whole flat smells great when I cook this."),
    T("value", "Bulk 5kg, best rate. Family monthly stock."),
    T("cooking", "Cooks in 2 whistles — perfect for busy weeknight dinners."),
    T("delivery", "Sunday cooking session — arrived before my prep window."),
    T("packaging", "Sealed pack, sturdy handle. Easy to store."),
]
RICE_MIX = [
    T("grain", "Grains are decent but not the longest I've seen. Fair for the price."),
    T("cooking", "Cooks well but I've had shorter cook times on other brands."),
]
RICE_NEG = [
    T("grain", "Had small stones in the pack — bad sourcing."),
]

DAL_POS = [
    T("cooking", "Cooks in 2 whistles — perfect for busy WFH lunches."),
    T("taste", "The {p} tastes like home — genuine dal flavour."),
    T("nutrition", "Protein-rich, keeps me full through long project days."),
    T("packaging", "Sealed pack, no pest issues. Fresh stock."),
    T("value", "Best price on this variety. Monthly stock."),
    T("delivery", "Ran out mid-week — Blinkit delivered before dinner prep."),
]
DAL_MIX = [
    T("cooking", "Cooks fine but takes 3 whistles for the same softness."),
]
DAL_NEG = [
    T("packaging", "Bag had holes — insects had gotten in."),
]

FLOUR_POS = [
    T("quality", "Fine texture — perfect for baking my weekend cakes."),
    T("quality", "The {p} rolls out smoothly for parathas. Working-parent essential."),
    T("packaging", "Sealed, fresh, no lumps."),
    T("value", "Bulk pack, best value for a household."),
    T("delivery", "Ordered before a Sunday baking session — arrived on time."),
]
FLOUR_MIX = [
    T("quality", "Fine but has more coarse bits than the premium brand."),
]
FLOUR_NEG = [
    T("packaging", "Bag was leaking. Half spilled during unpacking."),
]

# ============================================================================
# MASALA_OIL — oil, spices, salt
# ============================================================================
OIL_POS = [
    T("purity", "Cold-pressed, feels healthier. Working professional needs clean cooking basics."),
    T("purity", "The {p} has an authentic taste — same as my mom used to use."),
    T("value", "5L bulk pack, best rate. Monthly cooking stock."),
    T("packaging", "Sturdy tin/can, no leaks. Easy pour cap."),
    T("cooking", "Cooks well, doesn't smoke at high heat."),
    T("delivery", "Ran out during weekend cooking — Blinkit saved dinner."),
    T("brand_trust", "Trusted brand. Genuine seal, no counterfeit concerns."),
]
OIL_MIX = [
    T("packaging", "Product is good but the cap is stiff. Hard to pour."),
    T("value", "Price fluctuates between orders. Wait for a sale."),
]
OIL_NEG = [
    T("purity", "Suspicious taste — felt diluted. Might be counterfeit."),
]

SPICES_POS = [
    T("aroma", "Fresh, pungent aroma when opened — genuine spices, not old stock."),
    T("aroma", "The {p} smells authentic — takes me back to my grandmother's kitchen."),
    T("purity", "No fillers or adulterants — trust the brand."),
    T("packaging", "Airtight pouch, aroma preserved for weeks."),
    T("value", "Best price on this brand. Monthly stock."),
    T("delivery", "Weekend cooking — Blinkit came through with my missing masala."),
    T("cooking", "Enhances every dish — genuine masala flavour."),
]
SPICES_MIX = [
    T("aroma", "Aroma is fine but doesn't punch like the smaller mom-and-pop brands."),
    T("purity", "Product is good, packaging could be more airtight."),
]
SPICES_NEG = [
    T("purity", "Off taste — feels adulterated. Won't reorder."),
]

SALT_POS = [
    T("purity", "Iodised, free-flowing. No lumps even in humid Mumbai weather."),
    T("purity", "The {p} dissolves cleanly, no residue."),
    T("value", "Best price. Monthly kitchen stock."),
    T("packaging", "Sealed pouch, moisture-proof."),
    T("cooking", "Enhances flavour without being overpowering."),
]
SALT_MIX = [
    T("purity", "Fine but slightly damp in monsoon. Store airtight."),
]
SALT_NEG = [
    T("packaging", "Bag was punctured. Salt spilled everywhere."),
]

# ============================================================================
# INSTANT_FROZEN — frozenfood, noodles, soup
# ============================================================================
FROZENFOOD_POS = [
    T("temperature", "Arrived frozen solid — Blinkit's cold-chain works."),
    T("temperature", "The {p} was still frozen even after a 15-minute delivery. Impressive."),
    T("taste", "Tastes like restaurant food — perfect for busy weeknights."),
    T("convenience", "10 minutes from freezer to plate. Sprint-week essential."),
    T("packaging", "Sealed pouch, well-frozen. No freezer burn."),
    T("value", "Cheaper than ordering Swiggy for the same meal."),
    T("delivery", "Ordered while on a client call — arrived by end of the meeting."),
]
FROZENFOOD_MIX = [
    T("taste", "Tastes fine but I've had better restaurant versions."),
    T("temperature", "Was mostly frozen but edges were softening. Refroze fine."),
]
FROZENFOOD_NEG = [
    T("temperature", "Arrived thawed. Refroze but quality suffered."),
]

NOODLES_POS = [
    T("taste", "Sprint week dinner solution. 2-min cooking, WFH essential."),
    T("taste", "The {p} tastes as good as childhood memory. Nostalgic."),
    T("convenience", "5-min meal — perfect for late-night deadline hunger."),
    T("packaging", "Sealed pouch, no crumbling. Fresh."),
    T("value", "Best price on family pack. Hostel/PG essential."),
    T("delivery", "Late-night hunger — Blinkit delivered in 10 mins."),
]
NOODLES_MIX = [
    T("taste", "Tastes fine but the tastemaker seems smaller than before. Shrinkflation?"),
]
NOODLES_NEG = [
    T("packaging", "Pack was crushed — noodles broken to bits."),
]

SOUP_POS = [
    T("taste", "Comforting on cold Delhi evenings. Post-work warm hug."),
    T("taste", "The {p} is smooth, well-seasoned. Restaurant-quality."),
    T("convenience", "3-min prep — perfect for a sick-day lunch."),
    T("nutrition", "Balanced meal on its own. Working-parent stock."),
    T("value", "Cheaper than ordering hot soup on Swiggy."),
]
SOUP_MIX = [
    T("taste", "Fine flavour but a bit salty for daily use."),
]
SOUP_NEG = [
    T("taste", "Artificial aftertaste. Won't reorder."),
]

# ============================================================================
# DAIRY_BREAD_EGGS — milk, eggs, butter, paneer, bread, cheese, curd
# ============================================================================
MILK_POS = [
    T("freshness", "Cold on arrival, sealed pack. Perfect for morning coffee."),
    T("freshness", "The {p} tastes fresh — no watered-down feeling."),
    T("packaging", "Well-packed, cold-chain maintained."),
    T("value", "Same MRP as any store, doorstep delivery."),
    T("routine", "Ordered the night before — ready for my 8am breakfast."),
    T("delivery", "Late-night order for morning tea — delivered at 6am. Reliable."),
]
MILK_MIX = [
    T("freshness", "Usually fresh but had one delivery close to expiry."),
]
MILK_NEG = [
    T("freshness", "Milk was already sour on arrival. Had to throw out."),
]

EGGS_POS = [
    T("freshness", "All 12 intact — Blinkit's egg handling is careful."),
    T("freshness", "The {p} yolks were bright orange — fresh farm-quality."),
    T("packaging", "Sturdy carton, no breakage."),
    T("value", "Same MRP, delivered fast."),
    T("routine", "Weekend breakfast essential — ordered for family brunch."),
]
EGGS_MIX = [
    T("packaging", "Fine most times but had one order with a cracked egg."),
]
EGGS_NEG = [
    T("packaging", "Egg carton crushed on arrival — 4 broken."),
]

BUTTER_POS = [
    T("taste", "Creamy, spreads smoothly on toast. Working-parent breakfast."),
    T("taste", "The {p} melts perfectly on hot parathas. Authentic taste."),
    T("packaging", "Sealed pack, arrived cold. Fresh stock."),
    T("value", "Best price on Amul. Monthly kitchen essential."),
]
BUTTER_MIX = [
    T("taste", "Fine taste but slightly saltier than I remembered."),
]
BUTTER_NEG = [
    T("freshness", "Received a pack near expiry. Check before accepting."),
]

PANEER_POS = [
    T("freshness", "Soft, fresh — perfect for weekend cooking."),
    T("freshness", "The {p} was still moist on arrival — clearly fresh stock."),
    T("packaging", "Sealed pack, no leakage."),
    T("value", "Best price on this brand."),
    T("cooking", "Cooks well, doesn't crumble in gravies."),
]
PANEER_MIX = [
    T("freshness", "Fresh but has a shorter shelf-life than pharmacy stock."),
]
PANEER_NEG = [
    T("freshness", "Received a hard, dry piece. Poor freshness."),
]

BREAD_POS = [
    T("freshness", "Soft, fresh — great for morning toast during busy WFH weeks."),
    T("freshness", "The {p} lasts my working couple a week easily."),
    T("packaging", "Sealed, fresh. Not stale like corner-shop bread."),
    T("value", "Same MRP, doorstep delivery."),
]
BREAD_MIX = [
    T("freshness", "Fresh but soft-fresh — best used within 2-3 days."),
]
BREAD_NEG = [
    T("freshness", "Received a stale loaf. Blinkit needs to rotate stock."),
]

CHEESE_POS = [
    T("taste", "Cheddar melts perfectly on my grilled sandwiches."),
    T("taste", "The {p} adds authentic flavor to my pasta nights."),
    T("packaging", "Sealed, arrived cold. Fresh."),
    T("value", "Same MRP, delivered fast."),
]
CHEESE_MIX = [
    T("taste", "Fine but not as sharp as the imported version."),
]
CHEESE_NEG = [
    T("freshness", "Received a moldy edge. Poor storage."),
]

CURD_POS = [
    T("freshness", "Fresh, thick — perfect for weekend meal prep."),
    T("freshness", "The {p} sets to a smooth texture. Great with lunch."),
    T("packaging", "Sealed cup, no leakage."),
]
CURD_MIX = [
    T("taste", "Fine but slightly sour on arrival."),
]
CURD_NEG = [
    T("freshness", "Received a sour, near-expiry cup."),
]

# ============================================================================
# MUNCHIES — chips, popcorn, namkeen, snacks
# ============================================================================
CHIPS_POS = [
    T("crunch", "Crispy right out of the bag — perfect between-meeting snack."),
    T("crunch", "The {p} has the crunch I remember. Fresh stock."),
    T("flavor", "Masala flavor is punchy — perfect with evening tea."),
    T("packaging", "Sealed pouch, no crushed chips."),
    T("value", "Same MRP, doorstep delivery."),
    T("delivery", "Ordered on my standup break — arrived by end of call."),
]
CHIPS_MIX = [
    T("crunch", "Fine but a few chips at the bottom were broken."),
    T("flavor", "Tasty but the flavour is milder than the older versions."),
]
CHIPS_NEG = [
    T("freshness", "Stale pouch. Blinkit needs FIFO on the shelf."),
]

POPCORN_POS = [
    T("crunch", "Fresh, crispy — perfect movie-night snack."),
    T("crunch", "The {p} has the right buttery crunch. Weekend essential."),
    T("flavor", "Butter-salt balance is perfect. Not too greasy."),
    T("packaging", "Airtight pack, fresh."),
    T("value", "Family pack, best price."),
]
POPCORN_MIX = [
    T("flavor", "Fine but flavour is milder than I like."),
]
POPCORN_NEG = [
    T("freshness", "Received a stale pack. Poor rotation."),
]

NAMKEEN_POS = [
    T("crunch", "Fresh, crunchy — perfect for evening chai."),
    T("crunch", "The {p} is the tea-time namkeen I remember from home."),
    T("flavor", "Authentic masala mix — well-balanced spices."),
    T("packaging", "Sealed, no oil leakage."),
    T("value", "Family pack, best rate."),
]
NAMKEEN_MIX = [
    T("crunch", "Crispy but has more oil than I'd like."),
]
NAMKEEN_NEG = [
    T("freshness", "Pack was old — soggy on opening."),
]

SNACKS_POS = [
    T("taste", "Perfect between-meeting energy bite."),
    T("taste", "The {p} is my go-to sprint-week snack."),
    T("packaging", "Sealed, fresh."),
    T("value", "Best price on family pack."),
]
SNACKS_MIX = [
    T("taste", "Tasty but slightly small for the price."),
]
SNACKS_NEG = [
    T("freshness", "Stale on arrival. Won't reorder."),
]

# ============================================================================
# COLD_DRINKS_JUICES — softdrink, juice, energydrink
# ============================================================================
SOFTDRINK_POS = [
    T("temperature", "Ice-cold on arrival — Blinkit cold-chain works."),
    T("temperature", "The {p} was chilled perfectly. Post-lunch coma fix."),
    T("taste", "Full fizz, no watered-down feeling. Fresh."),
    T("packaging", "Sealed bottle, no leaks in the delivery bag."),
    T("value", "Same MRP, delivered fast."),
    T("delivery", "Ordered case for Friday team chill — arrived cold."),
]
SOFTDRINK_MIX = [
    T("temperature", "Not as cold as I hoped. Fine to chill in the fridge."),
]
SOFTDRINK_NEG = [
    T("packaging", "Bottle leaked during transit. Half gone."),
]

JUICE_POS = [
    T("taste", "Real fruit taste — not the diluted concentrate."),
    T("taste", "The {p} tastes like fresh-squeezed. Post-workout essential."),
    T("nutrition", "No added sugar — feels genuinely healthy."),
    T("packaging", "Sealed tetra-pak, fresh."),
    T("value", "Best price on this brand."),
]
JUICE_MIX = [
    T("taste", "Fine but sweeter than I expected. Check the sugar content."),
]
JUICE_NEG = [
    T("freshness", "Received near-expiry pack."),
]

ENERGYDRINK_POS = [
    T("effectiveness", "Real kick — perfect for late-night deployments."),
    T("effectiveness", "The {p} gets me through my post-work gym session."),
    T("taste", "Not too sweet, not too artificial. Fine flavor."),
    T("temperature", "Arrived cold, ready to drink."),
    T("value", "Best price on this brand."),
]
ENERGYDRINK_MIX = [
    T("taste", "Effective but the flavour is artificial."),
]
ENERGYDRINK_NEG = [
    T("effectiveness", "No noticeable kick. Might be near-expiry."),
]

# ============================================================================
# SWEET_TOOTH — chocolate, icecream, candy
# ============================================================================
CHOCOLATE_POS = [
    T("taste", "Rich, smooth — perfect post-sprint reward."),
    T("taste", "The {p} melts just right. Chocolate lover approved."),
    T("temperature", "Arrived cool, not melted — Blinkit cold-chain works."),
    T("packaging", "Sealed wrapper, no bloom."),
    T("value", "Same MRP, delivered fast."),
    T("indulgence", "Small treat after a rough project week."),
]
CHOCOLATE_MIX = [
    T("temperature", "Slightly soft on arrival but still good."),
]
CHOCOLATE_NEG = [
    T("freshness", "Chalky white bloom on the chocolate. Old stock."),
]

ICECREAM_POS = [
    T("temperature", "Arrived frozen solid — impressive cold-chain."),
    T("temperature", "The {p} was still hard on arrival. Blinkit's cold-chain is real."),
    T("taste", "Creamy, rich — restaurant-quality."),
    T("value", "Family pack, best price."),
    T("indulgence", "Weekend movie-night essential."),
]
ICECREAM_MIX = [
    T("temperature", "Slightly soft on arrival. Refroze fine."),
]
ICECREAM_NEG = [
    T("temperature", "Arrived half-melted. Refroze but texture suffered."),
]

CANDY_POS = [
    T("taste", "Nostalgic flavor — takes me back to childhood."),
    T("taste", "The {p} has the classic taste I remember."),
    T("packaging", "Sealed pack, fresh."),
    T("value", "Family pack, best price."),
]
CANDY_MIX = [
    T("taste", "Fine but flavour is milder than I expected."),
]
CANDY_NEG = [
    T("freshness", "Sticky, near-expiry pack."),
]

# ============================================================================
# BISCUITS_BAKERY — biscuits, cookies, rusk, cake
# ============================================================================
BISCUITS_POS = [
    T("taste", "Perfect with chai — not too sweet, right crunch."),
    T("taste", "The {p} is my go-to between-standup snack."),
    T("packaging", "Sealed pack, no breakage. Fresh."),
    T("value", "Family pack, best price."),
    T("delivery", "Ordered during my client call — arrived by end of the meeting."),
]
BISCUITS_MIX = [
    T("packaging", "Fine but a few biscuits at the bottom were broken."),
]
BISCUITS_NEG = [
    T("freshness", "Stale packet. Blinkit needs FIFO."),
]

COOKIES_POS = [
    T("taste", "Rich, chocolatey — perfect weekend treat."),
    T("taste", "The {p} has the classic bakery taste. Nostalgic."),
    T("packaging", "Sealed pack, fresh."),
    T("value", "Best price on family pack."),
]
COOKIES_MIX = [
    T("taste", "Fine but softer than I expected."),
]
COOKIES_NEG = [
    T("freshness", "Received a stale pack."),
]

RUSK_POS = [
    T("crunch", "Perfect with tea — right level of crunch."),
    T("taste", "The {p} is the tea-time rusk I grew up with."),
    T("packaging", "Sealed pack, no breakage."),
    T("value", "Best price on family pack."),
]
RUSK_MIX = [
    T("crunch", "Fine but slightly less crunchy than the market vendor."),
]
RUSK_NEG = [
    T("freshness", "Received a soft pack. Poor rotation."),
]

CAKE_POS = [
    T("taste", "Fresh, moist — perfect for a working-week treat."),
    T("taste", "The {p} tastes like bakery-fresh. Genuine quality."),
    T("packaging", "Sealed pack, no crumbling."),
    T("value", "Best price for the size."),
    T("delivery", "Ordered for a team birthday — arrived on time."),
]
CAKE_MIX = [
    T("taste", "Fine but slightly dry."),
]
CAKE_NEG = [
    T("freshness", "Received a stale, dry cake. Poor stock."),
]

# ============================================================================
# INTIMATE_PERSONAL — sanitary_pad, intimate_wash, condom, panty_liner
# ============================================================================
SANITARY_PAD_POS = [
    T("absorbency", "No leaks during long meetings. Working-woman essential."),
    T("absorbency", "The {p} handles overnight use perfectly. Peaceful sleep."),
    T("comfort", "Soft, no chafing even on long-desk days."),
    T("discretion", "Discreet packaging as expected. No awkwardness."),
    T("value", "Bulk pack, best price. Monthly stock."),
]
SANITARY_PAD_MIX = [
    T("absorbency", "Good for daytime but need to change for overnight."),
]
SANITARY_PAD_NEG = [
    T("comfort", "Caused irritation. Not for my skin type."),
]

INTIMATE_WASH_POS = [
    T("effectiveness", "Gentle, effective. No irritation."),
    T("effectiveness", "The {p} maintains pH balance without discomfort."),
    T("fragrance", "Subtle fragrance — not overpowering."),
    T("discretion", "Discreet packaging on arrival."),
    T("value", "Best price. Reliable stock."),
]
INTIMATE_WASH_MIX = [
    T("fragrance", "Fine but fragrance is stronger than I'd like."),
]
INTIMATE_WASH_NEG = [
    T("effectiveness", "Caused irritation. Not for me."),
]

CONDOM_POS = [
    T("comfort", "Comfortable, reliable. Trusted brand."),
    T("safety", "Feels safe — genuine seal, no fake concerns."),
    T("discretion", "Discreet packaging as expected."),
    T("value", "Best price on family pack."),
]
CONDOM_MIX = [
    T("comfort", "Fine but the packaging is bulkier than I expected."),
]
CONDOM_NEG = []

PANTY_LINER_POS = [
    T("comfort", "Soft, breathable — daily-use essential."),
    T("comfort", "The {p} stays put all day. Working-woman reliable."),
    T("absorbency", "Handles light discharge well."),
    T("discretion", "Discreet packaging."),
    T("value", "Bulk pack, best price."),
]
PANTY_LINER_MIX = [
    T("absorbency", "Fine for light days, need more for heavier."),
]
PANTY_LINER_NEG = []

# ============================================================================
# PET — pet_food, pet_treats, cat_food, pet_shampoo, cat_litter
# ============================================================================
PET_FOOD_POS = [
    T("pet_love", "My dog loves it. Weekly stock now."),
    T("pet_love", "The {p} is the only food my picky Beagle finishes."),
    T("quality", "Balanced nutrition — my vet approved."),
    T("packaging", "Sealed bag, kibble is fresh."),
    T("value", "Cheaper than pet-store price, delivered."),
    T("delivery", "Ran out on a Sunday — Blinkit delivered before dinner."),
]
PET_FOOD_MIX = [
    T("pet_love", "Fine but my dog doesn't love it. Fine for maintenance."),
]
PET_FOOD_NEG = [
    T("quality", "My dog vomited. Might be a bad batch."),
]

CAT_FOOD_POS = [
    T("pet_love", "My cat loves it — finishes the bowl. Rare."),
    T("pet_love", "The {p} is even picky-cat approved."),
    T("quality", "Balanced nutrition, good ingredients."),
    T("packaging", "Sealed bag, fresh."),
    T("value", "Best price on this brand."),
]
CAT_FOOD_MIX = [
    T("pet_love", "My cat ate it but wasn't excited."),
]
CAT_FOOD_NEG = [
    T("quality", "Cat refused to eat. Wasted purchase."),
]

PET_TREATS_POS = [
    T("pet_love", "Training treat — my dog does anything for these."),
    T("pet_love", "The {p} is my dog's post-walk reward. Loves it."),
    T("value", "Bulk pack, best price."),
]
PET_TREATS_MIX = [
    T("pet_love", "Fine but my dog isn't crazy about it."),
]
PET_TREATS_NEG = []

PET_SHAMPOO_POS = [
    T("effectiveness", "Cleans well, coat feels soft and smells fresh."),
    T("effectiveness", "The {p} handles my Labrador's grease well."),
    T("safety", "No irritation on my dog's sensitive skin."),
    T("fragrance", "Subtle fragrance — not overpowering."),
    T("value", "Best price on this brand."),
]
PET_SHAMPOO_MIX = [
    T("fragrance", "Fine but fragrance is stronger than I expected."),
]
PET_SHAMPOO_NEG = [
    T("safety", "Irritated my dog's skin. Discontinued."),
]

CAT_LITTER_POS = [
    T("odor", "Handles odor well — flat doesn't smell."),
    T("odor", "The {p} traps odor better than my previous brand."),
    T("absorbency", "Clumps well, easy to scoop."),
    T("packaging", "Sturdy bag, no dust."),
    T("value", "Bulk pack, best price."),
]
CAT_LITTER_MIX = [
    T("absorbency", "Clumps okay but tracks around the flat."),
]
CAT_LITTER_NEG = [
    T("odor", "Doesn't handle odor well."),
]

# ============================================================================
# VEGETABLES_FRUITS — apple, potato, onion, lemon, cucumber, strawberry, banana, tomato
# ============================================================================
APPLE_POS = [
    T("freshness", "Crisp, fresh — better than local sabziwala."),
    T("freshness", "The {p} was bright red and juicy. Genuine Kashmir apples."),
    T("packaging", "Well-packed, no bruising."),
    T("value", "Fair price for fresh produce."),
    T("delivery", "Weekend snack stock — arrived on time."),
]
APPLE_MIX = [
    T("freshness", "Fresh but some were slightly softer than expected."),
]
APPLE_NEG = [
    T("freshness", "Mealy — old stock."),
]

POTATO_POS = [
    T("freshness", "Fresh, no sprouting. Weekly stock."),
    T("freshness", "The {p} is farm-fresh — cooks well."),
    T("value", "Fair price on essentials."),
    T("packaging", "Well-packed, no bruising."),
]
POTATO_MIX = [
    T("freshness", "Fresh but had a few sprouted ones."),
]
POTATO_NEG = [
    T("freshness", "Received rotten potatoes. Poor sourcing."),
]

ONION_POS = [
    T("freshness", "Fresh, firm — no soft spots."),
    T("freshness", "The {p} is well-sized. Uniform quality."),
    T("value", "Fair price for the season."),
]
ONION_MIX = [
    T("freshness", "Fresh but some had spoiled edges."),
]
ONION_NEG = [
    T("freshness", "Received rotten onions. Poor freshness."),
]

LEMON_POS = [
    T("freshness", "Juicy, thin-skinned — perfect for lemonade."),
    T("freshness", "The {p} is bright and fresh."),
    T("value", "Fair seasonal pricing."),
]
LEMON_MIX = [
    T("freshness", "Fresh but a few were dry inside."),
]
LEMON_NEG = [
    T("freshness", "Dry, past-prime lemons."),
]

CUCUMBER_POS = [
    T("freshness", "Crisp, fresh — great for salads."),
    T("freshness", "The {p} was farm-fresh."),
    T("value", "Fair price."),
]
CUCUMBER_MIX = [
    T("freshness", "Fresh but slightly soft."),
]
CUCUMBER_NEG = [
    T("freshness", "Soft, near-spoilage."),
]

STRAWBERRY_POS = [
    T("freshness", "Sweet, red — genuine fresh berries."),
    T("freshness", "The {p} tasted like proper strawberries. Not the sour ones."),
    T("packaging", "Well-packed, no crushing."),
    T("value", "Fair for the season."),
]
STRAWBERRY_MIX = [
    T("freshness", "Fresh but a few were bruised."),
]
STRAWBERRY_NEG = [
    T("freshness", "Received moldy berries. Poor stock."),
]

BANANA_POS = [
    T("ripeness", "Perfect ripeness — not too green, not too ripe."),
    T("freshness", "The {p} was fresh and well-shaped."),
    T("value", "Fair price."),
]
BANANA_MIX = [
    T("ripeness", "Slightly greener than expected — will ripen in 2 days."),
]
BANANA_NEG = [
    T("freshness", "Received black, overripe bananas."),
]

TOMATO_POS = [
    T("freshness", "Ripe, red — perfect for cooking."),
    T("freshness", "The {p} was firm and fresh. Great for salads."),
    T("value", "Fair seasonal price."),
]
TOMATO_MIX = [
    T("freshness", "Fresh but some were softer than expected."),
]
TOMATO_NEG = [
    T("freshness", "Received squashed, over-ripe tomatoes."),
]

# ============================================================================
# BOOKS — fiction, self_help, non_fiction, children, academic
# ============================================================================
FICTION_POS = [
    T("story", "Couldn't put down — weekend well spent."),
    T("story", "The {p} kept me hooked all Sunday."),
    T("condition", "Publisher-sealed, brand new."),
    T("delivery", "Ordered for weekend read — arrived Friday evening."),
    T("value", "Same as Amazon, delivered same-day."),
]
FICTION_MIX = [
    T("story", "Content is good but drags in the middle."),
    T("condition", "Book was fine but had a small dent."),
]
FICTION_NEG = [
    T("condition", "Book arrived with torn pages."),
]

SELF_HELP_POS = [
    T("content", "Actionable insights, not fluff. Real value."),
    T("content", "The {p} gave me tools I'm using at work already."),
    T("condition", "Brand new, publisher-sealed."),
    T("value", "Same as Amazon, delivered fast."),
]
SELF_HELP_MIX = [
    T("content", "Fine but similar to books I've already read."),
]
SELF_HELP_NEG = [
    T("content", "Generic advice, no real depth."),
]

NON_FICTION_POS = [
    T("content", "Well-researched, thought-provoking. Great weekend read."),
    T("content", "The {p} changed how I think about the topic."),
    T("condition", "Brand new, hardcover."),
    T("value", "Same as Amazon, no wait."),
]
NON_FICTION_MIX = [
    T("content", "Fine but denser than I expected. Slow read."),
]
NON_FICTION_NEG = [
    T("condition", "Book arrived with pages folded."),
]

CHILDREN_POS = [
    T("age_appropriate", "My 8-year-old loved it. Right reading level."),
    T("age_appropriate", "The {p} kept my kid engaged for hours."),
    T("condition", "Brand new, colorful."),
    T("value", "Cheaper than the mall bookstore."),
]
CHILDREN_MIX = [
    T("age_appropriate", "Fine but slightly advanced for my 5-year-old."),
]
CHILDREN_NEG = [
    T("condition", "Received a used-looking copy."),
]

ACADEMIC_POS = [
    T("content", "Clear explanations, well-structured. Great for exam prep."),
    T("content", "The {p} is the reference book my professor recommended."),
    T("condition", "Latest edition, publisher-sealed."),
    T("value", "Cheaper than the college store."),
]
ACADEMIC_MIX = [
    T("content", "Content is good but the layout is dense."),
]
ACADEMIC_NEG = [
    T("condition", "Received an outdated edition."),
]

# ============================================================================
# JEWELLERY — earrings, necklace, ring, bracelet, bangles, pendant
# ============================================================================
EARRINGS_POS = [
    T("look", "Elegant, office-appropriate. Perfect with formal wear."),
    T("look", "The {p} got compliments in my client meeting."),
    T("comfort", "Lightweight, comfortable for all-day wear."),
    T("skin_safe", "Hypoallergenic — no reactions after weeks of wear."),
    T("packaging", "Gift-ready box, well-protected."),
    T("value", "Cheaper than the mall store, same brand."),
]
EARRINGS_MIX = [
    T("comfort", "Fine but a bit heavy for continuous wear."),
]
EARRINGS_NEG = [
    T("skin_safe", "Caused irritation on my ears."),
]

NECKLACE_POS = [
    T("look", "Delicate, elegant — perfect for both office and evening."),
    T("look", "The {p} is a versatile daily-wear piece."),
    T("chain_quality", "Chain is well-made, no kinks."),
    T("packaging", "Gift-ready box."),
    T("value", "Cheaper than the brand outlet."),
]
NECKLACE_MIX = [
    T("chain_quality", "Fine but the clasp is a bit fiddly."),
]
NECKLACE_NEG = [
    T("look", "Tarnished within a week. Poor plating."),
]

RING_POS = [
    T("fit", "Fits perfectly as per sizing chart."),
    T("fit", "The {p} fit my finger exactly right. Trusted sizing."),
    T("look", "Elegant, office-appropriate."),
    T("skin_safe", "No skin discoloration after weeks of daily wear."),
    T("value", "Great value for the design."),
]
RING_MIX = [
    T("fit", "Ran slightly small. Size up if unsure."),
]
RING_NEG = [
    T("skin_safe", "Turned my finger green. Poor plating."),
]

BRACELET_POS = [
    T("look", "Subtle, professional — pairs well with a watch."),
    T("look", "The {p} adds a touch of elegance to office wear."),
    T("comfort", "Comfortable, no snagging on clothes."),
    T("value", "Cheaper than the mall store."),
]
BRACELET_MIX = [
    T("comfort", "Fine but the clasp is fiddly."),
]
BRACELET_NEG = [
    T("look", "Tarnished within a month."),
]

BANGLES_POS = [
    T("look", "Traditional, elegant — perfect for family functions."),
    T("look", "The {p} pairs well with sarees and kurtas."),
    T("fit", "Slid on easily, sized correctly."),
    T("value", "Cheaper than the local jeweller."),
]
BANGLES_MIX = [
    T("fit", "Fine but slightly loose."),
]
BANGLES_NEG = [
    T("look", "Coating chipped within weeks."),
]

PENDANT_POS = [
    T("look", "Delicate, elegant — subtle statement piece."),
    T("look", "The {p} pairs well with formal wear."),
    T("packaging", "Gift-ready box."),
    T("value", "Great for the design."),
]
PENDANT_MIX = [
    T("look", "Fine but smaller than I expected from photos."),
]
PENDANT_NEG = [
    T("look", "Tarnished quickly."),
]

# ============================================================================
# SPIRITUAL — incense, diya, idol, pooja, camphor, rudraksha
# ============================================================================
INCENSE_POS = [
    T("aroma", "Calming fragrance — perfect for morning pooja."),
    T("aroma", "The {p} has a soothing scent that fills the whole flat."),
    T("burn_time", "Long-lasting sticks — great value."),
    T("packaging", "Sealed pack, aroma preserved."),
    T("value", "Same as temple prasadam shop."),
]
INCENSE_MIX = [
    T("aroma", "Fine but fragrance is milder than expected."),
]
INCENSE_NEG = [
    T("burn_time", "Sticks broke easily. Poor quality."),
]

DIYA_POS = [
    T("burn_quality", "Even burn, no dripping. Perfect for pooja."),
    T("burn_quality", "The {p} lit easily and burned bright."),
    T("packaging", "Well-packed, no breakage."),
    T("value", "Great value for the pack."),
]
DIYA_MIX = [
    T("burn_quality", "Fine but some diyas cracked when lit."),
]
DIYA_NEG = [
    T("packaging", "Half broken on arrival."),
]

IDOL_POS = [
    T("craftsmanship", "Fine detailing — feels authentic."),
    T("craftsmanship", "The {p} has beautiful craftsmanship. Temple-quality."),
    T("packaging", "Well-protected, no chipping."),
    T("value", "Cheaper than temple shops."),
]
IDOL_MIX = [
    T("craftsmanship", "Fine but the paint is slightly uneven."),
]
IDOL_NEG = [
    T("packaging", "Idol arrived with a chipped edge."),
]

POOJA_POS = [
    T("completeness", "Complete kit — everything I needed for the ritual."),
    T("completeness", "The {p} saved me multiple errands."),
    T("value", "Great value for the pack."),
    T("packaging", "Well-organized, easy to use."),
]
POOJA_MIX = [
    T("completeness", "Fine but missing one small item."),
]
POOJA_NEG = [
    T("packaging", "Some items were spilled."),
]

CAMPHOR_POS = [
    T("aroma", "Pure fragrance — genuine camphor."),
    T("burn_quality", "Burns cleanly, no residue."),
    T("value", "Best price on this brand."),
]
CAMPHOR_MIX = [
    T("burn_quality", "Fine but burns faster than expected."),
]
CAMPHOR_NEG = []

RUDRAKSHA_POS = [
    T("authenticity", "Genuine, well-formed beads."),
    T("authenticity", "The {p} feels authentic — trusted brand."),
    T("packaging", "Well-packed, clean."),
    T("value", "Cheaper than temple shops."),
]
RUDRAKSHA_MIX = [
    T("authenticity", "Fine but some beads are uneven."),
]
RUDRAKSHA_NEG = [
    T("authenticity", "Feels synthetic. Not confident it's genuine."),
]

# ============================================================================
# STATIONERY_GAMES — pen, notebook, chess, ludo, cards, art, geometry
# ============================================================================
PEN_POS = [
    T("writing", "Smooth, no smudge — perfect for client presentations."),
    T("writing", "The {p} writes cleanly on any paper. Reliable."),
    T("grip", "Ergonomic grip — no hand fatigue on long note-taking."),
    T("ink_life", "Ink lasts weeks of daily office use."),
    T("value", "Cheaper than office supply store."),
]
PEN_MIX = [
    T("writing", "Writes well but ink dries out faster than expected."),
]
PEN_NEG = [
    T("writing", "Tip broke within a week."),
]

NOTEBOOK_POS = [
    T("paper", "Smooth, thick paper — no bleed-through."),
    T("paper", "The {p} handles fountain-pen ink without ghosting."),
    T("binding", "Sturdy binding — lies flat on my WFH desk."),
    T("value", "Cheaper than the stationery store."),
]
NOTEBOOK_MIX = [
    T("paper", "Fine but paper is thinner than I expected."),
]
NOTEBOOK_NEG = [
    T("binding", "Binding broke after 2 months."),
]

CHESS_POS = [
    T("build_quality", "Weighted pieces feel premium. Beautiful board."),
    T("build_quality", "The {p} is well-crafted — Sunday morning game essential."),
    T("packaging", "Well-packed, no damage."),
    T("value", "Great value for the tier."),
]
CHESS_MIX = [
    T("build_quality", "Fine but pieces are slightly wobbly."),
]
CHESS_NEG = [
    T("packaging", "Board was scratched on arrival."),
]

LUDO_POS = [
    T("family_fun", "Family game-night essential. Everyone loved it."),
    T("family_fun", "The {p} brought back childhood memories."),
    T("build_quality", "Sturdy board, quality dice."),
    T("value", "Great price for the pack."),
]
LUDO_MIX = [
    T("build_quality", "Fine but pieces are lightweight."),
]
LUDO_NEG = [
    T("packaging", "Missing pieces on arrival."),
]

CARDS_POS = [
    T("build_quality", "Sturdy cards, high-quality print. Long-lasting."),
    T("build_quality", "The {p} handles regular play well. No wear."),
    T("value", "Best price on this brand."),
]
CARDS_MIX = [
    T("build_quality", "Fine but not as sturdy as premium brands."),
]
CARDS_NEG = [
    T("packaging", "Cards were creased on arrival."),
]

ART_POS = [
    T("quality", "Vibrant colors, long-lasting. Weekend hobby essential."),
    T("quality", "The {p} is genuine art-grade quality."),
    T("value", "Cheaper than art-supply stores."),
]
ART_MIX = [
    T("quality", "Fine for hobby use, might not be pro-grade."),
]
ART_NEG = [
    T("quality", "Colors faded quickly."),
]

GEOMETRY_POS = [
    T("accuracy", "Precise measurements, perfect for school work."),
    T("value", "Cheaper than the school supply store."),
]
GEOMETRY_MIX = [
    T("accuracy", "Fine but scale markings are hard to read."),
]
GEOMETRY_NEG = []

# ============================================================================
# SPORTS_OUTDOOR — cricket_bat, football, badminton, ball_sports, fitness, outdoor
# ============================================================================
CRICKET_BAT_POS = [
    T("build_quality", "Solid willow, good weight balance. Weekend gully cricket ready."),
    T("build_quality", "The {p} feels well-crafted — sweet spot is generous."),
    T("grip", "Grip is comfortable — no slipping on sweaty summer sessions."),
    T("value", "Cheaper than the sports store near me."),
]
CRICKET_BAT_MIX = [
    T("build_quality", "Fine but the finish shows minor scratches."),
]
CRICKET_BAT_NEG = [
    T("build_quality", "Broke in 3 weekend games."),
]

FOOTBALL_POS = [
    T("build_quality", "Perfect weight, stitching holds up on rough grounds."),
    T("build_quality", "The {p} feels tournament-quality. Weekend games are on."),
    T("value", "Cheaper than the sports store."),
]
FOOTBALL_MIX = [
    T("build_quality", "Fine but loses air faster than expected."),
]
FOOTBALL_NEG = [
    T("build_quality", "Ripped seam within a month."),
]

BADMINTON_POS = [
    T("build_quality", "Well-balanced racket — no vibration on smashes."),
    T("build_quality", "The {p} handles evening society sessions perfectly."),
    T("value", "Cheaper than sports-brand stores."),
]
BADMINTON_MIX = [
    T("build_quality", "Fine but the string tension isn't ideal for pros."),
]
BADMINTON_NEG = [
    T("build_quality", "String broke in 2 games."),
]

BALL_SPORTS_POS = [
    T("build_quality", "Durable, well-made. Weekend group play ready."),
    T("value", "Best price for the tier."),
]
BALL_SPORTS_MIX = [
    T("build_quality", "Fine for casual play."),
]
BALL_SPORTS_NEG = []

FITNESS_POS = [
    T("build_quality", "Sturdy build. Weekend fitness routine essential."),
    T("build_quality", "The {p} handles daily use without wear."),
    T("value", "Cheaper than gym stores."),
]
FITNESS_MIX = [
    T("build_quality", "Fine but foam wears down over time."),
]
FITNESS_NEG = []

OUTDOOR_POS = [
    T("build_quality", "Perfect for weekend picnics and outdoor family time."),
    T("build_quality", "The {p} feels well-made for outdoor use."),
    T("value", "Cheaper than outdoor-gear stores."),
]
OUTDOOR_MIX = [
    T("build_quality", "Fine but heavier than expected."),
]
OUTDOOR_NEG = []


# ---------- FINAL 9 SUBCATEGORIES (miscellaneous) ---------------------------

CARROM_POS = [
    T("build_quality", "Smooth board, quality pieces. Weekend office game essential."),
    T("build_quality", "The {p} handles regular play — polished surface, no warping."),
    T("value", "Cheaper than sports stores. Well-packaged."),
]
CARROM_MIX = [T("build_quality", "Fine but pieces are slightly lightweight.")]
CARROM_NEG = [T("packaging", "Board arrived with a scratch.")]

TOOTHPASTE_POS = [
    T("effectiveness", "Fresh breath through 4-hour standups. Daily essential."),
    T("effectiveness", "The {p} handles my sensitivity issue well."),
    T("taste", "Mint flavor is clean, not artificial."),
    T("value", "Best price on family pack."),
]
TOOTHPASTE_MIX = [T("taste", "Fine but stronger mint than I like.")]
TOOTHPASTE_NEG = [T("effectiveness", "Didn't help my sensitivity.")]

FIRST_AID_POS = [
    T("effectiveness", "Perfect for the office first-aid drawer."),
    T("effectiveness", "The {p} handled a kitchen cut quickly. Reliable."),
    T("value", "Best price on this brand."),
]
FIRST_AID_MIX = [T("effectiveness", "Fine but takes longer than marketed.")]
FIRST_AID_NEG = [T("effectiveness", "Didn't stick well after 2 hours.")]

BABY_SHAMPOO_POS = [
    T("skin_safe", "Tear-free formulation — bath time is stress-free."),
    T("skin_safe", "The {p} is gentle on baby's scalp. No irritation."),
    T("fragrance", "Light baby fragrance — soothing."),
    T("value", "Family pack, best price."),
]
BABY_SHAMPOO_MIX = [T("fragrance", "Fine but fragrance is a touch stronger than expected.")]
BABY_SHAMPOO_NEG = [T("skin_safe", "Baby's eyes stung. Not truly tear-free for us.")]

FABRIC_CONDITIONER_POS = [
    T("softness", "Clothes feel soft, no static. Perfect for winter wear."),
    T("softness", "The {p} keeps my office shirts soft through the week."),
    T("fragrance", "Fresh fragrance lingers just enough."),
    T("value", "Bulk bottle, best value."),
]
FABRIC_CONDITIONER_MIX = [T("fragrance", "Cleans well but fragrance is stronger than I'd like.")]
FABRIC_CONDITIONER_NEG = [T("softness", "Barely made a difference.")]

BUTTERMILK_POS = [
    T("freshness", "Cold, fresh — perfect post-lunch drink."),
    T("freshness", "The {p} tastes like my grandmother's chaas."),
    T("value", "Best price, doorstep delivery."),
]
BUTTERMILK_MIX = [T("freshness", "Fresh but shelf-life is short. Consume same day.")]
BUTTERMILK_NEG = [T("freshness", "Received sour, near-expiry pack.")]

KIWI_POS = [
    T("freshness", "Sweet, ripe — perfect for a working-week snack."),
    T("freshness", "The {p} is farm-fresh, no soft spots."),
    T("value", "Fair for the season."),
]
KIWI_MIX = [T("freshness", "Fresh but 2 were harder than expected.")]
KIWI_NEG = [T("freshness", "Received overripe, mushy fruit.")]

CAPSICUM_POS = [
    T("freshness", "Crisp, glossy — perfect for weekend cooking."),
    T("freshness", "The {p} is farm-fresh."),
    T("value", "Fair seasonal price."),
]
CAPSICUM_MIX = [T("freshness", "Fresh but a few had soft spots.")]
CAPSICUM_NEG = [T("freshness", "Received wilted, spoiled pieces.")]

KAJAL_POS = [
    T("longevity", "Stays on through 9-hour office days. No smudging."),
    T("longevity", "The {p} lasts through evening meetings without touch-ups."),
    T("skin_safe", "Non-irritating on my sensitive eyes."),
    T("value", "Cheaper than the mall store. Same brand."),
]
KAJAL_MIX = [T("longevity", "Fine but slight smudging on humid days.")]
KAJAL_NEG = [T("skin_safe", "Irritated my eyes after 2 hours.")]

# ---- MAP ----
EXTENDED_POOLS = {
    # atta_rice_dal
    ("atta_rice_dal", "atta"):   (ATTA_POS, ATTA_MIX, ATTA_NEG),
    ("atta_rice_dal", "rice"):   (RICE_POS, RICE_MIX, RICE_NEG),
    ("atta_rice_dal", "dal"):    (DAL_POS, DAL_MIX, DAL_NEG),
    ("atta_rice_dal", "flour"):  (FLOUR_POS, FLOUR_MIX, FLOUR_NEG),
    # masala_oil
    ("masala_oil", "oil"):    (OIL_POS, OIL_MIX, OIL_NEG),
    ("masala_oil", "spices"): (SPICES_POS, SPICES_MIX, SPICES_NEG),
    ("masala_oil", "salt"):   (SALT_POS, SALT_MIX, SALT_NEG),
    # instant_frozen
    ("instant_frozen", "frozenfood"): (FROZENFOOD_POS, FROZENFOOD_MIX, FROZENFOOD_NEG),
    ("instant_frozen", "noodles"):    (NOODLES_POS, NOODLES_MIX, NOODLES_NEG),
    ("instant_frozen", "soup"):       (SOUP_POS, SOUP_MIX, SOUP_NEG),
    # dairy_bread_eggs
    ("dairy_bread_eggs", "milk"):   (MILK_POS, MILK_MIX, MILK_NEG),
    ("dairy_bread_eggs", "eggs"):   (EGGS_POS, EGGS_MIX, EGGS_NEG),
    ("dairy_bread_eggs", "butter"): (BUTTER_POS, BUTTER_MIX, BUTTER_NEG),
    ("dairy_bread_eggs", "paneer"): (PANEER_POS, PANEER_MIX, PANEER_NEG),
    ("dairy_bread_eggs", "bread"):  (BREAD_POS, BREAD_MIX, BREAD_NEG),
    ("dairy_bread_eggs", "cheese"): (CHEESE_POS, CHEESE_MIX, CHEESE_NEG),
    ("dairy_bread_eggs", "curd"):   (CURD_POS, CURD_MIX, CURD_NEG),
    # munchies
    ("munchies", "chips"):   (CHIPS_POS, CHIPS_MIX, CHIPS_NEG),
    ("munchies", "popcorn"): (POPCORN_POS, POPCORN_MIX, POPCORN_NEG),
    ("munchies", "namkeen"): (NAMKEEN_POS, NAMKEEN_MIX, NAMKEEN_NEG),
    ("munchies", "snacks"):  (SNACKS_POS, SNACKS_MIX, SNACKS_NEG),
    # cold_drinks_juices
    ("cold_drinks_juices", "softdrink"):   (SOFTDRINK_POS, SOFTDRINK_MIX, SOFTDRINK_NEG),
    ("cold_drinks_juices", "juice"):       (JUICE_POS, JUICE_MIX, JUICE_NEG),
    ("cold_drinks_juices", "energydrink"): (ENERGYDRINK_POS, ENERGYDRINK_MIX, ENERGYDRINK_NEG),
    # sweet_tooth
    ("sweet_tooth", "chocolate"): (CHOCOLATE_POS, CHOCOLATE_MIX, CHOCOLATE_NEG),
    ("sweet_tooth", "icecream"):  (ICECREAM_POS, ICECREAM_MIX, ICECREAM_NEG),
    ("sweet_tooth", "candy"):     (CANDY_POS, CANDY_MIX, CANDY_NEG),
    # biscuits_bakery
    ("biscuits_bakery", "biscuits"): (BISCUITS_POS, BISCUITS_MIX, BISCUITS_NEG),
    ("biscuits_bakery", "cookies"):  (COOKIES_POS, COOKIES_MIX, COOKIES_NEG),
    ("biscuits_bakery", "rusk"):     (RUSK_POS, RUSK_MIX, RUSK_NEG),
    ("biscuits_bakery", "cake"):     (CAKE_POS, CAKE_MIX, CAKE_NEG),
    # intimate_personal
    ("intimate_personal", "sanitary_pad"):  (SANITARY_PAD_POS, SANITARY_PAD_MIX, SANITARY_PAD_NEG),
    ("intimate_personal", "intimate_wash"): (INTIMATE_WASH_POS, INTIMATE_WASH_MIX, INTIMATE_WASH_NEG),
    ("intimate_personal", "condom"):        (CONDOM_POS, CONDOM_MIX, CONDOM_NEG),
    ("intimate_personal", "panty_liner"):   (PANTY_LINER_POS, PANTY_LINER_MIX, PANTY_LINER_NEG),
    # pet
    ("pet", "pet_food"):    (PET_FOOD_POS, PET_FOOD_MIX, PET_FOOD_NEG),
    ("pet", "cat_food"):    (CAT_FOOD_POS, CAT_FOOD_MIX, CAT_FOOD_NEG),
    ("pet", "pet_treats"):  (PET_TREATS_POS, PET_TREATS_MIX, PET_TREATS_NEG),
    ("pet", "pet_shampoo"): (PET_SHAMPOO_POS, PET_SHAMPOO_MIX, PET_SHAMPOO_NEG),
    ("pet", "cat_litter"):  (CAT_LITTER_POS, CAT_LITTER_MIX, CAT_LITTER_NEG),
    # vegetables_fruits
    ("vegetables_fruits", "apple"):      (APPLE_POS, APPLE_MIX, APPLE_NEG),
    ("vegetables_fruits", "potato"):     (POTATO_POS, POTATO_MIX, POTATO_NEG),
    ("vegetables_fruits", "onion"):      (ONION_POS, ONION_MIX, ONION_NEG),
    ("vegetables_fruits", "lemon"):      (LEMON_POS, LEMON_MIX, LEMON_NEG),
    ("vegetables_fruits", "cucumber"):   (CUCUMBER_POS, CUCUMBER_MIX, CUCUMBER_NEG),
    ("vegetables_fruits", "strawberry"): (STRAWBERRY_POS, STRAWBERRY_MIX, STRAWBERRY_NEG),
    ("vegetables_fruits", "banana"):     (BANANA_POS, BANANA_MIX, BANANA_NEG),
    ("vegetables_fruits", "tomato"):     (TOMATO_POS, TOMATO_MIX, TOMATO_NEG),
    # books
    ("books", "fiction"):     (FICTION_POS, FICTION_MIX, FICTION_NEG),
    ("books", "self_help"):   (SELF_HELP_POS, SELF_HELP_MIX, SELF_HELP_NEG),
    ("books", "non_fiction"): (NON_FICTION_POS, NON_FICTION_MIX, NON_FICTION_NEG),
    ("books", "children"):    (CHILDREN_POS, CHILDREN_MIX, CHILDREN_NEG),
    ("books", "academic"):    (ACADEMIC_POS, ACADEMIC_MIX, ACADEMIC_NEG),
    # jewellery
    ("jewellery", "earrings"): (EARRINGS_POS, EARRINGS_MIX, EARRINGS_NEG),
    ("jewellery", "necklace"): (NECKLACE_POS, NECKLACE_MIX, NECKLACE_NEG),
    ("jewellery", "ring"):     (RING_POS, RING_MIX, RING_NEG),
    ("jewellery", "bracelet"): (BRACELET_POS, BRACELET_MIX, BRACELET_NEG),
    ("jewellery", "bangles"):  (BANGLES_POS, BANGLES_MIX, BANGLES_NEG),
    ("jewellery", "pendant"):  (PENDANT_POS, PENDANT_MIX, PENDANT_NEG),
    # spiritual
    ("spiritual", "incense"):   (INCENSE_POS, INCENSE_MIX, INCENSE_NEG),
    ("spiritual", "diya"):      (DIYA_POS, DIYA_MIX, DIYA_NEG),
    ("spiritual", "idol"):      (IDOL_POS, IDOL_MIX, IDOL_NEG),
    ("spiritual", "pooja"):     (POOJA_POS, POOJA_MIX, POOJA_NEG),
    ("spiritual", "camphor"):   (CAMPHOR_POS, CAMPHOR_MIX, CAMPHOR_NEG),
    ("spiritual", "rudraksha"): (RUDRAKSHA_POS, RUDRAKSHA_MIX, RUDRAKSHA_NEG),
    # stationery_games
    ("stationery_games", "pen"):      (PEN_POS, PEN_MIX, PEN_NEG),
    ("stationery_games", "notebook"): (NOTEBOOK_POS, NOTEBOOK_MIX, NOTEBOOK_NEG),
    ("stationery_games", "chess"):    (CHESS_POS, CHESS_MIX, CHESS_NEG),
    ("stationery_games", "ludo"):     (LUDO_POS, LUDO_MIX, LUDO_NEG),
    ("stationery_games", "cards"):    (CARDS_POS, CARDS_MIX, CARDS_NEG),
    ("stationery_games", "art"):      (ART_POS, ART_MIX, ART_NEG),
    ("stationery_games", "geometry"): (GEOMETRY_POS, GEOMETRY_MIX, GEOMETRY_NEG),
    # sports_outdoor
    ("sports_outdoor", "cricket_bat"): (CRICKET_BAT_POS, CRICKET_BAT_MIX, CRICKET_BAT_NEG),
    ("sports_outdoor", "football"):    (FOOTBALL_POS, FOOTBALL_MIX, FOOTBALL_NEG),
    ("sports_outdoor", "badminton"):   (BADMINTON_POS, BADMINTON_MIX, BADMINTON_NEG),
    ("sports_outdoor", "ball_sports"): (BALL_SPORTS_POS, BALL_SPORTS_MIX, BALL_SPORTS_NEG),
    ("sports_outdoor", "fitness"):     (FITNESS_POS, FITNESS_MIX, FITNESS_NEG),
    ("sports_outdoor", "outdoor"):     (OUTDOOR_POS, OUTDOOR_MIX, OUTDOOR_NEG),
    # Final 9 misc subcategories
    ("stationery_games", "carrom"):            (CARROM_POS, CARROM_MIX, CARROM_NEG),
    ("personal_care_beauty", "toothpaste"):    (TOOTHPASTE_POS, TOOTHPASTE_MIX, TOOTHPASTE_NEG),
    ("personal_care_beauty", "kajal"):         (KAJAL_POS, KAJAL_MIX, KAJAL_NEG),
    ("pharmacy_health", "first_aid"):          (FIRST_AID_POS, FIRST_AID_MIX, FIRST_AID_NEG),
    ("baby", "baby_shampoo"):                  (BABY_SHAMPOO_POS, BABY_SHAMPOO_MIX, BABY_SHAMPOO_NEG),
    ("home_cleaning", "fabric_conditioner"):   (FABRIC_CONDITIONER_POS, FABRIC_CONDITIONER_MIX, FABRIC_CONDITIONER_NEG),
    ("dairy_bread_eggs", "buttermilk"):        (BUTTERMILK_POS, BUTTERMILK_MIX, BUTTERMILK_NEG),
    ("vegetables_fruits", "kiwi"):             (KIWI_POS, KIWI_MIX, KIWI_NEG),
    ("vegetables_fruits", "capsicum"):         (CAPSICUM_POS, CAPSICUM_MIX, CAPSICUM_NEG),
}
