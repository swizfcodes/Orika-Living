"use client";

import { useState } from "react";
import { useAppDispatch } from "@/lib/store";
import { addItem, openCart } from "@/lib/store/cartSlice";
import type { Product } from "@/lib/types";
import { getProductImage } from "@/lib/utils/images";

interface Props {
  product: Product;
}

export default function AddToCart({ product }: Props) {
  const dispatch = useAppDispatch();
  const [qty, setQty] = useState(1);
  const disabled = !product.in_stock || product.stock_qty <= 0;

  const add = () => {
    if (disabled) return;
    dispatch(
      addItem({
        product_id: product.id,
        name: product.name,
        // price_kobo and size_ml arrive from the API as strings (Postgres
        // bigint/numeric are serialized as strings by node-postgres). The
        // cart — and its persistence validator — expects numbers, so coerce
        // here at the boundary. Without this the stored item fails the
        // CartItem shape check on reload and the whole cart is wiped.
        price_kobo: Number(product.price_kobo),
        quantity: qty,
        image: getProductImage(product) ?? "",
        size_ml: Number(product.size_ml),
        format: product.format,
      }),
    );
    dispatch(openCart());
  };

  return (
    <div className="flex items-stretch gap-3">
      <div className="inline-flex items-center border border-(--charcoal)">
        <button
          type="button"
          onClick={() => setQty((q) => Math.max(1, q - 1))}
          className="w-11 h-12 text-(--charcoal) hover:bg-(--parchment)"
          aria-label="Decrease quantity"
          disabled={disabled}
        >
          −
        </button>
        <span className="w-10 text-center text-sm text-(--charcoal)">
          {qty}
        </span>
        <button
          type="button"
          onClick={() => setQty((q) => q + 1)}
          className="w-11 h-12 text-(--charcoal) hover:bg-(--parchment)"
          aria-label="Increase quantity"
          disabled={disabled}
        >
          +
        </button>
      </div>

      <button
        type="button"
        onClick={add}
        disabled={disabled}
        className="flex-1 bg-(--charcoal) text-(--warm-white) px-8 text-xs tracking-[0.3em] uppercase hover:bg-(--ink) transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {disabled ? "Sold Out" : "Add to Cart"}
      </button>
    </div>
  );
}
