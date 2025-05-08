import { User } from "./user";
import { UserRole } from "./user-role";

export interface Principal extends User {

    role: UserRole.PRINCIPAL;

}
