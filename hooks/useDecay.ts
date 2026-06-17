import { useState, useEffect, useRef } from "react";
import { Task } from "../lib/types";
import { getLifePercentage, isTaskExpired } from "../lib/taskUtils";

export function useDecay(task: Task, onExpire?: () => void) {
  const [percentage, setPercentage] = useState(() => getLifePercentage(task, Date.now()));
  const [expired, setExpired] = useState(() => isTaskExpired(task, Date.now()));

  const onExpireRef = useRef(onExpire);
  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  useEffect(() => {
    if (task.permanent || expired) return;

    const checkDecay = () => {
      const now = Date.now();
      const newPercentage = getLifePercentage(task, now);
      const isNowExpired = isTaskExpired(task, now);

      setPercentage(newPercentage);
      
      if (isNowExpired) {
        setExpired(true);
        if (onExpireRef.current) onExpireRef.current();
      }
    };

    const interval = setInterval(checkDecay, 60000);
    checkDecay();

    return () => clearInterval(interval);
  }, [task.id, task.permanent, task.addedAt, expired]); // use stable task properties including addedAt for demo fast-forwards

  return { percentage, expired };
}
