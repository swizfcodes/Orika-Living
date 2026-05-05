-- Customer summary view: aggregates orders by email so the admin customers
-- page can paginate without corrupting lifetime totals.
-- ─────────────────────────────────────────────────────────────────────────────
-- Most checkouts are guest orders, so the "customer" identity is derived
-- from delivery_address.email rather than a customers table row. For each
-- unique email we take the most recent order's name + phone (since users
-- sometimes correct typos on later orders), and sum totals across orders.
--
-- security_invoker = true makes the view respect the calling user's RLS on
-- public.orders, so admin-only access is preserved without separate policies.

create or replace view public.customer_summary
  with (security_invoker = true) as
select
  lower(delivery_address->>'email')                                  as email,
  (array_agg(delivery_address->>'full_name'
             order by created_at desc))[1]                           as full_name,
  (array_agg(delivery_address->>'phone'
             order by created_at desc))[1]                           as phone,
  count(*)::int                                                      as order_count,
  sum(total_kobo)::bigint                                            as lifetime_kobo,
  max(created_at)                                                    as last_order_at
from public.orders
where delivery_address->>'email' is not null
group by lower(delivery_address->>'email');
