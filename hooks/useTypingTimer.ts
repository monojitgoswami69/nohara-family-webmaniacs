import { useState, useEffect, useRef, useCallback } from "react";
import { VERDICTS } from "../lib/constants";

export function useTypingTimer() {
  const [text, setText] = useState("");
  const [elapsedMs, setElapsedMs] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [stareTriggered, setStareTriggered] = useState(false);
  const [showStareMessage, setShowStareMessage] = useState(false);
  const [hasDeletedEverything, setHasDeletedEverything] = useState(false);
  
  const startTimeRef = useRef<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const stareTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const startTimer = useCallback(() => {
    if (!isActive) {
      setIsActive(true);
      startTimeRef.current = Date.now() - elapsedMs;
      intervalRef.current = setInterval(() => {
        if (startTimeRef.current) {
          setElapsedMs(Date.now() - startTimeRef.current);
        }
      }, 30);
    }
  }, [isActive, elapsedMs]);

  const stopTimer = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsActive(false);
  }, []);

  const resetTimer = useCallback(() => {
    stopTimer();
    setElapsedMs(0);
    setText("");
    startTimeRef.current = null;
    setHasDeletedEverything(false);
  }, [stopTimer]);

  const handleTextChange = useCallback((newText: string) => {
    if (newText.length > 0 && !isActive) {
      startTimer();
    }
    
    // Indecision tracker
    if (newText.length === 0 && text.length > 0) {
      setHasDeletedEverything(true);
    }

    setText(newText);

    // Cancel stare timeout if they type
    if (stareTimeoutRef.current) {
      clearTimeout(stareTimeoutRef.current);
    }
  }, [isActive, text, startTimer]);

  const handleFocus = useCallback(() => {
    if (!stareTriggered && text.length === 0) {
      stareTimeoutRef.current = setTimeout(() => {
        setStareTriggered(true);
        setShowStareMessage(true);
        setTimeout(() => setShowStareMessage(false), 5000); // stay 4s + 1s fade out
      }, 60000);
    }
  }, [stareTriggered, text]);

  const handleBlur = useCallback(() => {
    if (stareTimeoutRef.current) {
      clearTimeout(stareTimeoutRef.current);
    }
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (stareTimeoutRef.current) clearTimeout(stareTimeoutRef.current);
    };
  }, []);

  const elapsedSeconds = Math.max(1, Math.floor(elapsedMs / 1000));
  const currentVerdict = VERDICTS.find((v) => elapsedSeconds <= v.maxSeconds)?.text || VERDICTS[VERDICTS.length - 1].text;

  return {
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
  };
}
