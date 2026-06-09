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
}

.tone-icon.compact {
  width: 38px;
  height: 38px;
  border-radius: 10px;
}

.tone-icon svg {
  width: 26px;
  height: 26px;
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

.blue { color: #1f6bff; background: #eaf1ff; }
.green { color: #2bbf8d; background: #e5f8ef; }
.purple { color: #7c4dff; background: #f0e8ff; }
.red { color: #f04452; background: #ffe9ec; }
.mint,
.cyan { color: #24c7a0; background: #e4f8f1; }
.orange { color: #f5a623; background: #fff2df; }
.violet { color: #7a67f8; background: #eeeafd; }
</style>
