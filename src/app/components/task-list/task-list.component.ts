import { Component, Output, EventEmitter, input, InputSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TodoItem } from '../../models/todo-item.model';
import { TodoItemComponent } from '../todo-item/todo-item.component';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule, TodoItemComponent],
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.scss'],
  // ChangeDetectionStrategy.OnPush is implicitly handled well with signals
})
export class TaskListComponent {
  tasks: InputSignal<TodoItem[]> = input<TodoItem[]>([]);
  currentFilter: InputSignal<string | null> = input<string | null>('all'); // To display appropriate empty state message

  @Output() toggleCompletion = new EventEmitter<number>();
  @Output() requestDelete = new EventEmitter<number>();

  onToggleCompletion(id: number): void {
    this.toggleCompletion.emit(id);
  }

  onRequestDelete(id: number): void {
    this.requestDelete.emit(id);
  }
}
