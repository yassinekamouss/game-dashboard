import {GradeLevel} from './grade-level';

export interface FormValues {
  email: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  grade?: GradeLevel;
  teacherId?: string;
  parentId?: string;
  children?: string[];
}
