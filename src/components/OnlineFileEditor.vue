<script setup>
import { computed, reactive, ref } from "vue";
import {
  IconArrowLeft,
  IconBarChart,
  IconCopy,
  IconDelete,
  IconFile,
  IconLayout,
  IconPlus,
  IconSave,
} from "@arco-design/web-vue/es/icon";
import RichTextEditor from "./RichTextEditor.vue";

const props = defineProps({
  modelValue: { type: Object, required: true },
  phase: { type: Object, required: true },
  savedSnapshot: { type: String, default: "" },
});
const emit = defineEmits(["save", "close"]);

const clone = value => JSON.parse(JSON.stringify(value));
const draft = reactive(clone(props.modelValue));
const selectedCell = ref("A1");
const selectedSlide = ref(0);

const typeMeta = computed(() => ({
  DOCX: { label: "在线文档", extension: "docx", icon: IconFile },
  XLSX: { label: "在线表格", extension: "xlsx", icon: IconBarChart },
  PPTX: { label: "在线演示文稿", extension: "pptx", icon: IconLayout },
}[draft.type] || { label: "在线文档", extension: "docx", icon: IconFile }));
const sheetRows = computed(() => Math.max(1, Number(draft.sheetRows || 20)));
const sheetColumns = computed(() => Array.from({ length: Math.max(1, Number(draft.sheetColumns || 10)) }, (_, index) => String.fromCharCode(65 + index)));
const currentSlide = computed(() => draft.slides[selectedSlide.value] || draft.slides[0]);
const serializedDraft = computed(() => JSON.stringify(clone(draft)));
const isDirty = computed(() => serializedDraft.value !== props.savedSnapshot);

function cellKey(column, row) { return `${column}${row}`; }
function save() { emit("save", clone(draft)); }
function close() { emit("close", { dirty: isDirty.value }); }
function addSheetRow() { draft.sheetRows = sheetRows.value + 1; }
function addSheetColumn() {
  if (sheetColumns.value.length >= 26) return;
  draft.sheetColumns = sheetColumns.value.length + 1;
}
function clearSelectedCell() { draft.cells[selectedCell.value] = ""; }
function addSlide() {
  draft.slides.push({ id: `slide-${Date.now()}`, layout: "content", title: "新幻灯片", body: "" });
  selectedSlide.value = draft.slides.length - 1;
}
function duplicateSlide() {
  const source = currentSlide.value;
  if (!source) return;
  draft.slides.splice(selectedSlide.value + 1, 0, { ...clone(source), id: `slide-${Date.now()}` });
  selectedSlide.value += 1;
}
function removeSlide() {
  if (draft.slides.length <= 1) return;
  draft.slides.splice(selectedSlide.value, 1);
  selectedSlide.value = Math.min(selectedSlide.value, draft.slides.length - 1);
}
</script>

