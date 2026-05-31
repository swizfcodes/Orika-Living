"use client";

import { useEffect } from "react";
import { Provider } from "react-redux";
import { store } from "@/lib/store";
import { hydrate } from "@/lib/store/cartSlice";
import type { CartItem } from "@/lib/types";

const STORAGE_KEY = "orika.cart.v1";

// Normalize a stored value into a CartItem, coercing numeric fields that
// may have been persisted as strings (the API returns Postgres bigint/
// numeric as strings, and older saved carts captured them that way).
// Returns null only if a required field is genuinely missing/unusable —
// so a recoverable cart is repaired rather than wiped.
function normalizeCartItem(x: unknown): CartItem | null {
  if (!x || typeof x !== "object") return null;
  const v = x as Record<string, unknown>;

  const price = Number(v.price_kobo);
  const qty = Number(v.quantity);
  const size = Number(v.size_ml);

  if (typeof v.product_id !== "string" || !v.product_id) return null;
  if (typeof v.name !== "string") return null;
  if (typeof v.format !== "string") return null;
  if (!Number.isFinite(price) || !Number.isFinite(qty) || qty < 1) return null;

  return {
    product_id: v.product_id,
    name: v.name,
    price_kobo: price,
    quantity: qty,
    image: typeof v.image === "string" ? v.image : "",
    size_ml: Number.isFinite(size) ? size : 0,
    format: v.format as CartItem["format"],
  };
}

export default function StoreProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // Restore cart on mount. Runs client-only, so no SSR mismatch.
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: unknown = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          // Repair-and-keep: coerce each item; drop only truly broken ones.
          const items = parsed
            .map(normalizeCartItem)
            .filter((i): i is CartItem => i !== null);
          if (items.length > 0) {
            store.dispatch(hydrate(items));
          } else {
            localStorage.removeItem(STORAGE_KEY);
          }
        } else {
          localStorage.removeItem(STORAGE_KEY);
        }
      }
    } catch {
      // Corrupted JSON or storage unavailable — ignore.
    }

    // Persist cart items on every change. Reference equality on the items
    // array means we only write when the cart actually changes.
    let prev = store.getState().cart.items;
    const unsubscribe = store.subscribe(() => {
      const next = store.getState().cart.items;
      if (next === prev) return;
      prev = next;
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Quota exceeded or storage unavailable — ignore.
      }
    });
    return unsubscribe;
  }, []);

  return <Provider store={store}>{children}</Provider>;
}
