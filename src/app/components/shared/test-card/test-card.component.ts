import {Component, Input} from '@angular/core';
import {Test} from '../../../models/test';

@Component({
  selector: 'app-test-card',
  imports: [],
  templateUrl: './test-card.component.html',
  styleUrl: './test-card.component.css',
  standalone:true
})
export class TestCardComponent {
  @Input() test! : Test;

}
