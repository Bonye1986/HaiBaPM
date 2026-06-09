<script setup>
import {
  IconBarChart,
  IconBook,
  IconCalendar,
  IconCheckCircle,
  IconCheckSquare,
  IconClockCircle,
  IconDown,
  IconExclamationCircleFill,
  IconExclamationPolygonFill,
  IconFile,
  IconFolder,
  IconHome,
  IconMenu,
  IconNotification,
  IconPlayArrowFill,
  IconPlus,
  IconRobot,
  IconSearch,
  IconSettings,
  IconUserGroup,
} from '@arco-design/web-vue/es/icon';

const navItems = [
  { label: '工作台', icon: IconHome, active: true },
  { label: '项目', icon: IconCalendar },
  { label: '任务', icon: IconCheckCircle },
  { label: '需求', icon: IconMenu },
  { label: '缺陷', icon: IconBook },
  { label: '工时', icon: IconClockCircle },
  { label: '风险', icon: IconExclamationCircleFill },
  { label: '报表', icon: IconBarChart },
  { label: '文档', icon: IconFile },
  { label: '成员', icon: IconUserGroup },
  { label: '设置', icon: IconSettings },
];

const metrics = [
  { label: '项目总数', value: '128', delta: '较上周 ↑ 12%', tone: 'blue', icon: IconFolder },
  { label: '进行中项目', value: '38', delta: '较上周 ↑ 5%', tone: 'green', icon: IconPlayArrowFill },
  { label: '已完成项目', value: '81', delta: '较上周 ↑ 18%', tone: 'purple', icon: IconCheckSquare },
  { label: '延期项目', value: '7', delta: '较上周 ↓ 2%', tone: 'red', icon: IconExclamationCircleFill },
  { label: '整体完成率', value: '86%', delta: '较上周 ↑ 6%', tone: 'blue', progress: true, icon: IconCalendar },
  { label: '本周工时', value: '32.5h', delta: '较上周 ↓ 4.5h', tone: 'mint', icon: IconClockCircle },
];

const tasks = [
  ['CRM系统需求评审会议', '高', '今天 10:00', 'high'],
  ['ERP项目验收确认', '高', '今天 14:00', 'high'],
  ['小程序项目上线部署', '中', '明天 09:30', 'mid'],
  ['管理OA需求文档评审', '中', '明天 11:00', 'mid'],
  ['客户回访：XX科技有限公司', '低', '05-22 15:00', 'low'],
  ['提交项目周报', '低', '05-24 17:00', 'low'],
];

const warnings = [
  { title: 'CRM系统项目延期', desc: '已延期 5 天', meta: '预计完成：2024-05-15', tone: 'red' },
  { title: 'ERP管理系统预算超支', desc: '超出预算 12%', meta: '预算使用：￥120,000 / ￥100,000', tone: 'orange' },
  { title: '小程序项目需求变更', desc: '需求增加 40%', meta: '变更需求：32 个', tone: 'amber' },
];

const activities = [
  ['10:30', '李明', '完成了任务', '设计官网导航栏', '官网改版项目'],
  ['09:15', '王芳', '提交了需求', '移动端首页开发', '移动端产品迭代'],
  ['昨天 16:45', '张伟', '创建了项目周报', '', 'ERP管理系统'],
  ['昨天 14:20', '陈丽', '解决了缺陷', '#1023 的问题', '客户管理系统开发'],
  ['05-18', '系统', '自动生成了项目月报', '', '系统'],
];

const shortcuts = [
  { title: '项目列表', desc: '查看全部项目', tone: 'blue', icon: IconCalendar },
  { title: '任务看板', desc: '任务进度管理', tone: 'green', icon: IconBook },
  { title: '需求列表', desc: '需求管理', tone: 'purple', icon: IconMenu },
  { title: '缺陷管理', desc: '缺陷跟踪', tone: 'orange', icon: IconExclamationCircleFill },
  { title: '工时统计', desc: '工时汇总', tone: 'cyan', icon: IconClockCircle },
  { title: '报表中心', desc: '数据报表', tone: 'violet', icon: IconBarChart },
];

const chartSeries = [
  { color: '#2563eb', points: '0,92 55,98 110,108 165,86 220,66 275,84 330,73 385,50 440,42 495,53 550,41 605,32 660,33' },
  { color: '#36b895', points: '0,124 55,124 110,135 165,114 220,98 275,120 330,115 385,91 440,82 495,95 550,88 605,66 660,62' },
  { color: '#ef4444', points: '0,166 55,162 110,171 165,160 220,152 275,167 330,166 385,151 440,143 495,154 550,150 605,143 660,142' },
];
</script>

