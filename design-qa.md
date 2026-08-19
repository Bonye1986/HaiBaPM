# Design QA

## Comparison Target

- Primary layout source: `/var/folders/3r/w_nsz4pd21x6yt6d95b8vht80000gn/T/codex-clipboard-b5647910-e93f-4967-8fd2-42b0b9e7f6e7.png`
- Scoped customer-panel annotation: `/var/folders/3r/w_nsz4pd21x6yt6d95b8vht80000gn/T/codex-clipboard-5758b68e-b64f-433e-bd9f-9608fe7e65a4.png`
- Scoped project-navigation annotation: `/var/folders/3r/w_nsz4pd21x6yt6d95b8vht80000gn/T/codex-clipboard-ffd72f67-0e84-4130-a494-e9b2cc45db87.png`
- Scoped header annotation: `/var/folders/3r/w_nsz4pd21x6yt6d95b8vht80000gn/T/codex-clipboard-839f65e3-d352-4e8d-82ba-e081e84c68c1.png`
- Scoped project-row annotation: `/var/folders/3r/w_nsz4pd21x6yt6d95b8vht80000gn/T/codex-clipboard-93e74158-4407-4ea3-8b1d-4ec1bc41e757.png`
- Scoped project-number annotation: `/var/folders/3r/w_nsz4pd21x6yt6d95b8vht80000gn/T/codex-clipboard-d2cb6f84-edcd-4be7-88d9-197341e3df61.png`
- Scoped customer-column behavior: the customer column can collapse and expand while preserving the selected customer and releasing layout width to the project/task regions.
- Scoped task-toolbar/table annotation: `/var/folders/3r/w_nsz4pd21x6yt6d95b8vht80000gn/T/codex-clipboard-0fa21e77-30c4-4e1b-b419-17c60463c1ad.png`
- Scoped unified-navigation annotation: `/var/folders/3r/w_nsz4pd21x6yt6d95b8vht80000gn/T/codex-clipboard-b4c82571-c6f4-463b-9054-6284e995ac29.png`
- Implementation URL: `http://127.0.0.1:4180/`
- Latest implementation screenshot: unavailable after the unified-navigation change; browser capture was denied by the local preview security policy.
- Full comparison: `qa-screenshots/project-three-column-full-comparison.png`
- Navigation comparison: `qa-screenshots/project-three-column-navigation-comparison.png`
- Customer annotation comparison: `qa-screenshots/customer-readonly-annotation-comparison.png`
- Project-navigation annotation comparison: `qa-screenshots/project-navigation-annotation-comparison.png`
- Header annotation comparison: `qa-screenshots/header-brand-navigation-annotation-comparison.png`
- Project-number annotation comparison: `qa-screenshots/project-number-annotation-comparison.png`
- Customer-column state comparison: `qa-screenshots/customer-column-collapse-comparison.png`
- Task-toolbar/table annotation comparison: `qa-screenshots/task-toolbar-table-removal-comparison.png`
- Unified-navigation comparison: unavailable because the post-change browser screenshot was blocked.
- Source viewport: `2070 x 926`; implementation viewport: `1280 x 720`
- Required states: selected customer and no customer selected; tree/list views; phase `1500-01-01`; all tasks

## Full-View Comparison Evidence

The full comparison normalizes both images to a 1280-pixel display width while preserving the source aspect ratio. Both use the same horizontal global navigation and customer / project-phase / task hierarchy. DOM measurements are `224px / 274px / 746px`, exactly `18% / 22% / 60%` after container gaps and padding. The document remains `1280px` wide with no page-level horizontal overflow.

At 1280px the implementation reflows the task status and search controls to two rows. The 2070px source keeps them on one line. This is an intentional responsive adaptation.

## Focused Region Evidence

The navigation comparison confirms the same panel order, headings, search controls, selection styling, quick entries, status filters, and project hierarchy. The customer annotation comparison confirms that the highlighted management and add controls were removed, the search field now uses the full available width, and customer rows display `编号-名称`.

The previous project-navigation comparison confirms that the project settings menu and standalone clear button are removed and both quick entries are recent phases. The latest selected-customer, all-customer tree, and all-customer list captures confirm removal of the separate selected-customer row, compact heading toggle placement, customer grouping behavior, and responsive spacing.

The latest project-number annotation requires full customer-project identifiers in tree nodes. The project node now renders the hierarchy key (for example `0000-01 海拔PM管理系统`) instead of the local project suffix (`01 海拔PM管理系统`).

The customer-column comparison uses the same `1280 x 720` viewport and selected `1500-星河科技` state. Expanded widths are `224px / 274px / 746px`; collapsed widths are `48px / 321px / 875px`. The project and task regions absorb the released width without document overflow. At the mobile breakpoint, the collapsed customer entry is `48px` high, uses a horizontal label, and the page remains within the viewport.

The latest task-table comparison confirms the annotated `清除` control and `进度` column are absent. The remaining six data columns plus row selection fit the desktop table frame (`683px` client and scroll width, `682px` rendered table width), so the previous horizontal scrollbar is gone. Priority, operation, and `YYYY-MM-DD` deadline values remain on one line.

