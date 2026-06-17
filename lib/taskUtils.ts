import { Task } from "./types";
import { MS_IN_DAY, MS_IN_HOUR } from "./constants";

export function getLifeRemainingMs(task: Task, now: number): number {
  if (task.permanent) return Infinity;
  const expiresAt = task.addedAt + task.lifespanDays * MS_IN_DAY;
  return Math.max(0, expiresAt - now);
}

export function isTaskExpired(task: Task, now: number): boolean {
  if (task.permanent) return false;
  return getLifeRemainingMs(task, now) <= 0;
}

export function getLifePercentage(task: Task, now: number): number {
  if (task.permanent) return 100;
  const remainingMs = getLifeRemainingMs(task, now);
  const totalLifespanMs = task.lifespanDays * MS_IN_DAY;
  if (totalLifespanMs === 0) return 0;
  return Math.max(0, Math.min(100, (remainingMs / totalLifespanMs) * 100));
}

export function formatLifespanLabel(task: Task, now: number): string {
  if (task.permanent) return "∞";
  
  const remainingMs = getLifeRemainingMs(task, now);
  
  if (remainingMs <= 0) return "gone. it didn't matter in the end.";
  
  const hoursLeft = remainingMs / MS_IN_HOUR;
  const daysLeft = remainingMs / MS_IN_DAY;

  if (daysLeft > 3) {
    return `forgotten in ${Math.ceil(daysLeft)} days`;
  } else if (daysLeft > 1) {
    // 1 to 3 days
    return `forgotten in ${Math.ceil(daysLeft)} days`;
  } else if (daysLeft > 0.5) { // between 12h and 24h
    return "forgotten tomorrow";
  } else if (hoursLeft >= 6) {
    return "forgotten tonight";
  } else {
    return "forgotten in hours";
  }
}

export function formatDateAdded(addedAt: number): string {
  const date = new Date(addedAt);
  const formatter = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  return `added ${formatter.format(date).toLowerCase()}`;
}
