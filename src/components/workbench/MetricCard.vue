<script setup>
import ToneIcon from './ToneIcon.vue';

defineProps({
  metric: {
    type: Object,
    required: true,
  },
});
</script>

<template>
  <a-card class="metric-card" :bordered="false">
    <tone-icon :icon="metric.icon" :progress="metric.progress" :tone="metric.tone" />
    <div class="metric-copy">
      <strong>{{ metric.value }}</strong>
      <span>{{ metric.label }}</span>
      <small>{{ metric.delta }}</small>
    </div>
  </a-card>
</template>

<style scoped>
.metric-card {
  height: 120px;
  border-radius: 12px;
  box-shadow: 0 10px 26px rgba(56, 84, 130, .065);
}

.metric-card :deep(.arco-card-body) {
  height: 100%;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 18px 20px;
}

.metric-copy strong {
  display: block;
  margin-bottom: 8px;
  font-size: 25px;
  line-height: 1;
  color: #111a31;
}

.metric-copy span,
.metric-copy small {
  display: block;
  color: #66728a;
  font-size: 13px;
}

.metric-copy small {
  margin-top: 8px;
  color: #6f7d95;
}

@media (max-width: 1440px) {
  .metric-card :deep(.arco-card-body) {
    gap: 13px;
    padding: 16px 18px;
  }

  .metric-copy strong {
    font-size: 24px;
  }
}
</style>
