<template>
  <div class="relative h-full scroll-pane no-scrollbar px-6 pt-safe-screen pb-safe-sheet flex flex-col justify-center overflow-hidden">
    <!-- Subtle Sculpted Specular Light Halo behind the Center Stage -->
    <div
      class="pointer-events-none absolute left-1/2 top-[28%] -translate-x-1/2 -translate-y-1/2 w-[280px] h-[280px] rounded-full login-halo"
      aria-hidden="true"
    />

    <div class="relative z-10 w-full max-w-[344px] mx-auto -mt-6">
      <!-- Sculpted Circular Liquid-Glass Avatar Medallion + Poised Brand Wordmark -->
      <div class="flex flex-col items-center text-center mb-7 select-none">
        <div class="relative mb-4">
          <div class="login-avatar-aura" aria-hidden="true" />
          <div class="login-avatar-shell">
            <div class="login-avatar-ring">
              <StudioAvatar :src="savedAvatar" :size="72" rounded-class="rounded-full" />
            </div>
          </div>
          <!-- Delicate Floating Couture Sparkles -->
          <svg
            class="pointer-events-none absolute -right-2.5 top-1 w-4 h-4 login-sparkle-1"
            viewBox="0 0 20 20"
            fill="none"
            aria-hidden="true"
          >
            <path d="M10 1L11.8 7.2L18 9L11.8 10.8L10 17L8.2 10.8L2 9L8.2 7.2L10 1Z" fill="#DF9FB2" />
          </svg>
          <svg
            class="pointer-events-none absolute -left-2 bottom-2.5 w-3 h-3 login-sparkle-2"
            viewBox="0 0 20 20"
            fill="none"
            aria-hidden="true"
          >
            <path d="M10 2L11.5 7.5L17 9L11.5 10.5L10 16L8.5 10.5L3 9L8.5 7.5L10 2Z" fill="#E8C6AE" />
          </svg>
        </div>

        <h1 class="text-[31px] font-semibold tracking-[0.22em] indent-[0.22em] text-[#3A2D32] leading-none">
          晴记
        </h1>
        <span class="block w-6 h-[2.5px] rounded-full mx-auto mt-3 wordmark-accent" />
      </div>

      <!-- Concentric iOS 27 Liquid Glass Pavilion (R_outer=30px, p=14px -> R_inner=16px) -->
      <form class="login-glass-shell p-[14px]" @submit.prevent="handleSubmit">
        <!-- Unified Inset Porcelain Field Group -->
        <div class="login-field-group overflow-hidden">
          <!-- Row 1: Username -->
          <label class="login-row">
            <span class="login-row-label">账号</span>
            <span class="login-row-divider" />
            <input
              v-model.trim="form.username"
              type="text"
              autocomplete="username"
              placeholder="请输入账号"
              class="login-row-input"
            />
          </label>

          <!-- Optional Row: Studio Name (Register only) -->
          <template v-if="mode === 'register'">
            <div class="mx-4 h-[1px] bg-[#F2E6EA]" />
            <label class="login-row stagger-item">
              <span class="login-row-label">名称</span>
              <span class="login-row-divider" />
              <input
                v-model.trim="form.studioName"
                type="text"
                placeholder="化妆室名称（选填）"
                class="login-row-input"
              />
            </label>
          </template>

          <div class="mx-4 h-[1px] bg-[#F2E6EA]" />

          <!-- Row 2: Password -->
          <label class="login-row">
            <span class="login-row-label">密码</span>
            <span class="login-row-divider" />
            <input
              v-model="form.password"
              :type="showPwd ? 'text' : 'password'"
              autocomplete="current-password"
              :placeholder="mode === 'register' ? '设置 6 位以上密码' : '请输入密码'"
              class="login-row-input pr-2"
            />
            <button
              type="button"
              class="w-7 h-7 rounded-full flex items-center justify-center text-[#B2A0A7] active:bg-[#FAF0F3] active:text-[#C47E91] transition-colors shrink-0"
              :aria-label="showPwd ? '隐藏密码' : '显示密码'"
              @click.prevent="showPwd = !showPwd"
            >
              <IconLashEyeClosed v-if="showPwd" :size="16" />
              <IconLashEyeOpen v-else :size="16" />
            </button>
          </label>
        </div>

        <!-- Inline Soft Error Pill -->
        <p
          v-if="errorMsg"
          class="mt-2.5 text-[12.5px] text-status-danger-text bg-white/85 border border-[#F0D5DC] px-3.5 py-2 rounded-[12px] text-center"
        >
          {{ errorMsg }}
        </p>

        <!-- Concentric Primary Action Button (R_inner=16px) -->
        <button
          type="submit"
          :disabled="loading"
          class="login-submit-btn mt-3 w-full h-[48px] rounded-[16px] text-white text-[14.5px] font-semibold tracking-[0.08em] flex items-center justify-center gap-1.5 disabled:opacity-60"
        >
          <span>{{ loading ? '请稍候...' : mode === 'login' ? '进入晴记' : '注册并进入' }}</span>
          <svg
            v-if="!loading"
            viewBox="0 0 20 20"
            class="w-[15px] h-[15px] opacity-90"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M4.5 10h11M11 5.5 15.5 10 11 14.5" />
          </svg>
        </button>
      </form>

      <!-- Delicate Frosted Pill Mode Switch -->
      <div class="mt-5 flex justify-center">
        <button
          type="button"
          class="login-switch-pill pressable inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-[12.5px]"
          @click="switchMode(mode === 'login' ? 'register' : 'login')"
        >
          <span class="text-[#8B7A81]">{{ mode === 'login' ? '还没有账号？' : '已有账号？' }}</span>
          <span class="text-[#B87487] font-semibold">{{ mode === 'login' ? '注册账号' : '返回登录' }}</span>
        </button>
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
.login-halo {
  background: radial-gradient(
    circle,
    rgba(255, 255, 255, 0.85) 0%,
    rgba(252, 232, 239, 0.35) 48%,
    rgba(252, 232, 239, 0) 72%
  );
  animation: haloPulse 16s ease-in-out infinite alternate;
}

