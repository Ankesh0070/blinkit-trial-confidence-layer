---
name: Swiftly Premium
colors:
  surface: '#f9f9f9'
  surface-dim: '#dadada'
  surface-bright: '#f9f9f9'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f3f3'
  surface-container: '#eeeeee'
  surface-container-high: '#e8e8e8'
  surface-container-highest: '#e2e2e2'
  on-surface: '#1a1c1c'
  on-surface-variant: '#464555'
  inverse-surface: '#2f3131'
  inverse-on-surface: '#f0f1f1'
  outline: '#777587'
  outline-variant: '#c7c4d8'
  surface-tint: '#4d44e3'
  primary: '#3525cd'
  on-primary: '#ffffff'
  primary-container: '#4f46e5'
  on-primary-container: '#dad7ff'
  inverse-primary: '#c3c0ff'
  secondary: '#006b5f'
  on-secondary: '#ffffff'
  secondary-container: '#6df5e1'
  on-secondary-container: '#006f64'
  tertiary: '#950029'
  on-tertiary: '#ffffff'
  tertiary-container: '#c20038'
  on-tertiary-container: '#ffd0d2'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e2dfff'
  primary-fixed-dim: '#c3c0ff'
  on-primary-fixed: '#0f0069'
  on-primary-fixed-variant: '#3323cc'
  secondary-fixed: '#71f8e4'
  secondary-fixed-dim: '#4fdbc8'
  on-secondary-fixed: '#00201c'
  on-secondary-fixed-variant: '#005048'
  tertiary-fixed: '#ffdada'
  tertiary-fixed-dim: '#ffb3b6'
  on-tertiary-fixed: '#40000c'
  on-tertiary-fixed-variant: '#920028'
  background: '#f9f9f9'
  on-background: '#1a1c1c'
  surface-variant: '#e2e2e2'
typography:
  headline-xl:
    fontFamily: Outfit
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Outfit
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Outfit
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-md:
    fontFamily: Outfit
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
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
  base: 4px
  container-margin: 20px
  gutter: 16px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 32px
---

## Brand & Style
The design system is engineered to evoke a sense of "Effortless Luxury." It targets a high-discretionary-income demographic that values speed without sacrificing aesthetic quality. The style is **Sleek Modernism** infused with **Glassmorphism**, prioritizing clarity and premium tactile feedback.

The interface should feel airy, trustworthy, and vibrant. Key brand attributes include:
- **Precision:** Perfect alignment and generous white space.
- **Luminosity:** Use of soft glows, glass overlays, and subtle gradients to suggest a high-tech, AI-driven backend.
- **Vibrancy:** High-chroma category accents against a pristine, neutral foundation.

## Colors
The palette is rooted in **Deep Indigo**, a color that signals institutional trust and technological sophistication. This is contrasted by a "Vibrant Functional" system where color is used semantically to categorize products:

- **Surface Strategy:** The primary background is a cool off-white (`#FAFAFA`). Content lives on pure white (`#FFFFFF`) cards to create a "layered" effect.
- **Category Accents:** Electronics (Teal), Beauty (Rose), Home (Sky), Pet Care (Amber), and Baby (Lavender) serve as the primary visual identifiers for navigation and tagging.
- **Admin Theme:** The internal dashboard flips the hierarchy to a **Deep Slate** dark mode, utilizing the category colors as neon-glow accents for data visualization and status indicators.

## Typography
This design system utilizes a dual-font strategy. **Outfit** is used for headlines to provide a modern, geometric, and friendly character. **Inter** is used for body copy and UI labels due to its exceptional legibility and systematic performance at small sizes.

- **Scale:** Use tight tracking on larger headlines to emphasize the "Premium" feel. 
- **Hierarchy:** Use font-weight variants rather than color shifts to maintain high accessibility.
- **Mobile Optimization:** Large display titles should scale down by ~25% on mobile devices to prevent excessive line breaks.

## Layout & Spacing
The layout relies on a **Fluid-Fixed Hybrid** model. Mobile layouts use a standard 4-column grid with 20px side margins. Desktop views utilize a 12-column grid capped at a 1440px max-width.

- **The 8pt System:** All margins and paddings are multiples of 4px, with 8px and 16px being the primary increments for internal component spacing.
- **Safe Zones:** High-priority buttons (e.g., "Add to Cart") must maintain a minimum 48px touch target height.
- **Reflow:** On tablet, horizontal product carousels transition into multi-line grids to maximize product density.

## Elevation & Depth
Depth is created through **Glassmorphism** and **Ambient Shadows**. This design system avoids harsh borders in favor of depth-based separation.

- **Glass Effects:** Floating navigation bars and modals use a `backdrop-blur(12px)` with a `rgba(255, 255, 255, 0.7)` background and a subtle `1px` inner white border to catch the light.
- **Shadows:** Use large-radius, low-opacity shadows (e.g., `box-shadow: 0 10px 30px rgba(0, 0, 0, 0.04)`).
- **AI Tiers:** AI-driven components use a subtle indigo-tinted shadow to differentiate them from standard elements.

## Shapes
The shape language is "Hyper-Rounded." This softness offsets the technical nature of the app, making it feel approachable.

- **Primary Cards:** Use `rounded-3xl` (32px) to create a soft, tablet-like container feel.
- **Buttons & Inputs:** Use `rounded-2xl` (24px) for a modern, tactile aesthetic.
- **Icon Enclosures:** Small chips and icons should use circular (pill) shapes to maintain consistency with the rounded theme.

## Components
- **Buttons:** Primary buttons use a solid Indigo fill. Secondary buttons use the glassmorphic style (blur + thin border). All hover states include a subtle vertical lift effect.
- **AI Trust Badges:** These are signature components. They feature a soft gradient (Indigo to Teal), a `spark` icon, and a subtle external glow (`drop-shadow`).
- **Product Cards:** Pure white backgrounds, `rounded-3xl` corners, and a very light `1px` border (`#F1F5F9`). Images should have a subtle zoom on hover.
- **Chips/Categories:** Pill-shaped with high-vibrancy HSL backgrounds at 10% opacity, using the solid color for the text label.
- **Input Fields:** Large `rounded-2xl` containers with a light grey background (`#F1F5F9`) that transitions to a white background with an Indigo border on focus.
- **Admin Dashboard (Dark):** In the dark mode dashboard, cards use a semi-transparent slate (`rgba(30, 41, 59, 0.5)`) with vibrant neon borders corresponding to the category colors.