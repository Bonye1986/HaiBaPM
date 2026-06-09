<script setup>
defineProps({
  items: {
    type: Array,
    required: true,
  },
});
</script>

<template>
  <a-card class="panel activity-panel" :bordered="false">
    <template #title>项目动态</template>
    <ol class="activity-list">
      <li v-for="(item, index) in items" :key="`${item.time}-${item.user}`">
        <span class="timeline-dot" :class="{ hollow: index > 1 }"></span>
        <time>{{ item.time }}</time>
        <a-avatar :size="22" class="mini-avatar">{{ item.user[0] }}</a-avatar>
        <p><strong>{{ item.user }}</strong> {{ item.action }} <a v-if="item.target">{{ item.target }}</a></p>
        <a-tag size="small" color="blue">{{ item.project }}</a-tag>
      </li>
    </ol>
  </a-card>
</template>

<style scoped>
.panel {
  border-radius: 12px;
  box-shadow: 0 12px 30px rgba(51, 82, 133, .07);
}

.activity-panel {
  grid-area: activity;
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

.activity-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.activity-list li {
  position: relative;
  height: 43px;
  display: grid;
  grid-template-columns: 72px 28px 1fr 116px;
  align-items: center;
  gap: 10px;
  border-bottom: 1px solid #edf2f8;
  color: #33415f;
  font-size: 13px;
}

.activity-list li::before {
  content: "";
  position: absolute;
  left: 8px;
  top: 0;
  bottom: 0;
  width: 1px;
  background: #2b74ff;
}

.timeline-dot {
  position: absolute;
  left: 4px;
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: #2b74ff;
  border: 2px solid #fff;
  box-shadow: 0 0 0 1px #2b74ff;
}

.timeline-dot.hollow {
  background: #fff;
}

.activity-list time {
  color: #67748c;
  padding-left: 26px;
}

.mini-avatar {
  background: linear-gradient(180deg, #f1c296, #212b45);
  font-size: 11px;
}

.activity-list p {
  margin: 0;
}

.activity-list a {
  color: #2268f3;
}
</style>
