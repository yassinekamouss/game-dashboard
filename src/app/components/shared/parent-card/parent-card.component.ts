import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Parent } from '../../../models/parent';
import {ParentWithChildren} from '../../../models/parentWithChildreen';
import {Student} from '../../../models/student';
import {ModifyStudentORTeacherComponent} from '../modify-student_OR_teacher/modify-student-OR-teacher.component';
import {ModifyParentComponent} from '../modify-parent/modify-parent.component';
import {DeleteUserComponent} from "../delete-user/delete-user.component";
import {AuthService} from '../../../services/auth/auth.service';

@Component({
  selector: 'app-parent-card',
  standalone: true,
    imports: [CommonModule, ModifyParentComponent, DeleteUserComponent],
  templateUrl: './parent-card.component.html',
  styleUrl: './parent-card.component.css'
})
export class ParentCardComponent {
  @Input() parent: ParentWithChildren | null = null;
  @Output() parentDeleted = new EventEmitter<string>();
  parentToModify : ParentWithChildren | null = null;
  showModifyParentModal = false;
  showDeleteUserModal: boolean = false;

  parentToDelete!:ParentWithChildren;

  constructor(private authService:AuthService) {
  }


  editParentClick(parent :ParentWithChildren): void {
    this.parentToModify = parent;
    this.showModifyParentModal = true;

  }

  onParentModified($event: any) {
    this.parent = $event;
    this.showModifyParentModal = false;
  }


  deleteParentClick(parent: ParentWithChildren) {
    this.parentToDelete = parent;
    this.showDeleteUserModal =true;
  }
  onUserDeleted($event: boolean) {
    if($event){
      this.authService.deleteUser(this.parentToDelete.id).subscribe(()=>{
        this.parentDeleted.emit(this.parentToDelete.id);
      });
    }
  }

}
