import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Teacher } from '../../../models/teacher';
import {ModifyStudentORTeacherComponent} from "../modify-student_OR_teacher/modify-student-OR-teacher.component";
import {DeleteUserComponent} from '../delete-user/delete-user.component';
import {AuthService} from '../../../services/auth/auth.service';

@Component({
  selector: 'app-teacher-card',
  standalone: true,
  imports: [CommonModule, ModifyStudentORTeacherComponent, DeleteUserComponent],
  templateUrl: './teacher-card.component.html',
  styleUrl: './teacher-card.component.css',
})
export class TeacherCardComponent {
  @Input() teacher: Teacher | null = null;
  showModifyModalTeacher = false;

  teacherToModify : Teacher | null = null;
  showDeleteUserModal: boolean = false;
  teacherToDelete! :Teacher ;
  @Output()teacherDeleted = new EventEmitter<string>();

  constructor(private  authService:AuthService) {
  }

  calculateAge(dateOfBirth: string): number {
    if (!dateOfBirth) return 0;

    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  }

  editTeacherClick(teacher: Teacher) {
    this.teacherToModify = teacher;
    this.showModifyModalTeacher = true;
  }

  onTeacherModified($event: any) {
    this.teacher = $event;
    this.showModifyModalTeacher = false;
  }


  deleteTeacherClick(teacher: Teacher) {
    this.teacherToDelete = teacher;
    this.showDeleteUserModal = true;
  }


  onUserDeleted($event: boolean) {
    if($event){
      this.authService.deleteUser(this.teacherToDelete.id).subscribe(()=>{
        this.teacherDeleted.emit(this.teacherToDelete.id);
      });
    }
  }
}
