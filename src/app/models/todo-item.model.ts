// filepath: /Users/denysbykanov/Projects/angular/todo-llm/src/app/models/todo-item.model.ts
export interface TodoItem {
  id: number;
  text: string;
  completed: boolean;
}

export type FilterType = 'all' | 'active' | 'completed';