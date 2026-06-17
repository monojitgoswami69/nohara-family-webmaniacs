import { Task } from "../lib/types";
import { isTaskExpired } from "../lib/taskUtils";

interface HeaderProps {
  tasks: Task[];
}

export default function Header({ tasks }: HeaderProps) {
  const now = Date.now();
  
  let active = 0;
  let expiringSoon = 0;
  let alreadyGone = 0;

  tasks.forEach((task) => {
    if (task.permanent) {
      active++;
    } else {
      const expired = isTaskExpired(task, now);
      if (expired) {
        alreadyGone++;
      } else {
        active++;
        const expiresAt = task.addedAt + task.lifespanDays * 24 * 60 * 60 * 1000;
        const timeRemaining = expiresAt - now;
        if (timeRemaining < 24 * 60 * 60 * 1000) {
          expiringSoon++;
        }
      }
    }
  });

  return (
    <header className="mb-12">
      <h1 className="text-6xl font-sans font-bold tracking-tighter mb-2">gone.</h1>
      <p className="text-sm text-primary mb-6">type slowly if you care about this</p>
      <p className="text-sm font-bold">
        <span className="text-accent">{active} active</span> &middot;{" "}
        <span className="text-warning">{expiringSoon} expiring soon</span> &middot;{" "}
        <span className="text-muted">{alreadyGone} already gone</span>
      </p>
    </header>
  );
}
