import { UserRole } from './user-role';

export interface User {

    id: string;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    age: number;
    role: UserRole;

}