import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, HostBinding } from '@angular/core'; // Import HostBinding
import { CommonModule } from '@angular/common';
import { TodoItem } from '../../models/todo-item.model'; // Adjust path if needed

@Component({
  selector: 'app-todo-item',
  standalone: true,
  imports: [CommonModule], // Needed for ngClass, ngIf etc.
  templateUrl: './todo-item.component.html',
  styleUrls: ['./todo-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TodoItemComponent {
  // Receive the task data from the parent
  @Input({ required: true }) task!: TodoItem;

  // Emit events when actions occur on this item
  @Output() toggleCompletion = new EventEmitter<number>();
  @Output() requestDelete = new EventEmitter<number>();

  // --- HostBindings to make the component behave like a list item ---
  @HostBinding('class') get classes() {
    return `list-group-item d-flex justify-content-between align-items-center ${this.task.completed ? 'list-group-item-secondary' : ''}`;
  }
  @HostBinding('attr.data-task-id') get taskIdAttr() {
    return this.task.id; // Optional: for easier debugging/testing
  }
  // --- End HostBindings ---

  onToggle(): void {
    this.toggleCompletion.emit(this.task.id);
  }

  onDelete(): void {
    this.requestDelete.emit(this.task.id);
  }
}
