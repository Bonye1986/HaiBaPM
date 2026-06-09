<script setup>
const tagColorMap = {
  high: 'red',
  mid: 'orange',
  low: 'green',
};

defineProps({
  items: {
    type: Array,
    required: true,
  },
});
</script>

<template>
  <a-card class="panel task-panel" :bordered="false">
    <template #title>我的待办 (8)</template>
    <template #extra><a-link>查看全部</a-link></template>
    <ul class="task-list">
      <li v-for="item in items" :key="item.title">
        <a-checkbox />
        <span class="task-title">{{ item.title }}</span>
        <a-tag size="small" :color="tagColorMap[item.level]">{{ item.priority }}</a-tag>
        <time>{{ item.dueTime }}</time>
      </li>
    </ul>
  </a-card>
</template>

<style scoped>
.panel {
  border-radius: 12px;
  box-shadow: 0 12px 30px rgba(51, 82, 133, .07);
}

.task-panel {
  grid-area: tasks;
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

.task-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.task-list li {
  height: 42px;
  display: grid;
  grid-template-columns: 24px 1fr 34px 74px;
  align-items: center;
  gap: 8px;
  color: #24304a;
  font-size: 13px;
}

.task-list time {
  color: #67748c;
  text-align: right;
}
</style>
