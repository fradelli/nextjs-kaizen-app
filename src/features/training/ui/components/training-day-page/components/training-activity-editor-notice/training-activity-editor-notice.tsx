"use client";
import { useTranslations } from "next-intl";

import { useEffect, useState } from "react";
import { Button } from "@fradelli/ui/button";
import { EDITOR_NOTICE_EVENT } from "@/features/training/ui/lib/training-activity-editor-draft/training-activity-editor-draft.utils";
export function TrainingActivityEditorNotice() {
  const t = useTranslations("training");

  const [message, setMessage] = useState("");
  useEffect(() => {
    const receive = (event: Event) => {
      const detail = (event as CustomEvent<unknown>).detail;
      if (
        detail &&
        typeof detail === "object" &&
        "message" in detail &&
        typeof detail.message === "string" &&
        detail.message.length <= 500
      )
        setMessage(detail.message);
    };
    window.addEventListener(EDITOR_NOTICE_EVENT, receive);
    return () => window.removeEventListener(EDITOR_NOTICE_EVENT, receive);
  }, []);
  return message ? (
    <div
      role="status"
      className="flex items-start justify-between gap-3 rounded-lg border border-border p-3 text-sm"
    >
      <p>{message}</p>
      <Button type="button" variant="ghost" size="sm" onClick={() => setMessage("")}>
        {t("closeNotice")}
      </Button>
    </div>
  ) : null;
}
