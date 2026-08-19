<script setup>
import { nextTick, onMounted, ref, watch } from "vue";
import { Message } from "@arco-design/web-vue";
import {
  IconBold, IconImage, IconItalic, IconOrderedList, IconSound, IconUnorderedList, IconVideoCamera,
} from "@arco-design/web-vue/es/icon";

const props = defineProps({ modelValue: { type: String, default: "" }, placeholder: { type: String, default: "" } });
const emit = defineEmits(["update:modelValue", "blur"]);
const editorRef = ref(null);
const selectionRef = ref(null);
const imageInputRef = ref(null);
const audioInputRef = ref(null);
const videoInputRef = ref(null);
const richTextTags = new Set(["B", "STRONG", "I", "EM", "U", "S", "H1", "H2", "H3", "H4", "H5", "H6", "UL", "OL", "LI", "P", "BR", "DIV", "SPAN", "IMG", "AUDIO", "VIDEO"]);
const blockedTags = new Set(["SCRIPT", "STYLE", "IFRAME", "OBJECT", "EMBED", "LINK", "META"]);
const limits = { image: 8 * 1024 * 1024, audio: 20 * 1024 * 1024, video: 50 * 1024 * 1024 };
const commandButtons = [
  ["加粗", IconBold, "bold"], ["斜体", IconItalic, "italic"],
  ["无序列表", IconUnorderedList, "insertUnorderedList"], ["有序列表", IconOrderedList, "insertOrderedList"],
];

function sanitize(html) {
  if (!html || typeof DOMParser === "undefined") return html || "";
  const document = new DOMParser().parseFromString(html, "text/html");
  const mediaPattern = { IMG: /^data:image\/[a-z0-9.+-]+;base64,/i, AUDIO: /^data:audio\/[a-z0-9.+-]+;base64,/i, VIDEO: /^data:video\/[a-z0-9.+-]+;base64,/i };
  const clean = node => Array.from(node.children).forEach(child => {
    if (blockedTags.has(child.tagName)) { node.removeChild(child); return; }
    if (["IMG", "AUDIO", "VIDEO"].includes(child.tagName)) {
      const source = child.getAttribute("src") || "";
      if (!mediaPattern[child.tagName].test(source)) { child.remove(); return; }
      const alt = child.getAttribute("alt") || "插入的图片";
      Array.from(child.attributes).forEach(attribute => child.removeAttribute(attribute.name));
      child.setAttribute("src", source);
      if (child.tagName === "IMG") child.setAttribute("alt", alt.slice(0, 120));
      else { child.setAttribute("controls", ""); child.setAttribute("preload", "metadata"); }
      return;
    }
    if (!richTextTags.has(child.tagName)) {
      while (child.firstChild) node.insertBefore(child.firstChild, child);
      node.removeChild(child);
      return;
    }
    Array.from(child.attributes).forEach(attribute => child.removeAttribute(attribute.name));
    clean(child);
  });
  clean(document.body);
  return document.body.innerHTML;
}

function syncContent() { emit("update:modelValue", sanitize(editorRef.value?.innerHTML || "")); }
function runCommand(command) {
  editorRef.value?.focus();
  document.execCommand(command, false);
  syncContent();
}
function saveSelection() {
  const selection = window.getSelection();
  if (selection?.rangeCount && editorRef.value?.contains(selection.anchorNode)) selectionRef.value = selection.getRangeAt(0).cloneRange();
}
function restoreSelection() {
  const editor = editorRef.value;
  if (!editor) return;
  editor.focus();
  const selection = window.getSelection();
  selection.removeAllRanges();
  if (selectionRef.value) selection.addRange(selectionRef.value);
  else { const range = document.createRange(); range.selectNodeContents(editor); range.collapse(false); selection.addRange(range); }
}
function escapeAttribute(value) { return value.replace(/[&<>"']/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[character])); }
function insertFile(file, type) {
  if (!file) return;
  const label = type === "image" ? "图片" : type === "audio" ? "音频" : "视频";
  if (!file.type.startsWith(`${type}/`)) { Message.error(`请选择有效的${label}文件`); return; }
  if (file.size > limits[type]) { Message.error(`${label}大小不能超过 ${type === "image" ? "8MB" : type === "audio" ? "20MB" : "50MB"}`); return; }
  const reader = new FileReader();
  reader.onload = () => {
    restoreSelection();
    const source = escapeAttribute(String(reader.result || ""));
    const markup = type === "image" ? `<img src="${source}" alt="${escapeAttribute(file.name)}">` : `<${type} src="${source}" controls preload="metadata"></${type}>`;
    document.execCommand("insertHTML", false, markup);
    syncContent();
  };
  reader.onerror = () => Message.error("媒体读取失败，请重试");
  reader.readAsDataURL(file);
}
function openPicker(event, type) {
  event.preventDefault();
  saveSelection();
  ({ image: imageInputRef, audio: audioInputRef, video: videoInputRef }[type]).value?.click();
}
function handleFile(event, type) { insertFile(event.target.files?.[0], type); event.target.value = ""; }
function handlePaste(event) {
  const mediaItem = Array.from(event.clipboardData?.items || []).find(item => item.type.startsWith("image/"));
  if (mediaItem) { event.preventDefault(); insertFile(mediaItem.getAsFile(), "image"); return; }
  event.preventDefault();
  document.execCommand("insertText", false, event.clipboardData?.getData("text/plain") || "");
  syncContent();
}
watch(() => props.modelValue, value => { if (editorRef.value && editorRef.value.innerHTML !== value) editorRef.value.innerHTML = value || ""; });
onMounted(async () => { await nextTick(); if (editorRef.value) editorRef.value.innerHTML = props.modelValue || ""; });
</script>

<template>
  <div class="rich-text-editor">
    <div class="rich-text-toolbar" role="toolbar" aria-label="文本格式">
      <template v-for="(button, index) in commandButtons" :key="button[0]">
        <a-button type="text" size="mini" :aria-label="button[0]" :title="button[0]" @mousedown.prevent="runCommand(button[2])"><component :is="button[1]" /></a-button>
      </template>
      <span class="rich-text-toolbar-divider" />
      <a-button type="text" size="mini" aria-label="插入图片" title="插入图片" @mousedown="openPicker($event, 'image')"><IconImage /></a-button>
      <a-button type="text" size="mini" aria-label="插入音频" title="插入音频" @mousedown="openPicker($event, 'audio')"><IconSound /></a-button>
      <a-button type="text" size="mini" aria-label="插入视频" title="插入视频" @mousedown="openPicker($event, 'video')"><IconVideoCamera /></a-button>
    </div>
    <input ref="imageInputRef" class="rich-text-file-input" type="file" accept="image/*" @change="handleFile($event, 'image')" />
    <input ref="audioInputRef" class="rich-text-file-input" type="file" accept="audio/*" @change="handleFile($event, 'audio')" />
    <input ref="videoInputRef" class="rich-text-file-input" type="file" accept="video/*" @change="handleFile($event, 'video')" />
    <div ref="editorRef" class="rich-text-content" contenteditable="true" role="textbox" aria-multiline="true" :data-placeholder="placeholder" @input="syncContent" @paste="handlePaste" @blur="emit('blur')" />
  </div>
</template>
