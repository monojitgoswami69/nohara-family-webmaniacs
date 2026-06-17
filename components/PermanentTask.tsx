import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Task } from "../lib/types";

interface PermanentTaskProps {
  task: Task;
}

export default function PermanentTask({ task }: PermanentTaskProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const pressTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === "mouse") return; // Handled by hover
    pressTimeoutRef.current = setTimeout(() => setShowTooltip(true), 500);
  };

  const handlePointerUp = () => {
    if (pressTimeoutRef.current) clearTimeout(pressTimeoutRef.current);
    setShowTooltip(false);
  };

  useEffect(() => {
    return () => {
      if (pressTimeoutRef.current) clearTimeout(pressTimeoutRef.current);
    };
  }, []);

  return (
    <div
      className="mb-4 relative z-10 group"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onContextMenu={(e) => {
        // Prevent default context menu on mobile to allow long press tooltip
        if (showTooltip) e.preventDefault();
      }}
    >
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            transition={{ duration: 0.15 }}
            className="absolute -top-10 left-1/2 -translate-x-1/2 bg-[#2E3440] text-[#ECEFF4] font-mono text-[12px] px-3 py-1.5 rounded-[6px] whitespace-nowrap pointer-events-none"
          >
            this is the only task that trusts you.
          </motion.div>
        )}
      </AnimatePresence>

      <div 
        className="border-2 border-[#8FBCBB] bg-permanent flex flex-col transition-colors relative overflow-hidden rounded-[12px]"
      >
        <div 
          className="p-4 flex flex-col rounded-[10px]"
        >
          <div className="flex justify-between items-start mb-4">
            <span className="text-[14px] font-bold text-[#2E3440] font-mono">
              {task.text}
            </span>
            <span className="text-[18px] font-bold text-[#4E7A7A] shrink-0 font-sans leading-none">
              ∞
            </span>
          </div>

          <div className="flex justify-between items-end mt-auto">
            <span className="text-xs text-[#4C566A] font-mono">
              since the beginning
            </span>
            <span className="text-xs font-bold text-[#4E7A7A] text-right shrink-0">
              never expires
            </span>
          </div>
        </div>
      </div>

      <style jsx>{`
        .bg-permanent {
          background-color: #D1E3E4;
          box-shadow: 4px 4px 0 #8FBCBB;
        }
        @media (max-width: 640px) {
          .bg-permanent {
            box-shadow: 3px 3px 0 #8FBCBB;
          }
        }
      `}</style>
    </div>
  );
}
