"use client";
import { createContext, useCallback, useContext, useMemo } from "react";
import { useTranslations } from "next-intl";
import { toast, Toaster } from "@fradelli/ui/toast";
import { useScheduleEntities } from "./hooks/use-schedule-entities";
import { useScheduleMutations } from "./hooks/use-schedule-mutations";
import { useSchedulePanelState } from "./hooks/use-schedule-panel";
import type { SchedulePatch } from "../../../application/schedule-command";
import type { ScheduleWorkspaceProps } from "./schedule-workspace.types";
import { ScheduleEditorPanel } from "../schedule-editor-panel/schedule-editor-panel";

function useWorkspaceData(props: ScheduleWorkspaceProps, closeEditor: () => void) {
  const t = useTranslations("schedule");
  const report = useCallback(
    () => toast.add({ title: t("errors.unavailable"), type: "error" }),
    [t],
  );
  const entities = useScheduleEntities(props, report);
  const { onCalendarPatch } = props;
  const { applyPatch: applyEntityPatch } = entities;
  const applyPatch = useCallback(
    (patch: SchedulePatch) => {
      applyEntityPatch(patch);
      if (patch.calendar) onCalendarPatch?.(patch.calendar);
    },
    [applyEntityPatch, onCalendarPatch],
  );
  const mutations = useScheduleMutations({ mutate: props.mutate, applyPatch, closeEditor });
  const range = useMemo(
    () => ({
      ...props.range,
      reservations: props.range.reservations.map((row) => {
        const todo = entities.todoChanges.get(row.todoId);
        return todo && todo.revision >= row.todoRevision
          ? {
              ...row,
              title: todo.title,
              completed: todo.completedAt !== null,
              todoRevision: todo.revision,
            }
          : row;
      }),
    }),
    [props.range, entities.todoChanges],
  );
  const activitiesById = useMemo(
    () => new Map(range.activities.map((row) => [row.id, row])),
    [range.activities],
  );
  const reservationsById = useMemo(
    () => new Map(range.reservations.map((row) => [row.id, row])),
    [range.reservations],
  );
  const reservationsByParent = useMemo(() => {
    const map = new Map<string, typeof range.reservations>();
    for (const row of range.reservations) {
      if (row.parentActivityId) {
        const list = map.get(row.parentActivityId) ?? [];
        list.push(row);
        map.set(row.parentActivityId, list);
      }
    }
    return map;
  }, [range]);
  return {
    ...entities,
    ...mutations,
    range,
    reservationsByParent,
    activitiesById,
    reservationsById,
    date: props.date,
    requestTraining: props.requestTraining,
  };
}
const DataContext = createContext<ReturnType<typeof useWorkspaceData> | null>(null);
const PanelContext = createContext<ReturnType<typeof useSchedulePanelState> | null>(null);
const EditorActionContext = createContext<
  ReturnType<typeof useSchedulePanelState>["setEditor"] | null
>(null);
export function useScheduleData() {
  const value = useContext(DataContext);
  if (!value) throw new Error("ScheduleWorkspace is required");
  return value;
}
export function useSchedulePanel() {
  const value = useContext(PanelContext);
  if (!value) throw new Error("ScheduleWorkspace is required");
  return value;
}
export function useScheduleEditorAction() {
  const value = useContext(EditorActionContext);
  if (!value) throw new Error("ScheduleWorkspace is required");
  return value;
}
export function useScheduleWorkspace() {
  return { ...useScheduleData(), ...useSchedulePanel() };
}
export function ScheduleWorkspace(props: ScheduleWorkspaceProps) {
  const panel = useSchedulePanelState();
  const raw = useWorkspaceData(props, panel.closeEditor);
  const t = useTranslations("schedule");
  const {
    cache,
    version,
    todoChanges,
    lists,
    tags,
    upsertGroup,
    upsertTodo,
    applyPatch,
    loadTasks,
    loadMoreLists,
    pending,
    submit,
    saveMutation,
    range,
    reservationsByParent,
    activitiesById,
    reservationsById,
    date,
    requestTraining,
  } = raw;
  const data = useMemo(
    () => ({
      cache,
      version,
      todoChanges,
      lists,
      tags,
      upsertGroup,
      upsertTodo,
      applyPatch,
      loadTasks,
      loadMoreLists,
      pending,
      submit,
      saveMutation,
      range,
      reservationsByParent,
      activitiesById,
      reservationsById,
      date,
      requestTraining,
    }),
    [
      cache,
      version,
      todoChanges,
      lists,
      tags,
      upsertGroup,
      upsertTodo,
      applyPatch,
      loadTasks,
      loadMoreLists,
      pending,
      submit,
      saveMutation,
      range,
      reservationsByParent,
      activitiesById,
      reservationsById,
      date,
      requestTraining,
    ],
  );
  return (
    <DataContext.Provider value={data}>
      <PanelContext.Provider value={panel}>
        <EditorActionContext.Provider value={panel.setEditor}>
          {props.children}
          {panel.panelOpen && <ScheduleEditorPanel />}
          <Toaster closeLabel={t("close")} />
        </EditorActionContext.Provider>
      </PanelContext.Provider>
    </DataContext.Provider>
  );
}
