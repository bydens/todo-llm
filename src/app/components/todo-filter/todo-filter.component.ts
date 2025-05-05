import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FilterType } from '../../models/todo-item.model';

@Component({
  selector: 'app-todo-filter',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './todo-filter.component.html',
  styleUrls: ['./todo-filter.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TodoFilterComponent {
  @Input({ required: true }) currentFilter!: FilterType;
  @Output() filterChange = new EventEmitter<FilterType>();

  readonly filters: FilterType[] = ['all', 'active', 'completed'];

  setFilter(filter: FilterType): void {
    this.filterChange.emit(filter);
  }
}
