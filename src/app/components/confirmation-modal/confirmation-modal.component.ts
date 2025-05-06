import { Component, output, input, InputSignal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirmation-modal',
  standalone: true,
  imports: [CommonModule], 
  templateUrl: './confirmation-modal.component.html',
  styleUrls: ['./confirmation-modal.component.scss'],
  
})
export class ConfirmationModalComponent {
  isOpen: InputSignal<boolean> = input<boolean>(false);
  title: InputSignal<string> = input<string>('Confirm Action');
  message: InputSignal<string> = input<string>('Are you sure?');
  confirmButtonText: InputSignal<string> = input<string>('Confirm');
  cancelButtonText: InputSignal<string> = input<string>('Cancel');

  confirm = output<void>();
  cancel = output<void>(); 

  onConfirm(): void {
    this.confirm.emit();
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
