import { Parent } from './parent';
import { Student } from './student';

export interface ParentWithChildren extends Omit<Parent, 'children'> {
  children: Student[]; // Remplace les string[] par les objets
}
