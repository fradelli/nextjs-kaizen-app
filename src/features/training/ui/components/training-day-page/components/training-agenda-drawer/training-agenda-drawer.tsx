"use client";

import { Badge } from "@fradelli/ui/badge";
import { Button } from "@fradelli/ui/button";
import { isTrainingAgendaDateEditable } from "@/features/training/domain/training-edit-window";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@fradelli/ui/sheet";

import { TrainingActivityDeleteForm } from "../training-activity-delete-form/training-activity-delete-form";
import { TrainingActivityForm } from "../training-activity-form/training-activity-form";
import { trainingAgendaDrawerStyles } from "./training-agenda-drawer.styles";
import type { TrainingAgendaDrawerProps } from "./training-agenda-drawer.types";

const typeLabels = {
  structured_training: "Treino do plano",
  sport_practice: "Prática esportiva",
  specific_training: "Treino específico",
  mobility: "Mobilidade",
} as const;

export function TrainingAgendaDrawer({ day, actions }: TrainingAgendaDrawerProps) {
  if (!isTrainingAgendaDateEditable(day.civilDate)) return null;
  const availablePlan = "availablePlan" in day ? day.availablePlan : null;

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          className={trainingAgendaDrawerStyles.trigger}
          size="icon"
          aria-label="Gerenciar atividades do dia"
        >
          +
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        closeLabel="Fechar agenda"
        className={trainingAgendaDrawerStyles.content}
      >
        <SheetHeader>
          <SheetTitle>Agenda do dia</SheetTitle>
          <SheetDescription>Adicione, edite ou remova atividades desta data.</SheetDescription>
        </SheetHeader>
        <div className={trainingAgendaDrawerStyles.body}>
          <section className={trainingAgendaDrawerStyles.section}>
            <div>
              <h2 className={trainingAgendaDrawerStyles.title}>Atividades do dia</h2>
              <p className={trainingAgendaDrawerStyles.description}>
                Horários planejados podem ser corrigidos sem alterar o plano semanal.
              </p>
            </div>
            {day.activities.map((activity) => (
              <article key={activity.id} className={trainingAgendaDrawerStyles.item}>
                <div className={trainingAgendaDrawerStyles.itemHeading}>
                  <div>
                    <p className={trainingAgendaDrawerStyles.itemName}>{activity.name}</p>
                    <p className={trainingAgendaDrawerStyles.itemMetadata}>
                      {activity.plannedStartTime ?? "Horário a definir"}
                      {activity.plannedEndTime ? `–${activity.plannedEndTime}` : ""}
                      {activity.sport ? ` · ${activity.sport}` : ""}
                    </p>
                  </div>
                  <Badge variant="outline">{typeLabels[activity.type]}</Badge>
                </div>
                {activity.status !== "completed" ? (
                  <details className={trainingAgendaDrawerStyles.editor}>
                    <summary className={trainingAgendaDrawerStyles.editorSummary}>Editar</summary>
                    <TrainingActivityForm
                      key={`${day.civilDate}:${activity.id}`}
                      civilDate={day.civilDate}
                      activity={activity}
                      action={actions.updateActivity}
                      availablePlan={availablePlan}
                    />
                  </details>
                ) : (
                  <p className={trainingAgendaDrawerStyles.itemMetadata}>
                    Atividade concluída: horários e definição ficam preservados.
                  </p>
                )}
                <TrainingActivityDeleteForm
                  civilDate={day.civilDate}
                  activity={activity}
                  action={actions.deleteActivity}
                />
              </article>
            ))}
            <details className={trainingAgendaDrawerStyles.add}>
              <summary className={trainingAgendaDrawerStyles.addSummary}>
                Adicionar atividade
              </summary>
              <TrainingActivityForm
                key={`${day.civilDate}:new`}
                civilDate={day.civilDate}
                action={actions.addActivity}
                availablePlan={availablePlan}
              />
            </details>
          </section>
          {"planId" in day ? (
            <details className={trainingAgendaDrawerStyles.editor}>
              <summary className={trainingAgendaDrawerStyles.editorSummary}>
                Detalhes do plano
              </summary>
              <p className={trainingAgendaDrawerStyles.itemMetadata}>
                Plano {day.planId} · versão {day.planVersion}
              </p>
            </details>
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  );
}
