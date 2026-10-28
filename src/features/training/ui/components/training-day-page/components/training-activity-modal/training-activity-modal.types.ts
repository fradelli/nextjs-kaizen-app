import type { ReactNode, RefObject } from "react";
export type TrainingActivityModalProps = Readonly<{
  initialFocusRef?: RefObject<HTMLElement | null>;
  size?: "form" | "confirmation";
  closeLabel?: string;
  restoreFocusRef?: RefObject<HTMLElement | null>;
  title: string;
  description?: string;
  children: ReactNode;
  footer: ReactNode;
  busy: boolean;
  onRequestClose: () => void;
}>;
