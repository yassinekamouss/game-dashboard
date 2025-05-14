export interface PlayerProfile {
    playerName: string; // to be used in the game
    gameLevel: number;
    mathLevel: number;
    coins: number;
    questionsSolved: number;
    rewardProfile: {
      score: number;
      rank: number;
      iScore: number;
      rewardCount: number;
      positives: number;
      negatives: number;
    };
  }
  