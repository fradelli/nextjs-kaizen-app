"use client";
import type { ScheduleColor } from "../../../domain/schedule-colors";
import { useState } from "react";
import { Input } from "@fradelli/ui/input";
import { Button } from "@fradelli/ui/button";
import { useTranslations } from "next-intl";
import { ScheduleSelect } from "../schedule-select/schedule-select";
import { useScheduleWorkspace } from "../schedule-workspace/schedule-workspace";
import { scheduleColors, isScheduleColor } from "../../../domain/schedule-colors";

export function TagEditor() {
  const s = useScheduleWorkspace();
  const t = useTranslations("schedule");
  const [selected, setSelected] = useState("new");
  const currentTag = s.tags.find((item) => item.id === selected);
  const [name, setName] = useState("");
  const [color, setColor] = useState<ScheduleColor>("purple");
  return (
    <form
      className="flex flex-col gap-3"
      onSubmit={(event) => {
        event.preventDefault();
        s.submit(
          currentTag
            ? {
                kind: "update_tag",
                tagId: currentTag.id,
                expectedRevision: currentTag.revision,
                name,
                colorKey: color,
              }
            : { kind: "create_tag", name, colorKey: color },
        );
      }}
    >
      {
        <ScheduleSelect
          label={t("tag")}
          value={selected}
          items={[
            { value: "new", label: t("newTag") },
            ...s.tags.map((item) => ({ value: item.id, label: item.name })),
          ]}
          onChange={(next) => {
            setSelected(next);
            const target = s.tags.find((item) => item.id === next);
            setName(target?.name ?? "");
            setColor(isScheduleColor(target?.colorKey) ? target.colorKey : "purple");
          }}
        />
      }
      <Input
        autoFocus
        aria-label={t("name")}
        placeholder={t("tagName")}
        value={name}
        disabled={Boolean(currentTag?.systemKey)}
        required
        maxLength={200}
        onChange={(event) => setName(event.target.value)}
      />
      <ScheduleSelect
        label={t("color")}
        value={color}
        onChange={(value) => {
          if (isScheduleColor(value)) setColor(value);
        }}
        items={[...scheduleColors.map((value) => ({ value, label: t(`colors.${value}`) }))]}
      />
      <Button type="submit" tone="general" disabled={s.pending}>
        {t(currentTag ? "save" : "add")}
      </Button>
    </form>
  );
}
