"use client";

import { useSyncExternalStore } from "react";

// Persist the customer's contact + delivery details so a returning visitor
// — or someone who hit a payment failure and came back — doesn't have to
// retype everything. Stored locally only (never card data). Matches the
// app's existing orika.*.vN localStorage key convention (see StoreProvider).

const STORAGE_KEY = "orika.checkout.v1";

export interface CheckoutDetails {
  full_name: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  state: string;
}

const EMPTY: CheckoutDetails = {
  full_name: "",
  email: "",
  phone: "",
  street: "",
  city: "",
  state: "",
};

// useSyncExternalStore requires getSnapshot to return the same reference
// when data is unchanged, otherwise React infinite-loops. Cache by raw JSON.
let _cacheKey: string | null = null;
let _cached: CheckoutDetails = EMPTY;

function read(): CheckoutDetails {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) { _cacheKey = null; _cached = EMPTY; return EMPTY; }
    if (raw === _cacheKey) return _cached;
    const parsed = JSON.parse(raw) as Partial<CheckoutDetails>;
    _cacheKey = raw;
    _cached = {
      full_name: String(parsed.full_name ?? ""),
      email: String(parsed.email ?? ""),
      phone: String(parsed.phone ?? ""),
      street: String(parsed.street ?? ""),
      city: String(parsed.city ?? ""),
      state: String(parsed.state ?? ""),
    };
    return _cached;
  } catch {
    _cacheKey = null; _cached = EMPTY; return EMPTY;
  }
}

// Custom event to notify useSyncExternalStore of same-tab writes.
const CHANGE_EVENT = "orika:checkout:change";

function subscribe(callback: () => void) {
  window.addEventListener(CHANGE_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(CHANGE_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

export function useCheckoutDetails() {
  // useSyncExternalStore handles the server/client split via snapshots —
  // server gets EMPTY/false, client reads localStorage/true, with no
  // hydration mismatch and no setState-in-effect lint violations.
  const details = useSyncExternalStore(subscribe, read, () => EMPTY);
  // loaded: false on the server, true on the client — drives form remount
  // so uncontrolled inputs pick up their prefilled defaultValues.
  const loaded = useSyncExternalStore(() => () => {}, () => true, () => false);

  const save = (next: CheckoutDetails) => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        window.dispatchEvent(new Event(CHANGE_EVENT));
      } catch {
        // Storage full / disabled — non-fatal, just won't persist.
      }
    }
  };

  const clear = () => {
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem(STORAGE_KEY);
        window.dispatchEvent(new Event(CHANGE_EVENT));
      } catch {
        // ignore
      }
    }
  };

  return { details, loaded, save, clear };
}
