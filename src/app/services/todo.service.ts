import { Injectable, signal, WritableSignal } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { TodoItem } from '../models/todo-item.model'; // Assuming you move the interface

@Injectable({
  providedIn: 'root' // Provide the service application-wide
})
export class TodoService {
  private readonly storageKey = 'angular_todo_tasks';
  private tasksSignal: WritableSignal<TodoItem[]> = signal<TodoItem[]>([]);

  // Expose tasks as a readonly signal
  public readonly tasks = this.tasksSignal.asReadonly();

  constructor() {
    this.loadTasks(); // Load tasks when the service is instantiated
  }

  private loadTasks(): void {
    const storedTasks = localStorage.getItem(this.storageKey);
    const tasks = storedTasks ? (JSON.parse(storedTasks) as TodoItem[]) : [];
    this.tasksSignal.set(tasks);
  }

  private saveTasks(tasks: TodoItem[]): void {
    localStorage.setItem(this.storageKey, JSON.stringify(tasks));
    this.tasksSignal.set(tasks); // Update the signal
  }

  addTask(text: string): void {
    if (text.trim() === '') return;
    const newTask: TodoItem = {
      id: Date.now(),
      text: text.trim(),
      completed: false,
    };
    this.tasksSignal.update(currentTasks => [...currentTasks, newTask]);
    localStorage.setItem(this.storageKey, JSON.stringify(this.tasksSignal())); // Save after update
  }

  toggleTaskCompletion(idToToggle: number): void {
    this.tasksSignal.update(currentTasks =>
      currentTasks.map(task =>
        task.id === idToToggle ? { ...task, completed: !task.completed } : task
      )
    );
    localStorage.setItem(this.storageKey, JSON.stringify(this.tasksSignal())); // Save after update
  }

  deleteTask(idToDelete: number): void {
    this.tasksSignal.update(currentTasks =>
      currentTasks.filter(task => task.id !== idToDelete)
    );
    localStorage.setItem(this.storageKey, JSON.stringify(this.tasksSignal())); // Save after update
  }

  // Optional: Method to get current tasks synchronously if needed elsewhere
  getCurrentTasks(): TodoItem[] {
    return this.tasksSignal();
  }
}