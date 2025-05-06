import { Component, output, input, InputSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FilterType } from '../../models/todo-item.model';

@Component({
  selector: 'app-todo-filter',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './todo-filter.component.html',
  styleUrls: ['./todo-filter.component.scss'],
  
})
export class TodoFilterComponent {
  currentFilter: InputSignal<FilterType> = input.required<FilterType>();
  filterChange = output<FilterType>();

  readonly filters: FilterType[] = ['all', 'active', 'completed'];

  setFilter(filter: FilterType): void {
    this.filterChange.emit(filter);
  }
}
