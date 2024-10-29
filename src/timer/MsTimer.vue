<script setup lang="ts">
import { ref } from 'vue';

let startTime: number = 0;
let animationId: number = 0;
const timeStr = ref<string>(formatTime(0));

function update(currentTime: number) {
  const elapsedTime = currentTime - startTime;
  timeStr.value = formatTime(elapsedTime);
  animationId = requestAnimationFrame(update);
}

function formatTime(ms: number) {
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  const milliseconds = Math.floor(ms % 1000);
  let result = milliseconds.toString().padStart(3, '0');
  if (seconds >= 0) {
    result = `${seconds.toString().padStart(2, '0')}.${result}`;
  }
  if (minutes > 0) {
    result = `${minutes.toString().padStart(2, '0')}:${result}`;
  }
  if (hours > 0) {
    result = `${hours.toString().padStart(2, '0')}:${result}`;
  }
  return result;
}

const start = () => {
  startTime = performance.now();
  animationId = requestAnimationFrame(update);
};

const stop = () => {
  cancelAnimationFrame(animationId);
};

defineExpose({
  start,
  stop
});

</script>

<template>
  <span class="ms-timer">{{ timeStr }}</span>
</template>

<style scoped>
.ms-timer {
  font-family: "Monaco", "Consolas", "Courier New", monospace;
}
</style>