<template>
  <main class="workbench-page">
    <aside class="sidebar">
      <div class="brand">
        <img src="/assets/logo-mark.png" alt="" />
        <div>
          <h1>项目管理系统</h1>
          <p>Project Management System</p>
        </div>
      </div>

      <nav class="nav-list" aria-label="主导航">
        <button v-for="item in navItems" :key="item.label" class="nav-item" :class="{ active: item.active }">
          <component :is="item.icon" />
          <span>{{ item.label }}</span>
        </button>
      </nav>

      <div class="ai-card">
        <span class="ai-icon"><icon-robot /></span>
        <div>
          <strong>AI 助手</strong>
          <p>智能分析 · 风险预警</p>
        </div>
        <icon-down class="ai-arrow" />
      </div>
    </aside>

    <section class="workspace">
      <header class="topbar">
        <a-input class="search-input" placeholder="搜索项目、任务、需求、文档...">
          <template #prefix>
            <icon-search />
          </template>
          <template #suffix>
            <span class="shortcut">⌘K</span>
          </template>
        </a-input>

        <div class="top-actions">
          <a-badge :count="12" dot-class="notice-badge">
            <button class="icon-button"><icon-notification /></button>
          </a-badge>
          <button class="icon-button"><icon-calendar /></button>
          <a-avatar :size="42" class="user-avatar">张</a-avatar>
          <span class="user-name">张伟</span>
          <icon-down class="down-icon" />
        </div>
      </header>

      <div class="hero-row">
        <div class="greeting">
          <h2>上午好，张伟 <span>👋</span></h2>
          <p>今天是 2024年5月20日 星期一</p>
          <p class="weather">🌤️ 晴转多云 26°C</p>
        </div>
        <a-button type="primary" class="create-button">
          <template #icon><icon-plus /></template>
          新建
          <icon-down />
        </a-button>
      </div>

      <section class="metric-grid">
        <a-card v-for="metric in metrics" :key="metric.label" class="metric-card" :bordered="false">
          <span class="metric-icon" :class="metric.tone">
            <span v-if="metric.progress" class="progress-ring"></span>
            <component v-else :is="metric.icon" />
          </span>
          <div class="metric-copy">
            <strong>{{ metric.value }}</strong>
            <span>{{ metric.label }}</span>
            <small>{{ metric.delta }}</small>
          </div>
        </a-card>
      </section>

      <section class="dashboard-grid">
        <a-card class="panel chart-panel" :bordered="false">
          <template #title>项目交付趋势</template>
          <template #extra>
            <a-radio-group type="button" size="mini" model-value="30">
              <a-radio value="30">近30天</a-radio>
              <a-radio value="90">近90天</a-radio>
              <a-radio value="year">本年度</a-radio>
            </a-radio-group>
          </template>
          <div class="legend">
            <span><i class="blue"></i>项目总数</span>
            <span><i class="green"></i>完成项目</span>
            <span><i class="red"></i>延期项目</span>
          </div>
          <svg class="trend-chart" viewBox="0 0 700 220" aria-label="项目交付趋势图">
            <g class="grid-lines">
              <line v-for="y in [30, 70, 110, 150, 190]" :key="y" x1="0" :y1="y" x2="680" :y2="y" />
            </g>
            <g class="y-labels">
              <text x="0" y="34">150</text>
              <text x="0" y="74">120</text>
              <text x="0" y="114">90</text>
              <text x="0" y="154">60</text>
              <text x="0" y="194">30</text>
            </g>
            <polyline v-for="series in chartSeries" :key="series.color" :points="series.points" :stroke="series.color" />
            <g class="x-labels">
              <text x="0" y="215">04-21</text>
              <text x="120" y="215">04-26</text>
              <text x="240" y="215">05-01</text>
              <text x="360" y="215">05-06</text>
              <text x="480" y="215">05-11</text>
              <text x="600" y="215">05-20</text>
            </g>
          </svg>
        </a-card>

        <a-card class="panel task-panel" :bordered="false">
          <template #title>我的待办 (8)</template>
          <template #extra><a-link>查看全部</a-link></template>
          <ul class="task-list">
            <li v-for="task in tasks" :key="task[0]">
              <a-checkbox />
              <span class="task-title">{{ task[0] }}</span>
              <a-tag size="small" :color="task[3] === 'high' ? 'red' : task[3] === 'mid' ? 'orange' : 'green'">{{ task[1] }}</a-tag>
              <time>{{ task[2] }}</time>
            </li>
          </ul>
        </a-card>

        <a-card class="panel warning-panel" :bordered="false">
          <template #title>项目预警 (3)</template>
          <template #extra><a-link>查看全部</a-link></template>
          <div class="warning-list">
            <div v-for="item in warnings" :key="item.title" class="warning-item" :class="item.tone">
              <icon-exclamation-polygon-fill />
              <div>
                <strong>{{ item.title }}</strong>
                <p>{{ item.desc }}</p>
                <span>{{ item.meta }}</span>
              </div>
            </div>
          </div>
        </a-card>

        <a-card class="panel activity-panel" :bordered="false">
          <template #title>项目动态</template>
          <ol class="activity-list">
            <li v-for="(item, index) in activities" :key="`${item[0]}-${item[1]}`">
              <span class="timeline-dot" :class="{ hollow: index > 1 }"></span>
              <time>{{ item[0] }}</time>
              <a-avatar :size="22" class="mini-avatar">{{ item[1][0] }}</a-avatar>
              <p><strong>{{ item[1] }}</strong> {{ item[2] }} <a v-if="item[3]">{{ item[3] }}</a></p>
              <a-tag size="small" color="blue">{{ item[4] }}</a-tag>
            </li>
          </ol>
        </a-card>

        <a-card class="panel shortcut-panel" :bordered="false">
          <template #title>快捷入口</template>
          <template #extra><a-link>查看全部动态</a-link></template>
          <div class="shortcut-grid">
            <button v-for="item in shortcuts" :key="item.title" class="shortcut-card">
              <span class="shortcut-icon" :class="item.tone">
                <component :is="item.icon" />
              </span>
              <span>
                <strong>{{ item.title }}</strong>
                <small>{{ item.desc }}</small>
              </span>
            </button>
          </div>
        </a-card>
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

