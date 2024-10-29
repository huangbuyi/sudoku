<script setup lang="ts">
import { reactive, ref } from 'vue';
import { Puzzle, PUZZLE_LEN } from './puzzles/puzzles'
import GameBaord from './game/GameBoard.vue';
import { genPuzzle, resolveCsp } from './csp/csp';
import { consistent } from './csp/sudoku';
import { GameDifficulty, GameMode, GameState, getClueNumRange } from './game/game';
import MsTimer from './timer/MsTimer.vue';

const gameboard = ref<typeof GameBaord>();
const timer = ref<typeof MsTimer>();
const gameState = ref<GameState>(GameState.Ready);
const puzzle = ref<Puzzle | null>(null);
const usedTip = ref(false);
const startTime = ref<number>(0);
const score = ref<number>(0);
const difficulty = ref<GameDifficulty>(GameDifficulty.Easy);
const mode = ref<GameMode>(GameMode.Casual);
const difficultyOptions = [
  [ '简单', GameDifficulty.Easy ],
  [ '普通', GameDifficulty.Medium ],
  [ '困难', GameDifficulty.Hard ],
  [ '专家', GameDifficulty.Expert ]
];
const modeOptions = [
  [ '休闲', GameMode.Casual ],
  [ '挑战', GameMode.Challenge ]
];

startGame();

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


function startGame() {
  if (gameState.value === GameState.Playing) {
    if (!window.confirm('确认要重新开始吗？')) {
      return;
    }
  }

  const puzzleData = genPuzzle(getClueNum(difficulty.value));
  puzzle.value = reactive(puzzleData);
  gameState.value = GameState.Ready;
  usedTip.value = false;
  startTime.value = new Date().getTime();
  score.value = 0;
  gameboard.value?.clear();

  timer.value?.stop();
  if (mode.value === GameMode.Challenge) {
    timer.value?.start();
  }
}

function getClueNum(difficulty: GameDifficulty) {
  const [min, max] = getClueNumRange(difficulty);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function onGameBoardInput() {
  gameState.value = GameState.Playing;
  if (checkWin()) {
    settlement();
  }
}

function settlement() {
  timer.value?.stop();
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

window.addEventListener('beforeunload', (e: Event) => {
  if (gameState.value === GameState.Playing) {
    e.preventDefault();
    return '游戏已经开始，确定要离开此页面吗？';
  }
});

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
          <button class="startGame" @click="startGame">再来一局</button>
        </div>
      </div>
    </main>
    <footer>
      <div class="tip-buttons">
        <button @click="clearBoard" :disabled="!playable()">清空</button>
        <button v-if="mode === GameMode.Casual" @click="showSolution" :disabled="!playable()">提示全部</button>
        <button v-if="mode === GameMode.Casual" @click="showTip" :disabled="!playable()">提示</button>
      </div>
      <div class="game-setting">
        <div class="setting-item">
          <label>难度</label>
          <select v-model="difficulty">
            <option v-for="[label, value] in difficultyOptions" :value="value">{{ label }}</option>
          </select>
        </div>
        <div class="setting-item">
          <label>模式</label>
          <select v-model="mode">
            <option v-for="[label, value] in modeOptions" :value="value">{{ label }}</option>
          </select>
        </div>
        <div v-show="mode === GameMode.Challenge" class="timer">
          <MsTimer ref="timer" />
        </div>
        <button @click="startGame">重新开始</button>
      </div>
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
  height: 45px;
  border-top: 1px solid #e0e0e0;
  display: flex;
  align-items: center;
  background-color: #ffffff;
}

footer button {
  font-size: 14px;
  padding: 4px 8px;
}

.tip-buttons button {
  margin-left: 8px;
}

.game-setting {
  display: flex;
  align-items: center;
  margin-left: auto;
}

.setting-item {
  margin-right: 14px;
}

.setting-item label {
  margin-right: 4px;
}

.game-setting select {
  padding: 4px 8px;
  font-size: 14px;
}

.game-setting button {
  margin-right: 8px;
}

.timer {
  margin-right: 8px;
}
</style>
