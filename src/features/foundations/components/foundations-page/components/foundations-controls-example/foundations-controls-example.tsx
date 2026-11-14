"use client";

import { Button } from "@fradelli/ui/button";
import { Checkbox } from "@fradelli/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@fradelli/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@fradelli/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@fradelli/ui/dropdown-menu";
import { Field, FieldLabel } from "@fradelli/ui/field";
import { NativeSelect, NativeSelectOption } from "@fradelli/ui/native-select";

export function FoundationsControlsExample() {
  return (
    <div className="grid gap-4">
      <Field>
        <FieldLabel htmlFor="foundation-select">Seletor nativo disponível no pacote</FieldLabel>
        <NativeSelect id="foundation-select" defaultValue="one">
          <NativeSelectOption value="one">Primeira opção</NativeSelectOption>
          <NativeSelectOption value="two">Segunda opção</NativeSelectOption>
        </NativeSelect>
      </Field>
      <Field orientation="horizontal">
        <Checkbox id="foundation-checkbox" />
        <FieldLabel htmlFor="foundation-checkbox">Confirmação binária</FieldLabel>
      </Field>
      <div className="flex flex-wrap gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button tone="neutral" />}>
            Menu de comandos
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Comando de demonstração</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Dialog>
          <DialogTrigger render={<Button tone="general" />}>Abrir diálogo</DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Diálogo compartilhado</DialogTitle>
            </DialogHeader>
            <p>Feche com Escape e confira o retorno do foco ao botão.</p>
          </DialogContent>
        </Dialog>
      </div>
      <Collapsible>
        <CollapsibleTrigger render={<Button variant="outline" />}>
          Conteúdo recolhível
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-3">Exemplo sem persistência.</CollapsibleContent>
      </Collapsible>
    </div>
  );
}
