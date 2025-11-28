<!-- e2bb0a33-2c8d-4d7b-bf06-9d3193b265ce b724dde1-478e-4e06-b86d-3ad0b7092030 -->
# SourSync Logistics Platform Expansion Plan

## Overview

This plan outlines the transformation of the website builder into a full-featured logistics platform with multi-tenant client portals, advanced theming, and a multi-page CMS.

## 1. Database & Architecture (Foundation)

### New Tables & Updates

- **`website_pages`**: To support multiple pages per company.
- `id` (UUID), `company_id` (UUID), `slug` (text), `title` (text), `content` (JSONB), `type` (standard/custom), `is_published` (bool).
- **`clients` / `company_users`**: explicit link between users and companies.
- `user_id` (UUID), `company_id` (UUID), `role` (client/staff/admin), `status` (active/invited).
- **`quotations` & `shipments`**: Ensure these tables support RLS for client access.

### Authentication Flow

- **Client Signup**: Modify auth flow to capture `companySlug` from the URL.
- **Role-Based Access**: Middleware to enforce `client` vs `admin` access to `/portal` vs `/store` routes.

## 2. Client Portal System

### Routes

- `[companySlug].soursync.com/login`: Dedicated login page for clients.
- `[companySlug].soursync.com/portal`: Client dashboard.

### Features

- **Dashboard**: Overview of recent quotes and shipments.
- **Product Catalog**: Browse products (read-only view of what admin added).
- **Quotation Request**: Form to request quotes for specific products or general sourcing.
- **Order Tracking**: Timeline view of shipment status.
- **Documents**: Download invoices and packing lists.

## 3. Website Builder Expansion (CMS)

### Page Management

- **Sidebar**: Add "Pages" tab to the builder sidebar.
- **Actions**: Add, Edit, Delete pages.
- **System Pages**: Auto-generate "Contact", "Terms", "Privacy" with fixed slugs but editable content.

### Header & Footer Engine

- **Templates**: Implement the 4 requested header styles (Minimal, Split, Centered, Logistics).
- **Configuration**: Add global settings for Header/Footer in the builder.

## 4. Logistics Theme System

### New Section Components

- **`HeroLogistics`**: Trust-focused hero with tracking lookup or "Request Quote" CTA.
- **`ServicesGrid`**: specialized grid for Sourcing, QC, Shipping.
- **`ShipmentTimeline`**: Visual step-by-step process component.
- **`PricingTable`**: Comparison table for different service levels.
- **`WarehouseGallery`**: Image grid optimized for facility showcasing.
- **`QuoteForm`**: Complex form builder for detailed sourcing requests.

### Theme Settings

- **Presets**: "Trust Blue", "Logistics Orange", "Eco Green".
- **Typography**: Professional font pairings (Inter, Roboto, Lato).
- **UI Elements**: Control border radius, shadow depth, and spacing globally.

## 5. Implementation Steps

1.  **Database**: Create `website_pages` table and update RLS policies.
2.  **Backend**: Implement `getCompanyPages` and page saving logic.
3.  **Builder UI**: Update `ShopifyBuilder` to support page switching and creation.
4.  **Frontend**: Create new Logistics Section components.
5.  **Client Portal**: Build the `/portal` route and client-specific views.
6.  **Auth**: Update middleware and signup/login pages for client context.

### To-dos

- [ ] Create products and categories tables with RLS policies
- [ ] Add multi-tenant RLS policies for all tables
- [ ] Create StoreContext provider for company data
- [ ] Create /store/[companySlug]/layout.tsx with auth + company loading
- [ ] Build sign up page with company creation flow
- [ ] Build sign in page with company redirect
- [ ] Update AuthContext to support company-based auth
- [ ] Update middleware to protect /store/* routes
- [ ] Move existing dashboard pages to /store/[companySlug]/
- [ ] Build admin products page with list, create, edit views
- [ ] Create image upload component with Supabase Storage
- [ ] Update middleware to handle subdomain routing
- [ ] Create public website template (Home + Products pages)
- [ ] Create products and categories tables with RLS policies
- [ ] Add multi-tenant RLS policies for all tables
- [ ] Create StoreContext provider for company data
- [ ] Create /store/[companySlug]/layout.tsx with auth + company loading
- [ ] Build sign up page with company creation flow
- [ ] Build sign in page with company redirect
- [ ] Update AuthContext to support company-based auth
- [ ] Update middleware to protect /store/* routes
- [ ] Move existing dashboard pages to /store/[companySlug]/
- [ ] Create products and categories tables with RLS policies
- [ ] Add multi-tenant RLS policies for all tables
- [ ] Create StoreContext provider for company data
- [ ] Create /store/[companySlug]/layout.tsx with auth + company loading
- [ ] Build sign up page with company creation flow
- [ ] Build sign in page with company redirect
- [ ] Update AuthContext to support company-based auth
- [ ] Update middleware to protect /store/* routes
- [ ] Move existing dashboard pages to /store/[companySlug]/
- [ ] Create products and categories tables with RLS policies
- [ ] Add multi-tenant RLS policies for all tables
- [ ] Create StoreContext provider for company data
- [ ] Create /store/[companySlug]/layout.tsx with auth + company loading
- [ ] Build sign up page with company creation flow
- [ ] Build sign in page with company redirect
- [ ] Update AuthContext to support company-based auth
- [ ] Update middleware to protect /store/* routes
- [ ] Move existing dashboard pages to /store/[companySlug]/
- [ ] Build admin products page with list, create, edit views
- [ ] Create image upload component with Supabase Storage
- [ ] Update middleware to handle subdomain routing
- [ ] Create public website template (Home + Products pages)
- [ ] Create products and categories tables with RLS policies
- [ ] Add multi-tenant RLS policies for all tables
- [ ] Create StoreContext provider for company data
- [ ] Create /store/[companySlug]/layout.tsx with auth + company loading
- [ ] Build sign up page with company creation flow
- [ ] Build sign in page with company redirect
- [ ] Update AuthContext to support company-based auth
- [ ] Update middleware to protect /store/* routes
- [ ] Move existing dashboard pages to /store/[companySlug]/
- [ ] Create products and categories tables with RLS policies
- [ ] Add multi-tenant RLS policies for all tables
- [ ] Create StoreContext provider for company data
- [ ] Create /store/[companySlug]/layout.tsx with auth + company loading
- [ ] Build sign up page with company creation flow
- [ ] Build sign in page with company redirect
- [ ] Update AuthContext to support company-based auth
- [ ] Update middleware to protect /store/* routes
- [ ] Move existing dashboard pages to /store/[companySlug]/