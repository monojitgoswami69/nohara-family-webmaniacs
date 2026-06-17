import { motion, AnimatePresence } from "framer-motion";

interface FlashMessageProps {
  message: string | null;
}

export default function FlashMessage({ message }: FlashMessageProps) {
  return (
    <div className="h-6 mt-4">
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="text-[13px] text-muted italic font-mono"
          >
            {message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
