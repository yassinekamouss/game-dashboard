import { GradeLevel } from './grade-level';
import { UserRole } from './user-role';

export interface User {

    id: string;
    firstName: string;
    lastName: string;
    gender:string;
    email: string;
    dateOfBirth: string;
    role: UserRole;

}
