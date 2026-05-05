"use client";

import { useEffect } from "react";
import { Provider } from "react-redux";
import { store } from "@/lib/store";
import { hydrate } from "@/lib/store/cartSlice";
import type { CartItem } from "@/lib/types";

const STORAGE_KEY = "orika.cart.v1";

function isCartItem(x: unknown): x is CartItem {
  if (!x || typeof x !== "object") return false;
  const v = x as Record<string, unknown>;
  return (
    typeof v.product_id === "string" &&
    typeof v.name === "string" &&
    typeof v.price_kobo === "number" &&
    typeof v.quantity === "number" &&
    typeof v.image === "string" &&
    typeof v.size_ml === "number" &&
    typeof v.format === "string"
  );
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
        if (Array.isArray(parsed) && parsed.every(isCartItem)) {
          store.dispatch(hydrate(parsed));
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
