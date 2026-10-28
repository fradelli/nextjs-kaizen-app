import type { RefObject } from "react";
import type { TrainingActivityEditorProps } from "../training-activity-editor/training-activity-editor.types";
export type TrainingActivityEditorContentProps = TrainingActivityEditorProps &
  Readonly<{
    triggerRef: RefObject<HTMLButtonElement | null>;
    onClose: () => void;
    onCommitted: (targetCivilDate: string) => void;
  }>;
