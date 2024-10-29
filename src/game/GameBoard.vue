<script setup lang="ts">
import { ref } from 'vue';
import { Puzzle, PUZZLE_LEN, PuzzleCell } from '../puzzles/puzzles';
import CellInput from './CellInput.vue';
import { checkInconsistent } from '../csp/sudoku';

const props = defineProps<{
  puzzle: Puzzle
}>();
const focusedCell = ref<PuzzleCell | null>(null);
const inconsistentMap = ref<boolean[][] | null>(null);
defineExpose({
  focusCell: (cell: PuzzleCell) => {
    focusedCell.value = cell;
  },
  clear: () => {
    for (const row of props.puzzle) {
      for (const cell of row) {
        if (!cell.given) {
          cell.value = undefined;
        }
      }
    }
    inconsistentMap.value = null;
  }
});

function onInput(cell: PuzzleCell, value: number | undefined) {
  if (value !== cell.value) {
    cell.value = value;
    inconsistentMap.value = checkInconsistent(props.puzzle);
  }
}



</script>

<template>
  <div class="game-board">
    <div v-for="(row, i) in props.puzzle" class="board-row">
      <div
        v-for="(cell, j) in row"
        class="board-cell"
        :tabindex="cell.given ? undefined : 0"
        :class="{
          'is-focused': focusedCell === cell,
          'is-given': cell.given,
          'is-inconsistent': inconsistentMap && inconsistentMap[i][j],
        }"
        @focus="focusedCell = cell"
      >
        <CellInput
          v-if="focusedCell === cell"
          :value="cell.value"
          @input="onInput(cell, $event)"
          @blur="focusedCell = null"
        />
        <span v-else-if="cell.value">{{ cell.value }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.game-board {
  --border-color: #ccc;
  color: #424242;
  user-select: none;
}

.board-row {
  display: flex;
  border-bottom: 1px solid var(--border-color);
}

.board-row:nth-child(3n) {
  border-bottom: 2px solid var(--border-color);
}

.board-row:first-child {
  border-top: 2px solid var(--border-color);
}

.board-cell {
  width: 36px;
  height: 36px;
  border-right: 1px solid var(--border-color);
  text-align: center;
  line-height: 36px;
  font-size: 20px;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #ffffff;
}

.board-cell:nth-child(3n) {
  border-right: 2px solid var(--border-color);
}

.board-cell:first-child {
  border-left: 2px solid var(--border-color);
}

.board-cell.is-focused {
  background-color: #e3f2fd;
  z-index: 1;
}

.board-cell.is-given {
  cursor: default;
  background-color: #F5F5F5;
}

.board-cell.is-inconsistent {
  color: #f44336;
}
</style>