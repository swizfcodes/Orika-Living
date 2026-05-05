"use client";

import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useAppDispatch, useAppSelector } from "@/lib/store";
import {
  closeCart,
  removeItem,
  selectCartItems,
  selectCartOpen,
  selectCartTotal,
  updateQuantity,
} from "@/lib/store/cartSlice";
import { fromKobo } from "@/lib/types";

export default function CartDrawer() {
  const dispatch = useAppDispatch();
  const open = useAppSelector(selectCartOpen);
  const items = useAppSelector(selectCartItems);
  const total = useAppSelector(selectCartTotal);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={() => dispatch(closeCart())}
            className="fixed inset-0 z-50 bg-black/40"
            aria-hidden="true"
          />
          <motion.aside
            key="drawer"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-(--warm-white) flex flex-col shadow-xl"
            role="dialog"
            aria-label="Shopping cart"
          >
            <div className="flex items-center justify-between px-6 py-6 border-b border-(--border)">
              <p className="text-xs tracking-[0.35em] uppercase text-(--charcoal)">
                Your Cart
              </p>
              <button
                type="button"
                onClick={() => dispatch(closeCart())}
                className="text-(--smoke) hover:text-(--charcoal) transition-colors"
                aria-label="Close cart"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-6">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-20">
                  <p className="font-display text-2xl text-(--charcoal) mb-3">
                    Your cart is empty
                  </p>
                  <p className="text-sm text-(--smoke) mb-8">
                    Begin your Orika ritual.
                  </p>
                  <Link
                    href="/products"
                    onClick={() => dispatch(closeCart())}
                    className="text-[0.7rem] tracking-[0.3em] uppercase gold-underline text-(--charcoal)"
                  >
                    Browse Collection
                  </Link>
                </div>
              ) : (
                <ul className="space-y-6">
                  {items.map((item) => (
                    <li key={item.product_id} className="flex gap-4">
                      <div className="relative w-20 h-24 bg-(--parchment) shrink-0">
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            sizes="80px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center font-display text-(--smoke) text-xs">
                            Orika
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="font-display text-lg text-(--charcoal) leading-tight">
                              {item.name}
                            </p>
                            <p className="text-[0.65rem] tracking-[0.3em] uppercase text-(--smoke) mt-1">
                              {item.format} · {item.size_ml}ml
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => dispatch(removeItem(item.product_id))}
                            className="text-(--smoke) hover:text-(--charcoal) text-[0.6rem] tracking-[0.3em] uppercase shrink-0"
                            aria-label={`Remove ${item.name}`}
                          >
                            Remove
                          </button>
                        </div>
                        <div className="mt-3 flex items-center justify-between">
                          <div className="inline-flex items-center border border-(--border)">
                            <button
                              type="button"
                              onClick={() =>
                                dispatch(
                                  updateQuantity({
                                    product_id: item.product_id,
                                    quantity: item.quantity - 1,
                                  }),
                                )
                              }
                              className="w-8 h-8 text-(--charcoal) hover:bg-(--parchment)"
                              aria-label="Decrease quantity"
                            >
                              −
                            </button>
                            <span className="w-8 text-center text-sm text-(--charcoal)">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                dispatch(
                                  updateQuantity({
                                    product_id: item.product_id,
                                    quantity: item.quantity + 1,
                                  }),
                                )
                              }
                              className="w-8 h-8 text-(--charcoal) hover:bg-(--parchment)"
                              aria-label="Increase quantity"
                            >
                              +
                            </button>
                          </div>
                          <p className="text-sm text-(--charcoal)">
                            {fromKobo(item.price_kobo * item.quantity)}
                          </p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {items.length > 0 && (
              <div className="border-t border-(--border) px-6 py-6 space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-[0.65rem] tracking-[0.35em] uppercase text-(--smoke)">
                    Subtotal
                  </p>
                  <p className="font-display text-2xl text-(--charcoal)">
                    {fromKobo(total)}
                  </p>
                </div>
                <p className="text-xs text-(--smoke)">
                  Shipping and taxes calculated at checkout.
                </p>
                <Link
                  href="/checkout"
                  onClick={() => dispatch(closeCart())}
                  className="w-full bg-(--charcoal) text-(--warm-white) py-4 text-xs tracking-[0.3em] uppercase hover:bg-(--ink) transition-colors block text-center"
                >
                  Checkout
                </Link>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
