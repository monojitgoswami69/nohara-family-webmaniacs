import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Task } from "../lib/types";

interface GraveyardProps {
  tasks: Task[];
  onClear: () => void;
}

export default function Graveyard({ tasks, onClear }: GraveyardProps) {
  const [showIdleMessage, setShowIdleMessage] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const stareTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (tasks.length <= 5) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          stareTimeoutRef.current = setTimeout(() => {
            setShowIdleMessage(true);
          }, 8000);
        } else {
          if (stareTimeoutRef.current) clearTimeout(stareTimeoutRef.current);
          setShowIdleMessage(false);
        }
      },
      { threshold: 0.5 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    const currentRef = sectionRef.current;

    return () => {
      if (currentRef) observer.unobserve(currentRef);
      if (stareTimeoutRef.current) clearTimeout(stareTimeoutRef.current);
    };
  }, [tasks.length]);

  if (tasks.length === 0) return null;

  return (
    <div ref={sectionRef} className="mt-16 mb-8 border-t-2 border-[#E5E0D8] pt-8">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-3xl font-sans font-bold text-primary tracking-tight">graveyard.</h2>
          <AnimatePresence>
            {showIdleMessage && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
                className="text-[#4C566A] italic font-mono text-sm mt-1"
              >
                you have been staring at your failures for 8 seconds. very normal.
              </motion.p>
            )}
          </AnimatePresence>
        </div>
        <button
          onClick={onClear}
          className="text-xs font-bold font-mono text-primary bg-bg border-2 border-primary px-3 py-1.5 shadow-[3px_3px_0_#2C2A28] rounded-[8px] hover:bg-muted-bg transition-colors"
        >
          clear the dead
        </button>
      </div>

      <motion.div
        className="flex flex-col"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: {
            transition: {
              staggerChildren: 0.06
            }
          }
        }}
      >
        {tasks.map((task) => {
          const expiredAt = task.addedAt + task.lifespanDays * 24 * 60 * 60 * 1000;
          const formatter = new Intl.DateTimeFormat("en-US", {
            month: "short", day: "numeric", year: "numeric",
            hour: "numeric", minute: "numeric", hour12: true
          });
          const timeString = formatter.format(new Date(expiredAt)).toLowerCase();

          return (
            <motion.div
              key={task.id}
              variants={{
                hidden: { opacity: 0, y: 8 },
                visible: { opacity: 1, y: 0 }
              }}
              className="mb-3 border-2 border-[#E5E0D8] bg-[#FDFBF7] p-3 shadow-[2px_2px_0_#E5E0D8] rounded-[12px] flex flex-col justify-center"
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-[13px] text-primary/80 line-through font-mono break-all pr-4">
                  {task.text}
                </span>
                <span className="text-xs text-danger font-bold shrink-0 font-mono">
                  gone.
                </span>
              </div>
              <div className="text-xs text-muted font-mono">
                expired {timeString}
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
