import { UserRole } from './user-role';

export interface User {

    id: string;
    firstName: string;
    lastName: string;
    email: string;
    dateOfBirth: string;
    role: UserRole;

}