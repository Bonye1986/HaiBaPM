<script setup>
import { computed } from "vue";
import { IconCaretLeft, IconCaretRight } from "@arco-design/web-vue/es/icon";

const props = defineProps({
  total: { type: Number, required: true },
  page: { type: Number, required: true },
  pageSize: { type: Number, required: true },
});
const emit = defineEmits(["update:page", "update:pageSize"]);

const pageCount = computed(() => Math.max(1, Math.ceil(props.total / props.pageSize)));

function changePage(page) {
  if (page < 1 || page > pageCount.value || page === props.page) return;
  emit("update:page", page);
}
</script>

<template>
  <div v-if="total" class="pagination phase-list-pagination">
    <span>共 {{ total }} 条</span>
    <button class="pg-btn" type="button" :disabled="page <= 1" aria-label="上一页" @click="changePage(page - 1)"><IconCaretLeft /></button>
    <button v-for="item in pageCount" :key="item" class="pg-btn" :class="{ active: item === page }" type="button" :aria-current="item === page ? 'page' : undefined" @click="changePage(item)">{{ item }}</button>
    <button class="pg-btn" type="button" :disabled="page >= pageCount" aria-label="下一页" @click="changePage(page + 1)"><IconCaretRight /></button>
    <a-select :model-value="pageSize" class="pg-size" size="mini" aria-label="每页显示条数" @change="emit('update:pageSize', $event)">
      <a-option :value="8">8条/页</a-option>
      <a-option :value="16">16条/页</a-option>
      <a-option :value="24">24条/页</a-option>
    </a-select>
  </div>
</template>
