<script setup>
defineProps({
  chartSeries: {
    type: Array,
    required: true,
  },
});
</script>

<template>
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
      <span v-for="series in chartSeries" :key="series.label">
        <i :style="{ background: series.color }"></i>{{ series.label }}
      </span>
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
</template>

<style scoped>
.panel {
  border-radius: 12px;
  box-shadow: 0 12px 30px rgba(51, 82, 133, .07);
}

.chart-panel {
  grid-area: chart;
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

.trend-chart .grid-lines,
.trend-chart .x-labels {
  transform: translateX(34px);
}
</style>
