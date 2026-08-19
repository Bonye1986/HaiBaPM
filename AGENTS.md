# Prototype Instructions

Run the local server yourself and open the preview in the in-app browser. Do not give the user server-start instructions when you can run it.

Before making substantial visual changes, use the Product Design plugin's `get-context` skill when the visual source is unclear or no longer matches the current goal. When the user gives durable prototype-specific design feedback, preferences, or decisions, record them in `AGENTS.md`.

When implementing from a selected generated mock, treat that image as the source of truth for layout, component anatomy, density, spacing, color, typography, visible content, and hierarchy.

## Product decisions

- This is a new standalone design and implementation, not a retrofit of the legacy `prototype` directory.
- Use Vue 3 and Arco Design Vue as the UI component foundation.
- The implementation entry is `src/main.js` mounting `src/App.vue`; do not reintroduce the removed React entrypoints.
- Complete the project module first. Its primary desktop screen uses horizontal global navigation and a three-column customer / project-phase / task workspace at approximately 18:22:60. The first two columns together retain the 40:60 navigation-to-task relationship; tablet and mobile layouts reflow or stack these regions.
- Selecting a customer filters the project/phase navigator and automatically selects that customer's first phase so the task workspace never shows stale cross-customer data.
- Customer records are read-only in this module and are synchronized from CRM, so the customer panel must not expose add, edit, delete, or management controls.
- Customer choices display `客户编号-客户名称`. Reserve `0000-湖南海拔互联网科技有限公司` as the built-in ownership entity for self-developed projects.
- The project/phase panel is navigation-only: no panel configuration menu and no standalone clear-filter button; the search field's built-in clear affordance is sufficient.
- Quick entries show recently opened phases only. The project tree starts at the project level because the selected customer is already clear in the customer panel.
- Do not render a separate selected-customer/view-switch row above the project tree. Keep the compact tree/list switch in the project panel heading.
- Clicking the active customer again clears customer selection. With no customer selected, the project panel uses all customers as its scope: tree view temporarily restores customer grouping, list view shows customer code/name on each phase, and status counts use all-customer totals.
- The header brand is `海拔PM`, using the Arco upward-trend icon. The selected global navigation item renders its underline inside the menu item, while the header divider remains continuous across the full width.
- Project-module controls must be functional: project search and filters, tree switching, task tabs, task search/filter/sort, task creation, task detail, phase detail, notifications, help, and account menus.
- The phase list supports switchable project-tree and flat-list views; both select a phase and update the task list.
- Clicking a project in either phase-list view opens project details.
- Project tree nodes display the full project number from the customer-project hierarchy, for example `0000-01 海拔PM管理系统`, rather than the project-local suffix alone.
- The customer column can collapse into a 48px rail and expand again. Collapsing only changes layout space; it preserves customer selection and filtering state while the project and task regions use the released width.
- The task toolbar has no standalone clear button; task search uses its built-in clear affordance, and status filtering uses the `全部状态` selector. The task list does not display a progress column because task progress cannot be calculated accurately from the available data.
- Customer and project-phase navigation share one outer panel with a single search field. The inner customer list and project/phase navigator remain linked; searching by customer, project, or phase filters both regions together.
- New tasks use a `任务描述` field with rich-text input for goals, acceptance criteria, dependencies, and deliverables.
- The new-task form exposes `状态` instead of a module selector, with `未完成`、`待确认`、`已完成` options; module remains an internal default for task filtering compatibility.
- The new-task context card labels the selected phase as `项目期号`.
- Task descriptions support image, audio, and video insertion through the rich-text toolbar; media is limited by type/size and stored as sanitized data URLs in the prototype state.
- The task-list toolbar uses a status filter instead of a module filter; the default is `全部状态`, and there is no separate task-status tab row above the search controls.
- The task workspace keeps only `任务列表`、`看板视图`、`统计分析`、`文件` tabs. `甘特图` and the tab-level `设置` entry are removed; new-task and bulk actions live in the search/filter bar, while the phase header icon is the settings entry.
