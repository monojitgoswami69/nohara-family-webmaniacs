import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function InstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowBanner(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setDeferredPrompt(null);
      setShowBanner(false);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
  };

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed bottom-0 left-0 right-0 bg-primary text-accent p-4 z-50 flex items-center justify-between pb-[calc(16px+env(safe-area-inset-bottom))]"
        >
          <button
            onClick={handleInstallClick}
            className="flex-1 text-left font-bold text-sm tracking-tight focus:outline-none"
          >
            add to home screen for the full experience →
          </button>
          <button
            onClick={handleDismiss}
            className="w-8 h-8 flex items-center justify-center font-bold text-xl ml-4 focus:outline-none"
            aria-label="Dismiss banner"
          >
            ×
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
