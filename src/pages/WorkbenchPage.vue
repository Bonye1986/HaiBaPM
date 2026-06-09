<script setup>
import ActivityPanel from '../components/workbench/ActivityPanel.vue';
import GreetingHeader from '../components/workbench/GreetingHeader.vue';
import MetricCard from '../components/workbench/MetricCard.vue';
import ShortcutPanel from '../components/workbench/ShortcutPanel.vue';
import SidebarNav from '../components/workbench/SidebarNav.vue';
import TodoPanel from '../components/workbench/TodoPanel.vue';
import TopBar from '../components/workbench/TopBar.vue';
import TrendPanel from '../components/workbench/TrendPanel.vue';
import WarningPanel from '../components/workbench/WarningPanel.vue';
import {
  activityItems,
  chartSeries,
  metrics,
  navItems,
  shortcuts,
  todoItems,
  warningItems,
} from '../data/workbench';
</script>

<template>
  <main class="workbench-page">
    <sidebar-nav :nav-items="navItems" />

    <section class="workspace">
      <top-bar />
      <greeting-header />

      <section class="metric-grid">
        <metric-card v-for="metric in metrics" :key="metric.label" :metric="metric" />
      </section>

      <section class="dashboard-grid">
        <trend-panel :chart-series="chartSeries" />
        <todo-panel :items="todoItems" />
        <warning-panel :items="warningItems" />
        <activity-panel :items="activityItems" />
        <shortcut-panel :items="shortcuts" />
      </section>
    </section>
  </main>
</template>

<style scoped>
:global(*) {
  box-sizing: border-box;
}

:global(html),
:global(body),
:global(#app) {
  width: 100%;
  min-height: 100%;
  margin: 0;
  font-family: "PingFang SC", "Microsoft YaHei", "Noto Sans SC", Arial, sans-serif;
  background: #f4f8ff;
}

:global(body) {
  overflow-x: auto;
}

.workbench-page {
  width: 1536px;
  min-height: 1024px;
  display: grid;
  grid-template-columns: 234px 1fr;
  background:
    radial-gradient(circle at 72% 0%, rgba(218, 233, 255, .85), transparent 34%),
    linear-gradient(180deg, #f9fbff 0%, #f3f7ff 100%);
  color: #14213d;
}

.workspace {
  padding: 24px 42px 24px 48px;
}

.metric-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: 2fr 1.08fr 1.08fr;
  grid-template-areas:
    "chart tasks warnings"
    "activity shortcuts shortcuts";
  gap: 18px 20px;
}
</style>
