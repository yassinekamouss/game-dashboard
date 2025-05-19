import { UserRole } from "./user-role";
import { User } from "./user";
import { GradeLevel } from "./grade-level";
import { PlayerProfile } from "./player-profile";
import { GameProgress } from "./game-progress";

export interface Student extends User {

    grade: GradeLevel;
    role: UserRole.STUDENT;
    parentId: string;
    teacherId: string;
    playerProfile: PlayerProfile;
    achievements: string[];
    gameProgress:  GameProgress[];
}
