import { Component, Output, EventEmitter, input, InputSignal, computed, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-task-pagination',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './task-pagination.component.html',
  styleUrls: ['./task-pagination.component.scss'],
  // ChangeDetectionStrategy.OnPush is implicitly handled well with signals
})
export class TaskPaginationComponent {
  currentPage: InputSignal<number | null> = input<number | null>(1);
  totalPages: InputSignal<number | null> = input<number | null>(1);
  itemsPerPage: InputSignal<number> = input<number>(10);
  totalFilteredItems: InputSignal<number> = input<number>(0);


  @Output() previous = new EventEmitter<void>();
  @Output() next = new EventEmitter<void>();

  onPreviousPage(): void {
    this.previous.emit();
  }

  onNextPage(): void {
    this.next.emit();
  }

  showPagination: Signal<boolean> = computed(() => {
    return this.totalFilteredItems() > this.itemsPerPage();
  });
}
