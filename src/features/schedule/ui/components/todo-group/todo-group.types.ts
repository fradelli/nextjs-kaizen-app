import type { TodoListPage } from "../../../application/todo-list-page";
export type TodoGroupProps = {
  list: TodoListPage["items"][number];
  initialEditing?: boolean;
  createOperationId?: string;
  onCreated?: (id: string) => void;
  virtual?: boolean;
};
