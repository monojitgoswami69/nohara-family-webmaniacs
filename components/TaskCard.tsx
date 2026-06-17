import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Task } from "../lib/types";
import { formatLifespanLabel, formatDateAdded } from "../lib/taskUtils";
import { useDecay } from "../hooks/useDecay";

interface TaskCardProps {
  task: Task;
  onDelete: (id: string) => void; // internal deletion after expiry animation
}

export default function TaskCard({ task, onDelete }: TaskCardProps) {
  const { percentage } = useDecay(task, () => handleExpire());
  
  const [isDeleting, setIsDeleting] = useState(false);
  const [displayText, setDisplayText] = useState(task.text);
  const deleteIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Decay bar coloring
  let barStyle: React.CSSProperties = { width: `${percentage}%` };
  const isDanger = percentage < 20;

  const getDecayColor = (pct: number) => {
    if (pct > 60) return "#E87A90"; // Soft pinkish-red
    if (pct > 25) return "#D46A7A"; // Mid pinkish-red
    return "#BF616A"; // Deep reddish-pink
  };

  barStyle.backgroundColor = getDecayColor(percentage);

  const handleExpire = () => {
    if (isDeleting) return;
    setIsDeleting(true);
  };

  // Reverse typing animation
  useEffect(() => {
    if (isDeleting) {
      if (displayText.length > 0) {
        deleteIntervalRef.current = setTimeout(() => {
          setDisplayText((prev) => prev.slice(0, -1));
        }, 55);
      } else {
        // Once text is gone, collapse
        onDelete(task.id);
      }
    }
    return () => {
      if (deleteIntervalRef.current) clearTimeout(deleteIntervalRef.current);
    };
  }, [isDeleting, displayText, onDelete, task.id]);

  return (
    <motion.div
      layoutId={task.id}
      initial={{ opacity: 0, scale: 0.97, y: -12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, height: 0, overflow: "hidden", marginTop: 0, marginBottom: 0, transition: { duration: 0.38 } }}
      transition={{
        type: "spring",
        stiffness: 280,
        damping: 22,
        layout: { duration: 0.3 }
      }}
      className="mb-4 relative group cursor-default"
    >
      <div className="border-2 border-primary bg-card-bg shadow-brutal-card flex flex-col transition-colors relative overflow-hidden pb-[5px]">
        <div className="p-4 flex flex-col">
          <div className="flex justify-between items-start mb-4">
            <span className="text-[13px] sm:text-[14px] leading-relaxed break-all flex-1 pr-4 font-mono text-primary">
              {displayText}
            </span>
          </div>

          <div className="flex justify-between items-end mt-auto">
            <span className="text-xs text-muted font-mono">
              {formatDateAdded(task.addedAt)}
            </span>
            <span className="text-xs font-bold text-right shrink-0 font-mono">
              {formatLifespanLabel(task, Date.now())}
            </span>
          </div>
        </div>

        {/* Decay Bar */}
        <div className="absolute bottom-0 left-0 w-full h-[5px] bg-[#EFECE5]" />
        
        <motion.div
          className="absolute bottom-0 left-0 h-[5px] origin-left rounded-r-full"
            style={barStyle}
            animate={isDanger ? { opacity: [1, 0.6, 1] } : { opacity: 1 }}
            transition={isDanger ? { repeat: Infinity, duration: 2, ease: "easeInOut" } : { type: "spring", stiffness: 60, damping: 20 }}
          />
      </div>
    </motion.div>
  );
}
