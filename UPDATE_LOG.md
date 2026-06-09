# Update Log

## 2026-06-09

- Converted the original static login page into a Vue 3 + Vite frontend project.
- Added Arco Design Vue (`@arco-design/web-vue`) and rebuilt the login form with Arco form, input, checkbox, button, alert, and icon components.
- Kept the current scope to the PC layout only; removed tablet and mobile responsive rules for now.
- Refined the PC login panel proportions so the panel is more compact and polished.
- Split the left brand area into editable frontend elements:
  - Logo image: `public/assets/logo-mark.png`
  - Brand text and positioning copy rendered as DOM text
  - Illustration image: `public/assets/login-visual.png`
  - Blue background rendered with CSS gradients
- Removed the old full-panel background image so brand copy is no longer baked into a bitmap.
- Tuned form icon proportions:
  - Input icons to 16px
  - Checkbox to 18px
  - Notice icon to 20px
- Updated footer copyright to `© 2026 湖南海拔科技 版权所有`.
- Removed language switch, privacy policy, and service terms from the page.
- Verified the PC page at `1200x880` and `1440x900`; no horizontal overflow observed.
- Polished the PC form density after review:
  - Reduced input height from 58px to 48px.
  - Reduced button height from 52px to 48px.
  - Narrowed the form from 406px to 386px.
  - Lightened description text weight and reduced vertical spacing.
  - Reduced input/button shadows and notice block padding for a more refined look.
- Updated the internal-use notice copy from `请联系系统管理员` to `请联系管理员`.
