export enum GameState {
  Ready,
  Playing,
  Won,
}

export enum GameMode {
  Casual,
  Challenge
}

export enum GameDifficulty {
  Easy = 0,
  Medium,
  Hard,
  Expert
}

export const ClueNumRanges: [number, number][] = [[31, 35], [26, 30], [21, 25], [17, 20]];

export function getClueNumRange(difficulty: GameDifficulty): [number, number] {
  return ClueNumRanges[difficulty];
}