import {GameConfig} from './game-config';

export interface TestGroup {
  groupName: string;
  configuredGames: {
    vertical_operations?: GameConfig;
    find_compositions?: GameConfig;
    choose_answer?: GameConfig;
  };
  students:string[];
}
