import { Component, Output, EventEmitter, input, InputSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FilterType } from '../../models/todo-item.model';

@Component({
  selector: 'app-todo-filter',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './todo-filter.component.html',
  styleUrls: ['./todo-filter.component.scss'],
  // ChangeDetectionStrategy.OnPush is implicitly handled well with signals
})
export class TodoFilterComponent {
  currentFilter: InputSignal<FilterType> = input.required<FilterType>();
  @Output() filterChange = new EventEmitter<FilterType>();

  readonly filters: FilterType[] = ['all', 'active', 'completed'];

  setFilter(filter: FilterType): void {
    this.filterChange.emit(filter);
  }
}
