"use client";
import { Button } from "@fradelli/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@fradelli/ui/dialog";
import { useTranslations } from "next-intl";
import { ScheduleSelect } from "../schedule-select/schedule-select";
import { useState } from "react";

export function ScheduleConfirm({
  kind,
  title,
  count,
  busy,
  close,
  confirm,
}: {
  kind: "move" | "delete";
  title: string;
  count: number;
  busy: boolean;
  close: () => void;
  confirm: (policy: "shift" | "keep" | "remove") => void;
}) {
  const t = useTranslations("schedule");
  const [policy, setPolicy] = useState<"shift" | "keep" | "remove">("keep");
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !busy) close();
      }}
    >
      <DialogContent
        showCloseButton={false}
        className="max-md:top-auto max-md:bottom-0 max-md:left-0 max-md:translate-x-0 max-md:translate-y-0 max-md:max-w-none max-md:rounded-b-none"
      >
        <DialogTitle>
          {t(kind === "move" ? "moveTitle" : "deleteTitle", { name: title })}
        </DialogTitle>
        <DialogDescription>{t("linked", { count })}</DialogDescription>
        {count > 0 && (
          <ScheduleSelect
            label={t("linkedPolicy")}
            value={policy}
            onChange={(value) => {
              if (value === "shift" || value === "keep" || value === "remove") setPolicy(value);
            }}
            disabled={busy}
            items={
              kind === "move"
                ? [
                    { value: "shift", label: t("shiftTimes") },
                    { value: "keep", label: t("keepTimes") },
                  ]
                : [
                    { value: "keep", label: t("keepOnCalendar") },
                    { value: "remove", label: t("removeFromCalendar") },
                  ]
            }
          />
        )}
        <DialogFooter>
          <Button variant="outline" disabled={busy} onClick={close}>
            {t("cancel")}
          </Button>
          <Button
            tone={kind === "delete" ? "danger" : "general"}
            disabled={busy}
            onClick={() => confirm(policy)}
          >
            {t(kind === "move" ? "move" : "delete")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
