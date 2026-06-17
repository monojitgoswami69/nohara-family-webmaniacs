import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Task } from "../lib/types";

interface DemoToolProps {
  tasks: Task[];
  fastForwardTask: (id: string, hours: number) => void;
  expireTask: (id: string) => void;
}

export default function DemoTool({ tasks, fastForwardTask, expireTask }: DemoToolProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check initial state
    if (localStorage.getItem("gone_demo_mode") === "true") {
      setIsVisible(true);
    }

    // Expose global console API
    if (typeof window !== "undefined") {
      (window as any).demoMode = {
        enable: () => {
          localStorage.setItem("gone_demo_mode", "true");
          window.dispatchEvent(new Event("demo_mode_changed"));
          console.log("Demo mode enabled.");
        },
        disable: () => {
          localStorage.removeItem("gone_demo_mode");
          window.dispatchEvent(new Event("demo_mode_changed"));
          console.log("Demo mode disabled.");
        }
      };
    }

    const handleStateChange = () => {
      setIsVisible(localStorage.getItem("gone_demo_mode") === "true");
    };

    window.addEventListener("demo_mode_changed", handleStateChange);
    return () => window.removeEventListener("demo_mode_changed", handleStateChange);
  }, []);

  if (!isVisible) return null;

  const now = Date.now();
  const activeTasks = tasks.filter(t => !t.permanent && (t.addedAt + t.lifespanDays * 24 * 60 * 60 * 1000) > now);

  return (
    <motion.div
      drag
      dragMomentum={false}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      style={{
        position: "fixed",
        top: 20,
        right: 20,
        zIndex: 999999,
        touchAction: "none"
      }}
      className="w-[280px] bg-[#FDFBF7] text-[#2C2A28] border-2 border-[#2C2A28] rounded-[6px] shadow-[3px_3px_0_#2C2A28] font-mono text-[11px] flex flex-col max-h-[300px]"
    >
      {/* Drag Handle */}
      <div className="p-2 px-3 bg-[#EFECE5] border-b-2 border-[#2C2A28] cursor-grab active:cursor-grabbing flex justify-between items-center rounded-t-[4px]">
        <strong className="text-[#5E81AC] font-bold text-[12px]">🛠️ Demo</strong>
        <button 
          onClick={() => (window as any).demoMode.disable()}
          className="text-[#BF616A] font-bold hover:opacity-80 transition-opacity"
        >
          X
        </button>
      </div>

      <div className="p-2 overflow-y-auto flex-1">
        {activeTasks.length === 0 ? (
          <div className="text-center text-[#6C6661] py-3">No active tasks.</div>
        ) : (
          activeTasks.map(task => (
            <div key={task.id} className="border-2 border-[#2C2A28] rounded-[4px] p-1.5 mb-1.5 bg-[#FFFFFF]">
              <div className="font-bold mb-1.5 whitespace-nowrap overflow-hidden text-ellipsis">
                {task.text}
              </div>
              <div className="flex gap-1 font-bold">
                <button 
                  onClick={() => fastForwardTask(task.id, 1)}
                  className="flex-1 bg-[#FDFBF7] text-[#2C2A28] border-2 border-[#2C2A28] shadow-[2px_2px_0_#2C2A28] rounded-[3px] py-0.5 hover:bg-[#EFECE5] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0_#2C2A28] transition-all"
                >
                  +1H
                </button>
                <button 
                  onClick={() => fastForwardTask(task.id, 24)}
                  className="flex-1 bg-[#FDFBF7] text-[#2C2A28] border-2 border-[#2C2A28] shadow-[2px_2px_0_#2C2A28] rounded-[3px] py-0.5 hover:bg-[#EFECE5] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0_#2C2A28] transition-all"
                >
                  +24H
                </button>
                <button 
                  onClick={() => expireTask(task.id)}
                  className="flex-1 bg-[#BF616A] text-[#FFFFFF] border-2 border-[#2C2A28] shadow-[2px_2px_0_#2C2A28] rounded-[3px] py-0.5 hover:opacity-90 active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0_#2C2A28] transition-all"
                >
                  End
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
}
