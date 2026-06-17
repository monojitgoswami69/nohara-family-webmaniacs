import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function NotificationPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Check if we've already asked
    const hasAsked = localStorage.getItem("gone_notifs_asked");
    if (!hasAsked && "Notification" in window) {
      if (Notification.permission === "default") {
        const timer = setTimeout(() => {
          setShowPrompt(true);
        }, 4000); // 4 second delay
        return () => clearTimeout(timer);
      }
    }
  }, []);

  const handleResponse = async (accept: boolean) => {
    setShowPrompt(false);
    localStorage.setItem("gone_notifs_asked", "true");

    if (accept && "Notification" in window) {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        // Register for push if needed, though Service Worker is already registered
        // The service worker will now have permission to show notifications.
      }
    }
  };

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="fixed bottom-6 right-6 left-6 sm:left-auto sm:w-[380px] z-50 bg-card-bg border-2 border-primary shadow-brutal-card p-5"
        >
          <p className="text-[14px] leading-relaxed mb-5 text-primary font-bold">
            want reminders when your tasks are about to forget themselves?
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => handleResponse(true)}
              className="w-full bg-accent text-bg border-2 border-primary py-2 px-4 shadow-brutal-btn font-bold text-[13px]"
            >
              sure, remind me
            </button>
            <button
              onClick={() => handleResponse(false)}
              className="w-full bg-bg text-primary border-2 border-primary py-2 px-4 shadow-[3px_3px_0_#2E3440] rounded-[8px] hover:bg-muted-bg transition-colors font-bold text-[13px]"
            >
              i'll forget on my own
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
