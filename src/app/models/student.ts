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
    historyMathLevel?:
        {
            date: string;
            level: number;
        }[];
    playerProfile: PlayerProfile;
    achievements: string[];
  gameProgress: {
    vertical_operations?: GameProgress;
    find_compositions?: GameProgress;
    choose_answer?: GameProgress;
  };

}
