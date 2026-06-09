<script setup>
import ToneIcon from './ToneIcon.vue';

defineProps({
  items: {
    type: Array,
    required: true,
  },
});
</script>

<template>
  <a-card class="panel shortcut-panel" :bordered="false">
    <template #title>快捷入口</template>
    <template #extra><a-link>查看全部动态</a-link></template>
    <div class="shortcut-grid">
      <button v-for="item in items" :key="item.title" class="shortcut-card">
        <tone-icon :icon="item.icon" :tone="item.tone" size="compact" />
        <span class="shortcut-copy">
          <strong>{{ item.title }}</strong>
          <small>{{ item.desc }}</small>
        </span>
      </button>
    </div>
  </a-card>
</template>

<style scoped>
.panel {
  border-radius: 12px;
  box-shadow: 0 12px 30px rgba(51, 82, 133, .07);
}

.shortcut-panel {
  grid-area: shortcuts;
  height: 274px;
}

.panel :deep(.arco-card-header) {
  height: 52px;
  padding: 0 22px;
  border-bottom: 0;
}

.panel :deep(.arco-card-header-title) {
  color: #111a31;
  font-size: 18px;
  font-weight: 800;
}

.panel :deep(.arco-card-body) {
  padding: 0 22px 20px;
}

.shortcut-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
}

.shortcut-card {
  height: 82px;
  display: grid;
  grid-template-columns: 44px minmax(0, 1fr);
  align-items: center;
  gap: 12px;
  padding: 0 14px;
  border: 1px solid #eef3fb;
  border-radius: 10px;
  background: #fff;
  text-align: left;
}

.shortcut-copy {
  min-width: 0;
}

.shortcut-copy strong {
  display: block;
  font-size: 14px;
  color: #17213a;
}

.shortcut-copy small {
  display: block;
  margin: 6px 0 0;
  color: #7b879d;
  font-size: 12px;
}

@media (max-width: 1360px) {
  .shortcut-panel {
    height: 344px;
  }

  .shortcut-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
