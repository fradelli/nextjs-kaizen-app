import { NextIntlClientProvider } from "next-intl";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import english from "../../messages/en.json";
import portuguese from "../../messages/pt-BR.json";
import { resolveTrainingDayDate } from "@/features/training/application/resolve-training-day-date";
import { FeaturePlaceholder } from "@/components/shared/feature-placeholder/feature-placeholder";
import { TrainingDayPage } from "@/features/training/ui/components/training-day-page/training-day-page";
import { TrainingActivityCompletionForm } from "@/features/training/ui/components/training-day-page/components/training-activity-completion-form/training-activity-completion-form";
import { TrainingActionFeedback } from "@/features/training/ui/components/training-day-page/components/training-action-feedback/training-action-feedback";
import { formatTrainingShortDate } from "@/features/training/ui/components/training-day-page/training-day-page.utils";
import { createTranslator } from "next-intl";

afterEach(cleanup);

describe("localized training interface", () => {
  it.each([
    ["en", english, "Training", "Today", "Intensity", "Comment", "High"],
    ["pt-BR", portuguese, "Treino", "Hoje", "Intensidade", "Comentário", "Alta"],
  ] as const)(
    "renders dates, navigation and editable feedback in %s",
    (locale, messages, title, today, intensity, comment, high) => {
      let values = {
        intensity: "" as "" | "high",
        energy: "" as const,
        comment: "Anotação pessoal",
      };
      render(
        <NextIntlClientProvider locale={locale} messages={messages} timeZone="America/Sao_Paulo">
          <TrainingDayPage
            dateResolution={resolveTrainingDayDate({
              rawDate: "2026-09-16",
              now: new Date("2026-09-16T12:00:00Z"),
            })}
          >
            <FeaturePlaceholder
              title={messages.nutrition.title}
              headingId="nutrition-title"
              description={messages.nutrition.description}
            />
            <TrainingActivityCompletionForm
              id="feedback"
              mobility={false}
              disabled={false}
              values={values}
              onChange={(next) => {
                values = { ...values, intensity: next.intensity as "high" };
              }}
            />
          </TrainingDayPage>
        </NextIntlClientProvider>,
      );
      expect(screen.getByText(messages.common.initialStructure)).toBeInTheDocument();
      expect(screen.getByRole("heading", { name: title })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: today })).toBeDisabled();
      expect(screen.getByRole("textbox", { name: comment })).toHaveValue("Anotação pessoal");
      fireEvent.change(screen.getByRole("combobox", { name: intensity }), {
        target: { value: "high" },
      });
      expect(values.intensity).toBe("high");
      expect(screen.getByRole("option", { name: high })).toHaveValue("high");
      expect(
        screen.getByText(
          locale === "en"
            ? "Wednesday, September 16, 2026"
            : "quarta-feira, 16 de setembro de 2026",
        ),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("link", {
          name: locale === "en" ? "Open previous day" : "Abrir dia anterior",
        }),
      ).toHaveAttribute("href", "/treino?date=2026-09-15");
    },
  );
  it("localizes server feedback and plurals without changing units or civil dates", () => {
    render(
      <NextIntlClientProvider locale="en" messages={english}>
        <TrainingActionFeedback
          pending={false}
          state={{ status: "invalid", message: "Informe uma carga válida." }}
        />
      </NextIntlClientProvider>,
    );
    expect(screen.getByRole("alert")).toHaveTextContent("Enter a valid load.");
    const t = createTranslator({ locale: "en", messages: english, namespace: "training" });
    expect(t("setCount", { count: 1 })).toBe("1 set");
    expect(t("setCount", { count: 2 })).toBe("2 sets");
    expect(t("load", { unit: "kg" })).toBe("Load (kg)");
    expect(formatTrainingShortDate("2026-09-16", "en")).toBe("09/16/2026");
    expect(formatTrainingShortDate("2026-09-16", "pt-BR")).toBe("16/09/2026");
  });
});
