import {CommonModule} from '@angular/common';
import {Component, OnInit} from '@angular/core';
import {AuthService} from '../../../services/auth/auth.service';
import {User} from '../../../models/user';
import {UserRole} from '../../../models/user-role';

@Component({
  selector: 'app-rapports',
  imports: [CommonModule ],
  templateUrl: './rapports.component.html',
  styleUrl: './rapports.component.css',
  standalone: true
})
export class RapportsComponent  implements OnInit {

  constructor(private authService: AuthService) { }

  currentUser: User | null = null;


  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;

    });
  }


  isAdmin(){
    if(this.currentUser?.role === UserRole.ADMIN)
      return true;
    else
      return  false;
  }








}






