<script setup>
import {
  IconDown,
  IconRobot,
} from '@arco-design/web-vue/es/icon';

defineProps({
  navItems: {
    type: Array,
    required: true,
  },
});
</script>

<template>
  <aside class="sidebar">
    <div class="brand">
      <span class="brand-mark" aria-hidden="true">
        <i class="mark-leaf leaf-a"></i>
        <i class="mark-leaf leaf-b"></i>
        <i class="mark-leaf leaf-c"></i>
        <i class="mark-leaf leaf-d"></i>
      </span>
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
</template>

<style scoped>
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

.brand-mark {
  position: relative;
  display: block;
  width: 42px;
  height: 40px;
}

.mark-leaf {
  position: absolute;
  width: 22px;
  height: 22px;
  border-radius: 16px 16px 16px 4px;
  border: 1px solid rgba(255, 255, 255, .42);
  box-shadow: 0 8px 15px rgba(40, 98, 255, .16);
}

.leaf-a {
  left: 1px;
  top: 5px;
  z-index: 3;
  transform: rotate(-45deg);
  background: linear-gradient(135deg, #34c0ff 0%, #3867f5 82%);
}

.leaf-b {
  left: 16px;
  top: 2px;
  z-index: 4;
  transform: rotate(41deg);
  background: linear-gradient(135deg, #48b8ff 0%, #6541ff 86%);
}

.leaf-c {
  left: 3px;
  top: 19px;
  z-index: 2;
  transform: rotate(-136deg);
  background: linear-gradient(135deg, #4d7aff 0%, #4636ee 84%);
}

.leaf-d {
  left: 17px;
  top: 18px;
  z-index: 1;
  transform: rotate(132deg);
  background: linear-gradient(135deg, #6557ff 0%, #25b4ff 92%);
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

.ai-card strong {
  display: block;
  font-size: 14px;
  color: #17213a;
}

.ai-card p {
  display: block;
  margin: 6px 0 0;
  color: #7b879d;
  font-size: 12px;
}

.ai-arrow {
  transform: rotate(-90deg);
  color: #7987a0;
}

@media (max-width: 1360px) {
  .sidebar {
    padding: 32px 16px 22px;
  }

  .brand {
    grid-template-columns: 38px 1fr;
    gap: 9px;
  }

  .brand-mark {
    width: 36px;
    height: 36px;
  }

  .mark-leaf {
    width: 21px;
    height: 21px;
  }

  .brand h1 {
    font-size: 17px;
  }

  .nav-item {
    height: 48px;
    gap: 15px;
    padding: 0 18px;
  }

  .ai-card {
    left: 20px;
    right: 18px;
    bottom: 38px;
  }
}
</style>
