/// <reference lib="webworker" />

export {};
declare var self: ServiceWorkerGlobalScope;

const activeTimers: Map<string, NodeJS.Timeout[]> = new Map();

const MS_IN_DAY = 1000 * 60 * 60 * 24;
const MS_IN_HOUR = 1000 * 60 * 60;

const MSG_24H = [
  "hey. '{taskText}' is about to forget you exist. just so you know.",
  "tomorrow, '{taskText}' disappears. you have been warned and will probably ignore this.",
  "24 hours until '{taskText}' gives up on you.",
  "gentle reminder that '{taskText}' has a deadline. not for completion. for existing.",
];

const MSG_1H = [
  "one hour. '{taskText}'. just saying.",
  "'{taskText}' is basically already gone. thought you should know.",
  "final call for '{taskText}'. after this, silence.",
  "'{taskText}' has stopped believing in you. 60 minutes left.",
];

const MSG_GONE = [
  "'{taskText}' is gone. it lived {n} days. it was not done.",
  "gone. '{taskText}' has left. no ceremony.",
  "'{taskText}' expired at {time}. pour one out or don't.",
];

function getRandomMessage(pool: string[], taskText: string, lifespanDays: number) {
  let msg = pool[Math.floor(Math.random() * pool.length)];
  msg = msg.replace(/{taskText}/g, taskText);
  msg = msg.replace(/{n}/g, lifespanDays.toString());
  
  const formatter = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  });
  msg = msg.replace(/{time}/g, formatter.format(new Date()).toLowerCase());
  
  return msg;
}

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SCHEDULE_TASK_NOTIFICATIONS") {
    const task = event.data.task;
    if (task.permanent) return;

    const expiresAt = task.addedAt + task.lifespanDays * MS_IN_DAY;
    const now = Date.now();
    
    // Clear existing timers for this task
    if (activeTimers.has(task.id)) {
      activeTimers.get(task.id)?.forEach(clearTimeout);
      activeTimers.delete(task.id);
    }

    const timers: NodeJS.Timeout[] = [];

    // 24 hour warning
    const timeUntil24h = expiresAt - MS_IN_DAY - now;
    if (timeUntil24h > 0) {
      timers.push(setTimeout(() => {
        self.registration.showNotification("gone.", {
          body: getRandomMessage(MSG_24H, task.text, task.lifespanDays),
          icon: "/icons/icon-192.png",
          badge: "/icons/icon-192.png",
        });
      }, timeUntil24h));
    }

    // 1 hour warning
    const timeUntil1h = expiresAt - MS_IN_HOUR - now;
    if (timeUntil1h > 0) {
      timers.push(setTimeout(() => {
        self.registration.showNotification("gone.", {
          body: getRandomMessage(MSG_1H, task.text, task.lifespanDays),
          icon: "/icons/icon-192.png",
          badge: "/icons/icon-192.png",
        });
      }, timeUntil1h));
    }

    // Expiry notification
    const timeUntilExpiry = expiresAt - now;
    if (timeUntilExpiry > 0) {
      timers.push(setTimeout(() => {
        self.registration.showNotification("gone.", {
          body: getRandomMessage(MSG_GONE, task.text, task.lifespanDays),
          icon: "/icons/icon-192.png",
          badge: "/icons/icon-192.png",
        });
        
        // Cleanup after firing
        activeTimers.delete(task.id);
      }, timeUntilExpiry));
    }

    activeTimers.set(task.id, timers);
  }

  if (event.data && event.data.type === "CANCEL_TASK_NOTIFICATIONS") {
    const taskId = event.data.taskId;
    if (activeTimers.has(taskId)) {
      activeTimers.get(taskId)?.forEach(clearTimeout);
      activeTimers.delete(taskId);
    }
  }
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      if (clientList.length > 0) {
        let client = clientList[0];
        for (let i = 0; i < clientList.length; i++) {
          if (clientList[i].focused) {
            client = clientList[i];
          }
        }
        return client.focus();
      }
      return self.clients.openWindow("/");
    })
  );
});
