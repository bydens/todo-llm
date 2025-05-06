import { Component, HostBinding, input, InputSignal, output } from '@angular/core'; 
import { CommonModule } from '@angular/common';
import { TodoItem } from '../../models/todo-item.model'; 

@Component({
  selector: 'app-todo-item',
  standalone: true,
  imports: [CommonModule], 
  templateUrl: './todo-item.component.html',
  styleUrls: ['./todo-item.component.scss'],
  
})
export class TodoItemComponent {
  
  task: InputSignal<TodoItem> = input.required<TodoItem>();

  
  toggleCompletion = output<number>();
  requestDelete = output<number>();

  
  @HostBinding('class') get classes() {
    
    return `list-group-item d-flex justify-content-between align-items-center ${this.task().completed ? 'list-group-item-secondary' : ''}`;
  }
  @HostBinding('attr.data-task-id') get taskIdAttr() {
    return this.task().id; 
  }
  

  onToggle(): void {
    this.toggleCompletion.emit(this.task().id);
  }

  onDelete(): void {
    this.requestDelete.emit(this.task().id);
  }
}
