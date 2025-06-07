import { UserRole } from '../models/user-role';
import { User } from '../models/user';
import { Teacher } from '../models/teacher';
import { Student } from '../models/student';
import { Parent } from '../models/parent';
import { PlayerProfile } from '../models/player-profile';
import { GameProgress } from '../models/game-progress';
import {FormValues} from '../models/form-values';



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
      mathLevel: 1,
      coins: 0,
      score: 0
    };

    const gameProgress: GameProgress[] = [];

    return {
      ...base,
      historyMathLevel : [{ date: new Date().toISOString().split('T')[0], level:1 }],
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
