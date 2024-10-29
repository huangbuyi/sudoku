<script setup lang="ts">
import { reactive, ref, watch } from 'vue';
import { loadPuzzle, Puzzle, PUZZLE_LEN } from './puzzles/puzzles'
import GameBaord from './game/GameBoard.vue';
import { resolveCsp } from './csp/csp';
import { consistent } from './csp/sudoku';
import { GameState } from './game/game';

const gameboard = ref<typeof GameBaord>();
const gameState = ref<GameState>(GameState.Loading);
const puzzle = ref<Puzzle | null>(null);
const loading = ref(false);
const usedTip = ref(false);
const startTime = ref<number>(0);
const score = ref<number>(0);

loadData();

function clearBoard() {
  if (window.confirm('确认清空全部已填入的数值吗？')) {
    gameboard.value?.clear();
  }
}

function showTip() {
  const _puzzle = puzzle.value;
  if (!_puzzle) {
    return;
  }

  const assignment = resolveCsp(_puzzle);
  if (assignment) {
    const nextStep = assignment.getHistory()[0];
    if (nextStep) {
      const [[r, c], value] = nextStep;
      _puzzle[r][c].value = value;
      gameboard.value?.focusCell(_puzzle[r][c]);
    }

  } else {
    alert('无解，试着调整已填入的数值，或清空后再查看提示');
  }

  usedTip.value = true;
}

function showSolution() {
  const _puzzle = puzzle.value;
  if (!_puzzle) {
    return;
  }

  if (!window.confirm('确认要查看全部答案吗？')) {
    return;
  }

  const assignment = resolveCsp(_puzzle);
  if (assignment) {
    for (let r = 0; r < PUZZLE_LEN; r++) {
      for (let c = 0; c < PUZZLE_LEN; c++) {
        if (!_puzzle[r][c].given) {
          _puzzle[r][c].value = assignment.values[r][c];
        }
      }
    }
  } else {
    alert('无解，试着调整已填入的数值，或清空后再查看提示');
  }

  usedTip.value = true;
}

async function loadData() {
  loading.value = true;
  gameState.value = GameState.Loading;
  const data = await loadPuzzle('./puzzles/1.txt');
  startGame(data);
}

function startGame(puzzleData: Puzzle) {
  puzzle.value = reactive(puzzleData);
  gameState.value = GameState.Ready;
  usedTip.value = false;
  startTime.value = new Date().getTime();
  score.value = 0;
}

function onGameBoardInput() {
  if (checkWin()) {
    settlement();
  }
}

function settlement() {
  gameState.value = GameState.Won;
  const endTime = new Date().getTime();
  const time = endTime - startTime.value;
  const goodTime = 1000 * 60 * 30; // 30min
  let _score = 2;
  if (time < goodTime) {
    _score++
  }
  if (usedTip.value) {
    _score = 1;
  }
  score.value = _score;
}

function checkWin() {
  const _puzzle = puzzle.value;
  if (!_puzzle) {
    return false;
  }

  for (let r = 0; r < PUZZLE_LEN; r++) {
    for (let c = 0; c < PUZZLE_LEN; c++) {
      if (_puzzle[r][c].value === undefined) {
        return false
      }
    }
  }

  return consistent(_puzzle);
}

function playable() {
  return gameState.value === GameState.Playing || gameState.value === GameState.Ready;
}

</script>

<template>
  <div class="app">
    <main>
      <GameBaord ref="gameboard" v-if="puzzle" :puzzle="puzzle" :readonly="!playable()" @input="onGameBoardInput" />
      <div class="result-board">
        <div v-if="gameState === GameState.Won" class="win-board">
          <div class="score-board">
            <img v-for="_ in score" class="win-icon" src="/images/star.png" />
          </div>
          <span>You Win!</span>
          <button class="startGame">再来一局</button>
        </div>
      </div>
    </main>
    <footer>
      <button @click="clearBoard" :disabled="!playable()">清空</button>
      <button @click="showSolution" :disabled="!playable()">提示全部</button>
      <button @click="showTip" :disabled="!playable()">提示</button>
    </footer>
  </div>
</template>

<style scoped>
.app {
  display: flex;
  flex-flow: column;
  width: 100vw;
  height: 100vh;
  background-color: #f5f5f5;
}

main {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-flow: column;
  align-items: center;
  padding: 16px;
}

.result-board {
  margin-top: 24px;
  text-align: center;
  font-size: 24px;
  color: #eec385;
}

.win-board {
  display: flex;
  flex-flow: column;
  align-items: center;
}

.score-board {
  display: flex;
  align-items: center;
}

.win-board button {
  margin-top: 6px;
}

footer {
  flex: none;
  height: 36px;
  border-top: 1px solid #e0e0e0;
  display: flex;
  align-items: center;
  background-color: #ffffff;
}

footer button {
  margin-left: 8px;
}
</style>
