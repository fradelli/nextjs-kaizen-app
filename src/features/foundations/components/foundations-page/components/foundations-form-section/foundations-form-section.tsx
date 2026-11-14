import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@fradelli/ui/card";
import { Field, FieldDescription, FieldError, FieldLabel } from "@fradelli/ui/field";
import { Input } from "@fradelli/ui/input";

import { foundationsFormSectionStyles } from "./foundations-form-section.styles";
import { FoundationsControlsExample } from "../foundations-controls-example/foundations-controls-example";

export function FoundationsFormSection() {
  return (
    <section aria-labelledby="form-title">
      <Card>
        <CardHeader>
          <CardTitle>
            <h2 id="form-title">Campos e feedback</h2>
          </CardTitle>
          <CardDescription>Rótulo, ajuda e erro permanecem associados ao campo.</CardDescription>
        </CardHeader>
        <CardContent className={foundationsFormSectionStyles.grid}>
          <Field>
            <FieldLabel htmlFor="foundation-name">Nome de exemplo</FieldLabel>
            <Input
              id="foundation-name"
              aria-describedby="foundation-name-description"
              placeholder="Digite um texto"
            />
            <FieldDescription id="foundation-name-description">
              Exemplo neutro sem persistência.
            </FieldDescription>
          </Field>
          <Field data-invalid>
            <FieldLabel htmlFor="foundation-error">Campo com erro</FieldLabel>
            <Input
              id="foundation-error"
              aria-describedby="foundation-error-message"
              aria-invalid
              defaultValue="Valor inválido"
            />
            <FieldError id="foundation-error-message">Revise o valor informado.</FieldError>
          </Field>
          <FoundationsControlsExample />
        </CardContent>
      </Card>
    </section>
  );
}
