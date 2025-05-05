import { Component, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
// Remove FormsModule if no longer needed directly in this component
import { CommonModule } from '@angular/common';
import { TodoService } from '../../services/todo.service';
import { TodoItem, FilterType } from '../../models/todo-item.model';
import { Observable, BehaviorSubject, combineLatest } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { TodoItemComponent } from '../todo-item/todo-item.component';
import { ConfirmationModalComponent } from '../confirmation-modal/confirmation-modal.component';
import { TodoAddComponent } from '../todo-add/todo-add.component'; // Import new component
import { TodoFilterComponent } from '../todo-filter/todo-filter.component'; // Import new component

@Component({
  selector: 'app-todo-list',
  templateUrl: './todo-list.component.html',
  styleUrls: ['./todo-list.component.scss'],
  imports: [
    // Remove FormsModule if not used
    CommonModule,
    TodoItemComponent,
    ConfirmationModalComponent,
    TodoAddComponent, // Add new component
    TodoFilterComponent // Add new component
  ],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TodoListComponent implements OnInit {
  private todoService = inject(TodoService); // Inject the service

  // --- State managed reactively ---
  private filterSubject = new BehaviorSubject<FilterType>('all');
  private pageSubject = new BehaviorSubject<number>(1);
  private triggerRefresh = new BehaviorSubject<void>(undefined); // To trigger recalculation on add/delete

  filter$: Observable<FilterType> = this.filterSubject.asObservable();
  currentPage$: Observable<number> = this.pageSubject.asObservable();

  // Derived state: Filtered Tasks
  filteredTasks$: Observable<TodoItem[]> = combineLatest([
    this.todoService.tasks$, // Get tasks from service
    this.filterSubject,
    this.triggerRefresh // Depend on refresh trigger
  ]).pipe(
    map(([tasks, filter]) => {
      console.log("Filtering tasks...", filter, tasks); // Debug log
      if (filter === 'active') {
        return tasks.filter(task => !task.completed);
      } else if (filter === 'completed') {
        return tasks.filter(task => task.completed);
      } else {
        return [...tasks]; // Return a new array copy
      }
    }),
    startWith([]) // Initial value
  );

  // Derived state: Paginated Tasks and Total Pages
  paginatedTasks$: Observable<TodoItem[]> = combineLatest([
    this.filteredTasks$,
    this.pageSubject
  ]).pipe(
    map(([filteredTasks, currentPage]) => {
      const startIndex = (currentPage - 1) * this.itemsPerPage;
      const endIndex = startIndex + this.itemsPerPage;
      console.log("Paginating tasks...", currentPage, startIndex, endIndex, filteredTasks); // Debug log
      return filteredTasks.slice(startIndex, endIndex);
    }),
    startWith([]) // Initial value
  );

  totalPages$: Observable<number> = this.filteredTasks$.pipe(
    map(filteredTasks => Math.max(1, Math.ceil(filteredTasks.length / this.itemsPerPage))),
    startWith(1) // Initial value
  );

  // --- Component UI State ---
  itemsPerPage: number = 10; // Keep pagination size in component
  showDeleteConfirmation = false;
  taskToDeleteId: number | null = null;

  // No need for ngOnInit if loading happens in service constructor and state is reactive

  ngOnInit(): void {
    // Optional: Subscribe to totalPages to potentially reset page if it becomes invalid
    // This logic might need refinement depending on exact requirements
    this.totalPages$.subscribe(totalPages => {
      if (this.pageSubject.getValue() > totalPages) {
        this.pageSubject.next(totalPages);
      }
    });
  }

  toggleTaskCompletion(idToToggle: number): void {
    this.todoService.toggleTaskCompletion(idToToggle);
    // No need to manually refresh, tasks$ emission will trigger updates
  }

  // loadTasks and saveTasks are removed, handled by the service

  // Updated addTask to accept text from the event
  addTask(text: string): void {
    this.todoService.addTask(text);
    this.triggerRefresh.next();
    // Consider pagination adjustment logic if needed
  }

  requestDeleteTask(idToDelete: number): void {
    this.taskToDeleteId = idToDelete;
    this.showDeleteConfirmation = true;
  }

  confirmDelete(): void {
    if (this.taskToDeleteId !== null) {
      this.todoService.deleteTask(this.taskToDeleteId);
      this.triggerRefresh.next(); // Trigger recalculation
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

  // Updated setFilter to accept filter from the event
  setFilter(filter: FilterType): void {
    this.filterSubject.next(filter);
    this.pageSubject.next(1); // Reset to first page when filter changes
  }

  // applyFiltersAndPagination is removed, handled reactively by observables

  goToPage(page: number): void {
    // Add check against current totalPages if needed, or rely on template disabling
    this.pageSubject.next(page);
  }

  previousPage(): void {
    this.goToPage(this.pageSubject.getValue() - 1);
  }

  nextPage(): void {
    this.goToPage(this.pageSubject.getValue() + 1);
  }
}