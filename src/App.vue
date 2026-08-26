<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from "vue";
import { Message, Modal } from "@arco-design/web-vue";
import {
  IconArrowRise, IconCaretLeft, IconCaretRight, IconCheckCircle, IconClockCircle, IconClose, IconCopy, IconDown, IconExport, IconFile,
  IconFilter, IconFolder, IconInfoCircle, IconLock, IconMenuFold, IconMenuUnfold, IconMessage, IconMobile, IconMore, IconNotification, IconWechat,
  IconApps, IconArrowLeft, IconBarChart, IconDelete, IconDragDotVertical, IconEdit, IconEye, IconImport, IconLayout, IconList, IconMindMapping, IconPlus, IconPoweroff, IconQuestionCircle, IconRefresh, IconSafe, IconSearch, IconSettings, IconUp, IconUpload, IconUser, IconUserAdd, IconUserGroup,
} from "@arco-design/web-vue/es/icon";
import { dailyReportSeed, phaseByKey, priorityColors, projects, statusColors, taskSeed } from "./data.js";
import OnlineFileEditor from "./components/OnlineFileEditor.vue";
import PhaseListPagination from "./components/PhaseListPagination.vue";
import RichTextEditor from "./components/RichTextEditor.vue";

const navItems = ["工作台", "项目", "任务", "日报", "工时", "团队", "统计"];
const activeNav = ref("工作台");
const authStorageKey = "haiba-pm-auth";
const storedAuthState = sessionStorage.getItem(authStorageKey) || localStorage.getItem(authStorageKey);
const isAuthenticated = ref(storedAuthState !== "logged-out");
const loginLoading = ref(false);
const loginError = ref("");
const socialLoginProvider = ref("");
const loginMode = ref("internal");
const loginCodeSending = ref(false);
const loginCodeCountdown = ref(0);
let loginCodeTimer = null;
const loginDraft = ref({ account: "lixiangmu@haiba.example", password: "", phone: "", verificationCode: "", remember: true });
const profileDrawerVisible = ref(false);
const systemSettingsModalVisible = ref(false);
const systemSettingsDraft = ref({
  name: "海拔PM",
  logoUrl: "",
  defaultTaskStatus: "未完成",
  taskDueReminder: true,
  dailyReportReminder: true,
  externalInviteReview: true,
});
const profileAvatarInput = ref(null);
const systemSettingsLogoInput = ref(null);
const projectStageConfigs = ref([
  {
    id: "stage-config-standard",
    type: "标准软件项目",
    description: "适用于常规软件定制开发，覆盖从需求确认到上线交付的完整流程。",
    updatedAt: "2026-08-18",
    stages: [
      { id: "standard-requirement", name: "需求分析", description: "确认业务目标、用户范围、功能边界和验收口径。", deliverable: "需求规格说明、范围清单" },
      { id: "standard-design", name: "方案设计", description: "完成产品、交互、视觉与技术方案评审。", deliverable: "原型、UI 稿、技术方案" },
      { id: "standard-development", name: "开发实现", description: "按迭代计划完成开发、自测和代码评审。", deliverable: "可测试版本、代码评审记录" },
      { id: "standard-testing", name: "测试验收", description: "执行功能、兼容性和回归测试，关闭阻塞问题。", deliverable: "测试报告、验收记录" },
      { id: "standard-delivery", name: "上线交付", description: "完成部署、资料移交、培训和项目复盘。", deliverable: "上线记录、交付清单、复盘纪要" },
    ],
  },
  {
    id: "stage-config-miniapp",
    type: "小程序项目",
    description: "适用于小程序产品，从产品需求到平台审核发布的标准交付流程。",
    updatedAt: "2026-08-12",
    stages: [
      { id: "miniapp-requirement", name: "需求梳理", description: "明确用户路径、平台能力和业务规则。", deliverable: "需求清单、用户流程" },
      { id: "miniapp-design", name: "交互设计", description: "完成页面结构、交互原型和视觉规范。", deliverable: "交互原型、视觉稿" },
      { id: "miniapp-development", name: "小程序开发", description: "完成前端页面、接口接入与平台能力开发。", deliverable: "体验版、开发说明" },
      { id: "miniapp-testing", name: "联调验收", description: "完成接口联调、真机测试和业务验收。", deliverable: "测试报告、验收确认" },
      { id: "miniapp-release", name: "发布上线", description: "提交平台审核，完成版本发布和运营移交。", deliverable: "审核记录、发布说明" },
    ],
  },
]);
const projectStageModalVisible = ref(false);
const projectStageEditingId = ref(null);
const projectStageDraft = ref({ type: "", description: "", stages: [] });
const profileError = ref("");
const profileBindingLoading = ref("");
const accountProfile = ref({
  avatarUrl: "",
  account: "lixiangmu@haiba.example",
  phone: "13800001234",
  nickname: "李项目",
  position: "项目经理",
  wecomBound: true,
  wechatBound: false,
});
const profileDraft = ref({ ...accountProfile.value });
const profilePositionOptions = ["项目经理", "产品经理", "服务端开发", "前端开发", "交互设计", "测试负责人", "交付顾问", "外包开发", "客户联系人"];
const passwordModalVisible = ref(false);
const passwordError = ref("");
const passwordDraft = ref({ currentPassword: "", newPassword: "", confirmPassword: "" });
const passwordOpenedFromProfile = ref(false);
const statusOptions = ["全部状态", "未完成", "待确认", "已完成"];
const taskStatusMap = { "未开始": "未完成", "进行中": "未完成", "延期": "未完成" };
const selectedPhaseKey = ref("1500-01-01");
const expandedKeys = ref(["1500", "1500-01", "1501", "1501-01", "1502", "1502-01"]);
const selectedCustomerKey = ref("1500");
const navigatorKeyword = ref("");
const phaseStatus = ref("全部状态");
const projectView = ref("tree");
const taskView = ref("list");
const phaseWorkspaceTab = ref("任务");
const phaseReportKeyword = ref("");
const phaseReportStatusFilter = ref("全部状态");
const phaseReportMemberFilter = ref("全部成员");
const phaseWorklogKeyword = ref("");
const phaseWorklogMemberFilter = ref("全部成员");
const phaseWorklogDateRange = ref([]);
const selectedPhaseWorklog = ref(null);
const phaseMemberKeyword = ref("");
const phaseMemberTypeFilter = ref("全部成员");
const recentPhaseKeys = ref(["1500-01-01", "1500-01-02"]);
const taskKeyword = ref("");
const statusFilter = ref("全部状态");
const sortBy = ref("状态");
const sortDirection = ref("asc");
const dueDateFilter = ref("");
const taskPageType = ref("全部");
const taskPageStatus = ref("全部状态");
const taskPageDueDate = ref("");
const taskPageKeyword = ref("");
const dailyReportTab = ref("mine");
const dailyReportStatus = ref("全部状态");
const dailyReportDateRange = ref([]);
const dailyReportUser = ref("全部成员");
const dailyReportKeyword = ref("");
const dailyDetailProject = ref("全部项目");
const dailyDetailPhase = ref("全部期号");
const dailyDetailSender = ref("全部发送人");
const selectedDailyReport = ref(null);
const projectManagerDailyTaskCategories = ["手续", "需求", "原型", "前端", "对接", "售后"];
const developerDailyTaskCategories = ["开发", "优化", "修复"];
function dailyTaskCategoriesForSender(sender) {
  const member = teamDirectory.value.find(item => item.name === sender);
  const role = member?.role || (sender === accountProfile.value.nickname ? accountProfile.value.position : "");
  return role.includes("开发") ? developerDailyTaskCategories : projectManagerDailyTaskCategories;
}
function inferDailyTaskCategory(text, sender) {
  const content = String(text || "");
  const options = dailyTaskCategoriesForSender(sender);
  if (options === developerDailyTaskCategories) {
    if (content.includes("修复")) return "修复";
    if (content.includes("优化")) return "优化";
    return "开发";
  }
  if (/资料|验收|归档|部署|手续/.test(content)) return "手续";
  if (/需求|范围|规则/.test(content)) return "需求";
  if (/原型|交互|视觉/.test(content)) return "原型";
  if (/前端|页面|响应式|Web/.test(content)) return "前端";
  if (/售后|客户支持/.test(content)) return "售后";
  return "对接";
}
function normalizeDailyReport(report) {
  const entries = Array.isArray(report.tasks) && report.tasks.length
    ? report.tasks
    : [{ id: `${report.id}-task-1`, taskId: "", title: report.summary || "", phase: report.phase || "", hours: Number(report.hours || 0), summary: "", blockers: report.blockers || "" }];
  const tasks = entries.map((entry, index) => ({
    id: entry.id || `${report.id}-task-${index + 1}`,
    taskId: entry.taskId || "",
    category: entry.category || inferDailyTaskCategory(entry.title || entry.summary, report.sender),
    title: entry.title || entry.summary || "",
    phase: entry.phase || report.phase || "",
    hours: Number(entry.hours || 0),
    summary: entry.summary || "",
    blockers: entry.blockers || "",
  }));
  return {
    ...report,
    status: report.status === "已发送" ? "已发送" : "待发送",
    tasks,
    phase: report.phase || tasks.find(entry => entry.phase)?.phase || "",
    hours: tasks.reduce((total, entry) => total + entry.hours, 0),
    summary: tasks.map(entry => entry.title).filter(Boolean).join("\n"),
    blockers: tasks.map(entry => entry.blockers).filter(Boolean).join("\n"),
  };
}
function reportHasPhase(report, phaseKeys) {
  const keys = phaseKeys instanceof Set ? phaseKeys : new Set(phaseKeys || []);
  return keys.has(report.phase) || (report.tasks || []).some(entry => keys.has(entry.phase));
}
const dailyReportModalVisible = ref(false);
const dailyReportEditingId = ref(null);
const dailyReportDraft = ref({ name: "", date: "", tasks: [], nextPlan: "", status: "待发送" });
const workHoursDateRange = ref([]);
const workHoursProject = ref("全部项目");
const workHoursMember = ref("全部成员");
const workHoursKeyword = ref("");
const statsProjectFilter = ref("全部项目");
const teamMembers = reactive(["李项目", "王芳", "张伟", "赵敏", "陈晨", "刘洋"]);
const teamDirectory = ref([
  { id: "account-1", name: "李项目", account: "lixiangmu@haiba.example", phone: "13800001234", role: "项目经理", type: "内部成员", status: "启用", joinedAt: "2026-06-18", permissions: ["工作台", "项目资料", "任务管理", "团队管理"] },
  { id: "account-2", name: "王芳", account: "wangfang@haiba.example", phone: "13800001235", role: "产品经理", type: "内部成员", status: "启用", joinedAt: "2026-06-20", permissions: ["工作台", "项目资料", "任务管理", "日报管理"] },
  { id: "account-3", name: "张伟", account: "zhangwei@haiba.example", phone: "13800001236", role: "服务端开发", type: "内部成员", status: "启用", joinedAt: "2026-06-22", permissions: ["工作台", "任务执行", "文件管理", "工时查看"] },
  { id: "account-4", name: "赵敏", account: "zhaomin@haiba.example", phone: "13800001237", role: "交互设计", type: "内部成员", status: "启用", joinedAt: "2026-06-25", permissions: ["工作台", "任务执行", "文件管理", "日报管理"] },
  { id: "account-5", name: "陈晨", account: "chenchen@haiba.example", phone: "13800001238", role: "测试负责人", type: "内部成员", status: "启用", joinedAt: "2026-06-27", permissions: ["工作台", "任务执行", "文件管理", "工时查看"] },
  { id: "account-6", name: "刘洋", account: "liuyang@haiba.example", phone: "13800001239", role: "交付顾问", type: "内部成员", status: "启用", joinedAt: "2026-06-29", permissions: ["工作台", "项目资料", "文件管理", "日报管理"] },
  { id: "account-7", name: "周工", account: "zhou.gong@example.com", phone: "13900001240", role: "外包开发", type: "外部协作成员", status: "启用", joinedAt: "2026-07-04", permissions: ["工作台", "任务执行", "文件管理"] },
  { id: "account-8", name: "张客户", account: "customer@xinghe.example", phone: "13900001241", role: "客户联系人", type: "项目客户", status: "启用", joinedAt: "2026-07-08", permissions: ["工作台", "项目资料", "任务查看", "文件查看"] },
]);
const dailyReports = ref(dailyReportSeed.map(normalizeDailyReport));
const dailyReportTaskCategoryOptions = computed(() => dailyTaskCategoriesForSender(dailyReportDraft.value.sender || accountProfile.value.nickname));
const teamKeyword = ref("");
const teamTypeFilter = ref("全部类型");
const teamMemberModalVisible = ref(false);
const teamMemberEditingId = ref(null);
const teamMemberDraft = ref({ name: "", account: "", phone: "", role: "项目成员", type: "内部成员", status: "启用", password: "", wechatBound: false, wecomBound: false });
const teamPermissionsModalVisible = ref(false);
const teamPermissionsMemberId = ref(null);
const teamPermissionsDraft = ref([]);
const teamPermissionOptions = ["工作台", "项目资料", "任务管理", "任务执行", "文件管理", "日报管理", "工时查看", "团队管理", "系统设置"];
const tasks = ref(taskSeed.map((task, index) => ({
  ...task,
  createdAt: task.createdAt || index,
  status: taskStatusMap[task.status] || task.status,
  confirmer: task.confirmer || task.owner,
  executors: task.executors?.length ? [...task.executors] : [task.owner],
  subtasks: task.subtasks ? task.subtasks.map(subtask => ({ ...subtask, assignee: subtask.assignee || task.owner })) : [],
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
const laneAssignModalVisible = ref(false);
const laneAssignTarget = ref(null);
const laneAssignExecutors = ref([]);
const selectedTask = ref(null);
const taskComments = ref({});
const taskActivities = ref({});
const commentDraft = ref("");
const commentEditingId = ref(null);
const commentEditDraft = ref("");
const replyingTo = ref(null);
const subtaskDraft = ref("");
const subtaskAssigneeDraft = ref("李项目");
const taskModalSubtaskAdding = ref(false);
const draftSubtaskEditingId = ref(null);
const draftSubtaskEditDraft = ref({ title: "", assignee: "李项目" });
const draggedDraftSubtaskId = ref(null);
const taskDrawerSubtaskAdding = ref(false);
const subtaskEditingId = ref(null);
const subtaskEditDraft = ref({ title: "", assignee: "李项目" });
const draggedSubtaskId = ref(null);
const taskTitleEditing = ref(false);
const taskTitleDraft = ref("");
const taskDescriptionDraft = ref("");
const taskCollaborationTab = ref("comments");
const selectedProject = ref(null);
const taskModalVisible = ref(false);
const taskCreationSource = ref("project");
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
    { id: "file-3", name: "接口联调用例.xlsx", type: "XLSX", size: "312 KB", updated: "2026-08-18" },
    { id: "file-4", name: "首页原型-v3.png", type: "PNG", size: "2.1 MB", updated: "2026-08-19" },
    { id: "file-5", name: "走查问题清单-0820.zip", type: "ZIP", size: "18.4 MB", updated: "2026-08-20" },
    { id: "file-6", name: "需求变更记录-0821.pdf", type: "PDF", size: "204 KB", updated: "2026-08-21" },
  ],
});
const phaseMembers = ref({
  "1500-01-01": [
    { id: "member-1", name: "李项目", rawName: "李项目", baseRole: "项目经理", role: "项目经理 · 成员类型：内部成员 · 权限：项目资料、任务管理、文件管理", joinedAt: "2026-07-01", hours: 42, type: "内部成员", permissions: ["项目资料", "任务管理", "文件管理"] },
    { id: "member-2", name: "张伟", rawName: "张伟", baseRole: "服务端开发", role: "服务端开发 · 成员类型：内部成员 · 权限：项目资料、任务执行、文件查看", joinedAt: "2026-07-03", hours: 36, type: "内部成员", permissions: ["项目资料", "任务执行", "文件查看"] },
    { id: "member-3", name: "陈晨", rawName: "陈晨", baseRole: "测试负责人", role: "测试负责人 · 成员类型：内部成员 · 权限：项目资料、任务执行、文件查看", joinedAt: "2026-07-08", hours: 18, type: "内部成员", permissions: ["项目资料", "任务执行", "文件查看"] },
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
const worklogDateRange = ref([]);
const selectedWorkHoursPhase = ref(null);
const phaseFileModalVisible = ref(false);
const phaseFileInput = ref(null);
const phaseUploadModalVisible = ref(false);
const phaseUploadInput = ref(null);
const phaseFileEditingId = ref(null);
const phaseFileDraft = ref({ file: null, current: null });
const onlineFileEditorVisible = ref(false);
const onlineFileEditorPhaseKey = ref("");
const onlineFileEditorFileId = ref(null);
const onlineFileSavedSnapshot = ref("");
const phaseOnlineFileDraft = ref({ type: "DOCX", name: "", content: "", cells: {}, slides: [], sheetRows: 20, sheetColumns: 10 });
const phaseOnlineFileTypes = [
  { type: "DOCX", label: "在线文档", extension: "docx", defaultName: "未命名文档" },
  { type: "XLSX", label: "在线表格", extension: "xlsx", defaultName: "未命名表格" },
  { type: "PPTX", label: "在线演示文稿", extension: "pptx", defaultName: "未命名演示文稿" },
];
const phaseFileAllowedExtensions = new Set(["doc", "docx", "xls", "xlsx", "ppt", "pptx", "pdf", "csv", "txt", "png", "jpg", "jpeg", "zip", "rar"]);
const phaseFileAccept = ".doc,.docx,.xls,.xlsx,.ppt,.pptx,.pdf,.csv,.txt,.png,.jpg,.jpeg,.zip,.rar";
const onlineFileEditorPhase = computed(() => {
  const base = phaseByKey(onlineFileEditorPhaseKey.value) || selectedPhase.value;
  return { ...base, ...(phaseOverrides.value[base.key] || {}) };
});
const phaseFilePreviewVisible = ref(false);
const onlineFilePreviewVisible = ref(false);
const phaseFilePreview = ref(null);
const phaseFilePreviewUrl = ref("");
const onlineDocumentPreviewHtml = computed(() => phaseFilePreview.value?.online && phaseFilePreview.value.type === "DOCX" ? (phaseFilePreview.value.content || "<p>暂无内容</p>") : "");
const onlineSheetPreviewColumns = computed(() => Array.from({ length: Math.max(1, Number(phaseFilePreview.value?.sheetColumns || 10)) }, (_, index) => String.fromCharCode(65 + index)));
const onlineSheetPreviewRows = computed(() => {
  const file = phaseFilePreview.value;
  if (!file?.online || file.type !== "XLSX") return [];
  return Array.from({ length: Math.max(1, Number(file.sheetRows || 20)) }, (_, rowIndex) => ({
    number: rowIndex + 1,
    cells: onlineSheetPreviewColumns.value.map(column => file.cells?.[`${column}${rowIndex + 1}`] || ""),
  }));
});
const phaseFileKeyword = ref("");
const phaseFileTypeFilter = ref("全部类型");
const mediaPreviewVisible = ref(false);
const mediaPreview = ref(null);
const phaseMemberModalVisible = ref(false);
const phaseMemberEditingId = ref(null);
const phaseMemberDraft = ref({ memberType: "internal", name: "李项目", baseRole: "项目成员", externalType: "客户", contact: "", inviteLink: "", permissions: ["项目资料", "任务执行"] });
const taskImportInput = ref(null);
const helpVisible = ref(false);
const projectPublicInfo = ref({
  "1500-01": { document: "<h3>客户资料</h3><p>1500-星河科技 · CRM同步</p><p>客户编号与档案由 CRM 自动同步。</p><h3>项目服务器</h3><p>生产环境 / 腾讯云华南</p><p>仅展示环境位置，不含登录凭据。</p><h3>宝塔地址</h3><p>未配置</p><h3>代码仓库</h3><p>未配置</p><h3>部署地址</h3><p>未配置</p>" },
  "0000-01": { document: "<h3>客户资料</h3><p>0000-湖南海拔互联网科技有限公司 · 自研主体</p><p>客户资料由内部系统维护。</p><h3>项目服务器</h3><p>内部开发环境</p><h3>代码仓库</h3><p>内部仓库</p>" },
});
const projectInfoModalVisible = ref(false);
const projectInfoDraft = ref("");
const emptyDraft = () => ({ phase: "", title: "", module: "开发", status: "未完成", confirmer: "李项目", executors: ["李项目"], priority: "P1", due: "2026-08-31", description: "", subtasks: [] });
const draft = ref(emptyDraft());

const selectedPhase = computed(() => {
  projectRevision.value;
  const base = phaseByKey(selectedPhaseKey.value) || phaseByKey("1500-01-01");
  return { ...base, ...(phaseOverrides.value[base.key] || {}) };
});
const selectedCustomer = computed(() => { projectRevision.value; return projects.find(customer => customer.key === selectedCustomerKey.value) || null; });
const normalizedKeyword = computed(() => navigatorKeyword.value.trim());
const compareCodeDesc = (a, b) => String(b.code).localeCompare(String(a.code), "zh-CN", { numeric: true });
const visibleCustomers = computed(() => projects.filter(customer => {
  projectRevision.value;
  const keyword = normalizedKeyword.value;
  return !keyword || `${customer.code}${customer.name}`.includes(keyword) || customer.projects.some(project => `${project.code}${project.name}`.includes(keyword) || project.phases.some(phase => `${phase.code}${phase.name}`.includes(keyword)));
}).sort(compareCodeDesc));
const filteredProjects = computed(() => { projectRevision.value; return projects.map(customer => {
  if (selectedCustomerKey.value && customer.key !== selectedCustomerKey.value && !normalizedKeyword.value) return null;
  const customerMatch = `${customer.code}${customer.name}`.includes(normalizedKeyword.value);
  const projectRows = customer.projects.map(project => {
    const projectMatch = `${project.code}${project.name}`.includes(normalizedKeyword.value);
    const phases = project.phases.map(phase => ({ ...phase, ...(phaseOverrides.value[phase.key] || {}) })).filter(phase => (phaseStatus.value === "全部状态" || phase.status === phaseStatus.value) && (!normalizedKeyword.value || customerMatch || projectMatch || `${phase.code}${phase.name}`.includes(normalizedKeyword.value))).sort(compareCodeDesc);
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
    projectCode: project.code,
    projectName: project.name,
    projectOwner: project.owner || phase.owner,
    projectKey: project.key,
  }))));
  return rows;
});
const taskPhaseOptions = computed(() => {
  const rows = [];
  projects.forEach(customer => customer.projects.forEach(project => project.phases.forEach(phase => rows.push({
    ...phase,
    ...(phaseOverrides.value[phase.key] || {}),
    customerCode: customer.code,
    projectCode: project.code,
    projectName: project.name,
  }))));
  return rows;
});
const phaseListGroups = computed(() => {
  const groups = new Map();
  phaseListData.value.forEach(phase => {
    const group = groups.get(phase.projectKey) || {
      key: phase.projectKey,
      customerCode: phase.customerCode,
      projectCode: phase.projectCode,
      projectName: phase.projectName,
      projectOwner: phase.projectOwner,
      phases: [],
    };
    group.phases.push(phase);
    groups.set(phase.projectKey, group);
  });
  return [...groups.values()];
});
const accountRole = computed(() => {
  const position = accountProfile.value.position || "";
  const memberType = currentAccountMember.value?.type || "";
  if (/管理员|管理层|总经理|副总|总监|CEO|部门经理/.test(position)) return "management";
  if (/项目经理|产品经理|交付顾问/.test(position)) return "project-manager";
  if (/兼职|外包|客户|协作/.test(position) || ["外部协作成员", "外包成员", "项目客户"].includes(memberType)) return "external";
  return "developer";
});
const isManagementRole = computed(() => accountRole.value === "management");
const isProjectManagerRole = computed(() => accountRole.value === "project-manager");
const isExternalRole = computed(() => accountRole.value === "external");
const isWorkspaceAdminRole = computed(() => isManagementRole.value || isProjectManagerRole.value);
const dashboardRoleDescription = computed(() => "聚焦可见期号的交付状态、任务进展与截止风险。");
const isRolePersonalView = computed(() => !isManagementRole.value);
const dashboardPendingTasks = computed(() => dashboardTaskRows.value.filter(task => task.status === "待确认" && task.confirmer === accountProfile.value.nickname));
const dashboardRecordStats = computed(() => {
  const currentUser = accountProfile.value.nickname;
  const ownReports = dailyReports.value.filter(report => report.sender === currentUser);
  const ownHours = ownReports.reduce((sum, report) => sum + Number(report.hours || 0), 0);
  const latest = ownReports.sort((a, b) => b.sentAt.localeCompare(a.sentAt))[0];
  return { submitted: latest?.status === "已发送", latest: latest?.sentAt || "尚未提交", hours: ownHours };
});
const currentAccountMember = computed(() => teamDirectory.value.find(member => member.account === accountProfile.value.account || member.name === accountProfile.value.nickname));
const currentPermissions = computed(() => currentAccountMember.value?.permissions || ["工作台"]);
const navigationPermissions = {
  "项目": ["项目资料"],
  "任务": ["任务管理", "任务执行", "任务查看"],
  "日报": ["日报管理"],
  "工时": ["工时查看"],
  "团队": ["团队管理"],
  "统计": ["统计查看"],
};
function hasPermission(permission) {
  return isWorkspaceAdminRole.value || currentPermissions.value.includes(permission);
}
function canAccessNavigation(item) {
  if (item === "工作台") return true;
  const required = navigationPermissions[item] || [];
  return required.some(hasPermission);
}
const visibleNavItems = computed(() => navItems.filter(canAccessNavigation));
const canManageProject = computed(() => hasPermission("项目资料"));
const canManageTasks = computed(() => hasPermission("任务管理") || hasPermission("任务执行"));
const canManageReports = computed(() => hasPermission("日报管理"));
const canManageTeam = computed(() => hasPermission("团队管理"));
const canManageSystem = computed(() => hasPermission("系统设置"));
const dashboardPhaseRows = computed(() => {
  projectRevision.value;
  const rows = [];
  projects.forEach(customer => customer.projects.forEach(project => project.phases.forEach(phase => {
    const phaseTasks = tasks.value.filter(task => task.phase === phase.key);
    const members = phaseMembers.value[phase.key] || [];
    const related = isManagementRole.value || phase.owner === accountProfile.value.nickname || members.some(member => member.name === accountProfile.value.nickname) || phaseTasks.some(task => [task.owner, task.confirmer, ...(task.executors || [])].includes(accountProfile.value.nickname));
    if (related) rows.push({ ...phase, customerCode: customer.code, customerName: customer.name, projectCode: project.code, projectName: project.name, projectKey: project.key });
  })));
  return rows;
});
const dashboardDate = computed(() => new Date().toISOString().slice(0, 10));
const dashboardTaskRows = computed(() => {
  const phaseKeys = new Set(dashboardPhaseRows.value.map(phase => phase.key));
  const currentUser = accountProfile.value.nickname;
  return tasks.value.filter(task => {
    const related = [task.owner, task.createdBy, task.confirmer, ...(task.executors || [])].includes(currentUser);
    return (task.phase ? phaseKeys.has(task.phase) : isManagementRole.value || related) && (isManagementRole.value || related);
  }).sort((a, b) => ({ P0: 0, P1: 1, P2: 2 }[a.priority] ?? 3) - ({ P0: 0, P1: 1, P2: 2 }[b.priority] ?? 3) || (a.createdAt ?? 0) - (b.createdAt ?? 0));
});
const dashboardTasks = computed(() => dashboardTaskRows.value.slice(0, 8));
const dashboardTodayTodos = computed(() => dashboardTaskRows.value.filter(task => task.status !== "已完成" && task.due <= dashboardDate.value).sort((a, b) => a.due.localeCompare(b.due) || ({ P0: 0, P1: 1, P2: 2 }[a.priority] ?? 3) - ({ P0: 0, P1: 1, P2: 2 }[b.priority] ?? 3)));
const dashboardTaskRisk = computed(() => ({
  overdue: dashboardTaskRows.value.filter(task => task.status !== "已完成" && task.due < dashboardDate.value).length,
  dueToday: dashboardTaskRows.value.filter(task => task.status !== "已完成" && task.due === dashboardDate.value).length,
}));
const dashboardProjectManagerStats = computed(() => {
  const phases = dashboardPhaseRows.value;
  const taskRows = dashboardTaskRows.value;
  const { overdue, dueToday } = dashboardTaskRisk.value;
  return [
    { label: "项目期号总数", value: phases.length, unit: "个", ratio: 100 },
    { label: "进行中", value: phases.filter(phase => phase.status === "进行中").length, unit: "个", ratio: phases.length ? Math.round(phases.filter(phase => phase.status === "进行中").length / phases.length * 100) : 0 },
    { label: "已完成", value: phases.filter(phase => phase.status === "已完成").length, unit: "个", ratio: phases.length ? Math.round(phases.filter(phase => phase.status === "已完成").length / phases.length * 100) : 0 },
    { label: "待我确认", value: dashboardPendingTasks.value.length, unit: "条", ratio: taskRows.length ? Math.round(dashboardPendingTasks.value.length / taskRows.length * 100) : 0, tone: "warning" },
    { label: "已逾期", value: overdue, unit: "项", ratio: taskRows.length ? Math.round(overdue / taskRows.length * 100) : 0, tone: "danger" },
    { label: "今日到期", value: dueToday, unit: "项", ratio: taskRows.length ? Math.round(dueToday / taskRows.length * 100) : 0 },
  ].map((item, index) => ({ ...item, destination: index < 3 ? "项目" : "任务" }));
});
const dashboardManagementStats = computed(() => [
  { label: "项目期号总数", value: dashboardStats.value.total, unit: "个", ratio: 100, destination: "项目" },
  { label: "进行中期号", value: dashboardStats.value.inProgress, unit: "个", ratio: dashboardStats.value.total ? Math.round(dashboardStats.value.inProgress / dashboardStats.value.total * 100) : 0, destination: "项目" },
  { label: "已完成期号", value: dashboardStats.value.completed, unit: "个", ratio: dashboardStats.value.completionRate, destination: "项目" },
  { label: "延期期号", value: dashboardStats.value.delayed, unit: "个", ratio: dashboardStats.value.delayRate, tone: "danger", destination: "项目" },
  { label: "完成率", value: dashboardStats.value.completionRate, unit: "%", ratio: dashboardStats.value.completionRate, destination: "统计" },
  { label: "延期率", value: dashboardStats.value.delayRate, unit: "%", ratio: dashboardStats.value.delayRate, tone: "danger", destination: "统计" },
]);
const dashboardWorkbenchStats = computed(() => dashboardProjectManagerStats.value);
const dashboardPersonalReportSummary = computed(() => {
  const currentUser = accountProfile.value.nickname;
  const start = new Date(`${dashboardDate.value}T00:00:00`);
  start.setDate(start.getDate() - 6);
  const startDate = start.toISOString().slice(0, 10);
  const reports = dailyReports.value.filter(report => report.sender === currentUser);
  const submittedDays = new Set(reports.filter(report => report.status === "已发送" && (report.date || report.sentAt?.slice(0, 10)) >= startDate).map(report => report.date || report.sentAt.slice(0, 10))).size;
  return { submittedDays };
});
const dashboardProjectManagerTaskDistribution = computed(() => {
  const rows = dashboardTaskRows.value;
  const total = Math.max(rows.length, 1);
  const values = [
    { label: "未完成", count: rows.filter(task => task.status === "未完成").length, tone: "primary" },
    { label: "待确认", count: rows.filter(task => task.status === "待确认").length, tone: "warning" },
    { label: "已逾期", count: rows.filter(task => task.status !== "已完成" && task.due < dashboardDate.value).length, tone: "danger" },
    { label: "已完成", count: rows.filter(task => task.status === "已完成").length, tone: "success" },
  ];
  return values.map(row => ({ ...row, ratio: Math.round(row.count / total * 100) }));
});
const dashboardPersonalReportSeries = computed(() => {
  const currentUser = accountProfile.value.nickname;
  const today = new Date(`${dashboardDate.value}T00:00:00`);
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - 6 + index);
    const key = date.toISOString().slice(0, 10);
    const hours = dailyReports.value
      .filter(report => report.sender === currentUser && report.date === key)
      .reduce((sum, report) => sum + Number(report.hours || 0), 0);
    return { label: index === 6 ? "今日" : key.slice(5), hours };
  });
});
const dashboardPersonalReportMaxHours = computed(() => Math.max(...dashboardPersonalReportSeries.value.map(day => day.hours), 1));
const dashboardStats = computed(() => {
  const phases = dashboardPhaseRows.value;
  const total = phases.length;
  const completed = phases.filter(phase => phase.status === "已完成").length;
  const delayed = phases.filter(phase => phase.status === "延期").length;
  return { total, inProgress: phases.filter(phase => phase.status === "进行中").length, completed, delayed, delayRate: total ? Math.round(delayed / total * 100) : 0, completionRate: total ? Math.round(completed / total * 100) : 0 };
});
const statsProjectOptions = computed(() => {
  const projectsByKey = new Map();
  dashboardPhaseRows.value.forEach(phase => {
    if (!projectsByKey.has(phase.projectKey)) projectsByKey.set(phase.projectKey, `${phase.customerCode}-${phase.projectCode} · ${phase.projectName}`);
  });
  return [...projectsByKey.entries()].map(([value, label]) => ({ value, label }));
});
const statsFilteredPhases = computed(() => dashboardPhaseRows.value.filter(phase => statsProjectFilter.value === "全部项目" || phase.projectKey === statsProjectFilter.value));
const statsFilteredTasks = computed(() => {
  const visiblePhaseKeys = new Set(statsFilteredPhases.value.map(phase => phase.key));
  return tasks.value.filter(task => visiblePhaseKeys.has(task.phase));
});
const statsOverview = computed(() => {
  const phases = statsFilteredPhases.value;
  const taskRows = statsFilteredTasks.value;
  const phaseKeys = new Set(phases.map(phase => phase.key));
  const reports = dailyReports.value.filter(report => reportHasPhase(report, phaseKeys));
  const completedPhases = phases.filter(phase => phase.status === "已完成").length;
  const delayedPhases = phases.filter(phase => phase.status === "延期").length;
  const overdueTasks = taskRows.filter(task => task.status !== "已完成" && task.due < dashboardDate.value).length;
  const completedTasks = taskRows.filter(task => task.status === "已完成").length;
  return {
    phases: phases.length,
    inProgress: phases.filter(phase => phase.status === "进行中").length,
    completed: completedPhases,
    delayed: delayedPhases,
    delayRate: phases.length ? Math.round(delayedPhases / phases.length * 100) : 0,
    completionRate: phases.length ? Math.round(completedPhases / phases.length * 100) : 0,
    tasks: taskRows.length,
    completedTasks,
    taskCompletionRate: taskRows.length ? Math.round(completedTasks / taskRows.length * 100) : 0,
    overdueTasks,
    hours: reports.reduce((sum, report) => sum + (report.tasks || []).filter(entry => phaseKeys.has(entry.phase)).reduce((taskSum, entry) => taskSum + Number(entry.hours || 0), 0), 0),
    reports: reports.length,
    pendingReports: reports.filter(report => report.status === "待发送").length,
  };
});
const statsStatusRows = computed(() => ["进行中", "未开始", "已完成", "延期"].map(status => {
  const count = statsFilteredPhases.value.filter(phase => phase.status === status).length;
  return { status, count, percent: statsFilteredPhases.value.length ? Math.round(count / statsFilteredPhases.value.length * 100) : 0 };
}));
const statsProjectRows = computed(() => {
  const grouped = new Map();
  statsFilteredPhases.value.forEach(phase => {
    const row = grouped.get(phase.projectKey) || { key: phase.projectKey, label: `${phase.customerCode}-${phase.projectCode} · ${phase.projectName}`, phases: 0, inProgress: 0, completed: 0, delayed: 0, progressTotal: 0 };
    row.phases += 1;
    row.inProgress += phase.status === "进行中" ? 1 : 0;
    row.completed += phase.status === "已完成" ? 1 : 0;
    row.delayed += phase.status === "延期" ? 1 : 0;
    row.progressTotal += Number(phase.progress || 0);
    grouped.set(phase.projectKey, row);
  });
  return [...grouped.values()].map(row => ({ ...row, averageProgress: row.phases ? Math.round(row.progressTotal / row.phases) : 0 }));
});
const statsMemberRows = computed(() => {
  const rows = new Map();
  const visiblePhaseKeys = new Set(statsFilteredPhases.value.map(phase => phase.key));
  statsFilteredTasks.value.forEach(task => {
    const names = new Set([task.owner, task.createdBy, task.confirmer, ...(task.executors || [])].filter(Boolean));
    names.forEach(name => {
      const row = rows.get(name) || { name, tasks: 0, completed: 0, overdue: 0, hours: 0 };
      row.tasks += 1;
      row.completed += task.status === "已完成" ? 1 : 0;
      row.overdue += task.status !== "已完成" && task.due < dashboardDate.value ? 1 : 0;
      rows.set(name, row);
    });
  });
  dailyReports.value.forEach(report => {
    const hours = (report.tasks || []).filter(entry => visiblePhaseKeys.has(entry.phase)).reduce((sum, entry) => sum + Number(entry.hours || 0), 0);
    if (!hours) return;
    const row = rows.get(report.sender) || { name: report.sender, tasks: 0, completed: 0, overdue: 0, hours: 0 };
    row.hours += hours;
    rows.set(report.sender, row);
  });
  return [...rows.values()].map(row => ({ ...row, completionRate: row.tasks ? Math.round(row.completed / row.tasks * 100) : 0 })).sort((a, b) => b.tasks - a.tasks || b.hours - a.hours || a.name.localeCompare(b.name, "zh-CN"));
});
const statsReportSummary = computed(() => { const phaseKeys = new Set(statsFilteredPhases.value.map(phase => phase.key)); return ["已发送", "待发送"].map(status => ({ status, count: dailyReports.value.filter(report => reportHasPhase(report, phaseKeys) && report.status === status).length })); });
function statisticsDonutStyle(rows, colors) {
  const total = rows.reduce((sum, row) => sum + Number(row.count || 0), 0);
  if (!total) return { background: "#f2f3f5" };
  let offset = 0;
  const stops = rows.filter(row => row.count).map(row => {
    const start = offset;
    offset += Number(row.count || 0) / total * 100;
    const color = colors[row.status] || "#c9cdd4";
    return `${color} ${start}% ${offset}%`;
  });
  return { background: `conic-gradient(${stops.join(", ")})` };
}
const statsPhaseDonutStyle = computed(() => statisticsDonutStyle(statsStatusRows.value, {
  "进行中": "#165dff",
  "未开始": "#c9cdd4",
  "已完成": "#27ae60",
  "延期": "#f53f3f",
}));
const statsReportDonutStyle = computed(() => statisticsDonutStyle(statsReportSummary.value, {
  "已发送": "#27ae60",
  "待发送": "#ff7d00",
}));
const dashboardReportSeries = computed(() => {
  const today = new Date(`${dashboardDate.value}T00:00:00`);
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - 6 + index);
    const key = date.toISOString().slice(0, 10);
    const sent = dailyReports.value.filter(report => report.sentAt?.slice(0, 10) === key && report.status === "已发送").length;
    const pending = dailyReports.value.filter(report => report.sentAt?.slice(0, 10) === key && report.status !== "已发送").length;
    const total = sent + pending;
    return { label: key.slice(5), sent, pending, total, height: Math.max(12, Math.min(100, total * 20)) };
  });
});
const taskPageRows = computed(() => {
  const keyword = taskPageKeyword.value.trim();
  const currentUser = accountProfile.value.nickname;
  return tasks.value.filter(task => {
    const phase = phaseByKey(task.phase);
    const executors = task.executors || [task.owner];
    const creator = task.createdBy || task.owner;
    const related = isManagementRole.value || creator === currentUser || task.owner === currentUser || task.confirmer === currentUser || executors.includes(currentUser);
    const typeMatch = taskPageType.value === "全部" || (taskPageType.value === "我发起的" && creator === currentUser) || (taskPageType.value === "我执行的" && executors.includes(currentUser)) || (taskPageType.value === "我确认的" && task.confirmer === currentUser);
    const statusMatch = taskPageStatus.value === "全部状态" || task.status === taskPageStatus.value;
    const dateMatch = !taskPageDueDate.value || task.due === taskPageDueDate.value;
    const keywordMatch = !keyword || `${task.title}${task.id}${phase?.code || ""}${phase?.name || ""}${phase?.projectName || ""}`.includes(keyword);
    return related && typeMatch && statusMatch && dateMatch && keywordMatch;
  }).sort((a, b) => ({ P0: 0, P1: 1, P2: 2 }[a.priority] ?? 3) - ({ P0: 0, P1: 1, P2: 2 }[b.priority] ?? 3) || (a.createdAt ?? 0) - (b.createdAt ?? 0));
});
const dailyReportStatusColors = { "已发送": "green", "待发送": "orange" };
const visibleDailyReports = computed(() => {
  const currentUser = accountProfile.value.nickname;
  const visiblePhaseKeys = new Set(dashboardPhaseRows.value.map(phase => phase.key));
  return dailyReports.value.filter(report => isManagementRole.value || report.sender === currentUser || reportHasPhase(report, visiblePhaseKeys));
});
const dailyReportRows = computed(() => {
  const keyword = dailyReportKeyword.value.trim();
  const [startDate, endDate] = dailyReportDateRange.value || [];
  const currentUser = accountProfile.value.nickname;
  return visibleDailyReports.value.filter(report => {
    const tabMatch = dailyReportTab.value === "mine" ? report.sender === currentUser : true;
    const statusMatch = dailyReportTab.value === "mine" || dailyReportStatus.value === "全部状态" || report.status === dailyReportStatus.value;
    const dateMatch = dailyReportTab.value === "mine" || ((!startDate || report.date >= startDate) && (!endDate || report.date <= endDate));
    const userMatch = dailyReportTab.value === "mine" || dailyReportUser.value === "全部成员" || report.sender === dailyReportUser.value;
    const keywordMatch = !keyword || `${dailyReportDisplayName(report)}${report.sender}${phaseByKey(report.phase)?.code || ""}${phaseByKey(report.phase)?.name || ""}`.includes(keyword);
    return tabMatch && statusMatch && dateMatch && userMatch && keywordMatch;
}).sort((a, b) => b.sentAt.localeCompare(a.sentAt));
});
const dailyDetailBaseRows = computed(() => {
  const visiblePhases = new Map(dashboardPhaseRows.value.map(phase => [phase.key, phase]));
  return visibleDailyReports.value.flatMap(report => (report.tasks || []).flatMap(entry => {
      const phase = visiblePhases.get(entry.phase);
      if (!phase) return [];
      return [{
        id: `${report.id}-${entry.id}`,
        report,
        entry,
        date: report.date,
        projectKey: phase.projectKey,
        projectLabel: `${phase.projectKey} · ${phase.projectName}`,
        phaseKey: phase.key,
        phaseLabel: `${phase.code} · ${phase.name}`,
        sender: report.sender,
        sentAt: report.sentAt,
        hours: Number(entry.hours || 0),
      }];
    })).sort((a, b) => b.sentAt.localeCompare(a.sentAt));
});
const dailyDetailProjectOptions = computed(() => {
  const options = new Map();
  dailyDetailBaseRows.value.forEach(row => options.set(row.projectKey, row.projectLabel));
  return [...options.entries()].map(([value, label]) => ({ value, label }));
});
const dailyDetailPhaseOptions = computed(() => {
  const options = new Map();
  dailyDetailBaseRows.value.forEach(row => {
    if (dailyDetailProject.value === "全部项目" || row.projectKey === dailyDetailProject.value) options.set(row.phaseKey, row.phaseLabel);
  });
  return [...options.entries()].map(([value, label]) => ({ value, label }));
});
const dailyDetailSenderOptions = computed(() => [...new Set(dailyDetailBaseRows.value.map(row => row.sender))]);
const dailyDetailRows = computed(() => dailyDetailBaseRows.value.filter(row => (
  (dailyDetailProject.value === "全部项目" || row.projectKey === dailyDetailProject.value)
  && (dailyDetailPhase.value === "全部期号" || row.phaseKey === dailyDetailPhase.value)
  && (dailyDetailSender.value === "全部发送人" || row.sender === dailyDetailSender.value)
)));
const dailyDetailTotalHours = computed(() => dailyDetailRows.value.reduce((sum, row) => sum + row.hours, 0));
watch(dailyDetailProject, () => { dailyDetailPhase.value = "全部期号"; });
const workHoursMembers = computed(() => {
  const visiblePhaseKeys = new Set(dashboardPhaseRows.value.filter(phase => workHoursProject.value === "全部项目" || phase.projectKey === workHoursProject.value).map(phase => phase.key));
  const members = new Set();
  dailyReports.value.forEach(report => {
    if ((report.tasks || []).some(entry => visiblePhaseKeys.has(entry.phase))) members.add(report.sender);
  });
  return teamMembers.filter(member => members.has(member));
});
const workHoursFilteredLogs = computed(() => {
  const keyword = workHoursKeyword.value.trim();
  const [startDate, endDate] = workHoursDateRange.value || [];
  const visiblePhases = new Map(dashboardPhaseRows.value.map(phase => [phase.key, phase]));
  return dailyReports.value.flatMap(report => (report.tasks || []).flatMap(entry => {
    const phaseKey = entry.phase;
    const phase = visiblePhases.get(phaseKey);
    if (!phase || (workHoursProject.value !== "全部项目" && phase.projectKey !== workHoursProject.value)) return [];
    const phaseText = `${phase?.code || ""}${phase?.name || ""}${phase?.projectCode || ""}${phase?.projectName || ""}`;
    if (keyword && !phaseText.includes(keyword)) return [];
    if (workHoursMember.value !== "全部成员" && report.sender !== workHoursMember.value) return [];
    if ((startDate && report.date < startDate) || (endDate && report.date > endDate)) return [];
    return [{
      id: `${report.id}-${entry.id}`,
      date: report.date,
      member: report.sender,
      hours: Number(entry.hours || 0),
      content: entry.title,
      phaseKey,
      phase,
      report,
    }];
  }));
});
const workHoursPhaseRows = computed(() => {
  const keyword = workHoursKeyword.value.trim();
  return dashboardPhaseRows.value.filter(phase => (
    (workHoursProject.value === "全部项目" || phase.projectKey === workHoursProject.value)
    && (!keyword || `${phase.code}${phase.name}${phase.projectCode}${phase.projectName}`.includes(keyword))
  )).map(phase => {
    const logs = workHoursFilteredLogs.value.filter(log => log.phaseKey === phase.key);
    const latest = logs.reduce((current, log) => (!current || log.date > current ? log.date : current), "");
    const memberHours = Object.values(logs.reduce((members, log) => {
      const member = log.member || "未填写成员";
      members[member] = members[member] || { name: member, hours: 0 };
      members[member].hours += Number(log.hours || 0);
      return members;
    }, {}));
    return { ...phase, hours: logs.reduce((sum, log) => sum + Number(log.hours || 0), 0), members: memberHours.length, memberHours, latest, logCount: logs.length };
  });
});
const selectedWorkHoursPhaseReports = computed(() => {
  if (!selectedWorkHoursPhase.value) return [];
  const [startDate, endDate] = workHoursDateRange.value || [];
  return dailyReports.value.flatMap(report => {
    if (workHoursMember.value !== "全部成员" && report.sender !== workHoursMember.value) return [];
    if ((startDate && report.date < startDate) || (endDate && report.date > endDate)) return [];
    const phaseTasks = (report.tasks || []).filter(entry => entry.phase === selectedWorkHoursPhase.value.key);
    if (!phaseTasks.length) return [];
    return [{ ...report, phaseTasks, phaseHours: phaseTasks.reduce((sum, entry) => sum + Number(entry.hours || 0), 0) }];
  }).sort((a, b) => b.sentAt.localeCompare(a.sentAt));
});
const workHoursStats = computed(() => {
  const totalHours = workHoursFilteredLogs.value.reduce((sum, log) => sum + Number(log.hours || 0), 0);
  const members = new Set(workHoursFilteredLogs.value.map(log => log.member));
  return { phases: workHoursPhaseRows.value.length, totalHours, members: members.size, average: members.size ? Math.round(totalHours / members.size * 10) / 10 : 0 };
});
watch(workHoursProject, () => { workHoursMember.value = "全部成员"; });
const filteredTeamMembers = computed(() => {
  const keyword = teamKeyword.value.trim().toLowerCase();
  return teamDirectory.value.filter(member => (
    (teamTypeFilter.value === "全部类型" || (teamTypeFilter.value === "外部协作成员" ? ["外部协作成员", "外包成员", "项目客户"].includes(member.type) : member.type === teamTypeFilter.value))
    && (!keyword || `${member.name}${member.account}${member.phone}${member.role}`.toLowerCase().includes(keyword))
  ));
});
const teamPermissionsMember = computed(() => teamDirectory.value.find(member => member.id === teamPermissionsMemberId.value) || null);
const phaseTasks = computed(() => tasks.value.filter(task => task.phase === selectedPhaseKey.value));
const phaseTaskStats = computed(() => ({
  total: phaseTasks.value.length,
  completed: phaseTasks.value.filter(task => task.status === "已完成").length,
  incomplete: phaseTasks.value.filter(task => task.status === "未完成").length,
  pending: phaseTasks.value.filter(task => task.status === "待确认").length,
  overdue: phaseTasks.value.filter(task => task.status !== "已完成" && task.due < new Date().toISOString().slice(0, 10)).length,
  dueSoon: phaseTasks.value.filter(task => {
    if (task.status === "已完成") return false;
    const days = (new Date(`${task.due}T00:00:00`) - new Date()) / 86400000;
    return days >= 0 && days <= 7;
  }).length,
  owners: new Set(phaseTasks.value.map(task => task.owner)).size,
  p0: phaseTasks.value.filter(task => task.priority === "P0").length,
  averageCycle: phaseTasks.value.length ? Math.round(phaseTasks.value.reduce((sum, task) => sum + Math.max(1, (new Date(`${task.due}T00:00:00`) - new Date(`${task.start}T00:00:00`)) / 86400000 + 1), 0) / phaseTasks.value.length) : 0,
}));
const phaseReportSummary = computed(() => {
  const phaseKeys = new Set([selectedPhaseKey.value]);
  return ["已发送", "待发送"].map(status => ({
    status,
    count: dailyReports.value.filter(report => report.status === status && reportHasPhase(report, phaseKeys)).length,
  }));
});
const phaseReportSeries = computed(() => {
  const phaseKeys = new Set([selectedPhaseKey.value]);
  const phaseReports = dailyReports.value.filter(report => reportHasPhase(report, phaseKeys));
  const today = new Date(`${dashboardDate.value}T00:00:00`);
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - 6 + index);
    const key = date.toISOString().slice(0, 10);
    const sent = phaseReports.filter(report => report.date === key && report.status === "已发送").length;
    const pending = phaseReports.filter(report => report.date === key && report.status !== "已发送").length;
    return { key, label: index === 6 ? "今日" : key.slice(5), sent, pending, total: sent + pending };
  });
});
const phaseMemberLoadRows = computed(() => currentPhaseMembers.value.map(member => {
  const name = member.rawName || member.name;
  const memberTasks = phaseTasks.value.filter(task => new Set([task.owner, task.createdBy, task.confirmer, ...(task.executors || [])].filter(Boolean)).has(name));
  const reportHours = dailyReports.value
    .filter(report => report.sender === name && reportHasPhase(report, new Set([selectedPhaseKey.value])))
    .reduce((sum, report) => sum + (report.tasks || []).filter(entry => entry.phase === selectedPhaseKey.value).reduce((total, entry) => total + Number(entry.hours || 0), 0), 0);
  const hours = reportHours || Number(member.hours || 0);
  return {
    name,
    role: member.baseRole || member.role || "项目成员",
    tasks: memberTasks.length,
    completed: memberTasks.filter(task => task.status === "已完成").length,
    hours,
    loadPercent: Math.min(100, Math.round(hours / 40 * 100)),
    overdue: memberTasks.filter(task => task.status !== "已完成" && task.due < dashboardDate.value).length,
  };
}).sort((a, b) => b.tasks - a.tasks || b.hours - a.hours || a.name.localeCompare(b.name, "zh-CN")));
const phaseOverviewReference = {
  "1500-01-01": {
    reportSummary: [
      { status: "已发送", count: 11 },
      { status: "待发送", count: 4 },
    ],
    reportSeries: [
      { key: "2026-08-19", label: "08-19", sent: 3, pending: 2, total: 5 },
      { key: "2026-08-20", label: "08-20", sent: 3, pending: 1, total: 4 },
      { key: "2026-08-21", label: "08-21", sent: 4, pending: 0, total: 4 },
      { key: "2026-08-22", label: "08-22", sent: 3, pending: 0, total: 3 },
      { key: "2026-08-23", label: "08-23", sent: 2, pending: 2, total: 4 },
      { key: "2026-08-24", label: "08-24", sent: 5, pending: 0, total: 5 },
      { key: "2026-08-25", label: "今日", sent: 2, pending: 3, total: 5 },
    ],
    memberLoadRows: [
      { name: "李项目", tasks: 12, hours: 38, overdue: 2, loadPercent: 90 },
      { name: "陈晨", tasks: 9, hours: 32, overdue: 0, loadPercent: 72 },
      { name: "张伟", tasks: 8, hours: 28, overdue: 1, loadPercent: 64 },
      { name: "王芳", tasks: 6, hours: 24, overdue: 0, loadPercent: 46 },
      { name: "周工", tasks: 3, hours: 8, overdue: 0, loadPercent: 36 },
    ],
  },
};
const phaseOverviewReferenceData = computed(() => phaseOverviewReference[selectedPhaseKey.value] || null);
const phaseOverviewReportSummary = computed(() => phaseOverviewReferenceData.value?.reportSummary || phaseReportSummary.value);
const phaseOverviewReportSeries = computed(() => phaseOverviewReferenceData.value?.reportSeries || phaseReportSeries.value);
const phaseOverviewMemberLoadRows = computed(() => phaseOverviewReferenceData.value?.memberLoadRows || phaseMemberLoadRows.value);
const phaseMemberLoadTotalHours = computed(() => phaseMemberLoadRows.value.reduce((sum, row) => sum + row.hours, 0));
const phaseHourStats = computed(() => {
  const members = phaseMembers.value[selectedPhaseKey.value] || [];
  const logged = members.reduce((sum, member) => sum + member.hours, 0);
  return { logged, planned: Math.max(logged + 24, 80), members: members.length, average: members.length ? Math.round(logged / members.length) : 0 };
});
const currentPhaseWorklogs = computed(() => phaseWorklogs.value[selectedPhaseKey.value] || []);
const currentPhaseReports = computed(() => dailyReports.value.filter(report => reportHasPhase(report, new Set([selectedPhaseKey.value]))).sort((a, b) => b.sentAt.localeCompare(a.sentAt)));
const phaseReportMembers = computed(() => [...new Set(currentPhaseReports.value.map(report => report.sender))]);
const visiblePhaseReports = computed(() => {
  const keyword = phaseReportKeyword.value.trim();
  return currentPhaseReports.value.filter(report => (
    (phaseReportStatusFilter.value === "全部状态" || report.status === phaseReportStatusFilter.value)
    && (phaseReportMemberFilter.value === "全部成员" || report.sender === phaseReportMemberFilter.value)
    && (!keyword || `${dailyReportDisplayName(report)}${report.id}${report.sender}`.includes(keyword))
  ));
});
const visiblePhaseWorklogs = computed(() => {
  const keyword = phaseWorklogKeyword.value.trim();
  const [startDate, endDate] = phaseWorklogDateRange.value || [];
  return currentPhaseWorklogs.value.filter(log => (
    (phaseWorklogMemberFilter.value === "全部成员" || log.member === phaseWorklogMemberFilter.value)
    && (!startDate || log.date >= startDate)
    && (!endDate || log.date <= endDate)
    && (!keyword || `${log.content}${log.member}${log.date}`.includes(keyword))
  ));
});
const phaseWorklogSummary = computed(() => {
  const logs = visiblePhaseWorklogs.value;
  const hours = logs.reduce((sum, log) => sum + Number(log.hours || 0), 0);
  const members = new Set(logs.map(log => log.member)).size;
  return { hours, records: logs.length, members, average: members ? Math.round(hours / members * 10) / 10 : 0 };
});
const filteredWorklogs = computed(() => {
  const [startDate, endDate] = worklogDateRange.value || [];
  return currentPhaseWorklogs.value.filter(log => (worklogMemberFilter.value === "全部成员" || log.member === worklogMemberFilter.value) && (!startDate || log.date >= startDate) && (!endDate || log.date <= endDate));
});
const worklogMemberSummary = computed(() => teamMembers.map(member => ({ member, hours: filteredWorklogs.value.filter(log => log.member === member).reduce((sum, log) => sum + log.hours, 0) })).filter(item => item.hours > 0));
const currentPhaseFiles = computed(() => phaseFiles.value[selectedPhaseKey.value] || []);
const phaseFileSortBy = ref("更新时间");
const phaseFileSortDirection = ref("desc");
function togglePhaseFileSort(key) {
  if (phaseFileSortBy.value === key) phaseFileSortDirection.value = phaseFileSortDirection.value === "asc" ? "desc" : "asc";
  else {
    phaseFileSortBy.value = key;
    phaseFileSortDirection.value = "asc";
  }
}
function comparePhaseFiles(a, b) {
  let result = 0;
  if (phaseFileSortBy.value === "文件名") result = String(a.name || "").localeCompare(String(b.name || ""), "zh-CN", { numeric: true });
  if (phaseFileSortBy.value === "文件类型") result = (a.online ? "在线文件" : "上传文件").localeCompare(b.online ? "在线文件" : "上传文件", "zh-CN");
  if (phaseFileSortBy.value === "更新人") result = String(a.updatedBy || selectedPhase.value.owner || "").localeCompare(String(b.updatedBy || selectedPhase.value.owner || ""), "zh-CN");
  if (phaseFileSortBy.value === "更新时间") result = String(a.updated || "").localeCompare(String(b.updated || ""));
  return result * (phaseFileSortDirection.value === "asc" ? 1 : -1)
    || String(b.updated || "").localeCompare(String(a.updated || ""))
    || String(a.name || "").localeCompare(String(b.name || ""), "zh-CN", { numeric: true });
}
const briefPhaseFiles = computed(() => visiblePhaseFiles.value.slice(0, 3));
const phaseFileTypeOptions = computed(() => ["全部类型", ...new Set(currentPhaseFiles.value.map(file => file.type).filter(Boolean))]);
const visiblePhaseFiles = computed(() => currentPhaseFiles.value.filter(file => {
  const keyword = phaseFileKeyword.value.trim().toLowerCase();
  const matchesKeyword = !keyword || `${file.name} ${file.type}`.toLowerCase().includes(keyword);
  const matchesType = phaseFileTypeFilter.value === "全部类型" || file.type === phaseFileTypeFilter.value;
  return matchesKeyword && matchesType;
}).sort(comparePhaseFiles));
const currentPhaseMembers = computed(() => phaseMembers.value[selectedPhaseKey.value] || []);
const visiblePhaseMembers = computed(() => {
  const keyword = phaseMemberKeyword.value.trim();
  return currentPhaseMembers.value.filter(member => {
    const name = member.rawName || member.name;
    const role = member.baseRole || member.role || "项目成员";
    return (phaseMemberTypeFilter.value === "全部成员" || (member.type || "内部成员") === phaseMemberTypeFilter.value)
      && (!keyword || `${name}${role}${member.type || ""}`.includes(keyword));
  });
});
const phaseMemberTypes = computed(() => [...new Set(currentPhaseMembers.value.map(member => member.type || "内部成员"))]);
const phaseActivityRows = computed(() => [
  { type: "系统", title: "已切换至当前期号", detail: `${selectedPhase.value.code} · ${selectedPhase.value.name} · 状态 ${selectedPhase.value.status}`, time: "当前" },
  ...currentPhaseWorklogs.value.slice(0, 2).map(log => ({ type: "工时", title: `${log.member} 登记工时 ${log.hours}h`, detail: log.content, time: log.date })),
  ...currentPhaseReports.value.slice(0, 1).map(report => ({ type: "日报", title: `${report.sender} 提交了日报「${dailyReportDisplayName(report)}」`, detail: `日报工时 ${report.hours}h`, time: report.sentAt })),
  ...currentPhaseFiles.value.slice(0, 1).map(file => ({ type: "资料", title: "最近文件已更新", detail: `${file.name} · ${file.updatedBy || selectedPhase.value.owner}`, time: file.updated })),
  ...currentPhaseMembers.value.slice(0, 1).map(member => ({ type: "成员", title: `当前共有 ${currentPhaseMembers.value.length} 名协作成员`, detail: `${member.rawName || member.name} · ${member.baseRole || member.role || "项目成员"}`, time: member.joinedAt || "未记录" })),
]);
function createListPagination(source) {
  const page = ref(1);
  const pageSize = ref(8);
  const pageCount = computed(() => Math.max(1, Math.ceil(source.value.length / pageSize.value)));
  const rows = computed(() => source.value.slice((page.value - 1) * pageSize.value, page.value * pageSize.value));
  watch(source, () => { page.value = 1; });
  watch(pageSize, () => { page.value = 1; });
  watch(pageCount, count => { page.value = Math.min(page.value, count); });
  return { page, pageSize, rows };
}
const { page: phaseReportPage, pageSize: phaseReportPageSize, rows: pagedPhaseReports } = createListPagination(visiblePhaseReports);
const { page: phaseWorklogPage, pageSize: phaseWorklogPageSize, rows: pagedPhaseWorklogs } = createListPagination(visiblePhaseWorklogs);
const { page: phaseFilePage, pageSize: phaseFilePageSize, rows: pagedPhaseFiles } = createListPagination(visiblePhaseFiles);
const { page: phaseMemberPage, pageSize: phaseMemberPageSize, rows: pagedPhaseMembers } = createListPagination(visiblePhaseMembers);
const { page: phaseActivityPage, pageSize: phaseActivityPageSize, rows: pagedPhaseActivityRows } = createListPagination(phaseActivityRows);
const { page: taskListPage, pageSize: taskListPageSize, rows: pagedTaskPageRows } = createListPagination(taskPageRows);
const { page: dailyReportPage, pageSize: dailyReportPageSize, rows: pagedDailyReports } = createListPagination(dailyReportRows);
const { page: dailyDetailPage, pageSize: dailyDetailPageSize, rows: pagedDailyDetailRows } = createListPagination(dailyDetailRows);
const { page: workHoursPhasePage, pageSize: workHoursPhasePageSize, rows: pagedWorkHoursPhaseRows } = createListPagination(workHoursPhaseRows);
const { page: workHoursDetailPage, pageSize: workHoursDetailPageSize, rows: pagedWorkHoursDetailRows } = createListPagination(workHoursFilteredLogs);
const { page: teamPage, pageSize: teamPageSize, rows: pagedTeamMembers } = createListPagination(filteredTeamMembers);
const selectedTaskComments = computed(() => selectedTask.value ? (taskComments.value[selectedTask.value.id] || []) : []);
const selectedTaskActivities = computed(() => selectedTask.value ? (taskActivities.value[selectedTask.value.id] || []) : []);
const taskPriorityOrder = { P0: 0, P1: 1, P2: 2 };
const taskStatusOrder = { "待确认": 0, "未完成": 1, "已完成": 2 };
function toggleTaskSort(key) {
  if (sortBy.value === key) sortDirection.value = sortDirection.value === "asc" ? "desc" : "asc";
  else {
    sortBy.value = key;
    sortDirection.value = "asc";
  }
  taskPage.value = 1;
}
function taskExecutorNames(task) {
  return task.executors?.length ? task.executors : [task.owner].filter(Boolean);
}
function taskExecutorLabel(task) {
  return taskExecutorNames(task).join("、");
}
function compareTasks(a, b) {
  let result = 0;
  if (sortBy.value === "任务名称") result = a.title.localeCompare(b.title, "zh-CN");
  if (sortBy.value === "优先级") result = (taskPriorityOrder[a.priority] ?? 3) - (taskPriorityOrder[b.priority] ?? 3);
  if (sortBy.value === "执行人") result = (taskExecutorNames(a)[0] || "").localeCompare(taskExecutorNames(b)[0] || "", "zh-CN");
  if (sortBy.value === "确认人") result = (a.confirmer || a.owner || "").localeCompare(b.confirmer || b.owner || "", "zh-CN");
  if (sortBy.value === "状态") result = (taskStatusOrder[a.status] ?? 3) - (taskStatusOrder[b.status] ?? 3);
  if (sortBy.value === "截止时间") result = a.due.localeCompare(b.due);
  return result * (sortDirection.value === "asc" ? 1 : -1)
    || a.due.localeCompare(b.due)
    || a.title.localeCompare(b.title, "zh-CN");
}
const visibleTasks = computed(() => phaseTasks.value.filter(task => (!taskKeyword.value || `${task.id}${task.title}${task.module}${task.owner}`.includes(taskKeyword.value)) && (statusFilter.value === "全部状态" || task.status === statusFilter.value) && (!dueDateFilter.value || task.due === dueDateFilter.value)).sort(compareTasks));
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
function taskChecklistAction(task) {
  const currentUser = accountProfile.value.nickname;
  const executors = task.executors?.length ? task.executors : [task.owner];
  if (task.status === "未完成" && executors.includes(currentUser)) return "submit";
  if (task.status === "待确认" && task.confirmer === currentUser) return "confirm";
  if (task.status === "已完成" && (task.confirmer === currentUser || isManagementRole.value)) return "reopen";
  return "";
}
function taskChecklistLabel(task) {
  const action = taskChecklistAction(task);
  if (action === "submit") return "提交任务结果，等待确认";
  if (action === "confirm") return "确认任务已完成";
  if (action === "reopen") return "重新打开任务";
  return "当前账号不可快捷修改此任务状态";
}
function taskChecklistHint(task) {
  const action = taskChecklistAction(task);
  if (action === "submit") return "执行人可提交结果";
  if (action === "confirm") return "确认人可确认完成";
  if (action === "reopen") return "确认人可重新打开";
  if (task.status === "待确认") return "等待确认人处理";
  if (task.status === "已完成") return "已完成";
  return "等待执行人处理";
}
function openTaskFromRow(task) {
  if (task.phase) selectedPhaseKey.value = task.phase;
  onTaskRowClick(task);
}
function canEditTask(task) {
  const currentUser = accountProfile.value.nickname;
  const phaseOwner = phaseByKey(task.phase)?.owner;
  return canManageTasks.value && (isManagementRole.value || task.createdBy === currentUser || task.owner === currentUser || (task.executors || []).includes(currentUser) || phaseOwner === currentUser);
}
function canDeleteTask(task) {
  const currentUser = accountProfile.value.nickname;
  const phaseOwner = phaseByKey(task.phase)?.owner;
  return canManageTasks.value && (isManagementRole.value || (task.createdBy || task.owner) === currentUser || phaseOwner === currentUser);
}
function editTaskFromList(task) {
  if (!canEditTask(task)) { Message.warning("当前账号没有编辑该任务的权限"); return; }
  openTaskFromRow(task);
}
function handleTaskActionMenu(task, action) {
  if (action === "confirm") handleTaskChecklistChange(task);
  if (action === "reject") rejectTaskConfirm(task);
  if (action === "delete") deleteTaskFromList(task);
}
function deleteTaskFromList(task) {
  if (!canDeleteTask(task)) { Message.warning("当前账号没有删除该任务的权限"); return; }
  const relatedCount = (task.subtasks?.length || 0) + (taskComments.value[task.id]?.length || 0);
  Modal.confirm({
    title: "删除任务",
    content: `确定删除任务“${task.title}”吗？${relatedCount ? `同时会清理 ${relatedCount} 条子任务或评论记录。` : ""}删除后无法恢复。`,
    okText: "删除任务",
    cancelText: "取消",
    onOk: () => {
      tasks.value = tasks.value.filter(item => item.id !== task.id);
      boardOrder.value = boardOrder.value.filter(taskId => taskId !== task.id);
      taskComments.value = Object.fromEntries(Object.entries(taskComments.value).filter(([taskId]) => taskId !== task.id));
      taskActivities.value = Object.fromEntries(Object.entries(taskActivities.value).filter(([taskId]) => taskId !== task.id));
      if (selectedTask.value?.id === task.id) selectedTask.value = null;
      Message.success("任务已删除");
    },
  });
}
function handleTaskRowKeydown(event, task) {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    openTaskFromRow(task);
  }
}
const profileInitial = computed(() => accountProfile.value.nickname.trim().slice(0, 1) || "用");
const columns = [
  { title: "完成", slotName: "checklist", width: 52, align: "center" },
  { title: "任务名称", dataIndex: "title", slotName: "title", width: 194 },
  { title: "优先级", dataIndex: "priority", slotName: "priority", width: 78 },
  { title: "负责人", dataIndex: "owner", slotName: "owner", width: 96 },
  { title: "状态", dataIndex: "status", slotName: "status", width: 72 },
  { title: "截止时间", dataIndex: "due", width: 128, sortable: { sortDirections: ["ascend", "descend"] } },
  { title: "操作", slotName: "actions", width: 62, align: "center" },
];

