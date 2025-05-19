import {Component, OnInit} from '@angular/core';
import { UserService } from '../../../services/users/user.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ParentCardComponent } from '../../shared/parent-card/parent-card.component';
import {UserRole} from '../../../models/user-role';
import {AddUserComponent} from '../../shared/add-user/add-user.component';
import {ParentWithChildren} from '../../../models/parentWithChildreen';
import {ParentService} from '../../../services/parents/parent.service';
import {Subscription} from 'rxjs';
import {User} from '../../../models/user';

@Component({
  selector: 'app-parents',
  imports: [CommonModule, FormsModule, ParentCardComponent, AddUserComponent],
  templateUrl: './parents.component.html',
  styleUrl: './parents.component.css',
  standalone:true
})
export class ParentsComponent implements OnInit{
  parents: ParentWithChildren[] = [];
  filteredparent: ParentWithChildren[] = [];
  isLoading = true;

  // Pagination
  currentPage = 1;
  itemsPerPage = 6;
  totalPages = 1;

  // Filtres
  filters = {
    filsName: '',
    search: '',
  };

  showAddUserModal: boolean = false;
  private parentSub!:Subscription;

  constructor(
    private userService: UserService,private parentService:ParentService
  ) {}

  ngOnInit(): void {
    this.isLoading = true;
    this.parentService.loadParents();

    this.parentSub = this.parentService.parent$.subscribe({
      next: (parents:ParentWithChildren[]) => {
        this.parents = parents as ParentWithChildren[];
        this.filteredparent = [...this.parents];
        this.applyFilters();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des parents :', error);
        this.isLoading = false;
      },
    });
  }


  ngOnDestroy(): void {
    if (this.parentSub) {
      this.parentSub.unsubscribe();
    }
  }

  applyFilters(): void {
    const search = this.filters.search?.toLowerCase() || '';

    let filtered = [...this.parents];

    if (search) {
      filtered = filtered.filter((parent) => {
        const parentMatch =
          parent.firstName.toLowerCase().includes(search) ||
          parent.lastName.toLowerCase().includes(search);

        const childMatch = parent.children.some(
          (child) =>
            child.firstName.toLowerCase().includes(search) ||
            child.lastName.toLowerCase().includes(search)
        );

        return parentMatch || childMatch;
      });
    }

    // Mise à jour des résultats filtrés et de la pagination
    this.filteredparent = filtered;
    this.totalPages = Math.ceil(this.filteredparent.length / this.itemsPerPage);
    this.currentPage = 1;
  }

  resetFilters(): void {
    this.filters = {
      filsName: '',
      search: '',
    };
    this.applyFilters();
  }

  // Pagination
  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  getPageNumbers(): number[] {
    const pages = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  onAddParentClick() {
    this.showAddUserModal=true;
  }
  onUserAdded(user: User) {
    this.showAddUserModal = false;
    this.parentService.getParentWithChildrenFromUser(user).subscribe((parent) => {
      this.parents.unshift(parent);
      this.parentService.setParents([...this.parents]);
      this.applyFilters();
    });
  }


  protected readonly UserRole = UserRole;
}
