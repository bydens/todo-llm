import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

interface TodoItem {
  id: number;
  text: string;
  completed: boolean;
}

type FilterType = 'all' | 'active' | 'completed'; // Define filter types

@Component({
  selector: 'app-todo-list',
  templateUrl: './todo-list.component.html',
  styleUrls: ['./todo-list.component.scss'],
  imports: [FormsModule, CommonModule],
  standalone: true,
})
export class TodoListComponent implements OnInit {
  tasks: TodoItem[] = [];
  filteredTasks: TodoItem[] = []; // Tasks after filtering
  paginatedTasks: TodoItem[] = []; // Tasks for the current page
  newTaskText: string = '';
  private readonly storageKey = 'angular_todo_tasks';

  showDeleteConfirmation = false;
  taskToDeleteId: number | null = null;

  // Pagination properties
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 1;

  // Filter property
  currentFilter: FilterType = 'all';

  ngOnInit(): void {
    this.loadTasks();
  }

  toggleTaskCompletion(idToToggle: number): void {
    const task = this.tasks.find(t => t.id === idToToggle);
    if (task) {
      task.completed = !task.completed;
      this.saveTasks();
      this.applyFiltersAndPagination(); // Re-apply filter and pagination
    }
  }

  loadTasks(): void {
    const storedTasks = localStorage.getItem(this.storageKey);
    if (storedTasks) {
      this.tasks = JSON.parse(storedTasks);
    }
    this.applyFiltersAndPagination(); // Apply filter and pagination after loading
  }

  saveTasks(): void {
    localStorage.setItem(this.storageKey, JSON.stringify(this.tasks));
    // Filter/Pagination is handled separately after actions
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
    // Apply filter, then go to the last page of the potentially filtered list
    this.applyFiltersAndPagination();
    this.goToPage(this.totalPages);
  }

  requestDeleteTask(idToDelete: number): void {
    this.taskToDeleteId = idToDelete;
    this.showDeleteConfirmation = true;
  }

  confirmDelete(): void {
    if (this.taskToDeleteId !== null) {
      const taskIndex = this.tasks.findIndex(task => task.id === this.taskToDeleteId);
      if (taskIndex > -1) {
        this.tasks.splice(taskIndex, 1);
        this.saveTasks();
        this.applyFiltersAndPagination(); // Re-apply filter and pagination
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

  // --- Filter Method ---
  setFilter(filter: FilterType): void {
    this.currentFilter = filter;
    this.currentPage = 1; // Reset to first page when filter changes
    this.applyFiltersAndPagination();
  }

  // --- Combined Filter and Pagination Logic ---
  applyFiltersAndPagination(): void {
    // 1. Apply Filter
    if (this.currentFilter === 'active') {
      this.filteredTasks = this.tasks.filter(task => !task.completed);
    } else if (this.currentFilter === 'completed') {
      this.filteredTasks = this.tasks.filter(task => task.completed);
    } else {
      this.filteredTasks = [...this.tasks]; // Show all, create a copy
    }

    // 2. Apply Pagination to filtered list
    this.totalPages = Math.ceil(this.filteredTasks.length / this.itemsPerPage);
    if (this.totalPages === 0) {
      this.totalPages = 1; // Ensure at least one page even if empty
    }
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages; // Adjust if current page becomes invalid
    }
    if (this.currentPage < 1) {
      this.currentPage = 1; // Ensure current page is at least 1
    }


    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedTasks = this.filteredTasks.slice(startIndex, endIndex);
  }


  // --- Pagination Methods ---
  // updatePaginatedTasks is now replaced by applyFiltersAndPagination

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.applyFiltersAndPagination(); // Use the combined method
    }
  }

  previousPage(): void {
    this.goToPage(this.currentPage - 1);
  }

  nextPage(): void {
    this.goToPage(this.currentPage + 1);
  }
}