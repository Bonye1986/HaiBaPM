<script setup>
import { reactive } from 'vue';
import {
  IconEyeInvisible,
  IconInfoCircle,
  IconLock,
  IconUser,
} from '@arco-design/web-vue/es/icon';

const form = reactive({
  username: '',
  password: '',
  remember: false,
});
</script>

<template>
  <main class="design-canvas">
    <section class="login-shell" aria-label="项目管理系统登录">
      <div class="brand-panel">
        <div class="brand-lockup" aria-label="项目管理系统 Project Management System">
          <img class="brand-logo" src="/assets/logo-mark.png" alt="" />
          <div>
            <p class="brand-name">项目管理系统</p>
            <p class="brand-subtitle">Project Management System</p>
          </div>
        </div>

        <div class="brand-positioning">
          <h2>高效协作 · 智能管理 · 驱动成功</h2>
          <p>让项目管理更简单，让团队协作更高效</p>
        </div>

        <img class="brand-visual" src="/assets/login-visual.png" alt="" />
      </div>

      <div class="form-panel">
        <a-form :model="form" layout="vertical" class="login-form" @submit.prevent>
          <h1 class="login-title">欢迎登录</h1>
          <p class="login-desc">登录项目管理系统，开启高效协作之旅</p>

          <a-form-item field="username" hide-label class="form-item">
            <a-input
              v-model="form.username"
              class="login-input"
              size="large"
              placeholder="请输入账号"
              allow-clear
            >
              <template #prefix>
                <icon-user />
              </template>
            </a-input>
          </a-form-item>

          <a-form-item field="password" hide-label class="form-item">
            <a-input-password
              v-model="form.password"
              class="login-input"
              size="large"
              placeholder="请输入密码"
            >
              <template #prefix>
                <icon-lock />
              </template>
              <template #visibility-icon>
                <icon-eye-invisible />
              </template>
            </a-input-password>
          </a-form-item>

          <div class="form-row">
            <a-checkbox v-model="form.remember" class="remember">记住我</a-checkbox>
            <a-link class="forgot" href="#">忘记密码?</a-link>
          </div>

          <a-button type="primary" size="large" long class="submit">登录</a-button>

          <a-alert type="info" class="notice" :show-icon="false">
            <div class="notice-content">
              <icon-info-circle class="notice-icon" />
              <p>项目管理系统为公司内部使用系统<br />账号由管理员统一创建，如需使用请联系管理员</p>
            </div>
          </a-alert>
        </a-form>
      </div>
    </section>

    <footer class="footer">
      <span>© 2026 湖南海拔科技 版权所有</span>
      <span class="divider"></span>
      <a href="#">帮助中心</a>
    </footer>
  </main>
</template>

<style scoped>
:global(*) {
  box-sizing: border-box;
}

:global(html),
:global(body),
:global(#app) {
  width: 100%;
  min-height: 100%;
  margin: 0;
  font-family: "PingFang SC", "Microsoft YaHei", "Noto Sans SC", Arial, sans-serif;
  background: #edf6ff;
}

:global(body) {
  overflow-x: hidden;
}

