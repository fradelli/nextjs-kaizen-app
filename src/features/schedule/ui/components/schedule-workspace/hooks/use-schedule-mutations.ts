import { useCallback, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "@fradelli/ui/toast";
import type {
  ScheduleCommandInput,
  ScheduleCommand,
  ScheduleResult,
  ScheduleSaved,
  SchedulePatch,
} from "../../../../application/schedule-command";

type MutationOptions = {
  mutate: (command: ScheduleCommand) => Promise<ScheduleResult>;
  applyPatch: (patch: SchedulePatch) => void;
  closeEditor: () => void;
};
export function useScheduleMutations({ mutate, applyPatch, closeEditor }: MutationOptions) {
  const t = useTranslations("schedule");
  const [pendingCount, setPendingCount] = useState(0);
  const attempts = useRef(new Map<string, string>());
  const inFlight = useRef(new Map<string, Promise<ScheduleSaved | null>>());
  const execute = useCallback(
    (command: ScheduleCommandInput, operationId?: string): Promise<ScheduleSaved | null> => {
      const key = JSON.stringify(command);
      const id = operationId ?? attempts.current.get(key) ?? crypto.randomUUID();
      attempts.current.set(key, id);
      const running = inFlight.current.get(id);
      if (running) return running;
      setPendingCount((n) => n + 1);
      const promise = (async () => {
        try {
          const result = await mutate({ ...command, operationId: id });
          if (result.patch) applyPatch(result.patch);
          if (result.status !== "saved") {
            toast.add({
              title: t(
                result.status === "conflict"
                  ? "errors.conflict"
                  : result.code === "occupied"
                    ? "errors.occupied"
                    : "errors.invalid",
              ),
              type: "error",
            });
            if (result.status === "conflict") attempts.current.delete(key);
            return null;
          }
          attempts.current.delete(key);
          return result;
        } catch {
          toast.add({ title: t("errors.unavailable"), type: "error" });
          return null;
        } finally {
          inFlight.current.delete(id);
          setPendingCount((n) => n - 1);
        }
      })();
      inFlight.current.set(id, promise);
      return promise;
    },
    [mutate, applyPatch, t],
  );
  const submit = useCallback(
    (command: ScheduleCommandInput, close = true) => {
      void execute(command).then((result) => {
        if (result && close) closeEditor();
      });
    },
    [execute, closeEditor],
  );
  return { pending: pendingCount > 0, submit, saveMutation: execute };
}
