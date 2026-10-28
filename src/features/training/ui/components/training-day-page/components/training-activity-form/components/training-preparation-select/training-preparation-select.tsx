import { Field, FieldDescription, FieldLabel } from "@fradelli/ui/field";
import { trainingNativeSelectStyles } from "@/features/training/ui/training-native-select.styles";
import type { TrainingPreparationSelectProps } from "./training-preparation-select.types";

export function TrainingPreparationSelect({
  activity,
  availablePlan,
  value,
  onChange,
  disabled,
  allowKeep,
}: TrainingPreparationSelectProps) {
  const sessions =
    availablePlan?.sessions.filter((session) => session.assignmentRole === "preparation") ?? [];
  const id = `activity-preparation-${activity?.id ?? "new"}`;
  const current = activity?.preparationSession?.name ?? activity?.preparations[0]?.name;
  return (
    <Field className="grid min-w-0 gap-2">
      <FieldLabel htmlFor={id} className="fd-text-label text-foreground">
        Aquecimento
      </FieldLabel>
      <select
        id={id}
        name="preparationSessionId"
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        aria-describedby={`${id}-hint`}
        className={trainingNativeSelectStyles.control}
      >
        {!["keep", "automatic", "none"].includes(value) &&
        !sessions.some((session) => session.sessionId === value) ? (
          <option value={value} disabled>
            Aquecimento indisponível
          </option>
        ) : null}
        {allowKeep ? (
          <option value="keep">
            {current ? `Manter: ${current}` : "Manter configuração atual"}
          </option>
        ) : null}
        <option value="automatic">Automático pelo esporte</option>
        <option value="none">Sem aquecimento</option>
        {sessions.map((session) => (
          <option key={session.sessionId} value={session.sessionId}>
            {session.name}
          </option>
        ))}
      </select>
      <FieldDescription id={`${id}-hint`} className="fd-text-interface text-muted-foreground">
        {disabled
          ? "O aquecimento de uma atividade já iniciada será preservado."
          : value === "automatic"
            ? "Usa a associação do esporte no plano, quando disponível. Você também pode escolher um aquecimento."
            : value === "none"
              ? "Esta atividade será salva sem aquecimento."
              : "O aquecimento é opcional e não inicia nem conclui a atividade."}
      </FieldDescription>
    </Field>
  );
}
