import {
  IconBarChart,
  IconBook,
  IconCalendar,
  IconCheckCircle,
  IconCheckSquare,
  IconClockCircle,
  IconExclamationCircleFill,
  IconFile,
  IconFolder,
  IconHome,
  IconMenu,
  IconPlayArrowFill,
  IconSettings,
  IconUserGroup,
} from '@arco-design/web-vue/es/icon';

export const navItems = [
  { label: '工作台', icon: IconHome, active: true },
  { label: '项目', icon: IconCalendar },
  { label: '任务', icon: IconCheckCircle },
  { label: '需求', icon: IconMenu },
  { label: '缺陷', icon: IconBook },
  { label: '工时', icon: IconClockCircle },
  { label: '风险', icon: IconExclamationCircleFill },
  { label: '报表', icon: IconBarChart },
  { label: '文档', icon: IconFile },
  { label: '成员', icon: IconUserGroup },
  { label: '设置', icon: IconSettings },
];

export const metrics = [
  { label: '项目总数', value: '128', delta: '较上周 ↑ 12%', tone: 'blue', icon: IconFolder },
  { label: '进行中项目', value: '38', delta: '较上周 ↑ 5%', tone: 'green', icon: IconPlayArrowFill },
  { label: '已完成项目', value: '81', delta: '较上周 ↑ 18%', tone: 'purple', icon: IconCheckSquare },
  { label: '延期项目', value: '7', delta: '较上周 ↓ 2%', tone: 'red', icon: IconExclamationCircleFill },
  { label: '整体完成率', value: '86%', delta: '较上周 ↑ 6%', tone: 'blue', progress: true, icon: IconCalendar },
  { label: '本周工时', value: '32.5h', delta: '较上周 ↓ 4.5h', tone: 'mint', icon: IconClockCircle },
];

export const todoItems = [
  { title: 'CRM系统需求评审会议', priority: '高', dueTime: '今天 10:00', level: 'high' },
  { title: 'ERP项目验收确认', priority: '高', dueTime: '今天 14:00', level: 'high' },
  { title: '小程序项目上线部署', priority: '中', dueTime: '明天 09:30', level: 'mid' },
  { title: '管理OA需求文档评审', priority: '中', dueTime: '明天 11:00', level: 'mid' },
  { title: '客户回访：XX科技有限公司', priority: '低', dueTime: '05-22 15:00', level: 'low' },
  { title: '提交项目周报', priority: '低', dueTime: '05-24 17:00', level: 'low' },
];

export const warningItems = [
  { title: 'CRM系统项目延期', desc: '已延期 5 天', meta: '预计完成：2024-05-15', tone: 'red' },
  { title: 'ERP管理系统预算超支', desc: '超出预算 12%', meta: '预算使用：￥120,000 / ￥100,000', tone: 'orange' },
  { title: '小程序项目需求变更', desc: '需求增加 40%', meta: '变更需求：32 个', tone: 'amber' },
];

export const activityItems = [
  { time: '10:30', user: '李明', action: '完成了任务', target: '设计官网导航栏', project: '官网改版项目' },
  { time: '09:15', user: '王芳', action: '提交了需求', target: '移动端首页开发', project: '移动端产品迭代' },
  { time: '昨天 16:45', user: '张伟', action: '创建了项目周报', target: '', project: 'ERP管理系统' },
  { time: '昨天 14:20', user: '陈丽', action: '解决了缺陷', target: '#1023 的问题', project: '客户管理系统开发' },
  { time: '05-18', user: '系统', action: '自动生成了项目月报', target: '', project: '系统' },
];

export const shortcuts = [
  { title: '项目列表', desc: '查看全部项目', tone: 'blue', icon: IconCalendar },
  { title: '任务看板', desc: '任务进度管理', tone: 'green', icon: IconBook },
  { title: '需求列表', desc: '需求管理', tone: 'purple', icon: IconMenu },
  { title: '缺陷管理', desc: '缺陷跟踪', tone: 'orange', icon: IconExclamationCircleFill },
  { title: '工时统计', desc: '工时汇总', tone: 'cyan', icon: IconClockCircle },
  { title: '报表中心', desc: '数据报表', tone: 'violet', icon: IconBarChart },
];

export const chartSeries = [
  { label: '项目总数', color: '#2563eb', points: '0,92 55,98 110,108 165,86 220,66 275,84 330,73 385,50 440,42 495,53 550,41 605,32 660,33' },
  { label: '完成项目', color: '#36b895', points: '0,124 55,124 110,135 165,114 220,98 275,120 330,115 385,91 440,82 495,95 550,88 605,66 660,62' },
  { label: '延期项目', color: '#ef4444', points: '0,166 55,162 110,171 165,160 220,152 275,167 330,166 385,151 440,143 495,154 550,150 605,143 660,142' },
];
