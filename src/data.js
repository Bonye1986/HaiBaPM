export const projects = [
  {
    key: "0000", code: "0000", name: "湖南海拔互联网科技有限公司", projects: [
      { key: "0000-01", code: "01", name: "海拔PM管理系统", phases: [
        { key: "0000-01-01", code: "0000-01-01", name: "项目模块开发", status: "进行中", progress: 62, dates: "2026-08-01 至 2026-09-30", owner: "李项目" },
      ]},
    ],
  },
  {
    key: "1500", code: "1500", name: "星河科技", projects: [
      { key: "1500-01", code: "01", name: "星云数据平台", phases: [
        { key: "1500-01-01", code: "1500-01-01", name: "一期核心交付", status: "进行中", progress: 68, dates: "2026-07-01 至 2026-08-31", owner: "李项目" },
        { key: "1500-01-02", code: "1500-01-02", name: "二期能力扩展", status: "未开始", progress: 0, dates: "2026-09-01 至 2026-10-20", owner: "王芳" },
      ]},
      { key: "1500-02", code: "02", name: "会员运营中台", phases: [
        { key: "1500-02-01", code: "1500-02-01", name: "会员中心改造", status: "延期", progress: 54, dates: "2026-06-15 至 2026-08-15", owner: "陈晨" },
      ]},
    ],
  },
  {
    key: "1501", code: "1501", name: "启明数字", projects: [
      { key: "1501-01", code: "01", name: "智能营销平台", phases: [
        { key: "1501-01-01", code: "1501-01-01", name: "首期上线", status: "进行中", progress: 42, dates: "2026-08-01 至 2026-09-30", owner: "李项目" },
      ]},
    ],
  },
  {
    key: "1502", code: "1502", name: "云舟信息", projects: [
      { key: "1502-01", code: "01", name: "供应链协同系统", phases: [
        { key: "1502-01-01", code: "1502-01-01", name: "采购协同重构", status: "已完成", progress: 100, dates: "2026-04-10 至 2026-07-20", owner: "刘洋" },
      ]},
    ],
  },
  {
    key: "1503", code: "1503", name: "数智创新", projects: [
      { key: "1503-01", code: "01", name: "经营分析平台", phases: [
        { key: "1503-01-01", code: "1503-01-01", name: "一期数据建设", status: "进行中", progress: 36, dates: "2026-08-01 至 2026-10-15", owner: "王芳" },
      ]},
    ],
  },
  {
    key: "1504", code: "1504", name: "未来医疗", projects: [
      { key: "1504-01", code: "01", name: "院内服务平台", phases: [
        { key: "1504-01-01", code: "1504-01-01", name: "门诊服务升级", status: "未开始", progress: 0, dates: "2026-09-01 至 2026-11-10", owner: "赵敏" },
      ]},
    ],
  },
  {
    key: "1505", code: "1505", name: "极光互娱", projects: [
      { key: "1505-01", code: "01", name: "玩家运营中台", phases: [
        { key: "1505-01-01", code: "1505-01-01", name: "活动中心改版", status: "延期", progress: 64, dates: "2026-07-05 至 2026-08-16", owner: "陈晨" },
      ]},
    ],
  },
  {
    key: "1506", code: "1506", name: "优创信息", projects: [
      { key: "1506-01", code: "01", name: "协同办公门户", phases: [
        { key: "1506-01-01", code: "1506-01-01", name: "统一门户建设", status: "已完成", progress: 100, dates: "2026-05-12 至 2026-07-30", owner: "刘洋" },
      ]},
    ],
  },
  {
    key: "1507", code: "1507", name: "智联软件", projects: [
      { key: "1507-01", code: "01", name: "客户服务系统", phases: [
        { key: "1507-01-01", code: "1507-01-01", name: "工单中心升级", status: "进行中", progress: 51, dates: "2026-08-08 至 2026-09-26", owner: "张伟" },
      ]},
    ],
  },
];

