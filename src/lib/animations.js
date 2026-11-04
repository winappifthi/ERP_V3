/**
 * Shared framer-motion variants. Keep animations subtle and purposeful.
 * Do not introduce bounce/spring — enterprise UI favors restraint.
 */
export const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.18, ease: 'easeOut' } },
  exit: { opacity: 0, y: -4, transition: { duration: 0.12, ease: 'easeIn' } },
};

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

export const slideInRight = {
  initial: { x: 20, opacity: 0 },
  animate: { x: 0, opacity: 1, transition: { duration: 0.2, ease: 'easeOut' } },
  exit: { x: 20, opacity: 0, transition: { duration: 0.15 } },
};

export const staggerContainer = {
  animate: { transition: { staggerChildren: 0.03 } },
};

export const staggerChild = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.18 } },
};