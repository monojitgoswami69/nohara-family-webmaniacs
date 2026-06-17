"use client";

import { useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { useTaskStore } from "../hooks/useTaskStore";
import { isTaskExpired } from "../lib/taskUtils";

import Header from "../components/Header";
import TaskInput from "../components/TaskInput";
import TaskCard from "../components/TaskCard";
import PermanentTask from "../components/PermanentTask";
import Graveyard from "../components/Graveyard";
import InstallBanner from "../components/InstallBanner";
import NotificationPrompt from "../components/NotificationPrompt";
import DemoTool from "../components/DemoTool";

export default function ClientApp() {
  const { tasks, isLoaded, addTask, deleteTask, clearGraveyard } = useTaskStore();

  const now = Date.now();
  const activeTasks = tasks.filter((t) => t.permanent || !isTaskExpired(t, now));
  const expiredTasks = tasks.filter((t) => !t.permanent && isTaskExpired(t, now));

  // Easter Egg 3: Browser Tab Title
  useEffect(() => {
    if (!isLoaded) return;

    const updateTitle = () => {
      let expiringSoonCount = 0;
      activeTasks.forEach((t) => {
        if (!t.permanent) {
          const expiresAt = t.addedAt + t.lifespanDays * 24 * 60 * 60 * 1000;
          if (expiresAt - Date.now() < 24 * 60 * 60 * 1000) {
            expiringSoonCount++;
          }
        }
      });

      if (expiringSoonCount > 0) {
        document.title = `${expiringSoonCount} thing(s) leaving you today — gone.`;
      } else if (expiredTasks.length >= 10) {
        document.title = `you have forgotten ${expiredTasks.length} things — gone.`;
      } else {
        document.title = "gone.";
      }
    };

    updateTitle();
    const interval = setInterval(updateTitle, 60000);
    return () => clearInterval(interval);
  }, [activeTasks, expiredTasks, isLoaded]);

  // Still here? Easter Egg logic
  useEffect(() => {
    if (!isLoaded) return;

    let timeout: NodeJS.Timeout;

    const resetInteraction = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        document.title = "still here? — gone.";
      }, 5 * 60 * 1000); // 5 minutes
    };

    window.addEventListener("mousemove", resetInteraction);
    window.addEventListener("keydown", resetInteraction);
    window.addEventListener("scroll", resetInteraction);
    
    resetInteraction();

    return () => {
      window.removeEventListener("mousemove", resetInteraction);
      window.removeEventListener("keydown", resetInteraction);
      window.removeEventListener("scroll", resetInteraction);
      clearTimeout(timeout);
    };
  }, [isLoaded]);

  // To avoid any blink or empty states until loaded, return null until isLoaded
  if (!isLoaded) return null;

  return (
    <main className="max-w-[680px] mx-auto px-4 sm:px-0 py-16">
      <Header tasks={tasks} />
      
      <TaskInput onAdd={addTask} tasks={tasks} />

      {activeTasks.length > 0 && (
        <div className="w-full mt-16 mb-8 border-t-2 border-[#E5E0D8] pt-8">
          <h2 className="text-3xl font-sans font-bold text-primary tracking-tight">active.</h2>
        </div>
      )}

      <div className="flex-1 w-full">
        <AnimatePresence mode="popLayout">
          {activeTasks.map((task) => 
            task.permanent ? (
              <PermanentTask key={task.id} task={task} />
            ) : (
              <TaskCard 
                key={task.id} 
                task={task} 
                onDelete={deleteTask} 
              />
            )
          )}
        </AnimatePresence>
      </div>

      <Graveyard tasks={expiredTasks} onClear={clearGraveyard} />
      
      <InstallBanner />
      <NotificationPrompt />
      <DemoTool />
    </main>
  );
}
