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
})
export class TodoListComponent implements OnInit {
  tasks: TodoItem[] = [];
  newTaskText: string = '';
  private readonly storageKey = 'angular_todo_tasks';

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

  deleteTask(idToDelete: number): void {
    this.tasks = this.tasks.filter(task => task.id !== idToDelete);
    this.saveTasks();
  }
}