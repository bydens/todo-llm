import { Component, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-todo-add',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './todo-add.component.html',
  styleUrls: ['./todo-add.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TodoAddComponent {
  @Output() addTask = new EventEmitter<string>();
  newTaskText: string = '';

  onAddTask(): void {
    const text = this.newTaskText.trim();
    if (text) {
      this.addTask.emit(text);
      this.newTaskText = ''; // Clear input after emitting
    }
  }
}
