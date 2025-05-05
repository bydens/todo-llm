import { Component, OnInit, ChangeDetectionStrategy, inject } from '@angular/core'; // Import inject and ChangeDetectionStrategy
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TodoService } from '../../services/todo.service'; // Import the service
import { TodoItem, FilterType } from '../../models/todo-item.model'; // Import model and type
import { Observable, BehaviorSubject, combineLatest } from 'rxjs'; // Import RxJS features
import { map, startWith } from 'rxjs/operators'; // Import RxJS operators

@Component({
  selector: 'app-todo-list',
  templateUrl: './todo-list.component.html',
  styleUrls: ['./todo-list.component.scss'],
  imports: [FormsModule, CommonModule], // Keep CommonModule for async pipe
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush // Use OnPush for better performance with observables
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
  newTaskText: string = '';
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

  addTask(): void {
    this.todoService.addTask(this.newTaskText);
    this.newTaskText = '';
    this.triggerRefresh.next(); // Trigger recalculation
    // Reset to page 1 or go to last page? Going to last page is complex with reactive state.
    // Simplest is to stay on current page or go to 1. Let's go to 1 for simplicity here.
    // Or, subscribe to totalPages$ and go to the new last page after task is added.
    // For now, let's just trigger refresh. Pagination will adjust.
    // Consider going to the last page after add requires more complex RxJS logic
    // to wait for the tasks$ update and then update pageSubject.
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