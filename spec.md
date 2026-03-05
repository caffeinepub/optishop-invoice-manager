# OptiShop Invoice Manager

## Current State
Full-stack optical shop invoice management app with:
- Dashboard showing sales summary (today/monthly totals and profit)
- New Order form with customer info, frame lookup, prescription (left/right eye), GST 5% auto-calculation, auto-incrementing invoice numbers
- Invoices list with search and print
- Stock management with frame CRUD and auto-deduction on sale
- Internet Identity login (optional, required for mutations)
- Authorization using role-based access control (admin/user/guest)

**Root cause of "Failed to create invoice" error:**
The backend's `getUserRole` function in `access-control.mo` calls `Runtime.trap("User is not registered")` when an authenticated principal has not yet called `_initializeAccessControlWithSecret`. This causes ALL backend calls to fail for freshly-logged-in users until initialization completes. Additionally there is a race condition: `getAllInvoices` is fetched immediately after actor creation, but initialization may not be complete yet.

## Requested Changes (Diff)

### Add
- Auto-registration: any non-anonymous caller who is not yet in the role map should automatically be assigned `#user` role (no trap, no initialization required)

### Modify
- `access-control.mo`: change `getUserRole` to auto-register authenticated-but-unknown callers as `#user` instead of trapping
- Keep `_initializeAccessControlWithSecret` for admin promotion (first caller with correct token becomes admin)
- Read-only endpoints (getAllInvoices, getAllFrames, getSalesSummary) should work for any authenticated user without needing prior initialization
- `createInvoice` should succeed for any logged-in user without requiring prior `_initializeAccessControlWithSecret` call

### Remove
- Nothing removed

## Implementation Plan
1. Regenerate backend with auto-registration logic: in `getUserRole`, when caller is authenticated but not in role map, add them as `#user` and return `#user` (no trap)
2. Keep all existing data models: Frame, EyePrescription, Invoice, UserProfile
3. Keep all existing endpoints unchanged
4. Keep authorization module intact -- admin assignment still works via `_initializeAccessControlWithSecret`
5. No frontend changes needed once backend is fixed
