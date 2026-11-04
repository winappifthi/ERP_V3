import { motion } from 'framer-motion';
import { pageVariants } from '../../lib/animations';

/** Wrap any page's return value to get a subtle entrance animation. */
export default function PageTransition({ children }) {
  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit">
      {children}
    </motion.div>
  );
}