import { configureStore } from "@reduxjs/toolkit";
import { useDispatch, useSelector } from "react-redux";
import cartReducer from "./cartSlice";

const CART_KEY = "orika.cart.v1";

export const store = configureStore({
  reducer: { cart: cartReducer },
});

// Persist cart to localStorage on every change.
// Module-level (not inside useEffect) so the subscription is always active
// regardless of React's effect lifecycle or Strict Mode double-invoke.
if (typeof window !== "undefined") {
  let prevItems = store.getState().cart.items;
  store.subscribe(() => {
    const nextItems = store.getState().cart.items;
    if (nextItems === prevItems) return;
    prevItems = nextItems;
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(nextItems));
    } catch {}
  });
}

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Typed hooks — use these instead of plain useDispatch/useSelector
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector = <T>(selector: (state: RootState) => T) =>
  useSelector(selector);
