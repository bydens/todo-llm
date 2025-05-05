import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

interface TodoItem {
  id: number;
  text: string;
  completed: boolean;
}

@Component({
  selector: 'app-todo-list',
  templateUrl: './todo-list.component.html',
  styleUrls: ['./todo-list.component.scss'],
  imports: [FormsModule, CommonModule],
  standalone: true,
})
export class TodoListComponent implements OnInit {
  tasks: TodoItem[] = [];
  newTaskText: string = '';
  private readonly storageKey = 'angular_todo_tasks';

  showDeleteConfirmation = false;
  taskToDeleteId: number | null = null;

  ngOnInit(): void {
    this.loadTasks();
  }

  toggleTaskCompletion(idToToggle: number): void {
    const task = this.tasks.find(t => t.id === idToToggle);
    if (task) {
      task.completed = !task.completed;
      this.saveTasks();
    }
  }

  loadTasks(): void {
    const storedTasks = localStorage.getItem(this.storageKey);
    if (storedTasks) {
      this.tasks = JSON.parse(storedTasks);
    }
  }

  saveTasks(): void {
    localStorage.setItem(this.storageKey, JSON.stringify(this.tasks));
  }

  addTask(): void {
    if (this.newTaskText.trim() === '') return;

    const newTask: TodoItem = {
      id: Date.now(),
      text: this.newTaskText.trim(),
      completed: false,
    };
    this.tasks.push(newTask);
    this.newTaskText = '';
    this.saveTasks();
  }

  requestDeleteTask(idToDelete: number): void {
    this.taskToDeleteId = idToDelete;
    this.showDeleteConfirmation = true;
  }

  confirmDelete(): void {
    if (this.taskToDeleteId !== null) {
      this.tasks = this.tasks.filter(task => task.id !== this.taskToDeleteId);
      this.saveTasks();
    }
    this.closeModal();
  }

  cancelDelete(): void {
    this.closeModal();
  }

  private closeModal(): void {
    this.showDeleteConfirmation = false;
    this.taskToDeleteId = null;
  }
}