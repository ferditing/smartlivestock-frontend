# Smart Livestock – Marketplace & Agrovet Enhancements

This document describes the enhancements made to the agrovet dashboard, product catalog, and farmer marketplace without disrupting existing functionality.

---

## 1. Agrovet Dashboard (Professional)

### Changes
- **Add Product removed** from the dashboard. Adding and editing products is now done only from **Product Catalog** (`/agrovet/products`).
- **Shop identity & location** remain at the top (shop name, county, sub-county from profile).
- **Quick links** in the header: “Manage Products” and “Orders & Receipts” for fast navigation.
- **Low stock alert**: if any product has quantity under 5 or is out of stock, a banner appears with a link to update stock in Product Catalog.
- **Recent orders**: last 5 orders with id, date, and status, plus “View all” to Orders page.
- **Quick actions** card: links to Add/Edit products, Orders & receipts, and Business profile.
- **Charts** unchanged: revenue (last 6 months) and orders by status (pie chart).

### Result
- Single place for analytics and overview; product management is centralized in Product Catalog.

---

## 2. Product Catalog – Add Product Here

### Changes
- When the viewer is the **owner** (agrovet), an **“Add new product”** card is shown at the top.
- The same card is used to **edit** a product when “Edit” is clicked on a row (form switches to “Editing: {name}” with Cancel).
- If the owner has **no products yet**, the list section shows “No products yet. Add one above.”
- Non-owners (e.g. farmers viewing a provider) still see only the product list; no add form.

### Result
- All product create/edit/delete actions live in Product Catalog; dashboard stays focused on metrics and actions.

---

## 3. Marketplace – Browse by Shop & “Near You”

### Backend
- **GET `/api/agro/shops`**  
  - Returns all agrovet “shops” (provider + user profile).  
  - Each item: `id`, `shopName`, `county`, `subCounty`, `productCount`.  
  - Query: `?search=...` to filter by shop name or location (county/sub county).

### Farmer flow
1. **Default view: Shops**
   - List of agrovet shops with:
     - Shop name  
     - Location (county, sub county)  
     - Product count  
     - **“Near you”** badge when the shop’s county matches the farmer’s profile county  
   - **Search**: by shop name or location (backend filters by `search`).
   - **“Near me” filter**: optional checkbox to show only shops in the farmer’s county (uses profile county).
2. **Choose a shop**
   - Clicking a shop opens **products from that shop only** (same page, products view with `provider_id`).
   - Header shows “Shopping at {shopName}”.
   - **“Back to shops”** returns to the shop list.
3. **Browse all products**
   - Link: “Browse all products” shows the full product grid without selecting a shop (no `provider_id`).
4. **Cart & checkout**
   - Unchanged: add to cart, open cart sidebar, enter phone, complete order. Cart can include items from multiple shops.

### “Near you” logic
- Farmer’s county comes from **Profile** (`/profile/me`: `county` or `profile_meta.county`).
- A shop is “Near you” if `shop.county` matches the farmer’s county (case-insensitive).
- If the farmer has not set a county, no “Near me” filter or “Near you” badges are shown.

### Result
- Farmers can find agrovets by name or location and choose to shop from one place or browse everything; “Near you” encourages local shopping.

---

## 4. API Summary

| API | Purpose |
|-----|--------|
| `GET /api/agro/shops?search=` | List agrovet shops (name, county, subCounty, productCount) for marketplace. |
| `GET /api/agro/products?provider_id=&search=&page=&limit=` | List products; `provider_id` limits to one shop. |
| `GET /profile/me` | Farmer (and others) profile; used for county for “Near me”. |

---

## 5. Files Touched

### Backend
- `src/agro/shops.routes.ts` – new; GET shops for marketplace.
- `src/server.ts` – mount `/api/agro/shops`.

### Frontend
- `src/dashboard/agro/AgroDashboard.tsx` – Add Product removed; low stock alert, recent orders, quick links, quick actions.
- `src/dashboard/agro/ProductCatalog.tsx` – “Add new product” card for owner; edit in same card; empty state when no products.
- `src/dashboard/farmer/Marketplace.tsx` – Shops list (search, “Near me”), then shop products or all products; cart/checkout unchanged.
- `src/api/agro.api.ts` – `getAgrovetShops()`, `AgrovetShop` type.
- `src/api/marketplace.api.ts` – `getMarketplaceProducts()` params extended with `provider_id`.

---

## 6. Behaviour Preserved

- Cart and checkout logic unchanged.
- Order placement and order history unchanged.
- Agrovet orders, status updates, and receipts unchanged.
- Product CRUD (create/update/delete) still only for agrovet owner; now only from Product Catalog.
- Farmer profile and agrovet profile behaviour unchanged; county is used only for “Near me” and “Near you” in the marketplace.

---

## 7. Optional Next Steps

- **Map for shops**: re-use or adapt `NearbyServicesMap` (or similar) on Marketplace to show agrovet locations when farmer allows location.
- **Strict “one shop per cart”**: optionally restrict cart to a single provider and show a message when mixing shops.
- **Distance**: if backend adds lat/lng for farmers and shops, “Near you” could be based on distance instead of county.