@keyframes haloPulse {
  0% {
    transform: translate3d(-50%, -50%, 0) scale(0.94);
    opacity: 0.75;
  }
  100% {
    transform: translate3d(-50%, -50%, 0) scale(1.12);
    opacity: 1;
  }
}

.wordmark-accent {
  background: linear-gradient(90deg, #E8B9C6 0%, #E7C9BA 100%);
}

.login-avatar-aura {
  position: absolute;
  inset: -12px;
  border-radius: 9999px;
  background: radial-gradient(
    circle,
    rgba(243, 200, 214, 0.42) 0%,
    rgba(246, 224, 206, 0.22) 52%,
    rgba(255, 255, 255, 0) 74%
  );
  filter: blur(8px);
  pointer-events: none;
}

.login-avatar-shell {
  position: relative;
  padding: 6px;
  border-radius: 9999px;
  background: linear-gradient(155deg, rgba(255, 255, 255, 0.82) 0%, rgba(255, 247, 250, 0.56) 100%);
  backdrop-filter: blur(18px) saturate(170%);
  -webkit-backdrop-filter: blur(18px) saturate(170%);
  border: 1px solid rgba(255, 255, 255, 0.94);
  box-shadow:
    0 16px 34px -12px rgba(186, 126, 146, 0.28),
    inset 0 1px 1px rgba(255, 255, 255, 0.96);
}

.login-avatar-ring {
  padding: 2.5px;
  border-radius: 9999px;
  background: linear-gradient(135deg, #F3D1DC 0%, #FFFFFF 50%, #ECD2C6 100%);
}

.login-sparkle-1 {
  animation: sparkleFloat 5.5s ease-in-out infinite alternate;
}

.login-sparkle-2 {
  animation: sparkleFloat 6.8s ease-in-out 1.2s infinite alternate;
}

@keyframes sparkleFloat {
  0% {
    transform: translateY(0) scale(0.92);
    opacity: 0.65;
  }
  100% {
    transform: translateY(-3px) scale(1.08);
    opacity: 1;
  }
}

.login-glass-shell {
  border-radius: 30px;
  background: linear-gradient(
    165deg,
    rgba(255, 255, 255, 0.72) 0%,
    rgba(255, 250, 252, 0.54) 100%
  );
  backdrop-filter: blur(28px) saturate(185%);
  -webkit-backdrop-filter: blur(28px) saturate(185%);
  border: 1px solid rgba(255, 255, 255, 0.94);
  box-shadow:
    0 24px 50px -14px rgba(182, 126, 144, 0.17),
    0 4px 12px -2px rgba(182, 126, 144, 0.05),
    inset 0 1px 1px rgba(255, 255, 255, 0.98);
}

.login-field-group {
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.90);
  border: 1px solid rgba(238, 224, 229, 0.95);
  box-shadow:
    0 2px 10px -2px rgba(180, 136, 148, 0.04),
    inset 0 1px 0 rgba(255, 255, 255, 0.96);
}

.login-row {
  position: relative;
  display: flex;
  align-items: center;
  height: 52px;
  padding: 0 16px;
  cursor: text;
  transition: background-color 180ms ease;
}
.login-row:focus-within {
  background-color: #FFFFFF;
}
.login-row:focus-within .login-row-label {
  color: #B87487;
}
.login-row:focus-within .login-row-divider {
  background-color: #E5B9C5;
}

.login-row-label {
  width: 42px;
  font-size: 13.5px;
  font-weight: 500;
  color: #6B5A61;
  flex-shrink: 0;
  user-select: none;
  transition: color 180ms ease;
}

.login-row-divider {
  width: 1px;
  height: 14px;
  background-color: #EDE0E5;
  margin-right: 14px;
  flex-shrink: 0;
  transition: background-color 180ms ease;
}

.login-row-input {
  flex: 1 1 0%;
  min-width: 0;
  height: 100%;
  background: transparent !important;
  border: 0 !important;
  outline: none !important;
  box-shadow: none !important;
  font-size: 14.5px;
  color: #3A2D32;
}

.login-submit-btn {
  background: linear-gradient(135deg, #EAB6C3 0%, #DC99AA 100%);
  border: 1px solid rgba(255, 255, 255, 0.42);
  box-shadow:
    0 10px 22px -6px rgba(214, 142, 162, 0.42),
    inset 0 1px 1px rgba(255, 255, 255, 0.62);
  transition: transform 160ms cubic-bezier(0.32, 0.72, 0, 1), opacity 160ms ease;
}
.login-submit-btn:active {
  transform: scale(0.975);
}

.login-switch-pill {
  background: rgba(255, 255, 255, 0.62);
  backdrop-filter: blur(16px) saturate(160%);
  -webkit-backdrop-filter: blur(16px) saturate(160%);
  border: 1px solid rgba(255, 255, 255, 0.88);
  box-shadow: 0 4px 14px -4px rgba(180, 136, 148, 0.10);
}
</style>
