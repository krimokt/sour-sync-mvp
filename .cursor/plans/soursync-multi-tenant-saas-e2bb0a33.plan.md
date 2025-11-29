<!-- e2bb0a33-2c8d-4d7b-bf06-9d3193b265ce 59d9e5a1-b8eb-4f28-8a33-031982496170 -->
# Enhance Login UI with Soursync Branding & Polish

## Overview

Transform the login page into a branded, high-quality experience. We will replace the generic "Animated Login" text with the **Soursync logo**, use the brand's **Cyan & Blue** color palette, and introduce a mix of **Logistics** and **Tech** icons to represent the business. The UI will be elevated with **glassmorphism** effects and refined typography.

## Steps

1.  **Update Component Architecture** (`src/components/ui/modern-animated-sign-in.tsx`)

    -   **Center Content**: Update `TechOrbitDisplay` to accept a `centerContent` prop (for the logo).
    -   **Theming**: Update `Ripple` and `OrbitingCircles` to accept brand colors (`#06b6d4`, `#0f7aff`).
    -   **Styling**: Add support for glassmorphism styles in `AnimatedForm`.

2.  **Implement Branding & UI Polish** (`src/components/auth/AnimatedSignInForm.tsx`)

    -   **Assets**: Import the Soursync logo (`/images/logo/soursync-logo.svg`).
    -   **Iconography**: Create a curated `iconsArray` with:
        -   *Logistics*: `Truck`, `Plane`, `Globe`, `Package` (representing sourcing/logistics).
        -   *Tech*: `React`, `Next.js` (representing the dashboard builder).
    -   **Visuals**: Apply brand colors to the orbit and ripple animations.
    -   **Glassmorphism**: Wrap the form in a glass-effect container (`backdrop-blur`, `bg-white/10`, `border-white/20`).

### To-dos

- [ ] Create database migrations for store_users, products, orders, carts, bank_accounts tables
- [ ] Update TechOrbitDisplay to support custom center content
- [ ] Implement Soursync logo and industry icons in AnimatedSignInForm