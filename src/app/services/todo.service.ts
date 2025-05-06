import { Injectable, signal, WritableSignal } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { TodoItem } from '../models/todo-item.model'; 

@Injectable({
  providedIn: 'root' 
})
export class TodoService {
  private readonly storageKey = 'angular_todo_tasks';
  private tasksSignal: WritableSignal<TodoItem[]> = signal<TodoItem[]>([]);

  
  public readonly tasks = this.tasksSignal.asReadonly();

  constructor() {
    this.loadTasks(); 
  }

  private loadTasks(): void {
    const storedTasks = localStorage.getItem(this.storageKey);
    const tasks = storedTasks ? (JSON.parse(storedTasks) as TodoItem[]) : [];
    this.tasksSignal.set(tasks);
  }

  private saveTasks(tasks: TodoItem[]): void {
    localStorage.setItem(this.storageKey, JSON.stringify(tasks));
    this.tasksSignal.set(tasks); 
  }

  addTask(text: string): void {
    if (text.trim() === '') return;
    const newTask: TodoItem = {
      id: Date.now(),
      text: text.trim(),
      completed: false,
    };
    this.tasksSignal.update(currentTasks => [...currentTasks, newTask]);
    localStorage.setItem(this.storageKey, JSON.stringify(this.tasksSignal())); 
  }

  toggleTaskCompletion(idToToggle: number): void {
    this.tasksSignal.update(currentTasks =>
      currentTasks.map(task =>
        task.id === idToToggle ? { ...task, completed: !task.completed } : task
      )
    );
    localStorage.setItem(this.storageKey, JSON.stringify(this.tasksSignal())); 
  }

  deleteTask(idToDelete: number): void {
    this.tasksSignal.update(currentTasks =>
      currentTasks.filter(task => task.id !== idToDelete)
    );
    localStorage.setItem(this.storageKey, JSON.stringify(this.tasksSignal())); 
  }

  
  getCurrentTasks(): TodoItem[] {
    return this.tasksSignal();
  }
}