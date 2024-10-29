import { PuzzleCoord, PUZZLE_LEN, Puzzle } from "../puzzles/puzzles";

export type ConstrainItem = [PuzzleCoord, PuzzleCoord]

const CONSTRAINTS: ConstrainItem[] = createConstraints();

function createConstraints() {
  const constraints: ConstrainItem[] = [];

  for (let i = 0; i < PUZZLE_LEN; i++) {
    for (let j = 0; j < PUZZLE_LEN; j++) {
      // row constraints
      for (let k = i + 1; k < PUZZLE_LEN; k++) {
        constraints.push([[i, j], [k, j]]);
      }
  
      // column constraints
      for (let k = j + 1; k < PUZZLE_LEN; k++) {
        constraints.push([[i, j], [i, k]]);
      }
      
      // box constraints
      for (let r = getBoxLeft(i), right = getBoxRight(i); r <= right; r++) {
        for (let c = getBoxLeft(j), right = getBoxRight(j); c <= right; c++) {
          if (r > i && c !== j) {
            constraints.push([[i, j], [r, c]]);
          }
        }
      }
    }
  }

  return constraints;
}

export function consistent(puzzle: Puzzle): boolean {
  for (const constraint of CONSTRAINTS) {
    const [[r1, c1], [r2, c2]] = constraint;
    const value1 = puzzle[r1][c1].value;
    const value2 = puzzle[r2][c2].value;
    if (value1 && value2 && value1 === value2) {
      return false
    }
  }

  return true;
}

export function checkInconsistent(puzzle: Puzzle): boolean[][] {
  const map: boolean[][] = new Array(PUZZLE_LEN);

  for (let i = 0; i < PUZZLE_LEN; i++) {
    map[i] = new Array(PUZZLE_LEN).fill(false);
  }

  for (const constraint of CONSTRAINTS) {
    const [[r1, c1], [r2, c2]] = constraint;
    const value1 = puzzle[r1][c1].value;
    const value2 = puzzle[r2][c2].value;
    if (value1 && value2 && value1 === value2) {
      map[r1][c1] = map[r2][c2] = true;
    }
  }

  return map;
}

function getBoxRight(index: number) {
  return index <= 2 ? 2 : (index <= 5 ? 5 : 8);
}

function getBoxLeft(index: number) {
  return index <= 2 ? 0 : (index <= 5 ? 3 : 6);
}