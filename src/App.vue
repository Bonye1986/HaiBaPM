<script setup>
import { computed, ref, watch } from "vue";
import { Message, Modal } from "@arco-design/web-vue";
import {
  IconArrowRise, IconCalendar, IconCheckCircle, IconClockCircle, IconDown, IconExport, IconFile,
  IconFolder, IconInfoCircle, IconLock, IconMenuFold, IconMenuUnfold, IconMore, IconNotification,
  IconApps, IconDelete, IconEdit, IconImport, IconList, IconMindMapping, IconPlus, IconQuestionCircle, IconSearch, IconSettings, IconUser, IconUserGroup,
} from "@arco-design/web-vue/es/icon";
import { phaseByKey, priorityColors, projects, statusColors, taskSeed } from "./data.js";
import RichTextEditor from "./components/RichTextEditor.vue";

const navItems = ["工作台", "项目", "任务", "日报", "工时", "团队", "统计"];
const statusOptions = ["全部状态", "未完成", "待确认", "已完成"];
const taskStatusMap = { "未开始": "未完成", "进行中": "未完成", "延期": "未完成" };
const selectedPhaseKey = ref("1500-01-01");
const expandedKeys = ref(["1500", "1500-01", "1501", "1501-01", "1502", "1502-01"]);
const selectedCustomerKey = ref("1500");
const customerCollapsed = ref(false);
const navigatorKeyword = ref("");
const phaseStatus = ref("全部状态");
const projectView = ref("tree");
const taskView = ref("list");
const recentPhaseKeys = ref(["1500-01-01", "1500-01-02"]);
const taskKeyword = ref("");
const statusFilter = ref("全部状态");
const sortBy = ref("优先级");
const dueDateFilter = ref("");
const teamMembers = ["李项目", "王芳", "张伟", "赵敏", "陈晨", "刘洋"];
const tasks = ref(taskSeed.map((task, index) => ({
  ...task,
  createdAt: task.createdAt || index,
  status: taskStatusMap[task.status] || task.status,
  confirmer: task.confirmer || task.owner,
  executors: task.executors?.length ? [...task.executors] : [task.owner],
  subtasks: task.subtasks ? [...task.subtasks] : [],
})));
const boardLanes = ref([
  { key: "incomplete", title: "未完成", color: "arcoblue" },
  { key: "pending", title: "待确认", color: "orange" },
  { key: "completed", title: "已完成", color: "green" },
]);
const boardOrder = ref(taskSeed.map(task => task.id));
const draggedTaskKey = ref(null);
const draggedLaneKey = ref(null);
const laneModalVisible = ref(false);
const laneEditingKey = ref(null);
const laneDraft = ref({ title: "", color: "arcoblue" });
const selectedTaskKeys = ref([]);
const selectedTask = ref(null);
const taskComments = ref({});
const taskActivities = ref({});
const commentDraft = ref("");
const replyingTo = ref(null);
const subtaskDraft = ref("");
const selectedProject = ref(null);
const taskModalVisible = ref(false);
const phaseDrawerVisible = ref(false);
const phaseSettingsTab = ref("basic");
const phaseEditing = ref(false);
const phaseOverrides = ref({});
const phaseDraft = ref({});
const projectRevision = ref(0);
const projectCreateModalVisible = ref(false);
const projectCreateType = ref("project");
const projectCreateMode = ref("create");
const projectCreateEditingKey = ref("");
const projectCreateDraft = ref({ customerKey: "1500", projectKey: "", projectCode: "", projectName: "", phaseCode: "", phaseName: "", phaseStatus: "未开始", phaseOwner: "李项目", phaseDatesRange: [] });
const phaseFiles = ref({
  "1500-01-01": [
    { id: "file-1", name: "一期交付范围说明.pdf", type: "PDF", size: "1.8 MB", updated: "2026-08-16" },
    { id: "file-2", name: "测试报告终版.docx", type: "DOCX", size: "426 KB", updated: "2026-08-17" },
  ],
});
const phaseMembers = ref({
  "1500-01-01": [
    { id: "member-1", name: "李项目", role: "项目经理", joinedAt: "2026-07-01", hours: 42 },
    { id: "member-2", name: "张伟", role: "服务端开发", joinedAt: "2026-07-03", hours: 36 },
    { id: "member-3", name: "陈晨", role: "测试负责人", joinedAt: "2026-07-08", hours: 18 },
  ],
});
const phaseWorklogs = ref({
  "1500-01-01": [
    { id: "log-1", date: "2026-08-18", member: "李项目", hours: 4, content: "确认登录链路测试范围并同步验收标准" },
    { id: "log-2", date: "2026-08-18", member: "张伟", hours: 6, content: "完成支付回调幂等校验与异常场景联调" },
    { id: "log-3", date: "2026-08-19", member: "陈晨", hours: 5, content: "整理测试报告问题清单并跟进回归" },
    { id: "log-4", date: "2026-08-19", member: "李项目", hours: 3, content: "评审一期交付资料和客户确认事项" },
    { id: "log-5", date: "2026-08-20", member: "张伟", hours: 4, content: "修复结算比例计算并补充单元测试" },
  ],
});
const worklogMemberFilter = ref("全部成员");
const worklogStartDate = ref("");
const worklogEndDate = ref("");
const phaseFileModalVisible = ref(false);
const phaseFileInput = ref(null);
const phaseFileEditingId = ref(null);
const phaseFileDraft = ref({ file: null, current: null });
const phaseFilePreviewVisible = ref(false);
const phaseFilePreview = ref(null);
const phaseFilePreviewUrl = ref("");
const phaseMemberModalVisible = ref(false);
const phaseMemberDraft = ref({ name: "李项目", role: "项目成员" });
const taskImportInput = ref(null);
const helpVisible = ref(false);
const projectPublicInfo = ref({
  "1500-01": { document: "<h3>客户资料</h3><p>1500-星河科技 · CRM同步</p><p>客户编号与档案由 CRM 自动同步。</p><h3>项目服务器</h3><p>生产环境 / 腾讯云华南</p><p>仅展示环境位置，不含登录凭据。</p><h3>宝塔地址</h3><p>未配置</p><h3>代码仓库</h3><p>未配置</p><h3>部署地址</h3><p>未配置</p>" },
  "0000-01": { document: "<h3>客户资料</h3><p>0000-湖南海拔互联网科技有限公司 · 自研主体</p><p>客户资料由内部系统维护。</p><h3>项目服务器</h3><p>内部开发环境</p><h3>代码仓库</h3><p>内部仓库</p>" },
});
const projectInfoModalVisible = ref(false);
const projectInfoDraft = ref("");
const emptyDraft = () => ({ title: "", module: "开发", status: "未完成", confirmer: "李项目", executors: ["李项目"], priority: "P1", due: "2026-08-31", description: "", subtasks: [] });
const draft = ref(emptyDraft());