.sidebar {
  position: relative;
  margin: 0;
  padding: 35px 20px 24px;
  background: rgba(255, 255, 255, .76);
  border-right: 1px solid rgba(216, 226, 241, .72);
  box-shadow: 14px 0 40px rgba(70, 98, 140, .06);
}

.brand {
  display: grid;
  grid-template-columns: 42px 1fr;
  gap: 10px;
  align-items: center;
  margin: 0 0 34px;
}

.brand img {
  width: 40px;
  height: 40px;
}

.brand h1 {
  margin: 0;
  font-size: 19px;
  line-height: 1.1;
  font-weight: 800;
  color: #101b35;
}

.brand p {
  margin: 8px 0 0;
  font-size: 10px;
  color: #5f6f8d;
}

.nav-list {
  display: grid;
  gap: 8px;
}

.nav-item {
  width: 100%;
  height: 50px;
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 0 20px;
  border: 0;
  border-radius: 10px;
  background: transparent;
  color: #53627c;
  font-size: 15px;
  text-align: left;
}

.nav-item svg {
  width: 18px;
  height: 18px;
  stroke-width: 4;
}

.nav-item.active {
  color: #1662f3;
  background: linear-gradient(90deg, #eaf2ff 0%, #eef5ff 100%);
  font-weight: 700;
}

.ai-card {
  position: absolute;
  left: 28px;
  right: 22px;
  bottom: 43px;
  height: 88px;
  display: grid;
  grid-template-columns: 42px 1fr 14px;
  align-items: center;
  gap: 12px;
  padding: 0 14px;
  border-radius: 14px;
  background: #fff;
  box-shadow: 0 16px 36px rgba(45, 86, 150, .1);
}

.ai-icon {
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  border-radius: 13px;
  color: #1f68ff;
  background: #edf4ff;
}

.ai-card strong,
.shortcut-card strong {
  display: block;
  font-size: 14px;
  color: #17213a;
}

.ai-card p,
.shortcut-card small {
  display: block;
  margin: 6px 0 0;
  color: #7b879d;
  font-size: 12px;
}

.ai-arrow {
  transform: rotate(-90deg);
  color: #7987a0;
}

.workspace {
  padding: 24px 42px 24px 48px;
}

.topbar {
  height: 50px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 38px;
}

.search-input {
  width: 410px;
  height: 44px;
  border-radius: 22px;
  box-shadow: 0 8px 24px rgba(47, 83, 138, .08);
}

.search-input :deep(.arco-input-wrapper) {
  height: 44px;
  border-radius: 22px;
  background: #fff;
  border: 1px solid #e6edf8;
}

.shortcut {
  color: #66728a;
  font-size: 12px;
}

.top-actions {
  display: flex;
  align-items: center;
  gap: 18px;
}

.icon-button {
  width: 34px;
  height: 34px;
  display: grid;
  place-items: center;
  border: 0;
  background: transparent;
  color: #33415f;
}

.icon-button svg {
  width: 24px;
  height: 24px;
}

.notice-badge {
  background: #ff3b3b;
}

.user-avatar {
  background: linear-gradient(180deg, #f5c78e, #6f4339);
  font-weight: 700;
}

.user-name {
  color: #111b33;
  font-weight: 700;
}

.down-icon {
  color: #111b33;
}

.hero-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin: 0 0 16px;
}

.greeting h2 {
  margin: 0 0 11px;
  font-size: 30px;
  line-height: 1.2;
  font-weight: 800;
  color: #111a31;
}

.greeting p {
  margin: 0 0 7px;
  color: #66728a;
  font-size: 15px;
}

.weather {
  color: #8a94a8;
}

.create-button {
  width: 149px;
  height: 48px;
  margin-top: 15px;
  border-radius: 10px;
  background: linear-gradient(90deg, #1d70ff, #2455ee);
  font-size: 15px;
  font-weight: 700;
  box-shadow: 0 14px 24px rgba(31, 96, 255, .22);
}

.metric-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}

.metric-card {
  height: 116px;
  border-radius: 12px;
  box-shadow: 0 12px 30px rgba(51, 82, 133, .08);
}

.metric-card :deep(.arco-card-body) {
  height: 100%;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 18px 20px;
}

.metric-icon,
.shortcut-icon {
  display: grid;
  place-items: center;
  width: 52px;
  height: 52px;
  flex: 0 0 auto;
  border-radius: 50%;
}

.metric-icon svg,
.shortcut-icon svg {
  width: 26px;
  height: 26px;
}

.progress-ring {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: conic-gradient(#2b6fff 0 86%, #dce7ff 86% 100%);
  -webkit-mask: radial-gradient(circle, transparent 47%, #000 49%);
  mask: radial-gradient(circle, transparent 47%, #000 49%);
}

.metric-icon.blue,
.shortcut-icon.blue { color: #1f6bff; background: #eaf1ff; }
.metric-icon.green,
.shortcut-icon.green { color: #2bbf8d; background: #e5f8ef; }
.metric-icon.purple,
.shortcut-icon.purple { color: #7c4dff; background: #f0e8ff; }
.metric-icon.red { color: #f04452; background: #ffe9ec; }
.metric-icon.mint,
.shortcut-icon.cyan { color: #24c7a0; background: #e4f8f1; }
.shortcut-icon.orange { color: #f5a623; background: #fff2df; }
.shortcut-icon.violet { color: #7a67f8; background: #eeeafd; }

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

.dashboard-grid {
  display: grid;
  grid-template-columns: 2fr 1.08fr 1.08fr;
  grid-template-areas:
    "chart tasks warnings"
    "activity shortcuts shortcuts";
  gap: 18px 20px;
}

.panel {
  border-radius: 12px;
  box-shadow: 0 12px 30px rgba(51, 82, 133, .07);
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

.chart-panel { grid-area: chart; height: 344px; }
.task-panel { grid-area: tasks; height: 344px; }
.warning-panel { grid-area: warnings; height: 344px; }
.activity-panel { grid-area: activity; height: 274px; }
.shortcut-panel { grid-area: shortcuts; height: 274px; }

.legend {
  display: flex;
  gap: 26px;
  margin-bottom: 8px;
  color: #5f6f8d;
  font-size: 12px;
}

.legend i {
  display: inline-block;
  width: 12px;
  height: 4px;
  margin-right: 8px;
  border-radius: 8px;
  vertical-align: middle;
}

.legend .blue { background: #2563eb; }
.legend .green { background: #36b895; }
.legend .red { background: #ef4444; }

.trend-chart {
  width: 100%;
  height: 236px;
  overflow: visible;
}

.trend-chart .grid-lines line {
  stroke: #e9eef6;
  stroke-width: 1;
}

.trend-chart polyline {
  fill: none;
  stroke-width: 3;
  stroke-linecap: round;
  stroke-linejoin: round;
  transform: translateX(34px);
}

.trend-chart text {
  fill: #778398;
  font-size: 12px;
}

.trend-chart .grid-lines {
  transform: translateX(34px);
}

.trend-chart .x-labels {
  transform: translateX(34px);
}

.task-list,
.activity-list {
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

.shortcut-icon {
  width: 38px;
  height: 38px;
  border-radius: 10px;
}

.shortcut-icon svg {
  width: 22px;
  height: 22px;
}

.shortcut-card span:last-child {
  min-width: 0;
}
</style>
