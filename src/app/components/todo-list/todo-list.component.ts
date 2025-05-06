import { Component, inject, signal, computed, WritableSignal, Signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TodoService } from '../../services/todo.service';
import { TodoItem, FilterType } from '../../models/todo-item.model';
import { ConfirmationModalComponent } from '../confirmation-modal/confirmation-modal.component';
import { TodoAddComponent } from '../todo-add/todo-add.component';
import { TodoFilterComponent } from '../todo-filter/todo-filter.component';
import { TaskListComponent } from '../task-list/task-list.component'; // Added
import { TaskPaginationComponent } from '../task-pagination/task-pagination.component'; // Added

@Component({
  selector: 'app-todo-list',
  templateUrl: './todo-list.component.html',
  styleUrls: ['./todo-list.component.scss'],
  imports: [
    CommonModule,
    ConfirmationModalComponent,
    TodoAddComponent,
    TodoFilterComponent,
    TaskListComponent,
    TaskPaginationComponent
  ],
  standalone: true,
  // ChangeDetectionStrategy.OnPush is implicitly handled well with signals
})
export class TodoListComponent {
  private todoService = inject(TodoService);

  filter: WritableSignal<FilterType> = signal<FilterType>('all');
  currentPage: WritableSignal<number> = signal<number>(1);

  itemsPerPage: number = 10; // Can be a signal if dynamic

  showDeleteConfirmation: WritableSignal<boolean> = signal(false);
  taskToDeleteId: WritableSignal<number | null> = signal(null);

  filteredTasks: Signal<TodoItem[]> = computed(() => {
    const tasks = this.todoService.tasks();
    const currentFilter = this.filter();
    console.log("Filtering tasks...", currentFilter, tasks);
    if (currentFilter === 'active') {
      return tasks.filter(task => !task.completed);
    } else if (currentFilter === 'completed') {
      return tasks.filter(task => task.completed);
    }
    return [...tasks]; // Return a new array to ensure change detection if needed by consumers not using signals directly
  });

  totalPages: Signal<number> = computed(() => {
    return Math.max(1, Math.ceil(this.filteredTasks().length / this.itemsPerPage));
  });

  paginatedTasks: Signal<TodoItem[]> = computed(() => {
    const tasks = this.filteredTasks();
    const page = this.currentPage();
    const startIndex = (page - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    console.log("Paginating tasks...", page, startIndex, endIndex, tasks);
    return tasks.slice(startIndex, endIndex);
  });

  constructor() {
    // Effect to adjust current page if it becomes invalid due to task changes or filter changes.
    effect(() => {
      const current = this.currentPage();
      const total = this.totalPages();
      console.log(`Effect: currentPage: ${current}, totalPages: ${total}`);
      if (current > total && total > 0) {
        console.log(`Effect: Adjusting currentPage to ${total}`);
        this.currentPage.set(total);
      } else if (total === 0 && current !== 1) { // Handles case where all tasks are filtered out or deleted
        console.log(`Effect: Adjusting currentPage to 1 (no tasks/pages)`);
        this.currentPage.set(1);
      }
      // This effect also implicitly depends on this.filter() because totalPages depends on filteredTasks
    });
  }

  toggleTaskCompletion(idToToggle: number): void {
    this.todoService.toggleTaskCompletion(idToToggle);
  }

  addTask(text: string): void {
    this.todoService.addTask(text);
    // No need to reset page, effect will handle if necessary, or stay on current page.
  }

  requestDeleteTask(idToDelete: number): void {
    this.taskToDeleteId.set(idToDelete);
    this.showDeleteConfirmation.set(true);
  }

  confirmDelete(): void {
    const id = this.taskToDeleteId();
    if (id !== null) {
      this.todoService.deleteTask(id);
      // The effect will automatically adjust the page if needed.
    }
    this.closeModal();
  }

  cancelDelete(): void {
    this.closeModal();
  }

  private closeModal(): void {
    this.showDeleteConfirmation.set(false);
    this.taskToDeleteId.set(null);
  }

  setFilter(filter: FilterType): void {
    this.filter.set(filter);
    this.currentPage.set(1); // Reset to first page on filter change
  }

  goToPage(page: number): void {
    const total = this.totalPages();
    const validPage = Math.max(1, Math.min(page, total));
    if (this.currentPage() !== validPage) {
      this.currentPage.set(validPage);
    }
  }

  previousPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.update(p => p - 1);
    }
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update(p => p + 1);
    }
  }
}