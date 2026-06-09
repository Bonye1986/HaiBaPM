<script setup>
import { IconExclamationPolygonFill } from '@arco-design/web-vue/es/icon';

defineProps({
  items: {
    type: Array,
    required: true,
  },
});
</script>

<template>
  <a-card class="panel warning-panel" :bordered="false">
    <template #title>项目预警 (3)</template>
    <template #extra><a-link>查看全部</a-link></template>
    <div class="warning-list">
      <div v-for="item in items" :key="item.title" class="warning-item" :class="item.tone">
        <icon-exclamation-polygon-fill />
        <div>
          <strong>{{ item.title }}</strong>
          <p>{{ item.desc }}</p>
          <span>{{ item.meta }}</span>
        </div>
      </div>
    </div>
  </a-card>
</template>

<style scoped>
.panel {
  border-radius: 12px;
  box-shadow: 0 10px 26px rgba(56, 84, 130, .06);
}

.warning-panel {
  grid-area: warnings;
  height: 344px;
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

.warning-list {
  display: grid;
  gap: 14px;
}

.warning-item {
  min-height: 72px;
  display: grid;
  grid-template-columns: 28px 1fr;
  gap: 12px;
  align-items: start;
  padding: 14px 14px;
  border-radius: 10px;
}

.warning-item svg {
  width: 22px;
  height: 22px;
  margin-top: 4px;
}

.warning-item strong {
  display: block;
  color: #17213a;
  font-size: 13px;
}

.warning-item p,
.warning-item span {
  display: block;
  margin: 7px 0 0;
  font-size: 12px;
}

.warning-item.red { color: #f04452; background: #fff1f2; }
.warning-item.orange { color: #f59e0b; background: #fff7e8; }
.warning-item.amber { color: #f5a623; background: #fff9e7; }
</style>