<template>
  <section class="online-file-editor-page" :class="`online-file-editor-${draft.type.toLowerCase()}`">
    <header class="online-file-editor-header">
      <div class="online-file-editor-identity">
        <a-tooltip content="返回项目文件">
          <a-button class="online-file-back" type="text" aria-label="返回项目文件" @click="close"><IconArrowLeft /></a-button>
        </a-tooltip>
        <span class="online-file-type-icon"><component :is="typeMeta.icon" /></span>
        <div>
          <label class="online-file-name-field">
            <input v-model="draft.name" maxlength="80" aria-label="文件名称" />
            <span>.{{ typeMeta.extension }}</span>
          </label>
          <small>{{ phase.code }} · {{ phase.projectName }}-{{ phase.name }}</small>
        </div>
      </div>
      <div class="online-file-editor-actions">
        <span class="online-file-save-state" :class="{ dirty: isDirty }">{{ isDirty ? '未保存' : '已保存' }}</span>
        <a-button type="primary" @click="save"><IconSave />保存</a-button>
      </div>
    </header>

    <main v-if="draft.type === 'DOCX'" class="online-document-editor">
      <RichTextEditor v-model="draft.content" placeholder="在此开始编写文档内容" />
    </main>

    <main v-else-if="draft.type === 'XLSX'" class="online-sheet-editor">
      <div class="online-editor-toolbar">
        <a-button type="text" size="small" @click="addSheetRow"><IconPlus />增加一行</a-button>
        <a-button type="text" size="small" :disabled="sheetColumns.length >= 26" @click="addSheetColumn"><IconPlus />增加一列</a-button>
        <a-button type="text" size="small" :disabled="!draft.cells[selectedCell]" @click="clearSelectedCell"><IconDelete />清空单元格</a-button>
        <span>{{ sheetRows }} 行 × {{ sheetColumns.length }} 列</span>
      </div>
      <div class="online-sheet-formula">
        <strong>{{ selectedCell }}</strong>
        <input v-model="draft.cells[selectedCell]" aria-label="当前单元格内容" placeholder="输入内容或公式" />
      </div>
      <div class="online-sheet-scroll">
        <div class="online-sheet-grid" :style="{ gridTemplateColumns: `46px repeat(${sheetColumns.length}, 120px)` }">
          <span class="online-sheet-corner"></span>
          <strong v-for="column in sheetColumns" :key="column" class="online-sheet-column">{{ column }}</strong>
          <template v-for="row in sheetRows" :key="row">
            <strong class="online-sheet-row">{{ row }}</strong>
            <input
              v-for="column in sheetColumns"
              :key="cellKey(column, row)"
              v-model="draft.cells[cellKey(column, row)]"
              :class="{ selected: selectedCell === cellKey(column, row) }"
              :aria-label="`单元格 ${cellKey(column, row)}`"
              @focus="selectedCell = cellKey(column, row)"
            />
          </template>
        </div>
      </div>
    </main>

    <main v-else class="online-presentation-editor">
      <aside class="online-slide-sidebar">
        <header><strong>幻灯片</strong><a-button type="text" size="mini" aria-label="添加幻灯片" @click="addSlide"><IconPlus /></a-button></header>
        <button v-for="(slide, index) in draft.slides" :key="slide.id" :class="{ active: selectedSlide === index }" @click="selectedSlide = index">
          <span>{{ index + 1 }}</span>
          <i><strong>{{ slide.title || '无标题' }}</strong><small>{{ slide.body || '暂无正文' }}</small></i>
        </button>
      </aside>
      <section class="online-slide-workspace">
        <div class="online-editor-toolbar">
          <a-select v-model="currentSlide.layout" size="small" aria-label="幻灯片版式">
            <a-option value="content">标题与正文</a-option>
            <a-option value="title">仅标题</a-option>
            <a-option value="blank">空白</a-option>
          </a-select>
          <a-button type="text" size="small" @click="duplicateSlide"><IconCopy />复制</a-button>
          <a-button type="text" size="small" status="danger" :disabled="draft.slides.length <= 1" @click="removeSlide"><IconDelete />删除</a-button>
        </div>
        <div class="online-slide-stage">
          <article class="online-slide-canvas" :class="`layout-${currentSlide.layout}`">
            <template v-if="currentSlide.layout !== 'blank'">
              <input v-model="currentSlide.title" aria-label="幻灯片标题" placeholder="单击添加标题" />
              <textarea v-if="currentSlide.layout === 'content'" v-model="currentSlide.body" aria-label="幻灯片正文" placeholder="单击添加正文" />
            </template>
          </article>
        </div>
        <footer>第 {{ selectedSlide + 1 }} 页，共 {{ draft.slides.length }} 页</footer>
      </section>
    </main>
  </section>
</template>

