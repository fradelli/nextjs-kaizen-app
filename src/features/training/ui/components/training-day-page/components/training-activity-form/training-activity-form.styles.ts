import { trainingNativeSelectStyles } from "@/features/training/ui/training-native-select.styles";

export const trainingActivityFormStyles = {
  root: "grid min-w-0 gap-4 py-4",
  grid: "grid min-w-0 grid-cols-1 gap-4",
  field: "grid min-w-0 gap-2",
  wideField: "grid min-w-0 gap-2",
  label: "fd-text-label text-foreground",
  control: trainingNativeSelectStyles.control,
  hint: "fd-text-interface text-muted-foreground",
  error: "fd-text-interface text-status-destructive",
  actions: "flex flex-wrap items-center gap-3",
} as const;
