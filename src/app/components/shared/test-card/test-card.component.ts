import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Test } from '../../../models/test';
import { User } from '../../../models/user';
import { TestGroup } from '../../../models/test-group';
import { AuthService } from '../../../services/auth/auth.service';
import { TestService } from '../../../services/tests/test.service';
import { TestState } from '../../../models/test-state';

@Component({
  selector: 'app-test-card',
  templateUrl: './test-card.component.html',
  styleUrls: ['./test-card.component.css'],
  imports: [CommonModule],
  standalone: true
})
export class TestCardComponent implements OnInit {
  @Input() tests: Test[] = [];
  currentUser: User | null = null;
  showModal: boolean = false;
  selectedTest: Test | null = null;

  editingState: boolean = false;
  newState: TestState | null = null;
  showWarning: boolean = false;

  showDeleteConfirmModal: boolean = false;
  testToDelete: Test | null = null;
  isDeleting: boolean = false;
  deleteError: string | null = null;
  showStateMenu: boolean = false;


  protected readonly TestState = TestState; // Pour l'utilisation dans le template

  // Ajouter au constructeur
  constructor(private authService: AuthService, private testService: TestService) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe((user) => {
      this.currentUser = user;
    });
  }

  calculateTotalStudents(test: Test): number {
    if (!test?.groups) return 0;

    let totalStudents = 0;
    Object.values(test.groups).forEach((group) => {
      totalStudents += group.students?.length || 0;
    });

    return totalStudents;
  }

  countGroups(test: Test): number {
    if (!test?.groups) return 0;
    return Object.keys(test.groups).length;
  }

  getGroups(test: Test | null): TestGroup[] {
    if (!test?.groups) return [];
    return Object.values(test.groups);
  }

  openModal(test: Test) {
    this.selectedTest = test;
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.selectedTest = null;
  }

  hasGame(test: Test, gameType: 'vertical_operations' | 'find_compositions' | 'choose_answer'): boolean {
    if (!test?.groups) return false;

    return Object.values(test.groups).some((group) => {
      return !!group.configuredGames[gameType];
    });
  }

  startEditingState() {
    this.editingState = true;
    this.newState = this.selectedTest?.state || null;
    this.showWarning = false;
  }

  cancelEditingState() {
    this.editingState = false;
    this.newState = null;
    this.showWarning = false;
  }

  selectState(state: TestState) {
    this.newState = state;
    
    // Afficher un avertissement si le changement est important
    if (
      (this.selectedTest?.state === 'created' && state === 'completed') || 
      (this.selectedTest?.state === 'published' && state === 'created')
    ) {
      this.showWarning = true;
    } else {
      this.showWarning = false;
    }
  }

// Ajouter ces méthodes
confirmDeleteTest(test: Test) {
  this.testToDelete = test;
  this.showDeleteConfirmModal = true;
  this.deleteError = null;
}

cancelDeleteTest() {
  this.showDeleteConfirmModal = false;
  this.testToDelete = null;
  this.deleteError = null;
}

deleteTest() {
  if (!this.testToDelete) return;
  
  this.isDeleting = true;
  this.deleteError = null;
  
  this.testService.deleteTest(this.testToDelete.id).subscribe({
    next: () => {
      // La suppression a réussi
      this.isDeleting = false;
      this.showDeleteConfirmModal = false;
      this.testToDelete = null;
      
      // Le testService a déjà mis à jour la liste des tests
    },
    error: (error) => {
      this.isDeleting = false;
      this.deleteError = "Une erreur s'est produite lors de la suppression. Veuillez réessayer.";
      console.error('Error deleting test:', error);
    }
  });
}

// Mettre à jour la méthode updateTestState pour utiliser le service
updateTestState() {
  if (!this.selectedTest || !this.newState) return;
  
  this.testService.updateTestState(this.selectedTest.id, this.newState).subscribe({
    next: () => {
      // Important: Mettre à jour l'état du test sélectionné
      if (this.selectedTest) {
        this.selectedTest.state = this.newState!;
      }
      this.cancelEditingState();
    },
    error: (error) => {
      console.error('Error updating test state:', error);
    }
  });
}


  toggleStateMenu(event: MouseEvent) {
  event.stopPropagation();
  this.showStateMenu = !this.showStateMenu;
  // Fermer le menu si on clique ailleurs
  if (this.showStateMenu) {
    setTimeout(() => {
      window.addEventListener('click', this.closeStateMenu);
    });
  }
}

closeStateMenu = () => {
  this.showStateMenu = false;
  window.removeEventListener('click', this.closeStateMenu);
};

changeState(state: TestState) {
  if (!this.selectedTest || this.selectedTest.state === state) {
    this.showStateMenu = false;
    return;
  }
  this.showStateMenu = false;
  this.newState = state;
  this.updateTestState();
}
}