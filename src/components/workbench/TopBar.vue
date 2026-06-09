<script setup>
import {
  IconCalendar,
  IconDown,
  IconNotification,
  IconSearch,
} from '@arco-design/web-vue/es/icon';
</script>

<template>
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
</template>

<style scoped>
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

@media (max-width: 1440px) {
  .topbar {
    gap: 28px;
  }

  .search-input {
    width: 380px;
  }
}

@media (max-width: 1360px) {
  .topbar {
    gap: 22px;
  }

  .search-input {
    width: 360px;
  }

  .top-actions {
    gap: 14px;
  }
}
</style>
