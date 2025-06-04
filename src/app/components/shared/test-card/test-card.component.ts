import {Component, Input, OnInit} from '@angular/core';
import {Test} from '../../../models/test';
import {DatePipe, KeyValuePipe, NgIf} from '@angular/common';
import {UserService} from '../../../services/users/user.service';
import {User} from '../../../models/user';
import {AuthService} from '../../../services/auth/auth.service';

@Component({
  selector: 'app-test-card',
  imports: [
    DatePipe,
    KeyValuePipe,
    NgIf
  ],
  templateUrl: './test-card.component.html',
  styleUrl: './test-card.component.css',
  standalone:true
})
export class TestCardComponent  implements  OnInit{
  @Input() test! : Test;
  currentUser : User | null = null;

  constructor(private authService: AuthService) {
  }


  ngOnInit(){
  this.authService.currentUser$.subscribe(user=>{
    this.currentUser = user;
  })
  }
}