.design-canvas {
  width: 100%;
  min-height: 100svh;
  display: grid;
  grid-template-rows: 1fr auto;
  gap: clamp(20px, 3vh, 38px);
  padding: clamp(36px, 7vh, 76px) clamp(28px, 8vw, 176px) clamp(24px, 4vh, 48px);
  background:
    radial-gradient(circle at 14% 9%, rgba(255, 255, 255, .98) 0 11%, transparent 31%),
    radial-gradient(circle at 86% 8%, rgba(255, 255, 255, .92) 0 13%, transparent 34%),
    linear-gradient(180deg, #f2f8ff 0%, #edf6ff 57%, #f6fbff 100%);
  color: #091540;
}

.login-shell {
  align-self: center;
  width: min(1120px, 100%);
  min-height: clamp(620px, 76vh, 720px);
  margin: 0 auto;
  display: grid;
  grid-template-columns: minmax(470px, 53.5%) minmax(380px, 1fr);
  overflow: hidden;
  border-radius: 18px;
  background: #fff;
  box-shadow: 0 28px 72px rgba(49, 103, 173, .18);
}

.brand-panel {
  position: relative;
  min-height: 620px;
  overflow: hidden;
  color: #fff;
  background:
    radial-gradient(circle at 52% 42%, rgba(255, 255, 255, .16) 0 10%, transparent 34%),
    radial-gradient(circle at 80% 18%, rgba(71, 151, 255, .25), transparent 36%),
    linear-gradient(180deg, #2364e8 0%, #2d75ee 56%, #96cbff 100%);
}

.brand-panel::after {
  content: "";
  position: absolute;
  inset: auto 0 0;
  z-index: 0;
  height: 190px;
  background: linear-gradient(180deg, rgba(51, 126, 241, 0) 0%, rgba(164, 211, 255, .72) 72%, rgba(205, 231, 255, .84) 100%);
  pointer-events: none;
}

.brand-lockup {
  position: absolute;
  left: 46px;
  top: 48px;
  z-index: 3;
  display: grid;
  grid-template-columns: 46px auto;
  align-items: center;
  column-gap: 12px;
}

.brand-logo {
  width: 46px;
  height: 46px;
  display: block;
  object-fit: contain;
}

.brand-name {
  margin: 0 0 6px;
  color: #fff;
  font-size: 23px;
  line-height: 1;
  font-weight: 700;
  letter-spacing: 0;
  text-shadow: 0 3px 12px rgba(0, 50, 150, .16);
}

.brand-subtitle {
  margin: 0;
  color: rgba(255, 255, 255, .94);
  font-size: 11px;
  line-height: 1;
  font-weight: 500;
  text-shadow: 0 2px 8px rgba(0, 50, 150, .12);
}

.brand-positioning {
  position: absolute;
  left: 0;
  top: 143px;
  z-index: 3;
  width: 100%;
  padding: 0 44px;
  text-align: center;
}

.brand-positioning h2 {
  margin: 0;
  color: #fff;
  font-size: 29px;
  line-height: 1.25;
  font-weight: 800;
  letter-spacing: 0;
  text-shadow: 0 6px 18px rgba(0, 48, 155, .22);
}

.brand-positioning p {
  margin: 21px 0 0;
  color: rgba(255, 255, 255, .96);
  font-size: 18px;
  line-height: 1.4;
  font-weight: 500;
  text-shadow: 0 4px 14px rgba(0, 48, 155, .16);
}

.brand-visual {
  position: absolute;
  left: 50%;
  bottom: -1px;
  z-index: 2;
  width: 100%;
  height: auto;
  display: block;
  transform: translateX(-50%);
  object-fit: contain;
  object-position: bottom center;
  -webkit-mask-image: linear-gradient(180deg, transparent 0, rgba(0, 0, 0, .45) 18px, #000 52px);
  mask-image: linear-gradient(180deg, transparent 0, rgba(0, 0, 0, .45) 18px, #000 52px);
}

.form-panel {
  position: relative;
  display: grid;
  align-items: center;
  justify-items: center;
  min-height: 620px;
  padding: clamp(44px, 5.8vh, 68px) clamp(36px, 4.2vw, 54px) clamp(38px, 5.2vh, 60px);
  background:
    radial-gradient(circle at 43% 20%, rgba(240, 245, 255, .76), transparent 34%),
    linear-gradient(180deg, #ffffff 0%, #ffffff 100%);
}

.login-form {
  width: min(386px, 100%);
}

.login-title {
  margin: 0;
  text-align: center;
  font-size: clamp(29px, 2.35vw, 34px);
  line-height: 1.18;
  font-weight: 800;
  letter-spacing: 0;
  color: #071238;
}

.login-desc {
  margin: 12px 0 clamp(26px, 4.2vh, 38px);
  text-align: center;
  font-size: clamp(15px, 1.25vw, 16px);
  line-height: 1.4;
  font-weight: 500;
  color: #647192;
}

.form-item {
  margin-bottom: clamp(16px, 2vh, 20px);
}

.login-input {
  width: 100%;
}

.login-input {
  height: 48px;
  border: 1px solid #dce3f0;
  border-radius: 7px;
  background: #fff;
  box-shadow: 0 6px 14px rgba(55, 82, 125, .025);
}

.login-input :deep(.arco-input-wrapper) {
  height: 100%;
  background: transparent;
}

.login-input :deep(.arco-input),
.login-input :deep(input) {
  color: #1d2a54;
  font-size: 15px;
  font-weight: 500;
}

.login-input :deep(.arco-input::placeholder),
.login-input :deep(input::placeholder) {
  color: #9aa5bd;
  opacity: 1;
}

.login-input :deep(.arco-input-prefix),
.login-input :deep(.arco-input-suffix) {
  color: #66779d;
  font-size: 17px;
}

.login-input :deep(.arco-input-prefix) {
  margin-right: 12px;
}

.login-input :deep(.arco-input-suffix) {
  margin-left: 12px;
}

.login-input :deep(.arco-icon) {
  width: 17px;
  height: 17px;
  stroke-width: 4;
}

.form-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 0 0 clamp(20px, 2.8vh, 24px);
  font-size: 15px;
  font-weight: 500;
}

.remember {
  color: #435077;
  font-size: 15px;
}

.remember :deep(.arco-checkbox-icon) {
  width: 18px;
  height: 18px;
  border-color: #cfd7e6;
  border-radius: 4px;
}

.remember :deep(.arco-checkbox-icon .arco-icon) {
  width: 12px;
  height: 12px;
}

.forgot {
  color: #1f63ff;
  font-weight: 600;
}

.submit {
  height: 48px;
  border-radius: 6px;
  background: linear-gradient(90deg, #1e63fb 0%, #245cff 100%);
  font-size: 17px;
  font-weight: 700;
  box-shadow: 0 8px 18px rgba(30, 96, 252, .15);
}

.notice {
  width: 100%;
  min-height: 76px;
  margin-top: clamp(22px, 3vh, 28px);
  padding: 0;
  border: 0;
  border-radius: 7px;
  background: linear-gradient(90deg, #e8f1ff 0%, #eef6ff 100%);
}

.notice :deep(.arco-alert-content) {
  width: 100%;
}

.notice-content {
  display: grid;
  grid-template-columns: 22px auto;
  column-gap: 12px;
  padding: 15px 20px 14px;
}

.notice-icon {
  width: 20px;
  height: 20px;
  margin-top: 4px;
  color: #2165ff;
  stroke-width: 4;
}

.notice p {
  margin: 0;
  color: #35436a;
  font-size: 14px;
  line-height: 1.62;
  font-weight: 600;
}

.footer {
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 27px;
  color: #5b6887;
  font-size: 16px;
  font-weight: 500;
}

.footer a {
  color: inherit;
  text-decoration: none;
}

.footer .divider {
  width: 1px;
  height: 17px;
  background: #8f99b3;
  opacity: .75;
}

</style>
