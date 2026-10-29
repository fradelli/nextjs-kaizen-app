import { useTranslations } from "next-intl";
import { Skeleton } from "@fradelli/ui/skeleton";

import { trainingDayLoadingStyles } from "./training-day-loading.styles";

export function TrainingDayLoading() {
  const t = useTranslations("training");

  return (
    <div
      className={trainingDayLoadingStyles.root}
      aria-label={t("loadingTraining")}
      aria-busy="true"
    >
      {[1, 2].map((item) => (
        <div key={item} className={trainingDayLoadingStyles.card}>
          <Skeleton className={trainingDayLoadingStyles.line} />
          <Skeleton className={trainingDayLoadingStyles.shortLine} />
          <Skeleton className={trainingDayLoadingStyles.bodyLine} />
        </div>
      ))}
    </div>
  );
}
