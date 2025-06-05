import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {User} from '../../../models/user';
import {ParentWithChildren} from '../../../models/parentWithChildreen';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import { AuthService } from '../../../services/auth/auth.service';
import { UserService } from '../../../services/users/user.service';
import {CommonModule} from '@angular/common';
import { ParentService } from '../../../services/parents/parent.service';


@Component({
  selector: 'app-modify-parent',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './modify-parent.component.html',
  styleUrl: './modify-parent.component.css',
  standalone : true
})
export class ModifyParentComponent implements OnInit , OnChanges   {
  @Input() parent!: ParentWithChildren | null;
  @Output() parentToModify = new EventEmitter<ParentWithChildren>();
  @Output() close = new EventEmitter<void>();


  currentUser: User | null = null;
  parentForm!: FormGroup;

  constructor(private fb: FormBuilder,
    private authService: AuthService,
    private userService: UserService,
    private parentService: ParentService) {}

  ngOnInit() {
    this.initForm();
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

    closeModal() {
      this.close.emit();
    }
    onSave() {
      if (this.parentForm.valid && this.parent) {

        let formValue = this.parentForm.value;

        const updated: ParentWithChildren = {
          ...this.parent,
          ...formValue
        };



        this.userService.updateUserProfile(updated).subscribe({
          next: (user) => {
            if (user) {
              this.parentService.getParentWithChildrenFromUser(user).subscribe({
                next: (parentWithChildren) => {
              this.parentToModify.emit(parentWithChildren as ParentWithChildren);
            this.closeModal();
            }


              });
      }
    },

          error: () => {
            this.closeModal();
          }
        });
      }
    }


    ngOnChanges(changes: SimpleChanges) {
    if (changes['parent'] && this.parent) {
      this.initForm();
    }
  }
  initForm() {
    this.parentForm = this.fb.group({
      firstName: [this.parent?.firstName || '', Validators.required],
      lastName: [this.parent?.lastName || '', Validators.required],
      dateOfBirth: [this.parent?.dateOfBirth || '', Validators.required],
      gender: [this.parent?.gender || '', Validators.required]
    });

    }

  }

