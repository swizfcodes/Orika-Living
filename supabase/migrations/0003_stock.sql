-- =============================================================================
-- Orika Living — Stock decrement RPC
-- Atomic stock decrement used when an order transitions pending → paid.
-- SECURITY DEFINER so the service role (and no one else) can invoke it.
-- =============================================================================

create or replace function public.decrement_stock(
  p_product_id uuid,
  p_qty        integer
) returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_qty <= 0 then
    return;
  end if;

  update public.products
  set stock_qty = greatest(0, stock_qty - p_qty),
      in_stock  = (greatest(0, stock_qty - p_qty) > 0)
  where id = p_product_id;
end;
$$;

revoke all on function public.decrement_stock(uuid, integer) from public, anon, authenticated;
grant  execute on function public.decrement_stock(uuid, integer) to service_role;
