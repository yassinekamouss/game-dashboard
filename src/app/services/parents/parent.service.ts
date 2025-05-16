import { Injectable } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { Parent } from '../../models/parent';
import { from, Observable } from 'rxjs';
import { ref } from 'firebase/database';

@Injectable({
  providedIn: 'root'
})
export class ParentService {

  constructor(private authService :AuthService) { }
 
}
