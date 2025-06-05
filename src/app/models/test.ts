import {TestGroup} from './test-group';
import {GradeLevel} from './grade-level';
import {TestState} from './test-state';

export interface Test {
  id: string;
  title: string;
  createdBy: string;
  createdAt: string;
  duration: number;
  grade: GradeLevel;
  groups: { [groupId: string]: TestGroup };
  state : TestState;
}

