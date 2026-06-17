import { useState, useEffect, useCallback } from "react";
import { Task } from "../lib/types";
import { PERMANENT_TASK_TEXT } from "../lib/constants";
import { isTaskExpired } from "../lib/taskUtils";

const STORAGE_KEY = "gone_v1";

export function useTaskStore() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Initialize from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      let parsedTasks: Task[] = stored ? JSON.parse(stored) : [];

      // Ensure permanent task exists
      const hasPermanent = parsedTasks.some((t) => t.permanent);
      if (!hasPermanent) {
        parsedTasks = [
          {
            id: "permanent-task",
            text: PERMANENT_TASK_TEXT,
            addedAt: Date.now(),
            lifespanDays: Infinity,
            typingSeconds: Infinity,
            permanent: true,
          },
          ...parsedTasks,
        ];
      }

      setTasks(parsedTasks);
    } catch (e) {
      console.error("Failed to load tasks", e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save to localStorage whenever tasks change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    }
  }, [tasks, isLoaded]);

  const scheduleNotifications = useCallback((task: Task) => {
    if (typeof navigator !== 'undefined' && navigator.serviceWorker && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'SCHEDULE_TASK_NOTIFICATIONS',
        task
      });
    }
  }, []);

  const cancelNotifications = useCallback((taskId: string) => {
    if (typeof navigator !== 'undefined' && navigator.serviceWorker && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'CANCEL_TASK_NOTIFICATIONS',
        taskId
      });
    }
  }, []);

  const addTask = useCallback((task: Task) => {
    setTasks((prev) => {
      const permanentTask = prev.find((t) => t.permanent);
      const others = prev.filter((t) => !t.permanent);
      return permanentTask ? [permanentTask, task, ...others] : [task, ...others];
    });
    scheduleNotifications(task);
  }, [scheduleNotifications]);

  // internal deletion used after reverse-typing animation
  const deleteTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    cancelNotifications(id);
  }, [cancelNotifications]);

  const clearGraveyard = useCallback(() => {
    setTasks((prev) => {
      const now = Date.now();
      return prev.filter((t) => t.permanent || !isTaskExpired(t, now));
    });
  }, []);

  // Demo Tool Methods
  const fastForwardTask = useCallback((id: string, hours: number) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          return { ...t, addedAt: t.addedAt - hours * 60 * 60 * 1000 };
        }
        return t;
      })
    );
  }, []);

  const expireTask = useCallback((id: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const lifespanMs = t.lifespanDays * 24 * 60 * 60 * 1000;
          return { ...t, addedAt: Date.now() - lifespanMs - 1000 };
        }
        return t;
      })
    );
  }, []);

  return {
    tasks,
    isLoaded,
    addTask,
    deleteTask,
    clearGraveyard,
    fastForwardTask,
    expireTask,
  };
}
