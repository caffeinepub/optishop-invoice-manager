# Specssify Infusion Invoice Manager

## Current State
- App branded as "OptiShop Invoice Manager" throughout the UI, header, invoice print, and footer
- Four pages: Dashboard, New Order, Invoices, Stock
- Invoices can be created, viewed, printed, and deleted — but NOT edited
- Backend stores invoices via `createInvoice` and `deleteInvoice`; no update endpoint exists for invoices

## Requested Changes (Diff)

### Add
- Invoice edit functionality: clicking an existing invoice opens an editable form pre-filled with all fields (customer name, mobile, frame number, frame price, lens price, left/right eye prescriptions), allowing the user to save updated data
- "Edit" button in the invoice row actions alongside Print and Delete

### Modify
- App header: rename "OptiShop" → "Specssify Infusion" with subtitle "PVT. LTD"
- InvoicePrint.tsx: update print header shop name from "OptiShop" to "Specssify Infusion PVT. LTD"
- Footer: update copyright text to reference "Specssify Infusion PVT. LTD"
- Nav brand: update logo text

### Remove
- Nothing removed

## Implementation Plan
1. Update App.tsx: change brand text "OptiShop" → "Specssify Infusion", subtitle → "PVT. LTD"
2. Update footer in App.tsx to reference new shop name
3. Update InvoicePrint.tsx: change all "OptiShop" references to "Specssify Infusion PVT. LTD"
4. Backend: The existing backend has no `updateInvoice` endpoint. Implement edit by: delete old invoice + create new invoice with same ID (workaround using existing API), or add a frontend-only edit flow that calls deleteInvoice + createInvoice
5. Add Edit button to invoice row in Invoices.tsx
6. Add EditInvoiceSheet/Dialog component with pre-filled form fields
7. Wire edit save flow through existing backend hooks
