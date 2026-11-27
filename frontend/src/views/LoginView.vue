<template>
  <div class="login-page relative h-full scroll-pane no-scrollbar overflow-x-hidden flex flex-col">
    <!-- Top Pale Pastel Blush-Rose Gradient Backdrop -->
    <div class="login-hero-bg" aria-hidden="true">
      <div class="login-hero-beam" />
    </div>

    <!-- Main Centered Column -->
    <div class="relative z-10 w-full max-w-[390px] mx-auto px-5 pt-safe-screen pb-10 flex-1 flex flex-col justify-center">
      <!-- Top Greeting + Perched Circular Avatar Medallion -->
      <div class="relative flex items-end justify-between px-1 pb-5 pt-4 select-none">
        <div class="pb-1 pr-3 min-w-0">
          <h1 class="text-[34px] font-bold tracking-[0.03em] text-white leading-none login-hello-shadow">
            Hello !
          </h1>
          <p class="text-[13px] text-white/92 mt-2.5 font-medium tracking-[0.02em] login-sub-shadow">
            很高兴认识您，欢迎来到晴记
          </p>
        </div>

        <!-- Circular Avatar Perched Elegantly Above the Right Tab -->
        <div class="relative shrink-0 -mb-7 mr-1 z-20">
          <div class="login-avatar-glow" aria-hidden="true" />
          <div class="login-avatar-frame">
            <StudioAvatar :src="savedAvatar" :size="80" rounded-class="rounded-full" />
          </div>
          <!-- Soft Reflection Shadow on Tab Edge -->
          <div class="login-avatar-reflection" aria-hidden="true" />
          <!-- Tiny Floating Sparkles -->
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

      <!-- Signature Curved Folder-Tab Card -->
      <div class="login-card-wrap relative z-10">
        <!-- Folder Tab Bar (Smooth S-Curve Transition between Active White Tab & Frosted Blush Tab) -->
        <div class="relative flex h-[54px]">
          <!-- Frosted Background Strip Behind Inactive Tab -->
          <div class="login-tab-backdrop" aria-hidden="true" />

          <!-- Left Tab: 账号登录 -->
          <button
            type="button"
            class="login-tab-btn relative z-10 flex-1 flex items-center justify-center text-[15.5px] transition-colors"
            :class="mode === 'login' ? 'is-active font-semibold text-[#3C2C32]' : 'font-medium text-[#7D5E69]'"
            @click="switchMode('login')"
          >
            <span>账号登录</span>
          </button>

          <!-- Right Tab: 注册账号 -->
          <button
            type="button"
            class="login-tab-btn relative z-10 flex-1 flex items-center justify-center text-[15.5px] transition-colors"
            :class="mode === 'register' ? 'is-active font-semibold text-[#3C2C32]' : 'font-medium text-[#7D5E69]'"
            @click="switchMode('register')"
          >
            <span>注册账号</span>
          </button>

          <!-- Sliding White Active Tab Silhouette with Iconic S-Curve Shoulder -->
          <div
            class="login-active-tab-shape"
            :class="mode === 'login' ? 'is-left' : 'is-right'"
            aria-hidden="true"
          >
            <svg
              v-if="mode === 'login'"
              class="tab-curve-right"
              viewBox="0 0 36 54"
              preserveAspectRatio="none"
            >
              <path d="M0,0 C14,0 16,54 36,54 L0,54 Z" fill="#FFFFFF" />
            </svg>
            <svg
              v-else
              class="tab-curve-left"
              viewBox="0 0 36 54"
              preserveAspectRatio="none"
            >
              <path d="M36,0 C22,0 20,54 0,54 L36,54 Z" fill="#FFFFFF" />
            </svg>
          </div>
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
  background: linear-gradient(180deg, #FBF2F5 0%, #FFFFFF 46%, #FFFFFF 100%);
}

/* Soft Pale Pastel Blush-Pink Gradient Top Canopy (Mirrors reference structure in rose-blush palette) */
.login-hero-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 46%;
  min-height: 310px;
  background: linear-gradient(
    148deg,
    #E6B3C4 0%,
    #F0CBD8 44%,
    #F9E7EE 78%,
    rgba(255, 255, 255, 0) 100%
  );
  overflow: hidden;
  pointer-events: none;
}

.login-hero-beam {
  position: absolute;
  top: -30%;
  left: -15%;
  width: 85%;
  height: 150%;
  background: linear-gradient(
    130deg,
    rgba(255, 255, 255, 0.24) 0%,
    rgba(255, 255, 255, 0.06) 55%,
    rgba(255, 255, 255, 0) 70%
  );
  transform: rotate(-12deg);
}

.login-hello-shadow {
  text-shadow: 0 2px 12px rgba(173, 108, 129, 0.22);
}

.login-sub-shadow {
  text-shadow: 0 1px 8px rgba(173, 108, 129, 0.18);
}

.login-avatar-glow {
  position: absolute;
  inset: -10px;
  border-radius: 9999px;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.72) 0%, rgba(255, 255, 255, 0) 70%);
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

.login-active-tab-shape {
  position: absolute;
  top: 0;
  bottom: -1px;
  width: 50%;
  background: #FFFFFF;
  z-index: 2;
  transition: transform 280ms cubic-bezier(0.22, 1, 0.36, 1);
}

.login-active-tab-shape.is-left {
  left: 0;
  border-radius: 26px 22px 0 0;
}

.login-active-tab-shape.is-right {
  left: 50%;
  border-radius: 22px 26px 0 0;
}

.tab-curve-right {
  position: absolute;
  top: 0;
  right: -28px;
  width: 32px;
  height: 100%;
  display: block;
}

.tab-curve-left {
  position: absolute;
  top: 0;
  left: -28px;
  width: 32px;
  height: 100%;
  display: block;
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
