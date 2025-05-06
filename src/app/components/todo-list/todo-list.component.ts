import { Component, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TodoService } from '../../services/todo.service';
import { TodoItem, FilterType } from '../../models/todo-item.model';
import { Observable, BehaviorSubject, combineLatest } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { TodoItemComponent } from '../todo-item/todo-item.component';
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
    TaskListComponent, // Added
    TaskPaginationComponent // Added
  ],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TodoListComponent implements OnInit {
  private todoService = inject(TodoService); // Inject the service

  private filterSubject = new BehaviorSubject<FilterType>('all');
  private pageSubject = new BehaviorSubject<number>(1);
  private triggerRefresh = new BehaviorSubject<void>(undefined); // To trigger recalculation on add/delete

  filter$: Observable<FilterType> = this.filterSubject.asObservable();
  currentPage$: Observable<number> = this.pageSubject.asObservable();

  filteredTasks$: Observable<TodoItem[]> = combineLatest([
    this.todoService.tasks$,
    this.filterSubject,
    this.triggerRefresh
  ]).pipe(
    map(([tasks, filter]) => {
      console.log("Filtering tasks...", filter, tasks);
      if (filter === 'active') {
        return tasks.filter(task => !task.completed);
      } else if (filter === 'completed') {
        return tasks.filter(task => task.completed);
      } else {
        return [...tasks];
      }
    }),
    startWith([])
  );

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
    startWith([])
  );

  totalPages$: Observable<number> = this.filteredTasks$.pipe(
    map(filteredTasks => Math.max(1, Math.ceil(filteredTasks.length / this.itemsPerPage))),
    startWith(1)
  );

  itemsPerPage: number = 10;
  showDeleteConfirmation = false;
  taskToDeleteId: number | null = null;

  ngOnInit(): void {
    this.totalPages$.subscribe(totalPages => {
      if (this.pageSubject.getValue() > totalPages && totalPages > 0) { // Ensure totalPages is positive
        this.pageSubject.next(totalPages);
      } else if (totalPages === 0 && this.pageSubject.getValue() !== 1) { // Handle case where all tasks are deleted
        this.pageSubject.next(1);
      }
    });
  }

  toggleTaskCompletion(idToToggle: number): void {
    this.todoService.toggleTaskCompletion(idToToggle);
    this.triggerRefresh.next(); // Refresh to ensure correct filtering/pagination
  }

  addTask(text: string): void {
    this.todoService.addTask(text);
    this.triggerRefresh.next();
    // Potentially reset to first page if desired, or stay on current page
    // For now, let's stay on the current page or let the existing logic handle it
  }

  requestDeleteTask(idToDelete: number): void {
    this.taskToDeleteId = idToDelete;
    this.showDeleteConfirmation = true;
  }

  confirmDelete(): void {
    if (this.taskToDeleteId !== null) {
      this.todoService.deleteTask(this.taskToDeleteId);
      this.triggerRefresh.next();
      // Check if the current page becomes empty after deletion
      this.filteredTasks$.pipe(
        map(tasks => Math.max(1, Math.ceil(tasks.length / this.itemsPerPage))),
        // take(1) // Ensure this subscription is cleaned up if not using async pipe directly
      ).subscribe(totalPages => {
        if (this.pageSubject.getValue() > totalPages) {
          this.pageSubject.next(totalPages > 0 ? totalPages : 1);
        }
      });
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
    this.pageSubject.next(1); // Reset to first page on filter change
  }

  goToPage(page: number): void {
    // Ensure page is within valid bounds
    this.totalPages$.subscribe(totalPages => { // Need to subscribe to get the current totalPages
      const validPage = Math.max(1, Math.min(page, totalPages));
      if (this.pageSubject.getValue() !== validPage) {
        this.pageSubject.next(validPage);
      }
    }).unsubscribe(); // Unsubscribe immediately after getting the value
  }

  previousPage(): void {
    if (this.pageSubject.getValue() > 1) {
      this.goToPage(this.pageSubject.getValue() - 1);
    }
  }

  nextPage(): void {
    this.totalPages$.subscribe(totalPages => { // Need to subscribe to get the current totalPages
      if (this.pageSubject.getValue() < totalPages) {
        this.goToPage(this.pageSubject.getValue() + 1);
      }
    }).unsubscribe(); // Unsubscribe immediately after getting the value
  }
}