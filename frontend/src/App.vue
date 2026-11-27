<template>
  <div class="h-full w-full flex flex-col text-ink overflow-hidden relative">
    <!-- Global Living Pale-Pastel Aurora Mesh Background across ALL routes -->
    <AmbientSilkBackground />

    <!-- Each page manages its own fixed header + scrollable body -->
    <div class="relative z-10 flex-1 min-h-0 w-full overflow-hidden flex flex-col">
      <router-view v-slot="{ Component }">
        <transition name="fade-up" mode="out-in">
          <component :is="Component" class="flex-1 min-h-0" />
        </transition>
      </router-view>
    </div>

    <FloatingTabbar v-if="showTabbar" />
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { showToast } from 'vant';
import http, { API_BASE_URL } from '@/api/http';
import { isFirebaseMode } from '@/lib/firebase';
import { waitForFirebaseUser, watchFirebaseSessionRevoked } from '@/api/firebaseBackend';
import { useAuthStore } from '@/stores/auth';
import AmbientSilkBackground from '@/components/AmbientSilkBackground.vue';
import FloatingTabbar from '@/components/FloatingTabbar.vue';

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();

const showTabbar = computed(() => Boolean(route.meta.showTabbar));

let sseSource: EventSource | null = null;
let fbSessionUnsub: (() => void) | null = null;
let pulseTimer: ReturnType<typeof setInterval> | null = null;
let handlingRevoke = false;

function handleForcedLogout() {
  if (handlingRevoke) return;
  handlingRevoke = true;
  stopSessionWatch();
  auth.clearAuth();
  if (!route.path.startsWith('/login') && !route.path.startsWith('/s/')) {
    showToast('当前设备已被移除，请重新登录');
    router.replace('/login');
  }
  setTimeout(() => {
    handlingRevoke = false;
  }, 800);
}

async function checkSessionAlive() {
  if (!auth.accessToken || document.visibilityState === 'hidden') return;
  try {
    await http.get('/auth/ping');
  } catch {
    // 401 is automatically handled by http interceptor -> qingji:session-revoked
  }
}

function startSessionWatch(token: string | null) {
  stopSessionWatch();
  if (!token) return;

  if (isFirebaseMode) {
    // 1. Real-time Firestore onSnapshot listener for instant multi-device kick
    waitForFirebaseUser().then((u) => {
      if (!u || !auth.accessToken) return;
      fbSessionUnsub = watchFirebaseSessionRevoked(() => {
        handleForcedLogout();
      });
    });
  } else if (!API_BASE_URL.startsWith('http')) {
    // 1. Instant real-time SSE push when kicked from another device (Local Express mode)
    try {
      sseSource = new EventSource(`${API_BASE_URL}/auth/session-stream?token=${encodeURIComponent(token)}`);
      sseSource.addEventListener('revoked', () => {
        handleForcedLogout();
      });
    } catch {
      // Fallback to pulse timer below
    }
  }

  // 2. Periodic liveness pulse (handles serverless SCF, mobile sleep, and multi-device kick)
  pulseTimer = setInterval(() => {
    checkSessionAlive();
  }, 8000);
}

function stopSessionWatch() {
  if (sseSource) {
    sseSource.close();
    sseSource = null;
  }
  if (fbSessionUnsub) {
    fbSessionUnsub();
    fbSessionUnsub = null;
  }
  if (pulseTimer) {
    clearInterval(pulseTimer);
    pulseTimer = null;
  }
}

function onVisibilityOrFocus() {
  if (document.visibilityState === 'visible' && auth.accessToken) {
    checkSessionAlive();
  }
}

function onTokensRefreshed(e: Event) {
  const detail = (e as CustomEvent).detail;
  if (detail?.accessToken && detail?.refreshToken) {
    auth.setTokens(detail.accessToken, detail.refreshToken, detail.sessionId);
  }
}

function onStorageSync(e: StorageEvent) {
  if (e.key === 'ms_access_token' && !e.newValue && auth.accessToken) {
    handleForcedLogout();
  }
}

watch(
  () => auth.accessToken,
  (token) => {
    if (token) {
      startSessionWatch(token);
    } else {
      stopSessionWatch();
    }
  },
  { immediate: true }
);

onMounted(() => {
  if (auth.isAuthenticated && !auth.user) {
    auth.fetchMe();
  }
  window.addEventListener('qingji:session-revoked', handleForcedLogout);
  window.addEventListener('qingji:tokens-refreshed', onTokensRefreshed);
  window.addEventListener('visibilitychange', onVisibilityOrFocus);
  window.addEventListener('focus', onVisibilityOrFocus);
  window.addEventListener('storage', onStorageSync);
});

onBeforeUnmount(() => {
  stopSessionWatch();
  window.removeEventListener('qingji:session-revoked', handleForcedLogout);
  window.removeEventListener('qingji:tokens-refreshed', onTokensRefreshed);
  window.removeEventListener('visibilitychange', onVisibilityOrFocus);
  window.removeEventListener('focus', onVisibilityOrFocus);
  window.removeEventListener('storage', onStorageSync);
});
</script>
