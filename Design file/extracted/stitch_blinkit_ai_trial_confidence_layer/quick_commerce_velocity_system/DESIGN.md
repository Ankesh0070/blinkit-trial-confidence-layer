---
name: Quick-Commerce Velocity System
colors:
  surface: '#faf9f4'
  surface-dim: '#dbdad5'
  surface-bright: '#faf9f4'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f5f4ef'
  surface-container: '#efeee9'
  surface-container-high: '#e9e8e3'
  surface-container-highest: '#e3e3de'
  on-surface: '#1b1c19'
  on-surface-variant: '#4d4633'
  inverse-surface: '#30312e'
  inverse-on-surface: '#f2f1ec'
  outline: '#7e7761'
  outline-variant: '#d0c6ad'
  surface-tint: '#715d00'
  primary: '#715d00'
  on-primary: '#ffffff'
  primary-container: '#f7d032'
  on-primary-container: '#6d5900'
  inverse-primary: '#e9c323'
  secondary: '#006e16'
  on-secondary: '#ffffff'
  secondary-container: '#8ffb87'
  on-secondary-container: '#007518'
  tertiary: '#5f5e5e'
  on-tertiary: '#ffffff'
  tertiary-container: '#d5d2d2'
  on-tertiary-container: '#5b5a5a'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffe178'
  primary-fixed-dim: '#e9c323'
  on-primary-fixed: '#231b00'
  on-primary-fixed-variant: '#554500'
  secondary-fixed: '#8ffb87'
  secondary-fixed-dim: '#74dd6e'
  on-secondary-fixed: '#002203'
  on-secondary-fixed-variant: '#00530e'
  tertiary-fixed: '#e5e2e1'
  tertiary-fixed-dim: '#c8c6c5'
  on-tertiary-fixed: '#1b1b1b'
  on-tertiary-fixed-variant: '#474746'
  background: '#faf9f4'
  on-background: '#1b1c19'
  surface-variant: '#e3e3de'
typography:
  display-lg:
    fontFamily: Outfit
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Outfit
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 34px
  headline-md:
    fontFamily: Outfit
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
  headline-sm:
    fontFamily: Outfit
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-lg:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Inter
    fontSize: 10px
    fontWeight: '500'
    lineHeight: 14px
  headline-lg-mobile:
    fontFamily: Outfit
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 30px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 8px
  sm: 12px
  md: 16px
  lg: 24px
  xl: 32px
  gutter: 12px
  margin-mobile: 16px
  margin-desktop: 40px
---

## Brand & Style

This design system is engineered for high-velocity grocery and essential delivery. It balances the urgency of "delivery in minutes" with the warmth of a neighborhood local shop. The personality is energetic, dependable, and approachable.

The aesthetic follows a **Corporate Modern** foundation infused with **Soft Tactile** elements. We utilize warm, off-white surfaces to reduce eye strain during frequent use and implement generous corner radii to feel friendly and safe. 

The "AI Confidence Layer" introduces a subtle futuristic edge to the practical interface, using soft yellow radial gradients and delicate sparkle iconography to highlight intelligent recommendations, like "Customers also bought Himalaya Face Wash" or "Frequently paired with Minimalist Sunscreen."

## Colors

The palette is rooted in high-visibility yellow and a trust-building "Accent Green."

- **Primary (Yellow):** Used for key brand moments, call-to-action backgrounds, and delivery status indicators. It signifies speed and optimism.
- **Secondary (Green):** Specifically reserved for "In Stock" indicators, price savings, "Add to Cart" confirmations, and health-related category cues.
- **Ink Black:** Used for high-contrast typography and primary iconography to ensure legibility under various lighting conditions.
- **Warm Off-White:** The core background surface color (`#F8F7F2`). This creates a "paper-like" tactile quality that feels more natural than clinical white.
- **AI Confidence Layer:** A soft radial gradient starting from a 15% opacity yellow, used behind product cards that are algorithmically suggested based on peer-verified data.

## Typography

The typography strategy uses **Outfit** for its geometric, modern friendliness in headlines and **Inter** for its industrial-grade legibility in data-heavy product listings.

Headlines should always use tighter letter-spacing to emphasize the "Quick" nature of the brand. Use **Outfit Bold** for product categories and promotional banners. Use **Inter Regular** for product descriptions and **Inter SemiBold** for pricing and weight labels to ensure they stand out during rapid scrolling.

## Layout & Spacing

This design system utilizes a **Fluid Grid** with condensed gutters to maximize product density on mobile screens.

- **Mobile:** 2-column product grid with 12px gutters and 16px side margins. This allows users to see at least 4 items per scroll depth.
- **Desktop:** 6-column grid with 24px gutters.
- **Spacing Rhythm:** Based on a 4px scale. Use `md` (16px) for standard padding within cards and `sm` (12px) for vertical spacing between related text elements.

Avoid excessive whitespace in product listings; the intent is to simulate a well-stocked shelf.

## Elevation & Depth

We use **Tonal Layering** combined with **Ambient Shadows** to create a sense of organized hierarchy.

1.  **Base Layer:** The off-white surface (`#F8F7F2`).
2.  **Product Cards:** Pure white (`#FFFFFF`) with a very soft, diffused shadow (0px 4px 12px rgba(0,0,0,0.05)). This makes products "pop" from the warm background.
3.  **Floating Action Buttons (Cart):** High elevation (0px 8px 24px rgba(0,0,0,0.12)) to ensure the path to checkout is always visible above the scroll.
4.  **AI Layer:** No shadow, but uses the soft yellow glow to suggest the element is "illuminated" by data insights rather than physically lifted.

## Shapes

The shape language is extremely approachable and "bubbly." Following the 16-20px corner radii directive:

- **Product Cards:** Use a 20px radius to feel soft and high-end.
- **Action Buttons:** Use a 12px radius, creating a "squircle" look that is comfortable for thumb-tapping.
- **Search Bars:** Should be fully pill-shaped (rounded-xl) to distinguish the search utility from static content blocks.
- **Chips & Badges:** Use 8px radius for category chips and full pill-shapes for "Best Seller" or "Verified" badges.

## Components

### Buttons
- **Primary:** Ink Black background with White text for maximum contrast. 
- **Secondary (Add to Cart):** White background with Green border and Green text. On "active," fills with Green.
- **AI-Enhanced:** Primary Yellow with a subtle sparkle icon (✦) prefix.

### Product Cards
Cards must feature a high-quality product image on a white background, the brand name (e.g., "Himalaya") in `label-lg`, and the product name in `body-md`. The "Add" button is always positioned in the bottom-right.

### Input Fields
Search bars use the off-white background with a thin 1px border of `#E0E0E0`. Use a magnifying glass icon and "Search 'Milk'" as a placeholder to prompt action.

### AI Confidence Layer (The "Sparkle" Card)
For peer-verified suggestions, apply the `#F7D032` 15% radial gradient background. Include a small label: "✦ Peer-verified in your area."

### Chips & Tags
Use soft-tinted backgrounds (e.g., 10% green for "Fresh", 10% red for "Limited Stock") to keep the interface colorful but readable.