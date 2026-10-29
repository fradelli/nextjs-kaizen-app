"use client";
import { useTranslations } from "next-intl";

import { Alert, AlertAction, AlertDescription, AlertTitle } from "@fradelli/ui/alert";
import { Button } from "@fradelli/ui/button";

import { trainingDayUnexpectedErrorStyles } from "./training-day-unexpected-error.styles";
import type { TrainingDayUnexpectedErrorProps } from "./training-day-unexpected-error.types";

export function TrainingDayUnexpectedError({ reset }: TrainingDayUnexpectedErrorProps) {
  const t = useTranslations("training");

  return (
    <section
      className={trainingDayUnexpectedErrorStyles.root}
      aria-labelledby="training-unexpected-error-title"
    >
      <Alert variant="destructive">
        <AlertTitle
          id="training-unexpected-error-title"
          className={trainingDayUnexpectedErrorStyles.title}
        >
          {t("loadFailed")}
        </AlertTitle>
        <AlertDescription>{t("unexpectedError")}</AlertDescription>
        <AlertAction>
          <Button type="button" onClick={reset}>
            {t("retry")}
          </Button>
        </AlertAction>
      </Alert>
    </section>
  );
}
