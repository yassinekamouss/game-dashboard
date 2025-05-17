import { User } from "./user";
import { UserRole } from "./user-role";

export interface Parent extends User {

    children: string[];
    role: UserRole.PARENT;
}
