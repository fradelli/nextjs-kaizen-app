"use client";
import { createContext } from "react";
export const TrainingWorkoutOverlayContext = createContext<(() => void) | null>(null);
export const TrainingWorkoutPortalContext = createContext<HTMLElement | null>(null);