const selectedPhase = computed(() => {
  projectRevision.value;
  const base = phaseByKey(selectedPhaseKey.value) || phaseByKey("1500-01-01");
  return { ...base, ...(phaseOverrides.value[base.key] || {}) };
});
const selectedCustomer = computed(() => { projectRevision.value; return projects.find(customer => customer.key === selectedCustomerKey.value) || null; });
const normalizedKeyword = computed(() => navigatorKeyword.value.trim());
const visibleCustomers = computed(() => projects.filter(customer => {
  projectRevision.value;
  const keyword = normalizedKeyword.value;
  return !keyword || `${customer.code}${customer.name}`.includes(keyword) || customer.projects.some(project => `${project.code}${project.name}`.includes(keyword) || project.phases.some(phase => `${phase.code}${phase.name}`.includes(keyword)));
}));
const filteredProjects = computed(() => { projectRevision.value; return projects.map(customer => {
  if (selectedCustomerKey.value && customer.key !== selectedCustomerKey.value && !normalizedKeyword.value) return null;
  const customerMatch = `${customer.code}${customer.name}`.includes(normalizedKeyword.value);
  const projectRows = customer.projects.map(project => {
    const projectMatch = `${project.code}${project.name}`.includes(normalizedKeyword.value);
    const phases = project.phases.map(phase => ({ ...phase, ...(phaseOverrides.value[phase.key] || {}) })).filter(phase => (phaseStatus.value === "全部状态" || phase.status === phaseStatus.value) && (!normalizedKeyword.value || customerMatch || projectMatch || `${phase.code}${phase.name}`.includes(normalizedKeyword.value)));
    return phases.length || (!normalizedKeyword.value && phaseStatus.value === "全部状态") ? { ...project, phases } : null;
  }).filter(Boolean);
  return projectRows.length ? { ...customer, projects: projectRows } : null;
}).filter(Boolean); });
const treeData = computed(() => filteredProjects.value.flatMap(customer => customer.projects.map(project => ({
  key: project.key,
  title: project.name,
  nodeType: "project",
  code: project.key,
  name: project.name,
  children: project.phases.map(phase => ({
    ...phase,
    title: phase.name,
    nodeType: "phase",
  })),
}))));
const phaseListData = computed(() => {
  const rows = [];
  filteredProjects.value.forEach(customer => customer.projects.forEach(project => project.phases.forEach(phase => rows.push({
    ...phase,
    customerCode: customer.code,
    customerName: customer.name,
    projectName: project.name,
    projectKey: project.key,
  }))));
  return rows;
});
const phaseTasks = computed(() => tasks.value.filter(task => task.phase === selectedPhaseKey.value));
const phaseTaskStats = computed(() => ({
  total: phaseTasks.value.length,
  completed: phaseTasks.value.filter(task => task.status === "已完成").length,
  active: phaseTasks.value.filter(task => ["未完成", "待确认"].includes(task.status)).length,
  pending: phaseTasks.value.filter(task => task.status === "待确认").length,
  overdue: phaseTasks.value.filter(task => task.status === "待确认").length,
}));
const phaseHourStats = computed(() => {
  const members = phaseMembers.value[selectedPhaseKey.value] || [];
  const logged = members.reduce((sum, member) => sum + member.hours, 0);
  return { logged, planned: Math.max(logged + 24, 80), members: members.length, average: members.length ? Math.round(logged / members.length) : 0 };
});
const currentPhaseWorklogs = computed(() => phaseWorklogs.value[selectedPhaseKey.value] || []);
const filteredWorklogs = computed(() => currentPhaseWorklogs.value.filter(log => (worklogMemberFilter.value === "全部成员" || log.member === worklogMemberFilter.value) && (!worklogStartDate.value || log.date >= worklogStartDate.value) && (!worklogEndDate.value || log.date <= worklogEndDate.value)));
const worklogMemberSummary = computed(() => teamMembers.map(member => ({ member, hours: filteredWorklogs.value.filter(log => log.member === member).reduce((sum, log) => sum + log.hours, 0) })).filter(item => item.hours > 0));
const currentPhaseFiles = computed(() => phaseFiles.value[selectedPhaseKey.value] || []);
const currentPhaseMembers = computed(() => phaseMembers.value[selectedPhaseKey.value] || []);
const selectedTaskComments = computed(() => selectedTask.value ? (taskComments.value[selectedTask.value.id] || []) : []);
const selectedTaskActivities = computed(() => selectedTask.value ? (taskActivities.value[selectedTask.value.id] || []) : []);
const visibleTasks = computed(() => phaseTasks.value.filter(task => (!taskKeyword.value || `${task.id}${task.title}${task.module}${task.owner}`.includes(taskKeyword.value)) && (statusFilter.value === "全部状态" || task.status === statusFilter.value) && (!dueDateFilter.value || task.due === dueDateFilter.value)).sort((a, b) => {
  if (sortBy.value === "优先级") return ({ P0: 0, P1: 1, P2: 2 }[a.priority] ?? 3) - ({ P0: 0, P1: 1, P2: 2 }[b.priority] ?? 3) || (a.createdAt ?? 0) - (b.createdAt ?? 0);
  if (sortBy.value === "任务名称") return a.title.localeCompare(b.title, "zh-CN");
  return a.due.localeCompare(b.due);
}));
const laneColorOptions = [
  { value: "gray", label: "灰色" }, { value: "arcoblue", label: "蓝色" },
  { value: "orange", label: "橙色" }, { value: "red", label: "红色" }, { value: "green", label: "绿色" },
];
const customerPhaseCount = customer => customer.projects.reduce((sum, project) => sum + project.phases.length, 0);
const customerScope = computed(() => { projectRevision.value; return normalizedKeyword.value ? visibleCustomers.value : (selectedCustomer.value ? [selectedCustomer.value] : projects); });
const createCustomerOptions = computed(() => { projectRevision.value; return projects; });
const createProjectOptions = computed(() => { projectRevision.value; return projects.find(customer => customer.key === projectCreateDraft.value.customerKey)?.projects || []; });
const customerStatusCounts = computed(() => Object.fromEntries(["全部状态", "进行中", "未开始", "已完成", "延期"].map(status => [status, customerScope.value.reduce((total, customer) => total + customer.projects.reduce((sum, project) => sum + project.phases.filter(phase => status === "全部状态" || phase.status === status).length, 0), 0)])));
const selectedProjectPublicDocument = computed(() => projectPublicInfo.value[selectedProject.value?.key]?.document || "");
const rowSelection = computed(() => ({ selectedRowKeys: selectedTaskKeys.value, onChange: keys => { selectedTaskKeys.value = keys; } }));
const columns = [
  { title: "任务名称", dataIndex: "title", slotName: "title", width: 194 },
  { title: "优先级", dataIndex: "priority", slotName: "priority", width: 78 },
  { title: "负责人", dataIndex: "owner", slotName: "owner", width: 96 },
  { title: "状态", dataIndex: "status", slotName: "status", width: 72 },
  { title: "截止时间", dataIndex: "due", width: 128, sortable: { sortDirections: ["ascend", "descend"] } },
  { title: "操作", slotName: "actions", width: 62, align: "center" },
];

