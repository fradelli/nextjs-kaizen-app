import type messages from "../../../../messages/en.json";
import { TRAINING_FEEDBACK_KEYS } from "./training-feedback-messages";

type FeedbackKey = keyof typeof messages.feedback;
type FeedbackTranslator = (key: FeedbackKey, values?: { date: string }) => string;

export function localizeTrainingFeedback(
  message: string,
  locale: string,
  translate: FeedbackTranslator,
  localizedClientMessages: readonly string[],
): string {
  if (Object.hasOwn(TRAINING_FEEDBACK_KEYS, message)) {
    return translate(TRAINING_FEEDBACK_KEYS[message]);
  }
  const dateLimit = /^Só é possível alterar a programação até (\d{4}-\d{2}-\d{2})\.$/.exec(message);
  if (dateLimit) return translate("futureDateLimit", { date: dateLimit[1] });
  if (locale === "pt-BR" || localizedClientMessages.includes(message)) return message;
  return translate("unknown");
}
