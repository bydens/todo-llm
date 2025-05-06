import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-task-pagination',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './task-pagination.component.html',
  styleUrls: ['./task-pagination.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaskPaginationComponent {
  @Input() currentPage: number | null = 1;
  @Input() totalPages: number | null = 1;
  @Input() itemsPerPage: number = 10; // Needed to decide if pagination should be shown
  @Input() totalFilteredItems: number = 0;


  @Output() previous = new EventEmitter<void>();
  @Output() next = new EventEmitter<void>();

  onPreviousPage(): void {
    this.previous.emit();
  }

  onNextPage(): void {
    this.next.emit();
  }

  get showPagination(): boolean {
    return this.totalFilteredItems > this.itemsPerPage;
  }
}
