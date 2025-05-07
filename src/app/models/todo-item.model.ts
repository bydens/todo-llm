export interface TodoItem {
  id: string; // Firebase key, changed from number
  text: string;
  completed: boolean;
  createdAt: number; // Explicit timestamp for sorting
}

export type FilterType = 'all' | 'active' | 'completed';

// Интерфейс для Firebase
export interface FirebaseTodoItem {
  text: string;
  completed: boolean;
  createdAt: number;
}