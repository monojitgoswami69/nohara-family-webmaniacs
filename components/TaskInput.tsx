import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTypingTimer } from "../hooks/useTypingTimer";
import { Task } from "../lib/types";
import { FLASH_MESSAGES, PERMANENT_TASK_TEXT } from "../lib/constants";
import FlashMessage from "./FlashMessage";

interface TaskInputProps {
  onAdd: (task: Task) => void;
  tasks: Task[];
}

export default function TaskInput({ onAdd, tasks }: TaskInputProps) {
  const {
    text,
    elapsedMs,
    elapsedSeconds,
    isActive,
    currentVerdict,
    handleTextChange,
    handleFocus,
    handleBlur,
    resetTimer,
    showStareMessage,
    hasDeletedEverything,
  } = useTypingTimer();

  const [flash, setFlash] = useState<string | null>(null);
  const [buttonText, setButtonText] = useState("commit to forgetting");
  const [showMidnight, setShowMidnight] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Midnight check
    const dismissedDate = localStorage.getItem("gone_midnight_dismissed");
    const now = new Date();
    const today = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;
    
    if (dismissedDate !== today) {
      const hours = now.getHours();
      if (hours >= 0 && hours < 5) {
        setShowMidnight(true);
      }
    }
  }, []);

  const dismissMidnight = () => {
    const now = new Date();
    const today = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;
    localStorage.setItem("gone_midnight_dismissed", today);
    setShowMidnight(false);
  };

  const triggerFlash = (msg: string, duration = 1800) => {
    setFlash(msg);
    setTimeout(() => setFlash(null), duration);
  };

  const handleSubmit = () => {
    const trimmed = text.trim();
    if (!trimmed) return;

    // Permanent task check
    if (trimmed.toLowerCase() === PERMANENT_TASK_TEXT.toLowerCase()) {
      triggerFlash("it already exists. you cannot create something that never ends.");
      return;
    }

    const isDuplicate = tasks.some((t) => !t.permanent && t.text === trimmed && t.lifespanDays > 0);
    if (isDuplicate) {
      triggerFlash("this already exists. typing it twice will not make it more likely to happen.");
      return;
    }

    // Conviction check
    const lowerText = trimmed.toLowerCase();
    const convictionWords = ["urgent", "important", "asap", "critical", "need to"];
    const matchedWord = convictionWords.find((w) => lowerText.includes(w));

    if (matchedWord) {
      triggerFlash(`you called it ${matchedWord}. you had ${elapsedSeconds} seconds of conviction. the clock disagrees.`, 2200);
    } else {
      triggerFlash(FLASH_MESSAGES[Math.floor(Math.random() * FLASH_MESSAGES.length)]);
    }

    const newTask: Task = {
      id: crypto.randomUUID(),
      text: trimmed,
      addedAt: Date.now(),
      lifespanDays: elapsedSeconds,
      typingSeconds: elapsedSeconds,
      permanent: false,
    };

    onAdd(newTask);
    resetTimer();

    setButtonText("noted. briefly.");
    setTimeout(() => setButtonText("commit to forgetting"), 300);

    if (textareaRef.current) {
      textareaRef.current.blur();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="mb-2 relative w-full">
      <AnimatePresence>
        {showMidnight && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-4 bg-muted-bg border-2 border-primary shadow-brutal-sm p-3 rounded-[8px] flex justify-between items-center"
          >
            <p className="text-[13px] font-mono text-muted italic">it is past midnight. the tasks will not care that you stayed up.</p>
            <button onClick={dismissMidnight} className="bg-card-bg border-2 border-primary text-primary px-3 py-1 font-bold text-xs rounded-[4px] shadow-brutal-sm hover:bg-muted-bg transition-colors">
              ok
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="border-2 border-primary bg-card-bg p-4 shadow-brutal-input flex flex-col mb-4 transition-shadow">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => handleTextChange(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder="type slowly if you care about this"
          className="w-full bg-transparent resize-none outline-none text-primary min-h-[120px] placeholder:text-muted leading-relaxed font-mono text-[14px]"
        />

        <div className="flex flex-col sm:flex-row sm:items-end justify-between mt-4 min-h-[2rem]">
          <div className="flex flex-col sm:flex-row sm:items-center text-sm font-bold w-full">
            <div className="flex items-center min-h-[1.5rem] flex-1">
              <AnimatePresence mode="popLayout">
                {isActive && (
                  <motion.span
                    key={currentVerdict}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="mr-2 text-accent"
                  >
                    {currentVerdict}
                  </motion.span>
                )}
              </AnimatePresence>
              {isActive && (
                <span className="text-accent font-semibold">
                  = {elapsedSeconds} days
                </span>
              )}
            </div>

            <button
              onClick={handleSubmit}
              disabled={text.trim().length === 0}
              className="mt-4 sm:mt-0 bg-accent text-bg border-2 border-primary px-4 py-2 font-mono text-[13px] shadow-brutal-btn disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {buttonText}
            </button>
          </div>
        </div>
      </div>

      <div className="min-h-[1.5rem] text-sm flex flex-col gap-1 mt-2">
        <AnimatePresence>
          {showStareMessage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2 }}
              className="text-muted font-mono italic"
            >
              the task you are avoiding does not need to be typed to exist.
            </motion.div>
          )}
        </AnimatePresence>
        
        {!showStareMessage && hasDeletedEverything && elapsedSeconds > 8 && (
          <div className="text-warning font-mono italic text-sm">changed your mind. the clock did not.</div>
        )}

        {!showStareMessage && text.length > 200 && (
          <div className="text-muted font-mono italic text-sm">at this point you are writing an essay not a task.</div>
        )}
        
        {!showStareMessage && text.length > 120 && text.length <= 200 && (
          <div className="text-muted font-mono italic text-sm">long task. either genuinely complex or you are stalling.</div>
        )}
      </div>

      <FlashMessage message={flash} />
    </div>
  );
}
