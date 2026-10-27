"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";

import type { TrainingActionState, TrainingFormAction } from "../training-action.types";

const initialState: TrainingActionState = { status: "idle" };

export function useTrainingActionFeedback(
  action: TrainingFormAction,
  { refreshOnSaved = true }: { refreshOnSaved?: boolean } = {},
) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(action, initialState);

  useEffect(() => {
    if (refreshOnSaved && state.status === "saved") router.refresh();
  }, [router, state, refreshOnSaved]);

  return { state, formAction, pending };
}
