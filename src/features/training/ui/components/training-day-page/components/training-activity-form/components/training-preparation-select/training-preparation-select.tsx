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
    <div className="grid min-w-0 gap-1.5">
      <label className="text-sm font-medium text-foreground" htmlFor={id}>
        Aquecimento
      </label>
      <select
        id={id}
        name="preparationSessionId"
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        aria-describedby={`${id}-hint`}
        className="min-h-10 w-full min-w-0 rounded-md border border-input bg-background px-3 text-sm"
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
      <p id={`${id}-hint`} className="text-xs text-muted-foreground">
        {disabled
          ? "O aquecimento de uma atividade já iniciada será preservado."
          : value === "automatic"
            ? "Usa a associação do esporte no plano, quando disponível. Você também pode escolher um aquecimento."
            : value === "none"
              ? "Esta atividade será salva sem aquecimento."
              : "O aquecimento é opcional e não inicia nem conclui a atividade."}
      </p>
    </div>
  );
}
