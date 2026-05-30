# Orika-Living Storefront — Supabase → hub-system Migration

This covers the **storefront repo** (`swizfcodes/Orika-Living`) only.
The backend (`hub-system`) work is done separately.

---

## 1. Files to ADD / REPLACE (9 files — in `storefront/` here)

Drop these into the Orika-Living repo at the matching paths:

| File | Action |
|------|--------|
| `lib/api/client.ts` | **NEW** — the HTTP client for the hub API |
| `lib/products/server.ts` | replace |
| `lib/scents/server.ts` | replace |
| `lib/signatures/server.ts` | replace |
| `lib/checkout/actions.ts` | replace |
| `lib/newsletter/actions.ts` | replace |
| `lib/enquiries/actions.ts` | replace |
| `app/api/paystack/verify/route.ts` | replace |
| `app/(store)/orders/[id]/page.tsx` | replace |

---

## 2. Files to DELETE

Because the **storefront admin was discarded** (all storefront
management now happens in the ERP), the entire admin surface goes.

### Supabase plumbing (no longer used)
```
lib/supabase/admin.ts
lib/supabase/client.ts
lib/supabase/public.ts
lib/supabase/server.ts
lib/ratelimit.ts                 (rate limiting moved to the backend)
```

### Storefront admin — entire surface removed
```
lib/admin/auth.ts
lib/admin/orders.ts
lib/admin/products.ts
lib/admin/scents.ts
lib/admin/signatures.ts
lib/admin/enquiries.ts
lib/admin/uploads.ts
lib/auth/actions.ts              (storefront admin login)
app/(admin)/                     (the ENTIRE admin route tree)
app/api/auth/callback/route.ts   (Supabase OAuth callback)
```

### Paystack — fulfilment moved to the backend
```
lib/paystack/fulfil.ts           (the backend now fulfils orders)
app/api/paystack/webhook/route.ts (the backend receives the webhook)
```
Keep `lib/paystack/verify.ts` ONLY if something else imports it;
the new `verify/route.ts` no longer needs it.

### Supabase folder + migrations
```
supabase/                        (entire folder)
```

---

## 3. Remove Supabase packages

After the deletions above, nothing imports Supabase. Remove it:
```bash
npm uninstall @supabase/ssr @supabase/supabase-js
```

---

## 4. Environment variables

**.env.local (development):**
```env
NEXT_PUBLIC_API_URL=http://localhost:7000/api
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_xxx
```

**.env.production (VPS):**
```env
NEXT_PUBLIC_API_URL=https://app.orikaliving.com/api
NEXT_PUBLIC_SITE_URL=https://orikaliving.com
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_live_xxx
```

Remove every `NEXT_PUBLIC_SUPABASE_*` and `SUPABASE_SERVICE_ROLE_KEY`
variable.

---

## 5. next.config — image domains

The storefront product `images` array now holds URLs served by the
hub's storage layer, not Supabase storage. In `next.config.ts`,
remove the Supabase image domain and add wherever the hub serves
product images from (the `STORAGE_DRIVER` target — local disk on the
VPS, or S3).

---

## 6. What changed in behaviour

- **Reads** (products, scents, signatures) — now `GET` the hub API.
  `unstable_cache` and the static-defaults fallback are kept, so the
  storefront still renders if the API is briefly unreachable.
- **Checkout** — `POST /api/store/orders`. The hub re-derives every
  price from the ERP; the client total is never trusted.
- **Payment** — the hub verifies with Paystack AND fulfils:
  it marks the order paid, decrements ERP stock, and posts the
  revenue + COGS journals. The storefront's verify route is now a
  thin proxy; the webhook is handled entirely backend-side.
- **Newsletter / enquiries** — `POST` to the hub. Rate limiting and
  all emails (welcome, confirmation, admin notification) are now
  backend responsibilities.
- **Admin** — gone from the storefront entirely. Managed in the ERP.

---

## 7. Smoke test before deploy

With the hub running locally on :7000 and the storefront on :3000:

1. Home page renders products → hub `/store/products` is being hit
2. A product page loads → `/store/products/:slug`
3. Add to cart → checkout → `POST /store/orders` returns a reference
4. Complete a Paystack **test** payment → the success page shows
   confirmed
5. In the ERP, confirm: the order's stock was decremented and a
   revenue journal + COGS journal were posted for it

Step 5 is the one that proves "balances with the ERP" — do not skip
it.