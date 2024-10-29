<script setup lang="ts">
import { onMounted, ref } from 'vue';

const props = defineProps<{
  value: number | undefined
}>();

const emit = defineEmits(['input']);

const inputEl = ref<HTMLInputElement | null>(null);

onMounted(() => {
  inputEl.value?.focus();
  inputEl.value?.select();
})

function onInput(e: Event) {
  const target = e.target as HTMLInputElement;
  const value = parseInt(target.value.charAt(0));

  if (value >= 1 && value <= 9) {
    emit('input', value);
  } else {
    emit('input', undefined);
  }
  inputEl.value?.select();
}
</script>

<template>
  <input
    ref="inputEl"
    class="cell-input"
    type="number"
    min="1"
    max="9"
    :value="props.value"
    @input="onInput"
  />
</template>

<style scoped>
.cell-input {
  width: 100%;
  height: 100%;
  background: none;
  outline: none;
  border: none;
  padding: 0;
  font-size: 20px;
  color: #212121;
  text-align: center;
}

/* Chrome, Safari, Edge, Opera */
.cell-input::-webkit-outer-spin-button,
.cell-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

/* Firefox */
.cell-input[type=number] {
  appearance: textfield;
}
</style>