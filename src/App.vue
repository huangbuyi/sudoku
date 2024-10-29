<script setup lang="ts">
import { reactive, ref, watch } from 'vue';
import { loadPuzzle, Puzzle, PUZZLE_LEN } from './puzzles/puzzles'
import GameBaord from './game/GameBoard.vue';
import { resolveCsp } from './csp/csp';

const gameboard = ref<typeof GameBaord>();
const puzzle = ref<Puzzle | null>(null);
const loading = ref(false);
const tip = ref('');

watch(puzzle, () => {
  tip.value = '';
});

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
}

async function loadData() {
  loading.value = true;
  puzzle.value = reactive(await loadPuzzle('./puzzles/1.txt'));
}

</script>

<template>
  <div class="app">
    <main>
      <GameBaord ref="gameboard" v-if="puzzle" :puzzle="puzzle" />
    </main>
    <footer>
      <button @click="clearBoard">清空</button>
      <button @click="showTip">提示</button>
      <button @click="showSolution">提示全部</button>
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
  min-width: 0;
  display: flex;
  justify-content: center;
  padding: 16px;
}

footer {
  flex: none;
  height: 36px;
  border-top: 1px solid #e0e0e0;
  display: flex;
  align-items: center;
  background-color: #ffffff;
}
</style>
