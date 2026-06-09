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
      </section>

      <section class="dashboard-bottom-grid">
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
  overflow-x: hidden;
}

.workbench-page {
  width: 100%;
  min-width: 1200px;
  min-height: 100vh;
  display: grid;
  grid-template-columns: clamp(210px, 15.24vw, 234px) minmax(0, 1fr);
  background:
    radial-gradient(circle at 72% 0%, rgba(218, 233, 255, .85), transparent 34%),
    linear-gradient(180deg, #f9fbff 0%, #f3f7ff 100%);
  color: #14213d;
}

.workspace {
  min-width: 0;
  padding: 24px clamp(28px, 2.73vw, 42px) 24px clamp(32px, 3.13vw, 48px);
}

.metric-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 16px;
  margin-bottom: 16px;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: 2fr 1.08fr 1.08fr;
  grid-template-areas:
    "chart tasks warnings";
  gap: 18px 20px;
  margin-bottom: 22px;
}

.dashboard-bottom-grid {
  display: grid;
  grid-template-columns: 1.09fr 1fr;
  gap: 20px;
}

@media (max-width: 1440px) {
  .dashboard-grid {
    grid-template-columns: 1.65fr 1fr 1fr;
    gap: 16px;
  }

  .dashboard-bottom-grid {
    gap: 16px;
  }

  .metric-grid {
    gap: 14px;
  }
}

@media (max-width: 1360px) {
  .workbench-page {
    grid-template-columns: 210px minmax(0, 1fr);
  }

  .workspace {
    padding: 22px 28px 24px 32px;
  }

  .metric-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    margin-bottom: 16px;
  }

  .dashboard-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    grid-template-areas:
      "chart chart"
      "tasks warnings";
  }

  .dashboard-bottom-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
