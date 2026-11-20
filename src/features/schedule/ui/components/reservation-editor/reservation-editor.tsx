"use client";
import { Button } from "@fradelli/ui/button";
import { useTranslations } from "next-intl";
import { useScheduleWorkspace } from "../schedule-workspace/schedule-workspace";
import type { ScheduleReservation } from "../schedule-workspace/schedule-workspace.types";
import { localParts } from "../../schedule-format";
export function ReservationEditor({ reservation }: { reservation: ScheduleReservation }) {
  const s = useScheduleWorkspace();
  const t = useTranslations("schedule");
  return (
    <div className="flex flex-col gap-3">
      <p className="font-medium">{reservation.title}</p>
      <p className="text-muted-foreground">
        {localParts(reservation.startsAt).time}–{localParts(reservation.endsAt).time}
      </p>
      <Button
        variant="outline"
        disabled={s.pending}
        onClick={() =>
          s.submit({
            kind: "remove_reservation",
            reservationId: reservation.id,
            expectedRevision: reservation.revision,
          })
        }
      >
        {t("unschedule")}
      </Button>
    </div>
  );
}
