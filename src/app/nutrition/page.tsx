import { useTranslations } from "next-intl";
import { FeaturePlaceholder } from "@/components/shared/feature-placeholder/feature-placeholder";

export default function DietPage() {
  const t = useTranslations("nutrition");
  return (
    <FeaturePlaceholder description={t("description")} headingId="diet-title" title={t("title")} />
  );
}
