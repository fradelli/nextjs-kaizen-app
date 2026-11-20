import type { TodoPage } from "../../../application/todo-list-page";
export type TodoInlineNameProps = {
  listId: string | null;
  todo?: TodoPage["items"][number];
  done: () => void;
};
