import {TestGroup} from './test-group';
import {GradeLevel} from './grade-level';

export interface Test {
  id: string;
  title: string;
  createdBy: string;
  createdAt: string;
  duration: number; 
  grade: GradeLevel;
  groups: { [groupId: string]: TestGroup };
}

