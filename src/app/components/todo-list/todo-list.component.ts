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
  paginatedTasks: TodoItem[] = []; // Tasks for the current page
  newTaskText: string = '';
  private readonly storageKey = 'angular_todo_tasks';

  showDeleteConfirmation = false;
  taskToDeleteId: number | null = null;

  // Pagination properties
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 1;

  ngOnInit(): void {
    this.loadTasks();
  }

  toggleTaskCompletion(idToToggle: number): void {
    const task = this.tasks.find(t => t.id === idToToggle);
    if (task) {
      task.completed = !task.completed;
      this.saveTasks();
      // No need to update pagination if only completion status changes
    }
  }

  loadTasks(): void {
    const storedTasks = localStorage.getItem(this.storageKey);
    if (storedTasks) {
      this.tasks = JSON.parse(storedTasks);
    }
    this.updatePaginatedTasks(); // Update pagination after loading
  }

  saveTasks(): void {
    localStorage.setItem(this.storageKey, JSON.stringify(this.tasks));
    // No need to update pagination here directly, it's updated after add/delete
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
    this.goToPage(this.totalPages); // Go to the last page where the new task is
  }

  requestDeleteTask(idToDelete: number): void {
    this.taskToDeleteId = idToDelete;
    this.showDeleteConfirmation = true;
  }

  confirmDelete(): void {
    if (this.taskToDeleteId !== null) {
      const taskIndex = this.tasks.findIndex(task => task.id === this.taskToDeleteId);
      if (taskIndex > -1) {
        this.tasks.splice(taskIndex, 1); // Use splice for potential performance benefit
        this.saveTasks();

        // Adjust current page if the last item on the current page was deleted
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        if (startIndex >= this.tasks.length && this.currentPage > 1) {
          this.currentPage--;
        }
        this.updatePaginatedTasks(); // Update pagination after deleting
      }
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

  // --- Pagination Methods ---

  updatePaginatedTasks(): void {
    this.totalPages = Math.ceil(this.tasks.length / this.itemsPerPage);
    if (this.currentPage > this.totalPages && this.totalPages > 0) {
      this.currentPage = this.totalPages; // Adjust if current page becomes invalid
    }
    if (this.currentPage < 1 && this.totalPages > 0) {
      this.currentPage = 1; // Ensure current page is at least 1
    }
    if (this.tasks.length === 0) {
      this.totalPages = 1;
      this.currentPage = 1;
    }

    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedTasks = this.tasks.slice(startIndex, endIndex);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePaginatedTasks();
    }
  }

  previousPage(): void {
    this.goToPage(this.currentPage - 1);
  }

  nextPage(): void {
    this.goToPage(this.currentPage + 1);
  }
}