<style scoped>
.online-file-editor-page {
  position: fixed;
  inset: 0;
  z-index: 900;
  display: flex;
  flex-direction: column;
  min-width: 0;
  background: #f2f3f5;
  color: #1d2129;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", sans-serif;
}
.online-file-editor-header {
  height: 58px;
  flex: 0 0 58px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  border-bottom: 1px solid #e5e6eb;
  background: #fff;
  padding: 0 18px 0 10px;
}
.online-file-editor-identity,
.online-file-editor-actions,
.online-file-name-field { display: flex; align-items: center; }
.online-file-editor-identity { min-width: 0; gap: 10px; }
.online-file-back.arco-btn { width: 34px; height: 34px; padding: 0; color: #4e5969; }
.online-file-type-icon { width: 32px; height: 32px; display: grid; place-items: center; flex: 0 0 32px; border-radius: 5px; background: #e8f3ff; color: #165dff; font-size: 17px; }
.online-file-editor-identity > div { min-width: 0; }
.online-file-name-field { height: 28px; }
.online-file-name-field input { width: min(360px, 32vw); min-width: 180px; border: 1px solid transparent; border-radius: 4px; outline: none; padding: 3px 5px; background: transparent; color: #1d2129; font-size: 14px; font-weight: 600; }
.online-file-name-field input:hover { border-color: #e5e6eb; background: #f7f8fa; }
.online-file-name-field input:focus { border-color: #165dff; background: #fff; box-shadow: 0 0 0 2px rgba(22, 93, 255, .1); }
.online-file-name-field span { color: #86909c; font-size: 12px; }
.online-file-editor-identity small { display: block; margin-left: 5px; color: #86909c; font-size: 11px; line-height: 16px; }
.online-file-editor-actions { gap: 12px; }
.online-file-save-state { color: #00b42a; font-size: 12px; }
.online-file-save-state.dirty { color: #ff7d00; }
.online-document-editor { flex: 1; min-height: 0; overflow: auto; }
.online-document-editor :deep(.rich-text-editor) { min-height: 100%; border: 0; border-radius: 0; background: transparent; }
.online-document-editor :deep(.rich-text-toolbar) { position: sticky; top: 0; z-index: 2; min-height: 42px; justify-content: center; border-bottom: 1px solid #e5e6eb; background: #fff; padding: 6px 18px; }
.online-document-editor :deep(.rich-text-content) { width: min(816px, calc(100vw - 80px)); min-height: 1056px; max-height: none; box-sizing: border-box; margin: 24px auto 48px; border: 1px solid #e5e6eb; background: #fff; padding: 72px 80px; box-shadow: 0 2px 10px rgba(29, 33, 41, .06); font-size: 15px; line-height: 1.8; }
.online-document-editor :deep(.rich-text-content:focus) { outline: 2px solid rgba(22, 93, 255, .18); outline-offset: -2px; }
.online-editor-toolbar { height: 42px; flex: 0 0 42px; display: flex; align-items: center; gap: 4px; border-bottom: 1px solid #e5e6eb; background: #fff; padding: 0 14px; }
.online-editor-toolbar > span { margin-left: auto; color: #86909c; font-size: 12px; }
.online-sheet-editor { flex: 1; min-height: 0; display: flex; flex-direction: column; }
.online-sheet-formula { height: 36px; flex: 0 0 36px; display: flex; align-items: center; border-bottom: 1px solid #e5e6eb; background: #fff; }
.online-sheet-formula strong { width: 68px; align-self: stretch; display: grid; place-items: center; border-right: 1px solid #e5e6eb; color: #4e5969; font-size: 12px; }
.online-sheet-formula input { flex: 1; height: 100%; border: 0; outline: none; padding: 0 12px; color: #1d2129; }
.online-sheet-scroll { flex: 1; min-height: 0; overflow: auto; background: #fff; }
.online-sheet-grid { display: grid; width: max-content; min-width: 100%; }
.online-sheet-grid > strong,
.online-sheet-grid > span { position: sticky; z-index: 1; display: grid; place-items: center; height: 28px; box-sizing: border-box; border-right: 1px solid #e5e6eb; border-bottom: 1px solid #e5e6eb; background: #f7f8fa; color: #4e5969; font-size: 11px; font-weight: 500; }
.online-sheet-grid .online-sheet-column { top: 0; }
.online-sheet-grid .online-sheet-row { left: 0; }
.online-sheet-grid .online-sheet-corner { top: 0; left: 0; z-index: 3; }
.online-sheet-grid > input { height: 28px; box-sizing: border-box; border: 0; border-right: 1px solid #e5e6eb; border-bottom: 1px solid #e5e6eb; border-radius: 0; outline: none; padding: 0 7px; background: #fff; color: #1d2129; font-size: 12px; }
.online-sheet-grid > input:focus,
.online-sheet-grid > input.selected { position: relative; z-index: 2; box-shadow: inset 0 0 0 2px #165dff; }
.online-presentation-editor { flex: 1; min-height: 0; display: flex; }
.online-slide-sidebar { width: 228px; flex: 0 0 228px; overflow-y: auto; border-right: 1px solid #e5e6eb; background: #fff; padding: 10px; }
.online-slide-sidebar > header { height: 34px; display: flex; align-items: center; justify-content: space-between; padding: 0 3px 4px; }
.online-slide-sidebar > header strong { font-size: 12px; }
.online-slide-sidebar > button { width: 100%; display: grid; grid-template-columns: 22px minmax(0, 1fr); gap: 6px; margin-bottom: 8px; border: 1px solid transparent; border-radius: 5px; padding: 5px; background: transparent; text-align: left; cursor: pointer; }
.online-slide-sidebar > button:hover { background: #f7f8fa; }
.online-slide-sidebar > button.active { border-color: #165dff; background: #f2f7ff; }
.online-slide-sidebar > button > span { padding-top: 3px; color: #86909c; font-size: 11px; text-align: center; }
.online-slide-sidebar i { aspect-ratio: 16 / 9; display: flex; flex-direction: column; justify-content: center; overflow: hidden; border: 1px solid #e5e6eb; background: #fff; padding: 8px 10px; font-style: normal; }
.online-slide-sidebar i strong,
.online-slide-sidebar i small { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.online-slide-sidebar i strong { font-size: 10px; }
.online-slide-sidebar i small { margin-top: 3px; color: #86909c; font-size: 8px; }
.online-slide-workspace { flex: 1; min-width: 0; display: flex; flex-direction: column; }
.online-slide-workspace .arco-select { width: 132px; }
.online-slide-stage { flex: 1; min-height: 0; display: grid; place-items: center; overflow: auto; padding: 30px; }
.online-slide-canvas { aspect-ratio: 16 / 9; width: min(960px, calc(100vw - 330px)); display: flex; flex-direction: column; justify-content: center; gap: 28px; box-sizing: border-box; border: 1px solid #e5e6eb; background: #fff; padding: 10% 11%; box-shadow: 0 4px 18px rgba(29, 33, 41, .08); }
.online-slide-canvas input,
.online-slide-canvas textarea { width: 100%; box-sizing: border-box; border: 1px solid transparent; border-radius: 3px; outline: none; background: transparent; color: #1d2129; text-align: center; }
.online-slide-canvas input:hover,
.online-slide-canvas textarea:hover { border-color: #c9cdd4; }
.online-slide-canvas input:focus,
.online-slide-canvas textarea:focus { border-color: #165dff; box-shadow: 0 0 0 2px rgba(22, 93, 255, .1); }
.online-slide-canvas input { padding: 8px 10px; font-size: 30px; font-weight: 600; }
.online-slide-canvas textarea { min-height: 150px; resize: none; padding: 12px 16px; font: inherit; font-size: 17px; line-height: 1.7; }
.online-slide-canvas.layout-title { gap: 0; }
.online-slide-canvas.layout-blank { background: #f7f8fa; }
.online-slide-workspace > footer { height: 28px; display: flex; align-items: center; justify-content: flex-end; border-top: 1px solid #e5e6eb; background: #fff; padding: 0 14px; color: #86909c; font-size: 11px; }
@media (max-width: 900px) {
  .online-file-editor-header { padding-right: 12px; }
  .online-file-name-field input { width: 220px; }
  .online-slide-sidebar { width: 190px; flex-basis: 190px; }
  .online-slide-canvas { width: calc(100vw - 260px); padding: 8%; }
}
@media (max-width: 720px) {
  .online-file-editor-header { gap: 8px; padding: 0 8px 0 4px; }
  .online-file-editor-identity { flex: 1; gap: 5px; }
  .online-file-back.arco-btn { width: 30px; min-width: 30px; }
  .online-file-type-icon { width: 28px; height: 28px; flex-basis: 28px; }
  .online-file-name-field input { width: min(150px, calc(100vw - 220px)); min-width: 80px; }
  .online-file-editor-identity small { max-width: calc(100vw - 178px); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .online-file-save-state { display: none; }
  .online-document-editor :deep(.rich-text-toolbar) { justify-content: flex-start; overflow-x: auto; padding-inline: 10px; }
  .online-document-editor :deep(.rich-text-content) { width: calc(100vw - 24px); min-height: calc(100vh - 126px); margin: 12px auto 24px; padding: 38px 28px; }
  .online-editor-toolbar { overflow-x: auto; white-space: nowrap; }
  .online-presentation-editor { flex-direction: column; }
  .online-slide-sidebar { width: auto; height: 148px; flex: 0 0 148px; overflow-x: auto; overflow-y: hidden; border-right: 0; border-bottom: 1px solid #e5e6eb; white-space: nowrap; }
  .online-slide-sidebar > header { position: sticky; left: 0; z-index: 2; width: calc(100vw - 20px); box-sizing: border-box; background: #fff; }
  .online-slide-sidebar > button { width: 142px; display: inline-grid; margin: 0 6px 0 0; vertical-align: top; white-space: normal; }
  .online-slide-canvas { width: calc(100vw - 24px); padding: 7%; }
  .online-slide-canvas input { font-size: 20px; }
  .online-slide-canvas textarea { min-height: 76px; font-size: 13px; }
  .online-slide-stage { padding: 12px; }
}
</style>
