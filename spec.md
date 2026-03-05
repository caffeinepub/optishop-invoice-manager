# OptiShop Invoice Manager

## Current State
New project. No existing code.

## Requested Changes (Diff)

### Add
- **Order / Invoice creation form** with fields:
  - Customer Name
  - Mobile Number
  - Frame Number (stock lookup)
  - Frame Price
  - Lens Details: Left Eye (Sphere, Cylinder, Axis, Add) and Right Eye (Sphere, Cylinder, Axis, Add)
  - Lens Price
  - GST 5% (auto-calculated)
  - Grand Total (auto-calculated)
  - Invoice Number (auto-incremented)
- **Invoice print view**: printable formatted invoice page
- **Stock Database**: list of frames with quantity; auto-deduct on order
- **Sales Dashboard**:
  - Daily sales total
  - Monthly sales total
  - Profit tracking (revenue vs cost)
- **Invoice list**: searchable list of all saved invoices
- **Stock management page**: add/edit frames, set cost price and selling price, manage quantity

### Modify
- N/A (new project)

### Remove
- N/A (new project)

## Implementation Plan

### Backend (Motoko)
1. `Frame` type: id, frameNumber, name, brand, costPrice, sellingPrice, quantity
2. `LensDetail` type: sphere, cylinder, axis, add (for left and right eye)
3. `Invoice` type: id (auto-increment), invoiceNumber, customerName, mobileNumber, frameId, frameNumber, framePrice, leftEye, rightEye, lensPrice, gst, grandTotal, profit, createdAt
4. Functions:
   - `createInvoice(...)` -> auto-increment invoice number, deduct frame stock
   - `getInvoices()`, `getInvoiceById(id)`
   - `addFrame(...)`, `updateFrame(...)`, `getFrames()`, `deleteFrame(id)`
   - `getDailySales(date)` -> total sales for a day
   - `getMonthlySales(year, month)` -> total sales for a month
   - `getSalesSummary()` -> daily + monthly totals + profit

### Frontend
1. **New Order page** - form with all invoice fields, live GST + grand total calculation, submit saves invoice + deducts stock
2. **Invoice list page** - table of all invoices with search by name/number, print button per invoice
3. **Invoice print view** - formatted invoice modal/page for browser print
4. **Stock management page** - table of frames, add/edit/delete with quantity tracking
5. **Dashboard page** - cards showing today's sales, monthly sales, profit; charts for trends
6. **Navigation** - sidebar/tabs linking all pages
