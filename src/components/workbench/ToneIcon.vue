<script setup>
defineProps({
  icon: {
    type: [Object, Function],
    default: null,
  },
  progress: {
    type: Boolean,
    default: false,
  },
  size: {
    type: String,
    default: 'large',
  },
  tone: {
    type: String,
    default: 'blue',
  },
});
</script>

<template>
  <span class="tone-icon" :class="[tone, size]">
    <span v-if="progress" class="progress-ring"></span>
    <component v-else-if="icon" :is="icon" />
  </span>
</template>

<style scoped>
.tone-icon {
  display: grid;
  place-items: center;
  flex: 0 0 auto;
}

.tone-icon.large {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, .72), 0 12px 18px rgba(42, 96, 205, .1);
}

.tone-icon.compact {
  width: 38px;
  height: 38px;
  border-radius: 10px;
}

.tone-icon svg {
  width: 26px;
  height: 26px;
  stroke-width: 3;
}

.tone-icon.compact svg {
  width: 22px;
  height: 22px;
}

.progress-ring {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: conic-gradient(#2b6fff 0 86%, #dce7ff 86% 100%);
  -webkit-mask: radial-gradient(circle, transparent 47%, #000 49%);
  mask: radial-gradient(circle, transparent 47%, #000 49%);
}

.blue { color: #1f6bff; background: radial-gradient(circle at 35% 24%, #f7fbff 0 8%, #e2ebff 38%, #d5e2ff 100%); }
.green { color: #2bbf8d; background: radial-gradient(circle at 35% 24%, #f5fff9 0 8%, #d9f6e7 42%, #bff0d8 100%); }
.purple { color: #7c4dff; background: radial-gradient(circle at 35% 24%, #fcf9ff 0 8%, #eadcff 42%, #dac5ff 100%); }
.red { color: #f04452; background: radial-gradient(circle at 35% 24%, #fff9fb 0 8%, #ffd9df 42%, #ffc0ca 100%); }
.mint,
.cyan { color: #24c7a0; background: radial-gradient(circle at 35% 24%, #f5fffb 0 8%, #d6f6eb 42%, #c3efdf 100%); }
.orange { color: #f5a623; background: #fff2df; }
.violet { color: #7a67f8; background: #eeeafd; }
</style>