watch(selectedPhaseKey, key => {
  recentPhaseKeys.value = [key, ...recentPhaseKeys.value.filter(item => item !== key)].slice(0, 2);
  phaseFileKeyword.value = "";
  phaseFileTypeFilter.value = "全部类型";
  selectedPhaseWorklog.value = null;
  phaseWorkspaceTab.value = "任务";
});

const taskPage = ref(1);
const taskPageSize = ref(8);
const paMenuOpen = ref('');
const taskPageCount = computed(() => Math.max(1, Math.ceil(visibleTasks.value.length / taskPageSize.value)));
const pagedTasks = computed(() => visibleTasks.value.slice((taskPage.value - 1) * taskPageSize.value, taskPage.value * taskPageSize.value));
watch([taskKeyword, statusFilter, dueDateFilter], () => { taskPage.value = 1; });
watch(taskPageSize, () => { taskPage.value = 1; });
watch(() => visibleTasks.value.length, () => { taskPage.value = Math.min(taskPage.value, taskPageCount.value); });
function priMeta(priority) {
  return { P0: { cls: "urgent", txt: "紧急" }, P1: { cls: "high", txt: "高" }, P2: { cls: "mid", txt: "中" } }[priority] || { cls: "low", txt: "低" };
}
function stTagCls(status) {
  return { "待确认": "ts-confirm", "未完成": "ts-doing", "未开始": "ts-wait", "已完成": "ts-done", "延期": "ts-delay" }[status] || "ts-doing";
}
function dotCls(status) {
  return { "进行中": "doing", "未完成": "doing", "未开始": "wait", "延期": "delay", "已完成": "done" }[status] || "doing";
}
function fileIconCls(type) {
  const t = String(type || "").toUpperCase();
  if (t.includes("DOC")) return "fi-doc";
  if (t.includes("XLS")) return "fi-xls";
  if (t.includes("PPT")) return "fi-ppt";
  if (t.includes("PNG") || t.includes("JPG") || t.includes("IMG")) return "fi-img";
  if (t.includes("ZIP") || t.includes("RAR")) return "fi-zip";
  if (t.includes("PDF")) return "fi-pdf";
  return "fi-doc";
}
function fileIconTxt(type) {
  const t = String(type || "FILE").toUpperCase();
  if (t.includes("DOC")) return "W";
  if (t.includes("XLS")) return "X";
  if (t.includes("PPT")) return "P";
  if (t.includes("PNG") || t.includes("JPG") || t.includes("IMG")) return "P";
  if (t.includes("ZIP") || t.includes("RAR")) return "Z";
  if (t.includes("PDF")) return "P";
  return "F";
}
function rejectTaskConfirm(task) {
  updateTaskStatus(task.id, "未完成", "已退回，请修改后重新提交");
}
watch([normalizedKeyword, filteredProjects], () => {
  if (!normalizedKeyword.value) return;
  expandedKeys.value = filteredProjects.value.flatMap(customer => customer.projects.map(project => project.key));
});
function notify(text) { Message.info(text); }
function handleNavigation(key) {
  if (["工作台", "项目", "任务", "日报", "工时", "团队", "统计"].includes(key)) {
    if (!canAccessNavigation(key)) { Message.warning(`当前账号没有访问${key}页面的权限`); return; }
    activeNav.value = key;
    return;
  }
  activeNav.value = "项目";
  notify(`${key}模块将在后续设计`);
}
function completeLogin(successMessage) {
  localStorage.removeItem(authStorageKey);
  sessionStorage.removeItem(authStorageKey);
  const storage = loginDraft.value.remember ? localStorage : sessionStorage;
  storage.setItem(authStorageKey, "authenticated");
  isAuthenticated.value = true;
  activeNav.value = "工作台";
  loginDraft.value.password = "";
  loginDraft.value.verificationCode = "";
  Message.success(successMessage);
}
async function sendLoginVerificationCode() {
  const phone = loginDraft.value.phone.trim();
  if (!/^1[3-9]\d{9}$/.test(phone)) { loginError.value = "请输入邀请时填写的 11 位手机号"; return; }
  if (loginCodeSending.value || loginCodeCountdown.value > 0) return;
  loginCodeSending.value = true;
  loginError.value = "";
  try {
    await new Promise(resolve => window.setTimeout(resolve, 450));
    loginCodeCountdown.value = 60;
    window.clearInterval(loginCodeTimer);
    loginCodeTimer = window.setInterval(() => {
      loginCodeCountdown.value -= 1;
      if (loginCodeCountdown.value <= 0) {
        window.clearInterval(loginCodeTimer);
        loginCodeTimer = null;
      }
    }, 1000);
    Message.success("验证码已发送，请注意查收");
  } finally {
    loginCodeSending.value = false;
  }
}
async function handleLogin() {
  const phone = loginDraft.value.phone.trim();
  const verificationCode = loginDraft.value.verificationCode.trim();
  if (!/^1[3-9]\d{9}$/.test(phone)) { loginError.value = "请输入邀请时填写的 11 位手机号"; return; }
  if (!/^\d{6}$/.test(verificationCode)) { loginError.value = "请输入 6 位短信验证码"; return; }
  loginLoading.value = true;
  loginError.value = "";
  try {
    await new Promise(resolve => window.setTimeout(resolve, 350));
    completeLogin("手机号验证成功");
  } finally {
    loginLoading.value = false;
  }
}
async function handleSocialLogin(provider) {
  if (loginLoading.value || socialLoginProvider.value) return;
  socialLoginProvider.value = provider;
  loginError.value = "";
  const authUrl = provider === "微信" ? import.meta.env.VITE_WECHAT_AUTH_URL : import.meta.env.VITE_WECOM_AUTH_URL;
  if (authUrl) {
    window.location.assign(authUrl);
    return;
  }
  await new Promise(resolve => window.setTimeout(resolve, 450));
  socialLoginProvider.value = "";
  completeLogin(`${provider}授权登录成功`);
}
function handleLogout() {
  Modal.confirm({
    title: "退出登录",
    content: "退出后需要重新登录才能继续访问项目数据。",
    okText: "退出",
    cancelText: "取消",
    onOk: () => {
      sessionStorage.removeItem(authStorageKey);
      localStorage.setItem(authStorageKey, "logged-out");
      selectedTask.value = null;
      selectedProject.value = null;
      selectedWorkHoursPhase.value = null;
      phaseDrawerVisible.value = false;
      taskModalVisible.value = false;
      phaseMemberModalVisible.value = false;
      phaseFileModalVisible.value = false;
      profileDrawerVisible.value = false;
      systemSettingsModalVisible.value = false;
      passwordModalVisible.value = false;
      helpVisible.value = false;
      isAuthenticated.value = false;
      activeNav.value = "工作台";
      loginError.value = "";
      loginDraft.value.password = "";
      loginDraft.value.verificationCode = "";
      passwordError.value = "";
      passwordDraft.value = { currentPassword: "", newPassword: "", confirmPassword: "" };
      Message.success("已退出登录");
    },
  });
}
function openProfileDrawer() {
  profileDraft.value = { ...accountProfile.value };
  profileError.value = "";
  profileDrawerVisible.value = true;
}
function openSystemSettings() {
  if (!canManageSystem.value) { Message.warning("当前账号没有系统设置权限"); return; }
  systemSettingsModalVisible.value = true;
}
function handleSystemLogoChange(event) {
  const file = event.target.files?.[0];
  event.target.value = "";
  if (!file) return;
  if (!file.type.startsWith("image/")) { Message.warning("请选择图片格式的 Logo"); return; }
  if (file.size > 5 * 1024 * 1024) { Message.warning("Logo 图片不能超过 5 MB"); return; }
  const reader = new FileReader();
  reader.onload = () => { systemSettingsDraft.value.logoUrl = String(reader.result || ""); };
  reader.readAsDataURL(file);
}
function saveSystemSettings() {
  const name = systemSettingsDraft.value.name.trim();
  if (!name) { Message.warning("请填写系统名称"); return; }
  systemSettingsDraft.value = { ...systemSettingsDraft.value, name };
  systemSettingsModalVisible.value = false;
  Message.success("系统设置已保存");
}
function openProjectStageModal(config = null) {
  if (!canManageSystem.value) { Message.warning("当前账号没有项目阶段管理权限"); return; }
  projectStageEditingId.value = config?.id || null;
  projectStageDraft.value = config
    ? { type: config.type, description: config.description, stages: (config.stages || []).map(stage => ({ ...stage })) }
    : { type: "", description: "", stages: [createProjectStage()] };
  projectStageModalVisible.value = true;
}
function createProjectStage() {
  return { id: `project-stage-${Date.now()}-${Math.random().toString(16).slice(2)}`, name: "", description: "", deliverable: "" };
}
function addProjectStage() {
  projectStageDraft.value.stages = [...projectStageDraft.value.stages, createProjectStage()];
}
function removeProjectStage(stage) {
  if (projectStageDraft.value.stages.length <= 1) { Message.warning("每种项目类型至少保留一个项目阶段"); return; }
  projectStageDraft.value.stages = projectStageDraft.value.stages.filter(item => item.id !== stage.id);
}
function moveProjectStage(index, offset) {
  const targetIndex = index + offset;
  if (targetIndex < 0 || targetIndex >= projectStageDraft.value.stages.length) return;
  const stages = [...projectStageDraft.value.stages];
  [stages[index], stages[targetIndex]] = [stages[targetIndex], stages[index]];
  projectStageDraft.value.stages = stages;
}
function saveProjectStageConfig() {
  const type = projectStageDraft.value.type.trim();
  const description = projectStageDraft.value.description.trim();
  if (!type) { Message.warning("请填写项目类型"); return false; }
  const stages = projectStageDraft.value.stages.map(stage => ({
    ...stage,
    name: stage.name.trim(),
    description: stage.description.trim(),
    deliverable: stage.deliverable.trim(),
  }));
  const incompleteStageIndex = stages.findIndex(stage => !stage.name);
  if (incompleteStageIndex >= 0) { Message.warning(`请填写第 ${incompleteStageIndex + 1} 个阶段名称`); return false; }
  if (new Set(stages.map(stage => stage.name)).size !== stages.length) { Message.warning("同一项目类型内的阶段名称不能重复"); return false; }
  if (projectStageConfigs.value.some(config => config.id !== projectStageEditingId.value && config.type === type)) {
    Message.warning("项目类型已存在");
    return false;
  }
  const updatedAt = new Date().toISOString().slice(0, 10);
  if (projectStageEditingId.value) {
    projectStageConfigs.value = projectStageConfigs.value.map(config => config.id === projectStageEditingId.value ? { ...config, type, description, stages, updatedAt } : config);
    Message.success("项目阶段配置已更新");
  } else {
    projectStageConfigs.value = [...projectStageConfigs.value, { id: `stage-config-${Date.now()}`, type, description, stages, updatedAt }];
    Message.success("项目类型及阶段已添加");
  }
  projectStageModalVisible.value = false;
  projectStageEditingId.value = null;
  return true;
}
function removeProjectStageConfig(config) {
  Modal.confirm({
    title: "删除项目阶段配置",
    content: `确定删除“${config.type}”的阶段配置吗？删除后不会影响已创建项目的现有阶段。`,
    okText: "确认删除",
    cancelText: "取消",
    onOk: () => {
      projectStageConfigs.value = projectStageConfigs.value.filter(item => item.id !== config.id);
      Message.success("项目阶段配置已删除");
    },
  });
}
function handleProfileAvatarChange(event) {
  const file = event.target.files?.[0];
  event.target.value = "";
  if (!file) return;
  if (!file.type.startsWith("image/")) { Message.warning("请选择图片文件"); return; }
  if (file.size > 5 * 1024 * 1024) { Message.warning("头像图片不能超过 5 MB"); return; }
  const reader = new FileReader();
  reader.onload = () => { profileDraft.value = { ...profileDraft.value, avatarUrl: String(reader.result || "") }; };
  reader.onerror = () => Message.error("头像读取失败，请重新选择");
  reader.readAsDataURL(file);
}
function saveProfile() {
  const account = profileDraft.value.account.trim();
  const phone = profileDraft.value.phone.trim();
  const nickname = profileDraft.value.nickname.trim();
  const position = profileDraft.value.position.trim();
  if (!account) { profileError.value = "请输入登录账号"; return; }
  if (phone && !/^1[3-9]\d{9}$/.test(phone)) { profileError.value = "请输入正确的 11 位手机号"; return; }
  if (!nickname) { profileError.value = "请输入昵称"; return; }
  if (!position) { profileError.value = "请选择职务"; return; }
  accountProfile.value = { ...profileDraft.value, account, phone, nickname, position };
  loginDraft.value.account = account;
  profileDrawerVisible.value = false;
  profileError.value = "";
  Message.success("个人信息已保存");
}
async function bindProfileAccount(provider) {
  if (profileBindingLoading.value) return;
  profileBindingLoading.value = provider;
  await new Promise(resolve => window.setTimeout(resolve, 450));
  const field = provider === "企业微信" ? "wecomBound" : "wechatBound";
  accountProfile.value = { ...accountProfile.value, [field]: true };
  profileDraft.value = { ...profileDraft.value, [field]: true };
  profileBindingLoading.value = "";
  Message.success(`${provider}绑定成功`);
}
function unbindProfileAccount(provider) {
  Modal.confirm({
    title: `解绑${provider}`,
    content: `解绑后将不能使用${provider}授权登录，是否继续？`,
    okText: "确认解绑",
    cancelText: "取消",
    onOk: () => {
      const field = provider === "企业微信" ? "wecomBound" : "wechatBound";
      accountProfile.value = { ...accountProfile.value, [field]: false };
      profileDraft.value = { ...profileDraft.value, [field]: false };
      Message.success(`${provider}已解绑`);
    },
  });
}
function openPasswordModal() {
  passwordOpenedFromProfile.value = profileDrawerVisible.value;
  if (passwordOpenedFromProfile.value) profileDrawerVisible.value = false;
  passwordDraft.value = { currentPassword: "", newPassword: "", confirmPassword: "" };
  passwordError.value = "";
  passwordModalVisible.value = true;
}
function closePasswordModal() {
  passwordModalVisible.value = false;
  if (passwordOpenedFromProfile.value) profileDrawerVisible.value = true;
  passwordOpenedFromProfile.value = false;
}
async function submitPasswordChange() {
  const { currentPassword, newPassword, confirmPassword } = passwordDraft.value;
  if (!currentPassword) { passwordError.value = "请输入当前密码"; return false; }
  if (!newPassword) { passwordError.value = "请输入新密码"; return false; }
  if (newPassword.length < 8) { passwordError.value = "新密码至少需要 8 个字符"; return false; }
  if (newPassword === currentPassword) { passwordError.value = "新密码不能与当前密码相同"; return false; }
  if (!confirmPassword) { passwordError.value = "请再次输入新密码"; return false; }
  if (newPassword !== confirmPassword) { passwordError.value = "两次输入的新密码不一致"; return false; }
  passwordError.value = "";
  try {
    await new Promise(resolve => window.setTimeout(resolve, 350));
    passwordDraft.value = { currentPassword: "", newPassword: "", confirmPassword: "" };
    if (passwordOpenedFromProfile.value) profileDrawerVisible.value = true;
    passwordOpenedFromProfile.value = false;
    Message.success("密码修改成功");
    return true;
  } catch {
    passwordError.value = "密码修改失败，请稍后重试";
    return false;
  }
}
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
  return { customerKey, customerCode: "", customerName: "", projectKey: "", projectCode: "", projectName: "", phaseCode: "", phaseName: "", phaseStatus: "未开始", phaseOwner: "李项目", phaseDatesRange: [] };
}
function openProjectCreateModal() {
  if (!canManageProject.value) { Message.warning("当前账号没有项目管理权限"); return; }
  projectCreateMode.value = "create";
  projectCreateEditingKey.value = "";
  projectCreateType.value = "project";
  projectCreateDraft.value = emptyProjectCreateDraft();
  projectCreateModalVisible.value = true;
}
function openProjectEdit(project) {
  if (!canManageProject.value) { Message.warning("当前账号没有项目管理权限"); return; }
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
  if (!canManageProject.value) { Message.warning("当前账号没有项目管理权限"); return; }
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
function purgePhaseArtifacts(phaseKeys) {
  const deletedPhaseKeys = new Set(phaseKeys);
  const removedTaskIds = new Set(tasks.value.filter(task => deletedPhaseKeys.has(task.phase)).map(task => task.id));
  const omitDeletedPhaseKeys = source => Object.fromEntries(Object.entries(source).filter(([key]) => !deletedPhaseKeys.has(key)));

  tasks.value = tasks.value.filter(task => !deletedPhaseKeys.has(task.phase));
  boardOrder.value = boardOrder.value.filter(taskId => !removedTaskIds.has(taskId));
  dailyReports.value = dailyReports.value.flatMap(report => {
    const tasks = (report.tasks || []).filter(entry => !deletedPhaseKeys.has(entry.phase));
    return tasks.length ? [normalizeDailyReport({ ...report, tasks })] : reportHasPhase(report, deletedPhaseKeys) ? [] : [report];
  });
  phaseFiles.value = omitDeletedPhaseKeys(phaseFiles.value);
  phaseMembers.value = omitDeletedPhaseKeys(phaseMembers.value);
  phaseWorklogs.value = omitDeletedPhaseKeys(phaseWorklogs.value);
  phaseOverrides.value = omitDeletedPhaseKeys(phaseOverrides.value);
  recentPhaseKeys.value = recentPhaseKeys.value.filter(key => !deletedPhaseKeys.has(key));
  taskActivities.value = Object.fromEntries(Object.entries(taskActivities.value).filter(([taskId]) => !removedTaskIds.has(taskId)));
  taskComments.value = Object.fromEntries(Object.entries(taskComments.value).filter(([taskId]) => !removedTaskIds.has(taskId)));

  if (selectedTask.value && deletedPhaseKeys.has(selectedTask.value.phase)) selectedTask.value = null;
  if (selectedDailyReport.value && deletedPhaseKeys.has(selectedDailyReport.value.phase)) selectedDailyReport.value = null;
}
function removeProject(project) {
  if (!canManageProject.value) { Message.warning("当前账号没有项目管理权限"); return; }
  const current = projectByKey(project.key) || project;
  const customer = projects.find(item => item.key === current.customerCode);
  if (!customer) return;
  const target = customer.projects.find(item => item.key === current.key);
  if (!target) return;
  const phaseKeys = target.phases.map(phase => phase.key);
  const linkedTaskCount = tasks.value.filter(task => phaseKeys.includes(task.phase)).length;
  const linkedReportCount = dailyReports.value.filter(report => reportHasPhase(report, phaseKeys)).length;
  Modal.confirm({
    title: "删除项目",
    content: target.phases.length ? `将删除“${target.name}”及 ${target.phases.length} 个期号、${linkedTaskCount} 项关联任务和 ${linkedReportCount} 份日报，相关文件、成员与工时演示数据也会清理。此操作不可恢复。` : `确定删除项目“${target.name}”吗？`,
    okText: "删除",
    cancelText: "取消",
    onOk: () => {
      purgePhaseArtifacts(phaseKeys);
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
  if (!canManageProject.value) { Message.warning("当前账号没有项目管理权限"); return; }
  const current = phaseByKey(phase.key) || phase;
  const customer = projects.find(item => item.key === current.customerCode);
  const target = customer?.projects.find(item => item.key === `${current.customerCode}-${current.projectCode}`);
  if (!target) return;
  const linkedTaskCount = tasks.value.filter(task => task.phase === current.key).length;
  const linkedReportCount = dailyReports.value.filter(report => reportHasPhase(report, [current.key])).length;
  Modal.confirm({
    title: "删除期号",
    content: `将删除期号“${current.name}”及 ${linkedTaskCount} 项关联任务、${linkedReportCount} 份日报，相关文件、成员与工时演示数据也会清理。此操作不可恢复。`,
    okText: "删除",
    cancelText: "取消",
    onOk: () => {
      purgePhaseArtifacts([current.key]);
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
function openPhaseListMenu(phase, action) {
  if (action === "edit-phase") return openPhaseEdit(phase);
  return removePhase(phase);
}
function openPhaseListProjectMenu(group, action) {
  const project = projectByKey(group.key);
  if (!project) return;
  if (action === "edit-project") return openProjectEdit(project);
  return removeProject(project);
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
  if (projectCreateType.value === "customer") {
    const code = String(draftValue.customerCode || "").trim();
    const name = String(draftValue.customerName || "").trim();
    if (!code || !name) { Message.warning("请填写客户编号和客户名称"); return; }
    if (projects.some(customer => customer.code === code || customer.name === name || customer.key === code)) {
      Message.warning("已存在相同客户编号或名称");
      return;
    }
    projects.push({ key: code, code, name, projects: [] });
    projectRevision.value += 1;
    projectCreateModalVisible.value = false;
    Message.success("客户已添加");
    return;
  }
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
  const phase = taskCreationSource.value === "project" ? selectedPhase.value?.key : draft.value.phase;
  if (!phase) { Message.warning("请选择项目期号"); return; }
  const task = { ...draft.value, subtasks: [...(draft.value.subtasks || [])], createdAt: Date.now(), owner: executors[0], confirmer: draft.value.confirmer || "李项目", executors, id: `T-${Date.now().toString().slice(-6)}`, phase, start: "2026-08-18", progress: draft.value.status === "已完成" ? 100 : 0 };
  tasks.value = [task, ...tasks.value]; boardOrder.value = [task.id, ...boardOrder.value];
  appendTaskActivity(task.id, "创建任务", `创建任务“${task.title}”`);
  taskModalVisible.value = false; Message.success("任务创建成功");
}
function addSubtask() {
  const title = subtaskDraft.value.trim();
  if (!title) { Message.warning("请输入子任务名称"); return; }
  draft.value.subtasks = [...(draft.value.subtasks || []), { id: `subtask-${Date.now()}`, title, status: "未完成", assignee: subtaskAssigneeDraft.value || draft.value.executors?.[0] || "李项目" }];
  subtaskDraft.value = "";
  subtaskAssigneeDraft.value = draft.value.executors?.[0] || "李项目";
  taskModalSubtaskAdding.value = false;
}
function removeSubtask(subtask) {
  Modal.confirm({
    title: "移除子任务",
    content: `确定移除子任务“${subtask.title}”吗？`,
    okText: "移除",
    cancelText: "取消",
    onOk: () => {
      draft.value.subtasks = (draft.value.subtasks || []).filter(item => item.id !== subtask.id);
      if (draftSubtaskEditingId.value === subtask.id) cancelDraftSubtaskEdit();
      Message.success("子任务已移除");
    },
  });
}
function startDraftSubtask() {
  taskModalSubtaskAdding.value = true;
  subtaskDraft.value = "";
  subtaskAssigneeDraft.value = draft.value.executors?.[0] || "李项目";
}
function cancelDraftSubtask() {
  taskModalSubtaskAdding.value = false;
  subtaskDraft.value = "";
  subtaskAssigneeDraft.value = draft.value.executors?.[0] || "李项目";
}
function toggleDraftSubtask(subtask) {
  const status = subtask.status === "已完成" ? "未完成" : "已完成";
  draft.value.subtasks = (draft.value.subtasks || []).map(item => item.id === subtask.id ? { ...item, status } : item);
}
function updateDraftSubtaskAssignee(subtask, assignee) {
  if (!assignee || subtask.assignee === assignee) return;
  draft.value.subtasks = (draft.value.subtasks || []).map(item => item.id === subtask.id ? { ...item, assignee } : item);
}
function startDraftSubtaskEdit(subtask) {
  draftSubtaskEditingId.value = subtask.id;
  draftSubtaskEditDraft.value = { title: subtask.title, assignee: subtask.assignee || draft.value.executors?.[0] || "李项目" };
}
function cancelDraftSubtaskEdit() {
  draftSubtaskEditingId.value = null;
  draftSubtaskEditDraft.value = { title: "", assignee: "李项目" };
}
function saveDraftSubtaskEdit(subtask) {
  const title = draftSubtaskEditDraft.value.title.trim();
  if (!title) { Message.warning("子任务名称不能为空"); return; }
  const assignee = draftSubtaskEditDraft.value.assignee || draft.value.executors?.[0] || "李项目";
  draft.value.subtasks = (draft.value.subtasks || []).map(item => item.id === subtask.id ? { ...item, title, assignee } : item);
  cancelDraftSubtaskEdit();
}
function startDraftSubtaskDrag(subtask, event) {
  draggedDraftSubtaskId.value = subtask.id;
  event.dataTransfer.effectAllowed = "move";
  event.dataTransfer.setData("application/x-haiba-draft-subtask", subtask.id);
}
function dropDraftSubtask(subtask, event) {
  event.preventDefault();
  const sourceId = draggedDraftSubtaskId.value || event.dataTransfer.getData("application/x-haiba-draft-subtask");
  if (!sourceId || sourceId === subtask.id) { draggedDraftSubtaskId.value = null; return; }
  const currentSubtasks = draft.value.subtasks || [];
  const source = currentSubtasks.find(item => item.id === sourceId);
  if (!source) { draggedDraftSubtaskId.value = null; return; }
  const next = currentSubtasks.filter(item => item.id !== sourceId);
  const targetIndex = next.findIndex(item => item.id === subtask.id);
  const bounds = event.currentTarget.getBoundingClientRect();
  const insertAfter = event.clientY > bounds.top + bounds.height / 2;
  next.splice(targetIndex + (insertAfter ? 1 : 0), 0, source);
  draft.value.subtasks = next;
  draggedDraftSubtaskId.value = null;
}
function exportTasks() {
  const selected = visibleTasks.value;
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
function handleTaskChecklistChange(task) {
  const action = taskChecklistAction(task);
  if (action === "submit") {
    updateTaskStatus(task.id, "待确认", "任务结果已提交，等待确认");
    return;
  }
  if (action === "confirm") {
    updateTaskStatus(task.id, "已完成", "确认通过，任务已完成");
    return;
  }
  if (action === "reopen") {
    Modal.confirm({
      title: "重新打开任务",
      content: `确定将“${task.title}”重新打开并改为未完成吗？`,
      okText: "重新打开",
      cancelText: "取消",
      onOk: () => updateTaskStatus(task.id, "未完成", "任务已重新打开"),
    });
  }
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
  Modal.confirm({
    title: "删除看板列",
    content: affected ? `“${lane.title}”中的 ${affected} 个任务将移入“${fallback.title}”，确定删除吗？` : `确定删除看板列“${lane.title}”吗？`,
    okText: "删除",
    cancelText: "取消",
    onOk: () => {
      boardLanes.value = boardLanes.value.filter(item => item.key !== lane.key);
      if (affected) tasks.value = tasks.value.map(task => task.status === lane.title ? { ...task, status: fallback.title } : task);
      Message.success(affected ? `看板列已删除，${affected} 个任务已移入“${fallback.title}”` : "看板列已删除");
    },
  });
}
function boardLaneAction(lane, action) {
  if (action === "edit") openLaneModal(lane);
  if (action === "assign") openLaneAssignModal(lane);
  if (action === "delete") deleteLane(lane);
}
function openLaneAssignModal(lane) {
  if (!canManageTasks.value) { Message.warning("当前账号没有调整任务执行人的权限"); return; }
  laneAssignTarget.value = lane;
  laneAssignExecutors.value = [];
  laneAssignModalVisible.value = true;
}
function applyLaneAssignees() {
  const lane = laneAssignTarget.value;
  const executors = laneAssignExecutors.value.filter(Boolean);
  if (!lane || !executors.length) { Message.warning("请选择执行人"); return false; }
  const taskKeys = new Set(orderedBoardTasks(lane).map(task => task.id));
  if (!taskKeys.size) { Message.warning("当前列没有可调整的任务"); return false; }
  tasks.value = tasks.value.map(task => taskKeys.has(task.id) ? { ...task, owner: executors[0], executors: [...executors] } : task);
  laneAssignModalVisible.value = false;
  Message.success(`已为 ${taskKeys.size} 个任务指定执行人`);
  return true;
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
function exportWorkHours() {
  const rows = workHoursFilteredLogs.value.map(log => [
    log.phase?.code || log.phaseKey,
    log.phase?.name || "",
    log.phase?.projectName || "",
    log.date,
    log.member,
    log.hours,
    log.content,
  ]);
  if (!rows.length) {
    Message.warning("当前筛选没有可导出的工时记录");
    return;
  }
  const headers = ["期号", "期号名称", "项目名称", "日期", "成员", "工时", "工作内容"];
  const csv = [headers, ...rows]
    .map(row => row.map(value => `"${String(value ?? "").replaceAll('"', '""')}"`).join(","))
    .join("\n");
  const url = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = `工时统计-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
  Message.success(`已导出 ${rows.length} 条工时记录`);
}
function moveTask(taskKey, targetKey, laneTitle) {
  const task = tasks.value.find(item => item.id === taskKey);
  if (!task) return;
  if (laneTitle === "已完成" && task.status !== "待确认") {
    Message.warning("请先将任务提交确认，再移入已完成");
    return;
  }
  const nextOrder = boardOrder.value.filter(id => id !== taskKey);
  const targetIndex = targetKey ? nextOrder.indexOf(targetKey) : nextOrder.length;
  nextOrder.splice(targetIndex < 0 ? nextOrder.length : targetIndex, 0, taskKey);
  boardOrder.value = nextOrder;
  if (task.status !== laneTitle) updateTaskStatus(taskKey, laneTitle, `已移入“${laneTitle}”`);
}
function startTaskDrag(task, event) {
  draggedLaneKey.value = null;
  draggedTaskKey.value = task.id;
  event.dataTransfer.effectAllowed = "move";
  event.dataTransfer.setData("text/plain", task.id);
}
function dropTaskOnLane(lane, event) {
  event.preventDefault();
  if (isLaneDrag(event)) {
    dropLane(lane, event);
    return;
  }
  const taskKey = draggedTaskKey.value || event.dataTransfer.getData("text/plain");
  if (taskKey) moveTask(taskKey, null, lane.title);
  draggedTaskKey.value = null;
}
function dropTaskBefore(task, lane, event) {
  event.preventDefault();
  event.stopPropagation();
  if (isLaneDrag(event)) {
    dropLane(lane, event);
    return;
  }
  const taskKey = draggedTaskKey.value || event.dataTransfer.getData("text/plain");
  if (taskKey && taskKey !== task.id) moveTask(taskKey, task.id, lane.title);
  draggedTaskKey.value = null;
}
function startLaneDrag(lane, event) {
  if (event.target.closest(".task-board-card, .task-board-lane-more, .task-board-add-task")) {
    event.preventDefault();
    return;
  }
  draggedTaskKey.value = null;
  draggedLaneKey.value = lane.key;
  event.dataTransfer.effectAllowed = "move";
  event.dataTransfer.setData("application/x-haiba-lane", lane.key);
}
function isLaneDrag(event) {
  return Boolean(draggedLaneKey.value || Array.from(event.dataTransfer?.types || []).includes("application/x-haiba-lane"));
}
function clearLaneDrag() {
  draggedLaneKey.value = null;
}
function dropBoardLaneOrTask(lane, event) {
  if (isLaneDrag(event)) {
    dropLane(lane, event);
    return;
  }
  dropTaskOnLane(lane, event);
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
function openTaskModal(initialStatus = "") {
  if (!canManageTasks.value) { Message.warning("当前账号没有创建任务权限"); return; }
  taskCreationSource.value = activeNav.value === "项目" ? "project" : "task";
  draft.value = emptyDraft();
  draft.value.phase = selectedPhase.value?.key || dashboardPhaseRows.value[0]?.key || "";
  if (typeof initialStatus === "string" && initialStatus) draft.value.status = initialStatus;
  cancelDraftSubtask();
  cancelDraftSubtaskEdit();
  draggedDraftSubtaskId.value = null;
  taskModalVisible.value = true;
}
function openTaskModalForLane(lane) {
  openTaskModal(lane.title);
}
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
function requestTaskStatusChange(id, status) {
  const current = tasks.value.find(task => task.id === id);
  if (!current || current.status === status) return;
  if (status === "待确认" && current.status !== "未完成") {
    Message.warning("只有未完成任务可以提交确认");
    return;
  }
  if (status === "已完成") {
    if (current.status !== "待确认") {
      Message.warning("请先提交任务结果，待确认后再完成任务");
      return;
    }
    Modal.confirm({
      title: "确认完成任务",
      content: `确定确认“${current.title}”已完成吗？`,
      okText: "确认完成",
      cancelText: "取消",
      onOk: () => updateTaskStatus(id, "已完成", "确认通过，任务已完成"),
    });
    return;
  }
  updateTaskStatus(id, status);
}
function updateTaskPriority(id, priority) {
  const current = tasks.value.find(task => task.id === id);
  if (!current || current.priority === priority) return;
  tasks.value = tasks.value.map(task => task.id === id ? { ...task, priority } : task);
  if (selectedTask.value?.id === id) selectedTask.value = { ...selectedTask.value, priority };
  appendTaskActivity(id, "调整优先级", `${current.priority} → ${priority}`);
  Message.success("任务优先级已更新");
}
function updateTaskConfirmer(id, confirmer) {
  const current = tasks.value.find(task => task.id === id);
  if (!current || !confirmer || current.confirmer === confirmer) return;
  tasks.value = tasks.value.map(task => task.id === id ? { ...task, confirmer } : task);
  if (selectedTask.value?.id === id) selectedTask.value = { ...selectedTask.value, confirmer };
  appendTaskActivity(id, "调整确认人", `${current.confirmer || current.owner} → ${confirmer}`);
  Message.success("任务确认人已更新");
}
function updateTaskExecutors(id, executors) {
  if (!executors?.length) { Message.warning("请至少保留一名执行人"); return; }
  const current = tasks.value.find(task => task.id === id);
  if (!current) return;
  const previous = current.executors?.length ? current.executors : [current.owner];
  if (previous.length === executors.length && previous.every((member, index) => member === executors[index])) return;
  const nextTask = { ...current, executors: [...executors], owner: executors[0] };
  tasks.value = tasks.value.map(task => task.id === id ? nextTask : task);
  if (selectedTask.value?.id === id) selectedTask.value = { ...selectedTask.value, executors: [...executors], owner: executors[0] };
  appendTaskActivity(id, "调整执行人", `${previous.join("、")} → ${executors.join("、")}`);
  Message.success("任务执行人已更新");
}
function updateTaskDueDate(id, due) {
  const current = tasks.value.find(task => task.id === id);
  if (!current || !due || current.due === due) return;
  tasks.value = tasks.value.map(task => task.id === id ? { ...task, due } : task);
  if (selectedTask.value?.id === id) selectedTask.value = { ...selectedTask.value, due };
  appendTaskActivity(id, "调整截止时间", `${current.due} → ${due}`);
  Message.success("任务截止时间已更新");
}
function updateTaskPhase(id, phaseKey) {
  const current = tasks.value.find(task => task.id === id);
  const nextPhase = taskPhaseOptions.value.find(phase => phase.key === phaseKey);
  if (!current || !nextPhase || current.phase === phaseKey) return;
  tasks.value = tasks.value.map(task => task.id === id ? { ...task, phase: phaseKey } : task);
  if (selectedTask.value?.id === id) selectedTask.value = { ...selectedTask.value, phase: phaseKey };
  const currentPhase = phaseByKey(current.phase);
  appendTaskActivity(id, "调整所属期号", `${currentPhase ? `${currentPhase.code} ${currentPhase.name}` : current.phase} → ${nextPhase.code} ${nextPhase.name}`);
  Message.success("任务所属期号已更新");
}
function saveTaskDescription() {
  if (!selectedTask.value) return;
  const description = taskDescriptionDraft.value.trim();
  if (description === String(selectedTask.value.description || "").trim()) return;
  const taskId = selectedTask.value.id;
  tasks.value = tasks.value.map(task => task.id === taskId ? { ...task, description } : task);
  selectedTask.value = { ...selectedTask.value, description };
  appendTaskActivity(taskId, "更新任务描述", description ? "修改了任务描述" : "清空了任务描述");
  Message.success("任务描述已保存");
}
function toggleSubtask(taskId, subtask) {
  const nextStatus = subtask.status === "已完成" ? "未完成" : "已完成";
  tasks.value = tasks.value.map(task => task.id === taskId ? { ...task, subtasks: (task.subtasks || []).map(item => item.id === subtask.id ? { ...item, status: nextStatus } : item) } : task);
  if (selectedTask.value?.id === taskId) selectedTask.value = { ...selectedTask.value, subtasks: (selectedTask.value.subtasks || []).map(item => item.id === subtask.id ? { ...item, status: nextStatus } : item) };
  appendTaskActivity(taskId, "更新子任务", `${subtask.title} → ${nextStatus}`);
}
function syncSelectedTaskSubtasks(subtasks) {
  if (!selectedTask.value) return;
  const taskId = selectedTask.value.id;
  tasks.value = tasks.value.map(task => task.id === taskId ? { ...task, subtasks } : task);
  selectedTask.value = { ...selectedTask.value, subtasks };
}
function updateSubtaskAssignee(subtask, assignee) {
  if (!selectedTask.value || !assignee || subtask.assignee === assignee) return;
  const previous = subtask.assignee || "未指定";
  const subtasks = (selectedTask.value.subtasks || []).map(item => item.id === subtask.id ? { ...item, assignee } : item);
  syncSelectedTaskSubtasks(subtasks);
  appendTaskActivity(selectedTask.value.id, "调整子任务执行人", `${subtask.title}：${previous} → ${assignee}`);
}
function startSubtaskEdit(subtask) {
  subtaskEditingId.value = subtask.id;
  subtaskEditDraft.value = { title: subtask.title, assignee: subtask.assignee || selectedTask.value?.owner || "李项目" };
}
function cancelSubtaskEdit() {
  subtaskEditingId.value = null;
  subtaskEditDraft.value = { title: "", assignee: "李项目" };
}
function saveSubtaskEdit(subtask) {
  if (!selectedTask.value) return;
  const title = subtaskEditDraft.value.title.trim();
  if (!title) { Message.warning("子任务名称不能为空"); return; }
  const assignee = subtaskEditDraft.value.assignee || selectedTask.value.owner || "李项目";
  const subtasks = (selectedTask.value.subtasks || []).map(item => item.id === subtask.id ? { ...item, title, assignee } : item);
  syncSelectedTaskSubtasks(subtasks);
  const changes = [];
  if (title !== subtask.title) changes.push(`名称：${subtask.title} → ${title}`);
  if (assignee !== subtask.assignee) changes.push(`执行人：${subtask.assignee || "未指定"} → ${assignee}`);
  if (changes.length) appendTaskActivity(selectedTask.value.id, "编辑子任务", changes.join("；"));
  cancelSubtaskEdit();
  Message.success("子任务已更新");
}
function startSubtaskDrag(subtask, event) {
  draggedSubtaskId.value = subtask.id;
  event.dataTransfer.effectAllowed = "move";
  event.dataTransfer.setData("application/x-haiba-subtask", subtask.id);
}
function dropSubtask(subtask, event) {
  event.preventDefault();
  const sourceId = draggedSubtaskId.value || event.dataTransfer.getData("application/x-haiba-subtask");
  if (!selectedTask.value || !sourceId || sourceId === subtask.id) { draggedSubtaskId.value = null; return; }
  const currentSubtasks = selectedTask.value.subtasks || [];
  const source = currentSubtasks.find(item => item.id === sourceId);
  if (!source) { draggedSubtaskId.value = null; return; }
  const next = currentSubtasks.filter(item => item.id !== sourceId);
  const targetIndex = next.findIndex(item => item.id === subtask.id);
  const bounds = event.currentTarget.getBoundingClientRect();
  const insertAfter = event.clientY > bounds.top + bounds.height / 2;
  next.splice(targetIndex + (insertAfter ? 1 : 0), 0, source);
  syncSelectedTaskSubtasks(next);
  draggedSubtaskId.value = null;
  appendTaskActivity(selectedTask.value.id, "调整子任务顺序", `移动“${source.title}”`);
}
function startTaskTitleEdit() {
  if (!selectedTask.value) return;
  taskTitleDraft.value = selectedTask.value.title;
  taskTitleEditing.value = true;
}
function cancelTaskTitleEdit() {
  taskTitleEditing.value = false;
  taskTitleDraft.value = "";
}
function saveTaskTitle() {
  if (!selectedTask.value || !taskTitleEditing.value) return;
  const title = taskTitleDraft.value.trim();
  if (!title) { Message.warning("任务名称不能为空"); return; }
  const previousTitle = selectedTask.value.title;
  if (title !== previousTitle) {
    tasks.value = tasks.value.map(task => task.id === selectedTask.value.id ? { ...task, title } : task);
    selectedTask.value = { ...selectedTask.value, title };
    appendTaskActivity(selectedTask.value.id, "修改任务名称", `${previousTitle} → ${title}`);
    Message.success("任务名称已更新");
  }
  cancelTaskTitleEdit();
}
function addTaskDrawerSubtask() {
  if (!selectedTask.value) return;
  const title = subtaskDraft.value.trim();
  if (!title) { Message.warning("请输入子任务名称"); return; }
  const subtask = { id: `subtask-${Date.now()}`, title, status: "未完成", assignee: subtaskAssigneeDraft.value || "李项目" };
  const subtasks = [...(selectedTask.value.subtasks || []), subtask];
  tasks.value = tasks.value.map(task => task.id === selectedTask.value.id ? { ...task, subtasks } : task);
  selectedTask.value = { ...selectedTask.value, subtasks };
  subtaskDraft.value = "";
  subtaskAssigneeDraft.value = "李项目";
  taskDrawerSubtaskAdding.value = false;
  appendTaskActivity(selectedTask.value.id, "新增子任务", title);
}
function startTaskDrawerSubtask() {
  taskDrawerSubtaskAdding.value = true;
  subtaskDraft.value = "";
  subtaskAssigneeDraft.value = "李项目";
}
function cancelTaskDrawerSubtask() {
  taskDrawerSubtaskAdding.value = false;
  subtaskDraft.value = "";
  subtaskAssigneeDraft.value = "李项目";
}
function removeTaskDrawerSubtask(subtask) {
  if (!selectedTask.value) return;
  Modal.confirm({
    title: "移除子任务",
    content: `确定移除子任务“${subtask.title}”吗？`,
    okText: "移除",
    cancelText: "取消",
    onOk: () => {
      if (!selectedTask.value) return;
      const subtasks = (selectedTask.value.subtasks || []).filter(item => item.id !== subtask.id);
      tasks.value = tasks.value.map(task => task.id === selectedTask.value.id ? { ...task, subtasks } : task);
      selectedTask.value = { ...selectedTask.value, subtasks };
      if (subtaskEditingId.value === subtask.id) cancelSubtaskEdit();
      appendTaskActivity(selectedTask.value.id, "移除子任务", subtask.title);
      Message.success("子任务已移除");
    },
  });
}
function onTaskRowClick(record) {
  selectedTask.value = record;
  commentDraft.value = "";
  commentEditingId.value = null;
  commentEditDraft.value = "";
  replyingTo.value = null;
  cancelTaskDrawerSubtask();
  cancelSubtaskEdit();
  draggedSubtaskId.value = null;
  taskTitleEditing.value = false;
  taskTitleDraft.value = "";
  taskDescriptionDraft.value = record.description || "";
  taskCollaborationTab.value = "comments";
}
function commentText(html) { return String(html || "").replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ").trim(); }
function replyToComment(comment) {
  commentEditingId.value = null;
  commentEditDraft.value = "";
  replyingTo.value = comment;
  commentDraft.value = `@${comment.author} `;
}
function editTaskComment(comment) {
  if (comment.author !== accountProfile.value.nickname) { Message.warning("只能编辑自己发布的评论"); return; }
  replyingTo.value = null;
  commentDraft.value = "";
  commentEditingId.value = comment.id;
  commentEditDraft.value = comment.content;
}
function cancelTaskCommentEdit() {
  commentEditingId.value = null;
  commentEditDraft.value = "";
}
function saveTaskCommentEdit(comment) {
  if (!selectedTask.value || comment.author !== accountProfile.value.nickname) return;
  if (!commentText(commentEditDraft.value)) { Message.warning("评论内容不能为空"); return; }
  const taskId = selectedTask.value.id;
  taskComments.value = {
    ...taskComments.value,
    [taskId]: (taskComments.value[taskId] || []).map(item => item.id === comment.id ? { ...item, content: commentEditDraft.value, edited: true, editedAt: "刚刚" } : item),
  };
  appendTaskActivity(taskId, "编辑评论", "更新了评论内容");
  cancelTaskCommentEdit();
  Message.success("评论已更新");
}
function deleteTaskComment(comment) {
  if (!selectedTask.value || comment.author !== accountProfile.value.nickname) { Message.warning("只能删除自己发布的评论"); return; }
  Modal.confirm({
    title: "删除评论",
    content: "删除后评论内容和其回复将无法恢复，确定删除吗？",
    okText: "删除",
    cancelText: "取消",
    onOk: () => {
      const taskId = selectedTask.value?.id;
      if (!taskId) return;
      const comments = taskComments.value[taskId] || [];
      const removedIds = new Set([comment.id]);
      let changed = true;
      while (changed) {
        changed = false;
        comments.forEach(item => { if (item.parentId && removedIds.has(item.parentId) && !removedIds.has(item.id)) { removedIds.add(item.id); changed = true; } });
      }
      taskComments.value = { ...taskComments.value, [taskId]: comments.filter(item => !removedIds.has(item.id)) };
      if (commentEditingId.value === comment.id) cancelTaskCommentEdit();
      appendTaskActivity(taskId, "删除评论", "移除了评论及其回复");
      Message.success("评论已删除");
    },
  });
}
function addTaskComment() {
  if (!selectedTask.value || !commentText(commentDraft.value)) { Message.warning("请输入评论内容"); return; }
  const taskId = selectedTask.value.id;
  const comment = {
    id: `comment-${Date.now()}`,
    author: accountProfile.value.nickname,
    createdAt: "刚刚",
    content: escapeImportedText(commentDraft.value),
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
  if (!canManageProject.value) { Message.warning("当前账号没有期号管理权限"); return; }
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
function confirmPhaseSettings() {
  if (!phaseEditing.value || savePhaseBasicInfo()) phaseDrawerVisible.value = false;
}
function openWorkHoursPhaseReports(phase) { selectedWorkHoursPhase.value = phase; }
function openPhaseWorklogDetail(worklog) { selectedPhaseWorklog.value = worklog; }
const selectedDailyReportTaskEntries = computed(() => selectedDailyReport.value?.tasks || []);
function dailyReportDisplayName(report) { return `${report.sender}的日报 ${report.date}`; }
function openDailyReport(report) { selectedDailyReport.value = report; }
function openWorkHoursDailyReport(report) {
  selectedWorkHoursPhase.value = null;
  openDailyReport(report);
}
function createDailyReportTask() {
  return { id: `draft-task-${Date.now()}-${Math.random().toString(16).slice(2)}`, taskId: "", category: dailyReportTaskCategoryOptions.value[0] || "", title: "", phase: "", hours: 0, summary: "", blockers: "" };
}
function addDailyReportTask() {
  dailyReportDraft.value.tasks = [...(dailyReportDraft.value.tasks || []), createDailyReportTask()];
}
function removeDailyReportTask(entry) {
  if ((dailyReportDraft.value.tasks || []).length <= 1) {
    Message.warning("日报至少保留一条完成任务");
    return;
  }
  dailyReportDraft.value.tasks = dailyReportDraft.value.tasks.filter(item => item.id !== entry.id);
}
function openDailyReportModal(report = null) {
  if (!canManageReports.value) { Message.warning("当前账号没有日报管理权限"); return; }
  if (report && !isManagementRole.value && report.sender !== accountProfile.value.nickname) { Message.warning("只能编辑自己的日报"); return; }
  dailyReportEditingId.value = report?.id || null;
  const currentDate = report?.date || new Date().toISOString().slice(0, 10);
  dailyReportDraft.value = report
    ? { ...report, tasks: (report.tasks || []).map(entry => ({ ...entry })) }
    : { name: `${accountProfile.value.nickname}的日报 ${currentDate}`, sender: accountProfile.value.nickname, date: currentDate, tasks: [createDailyReportTask()], nextPlan: "", status: "待发送" };
  dailyReportModalVisible.value = true;
}
function syncDailyReportName() {
  dailyReportDraft.value.name = `${dailyReportDraft.value.sender || accountProfile.value.nickname}的日报 ${dailyReportDraft.value.date || new Date().toISOString().slice(0, 10)}`;
}
function saveDailyReport(nextStatus = dailyReportDraft.value.status) {
  const draft = dailyReportDraft.value;
  const entries = (draft.tasks || []).map(entry => ({ ...entry, category: String(entry.category || "").trim(), title: String(entry.title || "").trim(), summary: String(entry.summary || "").trim(), blockers: "", hours: Number(entry.hours || 0) }));
  if (!draft.date || !entries.length || entries.some(entry => !entry.category || !entry.title || entry.hours <= 0)) { Message.warning("请填写日报日期，并完整填写每条任务的分类、任务内容和工时"); return; }
  if (entries.some(entry => !entry.phase)) { Message.warning("每条日报任务都必须关联项目期号"); return; }
  const sender = draft.sender || accountProfile.value.nickname;
  const allowedCategories = dailyTaskCategoriesForSender(sender);
  if (entries.some(entry => !allowedCategories.includes(entry.category))) { Message.warning("请选择与当前人员角色匹配的任务分类"); return; }
  const report = normalizeDailyReport({ ...draft, status: nextStatus, tasks: entries, phase: entries.find(entry => entry.phase)?.phase || "", name: `${sender}的日报 ${draft.date}`, sender, sentAt: `${draft.date} 18:00` });
  if (dailyReportEditingId.value) {
    const index = dailyReports.value.findIndex(item => item.id === dailyReportEditingId.value);
    if (index >= 0) dailyReports.value[index] = report;
    if (selectedDailyReport.value?.id === report.id) selectedDailyReport.value = report;
    Message.success("日报已更新");
  } else {
    report.id = `DR-${report.date.replaceAll("-", "").slice(2)}-${String(dailyReports.value.length + 1).padStart(2, "0")}`;
    dailyReports.value.unshift(report);
    Message.success("日报已保存");
  }
  dailyReportModalVisible.value = false;
}
function deleteDailyReport(report) {
  if (!canManageReports.value || (!isManagementRole.value && report.sender !== accountProfile.value.nickname)) { Message.warning("当前账号没有删除该日报的权限"); return; }
  Modal.confirm({ title: "删除日报", content: `确定删除“${dailyReportDisplayName(report)}”吗？`, okText: "删除", cancelText: "取消", onOk: () => { dailyReports.value = dailyReports.value.filter(item => item.id !== report.id); if (selectedDailyReport.value?.id === report.id) selectedDailyReport.value = null; Message.success("日报已删除"); } });
}
function handleWorklogClick(event) {
  const row = event.target.closest?.(".worklog-row:not(.worklog-row-heading)");
  if (!row) return;
  const content = Array.from(row.children).at(-1)?.textContent?.trim();
  const log = filteredWorklogs.value.find(item => item.content === content);
  if (log) openWorkHoursPhaseReports(selectedPhase.value);
}
function handleRichTextMediaClick(event) {
  const media = event.target.closest?.(".rich-text-display img, .rich-text-display video, .rich-text-display audio");
  const attachment = event.target.closest?.(".rich-text-display .rich-text-file");
  if (!media && !attachment) return;
  event.preventDefault();
  if (attachment) mediaPreview.value = { type: "file", src: attachment.getAttribute("href") || "", alt: attachment.textContent?.trim() || "附件", download: attachment.getAttribute("download") || attachment.textContent?.trim() || "附件" };
  else mediaPreview.value = { type: media.tagName.toLowerCase(), src: media.getAttribute("src") || "", alt: media.getAttribute("alt") || "媒体预览" };
  mediaPreviewVisible.value = true;
}
function closeMediaPreview() {
  mediaPreviewVisible.value = false;
  mediaPreview.value = null;
}
onMounted(() => {
  document.addEventListener("click", handleWorklogClick);
  document.addEventListener("click", handleRichTextMediaClick);
});
onBeforeUnmount(() => {
  document.removeEventListener("click", handleWorklogClick);
  document.removeEventListener("click", handleRichTextMediaClick);
  window.clearInterval(loginCodeTimer);
});
function openPhaseFileModal() { if (!hasPermission("文件管理")) { Message.warning("当前账号没有文件管理权限"); return; } phaseFileEditingId.value = null; phaseFileDraft.value = { file: null, current: null }; if (phaseUploadInput.value) phaseUploadInput.value.value = ""; phaseUploadModalVisible.value = true; }
function openPhaseFileEdit(file) {
  if (!hasPermission("文件管理")) { Message.warning("当前账号没有文件管理权限"); return; }
  if (phaseOnlineFileTypes.some(option => option.type === file.type)) {
    openPhaseOnlineFileEditor(file.type, file);
    return;
  }
  phaseFileEditingId.value = file.id;
  phaseFileDraft.value = { file: null, current: file };
  if (phaseFileInput.value) phaseFileInput.value.value = "";
  phaseFileModalVisible.value = true;
}
function formatFileSize(bytes) {
  if (!bytes) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${(bytes / 1024 / 1024 / 1024).toFixed(1)} GB`;
}
function handlePhaseFileChange(event) {
  const file = event.target.files?.[0] || null;
  if (!file) { phaseFileDraft.value = { ...phaseFileDraft.value, file: null }; return; }
  const extension = file.name.includes(".") ? file.name.split(".").pop().toLowerCase() : "";
  if (!phaseFileAllowedExtensions.has(extension)) {
    event.target.value = "";
    phaseFileDraft.value = { ...phaseFileDraft.value, file: null };
    Message.warning("暂不支持该文件格式，请上传 Word、Excel、PPT、PDF、图片或压缩包");
    return;
  }
  if (file.size > 50 * 1024 * 1024) {
    event.target.value = "";
    phaseFileDraft.value = { ...phaseFileDraft.value, file: null };
    Message.warning("单个文件不能超过 50 MB");
    return;
  }
  phaseFileDraft.value = { ...phaseFileDraft.value, file };
}
function savePhaseFile() {
  const file = phaseFileDraft.value.file;
  if (!file) { Message.warning("请选择要上传的文件"); return; }
  const extension = file.name.includes(".") ? file.name.split(".").pop().toUpperCase() : "文件";
  const metadata = { name: file.name, type: extension, size: formatFileSize(file.size), source: file, updated: new Date().toISOString().slice(0, 10) };
  const nextFiles = phaseFileEditingId.value
    ? currentPhaseFiles.value.map(item => item.id === phaseFileEditingId.value ? { ...item, ...metadata } : item)
    : [{ id: `file-${Date.now()}`, ...metadata }, ...currentPhaseFiles.value];
  phaseFiles.value = { ...phaseFiles.value, [selectedPhase.value.key]: nextFiles };
  phaseFileModalVisible.value = false;
  phaseUploadModalVisible.value = false;
  Message.success(phaseFileEditingId.value ? "项目文件已更新" : "项目文件已添加");
  phaseFileEditingId.value = null;
}
function createPhaseOnlineFileDraft(type, file = null) {
  const option = phaseOnlineFileTypes.find(item => item.type === type) || phaseOnlineFileTypes[0];
  const suffix = `.${option.extension}`;
  const sourceName = file?.name || option.defaultName;
  const name = sourceName.toLowerCase().endsWith(suffix) ? sourceName.slice(0, -suffix.length) : sourceName;
  return {
    type: option.type,
    name,
    content: file?.content || "",
    cells: { ...(file?.cells || {}) },
    slides: file?.slides?.length ? JSON.parse(JSON.stringify(file.slides)) : [{ id: `slide-${Date.now()}`, layout: "content", title: "演示文稿标题", body: "" }],
    sheetRows: file?.sheetRows || 20,
    sheetColumns: file?.sheetColumns || 10,
  };
}
function openPhaseOnlineFileEditor(type, file = null) {
  if (!hasPermission("文件管理")) { Message.warning("当前账号没有文件管理权限"); return; }
  phaseOnlineFileDraft.value = createPhaseOnlineFileDraft(type, file);
  onlineFileEditorPhaseKey.value = selectedPhase.value.key;
  onlineFileEditorFileId.value = file?.id || null;
  onlineFileSavedSnapshot.value = file ? JSON.stringify(phaseOnlineFileDraft.value) : "";
  onlineFileEditorVisible.value = true;
}
function savePhaseOnlineFile(nextDraft) {
  const option = phaseOnlineFileTypes.find(item => item.type === nextDraft.type) || phaseOnlineFileTypes[0];
  const name = nextDraft.name.trim();
  if (!name) { Message.warning("请输入文件名称"); return; }
  const suffix = `.${option.extension}`;
  const fileName = name.toLowerCase().endsWith(suffix) ? name : `${name}${suffix}`;
  const phaseKey = onlineFileEditorPhaseKey.value;
  const editorPhaseFiles = phaseFiles.value[phaseKey] || [];
  if (editorPhaseFiles.some(file => file.id !== onlineFileEditorFileId.value && file.name.toLowerCase() === fileName.toLowerCase())) {
    Message.warning("当前期号已存在同名文件");
    return;
  }
  const serializedContent = JSON.stringify(nextDraft);
  const sizeInKb = Math.max(1, Math.ceil(new Blob([serializedContent]).size / 1024));
  const onlineFile = {
    id: onlineFileEditorFileId.value || `file-${Date.now()}`,
    name: fileName,
    type: option.type,
    size: `${sizeInKb} KB`,
    updated: new Date().toISOString().slice(0, 10),
    updatedBy: accountProfile.value.nickname,
    online: true,
    content: nextDraft.content || "",
    cells: { ...(nextDraft.cells || {}) },
    slides: JSON.parse(JSON.stringify(nextDraft.slides || [])),
    sheetRows: nextDraft.sheetRows || 20,
    sheetColumns: nextDraft.sheetColumns || 10,
  };
  const editing = Boolean(onlineFileEditorFileId.value);
  const nextFiles = editing
    ? editorPhaseFiles.map(file => file.id === onlineFileEditorFileId.value ? { ...file, ...onlineFile } : file)
    : [onlineFile, ...editorPhaseFiles];
  phaseFiles.value = { ...phaseFiles.value, [phaseKey]: nextFiles };
  onlineFileEditorFileId.value = onlineFile.id;
  phaseOnlineFileDraft.value = JSON.parse(serializedContent);
  onlineFileSavedSnapshot.value = serializedContent;
  phaseFileKeyword.value = "";
  phaseFileTypeFilter.value = "全部类型";
  phaseWorkspaceTab.value = "资料";
  Message.success(editing ? `${option.label}已保存` : `${option.label}已新建并保存`);
}
function closePhaseOnlineFileEditor({ dirty }) {
  const close = () => {
    onlineFileEditorVisible.value = false;
    onlineFileEditorFileId.value = null;
    onlineFileEditorPhaseKey.value = "";
  };
  if (!dirty) { close(); return; }
  Modal.confirm({
    title: "退出在线编辑",
    content: "当前修改尚未保存，确定放弃修改并返回项目文件吗？",
    okText: "放弃修改",
    cancelText: "继续编辑",
    onOk: close,
  });
}
function previewPhaseFile(file) {
  if (phaseFilePreviewUrl.value) URL.revokeObjectURL(phaseFilePreviewUrl.value);
  phaseFilePreview.value = file;
  if (file.online) {
    phaseFilePreviewUrl.value = "";
    onlineFilePreviewVisible.value = true;
    return;
  }
  phaseFilePreviewUrl.value = file.source ? URL.createObjectURL(file.source) : "";
  phaseFilePreviewVisible.value = true;
}
function closeOnlinePhaseFilePreview() {
  onlineFilePreviewVisible.value = false;
  phaseFilePreview.value = null;
}
function closePhaseFilePreview() {
  if (phaseFilePreviewUrl.value) URL.revokeObjectURL(phaseFilePreviewUrl.value);
  phaseFilePreviewUrl.value = "";
  phaseFilePreview.value = null;
  phaseFilePreviewVisible.value = false;
}
function triggerPhaseFileDownload(content, fileName, mimeType) {
  const blob = content instanceof Blob ? content : new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}
function phaseFileBaseName(file) {
  return String(file.name || "项目文件").replace(/\.[^.]+$/, "");
}
function csvCell(value) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}
function exportPhaseOnlineFile(file) {
  if (!file?.online) return;
  const baseName = phaseFileBaseName(file);
  if (file.type === "XLSX") {
    const columns = Array.from({ length: Math.max(1, Number(file.sheetColumns || 10)) }, (_, index) => String.fromCharCode(65 + index));
    const rows = Array.from({ length: Math.max(1, Number(file.sheetRows || 20)) }, (_, rowIndex) => columns.map(column => csvCell(file.cells?.[`${column}${rowIndex + 1}`] || "")).join(","));
    triggerPhaseFileDownload(`\uFEFF${rows.join("\n")}`, `${baseName}.csv`, "text/csv;charset=utf-8");
  } else if (file.type === "PPTX") {
    const outline = (file.slides || []).map((slide, index) => [`第 ${index + 1} 页`, slide.title || "无标题", slide.body || ""].join("\n")).join("\n\n");
    triggerPhaseFileDownload(outline || "暂无内容", `${baseName}.txt`, "text/plain;charset=utf-8");
  } else {
    const html = `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><title>${baseName}</title></head><body>${file.content || "<p>暂无内容</p>"}</body></html>`;
    triggerPhaseFileDownload(html, `${baseName}.html`, "text/html;charset=utf-8");
  }
  Message.success(`已导出：${file.name}`);
}
function downloadPhaseFile(file) {
  if (file?.source instanceof Blob) {
    triggerPhaseFileDownload(file.source, file.name, file.source.type || "application/octet-stream");
    Message.success(`已开始下载：${file.name}`);
    return;
  }
  Message.info(`演示文件“${file.name}”暂无本地文件源`);
}
function removePhaseFile(file) {
  if (!hasPermission("文件管理")) { Message.warning("当前账号没有文件管理权限"); return; }
  Modal.confirm({
    title: "移除项目文件",
    content: `确定移除“${file.name}”吗？`,
    okText: "移除",
    cancelText: "取消",
    onOk: () => {
      phaseFiles.value = { ...phaseFiles.value, [selectedPhase.value.key]: currentPhaseFiles.value.filter(item => item.id !== file.id) };
      Message.success("项目文件已移除");
    },
  });
}
function openPhaseMemberModal() {
  if (!canManageProject.value) { Message.warning("当前账号没有期号成员管理权限"); return; }
  phaseMemberEditingId.value = null;
  phaseMemberDraft.value = { memberType: "internal", name: "李项目", baseRole: "项目成员", externalType: "客户", contact: "", inviteLink: "", permissions: ["项目资料", "任务执行"] };
  phaseMemberModalVisible.value = true;
}
function openPhaseMemberEditor(member) {
  phaseMemberEditingId.value = member.id;
  phaseMemberDraft.value = {
    memberType: member.type === "内部成员" ? "internal" : "external",
    name: member.rawName || member.name,
    baseRole: member.baseRole || member.role?.split(" · ")[0] || "项目成员",
    externalType: member.type === "内部成员" ? "客户" : (member.externalType || member.type),
    contact: member.contact || "",
    inviteLink: member.inviteLink || "",
    permissions: [...(member.permissions || ["项目资料", "任务执行"])],
  };
  phaseMemberModalVisible.value = true;
}
function createPhaseMemberInviteLink() {
  const randomBytes = crypto.getRandomValues(new Uint32Array(3));
  const token = Array.from(randomBytes, value => value.toString(36)).join("");
  return `${window.location.origin}/invite/phase/${encodeURIComponent(selectedPhase.value.key)}?token=${token}`;
}
function generatePhaseMemberInviteLink() {
  const name = phaseMemberDraft.value.name.trim();
  if (!name) { Message.warning("请先填写外部人员姓名"); return; }
  if (!phaseMemberDraft.value.contact.trim()) { Message.warning("请先填写邀请联系方式"); return; }
  if (!phaseMemberDraft.value.permissions?.length) { Message.warning("请至少选择一项期号权限"); return; }
  phaseMemberDraft.value = { ...phaseMemberDraft.value, inviteLink: createPhaseMemberInviteLink() };
  Message.success("邀请链接已生成");
}
async function copyPhaseMemberInviteLink(link = phaseMemberDraft.value.inviteLink) {
  if (!link) { Message.warning("请先生成邀请链接"); return; }
  try {
    await navigator.clipboard.writeText(link);
    Message.success("邀请链接已复制");
  } catch {
    Message.warning("当前浏览器不支持复制，请手动复制邀请链接");
  }
}
function savePhaseMember() {
  const name = phaseMemberDraft.value.name.trim();
  const isExternal = phaseMemberDraft.value.memberType === "external";
  if (!name) { Message.warning(isExternal ? "请填写外部人员姓名" : "请选择成员"); return; }
  if (isExternal && !phaseMemberDraft.value.contact.trim()) { Message.warning("请填写邀请联系方式"); return; }
  if (!phaseMemberDraft.value.permissions?.length) { Message.warning("请至少选择一项期号权限"); return; }
  if (isExternal && !phaseMemberDraft.value.inviteLink) { Message.warning("请先生成邀请链接"); return; }
  if (currentPhaseMembers.value.some(member => member.id !== phaseMemberEditingId.value && (member.rawName || member.name) === name)) { Message.warning("该成员已在期号成员中"); return; }
  const nextMember = {
    id: phaseMemberEditingId.value || `member-${Date.now()}`,
    rawName: name,
    name: isExternal ? `${name}（${phaseMemberDraft.value.externalType} · 邀请已发送）` : name,
    baseRole: phaseMemberDraft.value.baseRole || "项目成员",
    role: `${phaseMemberDraft.value.baseRole || "项目成员"} · 成员类型：${isExternal ? "外部成员" : "内部成员"}${isExternal ? `（${phaseMemberDraft.value.externalType}）· 联系：${phaseMemberDraft.value.contact.trim()} · 邀请已发送` : ""} · 权限：${phaseMemberDraft.value.permissions.join("、")}`,
    joinedAt: new Date().toISOString().slice(0, 10),
    hours: 0,
    type: isExternal ? "外部成员" : "内部成员",
    externalType: isExternal ? phaseMemberDraft.value.externalType : "",
    contact: isExternal ? phaseMemberDraft.value.contact.trim() : "",
    inviteLink: isExternal ? phaseMemberDraft.value.inviteLink : "",
    inviteStatus: isExternal ? "邀请已发送" : "已加入",
    permissions: [...phaseMemberDraft.value.permissions],
  };
  const nextMembers = phaseMemberEditingId.value
    ? currentPhaseMembers.value.map(member => member.id === phaseMemberEditingId.value ? { ...member, ...nextMember } : member)
    : [...currentPhaseMembers.value, nextMember];
  phaseMembers.value = { ...phaseMembers.value, [selectedPhase.value.key]: nextMembers };
  phaseMemberModalVisible.value = false;
  Message.success(phaseMemberEditingId.value ? "期号成员权限已更新" : (isExternal ? "邀请已发送，外部人员接受后即可加入" : "期号成员已添加"));
  phaseMemberEditingId.value = null;
}
function deletePhaseMember(member) {
  if (currentPhaseMembers.value.length <= 1) { Message.warning("至少保留一名期号成员"); return; }
  Modal.confirm({
    title: "移除期号成员",
    content: `确定将“${member.rawName || member.name}”移出当前期号吗？`,
    okText: "移除",
    cancelText: "取消",
    onOk: () => {
      phaseMembers.value = { ...phaseMembers.value, [selectedPhase.value.key]: currentPhaseMembers.value.filter(item => item.id !== member.id) };
      phaseMemberModalVisible.value = false;
      phaseMemberEditingId.value = null;
      Message.success("期号成员已移除");
    },
  });
}
function openTeamMemberModal(member = null) {
  if (!canManageTeam.value) { Message.warning("当前账号没有团队管理权限"); return; }
  teamMemberEditingId.value = member?.id || null;
  teamMemberDraft.value = member ? { name: member.name, account: member.account, phone: member.phone, role: member.role, type: member.type, status: member.status || "启用", password: "", wechatBound: Boolean(member.wechatBound), wecomBound: Boolean(member.wecomBound) } : { name: "", account: "", phone: "", role: "项目成员", type: "内部成员", status: "启用", password: "", wechatBound: false, wecomBound: false };
  teamMemberModalVisible.value = true;
}
function saveTeamMember() {
  const draftMember = teamMemberDraft.value;
  const name = draftMember.name.trim();
  const account = draftMember.account.trim();
  const phone = draftMember.phone.trim();
  const role = draftMember.role.trim();
  if (!name || !account || !role) { Message.warning("请填写姓名、账号和职务"); return false; }
  if (!teamMemberEditingId.value && draftMember.password.length < 8) { Message.warning("请设置至少 8 位登录密码"); return false; }
  if (teamMemberEditingId.value && draftMember.password && draftMember.password.length < 8) { Message.warning("登录密码至少需要 8 位"); return false; }
  if (phone && !/^1[3-9]\d{9}$/.test(phone)) { Message.warning("请输入正确的 11 位手机号"); return false; }
  if (teamDirectory.value.some(member => member.id !== teamMemberEditingId.value && (member.account === account || member.name === name))) { Message.warning("姓名或账号已存在"); return false; }
  if (teamMemberEditingId.value) {
    const previous = teamDirectory.value.find(member => member.id === teamMemberEditingId.value);
    if (previous && previous.name !== name) {
      const memberIndex = teamMembers.indexOf(previous.name);
      if (memberIndex >= 0) teamMembers.splice(memberIndex, 1, name);
    }
    teamDirectory.value = teamDirectory.value.map(member => member.id === teamMemberEditingId.value ? { ...member, name, account, phone, role, type: draftMember.type, status: draftMember.status, passwordSet: Boolean(draftMember.password) || Boolean(member.passwordSet), wechatBound: Boolean(draftMember.wechatBound), wecomBound: Boolean(draftMember.wecomBound) } : member);
    if (previous?.name === accountProfile.value.nickname) {
      accountProfile.value = { ...accountProfile.value, account, phone, position: role, nickname: name };
      profileDraft.value = { ...profileDraft.value, account, phone, position: role, nickname: name };
      loginDraft.value.account = account;
    }
    Message.success("成员账号已更新");
  } else {
    teamDirectory.value = [...teamDirectory.value, { id: `account-${Date.now()}`, name, account, phone, role, type: draftMember.type, status: draftMember.status, joinedAt: new Date().toISOString().slice(0, 10), permissions: ["工作台"], passwordSet: true, wechatBound: Boolean(draftMember.wechatBound), wecomBound: Boolean(draftMember.wecomBound) }];
    if (!teamMembers.includes(name)) teamMembers.push(name);
    Message.success("成员账号已添加");
  }
  teamMemberModalVisible.value = false;
  teamMemberEditingId.value = null;
  return true;
}
function toggleTeamMemberStatus(member) {
  if (!canManageTeam.value) { Message.warning("当前账号没有团队管理权限"); return; }
  if (member.name === accountProfile.value.nickname) { Message.warning("不能禁用当前登录账号"); return; }
  const nextStatus = member.status === "启用" ? "禁用" : "启用";
  Modal.confirm({
    title: `${nextStatus}成员账号`,
    content: `${nextStatus === "禁用" ? "禁用后该成员将无法登录系统。" : "启用后该成员可以重新登录系统。"}是否继续？`,
    okText: "确认",
    cancelText: "取消",
    onOk: () => {
      teamDirectory.value = teamDirectory.value.map(item => item.id === member.id ? { ...item, status: nextStatus } : item);
      Message.success(`成员账号已${nextStatus}`);
    },
  });
}
function deleteTeamMember(member) {
  if (!canManageTeam.value) { Message.warning("当前账号没有团队管理权限"); return; }
  if (member.name === accountProfile.value.nickname) { Message.warning("不能删除当前登录账号"); return; }
  Modal.confirm({
    title: "删除成员账号",
    content: `删除“${member.name}”后，该账号将不能继续登录，是否继续？`,
    okText: "确认删除",
    cancelText: "取消",
    onOk: () => {
      teamDirectory.value = teamDirectory.value.filter(item => item.id !== member.id);
      Message.success("成员账号已删除");
    },
  });
}
function openTeamPermissions(member) {
  if (!canManageTeam.value) { Message.warning("当前账号没有团队管理权限"); return; }
  teamPermissionsMemberId.value = member.id;
  teamPermissionsDraft.value = [...(member.permissions || [])];
  teamPermissionsModalVisible.value = true;
}
function saveTeamPermissions() {
  if (!teamPermissionsDraft.value.length) { Message.warning("请至少分配一项权限"); return false; }
  teamDirectory.value = teamDirectory.value.map(member => member.id === teamPermissionsMemberId.value ? { ...member, permissions: [...teamPermissionsDraft.value] } : member);
  teamPermissionsModalVisible.value = false;
  teamPermissionsMemberId.value = null;
  Message.success("成员权限已保存");
  return true;
}
function phaseStatusColor(status) { return statusColors[status] || "gray"; }
function phaseProgress(phase) {
  if (phase.status === "已完成") return 100;
  if (Number.isFinite(Number(phase.progress))) return Number(phase.progress);
  const phaseTasks = tasks.value.filter(task => task.phase === phase.key);
  if (!phaseTasks.length) return 0;
  return Math.round(phaseTasks.filter(task => task.status === "已完成").length / phaseTasks.length * 100);
}
function phaseTaskCount(phase) { return tasks.value.filter(task => task.phase === phase.key).length; }
function taskDueLabel(task) { return task.due < dashboardDate.value ? `${task.due} 已逾期` : `${task.due} 今天`; }
</script>

<template>
  <main v-if="!isAuthenticated" class="login-page">
    <header class="login-header"><span class="login-brand"><img v-if="systemSettingsDraft.logoUrl" :src="systemSettingsDraft.logoUrl" :alt="systemSettingsDraft.name" class="login-brand-logo" /><span v-else class="brand-wordmark">{{ systemSettingsDraft.name }}</span></span><span>软件项目交付管理平台</span></header>
    <section class="login-panel" aria-labelledby="login-title">
      <div class="login-panel-heading"><span class="login-security-icon"><IconSafe /></span><div><h1 id="login-title">登录海拔PM</h1><p>进入项目、期号与任务协作空间</p></div></div>
      <a-radio-group v-model="loginMode" class="login-role-switch" type="button" size="large" @change="loginError = ''">
        <a-radio value="internal">内部成员</a-radio>
        <a-radio value="external">外部用户</a-radio>
      </a-radio-group>
      <section v-if="loginMode === 'internal'" class="enterprise-login" aria-label="内部成员登录">
        <div class="login-method-summary"><span class="login-method-icon wecom"><IconSafe /></span><span><strong>企业微信授权登录</strong><small>使用公司企业微信身份进入系统</small></span></div>
        <p v-if="loginError" class="login-error" role="alert">{{ loginError }}</p>
        <a-button class="login-submit" type="primary" size="large" long :loading="socialLoginProvider === '企业微信'" :disabled="loginLoading || Boolean(socialLoginProvider)" @click="handleSocialLogin('企业微信')"><IconSafe />企业微信授权登录</a-button>
      </section>
      <form v-else class="login-form" @submit.prevent="handleLogin">
        <p class="login-form-intro">仅限已收到项目邀请的外包人员或客户登录</p>
        <label for="login-phone">手机号</label>
        <a-input id="login-phone" v-model="loginDraft.phone" size="large" allow-clear maxlength="11" input-mode="numeric" placeholder="请输入邀请时填写的手机号" @input="loginError = ''"><template #prefix><IconMobile /></template></a-input>
        <label for="login-code">验证码</label>
        <div class="login-code-row">
          <a-input id="login-code" v-model="loginDraft.verificationCode" size="large" allow-clear maxlength="6" input-mode="numeric" placeholder="请输入 6 位验证码" @input="loginError = ''" @keyup.enter="handleLogin"><template #prefix><IconMessage /></template></a-input>
          <a-button size="large" :loading="loginCodeSending" :disabled="loginCodeCountdown > 0" @click="sendLoginVerificationCode">{{ loginCodeCountdown > 0 ? `${loginCodeCountdown}s` : '获取验证码' }}</a-button>
        </div>
        <p v-if="loginError" class="login-error" role="alert">{{ loginError }}</p>
        <div class="login-options"><a-checkbox v-model="loginDraft.remember">保持登录</a-checkbox><span>验证码 5 分钟内有效</span></div>
        <a-button class="login-submit" type="primary" html-type="submit" size="large" long :loading="loginLoading">登录</a-button>
      </form>
      <footer><IconSafe />身份仅用于项目权限校验，不会保存验证码</footer>
    </section>
  </main>
  <div v-else class="app-shell">
    <header class="global-header">
      <a-button class="brand" type="text" :aria-label="systemSettingsDraft.name" @click="notify(systemSettingsDraft.name)"><img v-if="systemSettingsDraft.logoUrl" :src="systemSettingsDraft.logoUrl" :alt="systemSettingsDraft.name" class="brand-logo" /><span v-else class="brand-wordmark">{{ systemSettingsDraft.name }}</span></a-button>
      <a-menu class="global-nav" mode="horizontal" :selected-keys="[activeNav]" @menu-item-click="handleNavigation"><a-menu-item v-for="item in visibleNavItems" :key="item">{{ item }}</a-menu-item></a-menu>
      <div class="header-actions">
        <a-tooltip v-if="canManageSystem" content="系统设置"><a-button class="header-icon-button" type="text" aria-label="系统设置" @click="openSystemSettings"><IconSettings /></a-button></a-tooltip>
        <a-tooltip content="帮助中心"><a-button class="header-icon-button" type="text" aria-label="帮助中心" @click="helpVisible = true"><IconQuestionCircle /></a-button></a-tooltip>
        <a-dropdown trigger="click"><a-button class="header-icon-button" type="text" aria-label="通知"><IconNotification /></a-button><template #content><div class="notification-panel"><header><strong>通知</strong><a-button type="text" size="mini">全部已读</a-button></header><button><IconClockCircle /><span><strong>任务即将逾期</strong><small>支付回调幂等校验将在 3 天后到期</small></span></button><button><IconCheckCircle /><span><strong>任务等待确认</strong><small>核对审核状态流转已提交确认</small></span></button><button><IconInfoCircle /><span><strong>期号进度更新</strong><small>一期核心交付进度已更新为 68%</small></span></button></div></template></a-dropdown>
        <a-dropdown trigger="click"><button class="profile-trigger"><a-avatar :size="32" :image-url="accountProfile.avatarUrl">{{ profileInitial }}</a-avatar><span><strong>{{ accountProfile.nickname }}</strong><small>{{ accountProfile.position }}</small></span><IconDown /></button><template #content><a-menu class="account-menu"><div class="account-summary"><a-avatar :size="38" :image-url="accountProfile.avatarUrl">{{ profileInitial }}</a-avatar><div><strong>{{ accountProfile.nickname }}</strong><small>{{ accountProfile.account }}</small></div></div><a-menu-item key="profile" @click="openProfileDrawer"><IconUser />个人信息</a-menu-item><a-menu-item key="password" @click="openPasswordModal"><IconLock />修改密码</a-menu-item><a-menu-item key="logout" @click="handleLogout"><IconPoweroff />退出登录</a-menu-item></a-menu></template></a-dropdown>
      </div>
    </header>

    <main v-if="activeNav === '工作台'" class="workbench-page workbench-reference-page" :class="`role-${accountRole}`">
      <header class="workbench-heading workbench-reference-heading">
        <div><h1>工作台 <a-tag>{{ dashboardDate }}</a-tag></h1><p>{{ dashboardRoleDescription }}</p></div>
        <div class="workbench-heading-actions"><a-button v-if="isManagementRole" type="primary" @click="activeNav = '项目'"><IconApps />进入项目</a-button></div>
      </header>

      <section v-if="true" class="workbench-management-reference">
        <section class="workbench-reference-stats">
          <button v-for="item in dashboardWorkbenchStats" :key="item.label" :class="{ 'is-danger': item.tone === 'danger' }" @click="activeNav = item.destination"><span>{{ item.label }}</span><strong>{{ item.value }}<small>{{ item.unit }}</small></strong><i :style="{ width: `${item.ratio}%` }"></i></button>
        </section>
        <section v-if="false" class="workbench-reference-duo workbench-management-duo">
          <section class="workbench-reference-panel">
            <header><div><h2>{{ isProjectManagerRole ? '我的日报' : '日报发送情况' }}</h2><span>{{ isProjectManagerRole ? '提交状态与连续性' : '应发 = 当前启用成员' }}</span></div><a-button type="text" @click="activeNav = '日报'">{{ isProjectManagerRole ? '去写日报' : '查看日报' }}</a-button></header>
            <template v-if="isProjectManagerRole">
              <div class="workbench-report-summary">
                <div><span><i :class="dashboardRecordStats.submitted ? 'report-status-已发送' : 'report-status-待发送'"></i>今日日报</span><strong :class="dashboardRecordStats.submitted ? 'is-success' : 'is-danger'">{{ dashboardRecordStats.submitted ? '已提交' : '未提交' }}</strong><small>{{ dashboardRecordStats.latest || '点击去填写' }}</small></div>
                <div><span><i></i>本周提交</span><strong>{{ dashboardPersonalReportSummary.submittedDays }}<small>天</small></strong><small>近七日已发送日报</small></div>
              </div>
              <div class="workbench-report-chart" aria-label="近七日个人工时"><div v-for="day in dashboardPersonalReportSeries" :key="day.label" class="workbench-report-chart-day"><span class="workbench-report-chart-bars"><i class="is-sent" :style="{ height: `${day.hours ? Math.max(8, day.hours / dashboardPersonalReportMaxHours * 92) : 0}%` }"></i></span><b>{{ day.hours ? `${day.hours}h` : '-' }}</b><small>{{ day.label }}</small></div></div>
            </template>
            <template v-else>
              <div class="workbench-report-summary"><div v-for="row in statsReportSummary" :key="row.status"><span><i :class="`report-status-${row.status}`"></i>{{ row.status }}</span><strong>{{ row.count }}</strong><small>份日报</small></div></div>
              <div class="workbench-report-chart" aria-label="近七日日报发送趋势"><div v-for="day in dashboardReportSeries" :key="day.label" class="workbench-report-chart-day"><span class="workbench-report-chart-bars"><i class="is-pending" :style="{ height: `${day.pending ? Math.max(8, day.pending / Math.max(day.total, 1) * day.height) : 0}%` }"></i><i class="is-sent" :style="{ height: `${day.sent ? day.sent / Math.max(day.total, 1) * day.height : 0}%` }"></i></span><b>{{ day.total }}</b><small>{{ day.label }}</small></div></div>
            </template>
          </section>
          <section class="workbench-reference-panel"><header><div><h2>团队负荷</h2><span>{{ isProjectManagerRole ? '所辖期号成员 · 按未完成任务与工时' : '按未完成任务与登记工时汇总' }}</span></div><a-button type="text" @click="activeNav = '统计'">查看团队</a-button></header><div class="workbench-load-list"><div v-for="row in statsMemberRows.slice(0, 5)" :key="row.name" class="workbench-load-row"><a-avatar :size="26">{{ row.name.slice(0, 1) }}</a-avatar><strong>{{ row.name }}</strong><span class="workbench-load-track"><i :style="{ width: `${Math.min(row.tasks * 18, 100)}%` }"></i></span><small>{{ row.tasks }} 项 · {{ row.hours }}h<em v-if="row.overdue"> · {{ row.overdue }} 项逾期</em></small></div><a-empty v-if="!statsMemberRows.length" description="暂无团队负荷" /></div></section>
        </section>
        <section class="workbench-reference-panel workbench-reference-table-panel">
          <header><div><h2>任务列表</h2><span>按当前权限展示 · 按优先级排序</span></div><a-button type="text" @click="activeNav = '任务'">查看全部</a-button></header>
          <div class="workbench-reference-table workbench-management-task-table"><div class="workbench-reference-table-row is-heading"><span aria-hidden="true"></span><span>优先级</span><span>任务名称</span><span>所属期号</span><span>负责人</span><span>状态</span><span>截止时间</span></div><div v-for="task in dashboardTasks" :key="task.id" class="workbench-reference-table-row" :class="{ 'is-overdue': task.due < dashboardDate }" role="button" tabindex="0" @click="openTaskFromRow(task)" @keydown="handleTaskRowKeydown($event, task)"><span class="workbench-task-table-check"><a-checkbox :model-value="task.status === '已完成'" :indeterminate="task.status === '待确认'" :disabled="!taskChecklistAction(task)" :aria-label="`${task.title}：${taskChecklistLabel(task)}`" @click.stop @change="handleTaskChecklistChange(task)" /></span><span><a-tag :color="priorityColors[task.priority]">{{ task.priority }}</a-tag></span><span><strong>{{ task.title }}</strong><small>{{ task.id }} · {{ task.module }}</small></span><span>{{ phaseByKey(task.phase)?.code || '期号未配置' }}<small>{{ phaseByKey(task.phase)?.name || '待补充' }}</small></span><span>{{ task.owner }}</span><span><a-tag :color="phaseStatusColor(task.status)">{{ task.status }}</a-tag></span><span :class="{ 'is-danger': task.due < dashboardDate }">{{ taskDueLabel(task) }}</span></div><a-empty v-if="!dashboardTasks.length" description="暂无相关任务" /></div>
        </section>
        <section class="workbench-reference-panel workbench-reference-table-panel"><header><div><h2>期号列表</h2><span>按当前权限展示可见期号</span></div><a-button type="text" @click="activeNav = '项目'">查看项目 <IconArrowRise /></a-button></header><div class="workbench-reference-table workbench-phase-reference-table"><div class="workbench-reference-table-row is-heading"><span>期号</span><span>项目</span><span>进度</span><span>截止完成时间</span><span>任务数</span><span>负责人</span><span>状态</span></div><button v-for="phase in dashboardPhaseRows" :key="phase.key" class="workbench-reference-table-row" :class="{ 'is-overdue': phase.status === '延期' }" @click="selectedPhaseKey = phase.key; activeNav = '项目'"><span><strong>{{ phase.code }}</strong><small>{{ phase.name }}</small></span><span>{{ phase.projectName }}</span><span class="workbench-progress-cell"><i><em :style="{ width: `${phaseProgress(phase)}%` }"></em></i><b>{{ phaseProgress(phase) }}%</b></span><span>{{ phase.dates ? phase.dates.split(/\s*至\s*/).pop() : '未设置' }}</span><span>{{ phaseTaskCount(phase) }} 项</span><span>{{ phase.owner }}</span><span><a-tag :color="phaseStatusColor(phase.status)">{{ phase.status }}</a-tag></span></button><a-empty v-if="!dashboardPhaseRows.length" description="暂无可见期号" /></div></section>
      </section>

      <template v-else-if="isProjectManagerRole">
        <section class="workbench-reference-panel workbench-pending-reference"><header><div><h2>待我处理</h2><span>成员提交的完成申请，确认后任务关闭</span></div><a-button type="text" @click="activeNav = '任务'">全部 {{ dashboardPendingTasks.length }} 条 <IconArrowRise /></a-button></header><div v-for="task in dashboardPendingTasks" :key="task.id" class="workbench-pending-reference-row" role="button" tabindex="0" @click="openTaskFromRow(task)"><span class="workbench-reference-person"><a-avatar :size="28">{{ (task.createdBy || task.owner).slice(0, 1) }}</a-avatar>{{ task.createdBy || task.owner }}</span><span class="workbench-pending-reference-task"><strong>{{ task.title }}</strong><small>{{ phaseByKey(task.phase)?.code || '期号未配置' }} · {{ task.due }} 提交</small></span><span><a-button type="primary" size="small" @click.stop="requestTaskStatusChange(task.id, '已完成')">确认完成</a-button><a-button size="small" @click.stop="requestTaskStatusChange(task.id, '未完成')">退回</a-button></span></div><a-empty v-if="!dashboardPendingTasks.length" description="暂无待确认事项" /></section>
        <section class="workbench-records workbench-reference-records"><button @click="activeNav = '日报'"><span>今日日报 <i :class="dashboardRecordStats.submitted ? 'ok' : 'alert'"></i></span><strong :class="dashboardRecordStats.submitted ? 'success' : 'danger'">{{ dashboardRecordStats.submitted ? '已提交' : '未提交' }}</strong><small>{{ dashboardRecordStats.latest || '点击去填写' }}</small></button><button @click="activeNav = '工时'"><span>本周工时</span><strong>{{ dashboardRecordStats.hours }}<small>h / 应满 40h</small></strong><small>累计日报工时</small></button><button @click="activeNav = '任务'"><span>待我确认 <i :class="dashboardPendingTasks.length ? 'alert' : 'ok'"></i></span><strong :class="dashboardPendingTasks.length ? 'danger' : 'success'">{{ dashboardPendingTasks.length }}</strong><small>条完成申请</small></button></section>
        <section class="workbench-reference-duo"><section class="workbench-reference-panel"><header><div><h2>我的今日待办</h2><span>今日到期 + 已逾期</span></div><a-button type="text" @click="activeNav = '任务'">查看全部 <IconArrowRise /></a-button></header><div v-for="task in dashboardTodayTodos.slice(0, 6)" :key="task.id" class="workbench-todo-reference-row" :class="{ 'is-overdue': task.due < dashboardDate }" role="button" tabindex="0" @click="openTaskFromRow(task)"><a-checkbox :model-value="task.status === '已完成'" :indeterminate="task.status === '待确认'" :disabled="!taskChecklistAction(task)" :aria-label="`${task.title}：${taskChecklistLabel(task)}`" @click.stop @change="handleTaskChecklistChange(task)" /><span><strong>{{ task.title }}</strong><small>{{ phaseByKey(task.phase)?.code || '期号未配置' }} · {{ phaseByKey(task.phase)?.name || '' }} · {{ task.due < dashboardDate ? '已逾期' : '今天截止' }}</small></span><a-tag :color="priorityColors[task.priority]">{{ task.priority }}</a-tag></div><a-empty v-if="!dashboardTodayTodos.length" description="今日暂无待办" /></section><section class="workbench-reference-panel"><header><div><h2>我参与的期号</h2><span>所辖期号显示全员任务与风险</span></div><a-button type="text" @click="activeNav = '项目'">查看项目 <IconArrowRise /></a-button></header><div class="workbench-phase-reference-list"><button v-for="phase in dashboardPhaseRows" :key="phase.key" :class="{ 'is-overdue': phase.status === '延期' }" @click="selectedPhaseKey = phase.key; activeNav = '项目'"><span><strong>{{ phase.code }}</strong><small>{{ phase.name }}</small></span><span class="workbench-progress-cell"><i><em :style="{ width: `${phaseProgress(phase)}%` }"></em></i><b>{{ phaseProgress(phase) }}%</b></span><span>{{ phaseTaskCount(phase) }} 项</span><a-tag :color="phaseStatusColor(phase.status)">{{ phase.status }}</a-tag></button><a-empty v-if="!dashboardPhaseRows.length" description="暂无可见期号" /></div></section></section>
        <section class="workbench-reference-panel workbench-reference-table-panel"><header><div><h2>我的任务列表</h2><span>与我相关的全部任务 · 可直接处理状态</span></div><a-button type="text" @click="activeNav = '任务'">查看全部 <IconArrowRise /></a-button></header><div class="workbench-reference-table"><div class="workbench-reference-table-row is-heading"><span>优先级</span><span>任务名称</span><span>所属期号</span><span>状态</span><span>截止时间</span><span>操作</span></div><div v-for="task in dashboardTasks" :key="task.id" class="workbench-reference-table-row" :class="{ 'is-overdue': task.due < dashboardDate }" role="button" tabindex="0" @click="openTaskFromRow(task)" @keydown="handleTaskRowKeydown($event, task)"><span><a-tag :color="priorityColors[task.priority]">{{ task.priority }}</a-tag></span><span><strong>{{ task.title }}</strong><small>{{ task.id }} · {{ task.module }}</small></span><span>{{ phaseByKey(task.phase)?.code || '期号未配置' }}<small>{{ phaseByKey(task.phase)?.name || '' }}</small></span><span><a-tag :color="phaseStatusColor(task.status)">{{ task.status }}</a-tag></span><span :class="{ 'is-danger': task.due < dashboardDate }">{{ taskDueLabel(task) }}</span><span><a-button v-if="task.status !== '已完成'" type="primary" size="small" @click.stop="requestTaskStatusChange(task.id, task.status === '待确认' ? '已完成' : '待确认')">{{ task.status === '待确认' ? '确认完成' : '提交确认' }}</a-button><span v-else class="workbench-muted">已完成</span></span></div><a-empty v-if="!dashboardTasks.length" description="暂无相关任务" /></div></section>
      </template>

      <template v-else-if="isExternalRole">
        <section class="workbench-deadline-reference"><IconClockCircle /><span>未来 <b>7 天</b>内有 <b>{{ dashboardTodayTodos.length }}</b> 个任务需要关注，按截止时间优先处理。</span><a-button type="text" @click="activeNav = '任务'">查看任务 <IconArrowRise /></a-button></section>
        <section class="workbench-records workbench-reference-records workbench-records-compact"><button @click="activeNav = '日报'"><span>今日日报 <i :class="dashboardRecordStats.submitted ? 'ok' : 'alert'"></i></span><strong :class="dashboardRecordStats.submitted ? 'success' : 'danger'">{{ dashboardRecordStats.submitted ? '已提交' : '未提交' }}</strong><small>{{ dashboardRecordStats.latest || '点击去填写' }}</small></button><button @click="activeNav = '工时'"><span>本周工时 <small>（结算依据）</small></span><strong>{{ dashboardRecordStats.hours }}<small>h · 已确认工时记录</small></strong><small>累计日报工时</small></button></section>
        <section class="workbench-reference-panel workbench-reference-table-panel"><header><div><h2>我的任务</h2><span>按截止时间排序 · 仅显示分配给自己的任务</span></div><a-button type="text" @click="activeNav = '任务'">查看全部 <IconArrowRise /></a-button></header><div class="workbench-reference-table workbench-external-table"><div class="workbench-reference-table-row is-heading"><span>任务名称</span><span>所属项目期号</span><span>截止时间</span><span>状态</span><span>操作</span></div><div v-for="task in dashboardTasks" :key="task.id" class="workbench-reference-table-row" :class="{ 'is-overdue': task.due < dashboardDate }" role="button" tabindex="0" @click="openTaskFromRow(task)" @keydown="handleTaskRowKeydown($event, task)"><span><strong>{{ task.title }}</strong><small>{{ task.id }} · {{ task.module }}</small></span><span>{{ phaseByKey(task.phase)?.code || '期号未配置' }}<small>{{ phaseByKey(task.phase)?.name || '' }}</small></span><span :class="{ 'is-danger': task.due < dashboardDate }">{{ taskDueLabel(task) }}</span><span><a-tag :color="phaseStatusColor(task.status)">{{ task.status }}</a-tag></span><span><a-button v-if="task.status !== '已完成'" type="primary" size="small" @click.stop="requestTaskStatusChange(task.id, task.status === '待确认' ? '未完成' : '待确认')">{{ task.status === '待确认' ? '撤回修改' : '提交确认' }}</a-button><span v-else class="workbench-muted">已完成</span></span></div><a-empty v-if="!dashboardTasks.length" description="暂无相关任务" /></div></section>
      </template>

      <template v-else>
        <section class="workbench-records workbench-reference-records workbench-records-compact"><button @click="activeNav = '日报'"><span>今日日报 <i :class="dashboardRecordStats.submitted ? 'ok' : 'alert'"></i></span><strong :class="dashboardRecordStats.submitted ? 'success' : 'danger'">{{ dashboardRecordStats.submitted ? '已提交' : '未提交' }}</strong><small>{{ dashboardRecordStats.latest || '点击去填写' }}</small></button><button @click="activeNav = '工时'"><span>本周工时</span><strong>{{ dashboardRecordStats.hours }}<small>h / 应满 40h</small></strong><small>累计日报工时</small></button></section>
        <section class="workbench-reference-duo"><section class="workbench-reference-panel"><header><div><h2>我的今日待办</h2><span>今日到期 + 已逾期</span></div><a-button type="text" @click="activeNav = '任务'">查看全部 <IconArrowRise /></a-button></header><div v-for="task in dashboardTodayTodos.slice(0, 6)" :key="task.id" class="workbench-todo-reference-row" :class="{ 'is-overdue': task.due < dashboardDate }" role="button" tabindex="0" @click="openTaskFromRow(task)"><a-checkbox :model-value="task.status === '已完成'" :indeterminate="task.status === '待确认'" :disabled="!taskChecklistAction(task)" :aria-label="`${task.title}：${taskChecklistLabel(task)}`" @click.stop @change="handleTaskChecklistChange(task)" /><span><strong>{{ task.title }}</strong><small>{{ phaseByKey(task.phase)?.code || '期号未配置' }} · {{ phaseByKey(task.phase)?.name || '' }} · {{ task.due < dashboardDate ? '已逾期' : '今天截止' }}</small></span><a-tag :color="priorityColors[task.priority]">{{ task.priority }}</a-tag></div><a-empty v-if="!dashboardTodayTodos.length" description="今日暂无待办" /></section><section class="workbench-reference-panel"><header><div><h2>我参与的期号</h2><span>仅显示与我相关的期号</span></div><a-button type="text" @click="activeNav = '项目'">查看项目 <IconArrowRise /></a-button></header><div class="workbench-phase-reference-list"><button v-for="phase in dashboardPhaseRows" :key="phase.key" :class="{ 'is-overdue': phase.status === '延期' }" @click="selectedPhaseKey = phase.key; activeNav = '项目'"><span><strong>{{ phase.code }}</strong><small>{{ phase.name }}</small></span><span class="workbench-progress-cell"><i><em :style="{ width: `${phaseProgress(phase)}%` }"></em></i><b>{{ phaseProgress(phase) }}%</b></span><span>{{ phaseTaskCount(phase) }} 项</span><a-tag :color="phaseStatusColor(phase.status)">{{ phase.status }}</a-tag></button><a-empty v-if="!dashboardPhaseRows.length" description="暂无可见期号" /></div></section></section>
        <section class="workbench-reference-panel workbench-reference-table-panel"><header><div><h2>我的任务列表</h2><span>与我相关的全部任务 · 可直接处理状态</span></div><a-button type="text" @click="activeNav = '任务'">查看全部 <IconArrowRise /></a-button></header><div class="workbench-reference-table"><div class="workbench-reference-table-row is-heading"><span>优先级</span><span>任务名称</span><span>所属期号</span><span>状态</span><span>截止时间</span><span>操作</span></div><div v-for="task in dashboardTasks" :key="task.id" class="workbench-reference-table-row" :class="{ 'is-overdue': task.due < dashboardDate }" role="button" tabindex="0" @click="openTaskFromRow(task)" @keydown="handleTaskRowKeydown($event, task)"><span><a-tag :color="priorityColors[task.priority]">{{ task.priority }}</a-tag></span><span><strong>{{ task.title }}</strong><small>{{ task.id }} · {{ task.module }}</small></span><span>{{ phaseByKey(task.phase)?.code || '期号未配置' }}<small>{{ phaseByKey(task.phase)?.name || '' }}</small></span><span><a-tag :color="phaseStatusColor(task.status)">{{ task.status }}</a-tag></span><span :class="{ 'is-danger': task.due < dashboardDate }">{{ taskDueLabel(task) }}</span><span><a-button v-if="task.status !== '已完成'" type="primary" size="small" @click.stop="requestTaskStatusChange(task.id, task.status === '待确认' ? '已完成' : '待确认')">{{ task.status === '待确认' ? '确认完成' : '提交确认' }}</a-button><span v-else class="workbench-muted">已完成</span></span></div><a-empty v-if="!dashboardTasks.length" description="暂无相关任务" /></div></section>
      </template>
    </main>
    <main v-else-if="activeNav === '任务'" class="task-page">
      <header class="task-page-heading"><div><h1>任务</h1><p>{{ isManagementRole ? '查看全部任务并按条件快速定位。' : '只显示与你发起、执行或确认相关的任务。' }}</p></div></header>
      <section class="task-page-filters">
        <a-radio-group v-model="taskPageType" type="button"><a-radio value="全部">全部</a-radio><a-radio value="我发起的">我发起的</a-radio><a-radio value="我执行的">我执行的</a-radio><a-radio value="我确认的">我确认的</a-radio></a-radio-group>
        <a-input v-model="taskPageKeyword" class="task-page-search" allow-clear placeholder="搜索期号或任务名称"><template #prefix><IconSearch /></template></a-input>
        <a-select v-model="taskPageStatus" class="task-page-status-filter" aria-label="按任务状态筛选"><a-option value="全部状态">全部状态</a-option><a-option value="未完成">未完成</a-option><a-option value="待确认">待确认</a-option><a-option value="已完成">已完成</a-option></a-select>
        <a-date-picker v-model="taskPageDueDate" value-format="YYYY-MM-DD" format="YYYY-MM-DD" placeholder="截止时间" allow-clear />
      </section>
        <section class="task-page-panel"><header><div><h2>任务列表</h2><span>共 {{ taskPageRows.length }} 项 · 可按权限提交结果或确认完成</span></div><a-button v-if="canManageTasks" class="task-page-create" type="primary" @click="openTaskModal"><IconPlus />新建任务</a-button></header><div class="task-page-table"><div class="task-page-row task-page-row-heading"><span aria-label="任务处理选择"></span><span>任务名称</span><span>项目期号</span><span>执行人</span><span>确认人</span><span>优先级</span><span>状态</span><span>截止时间</span><span>操作</span></div><div v-for="task in pagedTaskPageRows" :key="task.id" class="task-page-row" role="button" tabindex="0" :aria-label="`${task.title}，${taskChecklistHint(task)}`" @click="openTaskFromRow(task)" @keydown="handleTaskRowKeydown($event, task)"><span class="task-page-check"><a-tooltip :content="taskChecklistLabel(task)"><a-checkbox :model-value="task.status === '已完成'" :indeterminate="task.status === '待确认'" :disabled="!taskChecklistAction(task)" :aria-label="`${task.title}：${taskChecklistLabel(task)}`" @click.stop @change="handleTaskChecklistChange(task)" /></a-tooltip></span><span data-label="任务名称"><strong>{{ task.title }}</strong><small>{{ task.id }} · {{ task.module }}</small></span><span v-if="phaseByKey(task.phase)" data-label="项目期号"><strong>{{ phaseByKey(task.phase)?.code }}</strong><small>{{ phaseByKey(task.phase)?.name }}</small></span><span v-else data-label="项目期号"><strong>期号未配置</strong><small>请编辑任务补充项目期号</small></span><span data-label="执行人">{{ (task.executors || [task.owner]).join('、') }}</span><span data-label="确认人">{{ task.confirmer || task.owner }}</span><span data-label="优先级"><a-tag :color="priorityColors[task.priority]">{{ task.priority }}</a-tag></span><span data-label="状态"><a-tag :color="phaseStatusColor(task.status)">{{ task.status }}</a-tag><small class="task-status-hint">{{ taskChecklistHint(task) }}</small></span><span data-label="截止时间">{{ task.due }}</span><span class="task-page-actions" data-label="操作"><a-tooltip :content="canEditTask(task) ? '编辑任务' : '无编辑权限'"><a-button type="text" size="small" :disabled="!canEditTask(task)" :aria-label="`编辑任务：${task.title}`" @click.stop="editTaskFromList(task)" @keydown.stop><IconEdit /></a-button></a-tooltip><a-tooltip :content="canDeleteTask(task) ? '删除任务' : '无删除权限'"><a-button type="text" status="danger" size="small" :disabled="!canDeleteTask(task)" :aria-label="`删除任务：${task.title}`" @click.stop="deleteTaskFromList(task)" @keydown.stop><IconDelete /></a-button></a-tooltip></span></div><a-empty v-if="!taskPageRows.length" description="暂无符合条件的任务" /></div><PhaseListPagination v-model:page="taskListPage" v-model:page-size="taskListPageSize" :total="taskPageRows.length" /></section>
    </main>
    <main v-else-if="activeNav === '日报'" class="daily-page">
      <header class="daily-page-heading">
        <div><h1>日报</h1><p>{{ dailyReportTab === 'mine' ? '查看和回顾自己提交的日报。' : dailyReportTab === 'team' ? '查看当前权限范围内的团队日报。' : '按项目期号查看每天的任务与工时明细。' }}</p></div>
      </header>
      <section class="daily-tabs" role="tablist"><div class="daily-tab-buttons"><button :class="{ active: dailyReportTab === 'mine' }" role="tab" :aria-selected="dailyReportTab === 'mine'" @click="dailyReportTab = 'mine'">我的日报 <b>{{ dailyReports.filter(report => report.sender === accountProfile.nickname).length }}</b></button><button :class="{ active: dailyReportTab === 'team' }" role="tab" :aria-selected="dailyReportTab === 'team'" @click="dailyReportTab = 'team'">团队日报 <b>{{ visibleDailyReports.length }}</b></button><button :class="{ active: dailyReportTab === 'detail' }" role="tab" :aria-selected="dailyReportTab === 'detail'" @click="dailyReportTab = 'detail'">日报明细 <b>{{ dailyDetailBaseRows.length }}</b></button></div>
        <a-input v-if="dailyReportTab !== 'detail'" v-model="dailyReportKeyword" class="daily-report-search" allow-clear placeholder="搜索日报名称"><template #prefix><IconSearch /></template></a-input>
        <a-select v-if="dailyReportTab === 'team'" v-model="dailyReportStatus" class="daily-status-filter"><a-option value="全部状态">全部状态</a-option><a-option v-for="status in ['已发送', '待发送']" :key="status" :value="status">{{ status }}</a-option></a-select>
        <a-select v-if="dailyReportTab === 'team'" v-model="dailyReportUser" allow-search class="daily-user-filter"><a-option value="全部成员">全部成员</a-option><a-option v-for="member in teamMembers" :key="member" :value="member">{{ member }}</a-option></a-select>
        <a-range-picker v-if="dailyReportTab === 'team'" v-model="dailyReportDateRange" value-format="YYYY-MM-DD" format="YYYY-MM-DD" :placeholder="['发送开始日期', '发送结束日期']" allow-clear />
        <div v-if="dailyReportTab === 'detail'" class="daily-detail-filter-group">
          <a-select v-model="dailyDetailProject" class="daily-detail-project-filter" allow-search aria-label="按项目筛选"><a-option value="全部项目">全部项目</a-option><a-option v-for="project in dailyDetailProjectOptions" :key="project.value" :value="project.value">{{ project.label }}</a-option></a-select>
          <a-select v-model="dailyDetailPhase" class="daily-detail-phase-filter" allow-search aria-label="按期号筛选"><a-option value="全部期号">全部期号</a-option><a-option v-for="phase in dailyDetailPhaseOptions" :key="phase.value" :value="phase.value">{{ phase.label }}</a-option></a-select>
          <a-select v-model="dailyDetailSender" class="daily-detail-sender-filter" allow-search aria-label="按发送人筛选"><a-option value="全部发送人">全部发送人</a-option><a-option v-for="sender in dailyDetailSenderOptions" :key="sender" :value="sender">{{ sender }}</a-option></a-select>
        </div>
        <a-button v-if="dailyReportTab === 'team' && (dailyReportStatus !== '全部状态' || dailyReportDateRange.length || dailyReportUser !== '全部成员' || dailyReportKeyword)" type="text" @click="dailyReportStatus = '全部状态'; dailyReportDateRange = []; dailyReportUser = '全部成员'; dailyReportKeyword = ''">重置筛选</a-button>
      </section>
      <section v-if="dailyReportTab !== 'detail'" class="daily-page-panel"><header><div><h2>{{ dailyReportTab === 'mine' ? '我的日报' : '团队日报' }}</h2><span>共 {{ dailyReportRows.length }} 份 · 可查看、编辑或删除日报</span></div><a-button v-if="canManageReports" class="daily-page-create" type="primary" @click="openDailyReportModal()"><IconPlus />发送日报</a-button></header><div class="daily-report-table"><div class="daily-report-row daily-report-row-heading"><span>日报名称</span><span>日报工时</span><span>发送人</span><span>发送时间</span><span>状态</span><span>操作</span></div><div v-for="report in pagedDailyReports" :key="report.id" class="daily-report-row" role="button" tabindex="0" @click="openDailyReport(report)" @keydown.enter="openDailyReport(report)" @keydown.space.prevent="openDailyReport(report)"><span data-label="日报名称"><strong>{{ dailyReportDisplayName(report) }}</strong></span><span data-label="日报工时"><strong>{{ report.hours }}h</strong></span><span data-label="发送人">{{ report.sender }}</span><span data-label="发送时间">{{ report.sentAt }}</span><span data-label="状态"><a-tag :color="dailyReportStatusColors[report.status]">{{ report.status }}</a-tag></span><span class="daily-report-actions" data-label="操作"><a-tooltip content="查看日报"><a-button type="text" size="small" aria-label="查看日报" @click.stop="openDailyReport(report)"><IconEye /></a-button></a-tooltip><template v-if="canManageReports && (isManagementRole || report.sender === accountProfile.nickname)"><a-tooltip content="编辑日报"><a-button type="text" size="small" aria-label="编辑日报" @click.stop="openDailyReportModal(report)"><IconEdit /></a-button></a-tooltip><a-tooltip content="删除日报"><a-button type="text" size="small" status="danger" aria-label="删除日报" @click.stop="deleteDailyReport(report)"><IconDelete /></a-button></a-tooltip></template></span></div><a-empty v-if="!dailyReportRows.length" description="暂无符合条件的日报" /></div><PhaseListPagination v-model:page="dailyReportPage" v-model:page-size="dailyReportPageSize" :total="dailyReportRows.length" /></section>
      <section v-else class="daily-page-panel daily-detail-panel"><header><div><h2>日报明细</h2><span>共 {{ dailyDetailRows.length }} 条任务 · 合计 {{ dailyDetailTotalHours }}h</span></div></header><div class="daily-detail-table"><div class="daily-detail-row daily-detail-row-heading"><span>日期</span><span>项目 / 期号</span><span>任务内容</span><span>工时</span><span>发送人</span><span>发送时间</span></div><div v-for="row in pagedDailyDetailRows" :key="row.id" class="daily-detail-row" role="button" tabindex="0" :aria-label="`${row.date} ${row.phaseLabel} ${row.entry.title}`" @click="openDailyReport(row.report)" @keydown.enter="openDailyReport(row.report)" @keydown.space.prevent="openDailyReport(row.report)"><span data-label="日期"><strong>{{ row.date }}</strong></span><span class="daily-detail-project" data-label="项目 / 期号"><strong>{{ row.projectLabel }}</strong><small>{{ row.phaseLabel }}</small></span><span class="daily-detail-task" data-label="任务内容"><strong>{{ row.entry.title }}</strong><small>{{ row.entry.category }}<template v-if="row.entry.summary"> · 备注：{{ row.entry.summary }}</template></small></span><span data-label="工时"><strong>{{ row.hours }}h</strong></span><span class="daily-detail-sender" data-label="发送人"><a-avatar :size="26">{{ row.sender.slice(0, 1) }}</a-avatar>{{ row.sender }}</span><span data-label="发送时间">{{ row.sentAt }}</span></div><a-empty v-if="!dailyDetailRows.length" description="暂无符合条件的日报明细" /></div><PhaseListPagination v-model:page="dailyDetailPage" v-model:page-size="dailyDetailPageSize" :total="dailyDetailRows.length" /></section>
    </main>
    <main v-else-if="activeNav === '工时'" class="work-hours-page">
      <header class="work-hours-heading"><div><h1>工时</h1><p>{{ isManagementRole ? '汇总当前权限范围内的项目期号工时。' : '查看与你相关的项目期号工时记录。' }}</p></div><a-button type="primary" :disabled="!workHoursFilteredLogs.length" @click="exportWorkHours"><IconExport />导出工时</a-button></header>
      <section class="work-hours-stat-grid"><article><span>项目期号数量</span><strong>{{ workHoursStats.phases }}</strong><small>当前筛选范围</small></article><article><span>工时</span><strong>{{ workHoursStats.totalHours }}h</strong><small>筛选后的明细</small></article><article><span>参与成员</span><strong>{{ workHoursStats.members }}</strong><small>有工时记录的成员</small></article><article><span>人均工时</span><strong>{{ workHoursStats.average }}h</strong><small>按参与成员计算</small></article></section>
      <section class="work-hours-filters"><a-input v-model="workHoursKeyword" class="work-hours-search" allow-clear placeholder="搜索期号名称"><template #prefix><IconSearch /></template></a-input><a-range-picker v-model="workHoursDateRange" value-format="YYYY-MM-DD" format="YYYY-MM-DD" :placeholder="['开始日期', '结束日期']" allow-clear /><a-select v-model="workHoursProject" class="work-hours-project-filter" allow-search aria-label="按项目筛选工时"><a-option value="全部项目">全部项目</a-option><a-option v-for="project in statsProjectOptions" :key="project.value" :value="project.value">{{ project.label }}</a-option></a-select><a-select v-model="workHoursMember" class="work-hours-member-filter" allow-search aria-label="按成员筛选工时"><a-option value="全部成员">全部成员</a-option><a-option v-for="member in workHoursMembers" :key="member" :value="member">{{ member }}</a-option></a-select></section>
      <section class="work-hours-panel"><header><h2>期号工时汇总 <span class="work-hours-panel-hint">共 {{ workHoursFilteredLogs.length }} 条日报任务 · 按期号汇总显示</span></h2></header><div class="work-hours-table"><div class="work-hours-row work-hours-row-heading"><span>项目名称</span><span>期号 / 期号名称</span><span>总工时</span><span>成员工时</span><span>最近更新</span></div><button v-for="phase in pagedWorkHoursPhaseRows" :key="phase.key" class="work-hours-row" @click="openWorkHoursPhaseReports(phase)"><span><strong>{{ phase.projectName }}</strong></span><span class="work-hours-phase-code"><strong>{{ phase.code }}<em>{{ phase.status }}</em></strong><small>{{ phase.name }}</small></span><span><strong>{{ phase.hours }}h</strong><small>{{ phase.logCount }} 条记录</small></span><span class="work-hours-member-breakdown"><template v-if="phase.memberHours.length"><small v-for="member in phase.memberHours" :key="member.name">{{ member.name }} {{ member.hours }}h</small></template><small v-else>暂无记录</small></span><span>{{ phase.latest || '暂无记录' }}</span></button><a-empty v-if="!workHoursPhaseRows.length" description="暂无符合条件的期号" /></div><PhaseListPagination v-model:page="workHoursPhasePage" v-model:page-size="workHoursPhasePageSize" :total="workHoursPhaseRows.length" /></section>
      <section class="work-hours-panel work-hours-detail-panel"><header><h2>工时明细 <span class="work-hours-panel-hint">来源于日报任务，点击记录查看完整日报</span></h2></header><div class="work-hours-detail-table"><div class="work-hours-detail-row work-hours-detail-row-heading"><span>日期</span><span>期号</span><span>成员</span><span>工时</span><span>工作内容</span></div><button v-for="log in pagedWorkHoursDetailRows" :key="log.id" class="work-hours-detail-row" @click="openWorkHoursDailyReport(log.report)"><span>{{ log.date }}</span><span><strong>{{ log.phase?.code }}</strong><small>{{ log.phase?.name }}</small></span><span>{{ log.member }}</span><strong>{{ log.hours }}h</strong><span>{{ log.content }}</span></button><a-empty v-if="!workHoursFilteredLogs.length" description="暂无符合条件的工时记录" /></div><PhaseListPagination v-model:page="workHoursDetailPage" v-model:page-size="workHoursDetailPageSize" :total="workHoursFilteredLogs.length" /></section>
    </main>
    <main v-else-if="activeNav === '团队'" class="team-page">
      <header class="team-page-heading">
        <div>
          <h1>团队</h1>
          <p>管理内部成员和外部协作成员账号、登录状态与系统权限。</p>
        </div>
      </header>
      <section class="team-page-toolbar" aria-label="成员筛选">
        <a-radio-group v-model="teamTypeFilter" type="button">
          <a-radio value="全部类型">全部成员 <b>{{ teamDirectory.length }}</b></a-radio>
          <a-radio value="内部成员">内部成员 <b>{{ teamDirectory.filter(member => member.type === '内部成员').length }}</b></a-radio>
          <a-radio value="外部协作成员">外部协作成员 <b>{{ teamDirectory.filter(member => ['外部协作成员', '外包成员', '项目客户'].includes(member.type)).length }}</b></a-radio>
        </a-radio-group>
        <a-input v-model="teamKeyword" class="team-page-search" allow-clear placeholder="搜索姓名、账号或职务"><template #prefix><IconSearch /></template></a-input>
      </section>
      <section class="team-page-panel">
        <header><div><h2>成员列表</h2><span>共 {{ filteredTeamMembers.length }} 人 · 可编辑账号和系统权限</span></div><a-button class="team-page-create" type="primary" @click="openTeamMemberModal()"><IconPlus />添加成员</a-button></header>
        <div class="team-member-table">
          <div class="team-member-row team-member-row-heading"><span>成员</span><span>成员类型</span><span>职务</span><span>联系方式</span><span>权限</span><span>状态</span><span>操作</span></div>
          <div v-for="member in pagedTeamMembers" :key="member.id" class="team-member-row">
            <span class="team-member-identity"><a-avatar :size="34">{{ member.name.slice(0, 1) }}</a-avatar><span><strong>{{ member.name }}</strong><small>{{ member.account }}</small></span></span>
            <span><a-tag :color="['外部协作成员', '外包成员', '项目客户'].includes(member.type) ? 'orange' : 'arcoblue'">{{ ['外部协作成员', '外包成员', '项目客户'].includes(member.type) ? '外部协作成员' : member.type }}</a-tag></span>
            <span>{{ member.role }}</span>
            <span><strong>{{ member.phone || '未填写' }}</strong><small>加入于 {{ member.joinedAt }}</small></span>
            <span class="team-member-permissions"><a-tag v-for="permission in member.permissions.slice(0, 3)" :key="permission" color="gray">{{ permission }}</a-tag><small v-if="member.permissions.length > 3">+{{ member.permissions.length - 3 }}</small></span>
            <span class="team-member-status"><a-tooltip :content="member.status === '启用' ? '点击禁用账号' : '点击启用账号'"><a-switch :model-value="member.status === '启用'" :disabled="member.name === accountProfile.nickname" :aria-label="member.status === '启用' ? '禁用账号' : '启用账号'" @change="toggleTeamMemberStatus(member)" /></a-tooltip></span>
            <span class="team-member-actions"><a-tooltip content="权限设置"><a-button type="text" size="small" aria-label="权限设置" @click="openTeamPermissions(member)"><IconSafe /></a-button></a-tooltip><a-tooltip content="编辑成员"><a-button type="text" size="small" aria-label="编辑成员" @click="openTeamMemberModal(member)"><IconEdit /></a-button></a-tooltip><a-tooltip content="删除成员"><a-button type="text" size="small" status="danger" aria-label="删除成员" @click="deleteTeamMember(member)"><IconDelete /></a-button></a-tooltip></span>
          </div>
          <a-empty v-if="!filteredTeamMembers.length" description="暂无匹配的成员" />
        </div>
        <PhaseListPagination v-model:page="teamPage" v-model:page-size="teamPageSize" :total="filteredTeamMembers.length" />
      </section>
    </main>
    <main v-else-if="activeNav === '统计'" class="statistics-page">
      <header class="statistics-heading">
        <div><h1>统计</h1><p>从期号、任务、工时和日报四个维度查看交付状态与管理风险。</p></div>
      </header>
      <section class="statistics-filters">
        <a-select v-model="statsProjectFilter" class="statistics-project-filter" allow-search><a-option value="全部项目">全部项目</a-option><a-option v-for="project in statsProjectOptions" :key="project.value" :value="project.value">{{ project.label }}</a-option></a-select>
        <span class="statistics-scope-note"><IconSafe />{{ isManagementRole ? '已纳入当前系统全部可见数据' : '仅统计与你相关的项目期号' }}</span>
      </section>
      <section class="statistics-kpi-grid">
        <article class="statistics-kpi-card"><span>项目期号</span><strong>{{ statsOverview.phases }}</strong><small>当前筛选范围</small></article>
        <article class="statistics-kpi-card"><span>进行中期号</span><strong>{{ statsOverview.inProgress }}</strong><small>正在交付</small></article>
        <article class="statistics-kpi-card"><span>已完成期号</span><strong>{{ statsOverview.completed }}</strong><small>完成率 {{ statsOverview.completionRate }}%</small></article>
        <article class="statistics-kpi-card is-danger"><span>延期期号</span><strong>{{ statsOverview.delayed }}</strong><small>延期率 {{ statsOverview.delayRate }}%</small></article>
        <article class="statistics-kpi-card"><span>任务总数</span><strong>{{ statsOverview.tasks }}</strong><small>完成率 {{ statsOverview.taskCompletionRate }}%</small></article>
        <article class="statistics-kpi-card is-danger"><span>逾期任务</span><strong>{{ statsOverview.overdueTasks }}</strong><small>需要优先处理</small></article>
        <article class="statistics-kpi-card"><span>已登记工时</span><strong>{{ statsOverview.hours }}h</strong><small>当前期号工时记录</small></article>
        <article class="statistics-kpi-card is-warning"><span>日报待处理</span><strong>{{ statsOverview.pendingReports }}</strong><small>共 {{ statsOverview.reports }} 份日报</small></article>
      </section>
      <section class="statistics-panel statistics-health-panel">
        <header><div><h2>交付状态概览 <span>对比期号推进与日报处理状态</span></h2></div><b>{{ statsOverview.phases }} 个期号 · {{ statsOverview.reports }} 份日报</b></header>
        <div class="statistics-health-grid">
          <section class="statistics-health-section"><header><div><strong>期号状态分布</strong><small>按当前可见期号统计</small></div></header><div v-if="statsOverview.phases" class="statistics-donut-wrap"><div class="statistics-donut" :style="statsPhaseDonutStyle"><span><b>{{ statsOverview.phases }}</b><small>期号</small></span></div><div class="statistics-donut-legend"><div v-for="row in statsStatusRows" :key="row.status"><i class="statistics-status-dot" :class="`status-${row.status}`"></i><span>{{ row.status }}</span><b>{{ row.count }}</b><small>{{ row.percent }}%</small></div></div></div><a-empty v-else description="暂无期号数据" /></section>
          <section class="statistics-health-section statistics-report-section"><header><div><strong>日报处理情况</strong><small>待发送日报需要及时跟进</small></div><a-button type="text" size="small" @click="activeNav = '日报'">查看日报 <IconArrowRise /></a-button></header><div v-if="statsOverview.reports" class="statistics-donut-wrap"><div class="statistics-donut" :style="statsReportDonutStyle"><span><b>{{ statsOverview.reports }}</b><small>份日报</small></span></div><div class="statistics-donut-legend"><div v-for="row in statsReportSummary" :key="row.status"><i class="statistics-status-dot" :class="`report-status-${row.status}`"></i><span>{{ row.status }}</span><b>{{ row.count }}</b><small>占 {{ statsOverview.reports ? Math.round(row.count / statsOverview.reports * 100) : 0 }}%</small></div></div></div><a-empty v-else description="暂无日报数据" /></section>
        </div>
      </section>
      <section class="statistics-panel statistics-table-panel"><header><div><h2>项目交付汇总 <span>按项目查看期号数量、状态和平均完成度</span></h2></div><b>{{ statsProjectRows.length }} 个项目</b></header><div class="statistics-table"><div class="statistics-table-row statistics-table-heading"><span>项目</span><span>期号数</span><span>进行中</span><span>已完成</span><span>延期</span><span>平均完成度</span></div><div v-for="row in statsProjectRows" :key="row.key" class="statistics-table-row"><span><strong>{{ row.label }}</strong></span><span>{{ row.phases }}</span><span>{{ row.inProgress }}</span><span>{{ row.completed }}</span><span><a-tag v-if="row.delayed" color="red">{{ row.delayed }}</a-tag><span v-else class="statistics-zero-value">0</span></span><span class="statistics-progress-cell"><i><em :style="{ width: `${row.averageProgress}%` }"></em></i><b>{{ row.averageProgress }}%</b></span></div><a-empty v-if="!statsProjectRows.length" description="暂无项目数据" /></div></section>
      <section class="statistics-panel statistics-team-panel"><header><div><h2>团队负载 <span>按任务参与关系与日报登记工时汇总</span></h2></div><b>{{ statsMemberRows.length }} 人</b></header><div class="statistics-table statistics-member-table"><div class="statistics-table-row statistics-table-heading"><span>成员</span><span>任务数</span><span>已完成</span><span>完成率</span><span>登记工时</span><span>逾期任务</span></div><div v-for="row in statsMemberRows" :key="row.name" class="statistics-table-row"><span class="statistics-member-identity"><a-avatar :size="30">{{ row.name.slice(0, 1) }}</a-avatar><strong>{{ row.name }}</strong></span><span><strong>{{ row.tasks }} 项</strong></span><span><strong>{{ row.completed }} 项</strong></span><span class="statistics-member-progress"><i><em :style="{ width: `${row.completionRate}%` }"></em></i><b>{{ row.completionRate }}%</b></span><span><strong>{{ row.hours }}h</strong></span><span><a-tag v-if="row.overdue" color="red">{{ row.overdue }} 项</a-tag><span v-else class="statistics-zero-value">0 项</span></span></div><a-empty v-if="!statsMemberRows.length" description="暂无成员负载数据" /></div></section>
    </main>
    <div v-else class="project-layout">
      <div class="sidebar">
        <div class="sb-title">
          <b>客户 / 项目 + 期号</b>
          <div class="sidebar-title-actions">
            <a-tooltip :content="projectView === 'tree' ? '当前为项目树视图' : '切换为项目树视图'"><a-button class="sidebar-icon-button" :class="{ active: projectView === 'tree' }" type="text" size="mini" aria-label="项目树视图" :aria-pressed="projectView === 'tree'" @click="projectView = 'tree'"><IconMindMapping /></a-button></a-tooltip>
            <a-tooltip :content="projectView === 'list' ? '当前为期号列表视图' : '切换为期号列表视图'"><a-button class="sidebar-icon-button" :class="{ active: projectView === 'list' }" type="text" size="mini" aria-label="期号列表视图" :aria-pressed="projectView === 'list'" @click="projectView = 'list'"><IconList /></a-button></a-tooltip>
            <a-tooltip :content="phaseStatus === '全部状态' ? '筛选期号状态' : `当前筛选：${phaseStatus}`">
              <a-dropdown trigger="click" @select="status => phaseStatus = status">
                <a-button class="sidebar-icon-button" :class="{ active: phaseStatus !== '全部状态' }" type="text" size="mini" :aria-label="`筛选期号状态，当前${phaseStatus === '全部状态' ? '全部' : phaseStatus}`"><IconFilter /></a-button>
                <template #content>
                  <a-doption v-for="(count, status) in customerStatusCounts" :key="status" :value="status">
                    <span class="sidebar-status-option" :class="{ active: phaseStatus === status }"><IconCheckCircle v-if="phaseStatus === status" /><span v-else class="sidebar-status-option-placeholder"></span><span>{{ status === '全部状态' ? '全部状态' : status }}</span><b>{{ count }}</b></span>
                  </a-doption>
                </template>
              </a-dropdown>
            </a-tooltip>
            <a-tooltip content="添加项目或期号"><a-button class="sidebar-icon-button" type="text" size="mini" aria-label="添加项目或期号" @click="openProjectCreateModal"><IconPlus /></a-button></a-tooltip>
          </div>
        </div>
        <div class="sb-search"><IconSearch /><input v-model="navigatorKeyword" placeholder="搜索客户、项目或期号"><button v-if="navigatorKeyword" class="sb-search-clear" type="button" aria-label="清空搜索" @click="navigatorKeyword = ''"><IconClose /></button></div>
        <div class="sb-cols">
          <div v-if="projectView === 'tree'" class="sb-col-customer">
            <div v-for="customer in visibleCustomers" :key="customer.key" class="cust-item" :class="{ active: selectedCustomerKey === customer.key }" :title="`${customer.code}-${customer.name}`" @click="selectCustomer(customer)"><span class="no">{{ customer.code }}-</span><span class="customer-name">{{ customer.name }}</span></div>
            <div v-if="!visibleCustomers.length" class="tree-empty">没有匹配的客户</div>
          </div>
          <div class="sb-col-tree" :class="{ 'is-list-view': projectView === 'list' }">
            <template v-if="projectView === 'tree'">
              <template v-for="customer in filteredProjects" :key="customer.key">
                <template v-for="project in customer.projects" :key="project.key">
                  <div class="tree-folder"><IconFolder class="tree-folder-icon" /><span class="tnode">{{ customer.code }}-{{ project.code }} {{ project.name }}</span> <span class="cnt">({{ project.phases.length }})</span><span class="tree-ops"><i title="编辑项目" @click.stop="openProjectEdit(project)"><IconEdit /></i><i class="del" title="删除项目" @click.stop="removeProject(project)"><IconDelete /></i></span></div>
                  <div class="tree-phase">
                    <div v-for="phase in project.phases" :key="phase.key" class="phase-item" :class="{ active: phase.key === selectedPhaseKey }" @click="selectedPhaseKey = phase.key"><span class="dot" :class="dotCls(phase.status)"></span><span class="pno">{{ phase.code }}</span><span class="tnode">{{ phase.name }}</span><span class="tree-ops"><i title="编辑期号" @click.stop="openPhaseEdit(phase)"><IconEdit /></i><i class="del" title="删除期号" @click.stop="removePhase(phase)"><IconDelete /></i></span></div>
                  </div>
                </template>
              </template>
              <div v-if="!filteredProjects.length" class="tree-empty">{{ phaseStatus === '全部状态' ? '没有匹配的项目' : `没有${phaseStatus}的期号` }}<template v-if="phaseStatus === '全部状态' && !normalizedKeyword && customerStatusCounts['全部状态'] === 0"><br><b class="tree-empty-action" @click="openProjectCreateModal"><IconPlus />新建第一个项目</b></template></div>
            </template>
            <section v-else class="phase-list-section phase-list-flat"><div v-for="phase in phaseListData" :key="phase.key" class="phase-list-card phase-list-flat-card" :class="{ active: phase.key === selectedPhaseKey }" role="button" tabindex="0" @click="selectPhase(phase)"><div class="phase-list-main"><div class="phase-list-phase"><span class="phase-list-code">{{ phase.code }}</span><strong>{{ phase.name }}</strong></div><div class="phase-list-meta"><a-tag :color="phaseStatusColor(phase.status)">{{ phase.status }}</a-tag><span>期号负责人：{{ phase.owner }}</span></div></div><a-dropdown trigger="click" @select="action => openPhaseListMenu(phase, action)"><a-button class="phase-list-more" type="text" size="mini" aria-label="期号操作" @click.stop><IconMore /></a-button><template #content><a-doption value="edit-phase"><IconEdit />编辑期号</a-doption><a-doption value="delete-phase" class="tree-danger-option"><IconDelete />删除期号</a-doption></template></a-dropdown></div><a-empty v-if="!phaseListData.length" description="没有匹配的期号" /></section>
          </div>
        </div>
      </div>

      <div class="main" @click="paMenuOpen = ''">
        <!-- 项目头 -->
        <div class="proj-head" style="cursor:default;">
          <div class="phase-basic-info">
            <div style="min-width:0;">
              <h1>{{ selectedPhase.name }} <span class="tag-status" :class="{ 'tag-st-wait': selectedPhase.status === '未开始', 'tag-st-delay': selectedPhase.status === '延期', 'tag-st-done': selectedPhase.status === '已完成' }">{{ selectedPhase.status }}</span></h1>
              <div class="proj-meta">
                <span class="grey">{{ selectedPhase.code }} · {{ selectedPhase.projectName }}</span><span class="sep">|</span>
                <span>周期 {{ selectedPhase.dates }}</span><span class="sep">|</span>
                <span>负责人 {{ selectedPhase.owner }}</span>
              </div>
            </div>
            <a-tooltip content="编辑期号基本信息"><button class="gear" type="button" aria-label="编辑期号基本信息" @click.stop="openPhaseEdit(selectedPhase)"><IconEdit /></button></a-tooltip>
          </div>

          <section class="phase-recent-files" aria-label="最近文件">
            <strong>最近文件</strong>
            <div v-if="briefPhaseFiles.length" class="phase-recent-file-list">
              <button v-for="file in briefPhaseFiles" :key="file.id" class="phase-recent-file" type="button" :title="file.name" @click="previewPhaseFile(file)">
                <span class="file-icon" :class="fileIconCls(file.type)">{{ fileIconTxt(file.type) }}</span>
                <span>{{ file.name }}</span>
              </button>
            </div>
            <span v-else class="phase-recent-empty">暂无最近文件</span>
            <button class="phase-recent-all" type="button" @click="phaseWorkspaceTab = '资料'">全部 {{ currentPhaseFiles.length }} <IconCaretRight /></button>
          </section>
        </div>

        <section class="phase-workspace-panel">
          <nav class="phase-workspace-tabs" aria-label="项目内容">
            <button v-for="tab in ['任务', '概览', '日报', '工时', '资料', '成员', '日志']" :key="tab" type="button" :class="{ active: phaseWorkspaceTab === tab }" @click="phaseWorkspaceTab = tab">{{ tab }}</button>
          </nav>

        <!-- 资料在独立 Tab 内保留完整检索和管理能力。 -->
        <div v-if="phaseWorkspaceTab === '资料'" class="panel pa-files">
            <div class="panel-hd file-panel-toolbar">
              <div class="search-box"><IconSearch /><input v-model="phaseFileKeyword" placeholder="搜索文件名或内容"><button v-if="phaseFileKeyword" class="search-box-clear" type="button" aria-label="清空文件搜索" @click="phaseFileKeyword = ''"><IconClose /></button></div>
              <a-select v-model="phaseFileTypeFilter" class="phase-file-type-select" size="small" aria-label="筛选文件类型"><a-option v-for="type in phaseFileTypeOptions" :key="type" :value="type">{{ type }}</a-option></a-select>
              <div class="file-create-actions">
                <button class="btn-secondary" @click="openPhaseFileModal"><IconUpload />上传文件</button>
                <a-dropdown trigger="click" @select="openPhaseOnlineFileEditor"><button class="btn-primary"><IconPlus />新建<IconDown class="button-caret" /></button><template #content><a-doption value="DOCX"><span class="phase-file-create-option"><IconFile /><span><b>在线文档</b><small>适合方案与说明</small></span></span></a-doption><a-doption value="XLSX"><span class="phase-file-create-option"><IconBarChart /><span><b>在线表格</b><small>适合清单与数据</small></span></span></a-doption><a-doption value="PPTX"><span class="phase-file-create-option"><IconLayout /><span><b>在线演示文稿</b><small>适合汇报与评审</small></span></span></a-doption></template></a-dropdown>
              </div>
            </div>
            <div class="phase-file-table-wrap">
            <table class="file-full-table">
              <colgroup><col><col class="file-source-column"><col class="file-updater-column"><col class="file-updated-column"><col class="file-actions-column"></colgroup>
              <thead><tr>
                <th><button class="task-sort-button" :class="{ active: phaseFileSortBy === '文件名' }" :aria-label="`按文件名${phaseFileSortBy === '文件名' && phaseFileSortDirection === 'asc' ? '降序' : '升序'}排列`" @click="togglePhaseFileSort('文件名')">文件名<span class="task-sort-icons"><IconUp :class="{ on: phaseFileSortBy === '文件名' && phaseFileSortDirection === 'asc' }" /><IconDown :class="{ on: phaseFileSortBy === '文件名' && phaseFileSortDirection === 'desc' }" /></span></button></th>
                <th><button class="task-sort-button" :class="{ active: phaseFileSortBy === '文件类型' }" :aria-label="`按文件类型${phaseFileSortBy === '文件类型' && phaseFileSortDirection === 'asc' ? '降序' : '升序'}排列`" @click="togglePhaseFileSort('文件类型')">文件类型<span class="task-sort-icons"><IconUp :class="{ on: phaseFileSortBy === '文件类型' && phaseFileSortDirection === 'asc' }" /><IconDown :class="{ on: phaseFileSortBy === '文件类型' && phaseFileSortDirection === 'desc' }" /></span></button></th>
                <th><button class="task-sort-button" :class="{ active: phaseFileSortBy === '更新人' }" :aria-label="`按更新人${phaseFileSortBy === '更新人' && phaseFileSortDirection === 'asc' ? '降序' : '升序'}排列`" @click="togglePhaseFileSort('更新人')">更新人<span class="task-sort-icons"><IconUp :class="{ on: phaseFileSortBy === '更新人' && phaseFileSortDirection === 'asc' }" /><IconDown :class="{ on: phaseFileSortBy === '更新人' && phaseFileSortDirection === 'desc' }" /></span></button></th>
                <th><button class="task-sort-button" :class="{ active: phaseFileSortBy === '更新时间' }" :aria-label="`按更新时间${phaseFileSortBy === '更新时间' && phaseFileSortDirection === 'asc' ? '降序' : '升序'}排列`" @click="togglePhaseFileSort('更新时间')">更新时间<span class="task-sort-icons"><IconUp :class="{ on: phaseFileSortBy === '更新时间' && phaseFileSortDirection === 'asc' }" /><IconDown :class="{ on: phaseFileSortBy === '更新时间' && phaseFileSortDirection === 'desc' }" /></span></button></th>
                <th>操作</th>
              </tr></thead>
              <tbody>
                <tr v-for="file in pagedPhaseFiles" :key="file.id">
                  <td><span class="file-icon" :class="fileIconCls(file.type)">{{ fileIconTxt(file.type) }}</span><span class="fname-text"><span class="cell-main">{{ file.name }}</span><small class="sub2">{{ file.type }} · {{ file.size }}</small></span></td>
                  <td><span class="file-source-tag" :class="{ online: file.online }">{{ file.online ? '在线文件' : '上传文件' }}</span></td>
                  <td class="nowrap">{{ file.updatedBy || selectedPhase.owner }}</td>
                  <td class="grey nowrap">{{ file.updated }}</td>
                  <td class="op-cell nowrap"><span class="file-table-actions"><template v-if="file.online"><a class="op" @click="previewPhaseFile(file)">查看</a><a class="op" @click="openPhaseFileEdit(file)">编辑</a><a class="op" @click="exportPhaseOnlineFile(file)">导出</a></template><template v-else><a class="op" @click="previewPhaseFile(file)">预览</a><a class="op" @click="downloadPhaseFile(file)">下载</a></template><a class="op op-danger" @click="removePhaseFile(file)">删除</a></span></td>
                </tr>
              </tbody>
            </table>
            <div v-if="!visiblePhaseFiles.length" class="tree-empty">暂无匹配文件</div>
            </div>
            <PhaseListPagination v-model:page="phaseFilePage" v-model:page-size="phaseFilePageSize" :total="visiblePhaseFiles.length" />
        </div>

        <!-- ▍任务列表 -->
        <div v-if="phaseWorkspaceTab === '任务'" class="panel pa-tasks">
          <div class="panel-hd task-panel-toolbar">
            <div class="tabs">
              <span class="tab" :class="{ active: taskView === 'list' }" @click="taskView = 'list'">任务列表</span>
              <span class="tab" :class="{ active: taskView === 'board' }" @click="taskView = 'board'">看板视图</span>
            </div>
            <span class="hd-spacer"></span>
            <div class="search-box" style="min-width:150px;"><IconSearch /><input v-model="taskKeyword" placeholder="搜索任务名称"><button v-if="taskKeyword" class="search-box-clear" type="button" aria-label="清空任务搜索" @click="taskKeyword = ''"><IconClose /></button></div>
            <span class="filter-select" @click.stop="paMenuOpen = paMenuOpen === 'status' ? '' : 'status'">{{ statusFilter === '全部状态' ? '全部状态' : statusFilter }}<button v-if="statusFilter !== '全部状态'" class="filter-select-clear" type="button" aria-label="清除状态筛选" @click.stop="statusFilter = '全部状态'; paMenuOpen = ''"><IconClose /></button><IconDown v-else class="caret" />
              <span v-if="paMenuOpen === 'status'" class="fs-menu"><span v-for="status in statusOptions" :key="status" class="fs-item" :class="{ on: status === statusFilter }" @click.stop="statusFilter = status; paMenuOpen = ''">{{ status }}</span></span>
            </span>
            <a-date-picker v-model="dueDateFilter" class="task-due-date-filter" size="small" format="YYYY-MM-DD" value-format="YYYY-MM-DD" placeholder="截止时间" allow-clear />
            <button class="btn-primary" @click="taskView === 'board' ? openLaneModal() : openTaskModal()"><IconPlus />{{ taskView === 'board' ? '添加列' : '新建任务' }}</button>
            <a-dropdown trigger="click"><span class="filter-select more-btn" @click.stop><IconMore /></span><template #content><a-menu class="workspace-more-menu" @menu-item-click="openWorkspaceMore"><a-menu-item key="import"><IconImport />导入任务</a-menu-item><a-menu-item key="template"><IconFile />下载导入模板</a-menu-item><a-menu-item key="export"><IconExport />导出任务</a-menu-item></a-menu></template></a-dropdown>
          </div>
          <div v-if="taskView === 'list'" class="task-table-wrap">
            <div class="task-table-scroll">
              <table>
                <thead><tr>
                  <th style="width:36px;"></th>
                  <th><button class="task-sort-button" :class="{ active: sortBy === '任务名称' }" :aria-label="`按任务名称${sortBy === '任务名称' && sortDirection === 'asc' ? '降序' : '升序'}排列`" @click="toggleTaskSort('任务名称')">任务名称<span class="task-sort-icons"><IconUp :class="{ on: sortBy === '任务名称' && sortDirection === 'asc' }" /><IconDown :class="{ on: sortBy === '任务名称' && sortDirection === 'desc' }" /></span></button></th>
                  <th style="width:76px;"><button class="task-sort-button" :class="{ active: sortBy === '优先级' }" :aria-label="`按优先级${sortBy === '优先级' && sortDirection === 'asc' ? '降序' : '升序'}排列`" @click="toggleTaskSort('优先级')">优先级<span class="task-sort-icons"><IconUp :class="{ on: sortBy === '优先级' && sortDirection === 'asc' }" /><IconDown :class="{ on: sortBy === '优先级' && sortDirection === 'desc' }" /></span></button></th>
                  <th style="width:84px;"><button class="task-sort-button" :class="{ active: sortBy === '执行人' }" :aria-label="`按执行人${sortBy === '执行人' && sortDirection === 'asc' ? '降序' : '升序'}排列`" @click="toggleTaskSort('执行人')">执行人<span class="task-sort-icons"><IconUp :class="{ on: sortBy === '执行人' && sortDirection === 'asc' }" /><IconDown :class="{ on: sortBy === '执行人' && sortDirection === 'desc' }" /></span></button></th>
                  <th style="width:84px;"><button class="task-sort-button" :class="{ active: sortBy === '确认人' }" :aria-label="`按确认人${sortBy === '确认人' && sortDirection === 'asc' ? '降序' : '升序'}排列`" @click="toggleTaskSort('确认人')">确认人<span class="task-sort-icons"><IconUp :class="{ on: sortBy === '确认人' && sortDirection === 'asc' }" /><IconDown :class="{ on: sortBy === '确认人' && sortDirection === 'desc' }" /></span></button></th>
                  <th style="width:88px;"><button class="task-sort-button" :class="{ active: sortBy === '状态' }" :aria-label="`按状态${sortBy === '状态' && sortDirection === 'asc' ? '降序' : '升序'}排列`" @click="toggleTaskSort('状态')">状态<span class="task-sort-icons"><IconUp :class="{ on: sortBy === '状态' && sortDirection === 'asc' }" /><IconDown :class="{ on: sortBy === '状态' && sortDirection === 'desc' }" /></span></button></th>
                  <th style="width:110px;"><button class="task-sort-button" :class="{ active: sortBy === '截止时间' }" :aria-label="`按截止时间${sortBy === '截止时间' && sortDirection === 'asc' ? '降序' : '升序'}排列`" @click="toggleTaskSort('截止时间')">截止时间<span class="task-sort-icons"><IconUp :class="{ on: sortBy === '截止时间' && sortDirection === 'asc' }" /><IconDown :class="{ on: sortBy === '截止时间' && sortDirection === 'desc' }" /></span></button></th>
                  <th style="width:124px;">操作</th>
                </tr></thead>
                <tbody>
                  <tr v-for="task in pagedTasks" :key="task.id" class="task-row" :class="{ 'row-done': task.status === '已完成' }" @click="onTaskRowClick(task)">
                    <td @click.stop><span class="chk" :class="{ on: task.status === '已完成', half: task.status === '待确认', disabled: !taskChecklistAction(task) }" @click="taskChecklistAction(task) && handleTaskChecklistChange(task)"></span></td>
                    <td><div class="cell-main">{{ task.id }} {{ task.title }}</div><div class="sub2">{{ task.module }}</div></td>
                    <td><span class="pri" :class="priMeta(task.priority).cls"><i></i>{{ priMeta(task.priority).txt }}</span></td>
                    <td class="nowrap" :title="taskExecutorLabel(task)"><span class="task-person-cell">{{ taskExecutorNames(task)[0] }}<b v-if="taskExecutorNames(task).length > 1">+{{ taskExecutorNames(task).length - 1 }}</b></span></td>
                    <td class="nowrap">{{ task.confirmer || task.owner }}</td>
                    <td><span class="tag-st" :class="stTagCls(task.status)">{{ task.status }}</span></td>
                    <td class="grey nowrap">{{ task.due }}</td>
                    <td class="op-cell nowrap" @click.stop>
                      <span class="task-row-actions">
                        <a class="op" :class="{ 'op-disabled': !canEditTask(task) }" @click="editTaskFromList(task)">编辑</a>
                        <a-dropdown v-if="task.status === '待确认' && taskChecklistAction(task) === 'confirm'" trigger="click" position="br">
                          <a class="op task-action-dropdown" @click.stop>处理<IconDown /></a>
                          <template #content>
                            <a-menu class="task-action-menu" @menu-item-click="action => handleTaskActionMenu(task, action)">
                              <a-menu-item key="confirm"><IconCheckCircle />确认完成</a-menu-item>
                              <a-menu-item key="reject"><IconArrowLeft />退回修改</a-menu-item>
                              <a-menu-item v-if="canDeleteTask(task)" key="delete" class="tree-danger-option"><IconDelete />删除任务</a-menu-item>
                            </a-menu>
                          </template>
                        </a-dropdown>
                        <a v-else-if="canDeleteTask(task)" class="op op-danger" @click="deleteTaskFromList(task)">删除</a>
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
              <div v-if="!visibleTasks.length" class="tree-empty">暂无符合条件的任务</div>
            </div>
            <div v-if="visibleTasks.length" class="pagination">
              共 {{ visibleTasks.length }} 条
              <span class="pg-btn" :class="{ disabled: taskPage <= 1 }" aria-label="上一页" @click="taskPage > 1 && taskPage--"><IconCaretLeft /></span>
              <span v-for="p in taskPageCount" :key="p" class="pg-btn" :class="{ active: p === taskPage }" @click="taskPage = p">{{ p }}</span>
              <span class="pg-btn" :class="{ disabled: taskPage >= taskPageCount }" aria-label="下一页" @click="taskPage < taskPageCount && taskPage++"><IconCaretRight /></span>
              <a-select v-model="taskPageSize" class="pg-size" size="mini" aria-label="每页显示条数">
                <a-option :value="8">8条/页</a-option>
                <a-option :value="16">16条/页</a-option>
                <a-option :value="24">24条/页</a-option>
              </a-select>
            </div>
          </div>
          <section v-else class="task-board-wrapper">
            <div class="task-board-section">
              <section v-for="lane in boardLanes" :key="lane.key" class="task-board-lane" draggable="true" @dragstart="startLaneDrag(lane, $event)" @dragend="clearLaneDrag" @dragover.prevent @drop="dropBoardLaneOrTask(lane, $event)">
                <header>
                  <span class="task-board-lane-title"><a-tag :color="lane.color">{{ lane.title }}</a-tag><b>{{ orderedBoardTasks(lane).length }}</b></span>
                  <a-dropdown trigger="click" @select="action => boardLaneAction(lane, action)">
                    <a-button class="task-board-lane-more" type="text" size="mini" aria-label="看板列更多操作" @click.stop><IconMore /></a-button>
                    <template #content>
                      <a-doption value="edit"><IconEdit />编辑列</a-doption>
                      <a-doption value="assign"><IconUser />批量指定执行人</a-doption>
                      <a-doption value="delete" class="tree-danger-option"><IconDelete />删除列</a-doption>
                    </template>
                  </a-dropdown>
                </header>
                <div class="task-board-cards" @dragover.prevent.stop @drop.stop="dropTaskOnLane(lane, $event)">
                  <button v-for="task in orderedBoardTasks(lane)" :key="task.id" class="task-board-card" draggable="true" @dragstart.stop="startTaskDrag(task, $event)" @dragover.prevent @drop="dropTaskBefore(task, lane, $event)" @click="onTaskRowClick(task)">
                    <div class="task-board-card-top"><span class="pri" :class="priMeta(task.priority).cls"><i></i>{{ task.priority }}</span><span class="task-board-due">{{ task.due }}</span></div>
                    <strong>{{ task.title }}</strong>
                    <small>{{ task.id }} · {{ task.module }}</small>
                    <footer>
                      <span class="task-board-executors" :title="taskExecutorLabel(task)"><a-avatar :size="22">{{ (taskExecutorNames(task)[0] || task.owner || '?').slice(0, 1) }}</a-avatar><em>{{ taskExecutorNames(task)[0] || task.owner }}</em><b v-if="taskExecutorNames(task).length > 1">+{{ taskExecutorNames(task).length - 1 }}</b></span>
                      <a-tag class="task-board-status" :color="phaseStatusColor(task.status)">{{ task.status }}</a-tag>
                    </footer>
                  </button>
                  <a-empty v-if="!orderedBoardTasks(lane).length" description="暂无任务" />
                  <button v-if="canManageTasks" class="task-board-add-task" type="button" @click="openTaskModalForLane(lane)"><IconPlus />添加任务</button>
                </div>
              </section>
            </div>
          </section>
          <input ref="taskImportInput" class="task-import-input" type="file" accept=".csv,text/csv" @change="importTasks" />
        </div>
        <section v-else-if="phaseWorkspaceTab === '概览'" class="phase-workspace-summary phase-overview-summary">
          <div class="phase-workspace-note phase-overview-note"><strong>当前进展</strong><span>{{ selectedPhase.name }}处于{{ selectedPhase.status }}状态，完成率 {{ phaseTaskStats.total ? Math.round(phaseTaskStats.completed / phaseTaskStats.total * 100) : 0 }}%；有 {{ phaseTaskStats.pending }} 项任务等待确认，{{ phaseTaskStats.overdue }} 项任务已逾期。</span></div>
          <section class="phase-overview-card phase-task-overview-card">
            <div class="phase-overview-metrics phase-task-metrics">
              <article><span>任务总数</span><strong>{{ phaseTaskStats.total }}</strong><small>项</small><i><em :style="{ width: '100%' }"></em></i></article>
              <article><span>未完成</span><strong>{{ phaseTaskStats.incomplete }}</strong><small>项</small><i><em :style="{ width: `${phaseTaskStats.total ? phaseTaskStats.incomplete / phaseTaskStats.total * 100 : 0}%` }"></em></i></article>
              <article><span>待确认</span><strong>{{ phaseTaskStats.pending }}</strong><small>项</small><i><em :style="{ width: `${phaseTaskStats.total ? phaseTaskStats.pending / phaseTaskStats.total * 100 : 0}%` }"></em></i></article>
              <article><span>已完成</span><strong>{{ phaseTaskStats.completed }}</strong><small>项</small><i><em :style="{ width: `${phaseTaskStats.total ? phaseTaskStats.completed / phaseTaskStats.total * 100 : 0}%` }"></em></i></article>
              <article class="is-danger"><span>已逾期</span><strong>{{ phaseTaskStats.overdue }}</strong><small>项</small><i><em :style="{ width: `${phaseTaskStats.total ? phaseTaskStats.overdue / phaseTaskStats.total * 100 : 0}%` }"></em></i></article>
              <article><span>完成率</span><strong>{{ phaseTaskStats.total ? Math.round(phaseTaskStats.completed / phaseTaskStats.total * 100) : 0 }}</strong><small>%</small><i><em :style="{ width: `${phaseTaskStats.total ? phaseTaskStats.completed / phaseTaskStats.total * 100 : 0}%` }"></em></i></article>
            </div>
          </section>
          <div class="phase-overview-grid">
            <section class="phase-overview-card phase-report-overview-card">
              <header><div><i class="phase-overview-heading-bar"></i><strong>日报发送情况</strong><span>当前期号关联日报</span></div><a-button type="text" size="small" @click="phaseWorkspaceTab = '日报'">查看日报</a-button></header>
              <div class="phase-report-summary-metrics">
                <article v-for="row in phaseOverviewReportSummary" :key="row.status"><span><i :class="`phase-status-dot phase-status-${dailyReportStatusColors[row.status]}`"></i>{{ row.status }}</span><strong>{{ row.count }}</strong><small>份日报</small></article>
              </div>
              <div class="phase-report-chart" aria-label="近七日日报发送趋势"><div v-for="day in phaseOverviewReportSeries" :key="day.key" class="phase-report-chart-day"><span><i class="is-pending" :style="{ height: `${day.pending ? Math.max(8, day.pending * 18) : 0}px` }"></i><i class="is-sent" :style="{ height: `${day.sent ? Math.max(8, day.sent * 24) : 0}px` }"></i></span><b>{{ day.total || '' }}</b><small>{{ day.label }}</small></div></div>
            </section>
            <section class="phase-overview-card phase-member-load-card">
              <header><div><i class="phase-overview-heading-bar"></i><strong>成员负荷</strong><span>按未完成任务与登记工时汇总</span></div><a-button type="text" size="small" @click="phaseWorkspaceTab = '成员'">查看成员</a-button></header>
              <div class="phase-member-load-list">
                <div v-for="row in phaseOverviewMemberLoadRows" :key="row.name" class="phase-member-load-row">
                  <a-avatar :size="28">{{ row.name.slice(0, 1) }}</a-avatar><strong>{{ row.name }}</strong><span class="phase-member-progress"><i><em :style="{ width: `${row.loadPercent}%` }"></em></i></span><small>{{ row.tasks }} 项 · {{ row.hours }}h<span v-if="row.overdue" class="is-danger"> · {{ row.overdue }} 项逾期</span></small>
                </div>
                <a-empty v-if="!phaseOverviewMemberLoadRows.length" description="暂无期号成员" />
              </div>
            </section>
          </div>
        </section>
        <section v-else-if="phaseWorkspaceTab === '日报'" class="phase-workspace-summary phase-workspace-list">
          <header class="phase-tab-heading phase-report-toolbar">
            <div class="phase-tab-filters">
            <a-input v-model="phaseReportKeyword" allow-clear placeholder="搜索日报名称"><template #prefix><IconSearch /></template></a-input>
            <a-select v-model="phaseReportStatusFilter" size="small"><a-option value="全部状态">全部状态</a-option><a-option v-for="status in ['已发送', '待发送']" :key="status" :value="status">{{ status }}</a-option></a-select>
            <a-select v-model="phaseReportMemberFilter" size="small" allow-search aria-label="按日报发送人筛选"><a-option value="全部成员">全部成员</a-option><a-option v-for="member in phaseReportMembers" :key="member" :value="member">{{ member }}</a-option></a-select>
            </div>
            <button v-if="canManageReports" class="btn-primary" type="button" @click="openDailyReportModal()"><IconPlus />发送日报</button>
          </header>
          <div class="phase-tab-table-wrap"><table class="phase-tab-table phase-report-table"><thead><tr><th>日报名称</th><th>日报工时</th><th>发送人</th><th>发送时间</th><th>状态</th><th>操作</th></tr></thead><tbody><tr v-for="report in pagedPhaseReports" :key="report.id" @click="openDailyReport(report)"><td><strong>{{ dailyReportDisplayName(report) }}</strong></td><td><b>{{ report.hours }}h</b></td><td>{{ report.sender }}</td><td class="phase-table-muted">{{ report.sentAt }}</td><td><a-tag :color="dailyReportStatusColors[report.status]">{{ report.status }}</a-tag></td><td class="phase-table-actions" @click.stop><a @click="openDailyReport(report)">查看</a><a v-if="canManageReports && (isManagementRole || report.sender === accountProfile.nickname)" @click="openDailyReportModal(report)">编辑</a><a v-if="canManageReports && (isManagementRole || report.sender === accountProfile.nickname)" class="is-danger" @click="deleteDailyReport(report)">删除</a></td></tr></tbody></table><a-empty v-if="!visiblePhaseReports.length" description="暂无符合条件的日报" /></div>
          <PhaseListPagination v-model:page="phaseReportPage" v-model:page-size="phaseReportPageSize" :total="visiblePhaseReports.length" />
        </section>
        <section v-else-if="phaseWorkspaceTab === '工时'" class="phase-workspace-summary phase-workspace-list">
          <div class="phase-hour-stats"><article><span>总工时</span><strong>{{ phaseWorklogSummary.hours }}h</strong></article><article><span>记录条数</span><strong>{{ phaseWorklogSummary.records }} 条</strong></article><article><span>参与成员</span><strong>{{ phaseWorklogSummary.members }} 人</strong></article><article><span>人均工时</span><strong>{{ phaseWorklogSummary.average }}h</strong></article></div>
          <div class="phase-tab-filters phase-worklog-toolbar"><a-input v-model="phaseWorklogKeyword" allow-clear placeholder="搜索工作内容"><template #prefix><IconSearch /></template></a-input><a-select v-model="phaseWorklogMemberFilter" size="small" allow-search aria-label="按工时成员筛选"><a-option value="全部成员">全部成员</a-option><a-option v-for="member in teamMembers" :key="member" :value="member">{{ member }}</a-option></a-select><a-range-picker v-model="phaseWorklogDateRange" value-format="YYYY-MM-DD" format="YYYY-MM-DD" :placeholder="['开始日期', '结束日期']" allow-clear aria-label="按工时日期区间筛选" /><button class="btn-primary" type="button" @click="notify('已准备导出当前期号工时')"><IconExport />导出工时</button></div>
          <div class="phase-tab-table-wrap"><table class="phase-tab-table phase-worklog-table"><thead><tr><th>日期</th><th>成员</th><th>工时</th><th>工作内容</th><th>操作</th></tr></thead><tbody><tr v-for="log in pagedPhaseWorklogs" :key="log.id"><td class="phase-table-muted">{{ log.date }}</td><td>{{ log.member }}</td><td><b>{{ log.hours }}h</b></td><td><strong>{{ log.content }}</strong></td><td class="phase-table-actions"><a @click="openPhaseWorklogDetail(log)">查看详情</a></td></tr></tbody></table><a-empty v-if="!visiblePhaseWorklogs.length" description="暂无符合条件的工时记录" /></div>
          <PhaseListPagination v-model:page="phaseWorklogPage" v-model:page-size="phaseWorklogPageSize" :total="visiblePhaseWorklogs.length" />
        </section>
        <section v-else-if="phaseWorkspaceTab === '成员'" class="phase-workspace-summary phase-workspace-list">
          <div class="phase-tab-filters phase-member-toolbar"><a-input v-model="phaseMemberKeyword" allow-clear placeholder="搜索姓名或职务"><template #prefix><IconSearch /></template></a-input><a-select v-model="phaseMemberTypeFilter" size="small"><a-option value="全部成员">全部成员</a-option><a-option v-for="type in phaseMemberTypes" :key="type" :value="type">{{ type }}</a-option></a-select><button class="btn-primary" type="button" @click="openPhaseMemberModal"><IconPlus />添加成员</button></div>
          <div class="phase-tab-table-wrap"><table class="phase-tab-table phase-member-table"><thead><tr><th>成员</th><th>成员类型</th><th>期号角色</th><th>加入时间</th><th>操作</th></tr></thead><tbody><tr v-for="member in pagedPhaseMembers" :key="member.id"><td><span class="phase-member-identity"><a-avatar :size="30">{{ (member.rawName || member.name).slice(0, 1) }}</a-avatar><span><strong>{{ member.rawName || member.name }}</strong><small>{{ member.baseRole || member.role || '项目成员' }}</small></span></span></td><td><a-tag>{{ member.type || '内部成员' }}</a-tag></td><td>{{ member.baseRole || member.role || '项目成员' }}</td><td class="phase-table-muted">{{ member.joinedAt || '未记录' }}</td><td class="phase-table-actions"><a @click="openPhaseMemberEditor(member)">权限设置</a><a class="is-danger" @click="deletePhaseMember(member)">移除</a></td></tr></tbody></table><a-empty v-if="!visiblePhaseMembers.length" description="暂无符合条件的协作成员" /></div>
          <PhaseListPagination v-model:page="phaseMemberPage" v-model:page-size="phaseMemberPageSize" :total="visiblePhaseMembers.length" />
        </section>
        <section v-else-if="phaseWorkspaceTab === '日志'" class="phase-workspace-summary phase-workspace-list">
          <div class="phase-log-list"><article v-for="item in pagedPhaseActivityRows" :key="`${item.type}-${item.title}`" class="phase-log-row"><a-tag>{{ item.type }}</a-tag><span><strong>{{ item.title }}</strong><small>{{ item.detail }}</small></span><time>{{ item.time }}</time></article></div>
          <PhaseListPagination v-model:page="phaseActivityPage" v-model:page-size="phaseActivityPageSize" :total="phaseActivityRows.length" />
        </section>
        </section>
      </div>
    </div>

    <a-modal
      v-model:visible="taskModalVisible"
      title="新建任务"
      ok-text="创建任务"
      cancel-text="取消"
      :ok-button-props="{ disabled: !draft.title.trim() || !draft.phase }"
      @ok="createTask"
    >
      <a-form layout="vertical">
        <div v-if="taskCreationSource === 'project'" class="modal-context">
          <span>项目期号</span>
          <strong>{{ selectedPhase.code }} {{ selectedPhase.projectName }}-{{ selectedPhase.name }}</strong>
        </div>
        <a-form-item v-else label="项目期号" required>
          <a-select v-model="draft.phase" allow-search placeholder="搜索并选择项目期号">
            <a-option v-for="phase in dashboardPhaseRows" :key="phase.key" :value="phase.key">{{ phase.code }} · {{ phase.projectName }}-{{ phase.name }}</a-option>
          </a-select>
        </a-form-item>
        <a-form-item label="任务名称" required><a-input v-model="draft.title" autofocus placeholder="填写明确、可交付的任务名称" /></a-form-item>
        <div class="form-grid">
          <a-form-item label="状态"><a-select v-model="draft.status"><a-option v-for="lane in boardLanes" :key="lane.key" :value="lane.title">{{ lane.title }}</a-option></a-select></a-form-item>
          <a-form-item label="确认人"><a-select v-model="draft.confirmer"><a-option v-for="member in teamMembers" :key="member" :value="member">{{ member }}</a-option></a-select></a-form-item>
          <a-form-item label="执行人"><a-select v-model="draft.executors" multiple :max-tag-count="2" placeholder="可选择多个执行人"><a-option v-for="member in teamMembers" :key="member" :value="member">{{ member }}</a-option></a-select></a-form-item>
          <a-form-item label="优先级"><a-select v-model="draft.priority"><a-option v-for="priority in ['P0', 'P1', 'P2']" :key="priority" :value="priority">{{ priority }}</a-option></a-select></a-form-item>
          <a-form-item label="截止时间"><a-input v-model="draft.due" type="date" /></a-form-item>
        </div>
        <a-form-item label="任务描述"><RichTextEditor v-model="draft.description" placeholder="补充任务目标、验收标准、依赖或交付物" /></a-form-item>
        <section class="subtask-builder">
          <header><strong>子任务</strong><span>{{ draft.subtasks.length }} 项</span></header>
          <div v-if="!taskModalSubtaskAdding" class="task-drawer-subtask-entry"><a-button class="task-drawer-subtask-entry-button" type="outline" @click="startDraftSubtask"><IconPlus />添加子任务</a-button></div>
          <div v-else class="task-drawer-subtask-form">
            <a-input v-model="subtaskDraft" autofocus placeholder="填写子任务名称" @keyup.enter="addSubtask" />
            <a-select v-model="subtaskAssigneeDraft" class="subtask-assignee-select" allow-search placeholder="负责人"><a-option v-for="member in teamMembers" :key="member" :value="member">{{ member }}</a-option></a-select>
            <a-button type="primary" aria-label="确认添加子任务" @click="addSubtask"><IconCheckCircle /></a-button>
            <a-button type="text" aria-label="取消添加子任务" @click="cancelDraftSubtask">取消</a-button>
          </div>
          <div v-if="draft.subtasks.length" class="task-subtask-list">
            <div v-for="subtask in draft.subtasks" :key="subtask.id" class="task-subtask-row" :class="{ dragging: draggedDraftSubtaskId === subtask.id, editing: draftSubtaskEditingId === subtask.id }" @dragover.prevent @drop="dropDraftSubtask(subtask, $event)">
              <span class="task-subtask-drag" draggable="true" title="拖动排序" @dragstart="startDraftSubtaskDrag(subtask, $event)" @dragend="draggedDraftSubtaskId = null"><IconDragDotVertical /></span>
              <template v-if="draftSubtaskEditingId === subtask.id">
                <a-input v-model="draftSubtaskEditDraft.title" class="task-subtask-edit-input" size="small" autofocus @keyup.enter="saveDraftSubtaskEdit(subtask)" @keyup.esc="cancelDraftSubtaskEdit" />
                <a-select v-model="draftSubtaskEditDraft.assignee" class="task-subtask-assignee" size="small" allow-search><a-option v-for="member in teamMembers" :key="member" :value="member">{{ member }}</a-option></a-select>
                <span class="task-subtask-actions"><a-tooltip content="保存"><a-button type="text" size="small" aria-label="保存子任务" @click="saveDraftSubtaskEdit(subtask)"><IconCheckCircle /></a-button></a-tooltip><a-tooltip content="取消"><a-button type="text" size="small" aria-label="取消编辑" @click="cancelDraftSubtaskEdit"><IconClose /></a-button></a-tooltip></span>
              </template>
              <template v-else>
                <a-checkbox :model-value="subtask.status === '已完成'" @change="toggleDraftSubtask(subtask)"><span class="task-subtask-title">{{ subtask.title }}</span></a-checkbox>
                <a-select :model-value="subtask.assignee || draft.executors?.[0] || '李项目'" class="task-subtask-assignee" size="small" allow-search @change="value => updateDraftSubtaskAssignee(subtask, value)"><a-option v-for="member in teamMembers" :key="member" :value="member">{{ member }}</a-option></a-select>
                <a-tag :color="phaseStatusColor(subtask.status)">{{ subtask.status }}</a-tag>
                <span class="task-subtask-actions"><a-tooltip content="编辑"><a-button type="text" size="small" aria-label="编辑子任务" @click="startDraftSubtaskEdit(subtask)"><IconEdit /></a-button></a-tooltip><a-tooltip content="删除"><a-button type="text" size="small" aria-label="移除子任务" @click="removeSubtask(subtask)"><IconDelete /></a-button></a-tooltip></span>
              </template>
            </div>
          </div>
          <p v-else class="task-subtasks-empty">暂无子任务，可点击上方按钮添加。</p>
        </section>
      </a-form>
    </a-modal>
    <a-modal v-model:visible="systemSettingsModalVisible" modal-class="system-settings-modal" width="860px" title="系统设置" :footer="false">
      <div class="system-settings-modal-content">
      <section class="system-settings-section">
        <header><strong>基础设置</strong><span>用于项目管理系统的通用展示和默认规则</span></header>
        <a-form layout="vertical">
          <a-form-item label="系统名称" required><a-input v-model="systemSettingsDraft.name" maxlength="30" placeholder="填写系统名称" /></a-form-item>
          <a-form-item label="系统 Logo"><div class="system-logo-picker"><div class="system-logo-preview"><img v-if="systemSettingsDraft.logoUrl" :src="systemSettingsDraft.logoUrl" :alt="systemSettingsDraft.name" /><span v-else class="brand-wordmark brand-wordmark-preview">{{ systemSettingsDraft.name }}</span></div><div><input ref="systemSettingsLogoInput" class="profile-avatar-input" type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" @change="handleSystemLogoChange" /><a-button type="outline" size="small" @click="systemSettingsLogoInput?.click()"><IconImport />上传 Logo</a-button><a-button v-if="systemSettingsDraft.logoUrl" type="text" size="small" @click="systemSettingsDraft.logoUrl = ''"><IconDelete />移除</a-button><small>建议上传包含完整品牌名称的横版 Logo；支持 PNG、JPG、WEBP 或 SVG，文件不超过 5 MB</small></div></div></a-form-item>
        </a-form>
      </section>
      <section class="system-settings-section">
        <header><strong>项目阶段管理</strong><span>不同项目类型可配置独立的阶段流程</span></header>
        <div class="project-stage-toolbar"><span>共 {{ projectStageConfigs.length }} 种项目类型</span><a-button type="outline" size="small" @click="openProjectStageModal()"><IconPlus />添加项目类型</a-button></div>
        <div class="project-stage-config-list">
          <div v-for="config in projectStageConfigs" :key="config.id" class="project-stage-config-item">
            <div><strong>{{ config.type }}</strong><p>{{ config.description || '未填写适用说明' }}</p><span class="project-stage-flow"><b>{{ config.stages?.length || 0 }} 个阶段</b><small>{{ config.stages?.map(stage => stage.name).join(' → ') || '暂未配置项目阶段' }}</small></span><small>更新于 {{ config.updatedAt }}</small></div>
            <span class="project-stage-config-actions"><a-tooltip content="编辑阶段配置"><a-button type="text" size="small" aria-label="编辑项目阶段配置" @click="openProjectStageModal(config)"><IconEdit /></a-button></a-tooltip><a-tooltip content="删除阶段配置"><a-button type="text" status="danger" size="small" aria-label="删除项目阶段配置" @click="removeProjectStageConfig(config)"><IconDelete /></a-button></a-tooltip></span>
          </div>
          <a-empty v-if="!projectStageConfigs.length" description="暂无项目阶段配置" />
        </div>
      </section>
      <section class="system-settings-section">
        <header><strong>任务规则</strong><span>新建任务和到期提醒的系统默认配置</span></header>
        <a-form layout="vertical"><a-form-item label="默认任务状态"><a-select v-model="systemSettingsDraft.defaultTaskStatus"><a-option value="未完成">未完成</a-option><a-option value="待确认">待确认</a-option></a-select></a-form-item></a-form>
        <div class="system-settings-switch"><span><b>任务到期提醒</b><small>在任务临近截止时间时向相关成员发送通知</small></span><a-switch v-model="systemSettingsDraft.taskDueReminder" /></div>
      </section>
      <section class="system-settings-section">
        <header><strong>协作与通知</strong><span>控制日报提醒和外部成员加入流程</span></header>
        <div class="system-settings-switch"><span><b>日报提交提醒</b><small>在工作日结束前提醒成员提交日报</small></span><a-switch v-model="systemSettingsDraft.dailyReportReminder" /></div>
        <div class="system-settings-switch"><span><b>外部成员邀请审核</b><small>外部成员接受邀请后需管理员确认才可访问项目</small></span><a-switch v-model="systemSettingsDraft.externalInviteReview" /></div>
      </section>
      </div>
      <div class="system-settings-modal-footer"><a-button @click="systemSettingsModalVisible = false">取消</a-button><a-button type="primary" @click="saveSystemSettings">保存</a-button></div>
    </a-modal>
    <a-modal v-model:visible="profileDrawerVisible" modal-class="profile-editor-modal" width="640px" title="个人信息">
      <div class="profile-avatar-section">
        <a-avatar :size="72" :image-url="profileDraft.avatarUrl">{{ profileDraft.nickname.trim().slice(0, 1) || '用' }}</a-avatar>
        <div><strong>{{ profileDraft.nickname || '未设置昵称' }}</strong><span>{{ profileDraft.position || '未设置职务' }}</span><small>支持 JPG、PNG 等图片，文件不超过 5 MB</small></div>
        <span class="profile-avatar-actions"><a-button type="outline" size="small" @click="profileAvatarInput?.click()"><IconImport />更换头像</a-button><a-button v-if="profileDraft.avatarUrl" type="text" size="small" @click="profileDraft.avatarUrl = ''"><IconDelete />移除</a-button></span>
        <input ref="profileAvatarInput" class="profile-avatar-input" type="file" accept="image/*" @change="handleProfileAvatarChange" />
      </div>
      <section class="profile-settings-section"><header><strong>基本资料</strong><span>用于登录识别和项目协作展示</span></header><a-form layout="vertical"><div class="form-grid"><a-form-item label="账号" required><a-input v-model="profileDraft.account" allow-clear placeholder="手机号、邮箱或成员账号" @input="profileError = ''" /></a-form-item><a-form-item label="手机号"><a-input v-model="profileDraft.phone" allow-clear maxlength="11" placeholder="用于安全验证和联系" @input="profileError = ''" /></a-form-item><a-form-item label="昵称" required><a-input v-model="profileDraft.nickname" allow-clear maxlength="20" placeholder="协作中显示的名称" @input="profileError = ''" /></a-form-item><a-form-item label="职务" required><a-select v-model="profileDraft.position" allow-clear placeholder="选择职务" @change="profileError = ''"><a-option v-for="position in profilePositionOptions" :key="position" :value="position">{{ position }}</a-option></a-select></a-form-item></div></a-form><p v-if="profileError" class="profile-error" role="alert">{{ profileError }}</p></section>
      <section class="profile-settings-section"><header><strong>第三方账号</strong><span>绑定后可使用对应平台授权登录</span></header><div class="profile-security-list"><div><span class="profile-security-icon wecom"><IconSafe /></span><span><b>企业微信</b><small>{{ profileDraft.wecomBound ? '已绑定，可使用企业微信授权登录' : '未绑定' }}</small></span><a-tag :color="profileDraft.wecomBound ? 'green' : 'gray'">{{ profileDraft.wecomBound ? '已绑定' : '未绑定' }}</a-tag><a-button v-if="profileDraft.wecomBound" type="text" size="small" @click="unbindProfileAccount('企业微信')">解绑</a-button><a-button v-else type="outline" size="small" :loading="profileBindingLoading === '企业微信'" :disabled="Boolean(profileBindingLoading)" @click="bindProfileAccount('企业微信')">绑定</a-button></div></div></section>
      <section class="profile-settings-section"><header><strong>登录安全</strong><span>定期更新密码可以降低账号风险</span></header><div class="profile-security-list"><div><span class="profile-security-icon password"><IconLock /></span><span><b>登录密码</b><small>已设置，修改后请使用新密码登录</small></span><a-tag color="green">已设置</a-tag><a-button type="outline" size="small" @click="openPasswordModal">修改密码</a-button></div></div></section>
      <template #footer><div class="profile-editor-footer"><a-button @click="profileDrawerVisible = false">取消</a-button><a-button type="primary" @click="saveProfile">保存</a-button></div></template>
    </a-modal>
    <a-modal v-model:visible="teamMemberModalVisible" :title="teamMemberEditingId ? '编辑成员账号' : '添加成员账号'" ok-text="保存" cancel-text="取消" :on-before-ok="saveTeamMember"><a-form layout="vertical"><div class="form-grid"><a-form-item label="姓名" required><a-input v-model="teamMemberDraft.name" allow-clear placeholder="填写成员姓名" /></a-form-item><a-form-item label="成员类型" required><a-select v-model="teamMemberDraft.type"><a-option value="内部成员">内部成员</a-option><a-option value="外部协作成员">外部协作成员</a-option></a-select></a-form-item><a-form-item label="账号" required><a-input v-model="teamMemberDraft.account" allow-clear placeholder="邮箱或成员账号" /></a-form-item><a-form-item label="手机号"><a-input v-model="teamMemberDraft.phone" allow-clear maxlength="11" placeholder="11 位手机号" /></a-form-item><a-form-item label="状态" required><a-select v-model="teamMemberDraft.status"><a-option value="启用">启用</a-option><a-option value="禁用">禁用</a-option></a-select></a-form-item></div><a-form-item label="职务" required><a-input v-model="teamMemberDraft.role" allow-clear placeholder="例如：前端开发、客户联系人" /></a-form-item><a-form-item :label="teamMemberEditingId ? '登录密码（留空不修改）' : '登录密码'" :required="!teamMemberEditingId"><a-input-password v-model="teamMemberDraft.password" allow-clear autocomplete="new-password" placeholder="至少 8 个字符"><template #prefix><IconLock /></template></a-input-password></a-form-item><div class="team-member-binding-fields"><span><b>微信绑定</b><small>{{ teamMemberDraft.wechatBound ? '已绑定，可使用微信授权登录' : '未绑定' }}</small></span><a-switch v-model="teamMemberDraft.wechatBound" /><span><b>企业微信绑定</b><small>{{ teamMemberDraft.wecomBound ? '已绑定，可使用企业微信授权登录' : '未绑定' }}</small></span><a-switch v-model="teamMemberDraft.wecomBound" /></div><p class="team-member-modal-note"><IconInfoCircle />新成员默认分配“工作台”权限，可在成员列表中继续设置权限。</p></a-form></a-modal>
    <a-modal v-model:visible="teamPermissionsModalVisible" title="权限设置" ok-text="保存权限" cancel-text="取消" :on-before-ok="saveTeamPermissions"><div v-if="teamPermissionsMember" class="team-permission-modal"><header><a-avatar :size="38">{{ teamPermissionsMember.name.slice(0, 1) }}</a-avatar><div><strong>{{ teamPermissionsMember.name }}</strong><small>{{ teamPermissionsMember.account }} · {{ teamPermissionsMember.type }}</small></div></header><a-checkbox-group v-model="teamPermissionsDraft" class="team-permission-options"><a-checkbox v-for="permission in teamPermissionOptions" :key="permission" :value="permission">{{ permission }}</a-checkbox></a-checkbox-group><p class="team-member-modal-note"><IconInfoCircle />权限变更会影响该成员可访问的页面和操作范围。</p></div></a-modal>
    <a-modal v-model:visible="projectStageModalVisible" :title="projectStageEditingId ? '编辑项目阶段' : '添加项目类型'" width="720px" ok-text="保存配置" cancel-text="取消" :on-before-ok="saveProjectStageConfig">
      <a-form class="project-stage-config-form" layout="vertical">
        <div class="form-grid">
          <a-form-item label="项目类型" required><a-input v-model="projectStageDraft.type" maxlength="30" show-word-limit allow-clear placeholder="例如：标准软件项目" /></a-form-item>
          <a-form-item label="适用说明"><a-input v-model="projectStageDraft.description" maxlength="120" show-word-limit allow-clear placeholder="说明该阶段方案的适用范围" /></a-form-item>
        </div>
        <section class="project-stage-builder">
          <header><div><strong>阶段流程</strong><small>新建该类型项目时，按此顺序生成项目阶段</small></div><a-button type="outline" size="small" @click="addProjectStage"><IconPlus />添加阶段</a-button></header>
          <div class="project-stage-list">
            <article v-for="(stage, index) in projectStageDraft.stages" :key="stage.id" class="project-stage-item">
              <header><span class="project-stage-index">{{ index + 1 }}</span><strong>阶段 {{ index + 1 }}</strong><span class="project-stage-actions"><a-tooltip content="上移阶段"><a-button type="text" size="small" :disabled="index === 0" :aria-label="`上移阶段 ${index + 1}`" @click="moveProjectStage(index, -1)"><IconUp /></a-button></a-tooltip><a-tooltip content="下移阶段"><a-button type="text" size="small" :disabled="index === projectStageDraft.stages.length - 1" :aria-label="`下移阶段 ${index + 1}`" @click="moveProjectStage(index, 1)"><IconDown /></a-button></a-tooltip><a-tooltip content="删除阶段"><a-button type="text" status="danger" size="small" :aria-label="`删除阶段 ${index + 1}`" @click="removeProjectStage(stage)"><IconDelete /></a-button></a-tooltip></span></header>
              <div class="form-grid"><a-form-item label="阶段名称" required><a-input v-model="stage.name" maxlength="24" show-word-limit placeholder="例如：需求分析" /></a-form-item><a-form-item label="阶段交付物"><a-input v-model="stage.deliverable" maxlength="60" show-word-limit placeholder="例如：需求规格说明、范围清单" /></a-form-item></div>
              <a-form-item label="工作说明"><a-textarea v-model="stage.description" maxlength="160" show-word-limit :auto-size="{ minRows: 2, maxRows: 4 }" placeholder="说明该阶段的主要工作和完成标准" /></a-form-item>
            </article>
          </div>
        </section>
      </a-form>
    </a-modal>
    <a-modal v-model:visible="passwordModalVisible" modal-class="password-editor-modal" width="480px" title="修改密码" ok-text="保存密码" cancel-text="取消" :on-before-ok="submitPasswordChange" @cancel="closePasswordModal">
      <a-form layout="vertical" @submit.prevent="submitPasswordChange">
        <a-form-item label="当前密码" required><a-input-password v-model="passwordDraft.currentPassword" allow-clear autocomplete="current-password" placeholder="请输入当前密码" @input="passwordError = ''"><template #prefix><IconLock /></template></a-input-password></a-form-item>
        <a-form-item label="新密码" required><a-input-password v-model="passwordDraft.newPassword" allow-clear autocomplete="new-password" placeholder="至少 8 个字符" @input="passwordError = ''"><template #prefix><IconLock /></template></a-input-password></a-form-item>
        <a-form-item label="确认新密码" required><a-input-password v-model="passwordDraft.confirmPassword" allow-clear autocomplete="new-password" placeholder="请再次输入新密码" @input="passwordError = ''"><template #prefix><IconLock /></template></a-input-password></a-form-item>
        <p v-if="passwordError" class="password-error" role="alert">{{ passwordError }}</p>
        <p class="password-help"><IconInfoCircle />当前为演示环境，密码不会保存在浏览器本地。</p>
      </a-form>
    </a-modal>
    <a-modal v-model:visible="laneModalVisible" :title="laneEditingKey ? '编辑看板列' : '添加看板列'" ok-text="保存" cancel-text="取消" :ok-button-props="{ disabled: !laneDraft.title.trim() }" @ok="saveLane"><a-form layout="vertical"><a-form-item label="列名称" required><a-input v-model="laneDraft.title" maxlength="20" show-word-limit placeholder="例如：待客户确认" /></a-form-item><a-form-item label="列颜色"><a-select v-model="laneDraft.color"><a-option v-for="option in laneColorOptions" :key="option.value" :value="option.value">{{ option.label }}</a-option></a-select></a-form-item></a-form></a-modal>
    <a-modal v-model:visible="laneAssignModalVisible" title="批量指定执行人" ok-text="确定" cancel-text="取消" :ok-button-props="{ disabled: !laneAssignExecutors.length }" @ok="applyLaneAssignees">
      <a-form layout="vertical"><a-form-item label="任务范围"><span>{{ laneAssignTarget?.title || '当前列' }} · {{ laneAssignTarget ? orderedBoardTasks(laneAssignTarget).length : 0 }} 个任务</span></a-form-item><a-form-item label="执行人" required><a-select v-model="laneAssignExecutors" multiple allow-search placeholder="搜索并选择执行人"><a-option v-for="member in teamMembers" :key="member" :value="member">{{ member }}</a-option></a-select></a-form-item></a-form>
    </a-modal>

    <a-modal :visible="Boolean(selectedTask)" class="task-detail-modal" width="880px" :mask-closable="false" :body-style="{ maxHeight: 'calc(100vh - 236px)', overflowY: 'auto' }" @cancel="selectedTask = null">
      <template #title>
        <div class="task-drawer-heading">
          <div v-if="taskTitleEditing" class="task-title-edit-row">
            <a-input v-model="taskTitleDraft" autofocus aria-label="编辑任务标题" @blur="saveTaskTitle" @keyup.enter="saveTaskTitle" @keyup.esc="cancelTaskTitleEdit" />
          </div>
          <div v-else class="task-title-view-row" role="button" tabindex="0" aria-label="点击编辑任务标题" @click="startTaskTitleEdit" @keydown.enter.prevent="startTaskTitleEdit" @keydown.space.prevent="startTaskTitleEdit">
            <strong>{{ selectedTask?.title || '任务详情' }}</strong>
            <a-tag v-if="selectedTask" class="task-drawer-status-tag" :color="phaseStatusColor(selectedTask.status)">{{ selectedTask.status }}</a-tag>
          </div>
        </div>
      </template>
      <template v-if="selectedTask">
        <section class="task-detail-fields">
          <div class="task-meta-field">
            <span>状态</span>
            <a-select :model-value="selectedTask.status" aria-label="调整任务状态" @change="value => requestTaskStatusChange(selectedTask.id, value)">
              <a-option v-for="status in statusOptions.slice(1)" :key="status" :value="status">{{ status }}</a-option>
            </a-select>
          </div>
          <div class="task-meta-field">
            <span>优先级</span>
            <a-select :model-value="selectedTask.priority" aria-label="调整任务优先级" @change="value => updateTaskPriority(selectedTask.id, value)">
              <a-option v-for="priority in ['P0', 'P1', 'P2']" :key="priority" :value="priority">{{ priority }}</a-option>
            </a-select>
          </div>
          <div class="task-meta-field">
            <span>确认人</span>
            <a-select :model-value="selectedTask.confirmer || selectedTask.owner" allow-search aria-label="调整任务确认人" @change="value => updateTaskConfirmer(selectedTask.id, value)">
              <a-option v-for="member in teamMembers" :key="member" :value="member">{{ member }}</a-option>
            </a-select>
          </div>
          <div class="task-meta-field">
            <span>执行人</span>
            <a-select :model-value="selectedTask.executors || [selectedTask.owner]" multiple :max-tag-count="2" allow-search aria-label="调整任务执行人" @change="value => updateTaskExecutors(selectedTask.id, value)">
              <a-option v-for="member in teamMembers" :key="member" :value="member">{{ member }}</a-option>
            </a-select>
          </div>
          <div class="task-meta-field">
            <span>截止时间</span>
            <a-date-picker :model-value="selectedTask.due" value-format="YYYY-MM-DD" format="YYYY-MM-DD" :allow-clear="false" aria-label="调整任务截止时间" @change="value => updateTaskDueDate(selectedTask.id, value)" />
          </div>
          <div class="task-meta-field">
            <span>所属期号</span>
            <a-select :model-value="selectedTask.phase" allow-search aria-label="调整任务所属期号" @change="value => updateTaskPhase(selectedTask.id, value)">
              <a-option v-for="phase in taskPhaseOptions" :key="phase.key" :value="phase.key">{{ phase.code }} {{ phase.name }}</a-option>
            </a-select>
          </div>
        </section>
        <section class="drawer-section task-description-section">
          <header><strong>任务描述</strong></header>
          <RichTextEditor v-model="taskDescriptionDraft" placeholder="补充任务目标、验收标准、依赖或交付物" @blur="saveTaskDescription" />
        </section>
        <section class="drawer-section task-subtasks-section">
          <header><strong>子任务 <span>{{ selectedTask.subtasks?.length || 0 }} 项</span></strong><a-button v-if="!taskDrawerSubtaskAdding" class="task-subtask-add-button" type="outline" size="small" @click="startTaskDrawerSubtask"><IconPlus />添加子任务</a-button></header>
          <div v-if="taskDrawerSubtaskAdding" class="task-drawer-subtask-form">
            <a-input v-model="subtaskDraft" autofocus placeholder="填写子任务名称" @keyup.enter="addTaskDrawerSubtask" />
            <a-select v-model="subtaskAssigneeDraft" class="subtask-assignee-select" allow-search placeholder="负责人"><a-option v-for="member in teamMembers" :key="member" :value="member">{{ member }}</a-option></a-select>
            <a-button type="primary" aria-label="确认添加子任务" @click="addTaskDrawerSubtask"><IconCheckCircle /></a-button>
            <a-button type="text" aria-label="取消添加子任务" @click="cancelTaskDrawerSubtask">取消</a-button>
          </div>
          <div v-if="selectedTask.subtasks?.length" class="task-subtask-list">
            <div v-for="subtask in selectedTask.subtasks" :key="subtask.id" class="task-subtask-row" :class="{ dragging: draggedSubtaskId === subtask.id, editing: subtaskEditingId === subtask.id }" @dragover.prevent @drop="dropSubtask(subtask, $event)">
              <span class="task-subtask-drag" draggable="true" title="拖动排序" @dragstart="startSubtaskDrag(subtask, $event)" @dragend="draggedSubtaskId = null"><IconDragDotVertical /></span>
              <template v-if="subtaskEditingId === subtask.id">
                <a-input v-model="subtaskEditDraft.title" class="task-subtask-edit-input" size="small" autofocus @keyup.enter="saveSubtaskEdit(subtask)" @keyup.esc="cancelSubtaskEdit" />
                <a-select v-model="subtaskEditDraft.assignee" class="task-subtask-assignee" size="small" allow-search><a-option v-for="member in teamMembers" :key="member" :value="member">{{ member }}</a-option></a-select>
                <span class="task-subtask-actions"><a-tooltip content="保存"><a-button type="text" size="small" aria-label="保存子任务" @click="saveSubtaskEdit(subtask)"><IconCheckCircle /></a-button></a-tooltip><a-tooltip content="取消"><a-button type="text" size="small" aria-label="取消编辑" @click="cancelSubtaskEdit"><IconClose /></a-button></a-tooltip></span>
              </template>
              <template v-else>
                <a-checkbox :model-value="subtask.status === '已完成'" @change="toggleSubtask(selectedTask.id, subtask)"><span class="task-subtask-title">{{ subtask.title }}</span></a-checkbox>
                <a-select :model-value="subtask.assignee || selectedTask.owner" class="task-subtask-assignee" size="small" allow-search @change="value => updateSubtaskAssignee(subtask, value)"><a-option v-for="member in teamMembers" :key="member" :value="member">{{ member }}</a-option></a-select>
                <a-tag :color="phaseStatusColor(subtask.status)">{{ subtask.status }}</a-tag>
                <span class="task-subtask-actions"><a-tooltip content="编辑"><a-button type="text" size="small" aria-label="编辑子任务" @click="startSubtaskEdit(subtask)"><IconEdit /></a-button></a-tooltip><a-tooltip content="删除"><a-button type="text" size="small" aria-label="移除子任务" @click="removeTaskDrawerSubtask(subtask)"><IconDelete /></a-button></a-tooltip></span>
              </template>
            </div>
          </div>
          <p v-else class="task-subtasks-empty">暂无子任务，可点击上方按钮添加。</p>
        </section>
        <section class="drawer-section task-collaboration-section">
          <div class="task-collaboration-tabs"><button :class="{ active: taskCollaborationTab === 'comments' }" @click="taskCollaborationTab = 'comments'">评论与回复 <b>{{ selectedTaskComments.length }}</b></button><button :class="{ active: taskCollaborationTab === 'activities' }" @click="taskCollaborationTab = 'activities'">操作记录 <b>{{ selectedTaskActivities.length }}</b></button></div>
          <div v-if="taskCollaborationTab === 'comments'">
            <div v-if="selectedTaskComments.length" class="task-comment-list"><article v-for="comment in selectedTaskComments" :key="comment.id" class="task-comment-item" :class="{ 'task-comment-reply': comment.parentId }"><a-avatar :size="28" class="task-comment-avatar">{{ comment.author.slice(0, 1) }}</a-avatar><div class="task-comment-body"><div class="task-comment-heading"><span><b>{{ comment.author }}</b><small v-if="comment.edited">已编辑</small><small>{{ comment.editedAt || comment.createdAt }}</small></span><span class="task-comment-meta"><template v-if="comment.author === accountProfile.nickname"><a-tooltip content="编辑评论"><a-button type="text" size="small" aria-label="编辑评论" @click="editTaskComment(comment)"><IconEdit /></a-button></a-tooltip><a-tooltip content="删除评论"><a-button type="text" size="small" status="danger" aria-label="删除评论" @click="deleteTaskComment(comment)"><IconDelete /></a-button></a-tooltip></template></span></div><template v-if="commentEditingId === comment.id"><RichTextEditor v-model="commentEditDraft" class="task-comment-inline-editor" placeholder="编辑评论内容" /><div class="task-comment-edit-actions"><a-button type="text" size="small" @click="cancelTaskCommentEdit">取消</a-button><a-button type="primary" size="small" @click="saveTaskCommentEdit(comment)">保存</a-button></div></template><template v-else><div class="rich-text-display" v-html="comment.content" /><a-button type="text" size="small" @click="replyToComment(comment)">回复</a-button></template></div></article></div>
            <a-empty v-else description="暂无评论" />
            <div class="task-comment-editor"><span v-if="replyingTo" class="replying-hint">回复 {{ replyingTo.author }}<a-button type="text" size="small" @click="replyingTo = null; commentDraft = ''">取消</a-button></span><a-input v-model="commentDraft" allow-clear placeholder="写下评论，Enter 发送" @press-enter="addTaskComment"><template #prefix><IconMessage /></template></a-input></div>
          </div>
          <div v-else><div v-if="selectedTaskActivities.length" class="task-activity-list"><div v-for="activity in selectedTaskActivities" :key="activity.id"><span><b>{{ activity.action }}</b><small>{{ activity.detail }}</small></span><em>{{ activity.operator }} · {{ activity.createdAt }}</em></div></div><a-empty v-else description="暂无操作记录" /></div>
        </section>
      </template>
      <template #footer>
        <div class="task-detail-footer"><span>修改将记录操作日志</span><div class="drawer-footer"><a-button class="task-detail-close-button" @click="selectedTask = null">关闭</a-button><template v-if="selectedTask?.status === '待确认'"><a-button class="task-detail-secondary-button" @click="handleTaskConfirmation(false)">确认不通过</a-button><a-button class="task-detail-primary-button" type="primary" @click="handleTaskConfirmation(true)">确认通过</a-button></template><a-button v-else class="task-detail-primary-button" type="primary" @click="submitTaskResult">提交结果</a-button></div></div>
      </template>
    </a-modal>
    <a-modal v-model:visible="mediaPreviewVisible" :title="mediaPreview?.alt || '媒体预览'" width="880px" footer="false" @cancel="closeMediaPreview"><div class="rich-media-preview"><img v-if="mediaPreview?.type === 'img'" :src="mediaPreview.src" :alt="mediaPreview.alt" /><video v-else-if="mediaPreview?.type === 'video'" :src="mediaPreview.src" controls autoplay /><audio v-else-if="mediaPreview?.type === 'audio'" :src="mediaPreview.src" controls autoplay /><div v-else-if="mediaPreview?.type === 'file'" class="rich-file-preview"><IconFile /><strong>{{ mediaPreview.alt }}</strong><a-button type="primary" :href="mediaPreview.src" :download="mediaPreview.download">下载附件</a-button></div></div></a-modal>
    <a-drawer v-model:visible="phaseDrawerVisible" width="620px" title="期号设置"><div class="phase-settings-tabs"><button v-for="tab in [{ key: 'basic', label: '基本信息' }, { key: 'stats', label: '数据统计' }, { key: 'hours', label: '工时统计' }, { key: 'files', label: '项目文件' }, { key: 'members', label: '期号成员' }]" :key="tab.key" :class="{ active: phaseSettingsTab === tab.key }" @click="phaseSettingsTab = tab.key">{{ tab.label }}</button></div><template v-if="phaseSettingsTab === 'basic'"><div class="phase-detail-hero"><h2>{{ selectedPhase.code }}</h2><p>{{ selectedPhase.projectName }}-{{ selectedPhase.name }}</p><a-button v-if="!phaseEditing" class="phase-edit-button" type="outline" size="small" @click="startPhaseEdit"><IconEdit />编辑基本信息</a-button></div><div v-if="!phaseEditing" class="phase-descriptions"><p>客户：{{ selectedPhase.customerCode }}-{{ selectedPhase.customerName }}</p><p>项目：{{ selectedPhase.projectCode }} {{ selectedPhase.projectName }}</p><p>负责人：{{ selectedPhase.owner }}</p><p>计划时间：{{ selectedPhase.dates }}</p></div><a-form v-else class="phase-basic-form" layout="vertical"><a-form-item label="期号" required><a-input v-model="phaseDraft.phaseNumber" maxlength="20" placeholder="填写当前项目下唯一的期号" /></a-form-item><a-form-item label="期号名称" required><a-input v-model="phaseDraft.name" /></a-form-item><div class="form-grid"><a-form-item label="状态"><a-select v-model="phaseDraft.status"><a-option v-for="status in ['未开始', '进行中', '已完成', '延期']" :key="status" :value="status">{{ status }}</a-option></a-select></a-form-item><a-form-item label="负责人"><a-select v-model="phaseDraft.owner" allow-search placeholder="搜索负责人"><a-option v-for="member in teamMembers" :key="member" :value="member">{{ member }}</a-option></a-select></a-form-item></div><a-form-item label="计划时间"><a-range-picker v-model="phaseDraft.datesRange" value-format="YYYY-MM-DD" format="YYYY-MM-DD" :placeholder="['开始日期', '结束日期']" allow-clear /></a-form-item><div class="phase-form-actions"><a-button @click="phaseEditing = false">取消</a-button><a-button type="primary" @click="savePhaseBasicInfo">保存</a-button></div></a-form></template><template v-else-if="phaseSettingsTab === 'stats'"><section class="phase-settings-panel"><header><strong>期号数据统计</strong><span>{{ selectedPhase.code }} · {{ selectedPhase.name }}</span></header><div class="phase-stat-grid"><article><strong>{{ phaseTaskStats.total }}</strong><span>任务总数</span></article><article><strong>{{ phaseTaskStats.incomplete }}</strong><span>未完成</span></article><article><strong>{{ phaseTaskStats.pending }}</strong><span>待确认</span></article><article><strong>{{ phaseTaskStats.completed }}</strong><span>已完成</span></article></div><div class="phase-stat-grid phase-stat-grid-secondary"><article><strong>{{ phaseTaskStats.overdue }}</strong><span>已逾期</span></article><article><strong>{{ phaseTaskStats.dueSoon }}</strong><span>7天内到期</span></article><article><strong>{{ phaseTaskStats.owners }}</strong><span>负责人</span></article><article><strong>{{ phaseTaskStats.p0 }}</strong><span>P0任务</span></article></div><div class="phase-stat-summary"><span>平均计划周期 <b>{{ phaseTaskStats.averageCycle }}天</b></span><span>统计范围：当前期号全部任务</span></div></section></template><template v-else-if="phaseSettingsTab === 'hours'"><section class="phase-settings-panel"><header><div><strong>工时明细</strong><span>按成员与时间范围筛选</span></div></header><div class="worklog-filters"><a-select v-model="worklogMemberFilter" allow-search><a-option value="全部成员">全部成员</a-option><a-option v-for="member in teamMembers" :key="member" :value="member">{{ member }}</a-option></a-select><a-range-picker v-model="worklogDateRange" value-format="YYYY-MM-DD" format="YYYY-MM-DD" :placeholder="['开始日期', '结束日期']" allow-clear /></div><div class="worklog-member-summary"><div v-for="item in worklogMemberSummary" :key="item.member"><span>{{ item.member }}</span><strong>{{ item.hours }}h</strong></div><span v-if="!worklogMemberSummary.length">当前筛选暂无工时</span></div><div class="worklog-list"><div class="worklog-row worklog-row-heading"><span>日期</span><span>成员</span><span>工时</span><span>工作内容</span></div><div v-for="log in filteredWorklogs" :key="log.id" class="worklog-row"><span>{{ log.date }}</span><span>{{ log.member }}</span><strong>{{ log.hours }}h</strong><span>{{ log.content }}</span></div><a-empty v-if="!filteredWorklogs.length" description="暂无工时记录" /></div></section></template><template v-else-if="phaseSettingsTab === 'files'"><section class="phase-settings-panel"><header><div><strong>项目文件</strong><span>当前期号交付资料与协作附件</span></div><a-button type="primary" size="small" @click="openPhaseFileModal"><IconPlus />添加文件</a-button></header><div class="phase-file-list"><div v-for="file in currentPhaseFiles" :key="file.id" class="phase-file-item"><IconFile /><span><b>{{ file.name }}</b><small>{{ file.type }} · {{ file.size }} · 更新于 {{ file.updated }}</small></span><span class="file-actions"><a-tooltip content="预览文件"><a-button type="text" size="small" @click="previewPhaseFile(file)"><IconInfoCircle /></a-button></a-tooltip><a-tooltip content="编辑文件"><a-button type="text" size="small" @click="openPhaseFileEdit(file)"><IconEdit /></a-button></a-tooltip><a-tooltip content="下载文件"><a-button type="text" size="small" @click="notify(`已准备下载：${file.name}`)"><IconExport /></a-button></a-tooltip><a-tooltip content="删除文件"><a-button type="text" size="small" @click="removePhaseFile(file)"><IconDelete /></a-button></a-tooltip></span></div><a-empty v-if="!currentPhaseFiles.length" description="暂无项目文件" /></div></section></template><template v-else><section class="phase-settings-panel"><header><div><strong>期号成员</strong><span>管理当前期号的协作成员与职责</span></div><a-button type="primary" size="small" @click="openPhaseMemberModal"><IconPlus />添加成员</a-button></header><div class="phase-member-list"><div v-for="member in currentPhaseMembers" :key="member.id" class="phase-member-item"><a-avatar :size="32">{{ member.name.slice(0, 1) }}</a-avatar><span><b>{{ member.rawName || member.name }}</b><small>成员类型：{{ member.type || "内部成员" }}</small><small>期号角色：{{ member.baseRole || member.role }}</small><small>加入时间：{{ member.joinedAt || "未记录" }}</small><small v-if="member.permissions?.length">期号权限：{{ member.permissions.join("、") }}</small></span><span class="phase-member-actions"><a-tooltip content="权限设置"><a-button type="text" size="small" @click="openPhaseMemberEditor(member)"><IconSettings /></a-button></a-tooltip><a-tooltip content="移除成员"><a-button type="text" size="small" @click="deletePhaseMember(member)"><IconDelete /></a-button></a-tooltip></span></div><a-empty v-if="!currentPhaseMembers.length" description="暂无期号成员" /></div></section></template><template #footer><div class="drawer-footer"><a-button @click="phaseDrawerVisible = false">取消</a-button><a-button type="primary" @click="confirmPhaseSettings">确定</a-button></div></template></a-drawer>
<a-modal v-model:visible="projectCreateModalVisible" :title="projectCreateMode === 'edit' ? (projectCreateType === 'project' ? '编辑项目' : '编辑期号') : (projectCreateType === 'customer' ? '添加客户' : '添加项目或期号')" :ok-text="projectCreateMode === 'edit' ? '保存' : '添加'" cancel-text="取消" @ok="saveProjectCreate">
      <a-form layout="vertical">
        <a-form-item v-if="projectCreateMode === 'create'" label="添加类型">
          <a-select v-model="projectCreateType" @change="switchProjectCreateType">
            <a-option value="customer">客户</a-option><a-option value="project">项目</a-option><a-option value="phase">期号</a-option>
          </a-select>
        </a-form-item>
        <a-form-item v-if="projectCreateType !== 'customer'" label="客户"><a-select v-model="projectCreateDraft.customerKey" allow-search placeholder="选择客户" :disabled="projectCreateMode === 'edit'" @change="changeProjectCreateCustomer"><a-option v-for="customer in createCustomerOptions" :key="customer.key" :value="customer.key">{{ customer.code }}-{{ customer.name }}</a-option></a-select></a-form-item>
        <template v-if="projectCreateType === 'customer'"><div class="form-grid"><a-form-item label="客户编号" required><a-input v-model="projectCreateDraft.customerCode" placeholder="例如 1508" /></a-form-item><a-form-item label="客户名称" required><a-input v-model="projectCreateDraft.customerName" placeholder="填写客户名称" /></a-form-item></div></template>
        <template v-else-if="projectCreateType === 'project'"><div class="form-grid"><a-form-item label="项目编号"><a-input v-model="projectCreateDraft.projectCode" placeholder="例如 03" /></a-form-item><a-form-item label="项目名称"><a-input v-model="projectCreateDraft.projectName" placeholder="填写项目名称" /></a-form-item></div></template>
        <template v-else><a-form-item label="项目"><a-select v-model="projectCreateDraft.projectKey" allow-search placeholder="选择项目" :disabled="projectCreateMode === 'edit'"><a-option v-for="project in createProjectOptions" :key="project.key" :value="project.key">{{ project.code }}-{{ project.name }}</a-option></a-select></a-form-item><div class="form-grid"><a-form-item label="期号编号"><a-input v-model="projectCreateDraft.phaseCode" placeholder="例如 03，或填写完整编码" /></a-form-item><a-form-item label="期号名称"><a-input v-model="projectCreateDraft.phaseName" placeholder="填写期号名称" /></a-form-item><a-form-item label="状态"><a-select v-model="projectCreateDraft.phaseStatus"><a-option v-for="status in ['未开始', '进行中', '已完成', '延期']" :key="status" :value="status">{{ status }}</a-option></a-select></a-form-item><a-form-item label="负责人"><a-select v-model="projectCreateDraft.phaseOwner" allow-search placeholder="搜索负责人"><a-option v-for="member in teamMembers" :key="member" :value="member">{{ member }}</a-option></a-select></a-form-item></div><a-form-item label="计划时间"><a-range-picker v-model="projectCreateDraft.phaseDatesRange" value-format="YYYY-MM-DD" format="YYYY-MM-DD" :placeholder="['开始日期', '结束日期']" allow-clear /></a-form-item></template>
      </a-form>
    </a-modal>
    <a-modal v-model:visible="phaseFileModalVisible" :title="phaseFileEditingId ? '编辑项目文件' : '添加项目文件'" :ok-text="phaseFileEditingId ? '保存' : '添加'" cancel-text="取消" :ok-button-props="{ disabled: !phaseFileDraft.file }" @ok="savePhaseFile"><div class="phase-file-upload-panel"><input ref="phaseFileInput" class="phase-file-input" type="file" @change="handlePhaseFileChange" /><p v-if="phaseFileDraft.current" class="phase-file-current">当前文件：{{ phaseFileDraft.current.name }}<small>{{ phaseFileDraft.current.type }} · {{ phaseFileDraft.current.size }}</small></p><a-button type="outline" long @click="phaseFileInput?.click()"><IconImport />选择替换文件</a-button><p v-if="phaseFileDraft.file" class="phase-file-selected"><IconFile /><strong>{{ phaseFileDraft.file.name }}</strong><span>{{ formatFileSize(phaseFileDraft.file.size) }}</span></p><p v-else class="phase-file-empty">请选择要添加到当前期号的文件</p></div></a-modal><a-modal v-model:visible="phaseFilePreviewVisible" :title="phaseFilePreview?.name || '文件预览'" width="760px" footer="false" @cancel="closePhaseFilePreview"><div class="phase-file-preview"><iframe v-if="phaseFilePreviewUrl && phaseFilePreview?.type === 'PDF'" :src="phaseFilePreviewUrl" title="文件预览" /><img v-else-if="phaseFilePreviewUrl && phaseFilePreview?.source?.type?.startsWith('image/')" :src="phaseFilePreviewUrl" alt="文件预览" /><div v-else class="phase-file-preview-empty"><IconFile /><strong>{{ phaseFilePreview?.name }}</strong><span>{{ phaseFilePreview?.type }} · {{ phaseFilePreview?.size }}</span><small>当前文件暂不支持在线预览，请使用下载操作查看。</small></div></div></a-modal>
    <a-modal v-model:visible="onlineFilePreviewVisible" :title="phaseFilePreview?.name || '在线文件查看'" width="860px" :footer="false" @cancel="closeOnlinePhaseFilePreview">
      <div class="phase-file-preview online-file-preview">
        <article v-if="phaseFilePreview?.type === 'DOCX'" class="online-document-preview" v-html="onlineDocumentPreviewHtml"></article>
        <div v-else-if="phaseFilePreview?.type === 'XLSX'" class="online-sheet-preview">
          <table><thead><tr><th></th><th v-for="column in onlineSheetPreviewColumns" :key="column">{{ column }}</th></tr></thead><tbody><tr v-for="row in onlineSheetPreviewRows" :key="row.number"><th>{{ row.number }}</th><td v-for="(cell, index) in row.cells" :key="`${row.number}-${index}`">{{ cell }}</td></tr></tbody></table>
        </div>
        <div v-else class="online-presentation-preview"><article v-for="(slide, index) in phaseFilePreview?.slides || []" :key="slide.id || index"><small>第 {{ index + 1 }} 页</small><strong>{{ slide.title || '无标题' }}</strong><p>{{ slide.body || '暂无正文' }}</p></article></div>
      </div>
    </a-modal>
    <a-modal v-model:visible="phaseUploadModalVisible" title="上传文件" ok-text="上传" cancel-text="取消" :ok-button-props="{ disabled: !phaseFileDraft.file }" @ok="savePhaseFile">
      <div class="phase-file-upload-panel">
        <input ref="phaseUploadInput" class="phase-file-input" type="file" :accept="phaseFileAccept" @change="handlePhaseFileChange" />
        <a-button type="outline" long @click="phaseUploadInput?.click()"><IconUpload />选择本地文件</a-button>
        <p class="phase-file-upload-note"><IconInfoCircle />支持 Word、Excel、PPT、PDF、图片及压缩包，单个文件不超过 50 MB</p>
        <p v-if="phaseFileDraft.file" class="phase-file-selected"><IconFile /><strong>{{ phaseFileDraft.file.name }}</strong><span>{{ formatFileSize(phaseFileDraft.file.size) }}</span></p>
      </div>
    </a-modal>
<a-modal v-model:visible="phaseMemberModalVisible" :title="phaseMemberEditingId ? '编辑期号成员' : '添加期号成员'" :ok-text="phaseMemberEditingId ? '保存权限' : (phaseMemberDraft.memberType === 'external' ? '发送邀请' : '添加')" cancel-text="取消" @ok="savePhaseMember"><a-form layout="vertical"><a-form-item label="成员类型"><a-radio-group v-model="phaseMemberDraft.memberType" type="button"><a-radio value="internal"><IconUser />内部成员</a-radio><a-radio value="external"><IconUserAdd />邀请外部人员</a-radio></a-radio-group></a-form-item><template v-if="phaseMemberDraft.memberType === 'internal'"><a-form-item label="成员"><a-select v-model="phaseMemberDraft.name" allow-search placeholder="搜索成员姓名"><a-option v-for="name in teamMembers" :key="name" :value="name">{{ name }}</a-option></a-select></a-form-item></template><template v-else><div class="external-member-note"><IconInfoCircle /><span>先配置外部人员和期号权限，再生成可复制的专属邀请链接。</span></div><a-form-item label="姓名" required><a-input v-model="phaseMemberDraft.name" placeholder="填写客户或兼职人员姓名" /></a-form-item><div class="form-grid"><a-form-item label="人员来源"><a-select v-model="phaseMemberDraft.externalType"><a-option value="客户">客户</a-option><a-option value="兼职">兼职</a-option><a-option value="合作方">合作方</a-option></a-select></a-form-item><a-form-item label="联系方式" required><a-input v-model="phaseMemberDraft.contact" placeholder="手机号或邮箱" /></a-form-item></div><a-form-item label="邀请链接" required><div class="invite-link-row"><a-input v-model="phaseMemberDraft.inviteLink" readonly placeholder="点击右侧按钮生成邀请链接" /><a-tooltip content="生成或重新生成"><a-button type="outline" aria-label="生成或重新生成邀请链接" @click="generatePhaseMemberInviteLink"><IconRefresh /></a-button></a-tooltip><a-tooltip content="复制邀请链接"><a-button type="outline" aria-label="复制邀请链接" :disabled="!phaseMemberDraft.inviteLink" @click="copyPhaseMemberInviteLink"><IconCopy /></a-button></a-tooltip></div></a-form-item></template><a-form-item label="期号角色"><a-select v-model="phaseMemberDraft.baseRole"><a-option value="项目负责人">项目负责人</a-option><a-option value="项目成员">项目成员</a-option><a-option value="客户联系人">客户联系人</a-option><a-option value="外部协作者">外部协作者</a-option></a-select></a-form-item><a-form-item label="期号权限" required><a-checkbox-group v-model="phaseMemberDraft.permissions"><a-checkbox value="项目资料">项目资料</a-checkbox><a-checkbox value="任务查看">任务查看</a-checkbox><a-checkbox value="任务执行">任务执行</a-checkbox><a-checkbox value="文件查看">文件查看</a-checkbox><a-checkbox value="文件管理">文件管理</a-checkbox></a-checkbox-group></a-form-item></a-form></a-modal>
    <a-drawer :visible="Boolean(selectedProject)" width="620px" title="项目详情" @cancel="selectedProject = null"><template v-if="selectedProject"><div class="project-detail-hero"><span>{{ selectedProject.customerCode }}-{{ selectedProject.code }}</span><h2>{{ selectedProject.name }}</h2><p>{{ selectedProject.customerCode }}-{{ selectedProject.customerName }}</p></div><section class="project-public-section"><header><div><strong>项目公共资料</strong><small>项目级公共信息，供项目成员协作查看</small></div><div class="project-public-actions"><a-button type="text" size="small" @click="openProjectInfoEditor"><IconEdit />编辑资料</a-button></div></header><div v-if="selectedProjectPublicDocument" class="rich-text-display project-public-document" v-html="selectedProjectPublicDocument" /><a-empty v-else description="暂无项目公共资料" /></section></template></a-drawer>
    <a-modal v-model:visible="projectInfoModalVisible" title="编辑项目公共资料" ok-text="保存" cancel-text="取消" @ok="saveProjectInfo"><a-form layout="vertical"><a-form-item label="资料内容"><RichTextEditor v-model="projectInfoDraft" placeholder="补充客户资料、服务器信息、代码仓库、部署地址等项目公共信息" /></a-form-item></a-form></a-modal>
    <a-modal v-model:visible="helpVisible" modal-class="help-modal" width="640px" title="项目模块帮助" ok-text="确定" cancel-text="取消"><a-input class="help-search" allow-clear placeholder="搜索帮助内容"><template #prefix><IconSearch /></template></a-input><div class="help-list"><details><summary>如何创建新任务？</summary><p>选择左侧期号后，在任务搜索筛选栏点击新建任务，任务会直接归属当前期号；也可以在任务页先选择项目期号后创建。</p></details><details><summary>项目树的层级是什么？</summary><p>项目树按客户、项目、期号三级展示，所有任务都归属具体项目期号。</p></details><details><summary>如何查看到期风险？</summary><p>使用截止时间筛选定位任务；工作台的今日待办和统计页会优先展示已逾期任务。</p></details></div></a-modal>
    <a-modal :visible="Boolean(selectedWorkHoursPhase)" title="期号日报详情" :footer="false" width="760px" @cancel="selectedWorkHoursPhase = null"><template v-if="selectedWorkHoursPhase"><div class="work-hours-report-detail"><header><div><h2>{{ selectedWorkHoursPhase.code }} · {{ selectedWorkHoursPhase.name }}</h2><p>{{ selectedWorkHoursPhase.projectName }}</p></div><a-tag :color="phaseStatusColor(selectedWorkHoursPhase.status)">{{ selectedWorkHoursPhase.status }}</a-tag></header><div class="work-hours-report-summary"><span>日报数量<b>{{ selectedWorkHoursPhaseReports.length }} 份</b></span><span>登记工时<b>{{ selectedWorkHoursPhaseReports.reduce((sum, report) => sum + report.phaseHours, 0) }}h</b></span><span>参与成员<b>{{ new Set(selectedWorkHoursPhaseReports.map(report => report.sender)).size }} 人</b></span><span>筛选范围<b>{{ workHoursMember }}</b></span></div><div v-if="selectedWorkHoursPhaseReports.length" class="work-hours-report-list"><article v-for="report in selectedWorkHoursPhaseReports" :key="report.id"><header><div><strong>{{ dailyReportDisplayName(report) }}</strong><small>{{ report.sentAt }}</small></div><span><a-tag :color="dailyReportStatusColors[report.status]">{{ report.status }}</a-tag><a-button type="text" size="small" @click="openWorkHoursDailyReport(report)"><IconEye />查看完整日报</a-button></span></header><div class="work-hours-report-meta"><span>{{ report.sender }}</span><b>{{ report.phaseHours }}h</b></div><section v-for="entry in report.phaseTasks" :key="entry.id"><strong>{{ entry.title }}</strong><small>{{ entry.category }}</small><p v-if="entry.summary">备注：{{ entry.summary }}</p></section></article></div><a-empty v-else description="当前筛选下暂无关联日报" /></div></template></a-modal>
    <a-modal :visible="Boolean(selectedPhaseWorklog)" title="工时详情" :footer="false" width="560px" @cancel="selectedPhaseWorklog = null"><template v-if="selectedPhaseWorklog"><div class="phase-worklog-detail"><header><div><h2>{{ selectedPhaseWorklog.member }}的工时记录</h2><p>{{ selectedPhase.code }} · {{ selectedPhase.name }}</p></div><strong>{{ selectedPhaseWorklog.hours }}h</strong></header><div class="phase-worklog-detail-meta"><span>登记日期<b>{{ selectedPhaseWorklog.date }}</b></span><span>登记成员<b>{{ selectedPhaseWorklog.member }}</b></span><span>所属项目<b>{{ selectedPhase.projectName }}</b></span><span>所属期号<b>{{ selectedPhase.name }}</b></span></div><section><strong>工作内容</strong><p>{{ selectedPhaseWorklog.content }}</p></section></div></template></a-modal>
    <a-modal v-model:visible="dailyReportModalVisible" modal-class="daily-report-editor-modal" :title="dailyReportEditingId ? '编辑日报' : '发送日报'" width="760px">
      <a-form layout="vertical">
        <div class="form-grid">
          <a-form-item label="日报日期" required><a-date-picker v-model="dailyReportDraft.date" value-format="YYYY-MM-DD" format="YYYY-MM-DD" @change="syncDailyReportName" /></a-form-item>
          <a-form-item label="日报状态"><a-select v-model="dailyReportDraft.status"><a-option v-for="status in ['待发送', '已发送']" :key="status" :value="status">{{ status }}</a-option></a-select></a-form-item>
        </div>
        <section class="daily-task-entry-editor">
          <header><div><strong>今日完成任务</strong><small>每条任务必须关联项目期号并独立登记工时，一天可填写多个任务。</small></div></header>
          <div v-for="(entry, index) in dailyReportDraft.tasks" :key="entry.id" class="daily-task-entry">
            <div class="daily-task-entry-heading"><strong>任务 {{ index + 1 }}</strong><a-button v-if="dailyReportDraft.tasks.length > 1" type="text" status="danger" size="small" aria-label="删除任务" @click="removeDailyReportTask(entry)"><IconDelete /></a-button></div>
            <a-form-item label="关联期号" required><a-select v-model="entry.phase" allow-search placeholder="搜索并选择项目期号"><a-option v-for="phase in dashboardPhaseRows" :key="phase.key" :value="phase.key">{{ phase.code }} · {{ phase.projectName }}-{{ phase.name }}</a-option></a-select></a-form-item>
            <div class="form-grid">
              <a-form-item label="任务分类" required><a-select v-model="entry.category" placeholder="选择任务分类"><a-option v-for="category in dailyReportTaskCategoryOptions" :key="category" :value="category">{{ category }}</a-option></a-select></a-form-item>
              <a-form-item label="工时" required><a-input-number v-model="entry.hours" :min="0.1" :max="24" :precision="1" placeholder="小时" /></a-form-item>
            </div>
            <a-form-item label="任务内容" required><a-textarea v-model="entry.title" :max-length="500" :auto-size="{ minRows: 3, maxRows: 6 }" show-word-limit placeholder="填写这条任务今天完成的具体内容" /></a-form-item>
            <a-form-item label="备注"><a-textarea v-model="entry.summary" :max-length="300" :auto-size="{ minRows: 2, maxRows: 4 }" show-word-limit placeholder="补充说明（选填）" /></a-form-item>
          </div>
          <div class="daily-task-entry-actions"><a-button type="outline" size="small" @click="addDailyReportTask"><IconPlus />添加任务</a-button></div>
        </section>
        <a-form-item class="daily-report-next-plan" label="明日计划"><a-textarea v-model="dailyReportDraft.nextPlan" :max-length="500" show-word-limit placeholder="填写明日计划" /></a-form-item>
      </a-form>
      <template #footer><div class="daily-report-modal-footer"><a-button @click="dailyReportModalVisible = false">取消</a-button><a-button @click="saveDailyReport('待发送')">保存待发送</a-button><a-button type="primary" @click="saveDailyReport('已发送')">发送日报</a-button></div></template>
    </a-modal>
    <a-modal :visible="Boolean(selectedDailyReport)" title="日报详情" :footer="false" width="760px" @cancel="selectedDailyReport = null"><template v-if="selectedDailyReport"><div class="daily-report-detail"><header><div><h2>{{ dailyReportDisplayName(selectedDailyReport) }}</h2></div><a-tag :color="dailyReportStatusColors[selectedDailyReport.status]">{{ selectedDailyReport.status }}</a-tag></header><div class="daily-report-detail-meta"><span>发送人<b>{{ selectedDailyReport.sender }}</b></span><span>发送时间<b>{{ selectedDailyReport.sentAt }}</b></span><span>日报工时<b>{{ selectedDailyReport.hours }}h</b></span><span>任务数量<b>{{ selectedDailyReport.tasks?.length || 0 }} 项</b></span></div><section class="daily-report-task-entry-detail"><header><strong>今日完成任务</strong><small>{{ selectedDailyReport.date }} · 每条任务独立登记</small></header><div v-for="entry in selectedDailyReportTaskEntries" :key="entry.id" class="daily-report-task-entry"><div class="daily-report-task-entry-meta"><strong>{{ entry.title }}</strong><span><a-tag color="arcoblue">{{ entry.category }}</a-tag>{{ entry.hours }}h · {{ phaseByKey(entry.phase)?.code || '期号未配置' }}<template v-if="phaseByKey(entry.phase)"> · {{ phaseByKey(entry.phase)?.name }}</template></span></div><p v-if="entry.summary">备注：{{ entry.summary }}</p></div></section><section><header><strong>明日计划</strong></header><p>{{ selectedDailyReport.nextPlan || '暂无计划' }}</p></section></div></template></a-modal>
    <OnlineFileEditor
      v-if="onlineFileEditorVisible"
      :key="`${onlineFileEditorPhaseKey}-${onlineFileEditorFileId || 'new'}-${phaseOnlineFileDraft.type}`"
      :model-value="phaseOnlineFileDraft"
      :phase="onlineFileEditorPhase"
      :saved-snapshot="onlineFileSavedSnapshot"
      @save="savePhaseOnlineFile"
      @close="closePhaseOnlineFileEditor"
    />
  </div>
</template>
