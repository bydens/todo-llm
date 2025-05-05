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

@Component({
  selector: 'app-todo-list',
  templateUrl: './todo-list.component.html',
  styleUrls: ['./todo-list.component.scss'],
  imports: [
    CommonModule,
    TodoItemComponent,
    ConfirmationModalComponent,
    TodoAddComponent,
    TodoFilterComponent
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
      if (this.pageSubject.getValue() > totalPages) {
        this.pageSubject.next(totalPages);
      }
    });
  }

  toggleTaskCompletion(idToToggle: number): void {
    this.todoService.toggleTaskCompletion(idToToggle);
  }

  addTask(text: string): void {
    this.todoService.addTask(text);
    this.triggerRefresh.next();
  }

  requestDeleteTask(idToDelete: number): void {
    this.taskToDeleteId = idToDelete;
    this.showDeleteConfirmation = true;
  }

  confirmDelete(): void {
    if (this.taskToDeleteId !== null) {
      this.todoService.deleteTask(this.taskToDeleteId);
      this.triggerRefresh.next();
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
    this.pageSubject.next(1);
  }

  goToPage(page: number): void {
    this.pageSubject.next(page);
  }

  previousPage(): void {
    this.goToPage(this.pageSubject.getValue() - 1);
  }

  nextPage(): void {
    this.goToPage(this.pageSubject.getValue() + 1);
  }
}