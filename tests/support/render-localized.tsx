import { NextIntlClientProvider } from "next-intl";
import { render as renderReact, renderHook as renderReactHook } from "@testing-library/react";
import type { RenderOptions, RenderHookOptions } from "@testing-library/react";
import type { ReactNode } from "react";
import messages from "../../messages/pt-BR.json";

export * from "@testing-library/react";

function LocalizedTest({ children }: { children: ReactNode }) {
  return (
    <NextIntlClientProvider locale="pt-BR" messages={messages} timeZone="America/Sao_Paulo">
      {children}
    </NextIntlClientProvider>
  );
}

export function render(ui: ReactNode, options?: RenderOptions) {
  return renderReact(ui, { wrapper: LocalizedTest, ...options });
}

export function renderHook<Result, Props>(
  callback: (props: Props) => Result,
  options?: RenderHookOptions<Props>,
) {
  return renderReactHook(callback, { wrapper: LocalizedTest, ...options });
}