The unified-navigation change was inspected in the DOM before browser access was blocked: there is one `project-navigator` container, one shared `搜索客户、项目或期号` field, and customer/project subregions remain present. A post-change visual screenshot and interaction capture are still required.

The header comparison confirms the brand is now `海拔PM` with an Arco upward-trend mark. The selected `项目` item owns its underline through an inset shadow, Arco's displaced selected-label node is hidden, and the neutral header divider remains continuous across the full viewport.

The implementation includes `0000-湖南海拔互联网科技有限公司` as the self-developed-project entity. Selecting it updates the middle panel to `海拔PM管理系统`, selects `项目模块开发`, and loads its task in the right workspace.

## Findings

- No actionable P0, P1, or P2 mismatches remain for the latest scoped annotations. The selected-customer tree renders `0000-01 海拔PM管理系统` in full, and the all-customer tree/list states remain readable at `1280 x 720` without overlapping controls.
- No actionable P0, P1, or P2 issues remain for the customer-column interaction. Both toggle buttons have accessible labels and Arco icons, the expand path remains visible in the collapsed rail, and customer selection survives the round trip.
- No actionable P0, P1, or P2 issues remain for the latest task-toolbar/table annotation. Search retains its built-in clear affordance, `全部模块` remains the module reset path, and removing progress does not alter task status or task-detail behavior.
- [P1] Post-change visual QA is blocked for the unified navigation panel.
  Location: `project-navigator` desktop and responsive states.
  Evidence: the local browser security policy denied the post-change capture after the DOM structure was inspected.
  Impact: the merged card boundaries, shared-search spacing, 4:6 inner split, and responsive customer-collapse presentation cannot be visually certified in this turn.
  Fix: capture the expanded, shared-search, customer-collapsed, and mobile states when local preview browser access is available.

## Required Fidelity Surfaces

- Fonts and typography: PingFang SC / Microsoft YaHei system stack, neutral letter spacing, compact B2B hierarchy, and controlled truncation match the reference.
- Spacing and layout rhythm: the 18:22:60 grid, 8px panel gaps, compact toolbars, row density, borders, and low-radius panels match the source. Tablet and mobile layouts reflow without overlap.
- Colors and visual tokens: Arco blue primary states, neutral surfaces, and semantic green/orange/red statuses align with the reference.
- Image quality and asset fidelity: the source contains no photography or illustration. Interface icons come from Arco Design; no custom SVG or CSS art is used.
- Copy and content: required navigation, customer numbering, project/phase hierarchy, workspace tabs, filters, task fields, and actions are present with realistic local data.

## Interaction Coverage

- Read-only customer list with code/name keyword search.
- CRM-origin customer selection without add, edit, delete, or management controls.
- Customer-to-project filtering with automatic first-phase selection.
- Clicking the active customer clears selection and expands the project scope to all customers.
- Customer-column collapse and expand with preserved customer selection and filter state.
- In all-customer mode, tree view groups by customer and list view includes customer code/name per phase.
- Internal company selection for self-developed projects.
- Project search, status filtering, tree/list switching, and project details.
- Two functional recently-opened phase shortcuts that reorder when a phase is opened.
- Phase switching, task status filters, search, module filtering, sorting, row selection, task creation, and task details.
- Task toolbar without a redundant standalone clear action, and task table without an untrustworthy progress field.
- One unified customer/project navigator with a shared customer-project-phase search.
- Help, notifications, account menu, and inactive-navigation feedback.

## Patches Made

- Replaced the previous two-column page with customer / project-phase / task columns.
- Added read-only numbered customers and realistic project/phase/task data.
- Added `0000-湖南海拔互联网科技有限公司` as the internal ownership entity.
- Removed customer add and management controls based on the CRM synchronization rule.
- Standardized customer labels as `客户编号-客户名称` in the list, tree, selector, and details.
- Removed the project panel settings and standalone clear controls.
- Limited quick entries to recently opened phases and removed the duplicated customer tree level.
- Replaced the grid brand mark and long product name with the Arco upward-trend icon and `海拔PM`.
- Rebuilt the global-nav active indicator inside the selected item and restored the continuous header divider.
- Removed the separate current-customer/view-switch row and moved the compact switch into the project heading.
- Added a no-customer selection state with all-customer project/phase results and aggregate status counts.
- Updated project tree nodes to display full project identifiers such as `0000-01`.
- Captured selected-customer tree, all-customer tree, and all-customer list states at `1280 x 720` and compared the project-number annotation with the implementation.
- Added the customer-column collapse/expand control, a 48px desktop rail, a 48px mobile row, and responsive project/task width redistribution.
- Captured and compared expanded, collapsed desktop, and collapsed mobile states; verified no horizontal overflow and successful state restoration.
- Removed the standalone task-filter clear button and task-list progress column based on the scoped annotation.
- Reduced the task table minimum width and rebalanced the remaining columns so deadlines and headers stay on one line without horizontal overflow at `1280 x 720`.
- Merged the customer and project-phase panels into one navigator card, added the shared search state, and preserved customer selection, tree/list views, and customer-column collapse behavior.
- Confirmed `npm run build` passes and the existing `4180` preview serves the latest code.

final result: blocked
