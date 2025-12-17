# Payment Proof Upload - Diagnosis & Fix Summary

## Date: 2025-01-14

### Issues Found & Fixed

#### 1. ✅ Upload Button Functionality - FIXED
**Problem:** The upload button only opened a modal but didn't trigger file picker directly.

**Solution:** Modified the button to directly trigger a file input picker. When a file is selected, it automatically opens the confirmation modal with the file pre-selected.

**File Changed:** `src/app/client/[companySlug]/payments/page.tsx`
- Added `tableFileInputRef` for direct file picker access
- Updated button onClick handler to trigger file input
- File selection now automatically sets payment ID and opens modal

---

#### 2. ✅ RLS Policy Issue - FIXED
**Problem:** Clients could not update their own payments to add `payment_proof_url` because there was no RLS policy allowing clients to update their own payments.

**Existing Policies:**
- ✅ "Clients can view own payments" (SELECT only)
- ✅ "Company members can update payments" (UPDATE for company staff only)
- ❌ **Missing:** Policy for clients to update their own payments

**Solution:** Created new RLS policy:
```sql
CREATE POLICY "Clients can update own payment proof"
ON public.payments
FOR UPDATE
TO authenticated
USING (
  user_id = auth.uid() 
  AND EXISTS (
    SELECT 1 
    FROM clients 
    WHERE clients.user_id = auth.uid() 
      AND clients.company_id = payments.company_id 
      AND clients.status = 'active'
  )
)
WITH CHECK (
  user_id = auth.uid() 
  AND EXISTS (
    SELECT 1 
    FROM clients 
    WHERE clients.user_id = auth.uid() 
      AND clients.company_id = payments.company_id 
      AND clients.status = 'active'
  )
);
```

**Migration Applied:** `allow_clients_to_update_own_payment_proof`

---

### Verified Working Components

#### 1. ✅ Storage Bucket Configuration
- **Bucket Name:** `payment-proofs` (with hyphen)
- **Public:** Yes
- **File Size Limit:** 10MB (10,485,760 bytes)
- **Allowed MIME Types:** 
  - `image/jpeg`
  - `image/png`
  - `image/webp`
  - `image/gif`
  - `application/pdf`

#### 2. ✅ Storage Policies
Multiple policies exist for `payment-proofs` bucket:
- ✅ "Users can upload to payment-proofs" (INSERT for public role)
- ✅ "Clients can upload payment proofs" (INSERT for authenticated role)
- ✅ "Company users can view payment proofs" (SELECT)
- ✅ "Users can update own payment proofs" (UPDATE)
- ✅ "Users can delete own payment proofs" (DELETE)

#### 3. ✅ Database Column
- **Column:** `payment_proof_url` (text, nullable)
- **Table:** `public.payments`
- **Status:** ✅ Exists and properly configured

#### 4. ✅ Upload Functionality
Recent uploads confirmed working:
- Files are being uploaded to `payment-proofs` bucket
- File naming pattern: `payment_proof_{paymentId}_{timestamp}.{ext}`
- Files are accessible via public URLs

---

### Current RLS Policies on Payments Table

1. **"Clients can view own payments"** (SELECT)
   - Allows clients to view their own payments
   - Requires: user_id match + active client status

2. **"Company members can insert payments"** (INSERT)
   - Allows company staff to create payments
   - Requires: user has profile with matching company_id

3. **"Company members can update payments"** (UPDATE)
   - Allows company staff to update any payment in their company
   - Requires: user has profile with matching company_id

4. **"Company members can view payments"** (SELECT)
   - Allows company staff to view payments in their company
   - Requires: user has profile with matching company_id

5. **"Clients can update own payment proof"** (UPDATE) ⭐ NEW
   - Allows clients to update their own payments (for proof upload)
   - Requires: user_id match + active client status

---

### Security Advisors Findings

**Warnings (Non-Critical):**
- Some tables have policies allowing anonymous access (by design for public-facing features)
- Function search_path warnings (best practice recommendations)

**No Critical Security Issues Found** related to payment proof uploads.

---

### Testing Recommendations

1. **Test as Client User:**
   - ✅ Click "Upload" button → File picker should open immediately
   - ✅ Select file → Modal should open with file pre-selected
   - ✅ Click "Upload" → File should upload and payment should update
   - ✅ Verify `payment_proof_url` is set in database

2. **Test as Company Staff:**
   - ✅ Should still be able to update payments (existing functionality)
   - ✅ Should be able to view all payments in company

3. **Test Edge Cases:**
   - ✅ File size > 10MB should be rejected
   - ✅ Invalid file types should be rejected
   - ✅ Unauthenticated users should not be able to upload

---

### Files Modified

1. `src/app/client/[companySlug]/payments/page.tsx`
   - Added `tableFileInputRef` for direct file picker
   - Updated upload button to trigger file input directly

2. Database Migration: `allow_clients_to_update_own_payment_proof`
   - Added RLS policy for clients to update own payment proof

---

### Next Steps

1. ✅ Upload button now triggers file picker directly
2. ✅ RLS policy allows clients to update their own payments
3. ⏳ **Test the upload functionality** in the application
4. ⏳ Monitor for any upload errors in production

---

### Notes

- The storage bucket `payment-proofs` is public, so uploaded files are accessible via public URLs
- File size limit is 10MB per file
- Only image files (JPEG, PNG, WebP, GIF) and PDFs are allowed
- Uploaded files are stored with timestamp to prevent naming conflicts


