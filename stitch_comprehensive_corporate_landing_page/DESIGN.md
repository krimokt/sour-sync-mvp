---
name: Industrial Precision
colors:
  surface: '#fcf9f8'
  surface-dim: '#dcd9d9'
  surface-bright: '#fcf9f8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3f2'
  surface-container: '#f0eded'
  surface-container-high: '#eae7e7'
  surface-container-highest: '#e5e2e1'
  on-surface: '#1c1b1b'
  on-surface-variant: '#444651'
  inverse-surface: '#313030'
  inverse-on-surface: '#f3f0ef'
  outline: '#747782'
  outline-variant: '#c4c6d2'
  surface-tint: '#3d5ca3'
  primary: '#002767'
  on-primary: '#ffffff'
  primary-container: '#1b3e84'
  on-primary-container: '#8eacf9'
  inverse-primary: '#b1c5ff'
  secondary: '#bc0005'
  on-secondary: '#ffffff'
  secondary-container: '#e3241a'
  on-secondary-container: '#fffbff'
  tertiary: '#002b58'
  on-tertiary: '#ffffff'
  tertiary-container: '#00417f'
  on-tertiary-container: '#7daffb'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dae2ff'
  primary-fixed-dim: '#b1c5ff'
  on-primary-fixed: '#001946'
  on-primary-fixed-variant: '#22448a'
  secondary-fixed: '#ffdad5'
  secondary-fixed-dim: '#ffb4a9'
  on-secondary-fixed: '#410000'
  on-secondary-fixed-variant: '#930003'
  tertiary-fixed: '#d5e3ff'
  tertiary-fixed-dim: '#a7c8ff'
  on-tertiary-fixed: '#001b3c'
  on-tertiary-fixed-variant: '#004689'
  background: '#fcf9f8'
  on-background: '#1c1b1b'
  surface-variant: '#e5e2e1'
  steel-gray: '#F4F7FA'
  iron-gray: '#4A4A4A'
  signal-red: '#E2231A'
  deep-navy: '#1B3E84'
typography:
  display-lg:
    fontFamily: IBM Plex Sans
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: IBM Plex Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
  headline-lg-mobile:
    fontFamily: IBM Plex Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
  headline-md:
    fontFamily: IBM Plex Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
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
  label-bold:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 8px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 64px
  max-width: 1280px
---

## Brand & Style

This design system is engineered for the heavy industrial manufacturing sector, specifically focusing on plumbing and valve technology. The brand personality is rooted in **Reliability, Engineering Excellence, and Structural Integrity**. It targets procurement officers, lead engineers, and facility managers who require confidence in product durability.

The design style is **Corporate / Modern** with a lean toward **High-Contrast / Bold** sections to mirror the strength of industrial materials. It utilizes high-fidelity photography of steel and brass components, structured alignment, and a no-nonsense approach to information hierarchy. The interface avoids unnecessary decorative flourishes, favoring functional clarity and a sense of "built to last."

## Colors

The palette is anchored by **Deep Navy (#1B3E84)**, signifying trust and institutional stability. **Signal Red (#E2231A)** is used strategically for high-impact calls to action, critical status indicators, and to highlight technical precision. 

- **Primary (Navy):** Used for headers, primary buttons, and navigational backgrounds.
- **Secondary (Red):** Reserved for emphasis, key conversion points, and manufacturing highlights.
- **Tertiary (Bright Blue):** Used for interactive elements or secondary data visualizations.
- **Neutral:** A range of grays from off-white surfaces to deep charcoal text ensures legibility and a clean, laboratory-grade aesthetic.

## Typography

The typography system balances the technical nature of engineering with modern accessibility. 

- **Headlines:** Use **IBM Plex Sans** for its engineered, slightly technical feel. Bold weights are preferred for product names and section titles to project authority.
- **Body Text:** **Inter** provides maximum legibility for technical specifications and long-form manuals. 
- **Data & Labels:** **JetBrains Mono** is utilized for part numbers, measurements, and technical specifications, providing a monospaced "spec-sheet" look that resonates with engineering professionals.

## Layout & Spacing

This design system employs a **Fixed Grid** model for desktop to ensure product catalogs and technical data maintain a controlled, professional structure. 

- **Grid:** A 12-column grid with a 24px gutter. 
- **Rhythm:** An 8px base unit drives all padding and margin decisions. 
- **Responsive Behavior:** On mobile, margins shrink to 16px and the grid collapses to a single column. Information-heavy tables should allow horizontal scrolling with fixed first columns to maintain context for technical specs.
- **Sections:** Use high-contrast alternating backgrounds (White to Steel Gray to Deep Navy) to define distinct content areas.

## Elevation & Depth

Visual hierarchy is achieved through **Tonal Layers** and **Low-Contrast Outlines** rather than heavy shadows, maintaining a flat, "blueprint" aesthetic.

- **Surfaces:** Main content resides on White (#FFFFFF) surfaces. Secondary information sits on Steel Gray (#F4F7FA) containers.
- **Outlines:** Use 1px borders in a light gray (#D1D5DB) for cards and input fields.
- **Active States:** Subtle, crisp shadows (e.g., 0px 4px 8px rgba(0,0,0,0.1)) are used only for interactive elements like hover states on product cards to suggest clickability without breaking the industrial feel.

## Shapes

Shape language is **Soft (0.25rem)**, providing just enough refinement to feel modern while maintaining the rigid, rectangular feel of industrial equipment. 

- **Buttons & Inputs:** Use the base 4px (0.25rem) radius.
- **Large Containers:** Cards and large modal containers use 8px (0.5rem) to differentiate them from the core UI.
- **Icons:** Use thick-stroke (2px), geometric icons. Avoid rounded terminals; prefer butt or square caps to reinforce the "hard" manufacturing theme.

## Components

- **Buttons:** Primary buttons are Deep Navy with white text. Critical actions (Request Quote, Emergency Contact) use Signal Red. All buttons use uppercase labels in Bold weight.
- **Input Fields:** Rectangular with 1px borders. Focused states utilize a 2px Navy border. 
- **Product Cards:** Clean white backgrounds with a subtle gray border. Product images should be high-resolution "hero" shots with background removal.
- **Technical Tables:** Use alternating row stripes (Zebra striping) in Steel Gray. Header rows are Deep Navy with White text.
- **Chips/Status:** For "In Stock" or "Certified" tags, use small, rectangular badges with high-contrast backgrounds and bold JetBrains Mono text.
- **Icons:** Industrial-specific iconography (valves, pipes, pressure gauges) must be used consistently across the site to aid in rapid navigation of product categories.