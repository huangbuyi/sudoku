<script setup lang="ts">
import { reactive, ref } from 'vue';
import { Puzzle, PUZZLE_LEN } from './puzzles/puzzles'
import GameBaord from './game/GameBoard.vue';
import { genPuzzle, resolveCsp } from './csp/csp';
import { consistent } from './csp/sudoku';
import { GameDifficulty, GameMode, GameState, getClueNumRange } from './game/game';
import MsTimer from './timer/MsTimer.vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

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
  [ t('difficulties.easy'), GameDifficulty.Easy ],
  [ t('difficulties.medium'), GameDifficulty.Medium ],
  [ t('difficulties.hard'), GameDifficulty.Hard ],
  [ t('difficulties.expert'), GameDifficulty.Expert ]
];
const modeOptions = [
  [ t('modes.casual'), GameMode.Casual ],
  [ t('modes.challenge'), GameMode.Challenge ]
];

startGame();

function clearBoard() {
  if (window.confirm(t('messages.clear'))) {
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
    alert(t('messages.onSolution'));
  }

  usedTip.value = true;
}

function showSolution() {
  const _puzzle = puzzle.value;
  if (!_puzzle) {
    return;
  }

  if (!window.confirm(t('messages.showSolution'))) {
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
    alert(t('messages.onSolution'));
  }

  usedTip.value = true;
}


function startGame() {
  if (gameState.value === GameState.Playing) {
    if (!window.confirm(t('messages.restart'))) {
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
    return t('messages.unload');
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
        <button @click="clearBoard" :disabled="!playable()">{{ t('buttons.clear') }}</button>
        <button v-if="mode === GameMode.Casual" @click="showSolution" :disabled="!playable()">{{ t('buttons.showSolution') }}</button>
        <button v-if="mode === GameMode.Casual" @click="showTip" :disabled="!playable()">{{ t('buttons.showTip') }}</button>
      </div>
      <div class="game-setting">
        <div class="setting-item">
          <label><img class="i18n-icon" src="/images/i18n.png" /></label>
          <select v-model="$i18n.locale">
            <option v-for="locale in $i18n.availableLocales" :key="`locale-${locale}`" :value="locale">{{ locale }}</option>
          </select>
        </div>
        <div class="setting-item">
          <label>{{ t('labels.difficulty') }}</label>
          <select v-model="difficulty">
            <option v-for="[label, value] in difficultyOptions" :value="value">{{ label }}</option>
          </select>
        </div>
        <div class="setting-item">
          <label>{{ t('labels.mode') }}</label>
          <select v-model="mode">
            <option v-for="[label, value] in modeOptions" :value="value">{{ label }}</option>
          </select>
        </div>
        <div v-show="mode === GameMode.Challenge" class="timer">
          <MsTimer ref="timer" />
        </div>
        <button @click="startGame">{{ t('buttons.restart') }}</button>
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
  border-top: 1px solid #e0e0e0;
  display: flex;
  align-items: center;
  background-color: #ffffff;
  flex-wrap: wrap;
  padding: 0 8px;
}

footer button {
  font-size: 14px;
  padding: 4px 8px;
  flex: none;
  margin: 4px;
}

.tip-buttons button {
  margin-left: 8px;
}

.game-setting {
  display: flex;
  align-items: center;
  margin-left: auto;
  flex-wrap: wrap;
}

.setting-item {
  margin: 4px;
  margin-right: 14px;
  flex: none;
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

.i18n-icon {
  width: 22px;
  vertical-align: middle;
}
</style>
