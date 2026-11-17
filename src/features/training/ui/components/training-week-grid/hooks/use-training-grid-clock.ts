"use client";
import { useEffect, useState } from "react";
import { trainingGridClock } from "../training-week-grid.utils";

export function useTrainingGridClock() {
  const [clock, setClock] = useState<ReturnType<typeof trainingGridClock> | null>(null);
  useEffect(() => {
    const update = () => setClock(trainingGridClock(new Date()));
    const initial = window.setTimeout(update, 0);
    const timer = window.setInterval(update, 30_000);
    document.addEventListener("visibilitychange", update);
    return () => {
      window.clearTimeout(initial);
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", update);
    };
  }, []);
  return clock;
}
