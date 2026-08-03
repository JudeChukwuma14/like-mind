"use client";

/**
 * Motion.tsx
 * Re-exports Framer Motion primitives and provides lightweight
 * scroll-triggered animation wrapper components for DRY usage
 * across the landing page and dashboard.
 */

import { useRef, type ReactNode, type CSSProperties } from "react";
import {
  motion,
  useInView,
  AnimatePresence,
  type Variants,
  type MotionProps,
} from "framer-motion";

export { motion, AnimatePresence, useInView };

/* ── Shared variants ────────────────────────────────────────── */
const fadeUpVariant: Variants = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0 },
};

const fadeInVariant: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const scaleInVariant: Variants = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: { opacity: 1, scale: 1 },
};

const staggerContainerVariant: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

/* ── Shared options ─────────────────────────────────────────── */
const defaultTransition = { duration: 0.6, ease: [0.22, 1, 0.36, 1] };

/* ── Props shared across wrappers ───────────────────────────── */
interface WrapperProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  delay?: number;
  duration?: number;
  /** If true, animation only fires once (default: true) */
  once?: boolean;
  /** Threshold for inView trigger (0–1) */
  amount?: number;
  as?: keyof typeof motion;
}

/* ── FadeUp ─────────────────────────────────────────────────── */
export function FadeUp({
  children,
  className,
  style,
  delay = 0,
  duration = 0.6,
  once = true,
  amount = 0.2,
  as = "div",
}: WrapperProps) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once, amount });
  const Tag = (motion as Record<string, React.ElementType>)[as] ?? motion.div;

  return (
    <Tag
      ref={ref}
      className={className}
      style={style}
      variants={fadeUpVariant}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      transition={{ ...defaultTransition, duration, delay }}
    >
      {children}
    </Tag>
  );
}

/* ── FadeIn ─────────────────────────────────────────────────── */
export function FadeIn({
  children,
  className,
  style,
  delay = 0,
  duration = 0.7,
  once = true,
  amount = 0.15,
}: WrapperProps) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once, amount });

  return (
    <motion.div
      ref={ref}
      className={className}
      style={style}
      variants={fadeInVariant}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      transition={{ ...defaultTransition, duration, delay }}
    >
      {children}
    </motion.div>
  );
}

/* ── ScaleIn ────────────────────────────────────────────────── */
export function ScaleIn({
  children,
  className,
  style,
  delay = 0,
  duration = 0.5,
  once = true,
  amount = 0.2,
}: WrapperProps) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once, amount });

  return (
    <motion.div
      ref={ref}
      className={className}
      style={style}
      variants={scaleInVariant}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      transition={{ ...defaultTransition, duration, delay }}
    >
      {children}
    </motion.div>
  );
}

/* ── StaggerChildren ────────────────────────────────────────── */
export function StaggerChildren({
  children,
  className,
  style,
  delay = 0,
  once = true,
  amount = 0.15,
}: WrapperProps) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once, amount });

  return (
    <motion.div
      ref={ref}
      className={className}
      style={style}
      variants={staggerContainerVariant}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      transition={{ delay }}
    >
      {children}
    </motion.div>
  );
}

/* ── StaggerItem — child of StaggerChildren ─────────────────── */
export function StaggerItem({
  children,
  className,
  style,
  duration = 0.55,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  duration?: number;
}) {
  return (
    <motion.div
      className={className}
      style={style}
      variants={fadeUpVariant}
      transition={{ ...defaultTransition, duration }}
    >
      {children}
    </motion.div>
  );
}

/* ── HoverScale — simple hover micro-interaction ────────────── */
export function HoverScale({
  children,
  className,
  style,
  scale = 1.03,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  scale?: number;
}) {
  return (
    <motion.div
      className={className}
      style={style}
      whileHover={{ scale }}
      whileTap={{ scale: scale * 0.97 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

/* ── Export all variants for manual use ─────────────────────── */
export const variants = {
  fadeUp: fadeUpVariant,
  fadeIn: fadeInVariant,
  scaleIn: scaleInVariant,
  staggerContainer: staggerContainerVariant,
};
