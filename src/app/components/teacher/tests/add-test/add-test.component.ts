import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { User } from '../../../../models/user';
import { StudentService } from '../../../../services/students/student.service';
import { Student } from '../../../../models/student';
import { GradeLevel } from '../../../../models/grade-level';
import { Test } from '../../../../models/test';
import { AuthService } from '../../../../services/auth/auth.service';
import { TestFactory } from '../../../../factories/test.factory';
import {TestService} from '../../../../services/tests/test.service';

@Component({
  selector: 'app-add-test',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule,FormsModule],
  templateUrl: './add-test.component.html',
  styleUrls: ['./add-test.component.css']
})
export class AddTestComponent implements OnInit {
  testForm: FormGroup;
  currentUser: User | null = null;
  successMessage: string = '';
  showSuccess: boolean = false;
  selectedStudents: { [groupIndex: number]: string[] } = {};
  isSubmitting: boolean = false;
  errorMessage: string = '';
  showError: boolean = false;
  students: Student[] = [];
  gameTypes = [
    { key: 'vertical_operations', label: 'Opérations Verticales' },
    { key: 'find_compositions', label: 'Trouver les Compositions' },
    { key: 'choose_answer', label: 'Choisir la Réponse' }
  ];


  studentSearch: { [groupIndex: number]: string } = {};
showStudentList: { [groupIndex: number]: boolean } = {};


  @Input() grade!: GradeLevel;
  @Output() close = new EventEmitter<void>();
  @Output() testCreated = new EventEmitter<Test>();

