import { Student } from "./student";
import { User } from "./user";
import { UserRole } from "./user-role";

export interface Parent extends User {

    children: Student[];
    role: UserRole.PARENT;
}