export const taskSeed = [
  { id: "T-260800", phase: "0000-01-01", title: "项目三栏工作区开发", module: "Web端", status: "进行中", owner: "李项目", priority: "P1", start: "2026-08-12", due: "2026-08-28", progress: 62, description: "完成客户、项目期号与任务工作区的联动和响应式适配。" },
  { id: "T-260801", phase: "1500-01-01", title: "完成登录链路测试", module: "小程序", status: "进行中", owner: "李项目", priority: "P1", start: "2026-08-15", due: "2026-08-20", progress: 72, description: "覆盖登录、验证码、Token 续期及异常退出场景，输出测试记录。" },
  { id: "T-260802", phase: "1500-01-01", title: "核对审核状态流转", module: "管理后台", status: "待确认", owner: "王芳", priority: "P1", start: "2026-08-16", due: "2026-08-20", progress: 100, description: "核对待审核、审核通过、驳回和重新提交的状态与权限边界。" },
  { id: "T-260803", phase: "1500-01-01", title: "修复结算比例计算", module: "管理后台", status: "进行中", owner: "张伟", priority: "P0", start: "2026-08-14", due: "2026-08-20", progress: 56, description: "修正多级折扣叠加后的结算比例误差，并补充历史订单回归。" },
  { id: "T-260804", phase: "1500-01-01", title: "输出测试报告终版", module: "测试资料", status: "未开始", owner: "陈晨", priority: "P2", start: "2026-08-20", due: "2026-08-22", progress: 0, description: "汇总功能、兼容性与回归结果，生成可归档测试报告。" },
  { id: "T-260805", phase: "1500-01-01", title: "会员等级接口联调", module: "服务端", status: "延期", owner: "刘洋", priority: "P0", start: "2026-08-10", due: "2026-08-18", progress: 82, description: "完成会员等级、积分倍率和升级条件接口联调，当前受第三方数据阻塞。" },
  { id: "T-260806", phase: "1500-01-01", title: "支付回调幂等校验", module: "服务端", status: "进行中", owner: "张伟", priority: "P1", start: "2026-08-16", due: "2026-08-23", progress: 44, description: "验证重复回调、乱序通知和签名失败场景的处理结果。" },
  { id: "T-260807", phase: "1500-01-01", title: "首页响应式适配", module: "Web端", status: "进行中", owner: "赵敏", priority: "P2", start: "2026-08-17", due: "2026-08-24", progress: 61, description: "完成 1366、1440 和移动窄屏关键布局适配。" },
  { id: "T-260808", phase: "1500-01-01", title: "部署文档与回滚方案", module: "交付资料", status: "未开始", owner: "李项目", priority: "P1", start: "2026-08-22", due: "2026-08-26", progress: 0, description: "整理环境变量、部署步骤、数据迁移与回滚流程。" },
  { id: "T-260809", phase: "1500-01-01", title: "消息通知模板确认", module: "产品需求", status: "待确认", owner: "王芳", priority: "P2", start: "2026-08-15", due: "2026-08-21", progress: 100, description: "确认短信、站内信及邮件通知模板和触发条件。" },
  { id: "T-260810", phase: "1500-01-01", title: "数据权限回归测试", module: "测试", status: "未开始", owner: "陈晨", priority: "P1", start: "2026-08-23", due: "2026-08-27", progress: 0, description: "验证项目经理、执行成员和外部协作人的数据范围。" },
  { id: "T-260811", phase: "1500-01-02", title: "二期需求范围梳理", module: "产品需求", status: "未开始", owner: "王芳", priority: "P1", start: "2026-09-01", due: "2026-09-05", progress: 0, description: "梳理二期增量功能、约束及不包含范围。" },
  { id: "T-260812", phase: "1500-02-01", title: "会员画像规则复核", module: "管理后台", status: "延期", owner: "李项目", priority: "P0", start: "2026-08-02", due: "2026-08-15", progress: 54, description: "复核会员标签生成逻辑及存量数据修复方案。" },
  { id: "T-260813", phase: "1501-01-01", title: "营销活动配置原型", module: "交互设计", status: "进行中", owner: "赵敏", priority: "P1", start: "2026-08-12", due: "2026-08-25", progress: 42, description: "输出活动创建、规则配置和效果查看的交互原型。" },
  { id: "T-260814", phase: "1502-01-01", title: "采购协同验收归档", module: "交付资料", status: "已完成", owner: "刘洋", priority: "P2", start: "2026-07-16", due: "2026-07-20", progress: 100, description: "完成验收单、部署记录和操作手册归档。" },
  { id: "T-260815", phase: "1503-01-01", title: "经营指标口径确认", module: "产品需求", status: "进行中", owner: "王芳", priority: "P1", start: "2026-08-10", due: "2026-08-24", progress: 36, description: "与业务方确认经营指标定义、数据范围和更新时间。" },
  { id: "T-260816", phase: "1504-01-01", title: "门诊流程需求调研", module: "产品需求", status: "未开始", owner: "赵敏", priority: "P1", start: "2026-09-01", due: "2026-09-08", progress: 0, description: "梳理患者端和医护端的门诊服务流程。" },
  { id: "T-260817", phase: "1505-01-01", title: "活动规则兼容处理", module: "服务端", status: "延期", owner: "陈晨", priority: "P0", start: "2026-08-01", due: "2026-08-16", progress: 64, description: "处理历史活动规则与新版配置模型的兼容问题。" },
  { id: "T-260818", phase: "1506-01-01", title: "统一门户验收归档", module: "交付资料", status: "已完成", owner: "刘洋", priority: "P2", start: "2026-07-24", due: "2026-07-30", progress: 100, description: "整理并归档门户验收材料和运维手册。" },
  { id: "T-260819", phase: "1507-01-01", title: "工单路由规则开发", module: "服务端", status: "进行中", owner: "张伟", priority: "P1", start: "2026-08-12", due: "2026-08-28", progress: 51, description: "根据业务类型和服务等级自动分派工单。" },
];

export const statusColors = { "未完成": "arcoblue", "进行中": "arcoblue", "待确认": "orange", "延期": "red", "已完成": "green", "未开始": "gray" };
export const priorityColors = { P0: "red", P1: "orange", P2: "gray" };

export function phaseByKey(key) {
  for (const customer of projects) {
    for (const project of customer.projects) {
      const phase = project.phases.find(item => item.key === key);
      if (phase) return { ...phase, customerCode: customer.code, customerName: customer.name, projectCode: project.code, projectName: project.name };
    }
  }
  return null;
}
