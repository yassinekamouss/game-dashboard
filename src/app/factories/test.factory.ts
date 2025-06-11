import {Test} from '../models/test';
import {TestState} from '../models/test-state';

export class TestFactory {

  static createTest(formValues: any, createdBy: string, selectedStudents: { [groupIndex: number]: string[] }) {
    const generatedId = `test_${Date.now()}_${createdBy}`;
    const testData: Test = {
      id: generatedId,
      title: formValues.title,
      createdBy,
      duration: formValues.duration,
      createdAt: new Date().toISOString(),
      grade: formValues.grade,
      groups: {},
      state : TestState.CREATED
    };

    // Traiter les groupes
    formValues.groups.forEach((group: any, index: number) => {
      const groupId = `group_${index + 1}`;
      const configuredGames: any = {};

      // Traiter chaque type de jeu
      Object.keys(group.configuredGames).forEach(gameType => {
        const gameConfig = group.configuredGames[gameType];

          configuredGames[gameType] = {
            numOperations: gameConfig.numOperations,
            maxNumberRange: gameConfig.maxNumberRange,
            requiredCorrectAnswers: gameConfig.requiredCorrectAnswers,
            order: gameConfig.order,
            minComposition:gameConfig.minComposition,
            minNumberRange: gameConfig.minNumberRange,

        }
      });

      testData.groups[groupId] = {
        groupName: group.groupName,
        configuredGames,
        students: selectedStudents[index] || [] // Vide pour l'instant
      };
    });

    return testData;
  }
}
