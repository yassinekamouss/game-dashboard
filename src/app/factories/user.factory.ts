import { UserRole } from '../models/user-role';
import { User } from '../models/user';
import { Teacher } from '../models/teacher';
import { Student } from '../models/student';
import { Parent } from '../models/parent';
import { GradeLevel } from '../models/grade-level';
import { PlayerProfile } from '../models/player-profile';
import { GameProgress } from '../models/game-progress';

interface FormValues {
  email: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  grade?: GradeLevel;
  teacherId?: string;
  parentId?: string;
  children?: string[];
}

export class UserFactory {
  static createUser(
    id: string,
    role: UserRole,
    form: FormValues
  ): User | Student | Teacher | Parent {
    const baseData: User = {
      id,
      email: form.email,
      firstName: form.firstName,
      lastName: form.lastName,
      gender:form.gender,
      dateOfBirth: form.dateOfBirth,
      role
    };

    switch (role) {
      case UserRole.STUDENT:
        return this.createStudent(baseData, form);
      case UserRole.TEACHER:
        return this.createTeacher(baseData, form);
      case UserRole.PARENT:
        return this.createParent(baseData,form);
      case UserRole.ADMIN:
        return baseData;
      default:
        throw new Error(`Unsupported role: ${role}`);
    }
  }

  private static createStudent(base: User, form: FormValues): Student {
    const playerProfile: PlayerProfile = {
      playerName: `${form.firstName} ${form.lastName}`.toLowerCase(),
      gameLevel: 1,
      mathLevel: 1,
      coins: 0,
      questionsSolved: 0,
      rewardProfile: {
        score: 0,
        rank: 0,
        iScore: 0,
        rewardCount: 0,
        positives: 0,
        negatives: 0
      }
    };

    const gameProgress: GameProgress[] = [];

    return {
      ...base,
      role: UserRole.STUDENT,
      grade: form.grade!,
      teacherId: form.teacherId || '',
      parentId: form.parentId || '',
      playerProfile,
      achievements: [],
      gameProgress
    };
  }

  private static createTeacher(base: User, form: FormValues): Teacher {
    return {
      ...base,
      role: UserRole.TEACHER,
      grade: form.grade!
    };
  }

  private static createParent(base: User , form: FormValues): Parent {
    return {
      ...base,
      role: UserRole.PARENT,
      children: form.children || []
    };
  }
}