watch(selectedPhaseKey, key => {
  selectedTaskKeys.value = [];
  recentPhaseKeys.value = [key, ...recentPhaseKeys.value.filter(item => item !== key)].slice(0, 2);
});
watch([normalizedKeyword, filteredProjects], () => {
  if (!normalizedKeyword.value) return;
  expandedKeys.value = filteredProjects.value.flatMap(customer => customer.projects.map(project => project.key));
});
function notify(text) { Message.info(text); }
function openWorkspaceMore(key) {
  if (key === "import") {
    openTaskImport();
    return;
  }
  if (key === "template") {
    downloadTaskTemplate();
    return;
  }
  if (key === "export") {
    if (taskView.value === "list") exportTasks();
    else exportBoard();
    return;
  }
  notify(`${key}将在项目模块后续页面中开放`);
}
function downloadTaskTemplate() {
  const headers = ["任务名称", "模块", "状态", "负责人", "确认人", "执行人", "优先级", "开始时间", "截止时间", "任务描述"];
  const sample = ["示例任务（请删除此行）", "服务端", "未完成", "李项目", "李项目", "张伟、陈晨", "P1", "2026-08-19", "2026-08-31", "填写任务目标、验收标准或交付说明"];
  const csv = [headers, sample]
    .map(row => row.map(value => `"${String(value ?? "").replaceAll('"', '""')}"`).join(","))
    .join("\n");
  const url = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = `${selectedPhase.value.code}-任务导入模板.csv`;
  link.click();
  URL.revokeObjectURL(url);
  Message.success("任务导入模板已下载");
}
function parseCsvLine(line) {
  const values = [];
  let value = "";
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    if (character === '"' && line[index + 1] === '"' && quoted) { value += '"'; index += 1; continue; }
    if (character === '"') { quoted = !quoted; continue; }
    if (character === "," && !quoted) { values.push(value.trim()); value = ""; continue; }
    value += character;
  }
  values.push(value.trim());
  return values;
}
function escapeImportedText(value) {
  return String(value || "").replace(/[&<>"']/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[character]));
}
function openTaskImport() { taskImportInput.value?.click(); }
function importTasks(event) {
  const file = event.target.files?.[0];
  event.target.value = "";
  if (!file) return;
  if (!file.name.toLowerCase().endsWith(".csv") && file.type !== "text/csv") { Message.error("请选择 CSV 任务文件"); return; }
  const reader = new FileReader();
  reader.onload = () => {
    const lines = String(reader.result || "").replace(/^\uFEFF/, "").split(/\r?\n/).filter(line => line.trim());
    if (lines.length < 2) { Message.warning("CSV 文件没有可导入的任务"); return; }
    const headers = parseCsvLine(lines[0]);
    const indexOf = name => headers.indexOf(name);
    const titleIndex = indexOf("任务名称");
    if (titleIndex < 0) { Message.error("CSV 缺少必填列：任务名称"); return; }
    const validStatuses = new Set(statusOptions.slice(1));
    const validPriorities = new Set(["P0", "P1", "P2"]);
    const imported = [];
    let skipped = 0;
    lines.slice(1).forEach(line => {
      const values = parseCsvLine(line);
      const title = values[titleIndex]?.trim();
      if (!title) { skipped += 1; return; }
      const status = values[indexOf("状态")]?.trim() || "未完成";
      const priority = values[indexOf("优先级")]?.trim() || "P1";
      if (!validStatuses.has(status) || !validPriorities.has(priority)) { skipped += 1; return; }
      const description = values[indexOf("任务描述")]?.trim();
      const progressValue = Number(values[indexOf("完成进度")]?.replace("%", ""));
      imported.push({
        id: `T-${Date.now().toString().slice(-6)}${imported.length}`,
        createdAt: Date.now() + imported.length,
        phase: selectedPhase.value.key,
        title,
        module: values[indexOf("模块")]?.trim() || "导入任务",
        status,
        owner: values[indexOf("负责人")]?.trim() || "李项目",
        confirmer: values[indexOf("确认人")]?.trim() || values[indexOf("负责人")]?.trim() || "李项目",
        executors: (values[indexOf("执行人")]?.split(/[、,，]/).map(value => value.trim()).filter(Boolean) || [values[indexOf("负责人")]?.trim() || "李项目"]),
        priority,
        start: values[indexOf("开始时间")]?.trim() || new Date().toISOString().slice(0, 10),
        due: values[indexOf("截止时间")]?.trim() || selectedPhase.value.dates.slice(-10),
        progress: Number.isFinite(progressValue) ? Math.max(0, Math.min(100, progressValue)) : status === "已完成" ? 100 : 0,
        description: description ? `<p>${escapeImportedText(description)}</p>` : "",
      });
    });
    if (!imported.length) { Message.warning("没有符合格式的任务可导入"); return; }
    tasks.value = [...imported, ...tasks.value];
    boardOrder.value = [...imported.map(task => task.id), ...boardOrder.value];
    Message.success(`已导入 ${imported.length} 个任务${skipped ? `，跳过 ${skipped} 行` : ""}`);
  };
  reader.onerror = () => Message.error("任务文件读取失败，请重试");
  reader.readAsText(file, "utf-8");
}
function projectByKey(key) { for (const customer of projects) { const project = customer.projects.find(item => item.key === key); if (project) return { ...project, customerCode: customer.code, customerName: customer.name }; } return null; }
function emptyProjectCreateDraft(customerKey = selectedCustomerKey.value || projects[0]?.key || "") {
  return { customerKey, projectKey: "", projectCode: "", projectName: "", phaseCode: "", phaseName: "", phaseStatus: "未开始", phaseOwner: "李项目", phaseDatesRange: [] };
}
function openProjectCreateModal() {
  projectCreateMode.value = "create";
  projectCreateEditingKey.value = "";
  projectCreateType.value = "project";
  projectCreateDraft.value = emptyProjectCreateDraft();
  projectCreateModalVisible.value = true;
}
function openProjectEdit(project) {
  const current = projectByKey(project.key) || project;
  projectCreateMode.value = "edit";
  projectCreateEditingKey.value = current.key;
  projectCreateType.value = "project";
  projectCreateDraft.value = {
    ...emptyProjectCreateDraft(current.customerCode),
    projectCode: current.code,
    projectName: current.name,
  };
  projectCreateModalVisible.value = true;
}
function openPhaseEdit(phase) {
  const current = phaseByKey(phase.key) || phase;
  projectCreateMode.value = "edit";
  projectCreateEditingKey.value = current.key;
  projectCreateType.value = "phase";
  projectCreateDraft.value = {
    ...emptyProjectCreateDraft(current.customerCode),
    projectKey: `${current.customerCode}-${current.projectCode}`,
    phaseCode: current.code,
    phaseName: current.name,
    phaseStatus: current.status,
    phaseOwner: current.owner,
    phaseDatesRange: current.dates.split(" 至 "),
  };
  projectCreateModalVisible.value = true;
}
function removeProject(project) {
  const current = projectByKey(project.key) || project;
  const customer = projects.find(item => item.key === current.customerCode);
  if (!customer) return;
  const target = customer.projects.find(item => item.key === current.key);
  if (!target) return;
  Modal.confirm({
    title: "删除项目",
    content: target.phases.length ? `“${target.name}”包含 ${target.phases.length} 个期号，删除后将一并移除，是否继续？` : `确定删除项目“${target.name}”吗？`,
    okText: "删除",
    cancelText: "取消",
    onOk: () => {
      customer.projects = customer.projects.filter(item => item.key !== target.key);
      projectRevision.value += 1;
      if (selectedProject.value?.key === target.key) selectedProject.value = null;
      const nextPhase = customer.projects.flatMap(item => item.phases)[0] || projects.flatMap(item => item.projects.flatMap(projectItem => projectItem.phases))[0];
      if (nextPhase) selectedPhaseKey.value = nextPhase.key;
      Message.success("项目已删除");
    },
  });
}
function removePhase(phase) {
  const current = phaseByKey(phase.key) || phase;
  const customer = projects.find(item => item.key === current.customerCode);
  const target = customer?.projects.find(item => item.key === `${current.customerCode}-${current.projectCode}`);
  if (!target) return;
  Modal.confirm({
    title: "删除期号",
    content: `确定删除期号“${current.name}”吗？该期号下的任务和资料入口也会移除。`,
    okText: "删除",
    cancelText: "取消",
    onOk: () => {
      target.phases = target.phases.filter(item => item.key !== current.key);
      projectRevision.value += 1;
      if (selectedPhaseKey.value === current.key) {
        const fallback = target.phases[0] || projects.flatMap(item => item.projects.flatMap(projectItem => projectItem.phases))[0];
        if (fallback) selectedPhaseKey.value = fallback.key;
      }
      Message.success("期号已删除");
    },
  });
}
function openTreeNodeMenu(node, action) {
  if (action === "edit") return node.nodeType === "project" ? openProjectEdit(node) : openPhaseEdit(node);
  return node.nodeType === "project" ? removeProject(node) : removePhase(node);
}
function switchProjectCreateType(type) {
  projectCreateType.value = type;
  if (type === "phase" && !projectCreateDraft.value.projectKey) {
    projectCreateDraft.value = { ...projectCreateDraft.value, projectKey: createProjectOptions.value[0]?.key || "" };
  }
}
function changeProjectCreateCustomer(customerKey) {
  const firstProject = projects.find(customer => customer.key === customerKey)?.projects[0];
  projectCreateDraft.value = { ...projectCreateDraft.value, customerKey, projectKey: projectCreateType.value === "phase" ? firstProject?.key || "" : "" };
}
function saveProjectCreate() {
  const draftValue = projectCreateDraft.value;
  const customer = projects.find(item => item.key === draftValue.customerKey);
  if (!customer) { Message.warning("请选择客户"); return; }
  if (projectCreateType.value === "project") {
    const code = String(draftValue.projectCode || "").trim();
    const name = String(draftValue.projectName || "").trim();
    if (!code || !name) { Message.warning("请填写项目编号和项目名称"); return; }
    if (projectCreateMode.value === "edit") {
      const target = customer.projects.find(project => project.key === projectCreateEditingKey.value);
      if (!target) { Message.warning("项目不存在或已被删除"); return; }
      if (customer.projects.some(project => project.key !== target.key && (project.code === code || project.name === name))) { Message.warning("该客户下已存在相同项目"); return; }
      target.code = code;
      target.name = name;
      if (selectedProject.value?.key === target.key) selectedProject.value = projectByKey(target.key);
      projectRevision.value += 1;
      projectCreateModalVisible.value = false;
      Message.success("项目已更新");
      return;
    }
    if (customer.projects.some(project => project.code === code || project.name === name)) { Message.warning("该客户下已存在相同项目"); return; }
    const projectKey = `${customer.key}-${code}`;
    customer.projects.push({ key: projectKey, code, name, phases: [] });
    projectRevision.value += 1;
    selectedCustomerKey.value = customer.key;
    expandedKeys.value = [customer.key, projectKey];
    projectCreateModalVisible.value = false;
    Message.success("项目已添加");
    return;
  }
  const project = customer.projects.find(item => item.key === draftValue.projectKey);
  const phaseCodeInput = String(draftValue.phaseCode || "").trim();
  const phaseName = String(draftValue.phaseName || "").trim();
  const datesRange = Array.isArray(draftValue.phaseDatesRange) ? draftValue.phaseDatesRange.filter(Boolean) : [];
  if (!project) { Message.warning("请选择项目"); return; }
  if (!phaseCodeInput || !phaseName || !draftValue.phaseOwner || datesRange.length !== 2) { Message.warning("请填写期号编号、名称、负责人和完整计划时间"); return; }
  const phaseCode = phaseCodeInput.includes("-") ? phaseCodeInput : `${customer.code}-${project.code}-${phaseCodeInput}`;
  if (projectCreateMode.value === "edit") {
    const target = project.phases.find(phase => phase.key === projectCreateEditingKey.value);
    if (!target) { Message.warning("期号不存在或已被删除"); return; }
    if (project.phases.some(phase => phase.key !== target.key && (phase.code === phaseCode || phase.name === phaseName))) { Message.warning("该项目下已存在相同期号"); return; }
    target.code = phaseCode;
    target.key = phaseCode;
    target.name = phaseName;
    target.status = draftValue.phaseStatus;
    target.owner = draftValue.phaseOwner;
    target.dates = formatPhaseDateRange(datesRange);
    const previousKey = projectCreateEditingKey.value;
    if (previousKey !== phaseCode) {
      tasks.value = tasks.value.map(task => task.phase === previousKey ? { ...task, phase: phaseCode } : task);
      boardOrder.value = [...boardOrder.value];
      if (phaseFiles.value[previousKey]) {
        phaseFiles.value = { ...phaseFiles.value, [phaseCode]: phaseFiles.value[previousKey] };
        delete phaseFiles.value[previousKey];
      }
      if (phaseMembers.value[previousKey]) {
        phaseMembers.value = { ...phaseMembers.value, [phaseCode]: phaseMembers.value[previousKey] };
        delete phaseMembers.value[previousKey];
      }
      if (phaseWorklogs.value[previousKey]) {
        phaseWorklogs.value = { ...phaseWorklogs.value, [phaseCode]: phaseWorklogs.value[previousKey] };
        delete phaseWorklogs.value[previousKey];
      }
      if (phaseOverrides.value[previousKey]) {
        phaseOverrides.value = { ...phaseOverrides.value, [phaseCode]: phaseOverrides.value[previousKey] };
        delete phaseOverrides.value[previousKey];
      }
      recentPhaseKeys.value = recentPhaseKeys.value.map(key => key === previousKey ? phaseCode : key);
    }
    if (selectedPhaseKey.value === previousKey) selectedPhaseKey.value = phaseCode;
    projectRevision.value += 1;
    projectCreateModalVisible.value = false;
    Message.success("期号已更新");
    return;
  }
  if (project.phases.some(phase => phase.code === phaseCode || phase.name === phaseName)) { Message.warning("该项目下已存在相同期号"); return; }
  const phase = { key: phaseCode, code: phaseCode, name: phaseName, status: draftValue.phaseStatus, progress: 0, dates: formatPhaseDateRange(datesRange), owner: draftValue.phaseOwner };
  project.phases.push(phase);
  projectRevision.value += 1;
  selectedCustomerKey.value = customer.key;
  selectedPhaseKey.value = phase.key;
  phaseStatus.value = "全部状态";
  navigatorKeyword.value = "";
  expandedKeys.value = [customer.key, project.key];
  projectCreateModalVisible.value = false;
  Message.success("期号已添加");
}
function selectCustomer(customer) {
  if (selectedCustomerKey.value === customer.key) { selectedCustomerKey.value = null; navigatorKeyword.value = ""; phaseStatus.value = "全部状态"; expandedKeys.value = projects.flatMap(item => [item.key, ...item.projects.map(project => project.key)]); return; }
  selectedCustomerKey.value = customer.key; navigatorKeyword.value = ""; phaseStatus.value = "全部状态";
  const firstProject = customer.projects[0]; const firstPhase = firstProject?.phases[0]; expandedKeys.value = firstProject ? [firstProject.key] : [];
  if (firstPhase) selectedPhaseKey.value = firstPhase.key;
}
function onTreeSelect(keys) {
  const key = keys[0]; const phase = phaseByKey(key); const project = projectByKey(key);
  if (phase) selectedPhaseKey.value = key;
  if (project) selectedProject.value = project;
}
function selectPhase(phase) { selectedPhaseKey.value = phase.key; }
function openProject(project) { selectedProject.value = projectByKey(project.key) || project; }
function openProjectInfoEditor() {
  if (!selectedProject.value) return;
  projectInfoDraft.value = projectPublicInfo.value[selectedProject.value.key]?.document || "";
  projectInfoModalVisible.value = true;
}
function saveProjectInfo() {
  if (!selectedProject.value) return;
  projectPublicInfo.value = {
    ...projectPublicInfo.value,
    [selectedProject.value.key]: { document: projectInfoDraft.value.trim() },
  };
  projectInfoModalVisible.value = false;
  Message.success("项目公共资料已保存");
}
function createTask() {
  const executors = draft.value.executors?.length ? [...draft.value.executors] : [draft.value.confirmer || "李项目"];
  const task = { ...draft.value, subtasks: [...(draft.value.subtasks || [])], createdAt: Date.now(), owner: executors[0], confirmer: draft.value.confirmer || "李项目", executors, id: `T-${Date.now().toString().slice(-6)}`, phase: selectedPhase.value.key, start: "2026-08-18", progress: draft.value.status === "已完成" ? 100 : 0 };
  tasks.value = [task, ...tasks.value]; boardOrder.value = [task.id, ...boardOrder.value];
  appendTaskActivity(task.id, "创建任务", `创建任务“${task.title}”`);
  taskModalVisible.value = false; Message.success("任务创建成功");
}
function addSubtask() {
  const title = subtaskDraft.value.trim();
  if (!title) { Message.warning("请输入子任务名称"); return; }
  draft.value.subtasks = [...(draft.value.subtasks || []), { id: `subtask-${Date.now()}`, title, status: "未完成" }];
  subtaskDraft.value = "";
}
function removeSubtask(subtask) { draft.value.subtasks = (draft.value.subtasks || []).filter(item => item.id !== subtask.id); }
function exportTasks() {
  const selected = selectedTaskKeys.value.length
    ? visibleTasks.value.filter(task => selectedTaskKeys.value.includes(task.id))
    : visibleTasks.value;
  if (!selected.length) {
    Message.warning("当前没有可导出的任务");
    return;
  }
  const headers = ["任务编号", "任务名称", "模块", "状态", "负责人", "确认人", "执行人", "优先级", "开始时间", "截止时间", "完成进度"];
  const rows = selected.map(task => [task.id, task.title, task.module, task.status, task.owner, task.confirmer || task.owner, (task.executors || [task.owner]).join("、"), task.priority, task.start, task.due, `${task.progress}%`]);
  const csv = [headers, ...rows]
    .map(row => row.map(value => `"${String(value ?? "").replaceAll('"', '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${selectedPhase.value.code}-任务清单.csv`;
  link.click();
  URL.revokeObjectURL(url);
  Message.success(`已导出 ${selected.length} 个任务`);
}
function orderedBoardTasks(lane) {
  const order = new Map(boardOrder.value.map((id, index) => [id, index]));
  return visibleTasks.value.filter(task => task.status === lane.title).sort((a, b) => ({ P0: 0, P1: 1, P2: 2 }[a.priority] ?? 3) - ({ P0: 0, P1: 1, P2: 2 }[b.priority] ?? 3) || (a.createdAt ?? order.get(a.id) ?? 0) - (b.createdAt ?? order.get(b.id) ?? 0));
}
function openLaneModal(lane = null) {
  laneEditingKey.value = lane?.key || null;
  laneDraft.value = { title: lane?.title || "", color: lane?.color || "arcoblue" };
  laneModalVisible.value = true;
}
function saveLane() {
  const title = laneDraft.value.title.trim();
  if (!title) { Message.warning("请输入看板列名称"); return; }
  if (boardLanes.value.some(lane => lane.title === title && lane.key !== laneEditingKey.value)) { Message.warning("看板列名称不能重复"); return; }
  if (laneEditingKey.value) {
    const previous = boardLanes.value.find(lane => lane.key === laneEditingKey.value);
    boardLanes.value = boardLanes.value.map(lane => lane.key === laneEditingKey.value ? { ...lane, title, color: laneDraft.value.color } : lane);
    if (previous && previous.title !== title) tasks.value = tasks.value.map(task => task.status === previous.title ? { ...task, status: title } : task);
    Message.success("看板列已更新");
  } else {
    boardLanes.value = [...boardLanes.value, { key: `lane-${Date.now()}`, title, color: laneDraft.value.color }];
    Message.success("看板列已添加");
  }
  laneModalVisible.value = false;
}
function deleteLane(lane) {
  if (boardLanes.value.length <= 1) { Message.warning("至少保留一个看板列"); return; }
  const fallback = boardLanes.value.find(item => item.key !== lane.key);
  const affected = tasks.value.filter(task => task.status === lane.title).length;
  boardLanes.value = boardLanes.value.filter(item => item.key !== lane.key);
  if (affected) tasks.value = tasks.value.map(task => task.status === lane.title ? { ...task, status: fallback.title } : task);
  Message.success(affected ? `看板列已删除，${affected} 个任务已移入“${fallback.title}”` : "看板列已删除");
}
function exportBoard() {
  const rows = boardLanes.value.flatMap(lane => orderedBoardTasks(lane).map(task => [lane.title, task.id, task.title, task.module, task.status, task.owner, task.confirmer || task.owner, (task.executors || [task.owner]).join("、"), task.priority, task.due]));
  if (!rows.length) { Message.warning("当前看板没有可导出的任务"); return; }
  const headers = ["看板列", "任务编号", "任务名称", "模块", "状态", "负责人", "确认人", "执行人", "优先级", "截止时间"];
  const csv = [headers, ...rows].map(row => row.map(value => `"${String(value ?? "").replaceAll('"', '""')}"`).join(",")).join("\n");
  const url = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a"); link.href = url; link.download = `${selectedPhase.value.code}-看板任务.csv`; link.click(); URL.revokeObjectURL(url);
  Message.success(`已导出 ${rows.length} 个任务`);
}
function moveTask(taskKey, targetKey, laneTitle) {
  const nextOrder = boardOrder.value.filter(id => id !== taskKey);
  const targetIndex = targetKey ? nextOrder.indexOf(targetKey) : nextOrder.length;
  nextOrder.splice(targetIndex < 0 ? nextOrder.length : targetIndex, 0, taskKey);
  boardOrder.value = nextOrder;
  tasks.value = tasks.value.map(task => task.id === taskKey ? { ...task, status: laneTitle } : task);
}
function startTaskDrag(task, event) {
  draggedTaskKey.value = task.id;
  event.dataTransfer.effectAllowed = "move";
  event.dataTransfer.setData("text/plain", task.id);
}
function dropTaskOnLane(lane, event) {
  event.preventDefault();
  const taskKey = draggedTaskKey.value || event.dataTransfer.getData("text/plain");
  if (taskKey) moveTask(taskKey, null, lane.title);
  draggedTaskKey.value = null;
}
function dropTaskBefore(task, lane, event) {
  event.preventDefault();
  event.stopPropagation();
  const taskKey = draggedTaskKey.value || event.dataTransfer.getData("text/plain");
  if (taskKey && taskKey !== task.id) moveTask(taskKey, task.id, lane.title);
  draggedTaskKey.value = null;
}
function startLaneDrag(lane, event) {
  draggedLaneKey.value = lane.key;
  event.dataTransfer.effectAllowed = "move";
  event.dataTransfer.setData("application/x-haiba-lane", lane.key);
}
function dropLane(lane, event) {
  event.preventDefault();
  const laneKey = draggedLaneKey.value || event.dataTransfer.getData("application/x-haiba-lane");
  if (!laneKey || laneKey === lane.key) return;
  const next = boardLanes.value.filter(item => item.key !== laneKey);
  const source = boardLanes.value.find(item => item.key === laneKey);
  const targetIndex = next.findIndex(item => item.key === lane.key);
  if (source) next.splice(targetIndex < 0 ? next.length : targetIndex, 0, source);
  boardLanes.value = next;
  draggedLaneKey.value = null;
}
function openTaskModal() { draft.value = emptyDraft(); taskModalVisible.value = true; }
function appendTaskActivity(taskId, action, detail) {
  const activity = { id: `activity-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, action, detail, operator: "李项目", createdAt: "刚刚" };
  taskActivities.value = { ...taskActivities.value, [taskId]: [activity, ...(taskActivities.value[taskId] || [])] };
}
function updateTaskStatus(id, status, message = "任务状态已更新") {
  const current = tasks.value.find(task => task.id === id);
  if (!current || current.status === status) return;
  tasks.value = tasks.value.map(task => task.id === id ? { ...task, status, progress: status === "已完成" ? 100 : task.progress } : task);
  if (selectedTask.value?.id === id) selectedTask.value = { ...selectedTask.value, status };
  appendTaskActivity(id, "更新状态", `${current.status} → ${status}`);
  Message.success(message);
}
function toggleSubtask(taskId, subtask) {
  const nextStatus = subtask.status === "已完成" ? "未完成" : "已完成";
  tasks.value = tasks.value.map(task => task.id === taskId ? { ...task, subtasks: (task.subtasks || []).map(item => item.id === subtask.id ? { ...item, status: nextStatus } : item) } : task);
  if (selectedTask.value?.id === taskId) selectedTask.value = { ...selectedTask.value, subtasks: (selectedTask.value.subtasks || []).map(item => item.id === subtask.id ? { ...item, status: nextStatus } : item) };
  appendTaskActivity(taskId, "更新子任务", `${subtask.title} → ${nextStatus}`);
}
function onTaskRowClick(record) { selectedTask.value = record; commentDraft.value = ""; replyingTo.value = null; subtaskDraft.value = ""; }
function commentText(html) { return String(html || "").replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ").trim(); }
function replyToComment(comment) {
  replyingTo.value = comment;
  commentDraft.value = `<p>@${comment.author} </p>`;
}
function addTaskComment() {
  if (!selectedTask.value || !commentText(commentDraft.value)) { Message.warning("请输入评论内容"); return; }
  const taskId = selectedTask.value.id;
  const comment = {
    id: `comment-${Date.now()}`,
    author: "李项目",
    createdAt: "刚刚",
    content: commentDraft.value,
    parentId: replyingTo.value?.id || null,
  };
  taskComments.value = { ...taskComments.value, [taskId]: [...(taskComments.value[taskId] || []), comment] };
  appendTaskActivity(taskId, replyingTo.value ? "回复评论" : "发表评论", replyingTo.value ? `回复${replyingTo.value.author}的评论` : "发布了任务评论");
  commentDraft.value = "";
  replyingTo.value = null;
  Message.success("评论已发布");
}
function submitTaskResult() {
  if (!selectedTask.value) return;
  const taskId = selectedTask.value.id;
  if (selectedTask.value.status === "待确认") return;
  updateTaskStatus(taskId, "待确认", "任务结果已提交，等待确认");
}
function handleTaskConfirmation(passed) {
  if (!selectedTask.value || selectedTask.value.status !== "待确认") return;
  updateTaskStatus(selectedTask.value.id, passed ? "已完成" : "未完成", passed ? "确认通过，任务已完成" : "确认不通过，任务已退回未完成");
}
function parsePhaseDateRange(dates) {
  const [start = "", end = ""] = String(dates || "").split(/\s+至\s+/);
  return [start, end].filter(Boolean);
}
function formatPhaseDateRange(range) {
  const dates = Array.isArray(range) ? range.filter(Boolean) : [];
  return dates.length === 2 ? `${dates[0]} 至 ${dates[1]}` : "";
}
function preparePhaseDraft() {
  phaseDraft.value = { ...selectedPhase.value, phaseNumber: selectedPhase.value.code.split("-").at(-1), datesRange: parsePhaseDateRange(selectedPhase.value.dates) };
}
function openPhaseSettings() {
  phaseSettingsTab.value = "basic";
  phaseEditing.value = true;
  preparePhaseDraft();
  phaseDrawerVisible.value = true;
}
function startPhaseEdit() {
  preparePhaseDraft();
  phaseEditing.value = true;
}
function savePhaseBasicInfo() {
  const phaseNumber = String(phaseDraft.value.phaseNumber || "").trim();
  const name = String(phaseDraft.value.name || "").trim();
  const owner = String(phaseDraft.value.owner || "").trim();
  const datesRange = Array.isArray(phaseDraft.value.datesRange) ? phaseDraft.value.datesRange.filter(Boolean) : [];
  if (!phaseNumber || !name || !owner || datesRange.length !== 2) { Message.warning("请补充期号、期号名称、负责人和完整计划时间"); return false; }
  if (datesRange[0] > datesRange[1]) { Message.warning("计划时间的结束日期不能早于开始日期"); return false; }
  const current = selectedPhase.value;
  const customer = projects.find(item => item.key === current.customerCode);
  const project = customer?.projects.find(item => item.code === current.projectCode);
  const target = project?.phases.find(item => item.key === current.key);
  const nextCode = `${current.customerCode}-${current.projectCode}-${phaseNumber}`;
  if (!target || !project) { Message.error("当前期号不存在或已被删除"); return false; }
  if (project.phases.some(phase => phase.key !== target.key && phase.code === nextCode)) { Message.warning("当前项目下期号不能重复"); return false; }
  const nextOverride = { name, owner, status: phaseDraft.value.status, dates: formatPhaseDateRange(datesRange) };
  const previousKey = target.key;
  target.code = nextCode;
  target.key = nextCode;
  Object.assign(target, nextOverride);
  if (previousKey !== nextCode) {
    tasks.value = tasks.value.map(task => task.phase === previousKey ? { ...task, phase: nextCode } : task);
    for (const source of [phaseFiles, phaseMembers, phaseWorklogs]) {
      if (source.value[previousKey]) {
        source.value = { ...source.value, [nextCode]: source.value[previousKey] };
        delete source.value[previousKey];
      }
    }
    recentPhaseKeys.value = recentPhaseKeys.value.map(key => key === previousKey ? nextCode : key);
  }
  phaseOverrides.value = { ...phaseOverrides.value, [nextCode]: nextOverride };
  if (previousKey !== nextCode) delete phaseOverrides.value[previousKey];
  if (selectedPhaseKey.value === previousKey) selectedPhaseKey.value = nextCode;
  projectRevision.value += 1;
  Message.success("期号基本信息已保存");
  return true;
}
function confirmPhaseSettings() { if (savePhaseBasicInfo()) phaseDrawerVisible.value = false; }
function openPhaseFileModal() { phaseFileEditingId.value = null; phaseFileDraft.value = { file: null, current: null }; if (phaseFileInput.value) phaseFileInput.value.value = ""; phaseFileModalVisible.value = true; }
function openPhaseFileEdit(file) { phaseFileEditingId.value = file.id; phaseFileDraft.value = { file: null, current: file }; if (phaseFileInput.value) phaseFileInput.value.value = ""; phaseFileModalVisible.value = true; }
function formatFileSize(bytes) {
  if (!bytes) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${(bytes / 1024 / 1024 / 1024).toFixed(1)} GB`;
}
function handlePhaseFileChange(event) {
  const file = event.target.files?.[0] || null;
  phaseFileDraft.value = { ...phaseFileDraft.value, file };
}
function savePhaseFile() {
  const file = phaseFileDraft.value.file;
  if (!file) { Message.warning("请选择要上传的文件"); return; }
  const extension = file.name.includes(".") ? file.name.split(".").pop().toUpperCase() : "文件";
  const metadata = { name: file.name, type: extension, size: formatFileSize(file.size), source: file, updated: new Date().toISOString().slice(0, 10) };
  const nextFiles = phaseFileEditingId.value
    ? currentPhaseFiles.value.map(item => item.id === phaseFileEditingId.value ? { ...item, ...metadata } : item)
    : [...currentPhaseFiles.value, { id: `file-${Date.now()}`, ...metadata }];
  phaseFiles.value = { ...phaseFiles.value, [selectedPhase.value.key]: nextFiles };
  phaseFileModalVisible.value = false;
  Message.success(phaseFileEditingId.value ? "项目文件已更新" : "项目文件已添加");
  phaseFileEditingId.value = null;
}
function previewPhaseFile(file) {
  if (phaseFilePreviewUrl.value) URL.revokeObjectURL(phaseFilePreviewUrl.value);
  phaseFilePreview.value = file;
  phaseFilePreviewUrl.value = file.source ? URL.createObjectURL(file.source) : "";
  phaseFilePreviewVisible.value = true;
}
function closePhaseFilePreview() {
  if (phaseFilePreviewUrl.value) URL.revokeObjectURL(phaseFilePreviewUrl.value);
  phaseFilePreviewUrl.value = "";
  phaseFilePreview.value = null;
  phaseFilePreviewVisible.value = false;
}
function removePhaseFile(file) {
  phaseFiles.value = { ...phaseFiles.value, [selectedPhase.value.key]: currentPhaseFiles.value.filter(item => item.id !== file.id) };
  Message.success("项目文件已移除");
}
function openPhaseMemberModal() { phaseMemberDraft.value = { name: "李项目", role: "项目成员" }; phaseMemberModalVisible.value = true; }
function savePhaseMember() {
  const name = phaseMemberDraft.value.name.trim();
  if (!name) { Message.warning("请选择成员"); return; }
  if (currentPhaseMembers.value.some(member => member.name === name)) { Message.warning("该成员已在期号成员中"); return; }
  const nextMember = { id: `member-${Date.now()}`, name, role: phaseMemberDraft.value.role || "项目成员", joinedAt: new Date().toISOString().slice(0, 10), hours: 0 };
  phaseMembers.value = { ...phaseMembers.value, [selectedPhase.value.key]: [...currentPhaseMembers.value, nextMember] };
  phaseMemberModalVisible.value = false;
  Message.success("期号成员已添加");
}
function removePhaseMember(member) {
  if (currentPhaseMembers.value.length <= 1) { Message.warning("至少保留一名期号成员"); return; }
  phaseMembers.value = { ...phaseMembers.value, [selectedPhase.value.key]: currentPhaseMembers.value.filter(item => item.id !== member.id) };
  Message.success("期号成员已移除");
}
function phaseStatusColor(status) { return statusColors[status] || "gray"; }
</script>

<template>
  <div class="app-shell">
    <header class="global-header">
      <a-button class="brand" type="text" @click="notify('海拔PM')"><IconArrowRise /><strong>海拔PM</strong></a-button>
      <a-menu class="global-nav" mode="horizontal" :selected-keys="['项目']" @menu-item-click="key => key !== '项目' && notify(`${key}模块将在后续设计`)"><a-menu-item v-for="item in navItems" :key="item">{{ item }}</a-menu-item></a-menu>
      <div class="header-actions">
        <a-tooltip content="帮助中心"><a-button type="text" @click="helpVisible = true"><IconQuestionCircle />帮助</a-button></a-tooltip>
        <a-dropdown trigger="click"><a-button type="text"><IconNotification />通知</a-button><template #content><div class="notification-panel"><header><strong>通知</strong><a-button type="text" size="mini">全部已读</a-button></header><button><IconClockCircle /><span><strong>任务即将逾期</strong><small>支付回调幂等校验将在 3 天后到期</small></span></button><button><IconCheckCircle /><span><strong>任务等待确认</strong><small>核对审核状态流转已提交确认</small></span></button><button><IconInfoCircle /><span><strong>期号进度更新</strong><small>一期核心交付进度已更新为 68%</small></span></button></div></template></a-dropdown>
        <a-dropdown trigger="click"><button class="profile-trigger"><a-avatar :size="32">李</a-avatar><span><strong>李项目</strong><small>项目经理</small></span><IconDown /></button><template #content><a-menu class="account-menu"><div class="account-summary"><a-avatar :size="38">李</a-avatar><div><strong>李项目</strong><small>lixiangmu@haiba.example</small></div></div><a-menu-item key="profile" @click="notify('账号设置将在系统设置模块开放')"><IconUser />个人信息</a-menu-item><a-menu-item key="password"><IconLock />修改密码</a-menu-item><a-menu-item key="settings"><IconSettings />系统设置</a-menu-item><a-menu-item key="logout"><IconExport />退出登录</a-menu-item></a-menu></template></a-dropdown>
      </div>
    </header>

    <div class="project-layout">
      <aside class="project-navigator">
        <div class="navigator-heading"><h1>客户 / 项目 + 期号</h1><a-radio-group class="project-view-control" type="button" size="small" v-model="projectView"><a-radio value="tree" title="项目树" aria-label="项目树"><IconMindMapping /></a-radio><a-radio value="list" title="列表" aria-label="列表"><IconList /></a-radio></a-radio-group></div>
        <div class="navigator-search"><a-input v-model="navigatorKeyword" allow-clear placeholder="搜索客户、项目或期号"><template #prefix><IconSearch /></template></a-input></div>
        <div class="navigator-body" :class="{ 'customer-collapsed': customerCollapsed }">
          <section class="customer-panel" :class="{ 'customer-panel-collapsed': customerCollapsed }">
            <template v-if="customerCollapsed"><a-tooltip content="展开客户栏"><a-button class="customer-panel-toggle customer-expand-button" type="text" @click="customerCollapsed = false"><IconMenuUnfold /></a-button></a-tooltip><span class="customer-collapsed-label">客户</span></template>
            <template v-else><div class="subpanel-heading"><h2>客户</h2><a-tooltip content="收起客户栏"><a-button class="customer-panel-toggle" type="text" @click="customerCollapsed = true"><IconMenuFold /></a-button></a-tooltip></div><div class="customer-list"><button v-for="customer in visibleCustomers" :key="customer.key" :class="{ active: selectedCustomerKey === customer.key }" :title="`${customer.code}-${customer.name}`" @click="selectCustomer(customer)"><strong>{{ customer.code }}-{{ customer.name }}</strong><em>{{ customerPhaseCount(customer) }}</em></button><a-empty v-if="!visibleCustomers.length" description="没有匹配的客户" /></div></template>
          </section>
          <section class="project-sidebar"><div class="subpanel-heading"><h2>项目 + 期号</h2><a-tooltip content="添加项目或期号"><a-button class="project-add-button" type="text" aria-label="添加项目或期号" @click="openProjectCreateModal"><IconPlus /></a-button></a-tooltip></div><section class="quick-section"><header><h2>快速入口</h2></header><button v-for="key in recentPhaseKeys" :key="key" :class="{ active: selectedPhaseKey === key }" @click="selectedPhaseKey = key"><IconClockCircle /><span><strong>{{ phaseByKey(key)?.code }}　{{ phaseByKey(key)?.name }}</strong><small>最近打开 · {{ phaseByKey(key)?.projectName }}</small></span></button></section><div class="project-status-tabs"><button v-for="(count, status) in customerStatusCounts" :key="status" :class="{ active: phaseStatus === status }" @click="phaseStatus = status">{{ status === '全部状态' ? '全部' : status }}<b>{{ count }}</b></button></div><a-tree v-if="projectView === 'tree'" class="tree-section" :data="treeData" :expanded-keys="expandedKeys" :selected-keys="[selectedPhaseKey]" block-node show-line @expand="keys => expandedKeys = keys" @select="onTreeSelect"><template #title="node"><div v-if="node.nodeType === 'project'" class="tree-project-title"><IconFolder /><span><b>{{ node.code }}</b>{{ node.name }}</span><a-dropdown trigger="click" @select="action => openTreeNodeMenu(node, action)"><a-button class="tree-node-more" type="text" size="mini" aria-label="项目更多操作" @click.stop><IconMore /></a-button><template #content><a-doption value="edit"><IconEdit />编辑项目</a-doption><a-doption value="delete" class="tree-danger-option"><IconDelete />删除项目</a-doption></template></a-dropdown></div><div v-else class="tree-phase-title"><div class="tree-phase-main"><span class="tree-phase-code">{{ node.code }}</span><span class="tree-phase-name">{{ node.name }}</span><a-dropdown trigger="click" @select="action => openTreeNodeMenu(node, action)"><a-button class="tree-node-more" type="text" size="mini" aria-label="期号更多操作" @click.stop><IconMore /></a-button><template #content><a-doption value="edit"><IconEdit />编辑期号</a-doption><a-doption value="delete" class="tree-danger-option"><IconDelete />删除期号</a-doption></template></a-dropdown></div><div class="tree-phase-meta"><span>负责人：{{ node.owner }}</span><a-tag :color="phaseStatusColor(node.status)">{{ node.status }}</a-tag></div></div></template></a-tree><section v-else class="phase-list-section"><div v-for="phase in phaseListData" :key="phase.key" class="phase-list-card" :class="{ active: phase.key === selectedPhaseKey }" role="button" tabindex="0" @click="selectPhase(phase)"><div class="phase-list-main"><strong><span class="phase-list-code">{{ phase.code }}</span>{{ phase.name }}</strong><div class="phase-list-meta"><span v-if="normalizedKeyword" class="phase-customer-label">{{ phase.customerCode }}-{{ phase.customerName }}</span><a-button type="text" size="mini" class="phase-project-link" @click.stop="openProject({ key: phase.projectKey })"><IconFolder />{{ phase.projectName }}</a-button><span>负责人：{{ phase.owner }}</span></div></div><div class="phase-list-side"><a-tag :color="phaseStatusColor(phase.status)">{{ phase.status }}</a-tag><div class="phase-progress"><a-progress :percent="phase.progress / 100" size="small" :show-text="false" /><span>{{ phase.progress }}%</span></div></div></div><a-empty v-if="!phaseListData.length" description="没有匹配的期号" /></section></section>
        </div>
      </aside>

      <main class="task-workspace">
        <section class="phase-header"><div class="phase-identity"><div class="phase-copy"><div class="phase-title-row"><h2>{{ selectedPhase.name }}</h2><a-tag :color="phaseStatusColor(selectedPhase.status)">{{ selectedPhase.status }}</a-tag></div><p>{{ selectedPhase.code }} · {{ selectedPhase.projectName }}</p><div class="phase-meta"><span><IconCalendar />{{ selectedPhase.dates }}</span><span><IconUserGroup />负责人：{{ selectedPhase.owner }}</span></div></div></div><a-tooltip content="期号设置"><a-button class="phase-settings-button" aria-label="期号设置" @click="openPhaseSettings"><IconSettings /></a-button></a-tooltip></section>
        <section class="task-control-bar"><a-radio-group class="task-view-switch" type="button" size="small" v-model="taskView"><a-radio value="list"><IconList />任务列表</a-radio><a-radio value="board"><IconApps />看板视图</a-radio></a-radio-group><div class="task-tools"><a-input v-model="taskKeyword" allow-clear placeholder="搜索任务名称"><template #prefix><IconSearch /></template></a-input><a-select v-model="statusFilter" :style="{ width: '118px' }"><a-option v-for="status in statusOptions" :key="status" :value="status">{{ status }}</a-option></a-select><a-date-picker v-model="dueDateFilter" class="task-due-filter" format="YYYY-MM-DD" value-format="YYYY-MM-DD" placeholder="截止时间" allow-clear /><a-button type="primary" @click="taskView === 'list' ? openTaskModal() : openLaneModal()"><IconPlus />{{ taskView === 'list' ? '新建任务' : '添加列' }}</a-button><a-dropdown trigger="click"><a-button class="workspace-more-button"><IconMore />更多</a-button><template #content><a-menu class="workspace-more-menu" @menu-item-click="openWorkspaceMore"><a-menu-item key="import"><IconImport />导入任务</a-menu-item><a-menu-item key="template"><IconFile />下载导入模板</a-menu-item><a-menu-item key="export"><IconExport />{{ taskView === 'list' ? '导出任务' : '导出看板' }}</a-menu-item></a-menu></template></a-dropdown></div><input ref="taskImportInput" class="task-import-input" type="file" accept=".csv,text/csv" @change="importTasks" /></section>
        <section v-if="taskView === 'list'" class="task-list-section"><div class="table-frame"><a-table row-key="id" :columns="columns" :data="visibleTasks" :pagination="{ pageSize: 8, sizeCanChange: false }" :row-selection="rowSelection" @row-click="onTaskRowClick"><template #title="{ record }"><div class="task-title-cell"><strong>{{ record.title }}</strong><small>{{ record.id }} · {{ record.module }}</small></div></template><template #priority="{ record }"><a-tag :color="priorityColors[record.priority]">{{ record.priority }}</a-tag></template><template #owner="{ record }"><span class="owner-cell"><a-avatar :size="26">{{ record.owner.slice(0, 1) }}</a-avatar>{{ record.owner }}</span></template><template #status="{ record }"><a-tag :color="phaseStatusColor(record.status)">{{ record.status }}</a-tag></template><template #actions="{ record }"><a-button type="text" size="small" @click.stop="selectedTask = record"><IconMore /></a-button></template></a-table></div></section>
        <section v-else class="task-board-wrapper"><div class="task-board-section"><div v-for="lane in boardLanes" :key="lane.key" class="task-board-lane"><header draggable="true" @dragstart="startLaneDrag(lane, $event)" @dragover.prevent @drop="dropLane(lane, $event)"><span class="task-board-lane-title"><a-tag :color="lane.color">{{ lane.title }}</a-tag><b>{{ orderedBoardTasks(lane).length }}</b></span><span class="task-board-lane-actions"><a-tooltip content="编辑列"><a-button type="text" size="mini" @click.stop="openLaneModal(lane)"><IconEdit /></a-button></a-tooltip><a-tooltip content="删除列"><a-button type="text" size="mini" @click.stop="deleteLane(lane)"><IconDelete /></a-button></a-tooltip></span></header><div class="task-board-cards" @dragover.prevent @drop="dropTaskOnLane(lane, $event)"><button v-for="task in orderedBoardTasks(lane)" :key="task.id" class="task-board-card" draggable="true" @dragstart.stop="startTaskDrag(task, $event)" @dragover.prevent @drop="dropTaskBefore(task, lane, $event)" @click="onTaskRowClick(task)"><div class="task-board-card-top"><a-tag :color="priorityColors[task.priority]">{{ task.priority }}</a-tag><span>{{ task.due }}</span></div><strong>{{ task.title }}</strong><small>{{ task.id }} · {{ task.module }}</small><footer><span><a-avatar :size="22">{{ task.owner.slice(0, 1) }}</a-avatar>{{ task.owner }}</span><a-tag :color="phaseStatusColor(task.status)">{{ task.status }}</a-tag></footer></button><a-empty v-if="!orderedBoardTasks(lane).length" description="暂无任务" /></div></div></div></section>
      </main>
    </div>

    <a-modal v-model:visible="taskModalVisible" title="新建任务" ok-text="创建任务" cancel-text="取消" :ok-button-props="{ disabled: !draft.title.trim() }" @ok="createTask"><div class="modal-context"><span>项目期号</span><strong>{{ selectedPhase.code }} {{ selectedPhase.projectName }}-{{ selectedPhase.name }}</strong></div><a-form layout="vertical"><a-form-item label="任务名称" required><a-input v-model="draft.title" autofocus placeholder="填写明确、可交付的任务名称" /></a-form-item><div class="form-grid"><a-form-item label="状态"><a-select v-model="draft.status"><a-option v-for="status in ['未完成', '待确认', '已完成']" :key="status" :value="status">{{ status }}</a-option></a-select></a-form-item><a-form-item label="确认人"><a-select v-model="draft.confirmer"><a-option v-for="member in teamMembers" :key="member" :value="member">{{ member }}</a-option></a-select></a-form-item><a-form-item label="执行人"><a-select v-model="draft.executors" multiple :max-tag-count="2" placeholder="可选择多个执行人"><a-option v-for="member in teamMembers" :key="member" :value="member">{{ member }}</a-option></a-select></a-form-item><a-form-item label="优先级"><a-select v-model="draft.priority"><a-option v-for="priority in ['P0', 'P1', 'P2']" :key="priority" :value="priority">{{ priority }}</a-option></a-select></a-form-item><a-form-item label="截止时间"><a-input v-model="draft.due" type="date" /></a-form-item></div><a-form-item label="任务描述"><RichTextEditor v-model="draft.description" placeholder="补充任务目标、验收标准、依赖或交付物" /></a-form-item><section class="subtask-builder"><header><strong>子任务</strong><span>{{ draft.subtasks.length }} 项</span></header><div class="subtask-add-row"><a-input v-model="subtaskDraft" placeholder="添加子任务名称" @keyup.enter="addSubtask" /><a-button type="outline" @click="addSubtask"><IconPlus />添加</a-button></div><div v-if="draft.subtasks.length" class="subtask-list"><div v-for="subtask in draft.subtasks" :key="subtask.id"><span><a-tag color="gray">未完成</a-tag>{{ subtask.title }}</span><a-button type="text" size="small" @click="removeSubtask(subtask)"><IconDelete /></a-button></div></div></section></a-form></a-modal>
    <a-modal v-model:visible="laneModalVisible" :title="laneEditingKey ? '编辑看板列' : '添加看板列'" ok-text="保存" cancel-text="取消" :ok-button-props="{ disabled: !laneDraft.title.trim() }" @ok="saveLane"><a-form layout="vertical"><a-form-item label="列名称" required><a-input v-model="laneDraft.title" maxlength="20" show-word-limit placeholder="例如：待客户确认" /></a-form-item><a-form-item label="列颜色"><a-select v-model="laneDraft.color"><a-option v-for="option in laneColorOptions" :key="option.value" :value="option.value">{{ option.label }}</a-option></a-select></a-form-item></a-form></a-modal>

    <a-drawer :visible="Boolean(selectedTask)" width="620px" @cancel="selectedTask = null"><template #title><div class="task-drawer-heading"><strong>{{ selectedTask?.title || '任务详情' }}</strong><small v-if="selectedTask">{{ selectedPhase.customerCode }}-{{ selectedPhase.customerName }} / {{ selectedPhase.projectName }} / {{ selectedTask.phase }}</small></div></template><template v-if="selectedTask"><div class="task-drawer-path">当前期号 / {{ selectedTask.phase }}</div><div class="task-drawer-actions"><a-select :model-value="selectedTask.status" style="width:148px" @change="value => updateTaskStatus(selectedTask.id, value)"><a-option v-for="status in statusOptions.slice(1)" :key="status" :value="status">{{ status }}</a-option></a-select><a-tag :color="priorityColors[selectedTask.priority]">{{ selectedTask.priority }} 优先级</a-tag></div><div class="task-drawer-meta"><span>确认人<b>{{ selectedTask.confirmer || selectedTask.owner }}</b></span><span>执行人<b>{{ (selectedTask.executors || [selectedTask.owner]).join('、') }}</b></span><span>计划时间<b>{{ selectedTask.start }} 至 {{ selectedTask.due }}</b></span><span>任务编号<b>{{ selectedTask.id }}</b></span></div><section class="drawer-section task-description-section"><header><strong>任务描述</strong></header><div v-if="selectedTask.description" class="rich-text-display" v-html="selectedTask.description" /><p v-else>暂无补充描述。</p></section><section v-if="selectedTask.subtasks?.length" class="drawer-section task-subtasks-section"><header><strong>子任务</strong><span>{{ selectedTask.subtasks.length }} 项</span></header><div class="task-subtask-list"><div v-for="subtask in selectedTask.subtasks" :key="subtask.id"><a-checkbox :model-value="subtask.status === '已完成'" @change="toggleSubtask(selectedTask.id, subtask)">{{ subtask.title }}</a-checkbox><a-tag :color="phaseStatusColor(subtask.status)">{{ subtask.status }}</a-tag></div></div></section><section class="drawer-section task-activity-section"><header><strong>操作记录</strong><span>{{ selectedTaskActivities.length }} 条</span></header><div v-if="selectedTaskActivities.length" class="task-activity-list"><div v-for="activity in selectedTaskActivities" :key="activity.id"><span><b>{{ activity.action }}</b><small>{{ activity.detail }}</small></span><em>{{ activity.operator }} · {{ activity.createdAt }}</em></div></div><a-empty v-else description="暂无操作记录" /></section><section class="drawer-section task-comments-section"><header><strong>评论与回复</strong><span>{{ selectedTaskComments.length }} 条</span></header><div v-if="selectedTaskComments.length" class="task-comment-list"><article v-for="comment in selectedTaskComments" :key="comment.id" class="task-comment-item" :class="{ 'task-comment-reply': comment.parentId }"><div class="task-comment-heading"><span><a-avatar :size="24">{{ comment.author.slice(0, 1) }}</a-avatar><b>{{ comment.author }}</b></span><small>{{ comment.createdAt }}</small></div><div class="rich-text-display" v-html="comment.content" /><a-button type="text" size="small" @click="replyToComment(comment)">回复</a-button></article></div><a-empty v-else description="暂无评论" /><div class="task-comment-editor"><span v-if="replyingTo" class="replying-hint">回复 {{ replyingTo.author }}<a-button type="text" size="small" @click="replyingTo = null; commentDraft = ''">取消</a-button></span><RichTextEditor v-model="commentDraft" placeholder="写下评论或回复" /></div></section></template><template #footer><div class="drawer-footer"><a-button @click="selectedTask = null">关闭</a-button><a-button :disabled="!commentText(commentDraft)" @click="addTaskComment">发表评论</a-button><template v-if="selectedTask?.status === '待确认'"><a-button @click="handleTaskConfirmation(false)">确认不通过</a-button><a-button type="primary" @click="handleTaskConfirmation(true)">确认通过</a-button></template><a-button v-else type="primary" @click="submitTaskResult">提交结果</a-button></div></template></a-drawer>
    <a-drawer v-model:visible="phaseDrawerVisible" width="620px" title="期号设置"><div class="phase-settings-tabs"><button v-for="tab in [{ key: 'basic', label: '基本信息' }, { key: 'stats', label: '数据统计' }, { key: 'hours', label: '工时统计' }, { key: 'files', label: '项目文件' }, { key: 'members', label: '期号成员' }]" :key="tab.key" :class="{ active: phaseSettingsTab === tab.key }" @click="phaseSettingsTab = tab.key">{{ tab.label }}</button></div><template v-if="phaseSettingsTab === 'basic'"><div class="phase-detail-hero"><h2>{{ selectedPhase.code }}</h2><p>{{ selectedPhase.projectName }}-{{ selectedPhase.name }}</p><a-button v-if="!phaseEditing" class="phase-edit-button" type="outline" size="small" @click="startPhaseEdit"><IconEdit />编辑基本信息</a-button></div><div v-if="!phaseEditing" class="phase-descriptions"><p>客户：{{ selectedPhase.customerCode }}-{{ selectedPhase.customerName }}</p><p>项目：{{ selectedPhase.projectCode }} {{ selectedPhase.projectName }}</p><p>负责人：{{ selectedPhase.owner }}</p><p>计划时间：{{ selectedPhase.dates }}</p></div><a-form v-else class="phase-basic-form" layout="vertical"><a-form-item label="期号" required><a-input v-model="phaseDraft.phaseNumber" maxlength="20" placeholder="填写当前项目下唯一的期号" /></a-form-item><a-form-item label="期号名称" required><a-input v-model="phaseDraft.name" /></a-form-item><div class="form-grid"><a-form-item label="状态"><a-select v-model="phaseDraft.status"><a-option v-for="status in ['未开始', '进行中', '已完成', '延期']" :key="status" :value="status">{{ status }}</a-option></a-select></a-form-item><a-form-item label="负责人"><a-select v-model="phaseDraft.owner" allow-search placeholder="搜索负责人"><a-option v-for="member in teamMembers" :key="member" :value="member">{{ member }}</a-option></a-select></a-form-item></div><a-form-item label="计划时间"><a-range-picker v-model="phaseDraft.datesRange" value-format="YYYY-MM-DD" format="YYYY-MM-DD" :placeholder="['开始日期', '结束日期']" allow-clear /></a-form-item><div class="phase-form-actions"><a-button @click="phaseEditing = false">取消</a-button><a-button type="primary" @click="savePhaseBasicInfo">保存</a-button></div></a-form></template><template v-else-if="phaseSettingsTab === 'stats'"><section class="phase-settings-panel"><header><strong>期号数据统计</strong><span>{{ selectedPhase.code }} · {{ selectedPhase.name }}</span></header><div class="phase-stat-grid"><article><strong>{{ phaseTaskStats.total }}</strong><span>任务总数</span></article><article><strong>{{ phaseTaskStats.completed }}</strong><span>已完成</span></article><article><strong>{{ phaseTaskStats.active }}</strong><span>执行中</span></article><article><strong>{{ phaseTaskStats.overdue }}</strong><span>延期任务</span></article></div><div class="phase-stat-progress"><header><span>期号完成度</span><b>{{ selectedPhase.progress }}%</b></header><a-progress :percent="selectedPhase.progress / 100" /></div></section></template><template v-else-if="phaseSettingsTab === 'hours'"><section class="phase-settings-panel"><header><div><strong>工时明细</strong><span>按成员与时间范围筛选</span></div></header><div class="worklog-filters"><a-select v-model="worklogMemberFilter" allow-search><a-option value="全部成员">全部成员</a-option><a-option v-for="member in teamMembers" :key="member" :value="member">{{ member }}</a-option></a-select><a-input v-model="worklogStartDate" type="date" placeholder="开始日期" /><a-input v-model="worklogEndDate" type="date" placeholder="结束日期" /><a-button type="text" @click="worklogMemberFilter = '全部成员'; worklogStartDate = ''; worklogEndDate = ''">重置</a-button></div><div class="worklog-member-summary"><div v-for="item in worklogMemberSummary" :key="item.member"><span>{{ item.member }}</span><strong>{{ item.hours }}h</strong></div><span v-if="!worklogMemberSummary.length">当前筛选暂无工时</span></div><div class="worklog-list"><div class="worklog-row worklog-row-heading"><span>日期</span><span>成员</span><span>工时</span><span>工作内容</span></div><div v-for="log in filteredWorklogs" :key="log.id" class="worklog-row"><span>{{ log.date }}</span><span>{{ log.member }}</span><strong>{{ log.hours }}h</strong><span>{{ log.content }}</span></div><a-empty v-if="!filteredWorklogs.length" description="暂无工时记录" /></div></section></template><template v-else-if="phaseSettingsTab === 'files'"><section class="phase-settings-panel"><header><div><strong>项目文件</strong><span>当前期号交付资料与协作附件</span></div><a-button type="primary" size="small" @click="openPhaseFileModal"><IconPlus />添加文件</a-button></header><div class="phase-file-list"><div v-for="file in currentPhaseFiles" :key="file.id" class="phase-file-item"><IconFile /><span><b>{{ file.name }}</b><small>{{ file.type }} · {{ file.size }} · 更新于 {{ file.updated }}</small></span><span class="file-actions"><a-tooltip content="预览文件"><a-button type="text" size="small" @click="previewPhaseFile(file)"><IconInfoCircle /></a-button></a-tooltip><a-tooltip content="编辑文件"><a-button type="text" size="small" @click="openPhaseFileEdit(file)"><IconEdit /></a-button></a-tooltip><a-tooltip content="下载文件"><a-button type="text" size="small" @click="notify(`已准备下载：${file.name}`)"><IconExport /></a-button></a-tooltip><a-tooltip content="删除文件"><a-button type="text" size="small" @click="removePhaseFile(file)"><IconDelete /></a-button></a-tooltip></span></div><a-empty v-if="!currentPhaseFiles.length" description="暂无项目文件" /></div></section></template><template v-else><section class="phase-settings-panel"><header><div><strong>期号成员</strong><span>管理当前期号的协作成员与职责</span></div><a-button type="primary" size="small" @click="openPhaseMemberModal"><IconPlus />添加成员</a-button></header><div class="phase-member-list"><div v-for="member in currentPhaseMembers" :key="member.id" class="phase-member-item"><a-avatar :size="32">{{ member.name.slice(0, 1) }}</a-avatar><span><b>{{ member.name }}</b><small>期号角色：{{ member.role }}</small><small>加入时间：{{ member.joinedAt || '未记录' }}</small></span><a-button type="text" size="small" @click="removePhaseMember(member)"><IconDelete /></a-button></div><a-empty v-if="!currentPhaseMembers.length" description="暂无期号成员" /></div></section></template><template #footer><div class="drawer-footer"><a-button @click="phaseDrawerVisible = false">取消</a-button><a-button type="primary" @click="confirmPhaseSettings">确定</a-button></div></template></a-drawer>
<a-modal v-model:visible="projectCreateModalVisible" :title="projectCreateMode === 'edit' ? (projectCreateType === 'project' ? '编辑项目' : '编辑期号') : '添加项目或期号'" :ok-text="projectCreateMode === 'edit' ? '保存' : '添加'" cancel-text="取消" @ok="saveProjectCreate"><a-form layout="vertical"><a-form-item v-if="projectCreateMode === 'create'" label="添加类型"><a-select v-model="projectCreateType" @change="switchProjectCreateType"><a-option value="project">项目</a-option><a-option value="phase">期号</a-option></a-select></a-form-item><a-form-item label="客户"><a-select v-model="projectCreateDraft.customerKey" allow-search placeholder="选择客户" :disabled="projectCreateMode === 'edit'" @change="changeProjectCreateCustomer"><a-option v-for="customer in createCustomerOptions" :key="customer.key" :value="customer.key">{{ customer.code }}-{{ customer.name }}</a-option></a-select></a-form-item><template v-if="projectCreateType === 'project'"><div class="form-grid"><a-form-item label="项目编号"><a-input v-model="projectCreateDraft.projectCode" placeholder="例如 03" /></a-form-item><a-form-item label="项目名称"><a-input v-model="projectCreateDraft.projectName" placeholder="填写项目名称" /></a-form-item></div></template><template v-else><a-form-item label="项目"><a-select v-model="projectCreateDraft.projectKey" allow-search placeholder="选择项目" :disabled="projectCreateMode === 'edit'"><a-option v-for="project in createProjectOptions" :key="project.key" :value="project.key">{{ project.code }}-{{ project.name }}</a-option></a-select></a-form-item><div class="form-grid"><a-form-item label="期号编号"><a-input v-model="projectCreateDraft.phaseCode" placeholder="例如 03，或填写完整编码" /></a-form-item><a-form-item label="期号名称"><a-input v-model="projectCreateDraft.phaseName" placeholder="填写期号名称" /></a-form-item><a-form-item label="状态"><a-select v-model="projectCreateDraft.phaseStatus"><a-option v-for="status in ['未开始', '进行中', '已完成', '延期']" :key="status" :value="status">{{ status }}</a-option></a-select></a-form-item><a-form-item label="负责人"><a-select v-model="projectCreateDraft.phaseOwner" allow-search placeholder="搜索负责人"><a-option v-for="member in teamMembers" :key="member" :value="member">{{ member }}</a-option></a-select></a-form-item></div><a-form-item label="计划时间"><a-range-picker v-model="projectCreateDraft.phaseDatesRange" value-format="YYYY-MM-DD" format="YYYY-MM-DD" :placeholder="['开始日期', '结束日期']" allow-clear /></a-form-item></template></a-form></a-modal>    <a-modal v-model:visible="phaseFileModalVisible" :title="phaseFileEditingId ? '编辑项目文件' : '添加项目文件'" :ok-text="phaseFileEditingId ? '保存' : '添加'" cancel-text="取消" :ok-button-props="{ disabled: !phaseFileDraft.file }" @ok="savePhaseFile"><div class="phase-file-upload-panel"><input ref="phaseFileInput" class="phase-file-input" type="file" @change="handlePhaseFileChange" /><p v-if="phaseFileDraft.current" class="phase-file-current">当前文件：{{ phaseFileDraft.current.name }}<small>{{ phaseFileDraft.current.type }} · {{ phaseFileDraft.current.size }}</small></p><a-button type="outline" long @click="phaseFileInput?.click()"><IconImport />选择替换文件</a-button><p v-if="phaseFileDraft.file" class="phase-file-selected"><IconFile /><strong>{{ phaseFileDraft.file.name }}</strong><span>{{ formatFileSize(phaseFileDraft.file.size) }}</span></p><p v-else class="phase-file-empty">请选择要添加到当前期号的文件</p></div></a-modal><a-modal v-model:visible="phaseFilePreviewVisible" :title="phaseFilePreview?.name || '文件预览'" width="760px" footer="false" @cancel="closePhaseFilePreview"><div class="phase-file-preview"><iframe v-if="phaseFilePreviewUrl && phaseFilePreview?.type === 'PDF'" :src="phaseFilePreviewUrl" title="文件预览" /><img v-else-if="phaseFilePreviewUrl && phaseFilePreview?.source?.type?.startsWith('image/')" :src="phaseFilePreviewUrl" alt="文件预览" /><div v-else class="phase-file-preview-empty"><IconFile /><strong>{{ phaseFilePreview?.name }}</strong><span>{{ phaseFilePreview?.type }} · {{ phaseFilePreview?.size }}</span><small>当前文件暂不支持在线预览，请使用下载操作查看。</small></div></div></a-modal>
    <a-modal v-model:visible="phaseMemberModalVisible" title="添加期号成员" ok-text="添加" cancel-text="取消" @ok="savePhaseMember"><a-form layout="vertical"><a-form-item label="成员"><a-select v-model="phaseMemberDraft.name" allow-search placeholder="搜索成员姓名"><a-option v-for="name in teamMembers" :key="name" :value="name">{{ name }}</a-option></a-select></a-form-item><a-form-item label="期号角色"><a-select v-model="phaseMemberDraft.role"><a-option value="项目负责人">项目负责人</a-option><a-option value="项目成员">项目成员</a-option></a-select></a-form-item></a-form></a-modal>
    <a-drawer :visible="Boolean(selectedProject)" width="620px" title="项目详情" @cancel="selectedProject = null"><template v-if="selectedProject"><div class="project-detail-hero"><span>{{ selectedProject.customerCode }}-{{ selectedProject.code }}</span><h2>{{ selectedProject.name }}</h2><p>{{ selectedProject.customerCode }}-{{ selectedProject.customerName }}</p></div><section class="project-public-section"><header><div><strong>项目公共资料</strong><small>项目级公共信息，供项目成员协作查看</small></div><div class="project-public-actions"><a-button type="text" size="small" @click="openProjectInfoEditor"><IconEdit />编辑资料</a-button></div></header><div v-if="selectedProjectPublicDocument" class="rich-text-display project-public-document" v-html="selectedProjectPublicDocument" /><a-empty v-else description="暂无项目公共资料" /></section></template></a-drawer>
    <a-modal v-model:visible="projectInfoModalVisible" title="编辑项目公共资料" ok-text="保存" cancel-text="取消" @ok="saveProjectInfo"><a-form layout="vertical"><a-form-item label="资料内容"><RichTextEditor v-model="projectInfoDraft" placeholder="补充客户资料、服务器信息、代码仓库、部署地址等项目公共信息" /></a-form-item></a-form></a-modal>
    <a-drawer v-model:visible="helpVisible" width="440px" title="项目模块帮助"><a-input placeholder="搜索帮助内容"><template #prefix><IconSearch /></template></a-input><div class="help-list"><details><summary>如何创建新任务？</summary><p>选择左侧期号后，在任务搜索筛选栏点击新建任务。</p></details><details><summary>项目树的层级是什么？</summary><p>项目树按客户、项目、期号三级展示，任务归属于具体期号。</p></details><details><summary>如何查看延期任务？</summary><p>使用任务搜索筛选栏中的状态筛选，选择延期。</p></details></div></a-drawer>
  </div>
</template>
