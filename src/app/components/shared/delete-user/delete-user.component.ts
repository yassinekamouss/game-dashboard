import {Component, EventEmitter, Input, Output} from '@angular/core';
import {User} from '../../../models/user';

@Component({
  selector: 'app-delete-user',
  imports: [],
  templateUrl: './delete-user.component.html',
  styleUrl: './delete-user.component.css',
  standalone:true
})
export class DeleteUserComponent {
  @Input() user! : User;
  @Output() userDeleted = new EventEmitter<boolean>();
  @Output() close = new EventEmitter<void>();


  closeModal() {
    this.close.emit();
  }

  confirmDelete() {
    this.userDeleted.emit(true);
    this.closeModal();
  }
}
