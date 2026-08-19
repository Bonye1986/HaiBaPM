<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { Message, Modal } from "@arco-design/web-vue";
import {
  IconArrowRise, IconCalendar, IconCheckCircle, IconClockCircle, IconClose, IconCopy, IconDown, IconExport, IconFile,
  IconFolder, IconInfoCircle, IconLock, IconMenuFold, IconMenuUnfold, IconMore, IconNotification, IconWechat,
  IconApps, IconDelete, IconDragDotVertical, IconEdit, IconImport, IconList, IconMindMapping, IconPlus, IconPoweroff, IconQuestionCircle, IconRefresh, IconSafe, IconSearch, IconSettings, IconUser, IconUserAdd, IconUserGroup,
} from "@arco-design/web-vue/es/icon";
import { phaseByKey, priorityColors, projects, statusColors, taskSeed } from "./data.js";
import RichTextEditor from "./components/RichTextEditor.vue";

const navItems = ["工作台", "项目", "任务", "日报", "工时", "团队", "统计"];
const activeNav = ref("项目");
const authStorageKey = "haiba-pm-auth";
const storedAuthState = sessionStorage.getItem(authStorageKey) || localStorage.getItem(authStorageKey);
const isAuthenticated = ref(storedAuthState !== "logged-out");
const loginLoading = ref(false);
const loginError = ref("");
const socialLoginProvider = ref("");
const loginDraft = ref({ account: "lixiangmu@haiba.example", password: "", remember: true });
const profileDrawerVisible = ref(false);
const profileAvatarInput = ref(null);
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
const passwordModalVisible = ref(false);
const passwordError = ref("");
const passwordDraft = ref({ currentPassword: "", newPassword: "", confirmPassword: "" });
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
const selectedTaskKeys = ref([]);
const selectedTask = ref(null);
const taskComments = ref({});
const taskActivities = ref({});
const commentDraft = ref("");
const replyingTo = ref(null);
const subtaskDraft = ref("");
const subtaskAssigneeDraft = ref("李项目");
const subtaskEditingId = ref(null);
const subtaskEditDraft = ref({ title: "", assignee: "李项目" });
const draggedSubtaskId = ref(null);
const taskTitleEditing = ref(false);
const taskTitleDraft = ref("");
const taskDescriptionDraft = ref("");
const taskCollaborationTab = ref("comments");
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
const selectedWorklog = ref(null);
const phaseFileModalVisible = ref(false);
const phaseFileInput = ref(null);
const phaseFileEditingId = ref(null);
const phaseFileDraft = ref({ file: null, current: null });
const phaseFilePreviewVisible = ref(false);
const phaseFilePreview = ref(null);
const phaseFilePreviewUrl = ref("");
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
    projectCode: project.code,
    projectName: project.name,
    projectOwner: project.owner || phase.owner,
    projectKey: project.key,
  }))));
  return rows;
});
const isManagementRole = computed(() => /管理员|管理层|总经理|副总|总监|CEO|项目经理|部门经理/.test(accountProfile.value.position || ""));
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
const dashboardTasks = computed(() => {
  const phaseKeys = new Set(dashboardPhaseRows.value.map(phase => phase.key));
  return tasks.value.filter(task => phaseKeys.has(task.phase)).sort((a, b) => ({ P0: 0, P1: 1, P2: 2 }[a.priority] ?? 3) - ({ P0: 0, P1: 1, P2: 2 }[b.priority] ?? 3) || (a.createdAt ?? 0) - (b.createdAt ?? 0)).slice(0, 8);
});
const dashboardStats = computed(() => {
  const phases = dashboardPhaseRows.value;
  const total = phases.length;
  const completed = phases.filter(phase => phase.status === "已完成").length;
  const delayed = phases.filter(phase => phase.status === "延期").length;
  return { total, inProgress: phases.filter(phase => phase.status === "进行中").length, completed, delayed, delayRate: total ? Math.round(delayed / total * 100) : 0, completionRate: total ? Math.round(completed / total * 100) : 0 };
});
const dashboardDate = computed(() => new Date().toISOString().slice(0, 10));
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
const phaseHourStats = computed(() => {
  const members = phaseMembers.value[selectedPhaseKey.value] || [];
  const logged = members.reduce((sum, member) => sum + member.hours, 0);
  return { logged, planned: Math.max(logged + 24, 80), members: members.length, average: members.length ? Math.round(logged / members.length) : 0 };
});
const currentPhaseWorklogs = computed(() => phaseWorklogs.value[selectedPhaseKey.value] || []);
const filteredWorklogs = computed(() => {
  const [startDate, endDate] = worklogDateRange.value || [];
  return currentPhaseWorklogs.value.filter(log => (worklogMemberFilter.value === "全部成员" || log.member === worklogMemberFilter.value) && (!startDate || log.date >= startDate) && (!endDate || log.date <= endDate));
});
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
const profileInitial = computed(() => accountProfile.value.nickname.trim().slice(0, 1) || "用");
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
function handleNavigation(key) {
  if (key === "工作台" || key === "项目") { activeNav.value = key; return; }
  activeNav.value = "项目";
  notify(`${key}模块将在后续设计`);
}
async function handleLogin() {
  const account = loginDraft.value.account.trim();
  if (!account) { loginError.value = "请输入账号"; return; }
  if (!loginDraft.value.password) { loginError.value = "请输入密码"; return; }
  loginLoading.value = true;
  loginError.value = "";
  try {
    localStorage.removeItem(authStorageKey);
    sessionStorage.removeItem(authStorageKey);
    const storage = loginDraft.value.remember ? localStorage : sessionStorage;
    storage.setItem(authStorageKey, "authenticated");
    isAuthenticated.value = true;
    loginDraft.value.password = "";
    Message.success("登录成功");
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
  loginError.value = `${provider}授权服务尚未配置，请联系系统管理员完成授权应用配置`;
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
      selectedWorklog.value = null;
      phaseDrawerVisible.value = false;
      taskModalVisible.value = false;
      phaseMemberModalVisible.value = false;
      phaseFileModalVisible.value = false;
      profileDrawerVisible.value = false;
      passwordModalVisible.value = false;
      helpVisible.value = false;
      isAuthenticated.value = false;
      loginError.value = "";
      loginDraft.value.password = "";
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
  if (!position) { profileError.value = "请输入职务"; return; }
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
  passwordDraft.value = { currentPassword: "", newPassword: "", confirmPassword: "" };
  passwordError.value = "";
  passwordModalVisible.value = true;
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
function openPhaseListMenu(phase, action) {
  if (action === "edit-project") return openProjectEdit(projectByKey(phase.projectKey));
  if (action === "delete-project") return removeProject(projectByKey(phase.projectKey));
  if (action === "edit-phase") return openPhaseEdit(phase);
  return removePhase(phase);
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
  draft.value.subtasks = [...(draft.value.subtasks || []), { id: `subtask-${Date.now()}`, title, status: "未完成", assignee: subtaskAssigneeDraft.value || draft.value.executors?.[0] || "李项目" }];
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
function openTaskModal() {
  draft.value = emptyDraft();
  subtaskDraft.value = "";
  subtaskAssigneeDraft.value = "李项目";
  taskModalVisible.value = true;
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
  const subtask = { id: `subtask-${Date.now()}`, title, status: "未完成", assignee: subtaskAssigneeDraft.value || selectedTask.value.owner || "李项目" };
  const subtasks = [...(selectedTask.value.subtasks || []), subtask];
  tasks.value = tasks.value.map(task => task.id === selectedTask.value.id ? { ...task, subtasks } : task);
  selectedTask.value = { ...selectedTask.value, subtasks };
  subtaskDraft.value = "";
  subtaskAssigneeDraft.value = selectedTask.value.owner || "李项目";
  appendTaskActivity(selectedTask.value.id, "新增子任务", title);
}
function removeTaskDrawerSubtask(subtask) {
  if (!selectedTask.value) return;
  const subtasks = (selectedTask.value.subtasks || []).filter(item => item.id !== subtask.id);
  tasks.value = tasks.value.map(task => task.id === selectedTask.value.id ? { ...task, subtasks } : task);
  selectedTask.value = { ...selectedTask.value, subtasks };
  if (subtaskEditingId.value === subtask.id) cancelSubtaskEdit();
  appendTaskActivity(selectedTask.value.id, "移除子任务", subtask.title);
}
function onTaskRowClick(record) {
  selectedTask.value = record;
  commentDraft.value = "";
  replyingTo.value = null;
  subtaskDraft.value = "";
  subtaskAssigneeDraft.value = record.owner || "李项目";
  cancelSubtaskEdit();
  draggedSubtaskId.value = null;
  taskTitleEditing.value = false;
  taskTitleDraft.value = "";
  taskDescriptionDraft.value = record.description || "";
  taskCollaborationTab.value = "comments";
}
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
function openWorklogDetail(log) { selectedWorklog.value = log; }
function handleWorklogClick(event) {
  const row = event.target.closest?.(".worklog-row:not(.worklog-row-heading)");
  if (!row) return;
  const content = Array.from(row.children).at(-1)?.textContent?.trim();
  const log = filteredWorklogs.value.find(item => item.content === content);
  if (log) openWorklogDetail(log);
}
onMounted(() => document.addEventListener("click", handleWorklogClick));
onBeforeUnmount(() => document.removeEventListener("click", handleWorklogClick));
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
function openPhaseMemberModal() {
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
  phaseMembers.value = { ...phaseMembers.value, [selectedPhase.value.key]: currentPhaseMembers.value.filter(item => item.id !== member.id) };
  phaseMemberModalVisible.value = false;
  phaseMemberEditingId.value = null;
  Message.success("期号成员已移除");
}
function phaseStatusColor(status) { return statusColors[status] || "gray"; }
</script>

<template>
  <main v-if="!isAuthenticated" class="login-page">
    <header class="login-header"><span class="login-brand"><IconArrowRise /><strong>海拔PM</strong></span><span>软件项目交付管理平台</span></header>
    <section class="login-panel" aria-labelledby="login-title">
      <div class="login-panel-heading"><span class="login-security-icon"><IconSafe /></span><div><h1 id="login-title">登录海拔PM</h1><p>进入项目、期号与任务协作空间</p></div></div>
      <form class="login-form" @submit.prevent="handleLogin">
        <label for="login-account">账号</label>
        <a-input id="login-account" v-model="loginDraft.account" size="large" allow-clear placeholder="手机号、邮箱或成员账号" @input="loginError = ''"><template #prefix><IconUser /></template></a-input>
        <label for="login-password">密码</label>
        <a-input-password id="login-password" v-model="loginDraft.password" size="large" allow-clear placeholder="请输入密码" @input="loginError = ''" @keyup.enter="handleLogin"><template #prefix><IconLock /></template></a-input-password>
        <p v-if="loginError" class="login-error" role="alert">{{ loginError }}</p>
        <div class="login-options"><a-checkbox v-model="loginDraft.remember">保持登录</a-checkbox><a-button type="text" size="small" @click="notify('请联系系统管理员重置密码')">忘记密码</a-button></div>
        <a-button class="login-submit" type="primary" html-type="submit" size="large" long :loading="loginLoading">登录</a-button>
      </form>
      <div class="login-divider"><span>其他方式登录</span></div>
      <div class="social-login-list">
        <a-button class="social-login-button wechat-login" size="large" long :loading="socialLoginProvider === '微信'" :disabled="loginLoading || Boolean(socialLoginProvider)" @click="handleSocialLogin('微信')"><IconWechat />微信授权登录</a-button>
        <a-button class="social-login-button wecom-login" size="large" long :loading="socialLoginProvider === '企业微信'" :disabled="loginLoading || Boolean(socialLoginProvider)" @click="handleSocialLogin('企业微信')"><IconSafe />企业微信授权登录</a-button>
      </div>
      <footer><IconSafe />登录状态仅保存在当前浏览器，不会保存密码</footer>
    </section>
  </main>
  <div v-else class="app-shell">
    <header class="global-header">
      <a-button class="brand" type="text" @click="notify('海拔PM')"><IconArrowRise /><strong>海拔PM</strong></a-button>
      <a-menu class="global-nav" mode="horizontal" :selected-keys="[activeNav]" @menu-item-click="handleNavigation"><a-menu-item v-for="item in navItems" :key="item">{{ item }}</a-menu-item></a-menu>
      <div class="header-actions">
        <a-tooltip content="设置"><a-button type="text" aria-label="设置" @click="openProfileDrawer"><IconSettings />设置</a-button></a-tooltip>
        <a-tooltip content="帮助中心"><a-button type="text" @click="helpVisible = true"><IconQuestionCircle />帮助</a-button></a-tooltip>
        <a-dropdown trigger="click"><a-button type="text"><IconNotification />通知</a-button><template #content><div class="notification-panel"><header><strong>通知</strong><a-button type="text" size="mini">全部已读</a-button></header><button><IconClockCircle /><span><strong>任务即将逾期</strong><small>支付回调幂等校验将在 3 天后到期</small></span></button><button><IconCheckCircle /><span><strong>任务等待确认</strong><small>核对审核状态流转已提交确认</small></span></button><button><IconInfoCircle /><span><strong>期号进度更新</strong><small>一期核心交付进度已更新为 68%</small></span></button></div></template></a-dropdown>
        <a-dropdown trigger="click"><button class="profile-trigger"><a-avatar :size="32" :image-url="accountProfile.avatarUrl">{{ profileInitial }}</a-avatar><span><strong>{{ accountProfile.nickname }}</strong><small>{{ accountProfile.position }}</small></span><IconDown /></button><template #content><a-menu class="account-menu"><div class="account-summary"><a-avatar :size="38" :image-url="accountProfile.avatarUrl">{{ profileInitial }}</a-avatar><div><strong>{{ accountProfile.nickname }}</strong><small>{{ accountProfile.account }}</small></div></div><a-menu-item key="profile" @click="openProfileDrawer"><IconUser />个人信息</a-menu-item><a-menu-item key="password" @click="openPasswordModal"><IconLock />修改密码</a-menu-item><a-menu-item key="logout" @click="handleLogout"><IconPoweroff />退出登录</a-menu-item></a-menu></template></a-dropdown>
      </div>
    </header>

    <main v-if="activeNav === '工作台'" class="workbench-page">
      <header class="workbench-heading"><div><span class="workbench-eyebrow">{{ isManagementRole ? '管理视角' : '个人视角' }} · {{ dashboardDate }}</span><h1>工作台</h1><p>{{ isManagementRole ? '查看全部项目期号、任务与交付风险。' : '聚焦与你相关的项目期号和待办任务。' }}</p></div><a-button type="primary" @click="activeNav = '项目'"><IconApps />进入项目</a-button></header>
      <section class="workbench-stat-grid"><article><span>项目期号数量</span><strong>{{ dashboardStats.total }}</strong><small>当前可见范围</small></article><article><span>进行中期号数量</span><strong>{{ dashboardStats.inProgress }}</strong><small>正在交付</small></article><article><span>已完成期号数量</span><strong>{{ dashboardStats.completed }}</strong><small>已完成</small></article><article><span>延期期号数量</span><strong>{{ dashboardStats.delayed }}</strong><small>需要关注</small></article><article><span>项目延期率</span><strong>{{ dashboardStats.delayRate }}%</strong><small>延期 / 全部期号</small></article><article><span>项目完成率</span><strong>{{ dashboardStats.completionRate }}%</strong><small>完成 / 全部期号</small></article></section>
      <section class="workbench-panel"><header><div><h2>任务列表</h2><span>按优先级和创建时间排序</span></div><a-button type="text" @click="activeNav = '项目'"><IconList />查看全部</a-button></header><div class="workbench-task-table"><div class="workbench-row workbench-row-heading"><span>任务名称</span><span>项目期号</span><span>负责人</span><span>状态</span><span>截止时间</span></div><button v-for="task in dashboardTasks" :key="task.id" class="workbench-row" @click="selectedPhaseKey = task.phase; onTaskRowClick(task)"><span><strong>{{ task.title }}</strong><small>{{ task.id }} · {{ task.module }}</small></span><span>{{ phaseByKey(task.phase)?.code }} · {{ phaseByKey(task.phase)?.name }}</span><span>{{ task.owner }}</span><span><a-tag :color="phaseStatusColor(task.status)">{{ task.status }}</a-tag></span><span>{{ task.due }}</span></button><a-empty v-if="!dashboardTasks.length" description="暂无相关任务" /></div></section>
      <section class="workbench-panel"><header><div><h2>期号列表</h2><span>按当前账号权限展示</span></div><a-button type="text" @click="activeNav = '项目'"><IconFolder />查看项目</a-button></header><div class="workbench-phase-grid"><button v-for="phase in dashboardPhaseRows" :key="phase.key" @click="selectedPhaseKey = phase.key; activeNav = '项目'"><span><strong>{{ phase.customerCode }}-{{ phase.projectCode }} · {{ phase.projectName }}</strong><small>{{ phase.code }} · {{ phase.name }}</small></span><span class="workbench-phase-meta"><small>负责人：{{ phase.owner }}</small><a-tag :color="phaseStatusColor(phase.status)">{{ phase.status }}</a-tag></span></button><a-empty v-if="!dashboardPhaseRows.length" description="暂无可见期号" /></div></section>
    </main>
    <div v-else class="project-layout">
      <aside class="project-navigator">
        <div class="navigator-heading"><h1>客户 / 项目 + 期号</h1><a-radio-group class="project-view-control" type="button" size="small" v-model="projectView"><a-radio value="tree" title="项目树" aria-label="项目树"><IconMindMapping /></a-radio><a-radio value="list" title="列表" aria-label="列表"><IconList /></a-radio></a-radio-group></div>
        <div class="navigator-search"><a-input v-model="navigatorKeyword" allow-clear placeholder="搜索客户、项目或期号"><template #prefix><IconSearch /></template></a-input></div>
        <div class="navigator-body" :class="{ 'customer-collapsed': customerCollapsed }">
          <section class="customer-panel" :class="{ 'customer-panel-collapsed': customerCollapsed }">
            <template v-if="customerCollapsed"><a-tooltip content="展开客户栏"><a-button class="customer-panel-toggle customer-expand-button" type="text" @click="customerCollapsed = false"><IconMenuUnfold /></a-button></a-tooltip><span class="customer-collapsed-label">客户</span></template>
            <template v-else><div class="subpanel-heading"><h2>客户</h2><a-tooltip content="收起客户栏"><a-button class="customer-panel-toggle" type="text" @click="customerCollapsed = true"><IconMenuFold /></a-button></a-tooltip></div><div class="customer-list"><button v-for="customer in visibleCustomers" :key="customer.key" :class="{ active: selectedCustomerKey === customer.key }" :title="`${customer.code}-${customer.name}`" @click="selectCustomer(customer)"><strong>{{ customer.code }}-{{ customer.name }}</strong><em>{{ customerPhaseCount(customer) }}</em></button><a-empty v-if="!visibleCustomers.length" description="没有匹配的客户" /></div></template>
          </section>
          <section class="project-sidebar"><div class="subpanel-heading"><h2>项目 + 期号</h2><a-tooltip content="添加项目或期号"><a-button class="project-add-button" type="text" aria-label="添加项目或期号" @click="openProjectCreateModal"><IconPlus /></a-button></a-tooltip></div><section class="quick-section"><header><h2>快速入口</h2></header><button v-for="key in recentPhaseKeys" :key="key" :class="{ active: selectedPhaseKey === key }" @click="selectedPhaseKey = key"><IconClockCircle /><span><strong>{{ phaseByKey(key)?.code }}　{{ phaseByKey(key)?.name }}</strong><small>最近打开 · {{ phaseByKey(key)?.projectName }}</small></span></button></section><div class="project-status-tabs"><button v-for="(count, status) in customerStatusCounts" :key="status" :class="{ active: phaseStatus === status }" @click="phaseStatus = status">{{ status === '全部状态' ? '全部' : status }}<b>{{ count }}</b></button></div><a-tree v-if="projectView === 'tree'" class="tree-section" :data="treeData" :expanded-keys="expandedKeys" :selected-keys="[selectedPhaseKey]" block-node show-line @expand="keys => expandedKeys = keys" @select="onTreeSelect"><template #title="node"><div v-if="node.nodeType === 'project'" class="tree-project-title"><IconFolder /><span><b>{{ node.code }}</b>{{ node.name }}</span><a-dropdown trigger="click" @select="action => openTreeNodeMenu(node, action)"><a-button class="tree-node-more" type="text" size="mini" aria-label="项目更多操作" @click.stop><IconMore /></a-button><template #content><a-doption value="edit"><IconEdit />编辑项目</a-doption><a-doption value="delete" class="tree-danger-option"><IconDelete />删除项目</a-doption></template></a-dropdown></div><div v-else class="tree-phase-title"><div class="tree-phase-main"><span class="tree-phase-code">{{ node.code }}</span><span class="tree-phase-name">{{ node.name }}</span><a-dropdown trigger="click" @select="action => openTreeNodeMenu(node, action)"><a-button class="tree-node-more" type="text" size="mini" aria-label="期号更多操作" @click.stop><IconMore /></a-button><template #content><a-doption value="edit"><IconEdit />编辑期号</a-doption><a-doption value="delete" class="tree-danger-option"><IconDelete />删除期号</a-doption></template></a-dropdown></div><div class="tree-phase-meta"><span>负责人：{{ node.owner }}</span><a-tag :color="phaseStatusColor(node.status)">{{ node.status }}</a-tag></div></div></template></a-tree><section v-else class="phase-list-section"><div v-for="phase in phaseListData" :key="phase.key" class="phase-list-card" :class="{ active: phase.key === selectedPhaseKey }" role="button" tabindex="0" @click="selectPhase(phase)"><div class="phase-list-main"><div class="phase-list-project"><span class="phase-list-project-code">{{ phase.customerCode }}-{{ phase.projectCode }}</span><strong>{{ phase.projectName }}</strong></div><div class="phase-list-phase"><span class="phase-list-code">{{ phase.code }}</span><strong>{{ phase.name }}</strong></div><div class="phase-list-meta"><span>项目负责人：{{ phase.projectOwner }}</span><a-tag :color="phaseStatusColor(phase.status)">{{ phase.status }}</a-tag></div></div><a-dropdown trigger="click" @select="action => openPhaseListMenu(phase, action)"><a-button class="phase-list-more" type="text" size="mini" aria-label="项目和期号更多操作" @click.stop><IconMore /></a-button><template #content><a-doption value="edit-project"><IconEdit />编辑项目</a-doption><a-doption value="delete-project" class="tree-danger-option"><IconDelete />删除项目</a-doption><a-doption value="edit-phase"><IconEdit />编辑期号</a-doption><a-doption value="delete-phase" class="tree-danger-option"><IconDelete />删除期号</a-doption></template></a-dropdown></div><a-empty v-if="!phaseListData.length" description="没有匹配的期号" /></section></section>
        </div>
      </aside>

      <main class="task-workspace">
        <section class="phase-header"><div class="phase-identity"><div class="phase-copy"><div class="phase-title-row"><h2>{{ selectedPhase.name }}</h2><a-tag :color="phaseStatusColor(selectedPhase.status)">{{ selectedPhase.status }}</a-tag></div><p>{{ selectedPhase.code }} · {{ selectedPhase.projectName }}</p><div class="phase-meta"><span><IconCalendar />{{ selectedPhase.dates }}</span><span><IconUserGroup />负责人：{{ selectedPhase.owner }}</span></div></div></div><a-tooltip content="期号设置"><a-button class="phase-settings-button" aria-label="期号设置" @click="openPhaseSettings"><IconSettings /></a-button></a-tooltip></section>
        <section class="task-control-bar"><a-radio-group class="task-view-switch" type="button" size="small" v-model="taskView"><a-radio value="list"><IconList />任务列表</a-radio><a-radio value="board"><IconApps />看板视图</a-radio></a-radio-group><div class="task-tools"><a-input v-model="taskKeyword" allow-clear placeholder="搜索任务名称"><template #prefix><IconSearch /></template></a-input><a-select v-model="statusFilter" :style="{ width: '118px' }"><a-option v-for="status in statusOptions" :key="status" :value="status">{{ status }}</a-option></a-select><a-date-picker v-model="dueDateFilter" class="task-due-filter" format="YYYY-MM-DD" value-format="YYYY-MM-DD" placeholder="截止时间" allow-clear /><a-button type="primary" @click="taskView === 'list' ? openTaskModal() : openLaneModal()"><IconPlus />{{ taskView === 'list' ? '新建任务' : '添加列' }}</a-button><a-dropdown trigger="click"><a-button class="workspace-more-button"><IconMore />更多</a-button><template #content><a-menu class="workspace-more-menu" @menu-item-click="openWorkspaceMore"><a-menu-item key="import"><IconImport />导入任务</a-menu-item><a-menu-item key="template"><IconFile />下载导入模板</a-menu-item><a-menu-item key="export"><IconExport />{{ taskView === 'list' ? '导出任务' : '导出看板' }}</a-menu-item></a-menu></template></a-dropdown></div><input ref="taskImportInput" class="task-import-input" type="file" accept=".csv,text/csv" @change="importTasks" /></section>
        <section v-if="taskView === 'list'" class="task-list-section"><div class="table-frame"><a-table row-key="id" :columns="columns" :data="visibleTasks" :pagination="{ pageSize: 8, sizeCanChange: false }" :row-selection="rowSelection" @row-click="onTaskRowClick"><template #title="{ record }"><div class="task-title-cell"><strong>{{ record.title }}</strong><small>{{ record.id }} · {{ record.module }}</small></div></template><template #priority="{ record }"><a-tag :color="priorityColors[record.priority]">{{ record.priority }}</a-tag></template><template #owner="{ record }"><span class="owner-cell"><a-avatar :size="26">{{ record.owner.slice(0, 1) }}</a-avatar>{{ record.owner }}</span></template><template #status="{ record }"><a-tag :color="phaseStatusColor(record.status)">{{ record.status }}</a-tag></template><template #actions="{ record }"><a-button type="text" size="small" @click.stop="selectedTask = record"><IconMore /></a-button></template></a-table></div></section>
        <section v-else class="task-board-wrapper"><div class="task-board-section"><div v-for="lane in boardLanes" :key="lane.key" class="task-board-lane"><header draggable="true" @dragstart="startLaneDrag(lane, $event)" @dragover.prevent @drop="dropLane(lane, $event)"><span class="task-board-lane-title"><a-tag :color="lane.color">{{ lane.title }}</a-tag><b>{{ orderedBoardTasks(lane).length }}</b></span><span class="task-board-lane-actions"><a-tooltip content="编辑列"><a-button type="text" size="mini" @click.stop="openLaneModal(lane)"><IconEdit /></a-button></a-tooltip><a-tooltip content="删除列"><a-button type="text" size="mini" @click.stop="deleteLane(lane)"><IconDelete /></a-button></a-tooltip></span></header><div class="task-board-cards" @dragover.prevent @drop="dropTaskOnLane(lane, $event)"><button v-for="task in orderedBoardTasks(lane)" :key="task.id" class="task-board-card" draggable="true" @dragstart.stop="startTaskDrag(task, $event)" @dragover.prevent @drop="dropTaskBefore(task, lane, $event)" @click="onTaskRowClick(task)"><div class="task-board-card-top"><a-tag :color="priorityColors[task.priority]">{{ task.priority }}</a-tag><span>{{ task.due }}</span></div><strong>{{ task.title }}</strong><small>{{ task.id }}</small><footer><span><a-avatar :size="22">{{ task.owner.slice(0, 1) }}</a-avatar>{{ task.owner }}</span><a-tag :color="phaseStatusColor(task.status)">{{ task.status }}</a-tag></footer></button><a-empty v-if="!orderedBoardTasks(lane).length" description="暂无任务" /></div></div></div></section>
      </main>
    </div>

    <a-modal v-model:visible="taskModalVisible" title="新建任务" ok-text="创建任务" cancel-text="取消" :ok-button-props="{ disabled: !draft.title.trim() }" @ok="createTask"><div class="modal-context"><span>项目期号</span><strong>{{ selectedPhase.code }} {{ selectedPhase.projectName }}-{{ selectedPhase.name }}</strong></div><a-form layout="vertical"><a-form-item label="任务名称" required><a-input v-model="draft.title" autofocus placeholder="填写明确、可交付的任务名称" /></a-form-item><div class="form-grid"><a-form-item label="状态"><a-select v-model="draft.status"><a-option v-for="status in ['未完成', '待确认', '已完成']" :key="status" :value="status">{{ status }}</a-option></a-select></a-form-item><a-form-item label="确认人"><a-select v-model="draft.confirmer"><a-option v-for="member in teamMembers" :key="member" :value="member">{{ member }}</a-option></a-select></a-form-item><a-form-item label="执行人"><a-select v-model="draft.executors" multiple :max-tag-count="2" placeholder="可选择多个执行人"><a-option v-for="member in teamMembers" :key="member" :value="member">{{ member }}</a-option></a-select></a-form-item><a-form-item label="优先级"><a-select v-model="draft.priority"><a-option v-for="priority in ['P0', 'P1', 'P2']" :key="priority" :value="priority">{{ priority }}</a-option></a-select></a-form-item><a-form-item label="截止时间"><a-input v-model="draft.due" type="date" /></a-form-item></div><a-form-item label="任务描述"><RichTextEditor v-model="draft.description" placeholder="补充任务目标、验收标准、依赖或交付物" /></a-form-item><section class="subtask-builder"><header><strong>子任务</strong><span>{{ draft.subtasks.length }} 项</span></header><div class="subtask-add-row"><a-input v-model="subtaskDraft" placeholder="添加子任务名称" @keyup.enter="addSubtask" /><a-select v-model="subtaskAssigneeDraft" class="subtask-assignee-select" allow-search placeholder="执行人"><a-option v-for="member in teamMembers" :key="member" :value="member">{{ member }}</a-option></a-select><a-button type="outline" @click="addSubtask"><IconPlus />添加</a-button></div><div v-if="draft.subtasks.length" class="subtask-list"><div v-for="subtask in draft.subtasks" :key="subtask.id"><span><a-tag color="gray">未完成</a-tag>{{ subtask.title }}</span><span class="draft-subtask-actions"><a-select v-model="subtask.assignee" size="small" allow-search><a-option v-for="member in teamMembers" :key="member" :value="member">{{ member }}</a-option></a-select><a-button type="text" size="small" aria-label="移除子任务" @click="removeSubtask(subtask)"><IconDelete /></a-button></span></div></div></section></a-form></a-modal>
    <a-drawer v-model:visible="profileDrawerVisible" width="640px" title="个人信息"><div class="profile-avatar-section"><a-avatar :size="72" :image-url="profileDraft.avatarUrl">{{ profileDraft.nickname.trim().slice(0, 1) || '用' }}</a-avatar><div><strong>{{ profileDraft.nickname || '未设置昵称' }}</strong><span>{{ profileDraft.position || '未设置职务' }}</span><small>支持 JPG、PNG 等图片，文件不超过 5 MB</small></div><span class="profile-avatar-actions"><a-button type="outline" size="small" @click="profileAvatarInput?.click()"><IconImport />更换头像</a-button><a-button v-if="profileDraft.avatarUrl" type="text" size="small" @click="profileDraft.avatarUrl = ''"><IconDelete />移除</a-button></span><input ref="profileAvatarInput" class="profile-avatar-input" type="file" accept="image/*" @change="handleProfileAvatarChange" /></div><section class="profile-settings-section"><header><strong>基本资料</strong><span>用于登录识别和项目协作展示</span></header><a-form layout="vertical"><div class="form-grid"><a-form-item label="账号" required><a-input v-model="profileDraft.account" allow-clear placeholder="手机号、邮箱或成员账号" @input="profileError = ''" /></a-form-item><a-form-item label="手机号"><a-input v-model="profileDraft.phone" allow-clear maxlength="11" placeholder="用于安全验证和联系" @input="profileError = ''" /></a-form-item><a-form-item label="昵称" required><a-input v-model="profileDraft.nickname" allow-clear maxlength="20" placeholder="协作中显示的名称" @input="profileError = ''" /></a-form-item><a-form-item label="职务" required><a-input v-model="profileDraft.position" allow-clear maxlength="30" placeholder="例如：项目经理" @input="profileError = ''" /></a-form-item></div></a-form><p v-if="profileError" class="profile-error" role="alert">{{ profileError }}</p></section><section class="profile-settings-section"><header><strong>第三方账号</strong><span>绑定后可使用对应平台授权登录</span></header><div class="profile-security-list"><div><span class="profile-security-icon wecom"><IconSafe /></span><span><b>企业微信</b><small>{{ profileDraft.wecomBound ? '已绑定，可使用企业微信授权登录' : '未绑定' }}</small></span><a-tag :color="profileDraft.wecomBound ? 'green' : 'gray'">{{ profileDraft.wecomBound ? '已绑定' : '未绑定' }}</a-tag><a-button v-if="profileDraft.wecomBound" type="text" size="small" @click="unbindProfileAccount('企业微信')">解绑</a-button><a-button v-else type="outline" size="small" :loading="profileBindingLoading === '企业微信'" :disabled="Boolean(profileBindingLoading)" @click="bindProfileAccount('企业微信')">绑定</a-button></div><div><span class="profile-security-icon wechat"><IconWechat /></span><span><b>微信</b><small>{{ profileDraft.wechatBound ? '已绑定，可使用微信授权登录' : '未绑定' }}</small></span><a-tag :color="profileDraft.wechatBound ? 'green' : 'gray'">{{ profileDraft.wechatBound ? '已绑定' : '未绑定' }}</a-tag><a-button v-if="profileDraft.wechatBound" type="text" size="small" @click="unbindProfileAccount('微信')">解绑</a-button><a-button v-else type="outline" size="small" :loading="profileBindingLoading === '微信'" :disabled="Boolean(profileBindingLoading)" @click="bindProfileAccount('微信')">绑定</a-button></div></div></section><section class="profile-settings-section"><header><strong>登录安全</strong><span>定期更新密码可以降低账号风险</span></header><div class="profile-security-list"><div><span class="profile-security-icon password"><IconLock /></span><span><b>登录密码</b><small>已设置，修改后请使用新密码登录</small></span><a-tag color="green">已设置</a-tag><a-button type="outline" size="small" @click="openPasswordModal">修改密码</a-button></div></div></section><template #footer><div class="drawer-footer"><a-button @click="profileDrawerVisible = false">取消</a-button><a-button type="primary" @click="saveProfile">保存</a-button></div></template></a-drawer>
    <a-modal v-model:visible="passwordModalVisible" title="修改密码" ok-text="保存密码" cancel-text="取消" :on-before-ok="submitPasswordChange"><a-form layout="vertical" @submit.prevent="submitPasswordChange"><a-form-item label="当前密码" required><a-input-password v-model="passwordDraft.currentPassword" allow-clear autocomplete="current-password" placeholder="请输入当前密码" @input="passwordError = ''"><template #prefix><IconLock /></template></a-input-password></a-form-item><a-form-item label="新密码" required><a-input-password v-model="passwordDraft.newPassword" allow-clear autocomplete="new-password" placeholder="至少 8 个字符" @input="passwordError = ''"><template #prefix><IconLock /></template></a-input-password></a-form-item><a-form-item label="确认新密码" required><a-input-password v-model="passwordDraft.confirmPassword" allow-clear autocomplete="new-password" placeholder="请再次输入新密码" @input="passwordError = ''"><template #prefix><IconLock /></template></a-input-password></a-form-item><p v-if="passwordError" class="password-error" role="alert">{{ passwordError }}</p><p class="password-help"><IconInfoCircle />当前为演示环境，密码不会保存在浏览器本地。</p></a-form></a-modal>
    <a-modal v-model:visible="laneModalVisible" :title="laneEditingKey ? '编辑看板列' : '添加看板列'" ok-text="保存" cancel-text="取消" :ok-button-props="{ disabled: !laneDraft.title.trim() }" @ok="saveLane"><a-form layout="vertical"><a-form-item label="列名称" required><a-input v-model="laneDraft.title" maxlength="20" show-word-limit placeholder="例如：待客户确认" /></a-form-item><a-form-item label="列颜色"><a-select v-model="laneDraft.color"><a-option v-for="option in laneColorOptions" :key="option.value" :value="option.value">{{ option.label }}</a-option></a-select></a-form-item></a-form></a-modal>

    <a-drawer :visible="Boolean(selectedTask)" width="620px" @cancel="selectedTask = null">
      <template #title>
        <div class="task-drawer-heading">
          <div v-if="taskTitleEditing" class="task-title-edit-row">
            <a-input v-model="taskTitleDraft" autofocus aria-label="编辑任务标题" @blur="saveTaskTitle" @keyup.enter="saveTaskTitle" @keyup.esc="cancelTaskTitleEdit" />
          </div>
          <div v-else class="task-title-view-row" role="button" tabindex="0" aria-label="点击编辑任务标题" @click="startTaskTitleEdit" @keydown.enter.prevent="startTaskTitleEdit" @keydown.space.prevent="startTaskTitleEdit">
            <strong>{{ selectedTask?.title || '任务详情' }}</strong>
          </div>
          <small v-if="selectedTask" class="task-drawer-id">任务编号 · {{ selectedTask.id }}</small>
        </div>
      </template>
      <template v-if="selectedTask">
        <div class="task-drawer-actions">
          <a-select :model-value="selectedTask.status" style="width:148px" @change="value => updateTaskStatus(selectedTask.id, value)">
            <a-option v-for="status in statusOptions.slice(1)" :key="status" :value="status">{{ status }}</a-option>
          </a-select>
          <a-select :model-value="selectedTask.priority" class="task-priority-select" :class="`priority-${selectedTask.priority.toLowerCase()}`" aria-label="调整任务优先级" @change="value => updateTaskPriority(selectedTask.id, value)">
            <a-option v-for="priority in ['P0', 'P1', 'P2']" :key="priority" :value="priority"><a-tag :color="priorityColors[priority]">{{ priority }} 优先级</a-tag></a-option>
          </a-select>
        </div>
        <div class="task-drawer-meta task-drawer-meta-editable">
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
        </div>
        <section class="drawer-section task-description-section">
          <header><strong>任务描述</strong></header>
          <RichTextEditor v-model="taskDescriptionDraft" placeholder="补充任务目标、验收标准、依赖或交付物" @blur="saveTaskDescription" />
        </section>
        <section class="drawer-section task-subtasks-section">
          <header><strong>子任务</strong><span>{{ selectedTask.subtasks?.length || 0 }} 项</span></header>
          <div class="subtask-add-row task-drawer-subtask-add">
            <a-input v-model="subtaskDraft" placeholder="添加子任务名称" @keyup.enter="addTaskDrawerSubtask" />
            <a-select v-model="subtaskAssigneeDraft" class="subtask-assignee-select" allow-search placeholder="执行人"><a-option v-for="member in teamMembers" :key="member" :value="member">{{ member }}</a-option></a-select>
            <a-button type="outline" aria-label="添加子任务" @click="addTaskDrawerSubtask"><IconPlus /></a-button>
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
          <p v-else class="task-subtasks-empty">暂无子任务，可在上方直接添加。</p>
        </section>
        <section class="drawer-section task-collaboration-section">
          <div class="task-collaboration-tabs"><button :class="{ active: taskCollaborationTab === 'comments' }" @click="taskCollaborationTab = 'comments'">评论与回复 <b>{{ selectedTaskComments.length }}</b></button><button :class="{ active: taskCollaborationTab === 'activities' }" @click="taskCollaborationTab = 'activities'">操作记录 <b>{{ selectedTaskActivities.length }}</b></button></div>
          <div v-if="taskCollaborationTab === 'comments'">
            <div v-if="selectedTaskComments.length" class="task-comment-list"><article v-for="comment in selectedTaskComments" :key="comment.id" class="task-comment-item" :class="{ 'task-comment-reply': comment.parentId }"><div class="task-comment-heading"><span><a-avatar :size="24">{{ comment.author.slice(0, 1) }}</a-avatar><b>{{ comment.author }}</b></span><small>{{ comment.createdAt }}</small></div><div class="rich-text-display" v-html="comment.content" /><a-button type="text" size="small" @click="replyToComment(comment)">回复</a-button></article></div>
            <a-empty v-else description="暂无评论" />
            <div class="task-comment-editor"><span v-if="replyingTo" class="replying-hint">回复 {{ replyingTo.author }}<a-button type="text" size="small" @click="replyingTo = null; commentDraft = ''">取消</a-button></span><RichTextEditor v-model="commentDraft" placeholder="写下评论或回复" /></div>
          </div>
          <div v-else><div v-if="selectedTaskActivities.length" class="task-activity-list"><div v-for="activity in selectedTaskActivities" :key="activity.id"><span><b>{{ activity.action }}</b><small>{{ activity.detail }}</small></span><em>{{ activity.operator }} · {{ activity.createdAt }}</em></div></div><a-empty v-else description="暂无操作记录" /></div>
        </section>
      </template>
      <template #footer>
        <div class="drawer-footer"><a-button @click="selectedTask = null">关闭</a-button><a-button :disabled="!commentText(commentDraft)" @click="addTaskComment">发表评论</a-button><template v-if="selectedTask?.status === '待确认'"><a-button @click="handleTaskConfirmation(false)">确认不通过</a-button><a-button type="primary" @click="handleTaskConfirmation(true)">确认通过</a-button></template><a-button v-else type="primary" @click="submitTaskResult">提交结果</a-button></div>
      </template>
    </a-drawer>
    <a-drawer v-model:visible="phaseDrawerVisible" width="620px" title="期号设置"><div class="phase-settings-tabs"><button v-for="tab in [{ key: 'basic', label: '基本信息' }, { key: 'stats', label: '数据统计' }, { key: 'hours', label: '工时统计' }, { key: 'files', label: '项目文件' }, { key: 'members', label: '期号成员' }]" :key="tab.key" :class="{ active: phaseSettingsTab === tab.key }" @click="phaseSettingsTab = tab.key">{{ tab.label }}</button></div><template v-if="phaseSettingsTab === 'basic'"><div class="phase-detail-hero"><h2>{{ selectedPhase.code }}</h2><p>{{ selectedPhase.projectName }}-{{ selectedPhase.name }}</p><a-button v-if="!phaseEditing" class="phase-edit-button" type="outline" size="small" @click="startPhaseEdit"><IconEdit />编辑基本信息</a-button></div><div v-if="!phaseEditing" class="phase-descriptions"><p>客户：{{ selectedPhase.customerCode }}-{{ selectedPhase.customerName }}</p><p>项目：{{ selectedPhase.projectCode }} {{ selectedPhase.projectName }}</p><p>负责人：{{ selectedPhase.owner }}</p><p>计划时间：{{ selectedPhase.dates }}</p></div><a-form v-else class="phase-basic-form" layout="vertical"><a-form-item label="期号" required><a-input v-model="phaseDraft.phaseNumber" maxlength="20" placeholder="填写当前项目下唯一的期号" /></a-form-item><a-form-item label="期号名称" required><a-input v-model="phaseDraft.name" /></a-form-item><div class="form-grid"><a-form-item label="状态"><a-select v-model="phaseDraft.status"><a-option v-for="status in ['未开始', '进行中', '已完成', '延期']" :key="status" :value="status">{{ status }}</a-option></a-select></a-form-item><a-form-item label="负责人"><a-select v-model="phaseDraft.owner" allow-search placeholder="搜索负责人"><a-option v-for="member in teamMembers" :key="member" :value="member">{{ member }}</a-option></a-select></a-form-item></div><a-form-item label="计划时间"><a-range-picker v-model="phaseDraft.datesRange" value-format="YYYY-MM-DD" format="YYYY-MM-DD" :placeholder="['开始日期', '结束日期']" allow-clear /></a-form-item><div class="phase-form-actions"><a-button @click="phaseEditing = false">取消</a-button><a-button type="primary" @click="savePhaseBasicInfo">保存</a-button></div></a-form></template><template v-else-if="phaseSettingsTab === 'stats'"><section class="phase-settings-panel"><header><strong>期号数据统计</strong><span>{{ selectedPhase.code }} · {{ selectedPhase.name }}</span></header><div class="phase-stat-grid"><article><strong>{{ phaseTaskStats.total }}</strong><span>任务总数</span></article><article><strong>{{ phaseTaskStats.incomplete }}</strong><span>未完成</span></article><article><strong>{{ phaseTaskStats.pending }}</strong><span>待确认</span></article><article><strong>{{ phaseTaskStats.completed }}</strong><span>已完成</span></article></div><div class="phase-stat-grid phase-stat-grid-secondary"><article><strong>{{ phaseTaskStats.overdue }}</strong><span>已逾期</span></article><article><strong>{{ phaseTaskStats.dueSoon }}</strong><span>7天内到期</span></article><article><strong>{{ phaseTaskStats.owners }}</strong><span>负责人</span></article><article><strong>{{ phaseTaskStats.p0 }}</strong><span>P0任务</span></article></div><div class="phase-stat-summary"><span>平均计划周期 <b>{{ phaseTaskStats.averageCycle }}天</b></span><span>统计范围：当前期号全部任务</span></div></section></template><template v-else-if="phaseSettingsTab === 'hours'"><section class="phase-settings-panel"><header><div><strong>工时明细</strong><span>按成员与时间范围筛选</span></div></header><div class="worklog-filters"><a-select v-model="worklogMemberFilter" allow-search><a-option value="全部成员">全部成员</a-option><a-option v-for="member in teamMembers" :key="member" :value="member">{{ member }}</a-option></a-select><a-range-picker v-model="worklogDateRange" value-format="YYYY-MM-DD" format="YYYY-MM-DD" :placeholder="['开始日期', '结束日期']" allow-clear /></div><div class="worklog-member-summary"><div v-for="item in worklogMemberSummary" :key="item.member"><span>{{ item.member }}</span><strong>{{ item.hours }}h</strong></div><span v-if="!worklogMemberSummary.length">当前筛选暂无工时</span></div><div class="worklog-list"><div class="worklog-row worklog-row-heading"><span>日期</span><span>成员</span><span>工时</span><span>工作内容</span></div><div v-for="log in filteredWorklogs" :key="log.id" class="worklog-row"><span>{{ log.date }}</span><span>{{ log.member }}</span><strong>{{ log.hours }}h</strong><span>{{ log.content }}</span></div><a-empty v-if="!filteredWorklogs.length" description="暂无工时记录" /></div></section></template><template v-else-if="phaseSettingsTab === 'files'"><section class="phase-settings-panel"><header><div><strong>项目文件</strong><span>当前期号交付资料与协作附件</span></div><a-button type="primary" size="small" @click="openPhaseFileModal"><IconPlus />添加文件</a-button></header><div class="phase-file-list"><div v-for="file in currentPhaseFiles" :key="file.id" class="phase-file-item"><IconFile /><span><b>{{ file.name }}</b><small>{{ file.type }} · {{ file.size }} · 更新于 {{ file.updated }}</small></span><span class="file-actions"><a-tooltip content="预览文件"><a-button type="text" size="small" @click="previewPhaseFile(file)"><IconInfoCircle /></a-button></a-tooltip><a-tooltip content="编辑文件"><a-button type="text" size="small" @click="openPhaseFileEdit(file)"><IconEdit /></a-button></a-tooltip><a-tooltip content="下载文件"><a-button type="text" size="small" @click="notify(`已准备下载：${file.name}`)"><IconExport /></a-button></a-tooltip><a-tooltip content="删除文件"><a-button type="text" size="small" @click="removePhaseFile(file)"><IconDelete /></a-button></a-tooltip></span></div><a-empty v-if="!currentPhaseFiles.length" description="暂无项目文件" /></div></section></template><template v-else><section class="phase-settings-panel"><header><div><strong>期号成员</strong><span>管理当前期号的协作成员与职责</span></div><a-button type="primary" size="small" @click="openPhaseMemberModal"><IconPlus />添加成员</a-button></header><div class="phase-member-list"><div v-for="member in currentPhaseMembers" :key="member.id" class="phase-member-item"><a-avatar :size="32">{{ member.name.slice(0, 1) }}</a-avatar><span><b>{{ member.rawName || member.name }}</b><small>成员类型：{{ member.type || "内部成员" }}</small><small>期号角色：{{ member.baseRole || member.role }}</small><small>加入时间：{{ member.joinedAt || "未记录" }}</small><small v-if="member.permissions?.length">期号权限：{{ member.permissions.join("、") }}</small></span><span class="phase-member-actions"><a-tooltip content="权限设置"><a-button type="text" size="small" @click="openPhaseMemberEditor(member)"><IconSettings /></a-button></a-tooltip><a-tooltip content="移除成员"><a-button type="text" size="small" @click="deletePhaseMember(member)"><IconDelete /></a-button></a-tooltip></span></div><a-empty v-if="!currentPhaseMembers.length" description="暂无期号成员" /></div></section></template><template #footer><div class="drawer-footer"><a-button @click="phaseDrawerVisible = false">取消</a-button><a-button type="primary" @click="confirmPhaseSettings">确定</a-button></div></template></a-drawer>
<a-modal v-model:visible="projectCreateModalVisible" :title="projectCreateMode === 'edit' ? (projectCreateType === 'project' ? '编辑项目' : '编辑期号') : '添加项目或期号'" :ok-text="projectCreateMode === 'edit' ? '保存' : '添加'" cancel-text="取消" @ok="saveProjectCreate"><a-form layout="vertical"><a-form-item v-if="projectCreateMode === 'create'" label="添加类型"><a-select v-model="projectCreateType" @change="switchProjectCreateType"><a-option value="project">项目</a-option><a-option value="phase">期号</a-option></a-select></a-form-item><a-form-item label="客户"><a-select v-model="projectCreateDraft.customerKey" allow-search placeholder="选择客户" :disabled="projectCreateMode === 'edit'" @change="changeProjectCreateCustomer"><a-option v-for="customer in createCustomerOptions" :key="customer.key" :value="customer.key">{{ customer.code }}-{{ customer.name }}</a-option></a-select></a-form-item><template v-if="projectCreateType === 'project'"><div class="form-grid"><a-form-item label="项目编号"><a-input v-model="projectCreateDraft.projectCode" placeholder="例如 03" /></a-form-item><a-form-item label="项目名称"><a-input v-model="projectCreateDraft.projectName" placeholder="填写项目名称" /></a-form-item></div></template><template v-else><a-form-item label="项目"><a-select v-model="projectCreateDraft.projectKey" allow-search placeholder="选择项目" :disabled="projectCreateMode === 'edit'"><a-option v-for="project in createProjectOptions" :key="project.key" :value="project.key">{{ project.code }}-{{ project.name }}</a-option></a-select></a-form-item><div class="form-grid"><a-form-item label="期号编号"><a-input v-model="projectCreateDraft.phaseCode" placeholder="例如 03，或填写完整编码" /></a-form-item><a-form-item label="期号名称"><a-input v-model="projectCreateDraft.phaseName" placeholder="填写期号名称" /></a-form-item><a-form-item label="状态"><a-select v-model="projectCreateDraft.phaseStatus"><a-option v-for="status in ['未开始', '进行中', '已完成', '延期']" :key="status" :value="status">{{ status }}</a-option></a-select></a-form-item><a-form-item label="负责人"><a-select v-model="projectCreateDraft.phaseOwner" allow-search placeholder="搜索负责人"><a-option v-for="member in teamMembers" :key="member" :value="member">{{ member }}</a-option></a-select></a-form-item></div><a-form-item label="计划时间"><a-range-picker v-model="projectCreateDraft.phaseDatesRange" value-format="YYYY-MM-DD" format="YYYY-MM-DD" :placeholder="['开始日期', '结束日期']" allow-clear /></a-form-item></template></a-form></a-modal>    <a-modal v-model:visible="phaseFileModalVisible" :title="phaseFileEditingId ? '编辑项目文件' : '添加项目文件'" :ok-text="phaseFileEditingId ? '保存' : '添加'" cancel-text="取消" :ok-button-props="{ disabled: !phaseFileDraft.file }" @ok="savePhaseFile"><div class="phase-file-upload-panel"><input ref="phaseFileInput" class="phase-file-input" type="file" @change="handlePhaseFileChange" /><p v-if="phaseFileDraft.current" class="phase-file-current">当前文件：{{ phaseFileDraft.current.name }}<small>{{ phaseFileDraft.current.type }} · {{ phaseFileDraft.current.size }}</small></p><a-button type="outline" long @click="phaseFileInput?.click()"><IconImport />选择替换文件</a-button><p v-if="phaseFileDraft.file" class="phase-file-selected"><IconFile /><strong>{{ phaseFileDraft.file.name }}</strong><span>{{ formatFileSize(phaseFileDraft.file.size) }}</span></p><p v-else class="phase-file-empty">请选择要添加到当前期号的文件</p></div></a-modal><a-modal v-model:visible="phaseFilePreviewVisible" :title="phaseFilePreview?.name || '文件预览'" width="760px" footer="false" @cancel="closePhaseFilePreview"><div class="phase-file-preview"><iframe v-if="phaseFilePreviewUrl && phaseFilePreview?.type === 'PDF'" :src="phaseFilePreviewUrl" title="文件预览" /><img v-else-if="phaseFilePreviewUrl && phaseFilePreview?.source?.type?.startsWith('image/')" :src="phaseFilePreviewUrl" alt="文件预览" /><div v-else class="phase-file-preview-empty"><IconFile /><strong>{{ phaseFilePreview?.name }}</strong><span>{{ phaseFilePreview?.type }} · {{ phaseFilePreview?.size }}</span><small>当前文件暂不支持在线预览，请使用下载操作查看。</small></div></div></a-modal>
<a-modal v-model:visible="phaseMemberModalVisible" :title="phaseMemberEditingId ? '编辑期号成员' : '添加期号成员'" :ok-text="phaseMemberEditingId ? '保存权限' : (phaseMemberDraft.memberType === 'external' ? '发送邀请' : '添加')" cancel-text="取消" @ok="savePhaseMember"><a-form layout="vertical"><a-form-item label="成员类型"><a-radio-group v-model="phaseMemberDraft.memberType" type="button"><a-radio value="internal"><IconUser />内部成员</a-radio><a-radio value="external"><IconUserAdd />邀请外部人员</a-radio></a-radio-group></a-form-item><template v-if="phaseMemberDraft.memberType === 'internal'"><a-form-item label="成员"><a-select v-model="phaseMemberDraft.name" allow-search placeholder="搜索成员姓名"><a-option v-for="name in teamMembers" :key="name" :value="name">{{ name }}</a-option></a-select></a-form-item></template><template v-else><div class="external-member-note"><IconInfoCircle /><span>先配置外部人员和期号权限，再生成可复制的专属邀请链接。</span></div><a-form-item label="姓名" required><a-input v-model="phaseMemberDraft.name" placeholder="填写客户或兼职人员姓名" /></a-form-item><div class="form-grid"><a-form-item label="人员来源"><a-select v-model="phaseMemberDraft.externalType"><a-option value="客户">客户</a-option><a-option value="兼职">兼职</a-option><a-option value="合作方">合作方</a-option></a-select></a-form-item><a-form-item label="联系方式" required><a-input v-model="phaseMemberDraft.contact" placeholder="手机号或邮箱" /></a-form-item></div><a-form-item label="邀请链接" required><div class="invite-link-row"><a-input v-model="phaseMemberDraft.inviteLink" readonly placeholder="点击右侧按钮生成邀请链接" /><a-tooltip content="生成或重新生成"><a-button type="outline" aria-label="生成或重新生成邀请链接" @click="generatePhaseMemberInviteLink"><IconRefresh /></a-button></a-tooltip><a-tooltip content="复制邀请链接"><a-button type="outline" aria-label="复制邀请链接" :disabled="!phaseMemberDraft.inviteLink" @click="copyPhaseMemberInviteLink"><IconCopy /></a-button></a-tooltip></div></a-form-item></template><a-form-item label="期号角色"><a-select v-model="phaseMemberDraft.baseRole"><a-option value="项目负责人">项目负责人</a-option><a-option value="项目成员">项目成员</a-option><a-option value="客户联系人">客户联系人</a-option><a-option value="外部协作者">外部协作者</a-option></a-select></a-form-item><a-form-item label="期号权限" required><a-checkbox-group v-model="phaseMemberDraft.permissions"><a-checkbox value="项目资料">项目资料</a-checkbox><a-checkbox value="任务查看">任务查看</a-checkbox><a-checkbox value="任务执行">任务执行</a-checkbox><a-checkbox value="文件查看">文件查看</a-checkbox><a-checkbox value="文件管理">文件管理</a-checkbox></a-checkbox-group></a-form-item></a-form></a-modal>
    <a-drawer :visible="Boolean(selectedProject)" width="620px" title="项目详情" @cancel="selectedProject = null"><template v-if="selectedProject"><div class="project-detail-hero"><span>{{ selectedProject.customerCode }}-{{ selectedProject.code }}</span><h2>{{ selectedProject.name }}</h2><p>{{ selectedProject.customerCode }}-{{ selectedProject.customerName }}</p></div><section class="project-public-section"><header><div><strong>项目公共资料</strong><small>项目级公共信息，供项目成员协作查看</small></div><div class="project-public-actions"><a-button type="text" size="small" @click="openProjectInfoEditor"><IconEdit />编辑资料</a-button></div></header><div v-if="selectedProjectPublicDocument" class="rich-text-display project-public-document" v-html="selectedProjectPublicDocument" /><a-empty v-else description="暂无项目公共资料" /></section></template></a-drawer>
    <a-modal v-model:visible="projectInfoModalVisible" title="编辑项目公共资料" ok-text="保存" cancel-text="取消" @ok="saveProjectInfo"><a-form layout="vertical"><a-form-item label="资料内容"><RichTextEditor v-model="projectInfoDraft" placeholder="补充客户资料、服务器信息、代码仓库、部署地址等项目公共信息" /></a-form-item></a-form></a-modal>
    <a-drawer v-model:visible="helpVisible" width="440px" title="项目模块帮助"><a-input placeholder="搜索帮助内容"><template #prefix><IconSearch /></template></a-input><div class="help-list"><details><summary>如何创建新任务？</summary><p>选择左侧期号后，在任务搜索筛选栏点击新建任务。</p></details><details><summary>项目树的层级是什么？</summary><p>项目树按客户、项目、期号三级展示，任务归属于具体期号。</p></details><details><summary>如何查看延期任务？</summary><p>使用任务搜索筛选栏中的状态筛选，选择延期。</p></details></div></a-drawer>
    <a-modal :visible="Boolean(selectedWorklog)" title="日报详情" :footer="false" @cancel="selectedWorklog = null"><template v-if="selectedWorklog"><div class="worklog-detail"><div class="worklog-detail-meta"><span>日期<b>{{ selectedWorklog.date }}</b></span><span>成员<b>{{ selectedWorklog.member }}</b></span><span>工时<b>{{ selectedWorklog.hours }}h</b></span><span>期号<b>{{ selectedPhase.code }} · {{ selectedPhase.name }}</b></span></div><section><header><strong>工作内容</strong><small>日报记录</small></header><p>{{ selectedWorklog.content }}</p></section></div></template></a-modal>
  </div>
</template>
