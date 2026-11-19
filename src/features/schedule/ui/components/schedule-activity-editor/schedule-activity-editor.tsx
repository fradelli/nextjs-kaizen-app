"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { Input } from "@fradelli/ui/input";
import { Button } from "@fradelli/ui/button";
import { Checkbox } from "@fradelli/ui/checkbox";
import { ScheduleSelect } from "../schedule-select/schedule-select";
import { ScheduleClock } from "../schedule-clock/schedule-clock";
import { ScheduleConfirm } from "../schedule-confirm/schedule-confirm";
import { useScheduleWorkspace } from "../schedule-workspace/schedule-workspace";
import type { ScheduleActivity } from "../schedule-workspace/schedule-workspace.types";
import { localParts, toInstant } from "../../schedule-format";
import { TagEditor } from "../tag-editor/tag-editor";
import type { ScheduleCommandInput } from "../../../application/schedule-command";

export function ScheduleActivityEditor({
  activity,
  date,
  initialStart,
  initialEnd,
}: {
  activity?: ScheduleActivity;
  date: string;
  initialStart?: string;
  initialEnd?: string;
}) {
  const s = useScheduleWorkspace();
  const t = useTranslations("schedule");
  const [title, setTitle] = useState(activity?.title ?? "");
  const [startDate, setStartDate] = useState(
    activity?.startsAt ? localParts(activity.startsAt).date : (activity?.scheduledDate ?? date),
  );
  const [endDate, setEndDate] = useState(
    activity?.endsAt ? localParts(activity.endsAt).date : date,
  );
  const [startTime, setStartTime] = useState(
    activity?.startsAt ? localParts(activity.startsAt).time : (initialStart ?? "09:00"),
  );
  const [endTime, setEndTime] = useState(
    activity?.endsAt ? localParts(activity.endsAt).time : (initialEnd ?? "10:00"),
  );
  const [untimed, setUntimed] = useState(Boolean(activity?.scheduledDate));
  const [tag, setTag] = useState(activity?.tagId ?? "neutral");
  const [confirmation, setConfirmation] = useState<"delete" | "move" | null>(null);
  const [draft, setDraft] = useState<Extract<
    ScheduleCommandInput,
    { kind: "update_activity" }
  > | null>(null);
  const command = (): Extract<
    ScheduleCommandInput,
    { kind: "create_activity" | "update_activity" }
  > => {
    const fields = {
      title,
      tagId: tag === "neutral" ? null : tag,
      scheduledDate: untimed ? startDate : null,
      startsAt: untimed ? null : toInstant(startDate, startTime),
      endsAt: untimed ? null : toInstant(endDate, endTime),
    };
    return activity
      ? {
          kind: "update_activity",
          activityId: activity.id,
          expectedRevision: activity.revision,
          policy: "keep",
          ...fields,
        }
      : { kind: "create_activity", ...fields };
  };
  return (
    <>
      <div className="mb-3 pr-8">
        <ScheduleSelect
          label={t("tag")}
          value={tag}
          onChange={(value) => {
            if (value === "plan") {
              s.setEditor(null);
              s.requestTraining?.(startDate, startTime, endTime);
            } else setTag(value);
          }}
          items={[
            { value: "neutral", label: t("activity") },
            ...(!activity && s.requestTraining ? [{ value: "plan", label: t("planWorkout") }] : []),
            ...s.tags.map((item) => ({ value: item.id, label: item.name })),
            { value: "new", label: t("newTag") },
          ]}
        />
      </div>
      {tag === "new" ? (
        <TagEditor />
      ) : (
        <form
          className="flex flex-col gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            const data = command();
            if (
              data.kind === "update_activity" &&
              activity?.startsAt &&
              data.startsAt !== activity.startsAt &&
              activity.linkedCount > 0
            ) {
              setDraft(data);
              setConfirmation("move");
            } else s.submit(data);
          }}
        >
          <Input
            aria-label={t("title")}
            placeholder={t("activityTitle")}
            required
            maxLength={200}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
          <Input
            type="date"
            aria-label={t("startDate")}
            required
            value={startDate}
            onChange={(event) => setStartDate(event.target.value)}
          />
          <label className="flex items-center gap-2">
            <Checkbox checked={untimed} onCheckedChange={setUntimed} />
            {t("withoutTime")}
          </label>
          {!untimed && (
            <>
              <div className="grid grid-cols-2 gap-2">
                <ScheduleClock label={t("startTime")} value={startTime} onChange={setStartTime} />
                <ScheduleClock label={t("endTime")} value={endTime} onChange={setEndTime} />
              </div>
              <Input
                type="date"
                aria-label={t("endDate")}
                required
                value={endDate}
                onChange={(event) => setEndDate(event.target.value)}
              />
            </>
          )}
          <div className="flex justify-end gap-2 border-b border-border pb-3">
            <Button
              type="button"
              variant="ghost"
              disabled={s.pending}
              onClick={() => s.setEditor(null)}
            >
              {t("cancel")}
            </Button>
            {activity && (
              <Button
                type="button"
                variant="ghost"
                tone="danger"
                disabled={s.pending}
                onClick={() => setConfirmation("delete")}
              >
                {t("delete")}
              </Button>
            )}
            <Button type="submit" tone="general" disabled={s.pending}>
              {t(activity ? "save" : "add")}
            </Button>
          </div>
        </form>
      )}
      {confirmation && activity && (
        <ScheduleConfirm
          kind={confirmation}
          title={activity.title}
          count={activity.linkedCount}
          busy={s.pending}
          close={() => setConfirmation(null)}
          confirm={(policy) => {
            if (confirmation === "delete")
              s.submit({
                kind: "delete_activity",
                activityId: activity.id,
                expectedRevision: activity.revision,
                policy: policy === "shift" ? "keep" : policy,
              });
            else if (draft && policy !== "remove") s.submit({ ...draft, policy });
          }}
        />
      )}
    </>
  );
}
