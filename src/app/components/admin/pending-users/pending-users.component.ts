import {Component, OnInit} from '@angular/core';
import {UserService} from '../../../services/users/user.service';
import {UserRole} from '../../../models/user-role';
import {User} from '../../../models/user';
import {CommonModule, DatePipe} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {UserFactory} from '../../../factories/user.factory';
import {GradeLevel} from '../../../models/grade-level';
import {Student} from '../../../models/student';
import {StudentService} from '../../../services/students/student.service';
import {FormValues} from '../../../models/form-values';

@Component({
  selector: 'app-pending-users',
  imports: [CommonModule, FormsModule, DatePipe],
  templateUrl: './pending-users.component.html',
  styleUrl: './pending-users.component.css',
  standalone: true
})
export class PendingUsersComponent implements OnInit {
  // Données utilisateurs
  pendingUsers: User[] = [];
  filteredUsers: User[] = [];
  studentsWithoutParent: Student[] = [];

  // État de l'interface
  isLoading: boolean = true;
  searchText: string = '';
  showRoleModal: boolean = false;

  // Données du modal
  selectedUser: User | null = null;
  selectedRole: UserRole | null = null;
  selectedGrade: GradeLevel | null = null;
  selectedChildren: string[] = [];
  availableGrades = Object.values(GradeLevel);

  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 6;
  totalPages: number = 1;

  constructor(
    private userService: UserService,
    private studentService: StudentService
  ) {}

  ngOnInit() {
    this.loadPendingUsers();
    this.loadStudentsWithoutParent();
  }

  loadPendingUsers() {
    this.isLoading = true;
    this.userService.getUsersByRole(UserRole.PENDING).subscribe(users => {
      this.pendingUsers = users;
      this.filteredUsers = [...this.pendingUsers];
      this.calculateTotalPages();
      this.isLoading = false;
    }, error => {
      console.error('Erreur lors du chargement des utilisateurs en attente:', error);
      this.isLoading = false;
    });
  }

  loadStudentsWithoutParent() {
    this.studentService.getStudentsWithoutParent().subscribe(students => {
      this.studentsWithoutParent = students;
    }, error => {
      console.error('Erreur lors du chargement des étudiants sans parent:', error);
    });
  }

  openRoleModal(user: User, role: UserRole) {
    this.selectedUser = user;
    this.selectedRole = role;
    this.selectedGrade = null;
    this.selectedChildren = [];
    this.showRoleModal = true;
  }

  closeRoleModal() {
    this.showRoleModal = false;
    this.selectedUser = null;
    this.selectedRole = null;
    this.selectedGrade = null;
    this.selectedChildren = [];
  }


  submitRoleAssignment() {
    if (!this.selectedUser || !this.selectedRole) {
      return;
    }
    const baseForm: FormValues = {
      email: this.selectedUser.email,
      firstName: this.selectedUser.firstName,
      lastName: this.selectedUser.lastName,
      dateOfBirth: this.selectedUser.dateOfBirth,
      gender: this.selectedUser.gender
    };

    let updatedUser;

    switch (this.selectedRole) {
      case UserRole.TEACHER:
      case UserRole.STUDENT:
        if (!this.selectedGrade) {
          alert('Veuillez sélectionner un niveau scolaire');
          return;
        }
        updatedUser = UserFactory.createUser(
          this.selectedUser.id,
          this.selectedRole,
          {
            ...baseForm,
            grade: this.selectedGrade
          }
        );

        break;

      case UserRole.PARENT:
        updatedUser = UserFactory.createUser(
          this.selectedUser.id,
          UserRole.PARENT,
          {
            ...baseForm,
            children: this.selectedChildren
          }
        );
        break;



      default:
        console.error('Rôle non géré:', this.selectedRole);
        return;
    }

    // Mettre à jour le profil utilisateur
    this.userService.updateFullUser(updatedUser).subscribe(
      () => {
        // Si c'est un parent, mettre à jour le parentId des étudiants sélectionnés
        if (this.selectedRole === UserRole.PARENT && this.selectedChildren.length > 0) {
          this.studentService.updateParentIdForStudents(this.selectedUser!.id, this.selectedChildren).subscribe(
            () => {
              console.log('Enfants associés au parent avec succès');
            },
            error => {
              console.error('Erreur lors de l\'association des enfants au parent:', error);
            }
          );
        }


        console.log(`Rôle de ${this.selectedUser!.firstName} ${this.selectedUser!.lastName} mis à jour avec succès en ${this.selectedRole}`);

        // Retirer l'utilisateur de la liste des pending users
        this.pendingUsers = this.pendingUsers.filter(u => u.id !== this.selectedUser!.id);
        this.applyFilters();

        // Fermer le modal
        this.closeRoleModal();

        // Afficher un message de confirmation (vous pouvez implémenter une notification toast)
      },
      error => {
        console.error('Erreur lors de la mise à jour du rôle:', error);
        // Afficher un message d'erreur (vous pouvez implémenter une notification toast)
      }
    );
  }

  toggleChildSelection(studentId: string) {
    const index = this.selectedChildren.indexOf(studentId);
    if (index > -1) {
      this.selectedChildren.splice(index, 1);
    } else {
      this.selectedChildren.push(studentId);
    }
  }

  isChildSelected(studentId: string): boolean {
    return this.selectedChildren.includes(studentId);
  }

  applyFilters() {
    if (!this.searchText.trim()) {
      this.filteredUsers = [...this.pendingUsers];
    } else {
      const searchTerm = this.searchText.toLowerCase().trim();
      this.filteredUsers = this.pendingUsers.filter(user => {
        return user.firstName.toLowerCase().includes(searchTerm) ||
          user.lastName.toLowerCase().includes(searchTerm) ||
          user.email.toLowerCase().includes(searchTerm);
      });
    }

    this.calculateTotalPages();
    this.currentPage = 1; // Revenir à la première page après filtrage
  }

  resetFilters() {
    this.searchText = '';
    this.filteredUsers = [...this.pendingUsers];
    this.calculateTotalPages();
    this.currentPage = 1;
  }

  // Méthodes de pagination
  calculateTotalPages() {
    this.totalPages = Math.ceil(this.filteredUsers.length / this.itemsPerPage);
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxPagesToShow = 5;

    if (this.totalPages <= maxPagesToShow) {
      // Afficher toutes les pages si le nombre total est inférieur ou égal au maximum
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Logique pour afficher un sous-ensemble de pages
      const halfMax = Math.floor(maxPagesToShow / 2);

      // Toujours afficher la première page
      pages.push(1);

      // Calculer la plage de pages à afficher
      let startPage = Math.max(2, this.currentPage - halfMax);
      let endPage = Math.min(this.totalPages - 1, this.currentPage + halfMax);

      // Ajuster startPage et endPage pour toujours afficher le même nombre de pages
      if (startPage <= 2) {
        endPage = Math.min(this.totalPages - 1, startPage + maxPagesToShow - 3);
      }
      if (endPage >= this.totalPages - 1) {
        startPage = Math.max(2, endPage - maxPagesToShow + 3);
      }

      // Ajouter un ellipsis après la première page si nécessaire
      if (startPage > 2) {
        pages.push(-1); // -1 représente "..."
      }

      // Ajouter les pages de la plage calculée
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      // Ajouter un ellipsis avant la dernière page si nécessaire
      if (endPage < this.totalPages - 1) {
        pages.push(-2); // -2 représente "..."
      }

      // Toujours afficher la dernière page
      pages.push(this.totalPages);
    }

    return pages;
  }
  protected readonly UserRole = UserRole;
}
