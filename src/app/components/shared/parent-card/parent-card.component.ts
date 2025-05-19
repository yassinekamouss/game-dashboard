import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Parent } from '../../../models/parent';
import {ParentWithChildren} from '../../../models/parentWithChildreen';

@Component({
  selector: 'app-parent-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './parent-card.component.html',
  styleUrl: './parent-card.component.css'
})
export class ParentCardComponent {
  @Input() parent: ParentWithChildren | null = null;

}
