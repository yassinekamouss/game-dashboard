import { UserRole } from "./user-role";
import { User } from "./user";
import { GradeLevel } from "./grade-level";

export interface Student extends User {

    grade: GradeLevel;
    role: UserRole.STUDENT;
    parentId: string; 
    teacherId: string;
    gender: string
    dateOfBirth: Date;
    
    playerProfile: PlayerProfile;
    achievements: string[];
    gameProgress:  GameProgress[];
}
