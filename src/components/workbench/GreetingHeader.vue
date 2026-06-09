<script setup>
import {
  IconDown,
  IconPlus,
} from '@arco-design/web-vue/es/icon';
</script>

<template>
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
</template>

<style scoped>
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
</style>