  constructor(
    private fb: FormBuilder,
    private studentService: StudentService,
    private authService: AuthService,
    private testService : TestService
  ) {
    this.testForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      grade: [''],
      duration: [30, [Validators.required, Validators.min(1), Validators.max(120)]],
      groups: this.fb.array([])
    });
  }

  ngOnInit() {
    this.authService.currentUser$.subscribe(
      (user)=>{
        this.currentUser = user;
      }
    )
    this.testForm.patchValue({ grade: this.grade });
    this.loadStudents();
    this.addGroup();
  }

  get groupsFormArray(): FormArray {
    return this.testForm.get('groups') as FormArray;
  }

  loadStudents() {
    this.studentService.getStudentsByGrade(this.grade).subscribe(students => {
      this.students = students;
    });
  }

  getAvailableStudentsForGroup(groupIndex: number): Student[] {
    const allSelectedStudents = this.getAllSelectedStudents();
    const currentGroupSelected = this.selectedStudents[groupIndex] || [];

    return this.students.filter(student =>
      !allSelectedStudents.includes(student.id) || currentGroupSelected.includes(student.id)
    );
  }

  getAllSelectedStudents(): string[] {
    const allSelected: string[] = [];
    Object.values(this.selectedStudents).forEach(studentIds => {
      allSelected.push(...studentIds);
    });
    return allSelected;
  }

  addGroup() {
    const groupIndex = this.groupsFormArray.length;

    const groupForm = this.fb.group({
      groupName: ['', Validators.required],
      configuredGames: this.fb.group({
        vertical_operations: this.createGameConfigForm(),
        find_compositions: this.createGameConfigForm(),
        choose_answer: this.createGameConfigForm()
      })
    });

    this.groupsFormArray.push(groupForm);
    this.selectedStudents[groupIndex] = [];
  }

  createGameConfigForm(): FormGroup {
    return this.fb.group({
      numOperations: [10, [Validators.required, Validators.min(1), Validators.max(50)]],
      numComposition:[1 , [Validators.required , Validators.min(1) , Validators.max(50)]],
      maxNumberRange: [100, [Validators.required, Validators.min(10), Validators.max(1000)]],
      requiredCorrectAnswersMinimumPercent: [70, [Validators.required, Validators.min(0), Validators.max(100)]],
      order: [1, [Validators.required, Validators.min(1), Validators.max(3)]]
   });
  }

  removeGroup(index: number) {
    if (this.groupsFormArray.length > 1) {
      this.groupsFormArray.removeAt(index);
      delete this.selectedStudents[index];
      this.reorganizeSelectedStudents(index);
    } else {
      this.showErrorMessage("Vous devez avoir au moins un groupe.");
    }
  }

  private reorganizeSelectedStudents(removedIndex: number) {
    const newSelectedStudents: { [groupIndex: number]: string[] } = {};

    Object.keys(this.selectedStudents).forEach(key => {
      const groupIndex = parseInt(key);
      if (groupIndex < removedIndex) {
        newSelectedStudents[groupIndex] = this.selectedStudents[groupIndex];
      } else if (groupIndex > removedIndex) {
        newSelectedStudents[groupIndex - 1] = this.selectedStudents[groupIndex];
      }
    });

    this.selectedStudents = newSelectedStudents;
  }

  getGroupFormGroup(index: number): FormGroup {
    return this.groupsFormArray.at(index) as FormGroup;
  }

  getConfiguredGamesFormGroup(groupIndex: number): FormGroup {
    return this.getGroupFormGroup(groupIndex).get('configuredGames') as FormGroup;
  }

  getGameConfigFormGroup(groupIndex: number, gameType: string): FormGroup {
    return this.getConfiguredGamesFormGroup(groupIndex).get(gameType) as FormGroup;
  }

  onSaveTest() {
    if (!this.isFormValid()) {
      return;
    }


  if (!this.hasUniqueOrdersInAllGroups()) {
    this.showErrorMessage("L'ordre des jeux doit être unique (1, 2, 3) dans chaque groupe.");
    return;
  }

    if (!this.currentUser) {
      this.showErrorMessage("Vous n'êtes plus connecté. Veuillez vous reconnecter.");
      return;
    }

    this.submitTest();
  }


  private hasUniqueOrdersInAllGroups(): boolean {
  const groups = this.testForm.value.groups;
  for (let i = 0; i < groups.length; i++) {
    const group = groups[i];
    const orders = [
      group.configuredGames.vertical_operations.order,
      group.configuredGames.find_compositions.order,
      group.configuredGames.choose_answer.order
    ];
    const uniqueOrders = Array.from(new Set(orders));
    if (uniqueOrders.length !== 3 || ![1, 2, 3].every(o => uniqueOrders.includes(o))) {
      return false;
    }
  }
  return true;
}

  private isFormValid(): boolean {
    if (this.testForm.invalid) {
      this.showErrorMessage("Veuillez remplir tous les champs requis.");
      this.testForm.markAllAsTouched();
      return false;
    }
    return true;
  }


  private submitTest() {
    this.isSubmitting = true;
    this.showError = false;

    const formValues = this.testForm.getRawValue();
    const testData = TestFactory.createTest(formValues, this.currentUser!.id, this.selectedStudents);

    setTimeout(() => {
      this.handleTestSuccess(testData);
    }, 1000);

    this.testService.createTest(testData);
  }

  private handleTestSuccess(test: Test) {
    this.showSuccessMessage(test);
    this.testCreated.emit(test);
    this.testForm.reset();
    this.isSubmitting = false;
  }

  showSuccessMessage(test: Test) {
    this.successMessage = `Le test "${test.title}" a été créé avec succès!`;
    this.showSuccess = true;
    this.showError = false;

    setTimeout(() => {
      this.showSuccess = false;
    }, 5000);
  }

  showErrorMessage(message: string) {
    this.errorMessage = message;
    this.showError = true;
    this.showSuccess = false;

    setTimeout(() => {
      this.showError = false;
    }, 7000);
  }

  closeModal() {
    this.close.emit();
  }

  onStudentSelectionChange(groupIndex: number, studentId: string, event: any) {
    if (!this.selectedStudents[groupIndex]) {
      this.selectedStudents[groupIndex] = [];
    }

    if (event.target.checked) {
      this.selectedStudents[groupIndex].push(studentId);
    } else {
      const index = this.selectedStudents[groupIndex].indexOf(studentId);
      if (index > -1) {
        this.selectedStudents[groupIndex].splice(index, 1);
      }
    }
  }

  isStudentSelected(groupIndex: number, studentId: string): boolean {
    return this.selectedStudents[groupIndex]?.includes(studentId) || false;
  }



  getSelectedStudentsCount(groupIndex: number): number {
    return this.selectedStudents[groupIndex]?.length || 0;
  }

toggleStudentList(groupIndex: number) {
  this.showStudentList[groupIndex] = !this.showStudentList[groupIndex];
}



getFilteredStudentsForGroup(groupIndex: number): Student[] {
  const search = (this.studentSearch[groupIndex] || '').toLowerCase();
  return this.getAvailableStudentsForGroup(groupIndex).filter(student =>
    student.firstName.toLowerCase().includes(search) ||
    student.lastName.toLowerCase().includes(search)
  );
}

areAllStudentsSelected(groupIndex: number): boolean {
  const filtered = this.getFilteredStudentsForGroup(groupIndex).map(s => s.id);
  const selected = this.selectedStudents[groupIndex] || [];
  return filtered.length > 0 && filtered.every(id => selected.includes(id));
}

toggleSelectAllStudents(groupIndex: number, event: any) {
  const filtered = this.getFilteredStudentsForGroup(groupIndex).map(s => s.id);
  if (event.target.checked) {
    this.selectedStudents[groupIndex] = Array.from(new Set([...(this.selectedStudents[groupIndex] || []), ...filtered]));
  } else {
    this.selectedStudents[groupIndex] = (this.selectedStudents[groupIndex] || []).filter(id => !filtered.includes(id));
  }
}
}
