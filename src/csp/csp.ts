import { Puzzle, PUZZLE_LEN, PuzzleCoord } from '../puzzles/puzzles';
import { chooseCoords } from '../utils';
import { consistent } from './sudoku';

export function resolveCsp(puzzle: Puzzle) {
  if (!consistent(puzzle)) {
    return null;
  }

  const assignment = new Assignment(puzzle);
  const res = backtrack(assignment);
  return res;
}

export function genPuzzle(numOfGiven: number) {
  const puzzle: Puzzle = new Array(PUZZLE_LEN);
  for (let r = 0; r < PUZZLE_LEN; r++) {
    puzzle[r] = new Array(PUZZLE_LEN);
    for (let c = 0; c < PUZZLE_LEN; c++) {
      puzzle[r][c] = { value: undefined, given: false };
    }
  }

  const assignment = genCsp();
  const randomCoords = chooseCoords(PUZZLE_LEN, PUZZLE_LEN, numOfGiven);

  for (let i = 0; i < numOfGiven; i++) {
    const [r, c] = randomCoords[i];
    puzzle[r][c].value = assignment.values[r][c];
    puzzle[r][c].given = true;
  }

  return puzzle;
}

function genCsp() {
  const puzzle: Puzzle = new Array(PUZZLE_LEN);
  for (let r = 0; r < PUZZLE_LEN; r++) {
    puzzle[r] = new Array(PUZZLE_LEN);
    for (let c = 0; c < PUZZLE_LEN; c++) {
      puzzle[r][c] = { value: undefined, given: false };
    }
  }

  const randomCoords = chooseCoords(PUZZLE_LEN, PUZZLE_LEN, 9);

  for (let i = 0; i < 9; i++) {
    const [r, c] = randomCoords[i];
    puzzle[r][c].value = i + 1;
  }

  const assignment = new Assignment(puzzle);
  const res = backtrack(assignment);
  return res!;
}

function backtrack(assignment: Assignment): Assignment | null {
  if (assignment.complete()) {
    return assignment;
  }
  const variable = selectUnassignedVar(assignment)!;
  const domainValues = assignment.getDomainValues(variable);
  for (const value of domainValues) {
    assignment.push([variable, value]);
    const result = backtrack(assignment);
    if (result !== null) {
      return result;   
    }
    assignment.pop();
  }
  return null;
}

type AssignmentItem = [PuzzleCoord, number];

class Assignment {
  public readonly values: (number | undefined)[][];
  private _stack: AssignmentItem[] = [];
  private _unassignedLen: number = 0;
  private _rowDomainValues: DomainValues[] = new Array(PUZZLE_LEN);
  private _colDomainValues: DomainValues[] = new Array(PUZZLE_LEN);
  private _boxDomainValues: DomainValues[] = new Array(PUZZLE_LEN);

  constructor(puzzle: Puzzle) {
    this.values = new Array(PUZZLE_LEN);

    for (let i = 0; i < PUZZLE_LEN; i++) {
      this.values[i] = new Array(PUZZLE_LEN).fill(undefined);
      this._rowDomainValues[i] = new DomainValues();
      this._colDomainValues[i] = new DomainValues();
      this._boxDomainValues[i] = new DomainValues();
    }

    for (let r = 0; r < PUZZLE_LEN; r++) {
      for (let c = 0; c < PUZZLE_LEN; c++) {
        const value = puzzle[r][c].value;
        if (value) {
          this._setValue(r, c, value);
        } else {
          this._unassignedLen++;
        }
      }
    }
  }

  push(assignmentItem: AssignmentItem) {
    const [[r, c], value] = assignmentItem;

    if (this.values[r][c] === undefined) {
      this._setValue(r, c, value);
      this._stack.push(assignmentItem);
    } else {
      throw new Error('Assignment failed, value already set: ' + assignmentItem);
    }
  }

  pop() {
    if (this._stack.length > 0) {
      const assignmentItem = this._stack.pop()!;
      const [[r, c], value] = assignmentItem;
      this._removeValue(r, c, value);
      return assignmentItem;
    }
    return null;
  }

  complete() {
    return this._stack.length === this._unassignedLen;
  }

  getDomainValues([r, c]: PuzzleCoord): number[] {
    return DomainValues.and(
      this._rowDomainValues[r],
      this._colDomainValues[c],
      this._boxDomainValues[getBoxIndex(r, c)]
    )
  }

  getHistory() {
    return this._stack.slice(0);
  }

  private _setValue(row: number, col: number, value: number) {
    this.values[row][col] = value;
    this._rowDomainValues[row].remove(value);
    this._colDomainValues[col].remove(value);
    this._boxDomainValues[getBoxIndex(row, col)].remove(value);
  }

  private _removeValue(row: number, col: number, value: number) {
    this.values[row][col] = undefined;
    this._rowDomainValues[row].add(value);
    this._colDomainValues[col].add(value);
    this._boxDomainValues[getBoxIndex(row, col)].add(value);
  }
}

function getBoxIndex(row: number, col: number) {
  return Math.floor(row / 3) * 3 + Math.floor(col / 3);
}

class DomainValues {
  public readonly counts = new Array(PUZZLE_LEN).fill(1);

  add(value: number) {
    if (value < 1 || value > PUZZLE_LEN) {
      throw new Error('Invalid value: ' + value);
    }
    this.counts[value - 1]++;
  }

  remove(value: number) {
    if (value < 1 || value > PUZZLE_LEN) {
      throw new Error('Invalid value: ' + value);
    }
    this.counts[value - 1]--;
  }

  hasValue(value: number): boolean {
    return this.counts[value - 1] > 0;
  }

  getValues(): number[] {
    const res: number[] = [];

    for (let i = 0; i < PUZZLE_LEN; i++) {
      if (this.counts[i] > 0) {
        res.push(i + 1);
      }
    }

    return res;
  }

  static and(...domainValues: DomainValues[]) {
    const res: number[] = [];

    for (let i = 0; i < PUZZLE_LEN; i++) {
      let hasValue = true;
      for (const dv of domainValues) {        
        if (!dv.hasValue(i + 1)) {
          hasValue = false;
          break;
        }
      }
      if (hasValue) {
        res.push(i + 1);
      }
    }

    return res;
  }
}

// select MPV(Minimum Remaining Values) variable
function selectUnassignedVar(assignment: Assignment): PuzzleCoord | null {
  let mpv = PUZZLE_LEN;
  let mpvVar: PuzzleCoord | null = null;

  for (let r = 0; r < PUZZLE_LEN; r++) {
    for (let c = 0; c < PUZZLE_LEN; c++) {
      if (assignment.values[r][c] === undefined) {
        const domainValues = assignment.getDomainValues([r, c]);
        if (domainValues.length < mpv) {
          mpv = domainValues.length;
          mpvVar = [r, c];
        }
      }
    }
  }

  return mpvVar;
}