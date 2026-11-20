import { useCallback, useEffect, useState } from "react";
import type { ScheduleEditor } from "../schedule-workspace.types";
export function useSchedulePanelState() {
  const [todoDraft, setTodoDraft] = useState<{ key: string; listId: string | null } | null>(null);
  const [groupDraft, setGroupDraft] = useState<string | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [editor, updateEditor] = useState<ScheduleEditor>(null);
  const setEditor = useCallback((next: ScheduleEditor) => {
    updateEditor(next);
    if (next) setPanelOpen(true);
  }, []);
  const closeEditor = useCallback(() => updateEditor(null), []);
  useEffect(() => {
    const select = (event: Event) => {
      const detail = (
        event as CustomEvent<{ civilDate: string; selectedPeriod: { start: string; end: string } }>
      ).detail;
      setEditor({ kind: "activity", date: detail.civilDate, ...detail.selectedPeriod });
    };
    const shortcut = (event: KeyboardEvent) => {
      const target = event.target instanceof Element ? event.target : null;
      if (
        event.defaultPrevented ||
        event.repeat ||
        target?.closest(
          'input, textarea, select, [contenteditable], [role="dialog"], [role="menu"]',
        )
      )
        return;
      if (event.ctrlKey && !event.metaKey && !event.altKey) {
        if (event.key.toLowerCase() === "b" && !event.shiftKey) {
          event.preventDefault();
          setPanelOpen((open) => !open);
          return;
        }
        if (event.key === "Enter") {
          event.preventDefault();
          setPanelOpen(true);
          if (event.shiftKey) setGroupDraft((draft) => draft ?? crypto.randomUUID());
          else setTodoDraft((draft) => draft ?? { key: crypto.randomUUID(), listId: null });
          return;
        }
      }
      if (event.key === "Escape") closeEditor();
      if (event.ctrlKey && event.code === "Slash") {
        event.preventDefault();
        setPanelOpen(true);
      }
    };
    window.addEventListener("schedule-select-period", select);
    window.addEventListener("keydown", shortcut);
    return () => {
      window.removeEventListener("schedule-select-period", select);
      window.removeEventListener("keydown", shortcut);
    };
  }, [setEditor, closeEditor]);
  return {
    todoDraft,
    setTodoDraft,
    groupDraft,
    setGroupDraft,
    panelOpen,
    setPanelOpen,
    editor,
    setEditor,
    closeEditor,
  };
}
