import { RestTrainingDay } from "../rest-training-day/rest-training-day";
import { TrainingDayFeedback } from "../training-day-feedback/training-day-feedback";
import { TrainingActivitySection } from "../training-activity-section/training-activity-section";
import type { TrainingDayContentProps } from "./training-day-content.types";

export async function TrainingDayContent({ result, actions }: TrainingDayContentProps) {
  const queryResult = await result;

  if (queryResult.status === "invalid_data") {
    return (
      <TrainingDayFeedback
        variant="destructive"
        title="Não foi possível resolver o treino"
        description={
          queryResult.reason === "reference_invalid"
            ? "Uma referência necessária do plano não foi encontrada. Nenhum dado parcial foi exibido."
            : "A definição ativa do treino está inconsistente. Nenhum dado parcial foi exibido."
        }
      />
    );
  }

  const { day } = queryResult;
  let content;

  switch (day.state) {
    case "unavailable":
      content = (
        <TrainingDayFeedback
          variant="warning"
          title="Plano de treino indisponível"
          description="O plano ativo não pôde ser carregado para esta data. Tente novamente mais tarde."
        />
      );
      break;
    case "unassigned":
      content = day.activities.length ? null : (
        <TrainingDayFeedback
          variant="info"
          title="Nenhuma atividade programada"
          description="Use o botão + para adicionar um treino ou outra atividade."
        />
      );
      break;
    case "rest":
      content = day.activities.length ? null : <RestTrainingDay day={day} actions={actions} />;
      break;
    case "training":
    case "mobility":
      content = day.activities.length ? null : (
        <TrainingDayFeedback
          variant="info"
          title="Nenhuma atividade programada"
          description="Use o botão + para adicionar um treino ou outra atividade."
        />
      );
      break;
  }

  return (
    <>
      {content}
      <TrainingActivitySection
        civilDate={day.civilDate}
        activities={day.activities}
        availablePlan={"availablePlan" in day ? day.availablePlan : null}
        actions={actions}
      />
    </>
  );
}
