import { Component, Output, EventEmitter, input, InputSignal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirmation-modal',
  standalone: true,
  imports: [CommonModule], // Needed for ngIf, ngClass etc.
  templateUrl: './confirmation-modal.component.html',
  styleUrls: ['./confirmation-modal.component.scss'],
  // ChangeDetectionStrategy.OnPush is implicitly handled well with signals
})
export class ConfirmationModalComponent {
  isOpen: InputSignal<boolean> = input<boolean>(false);
  title: InputSignal<string> = input<string>('Confirm Action');
  message: InputSignal<string> = input<string>('Are you sure?');
  confirmButtonText: InputSignal<string> = input<string>('Confirm');
  cancelButtonText: InputSignal<string> = input<string>('Cancel');

  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>(); // Emits on close button or cancel button

  onConfirm(): void {
    this.confirm.emit();
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
