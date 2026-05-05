"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

const DOT_SIZE = 7;
const DOT_HOVER_SIZE = 5;
const RING_SIZE = 36;
const RING_HOVER_SIZE = 52;

const GOLD = "#B8922A";
const CHARCOAL = "#2B2820";
const RING_BORDER = "rgba(184, 146, 42, 0.45)";
const RING_BORDER_HOVER = "rgba(43, 40, 32, 0.2)";

const HOVER_SELECTOR =
  'a, button, [data-cursor="hover"], .product-card, .scent-card, .price-card';

export default function CustomCursor() {
  const [enabled, setEnabled] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [visible, setVisible] = useState(false);

  const dotX = useMotionValue(-100);
  const dotY = useMotionValue(-100);
  const ringX = useSpring(dotX, { stiffness: 120, damping: 28, mass: 0.4 });
  const ringY = useSpring(dotY, { stiffness: 120, damping: 28, mass: 0.4 });

  // Only enable on fine-pointer devices (skip touch).
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(pointer: fine)");
    const update = () => setEnabled(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const onMove = (e: MouseEvent) => {
      dotX.set(e.clientX);
      dotY.set(e.clientY);
      if (!visible) setVisible(true);
    };

    const onLeave = () => setVisible(false);
    const onEnter = () => setVisible(true);

    const onOver = (e: MouseEvent) => {
      const target = e.target as Element | null;
      if (target?.closest?.(HOVER_SELECTOR)) setHovering(true);
    };

    const onOut = (e: MouseEvent) => {
      const target = e.target as Element | null;
      if (target?.closest?.(HOVER_SELECTOR)) setHovering(false);
    };

    window.addEventListener("mousemove", onMove);
    document.addEventListener("mouseleave", onLeave);
    document.addEventListener("mouseenter", onEnter);
    document.addEventListener("mouseover", onOver);
    document.addEventListener("mouseout", onOut);

    document.body.style.cursor = "none";

    return () => {
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("mouseenter", onEnter);
      document.removeEventListener("mouseover", onOver);
      document.removeEventListener("mouseout", onOut);
      document.body.style.cursor = "";
    };
  }, [enabled, visible, dotX, dotY]);

  if (!enabled) return null;

  const dotSize = hovering ? DOT_HOVER_SIZE : DOT_SIZE;
  const ringSize = hovering ? RING_HOVER_SIZE : RING_SIZE;

  return (
    <>
      <motion.div
        aria-hidden
        style={{
          translateX: dotX,
          translateY: dotY,
          x: "-50%",
          y: "-50%",
        }}
        animate={{
          width: dotSize,
          height: dotSize,
          backgroundColor: hovering ? CHARCOAL : GOLD,
          opacity: visible ? 1 : 0,
        }}
        transition={{ duration: 0.18, ease: "easeOut" }}
        className="pointer-events-none fixed left-0 top-0 z-[9999] rounded-full"
      />
      <motion.div
        aria-hidden
        style={{
          translateX: ringX,
          translateY: ringY,
          x: "-50%",
          y: "-50%",
        }}
        animate={{
          width: ringSize,
          height: ringSize,
          borderColor: hovering ? RING_BORDER_HOVER : RING_BORDER,
          opacity: visible ? 1 : 0,
        }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="pointer-events-none fixed left-0 top-0 z-[9999] rounded-full border"
      />
    </>
  );
}
