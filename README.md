# Maison Sillage

Luxury perfume storefront with direct cash-on-delivery ordering and a protected administrator dashboard. Orders are priced by a database trigger, saved before the customer sees success, then delivered to the admin Orders desk through database realtime.

## Project map

- `src/pages/Index.tsx` — storefront, collection, offer, story, and checkout
- `src/pages/ProductPage.tsx` — perfume notes, volumes, purchase actions
- `src/pages/AdminPage.tsx` — admin sign-in, analytics, live orders, catalog tools
- `src/contexts/CartContext.tsx` — locally remembered cart
- `src/lib/chantan-db.ts` — configured database client (platform-managed; do not edit)
- `public/assets/` — Maison Sillage photography

## Data and order flow

1. The visitor chooses perfumes, volumes, and quantities. The browser submits only product IDs, volumes, and quantities with the customer's name, phone, city, and address.
2. The database checks stock and prices against the saved product catalog, normalizes the items, and calculates the total in a before-insert trigger. The browser cannot set the order total or status.
3. The storefront displays success only after the database confirms the insert. If saving fails, it keeps the cart and shows a retry message.
4. The `orders` table is included in the realtime publication. The signed-in admin dashboard listens for new orders and renders them as soon as the database broadcasts them.
5. Status changes use an authenticated, role-checked database function. Product edits are protected to administrators by the database access rules.

## Setup and local run

This project uses its connected Chantan database; credentials and database connectivity are managed by the project. Do not put database keys in browser code or commit secrets.

1. Open the project in Chantan and confirm the database is active.
2. Install dependencies with `npm install`.
3. Start locally with `npm run dev` and open the local address printed in the terminal.
4. Publish from the Chantan **Publish** window to create the public storefront address.
5. For a separate local deployment, configure the same Supabase-compatible project URL and public client key through the platform's supported environment setup, then build with `npm run build` and host the generated `dist` output on a static web host. Never expose service-role credentials in the frontend.

## Store launch checklist

- Replace the contact placeholders with the store's real phone, email, and WhatsApp destination.
- Confirm currency, delivery coverage, delivery fees, and address format for the sales market.
- Confirm the Discovery Edit's dates, eligibility, and final promotion pricing before publishing it.
- Review the illustrative USD prices and stock counts in the catalog.
- Add your own privacy, delivery, and returns policy destinations.
