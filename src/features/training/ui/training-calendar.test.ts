import { scheduleGridEntries } from "@/features/schedule/ui/components/calendar-grid/calendar-grid.entries";
import { describe, expect, it } from "vitest";
import type { TrainingActivityDto } from "../application/training-dto";
import {
  isBriefTrainingActivity,
  trainingActivityMinutes,
  trainingGridClock,
} from "./training-calendar";

function event(id: string, start: string, duration: number): TrainingActivityDto {
  return {
    id,
    type: "sport_practice",
    source: "plan",
    role: "primary",
    name: id,
    sport: null,
    status: "scheduled",
    plannedStartTime: start,
    plannedEndTime: null,
    plannedDurationMinutes: duration,
    actualStartTime: null,
    actualEndTime: null,
    actualDurationMinutes: null,
    startedAt: null,
    completedAt: null,
    accumulatedActiveSeconds: 0,
    currentIntervalStartedAt: null,
    intervals: [],
    intensity: null,
    energy: null,
    comment: null,
    revision: 0,
    structured: null,
    preparations: [],
  };
}

describe("geometria da grade", () => {
  it("não classifica como breve uma atividade longa recortada pela meia-noite", () => {
    const activity = {
      ...event("longa", "23:59", 30),
      status: "completed" as const,
      actualStartTime: "23:59",
      actualEndTime: "00:29",
      actualDurationMinutes: 30,
      intervals: [{ startedAt: "2026-11-11T02:59:50Z", endedAt: "2026-11-11T03:29:50Z" }],
    };
    expect(trainingActivityMinutes(activity)?.start).toBeCloseTo(1439 + 50 / 60);
    expect(trainingActivityMinutes(activity)?.end).toBe(1440);
    expect(isBriefTrainingActivity(activity)).toBe(false);
  });
  it("posiciona dez segundos registrados no minuto real sem reutilizar os 30 minutos previstos", () => {
    const short = {
      ...event("curto", "09:00", 30),
      status: "completed" as const,
      actualStartTime: "12:08",
      actualEndTime: "12:08",
      actualDurationMinutes: 0,
      accumulatedActiveSeconds: 10,
      intervals: [{ startedAt: "2026-11-10T15:08:20.000Z", endedAt: "2026-11-10T15:08:30.000Z" }],
    };
    const range = trainingActivityMinutes(short)!;
    expect(range.start).toBeCloseTo(728 + 20 / 60);
    expect(range.end - range.start).toBeCloseTo(10 / 60);
    expect(short.actualDurationMinutes).toBe(0);
    expect(short.accumulatedActiveSeconds).toBe(10);
  });
  it("usa os timestamps quando uma sessão curta cruza a fronteira do minuto e preserva pausas no intervalo visual", () => {
    const range = trainingActivityMinutes({
      ...event("curto", "09:00", 30),
      status: "completed",
      actualStartTime: "12:08",
      actualEndTime: "12:09",
      actualDurationMinutes: 1,
      accumulatedActiveSeconds: 5,
      intervals: [
        { startedAt: "2026-11-10T15:08:55Z", endedAt: "2026-11-10T15:08:57Z" },
        { startedAt: "2026-11-10T15:09:02Z", endedAt: "2026-11-10T15:09:05Z" },
      ],
    })!;
    expect(range.start).toBeCloseTo(728 + 55 / 60);
    expect(range.end - range.start).toBeCloseTo(10 / 60);
  });
  it("mantém horários corrigidos prioritários e não inventa duração para registros sem dados reais", () => {
    const saved = {
      ...event("corrigido", "09:00", 30),
      status: "completed" as const,
      actualStartTime: "14:00",
      actualEndTime: "14:10",
      actualDurationMinutes: 10,
      intervals: [{ startedAt: "2026-11-10T15:08:20Z", endedAt: "2026-11-10T15:08:30Z" }],
    };
    expect(trainingActivityMinutes(saved)).toEqual({ start: 840, end: 850 });
    expect(
      trainingActivityMinutes({ ...saved, actualDurationMinutes: 0, intervals: [] }),
    ).toBeNull();
    expect(
      trainingActivityMinutes({
        ...saved,
        actualDurationMinutes: 0,
        intervals: [],
        accumulatedActiveSeconds: 10,
      })?.end,
    ).toBeCloseTo(840 + 10 / 60);
  });
  it("separa sobreposições e reutiliza uma coluna quando um intervalo termina", () => {
    const positioned = scheduleGridEntries("2026-11-10", [
      event("a", "09:00", 120),
      event("b", "09:30", 30),
      event("c", "10:00", 60),
      event("d", "11:00", 30),
    ]);
    expect(positioned.map(({ lane, laneCount }) => [lane, laneCount])).toEqual([
      [0, 2],
      [1, 2],
      [1, 2],
      [0, 1],
    ]);
  });
  it("preserva 15 minutos sem expandir o intervalo sobre a atividade vizinha", () => {
    const positioned = scheduleGridEntries("2026-11-10", [
      event("a", "11:30", 15),
      event("b", "11:45", 15),
    ]);
    expect(positioned.map(({ start, end, laneCount }) => [start, end, laneCount])).toEqual([
      [690, 705, 1],
      [705, 720, 1],
    ]);
  });
  it("prioriza os valores registrados e limita o desenho ao fim do dia", () => {
    expect(
      trainingActivityMinutes({
        ...event("a", "09:00", 60),
        actualStartTime: "23:50",
        actualDurationMinutes: 20,
      }),
    ).toEqual({ start: 1430, end: 1440 });
    expect(
      trainingActivityMinutes({ ...event("b", "09:00", 60), plannedDurationMinutes: null }),
    ).toBeNull();
  });
  it("usa a data e o minuto de São Paulo na virada UTC", () => {
    expect(trainingGridClock(new Date("2026-11-11T01:08:00Z"))).toEqual({
      date: "2026-11-10",
      minute: 1328,
      label: "22:08",
    });
  });
});
