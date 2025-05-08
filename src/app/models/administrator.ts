import { User } from "./user";
import { UserRole } from "./user-role";

export interface Administrator extends User {

    role: UserRole.ADMIN;

}
