import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Parent } from '../../../models/parent';
import {ParentWithChildren} from '../../../models/parentWithChildreen';
import {Student} from '../../../models/student';
import {ModifyStudentORTeacherComponent} from '../modify-student_OR_teacher/modify-student-OR-teacher.component';
import {ModifyParentComponent} from '../modify-parent/modify-parent.component';

@Component({
  selector: 'app-parent-card',
  standalone: true,
  imports: [CommonModule, ModifyParentComponent],
  templateUrl: './parent-card.component.html',
  styleUrl: './parent-card.component.css'
})
export class ParentCardComponent {
  @Input() parent: ParentWithChildren | null = null;
  parentToModify : ParentWithChildren | null = null;
  showModifyParentModal = false;


  editParentClick(parent :ParentWithChildren): void {
    this.parentToModify = parent;
    this.showModifyParentModal = true;

  }

  onParentModified($event: any) {
    this.parent = $event;
    this.showModifyParentModal = false;
  }

}
