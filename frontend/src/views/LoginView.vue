<template>
  <div class="login-page relative h-full scroll-pane no-scrollbar overflow-x-hidden flex flex-col">
    <!-- Top Pale Pastel Blush-Rose Gradient Canopy with Floating Translucent Bubbles -->
    <div class="login-hero-bg" aria-hidden="true">
      <div class="login-hero-beam" />
      <span class="sky-bubble b1" />
      <span class="sky-bubble b2" />
      <span class="sky-bubble b3" />
      <span class="sky-bubble b4" />
      <span class="sky-bubble b5" />
      <span class="sky-bubble b6" />
      <span class="sky-bubble b7" />
    </div>

    <!-- Balanced Editorial Column (Fills top canopy gracefully, never hollow) -->
    <div class="relative z-10 w-full max-w-[390px] mx-auto px-5 pt-safe-screen pb-8 flex-1 flex flex-col">
      <!-- Top Brand Whisper Pill -->
      <div class="pt-3 pb-5 flex items-center justify-between select-none">
        <div class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/35 backdrop-blur-md border border-white/55 text-[11.5px] font-medium text-[#7B4D5D]">
          <span class="w-1.5 h-1.5 rounded-full bg-[#D98BA2]" />
          <span>晴记 · 美妆档期手账</span>
        </div>
        <svg class="w-5 h-5 opacity-70" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M12 2L13.9 8.1L20 10L13.9 11.9L12 18L10.1 11.9L4 10L10.1 8.1L12 2Z" fill="#FFFFFF" />
        </svg>
      </div>

      <!-- Greeting + Perched Circular Avatar Medallion -->
      <div class="relative flex items-end justify-between px-1 pb-5 pt-2 select-none">
        <div class="pb-1 pr-3 min-w-0">
          <h1 class="text-[36px] font-bold tracking-[0.03em] text-white leading-none login-hello-shadow">
            Hello !
          </h1>
          <p class="text-[13.5px] text-[#6B4854]/90 mt-2.5 font-medium tracking-[0.02em]">
            很高兴认识您，欢迎来到晴记
          </p>
        </div>

        <!-- Circular Avatar Perched Elegantly Above the Right Tab -->
        <div class="relative shrink-0 -mb-7 mr-1 z-20">
          <div class="login-avatar-glow" aria-hidden="true" />
          <div class="login-avatar-frame">
            <StudioAvatar :src="savedAvatar" :size="82" rounded-class="rounded-full" />
          </div>
          <div class="login-avatar-reflection" aria-hidden="true" />
          <svg
            class="pointer-events-none absolute -right-2 -top-1 w-4 h-4 login-sparkle"
            viewBox="0 0 20 20"
            fill="none"
            aria-hidden="true"
          >
            <path d="M10 1L11.8 7.2L18 9L11.8 10.8L10 17L8.2 10.8L2 9L8.2 7.2L10 1Z" fill="#FFFFFF" />
          </svg>
        </div>
      </div>

      <!-- Signature Seamless Curved Folder-Tab Card -->
      <div class="login-card-wrap relative z-10">
        <!-- Folder Tab Bar (One Continuous Seamless SVG Curve — Zero Corner Seam!) -->
        <div class="relative flex h-[54px] overflow-hidden rounded-t-[26px]">
          <!-- Frosted Background Strip Behind Inactive Tab -->
          <div class="login-tab-backdrop" aria-hidden="true" />

          <!-- Seamless Single-Path Active White Tab Silhouette -->
          <svg
            class="pointer-events-none absolute inset-0 w-full h-[55px] z-[2]"
            viewBox="0 0 360 55"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path
              v-if="mode === 'login'"
              d="M0,55 L0,26 Q0,0 26,0 L160,0 C186,0 190,54 222,54 L360,54 L360,55 Z"
              fill="#FFFFFF"
            />
            <path
              v-else
              d="M0,55 L0,54 L138,54 C170,54 174,0 200,0 L334,0 Q360,0 360,26 L360,55 Z"
              fill="#FFFFFF"
            />
          </svg>

          <!-- Left Tab: 账号登录 -->
          <button
            type="button"
            class="relative z-10 flex-1 flex items-center justify-center text-[15.5px] transition-colors"
            :class="mode === 'login' ? 'font-semibold text-[#3C2C32]' : 'font-medium text-[#7D5E69]'"
            @click="switchMode('login')"
          >
            <span>账号登录</span>
          </button>

          <!-- Right Tab: 注册账号 -->
          <button
            type="button"
            class="relative z-10 flex-1 flex items-center justify-center text-[15.5px] transition-colors"
            :class="mode === 'register' ? 'font-semibold text-[#3C2C32]' : 'font-medium text-[#7D5E69]'"
            @click="switchMode('register')"
          >
            <span>注册账号</span>
          </button>
        </div>

        <!-- Pure White Form Body -->
        <form class="login-card-body px-6 pt-5 pb-7 space-y-5" @submit.prevent="handleSubmit">
          <!-- Field 1: Username -->
          <div>
            <label class="block text-[13.5px] font-semibold text-[#3F3036] mb-2 pl-1">账号</label>
            <div class="login-pill-field">
              <input
                v-model.trim="form.username"
                type="text"
                autocomplete="username"
                placeholder="请输入账号"
                class="login-pill-input"
              />
            </div>
          </div>

          <!-- Optional Field: Studio Name (Register Mode) -->
          <div v-if="mode === 'register'" class="stagger-item">
            <label class="block text-[13.5px] font-semibold text-[#3F3036] mb-2 pl-1">工作室名称</label>
            <div class="login-pill-field">
              <input
                v-model.trim="form.studioName"
                type="text"
                placeholder="如：嘻嘻化妆室（选填）"
                class="login-pill-input"
              />
            </div>
          </div>

          <!-- Field 2: Password -->
          <div>
            <label class="block text-[13.5px] font-semibold text-[#3F3036] mb-2 pl-1">密码</label>
            <div class="login-pill-field">
              <input
                v-model="form.password"
                :type="showPwd ? 'text' : 'password'"
                autocomplete="current-password"
                :placeholder="mode === 'register' ? '请设置 6 位以上密码' : '请输入密码'"
                class="login-pill-input pr-2"
              />
              <button
                type="button"
                class="w-8 h-8 rounded-full flex items-center justify-center text-[#B29DA5] active:bg-white/80 active:text-[#C47E91] transition-colors shrink-0"
                :aria-label="showPwd ? '隐藏密码' : '显示密码'"
                @click.prevent="showPwd = !showPwd"
              >
                <IconLashEyeClosed v-if="showPwd" :size="16" />
                <IconLashEyeOpen v-else :size="16" />
              </button>
            </div>
          </div>

          <!-- Inline Soft Error Pill -->
          <p
            v-if="errorMsg"
            class="text-[12.5px] text-status-danger-text bg-[#FDF2F5] border border-[#F2D6DE] px-4 py-2 rounded-full text-center"
          >
            {{ errorMsg }}
          </p>

          <!-- Full-Width Soft Blush-Rose Pill Submit CTA -->
          <div class="pt-1">
            <button
              type="submit"
              :disabled="loading"
              class="login-cta-btn w-full h-[50px] rounded-full text-white text-[15.5px] font-semibold tracking-[0.12em] disabled:opacity-60 pressable"
            >
              {{ loading ? '请稍候...' : mode === 'login' ? '登录' : '注册并进入' }}
            </button>
          </div>
        </form>
      </div>

      <!-- Subtle Editorial Footer Whisper -->
      <div class="mt-auto pt-8 text-center select-none">
        <p class="text-[11.5px] text-[#B9A4AC] tracking-[0.06em]">
          每一场双向奔赴 · 都值得被温柔记录
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { IconLashEyeClosed, IconLashEyeOpen } from '@/components/icons/BeautyIcons';
import StudioAvatar from '@/components/StudioAvatar.vue';

const router = useRouter();
const route = useRoute();
const auth = useAuthStore();

const savedAvatar = ref<string>(localStorage.getItem('ms_last_avatar') || 'preset:ribbon');
const mode = ref<'login' | 'register'>('login');
const loading = ref(false);
const showPwd = ref(false);
const errorMsg = ref('');

const form = reactive({
  username: '',
  password: '',
  studioName: '',
});

function switchMode(target: 'login' | 'register') {
  mode.value = target;
  errorMsg.value = '';
}

async function handleSubmit() {
  errorMsg.value = '';
  if (!form.username || !form.password) {
    errorMsg.value = '请输入账号与密码';
    return;
  }
  loading.value = true;
  try {
    if (mode.value === 'login') {
      await auth.login(form.username, form.password);
    } else {
      await auth.register({
        username: form.username,
        password: form.password,
        studioName: form.studioName || undefined,
      });
    }
    const redirect = (route.query.redirect as string) || '/calendar';
    router.replace(redirect);
  } catch (err: any) {
    errorMsg.value = err?.response?.data?.error || '操作失败，请重试';
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.login-page {
  background: linear-gradient(180deg, #FBF2F5 0%, #FFFFFF 48%, #FFFFFF 100%);
}

/* Soft Pale Pastel Blush-Pink Gradient Top Canopy */
.login-hero-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 44%;
  min-height: 300px;
  background: linear-gradient(
    148deg,
    #E7B5C6 0%,
    #F1CDD9 42%,
    #F9E7EE 76%,
    rgba(255, 255, 255, 0) 100%
  );
  overflow: hidden;
  pointer-events: none;
}

.login-hero-beam {
  position: absolute;
  top: -32%;
  left: -15%;
  width: 85%;
  height: 150%;
  background: linear-gradient(
    130deg,
    rgba(255, 255, 255, 0.28) 0%,
    rgba(255, 255, 255, 0.08) 55%,
    rgba(255, 255, 255, 0) 70%
  );
  transform: rotate(-12deg);
}

/* Dreamy Floating Translucent Pastel Bubbles */
.sky-bubble {
  position: absolute;
  border-radius: 9999px;
  background: radial-gradient(
    circle at 32% 28%,
    rgba(255, 255, 255, 0.72) 0%,
    rgba(255, 255, 255, 0.24) 55%,
    rgba(255, 240, 246, 0.08) 100%
  );
  border: 1px solid rgba(255, 255, 255, 0.55);
  box-shadow: inset 0 2px 6px rgba(255, 255, 255, 0.65);
  will-change: transform;
}

.sky-bubble.b1 {
  width: 64px;
  height: 64px;
  top: 14%;
  right: 12%;
  animation: bubbleDriftA 13s ease-in-out infinite alternate;
}
.sky-bubble.b2 {
  width: 36px;
  height: 36px;
  top: 24%;
  left: 16%;
  animation: bubbleDriftB 11s ease-in-out infinite alternate;
}
.sky-bubble.b3 {
  width: 22px;
  height: 22px;
  top: 10%;
  left: 52%;
  animation: bubbleDriftA 9.5s ease-in-out 1.2s infinite alternate;
}
.sky-bubble.b4 {
  width: 48px;
  height: 48px;
  top: 46%;
  left: -10px;
  opacity: 0.75;
  animation: bubbleDriftB 14s ease-in-out 0.6s infinite alternate;
}
.sky-bubble.b5 {
  width: 18px;
  height: 18px;
  top: 38%;
  right: 30%;
  animation: bubbleDriftA 8.5s ease-in-out 2s infinite alternate;
}
.sky-bubble.b6 {
  width: 28px;
  height: 28px;
  top: 56%;
  right: 6%;
  opacity: 0.7;
  animation: bubbleDriftB 12s ease-in-out 1.5s infinite alternate;
}
.sky-bubble.b7 {
  width: 14px;
  height: 14px;
  top: 18%;
  left: 34%;
  opacity: 0.85;
  animation: bubbleDriftA 10s ease-in-out 0.4s infinite alternate;
}

@keyframes bubbleDriftA {
  0% {
    transform: translate3d(0, 0, 0) scale(1);
  }
  100% {
    transform: translate3d(10px, -16px, 0) scale(1.06);
  }
}

@keyframes bubbleDriftB {
  0% {
    transform: translate3d(0, 0, 0) scale(0.96);
  }
  100% {
    transform: translate3d(-10px, -14px, 0) scale(1.04);
  }
}

.login-hello-shadow {
  text-shadow: 0 2px 12px rgba(173, 108, 129, 0.22);
}

.login-avatar-glow {
  position: absolute;
  inset: -10px;
  border-radius: 9999px;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.76) 0%, rgba(255, 255, 255, 0) 70%);
  filter: blur(6px);
  pointer-events: none;
}

.login-avatar-frame {
  position: relative;
  padding: 4px;
  border-radius: 9999px;
  background: linear-gradient(145deg, #FFFFFF 0%, #FCEBF0 55%, #F2D1DC 100%);
  box-shadow:
    0 12px 26px -8px rgba(168, 108, 128, 0.34),
    inset 0 1px 1px rgba(255, 255, 255, 0.96);
}

.login-avatar-reflection {
  position: absolute;
  left: 50%;
  bottom: -10px;
  transform: translateX(-50%);
  width: 64px;
  height: 12px;
  border-radius: 9999px;
  background: radial-gradient(ellipse, rgba(196, 134, 154, 0.28) 0%, rgba(196, 134, 154, 0) 72%);
  filter: blur(4px);
  pointer-events: none;
}

.login-sparkle {
  animation: loginSparkle 4.8s ease-in-out infinite alternate;
}

@keyframes loginSparkle {
  0% {
    transform: translateY(0) scale(0.9);
    opacity: 0.75;
  }
  100% {
    transform: translateY(-3px) scale(1.1);
    opacity: 1;
  }
}

.login-card-wrap {
  border-radius: 26px;
  box-shadow: 0 22px 48px -20px rgba(182, 124, 144, 0.22);
}

.login-tab-backdrop {
  position: absolute;
  inset: 0;
  border-radius: 26px 26px 0 0;
  background: rgba(255, 255, 255, 0.44);
  backdrop-filter: blur(18px) saturate(160%);
  -webkit-backdrop-filter: blur(18px) saturate(160%);
  border: 1px solid rgba(255, 255, 255, 0.72);
  border-bottom: none;
}

.login-card-body {
  background: #FFFFFF;
  border-radius: 0 0 26px 26px;
}

.login-pill-field {
  display: flex;
  align-items: center;
  height: 48px;
  padding: 0 14px 0 20px;
  border-radius: 9999px;
  background: #F8F3F5;
  border: 1px solid transparent;
  transition: background-color 180ms ease, border-color 180ms ease, box-shadow 180ms ease;
}

.login-pill-field:focus-within {
  background: #FFFFFF;
  border-color: #E7BAC7;
  box-shadow: 0 0 0 3px rgba(231, 186, 199, 0.22);
}

.login-pill-input {
  flex: 1;
  min-width: 0;
  height: 100%;
  background: transparent;
  border: none;
  outline: none;
  font-size: 14.5px;
  color: #3A2D32;
}

.login-pill-input::placeholder {
  color: #BCA8B0;
  font-weight: 400;
}

.login-cta-btn {
  background: linear-gradient(92deg, #EAB7C7 0%, #DF9DB1 52%, #D78FA5 100%);
  box-shadow:
    0 12px 24px -10px rgba(206, 132, 155, 0.62),
    inset 0 1px 0 rgba(255, 255, 255, 0.42);
  transition: transform 140ms ease, box-shadow 180ms ease, opacity 160ms ease;
}

.login-cta-btn:active {
  transform: scale(0.985);
}
</style>
