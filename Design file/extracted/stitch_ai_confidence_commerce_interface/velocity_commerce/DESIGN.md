---
name: Velocity Commerce
colors:
  surface: '#fbf9f8'
  surface-dim: '#dbdad9'
  surface-bright: '#fbf9f8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f5f3f3'
  surface-container: '#efeded'
  surface-container-high: '#e9e8e7'
  surface-container-highest: '#e4e2e2'
  on-surface: '#1b1c1c'
  on-surface-variant: '#4d4633'
  inverse-surface: '#303031'
  inverse-on-surface: '#f2f0f0'
  outline: '#7e7761'
  outline-variant: '#d0c6ad'
  surface-tint: '#715d00'
  primary: '#715d00'
  on-primary: '#ffffff'
  primary-container: '#f7d032'
  on-primary-container: '#6d5900'
  inverse-primary: '#e9c323'
  secondary: '#5e5e5e'
  on-secondary: '#ffffff'
  secondary-container: '#e2e2e2'
  on-secondary-container: '#646464'
  tertiary: '#006e23'
  on-tertiary: '#ffffff'
  tertiary-container: '#73ec7e'
  on-tertiary-container: '#006a22'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffe178'
  primary-fixed-dim: '#e9c323'
  on-primary-fixed: '#231b00'
  on-primary-fixed-variant: '#554500'
  secondary-fixed: '#e2e2e2'
  secondary-fixed-dim: '#c6c6c6'
  on-secondary-fixed: '#1b1b1b'
  on-secondary-fixed-variant: '#474747'
  tertiary-fixed: '#83fc8c'
  tertiary-fixed-dim: '#66df72'
  on-tertiary-fixed: '#002106'
  on-tertiary-fixed-variant: '#005318'
  background: '#fbf9f8'
  on-background: '#1b1c1c'
  surface-variant: '#e4e2e2'
typography:
  display-lg:
    fontFamily: Outfit
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Outfit
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Outfit
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  headline-md:
    fontFamily: Outfit
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
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
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 40px
  container-margin: 16px
  gutter: 12px
---

## Brand & Style
The design system is engineered for the fast-paced world of quick-commerce, where speed, reliability, and accessibility are paramount. The brand personality is high-energy, helpful, and ultra-efficient. The UI evokes a sense of "instant fulfillment" through high-contrast visuals and a streamlined aesthetic.

The design style is **Corporate Modern with a High-Contrast edge**. It leverages a bright, energetic primary color against deep, solid neutrals to ensure maximum legibility and brand recognition. The interface is clean and functional, prioritizing product imagery and clear calls to action over decorative elements. It balances the urgency of "10-minute delivery" with a premium, polished execution that builds user trust.

## Colors
The color palette is dominated by **Signature Yellow**, used strategically to highlight primary actions and brand presence. **Deep Charcoal/Black** provides the structural foundation and high-contrast typography, ensuring the interface feels grounded and professional.

- **Primary (Yellow):** Used for primary buttons, brand banners, and key highlights.
- **Secondary (Black):** Used for primary text, icons, and high-emphasis containers.
- **Tertiary (Green):** Representing freshness and "Go/Success," used for price savings, discounts, and order status tracking.
- **Neutral:** A scale of grays used for secondary text, borders, and background layering to maintain a clean hierarchy.

## Typography
The typography system uses a pairing of **Outfit** for headlines to provide a modern, geometric character, and **Inter** for body text to ensure maximum readability during quick browsing sessions.

- **Headlines:** Use Bold or SemiBold weights to create a strong visual anchor.
- **Body:** Inter is used for all functional text, product descriptions, and technical information.
- **Micro-copy:** Use `label-sm` for unit prices and delivery estimates to keep the interface uncluttered while providing essential data.

## Layout & Spacing
This design system utilizes a **4px base grid** to ensure precise alignment and a tight, energetic feel. The layout is primarily a **fluid grid** optimized for mobile-first consumption.

- **Mobile:** 4-column layout with 16px side margins. 
- **Desktop:** 12-column layout with a maximum container width of 1280px.
- **Spacing Logic:** Vertical rhythm is maintained through 8px (sm) and 16px (md) increments. Use tighter spacing (8px) between product images and their labels to create clear visual groups. Larger spacing (24px+) is reserved for separating distinct sections or categories.

## Elevation & Depth
Depth is handled through **Tonal Layers** rather than heavy shadows to maintain a clean, "flat" modern aesthetic.

- **Base Layer:** Pure white (#FFFFFF) for the main canvas.
- **Surface Layer:** Very light gray (#F2F2F2) for section backgrounds and card groupings.
- **Interactive Elevation:** Use subtle, low-opacity ambient shadows (0px 4px 12px rgba(0,0,0,0.05)) for floating elements like "Add to Cart" sticky bars or active modals.
- **Borders:** Use 1px solid strokes (#E0E0E0) for card definitions instead of shadows to keep the UI crisp.

## Shapes
The shape language is defined by **modern, approachable roundedness**. This softens the high-contrast color scheme, making the app feel friendly and easy to use.

- **Components:** Standard buttons and input fields utilize a 12px (`0.75rem`) corner radius.
- **Cards:** Product cards and promotional banners use `rounded-lg` (16px) to create a distinct containerized feel.
- **Micro-elements:** Tags, chips, and checkboxes use `rounded-sm` (4px) to maintain clarity at small scales.

## Components
- **Buttons:** Primary buttons are Solid Yellow with Black text. No gradients. Secondary buttons use a Black outline or subtle Gray fill. "Add" buttons in product listings should be prominent, often utilizing a ghost-style border that transforms into a solid state when an item is added.
- **Product Cards:** Must feature large, high-quality images on a white background. Pricing is bold, with the "Add" button always accessible in the bottom right quadrant.
- **Chips:** Used for categories and filters. Active chips are Black with White text; inactive chips are Light Gray.
- **Search Bar:** Elevated with a 12px radius, featuring a clear search icon and a placeholder that emphasizes speed (e.g., "Search 'milk'").
- **Cart Summary:** A sticky bottom component in Primary Yellow, providing immediate feedback on total price and delivery time.
- **Status Indicators:** Use the Tertiary Green for "In Stock" or "Express Delivery" labels to provide positive reinforcement.