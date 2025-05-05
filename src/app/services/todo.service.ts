// filepath: /Users/denysbykanov/Projects/angular/todo-llm/src/app/services/todo.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { TodoItem } from '../models/todo-item.model'; // Assuming you move the interface

@Injectable({
  providedIn: 'root' // Provide the service application-wide
})
export class TodoService {
  private readonly storageKey = 'angular_todo_tasks';
  private tasksSubject = new BehaviorSubject<TodoItem[]>([]);

  // Expose tasks as an Observable
  tasks$: Observable<TodoItem[]> = this.tasksSubject.asObservable();

  constructor() {
    this.loadTasks(); // Load tasks when the service is instantiated
  }

  private loadTasks(): void {
    const storedTasks = localStorage.getItem(this.storageKey);
    const tasks = storedTasks ? (JSON.parse(storedTasks) as TodoItem[]) : [];
    this.tasksSubject.next(tasks);
  }

  private saveTasks(tasks: TodoItem[]): void {
    localStorage.setItem(this.storageKey, JSON.stringify(tasks));
    this.tasksSubject.next(tasks); // Update the observable stream
  }

  addTask(text: string): void {
    if (text.trim() === '') return;
    const newTask: TodoItem = {
      id: Date.now(),
      text: text.trim(),
      completed: false,
    };
    const currentTasks = this.tasksSubject.getValue();
    this.saveTasks([...currentTasks, newTask]);
  }

  toggleTaskCompletion(idToToggle: number): void {
    const currentTasks = this.tasksSubject.getValue();
    const updatedTasks = currentTasks.map(task =>
      task.id === idToToggle ? { ...task, completed: !task.completed } : task
    );
    this.saveTasks(updatedTasks);
  }

  deleteTask(idToDelete: number): void {
    const currentTasks = this.tasksSubject.getValue();
    const updatedTasks = currentTasks.filter(task => task.id !== idToDelete);
    this.saveTasks(updatedTasks);
  }

  // Optional: Method to get current tasks synchronously if needed elsewhere, though observables are preferred
  getCurrentTasks(): TodoItem[] {
    return this.tasksSubject.getValue();
  }
}