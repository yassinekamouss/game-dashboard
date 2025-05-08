import { GradeLevel } from './grade-level';
import { User } from './user';
import { UserRole } from './user-role';

export interface Teacher extends User {

    grade: GradeLevel;
    role: UserRole.TEACHER;
}
