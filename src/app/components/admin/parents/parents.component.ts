import { Component } from '@angular/core';
import { Parent } from '../../../models/parent';
import { User } from '../../../models/user';
import { UserService } from '../../../services/users/user.service';
import { ParentService } from '../../../services/parents/parent.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ParentCardComponent } from '../../shared/parent-card/parent-card.component';
import { Student } from '../../../models/student';
import { forkJoin, map } from 'rxjs';

@Component({
  selector: 'app-parents',
  imports: [CommonModule, FormsModule, ParentCardComponent],
  templateUrl: './parents.component.html',
  styleUrl: './parents.component.css',
})
export class ParentsComponent {
  parents: Parent[] = [];
  filteredparent: Parent[] = [];
  isLoading = true;

  // Pagination
  currentPage = 1;
  itemsPerPage = 3;
  totalPages = 1;

  // Filtres
  filters = {
    filsName: '',
    search: '',
  };

  constructor(
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.isLoading = true;

    this.userService.getParentWithChildren().subscribe({
      next: (parentsWithChildren: Parent[]) => {
        this.parents = parentsWithChildren;
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
}
