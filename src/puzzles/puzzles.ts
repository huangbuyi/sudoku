export async function loadPuzzle(url: string) {
  const response = await fetch(url);
  const text = await response.text();
  return parsePuzzle(text);
}

export const PUZZLE_LEN = 9;
const NUMBERS = '123456789';

export function parsePuzzle(text: string): Puzzle {
  const rows = text.split(/\r\n/g);
  const puzzle: Puzzle = new Array(PUZZLE_LEN);

  for (let i = 0; i < PUZZLE_LEN; i++) {
    puzzle[i] = new Array(PUZZLE_LEN);
    if (!rows[i] || rows[i].length !== PUZZLE_LEN) {
      throw new Error(`Invalid puzzle at row ${i}: ` +  text);
    }

    for (let j = 0; j < PUZZLE_LEN; j++) {
      const char = rows[i].charAt(j);
      if (char === '_') {
        puzzle[i][j] = { given: false };
      } else if (NUMBERS.includes(char)) {
        const value = NUMBERS.indexOf(char) + 1;
        puzzle[i][j] = { value, given: true };
      } else {
        throw new Error(`Invalid puzzle at row ${i} col ${j}: ` +  text);
      }
    }
  }

  return puzzle;
}

export type Puzzle = PuzzleCell[][];

export type PuzzleCoord = [number, number];

export interface PuzzleCell {
  value?: number;
  given: boolean;
}

