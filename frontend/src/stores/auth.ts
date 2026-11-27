import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import http from '@/api/http';
import type { UserProfile } from '@/types';

export const useAuthStore = defineStore('auth', () => {
  const user = ref<UserProfile | null>(null);
  const accessToken = ref<string | null>(localStorage.getItem('ms_access_token'));
  const refreshToken = ref<string | null>(localStorage.getItem('ms_refresh_token'));
  const currentSessionId = ref<string | null>(null);
  const initialized = ref(false);

  const isAuthenticated = computed(() => Boolean(accessToken.value));

  function setTokens(access: string, refresh: string, sessionId?: string) {
    accessToken.value = access;
    refreshToken.value = refresh;
    if (sessionId) currentSessionId.value = sessionId;
    localStorage.setItem('ms_access_token', access);
    localStorage.setItem('ms_refresh_token', refresh);
  }

  function clearAuth() {
    user.value = null;
    accessToken.value = null;
    refreshToken.value = null;
    currentSessionId.value = null;
    localStorage.removeItem('ms_access_token');
    localStorage.removeItem('ms_refresh_token');
  }

  function syncCachedAvatar(avatarUrl?: string | null) {
    if (avatarUrl) {
      localStorage.setItem('ms_last_avatar', avatarUrl);
    } else {
      localStorage.setItem('ms_last_avatar', 'preset:ribbon');
    }
  }

  async function fetchMe() {
    if (!accessToken.value) {
      initialized.value = true;
      return;
    }
    try {
      const { data } = await http.get('/auth/me');
      user.value = data.user;
      syncCachedAvatar(data.user?.avatarUrl);
      currentSessionId.value = data.currentSessionId;
    } catch {
      clearAuth();
    } finally {
      initialized.value = true;
    }
  }

  async function login(username: string, password: string) {
    const { data } = await http.post('/auth/login', { username, password });
    user.value = data.user;
    syncCachedAvatar(data.user?.avatarUrl);
    setTokens(data.accessToken, data.refreshToken, data.sessionId);
    initialized.value = true;
    return data;
  }

  async function register(payload: { username: string; password: string; studioName?: string; phone?: string }) {
    const { data } = await http.post('/auth/register', payload);
    user.value = data.user;
    syncCachedAvatar(data.user?.avatarUrl);
    setTokens(data.accessToken, data.refreshToken, data.sessionId);
    initialized.value = true;
    return data;
  }

  async function updateProfile(payload: Partial<UserProfile>) {
    const { data } = await http.put('/auth/me', payload);
    user.value = data.user;
    syncCachedAvatar(data.user?.avatarUrl);
    return data.user;
  }

  async function logout() {
    try {
      await http.post('/auth/logout');
    } catch {
      // ignore
    } finally {
      clearAuth();
    }
  }

  return {
    user,
    accessToken,
    refreshToken,
    currentSessionId,
    initialized,
    isAuthenticated,
    setTokens,
    fetchMe,
    login,
    register,
    updateProfile,
    logout,
    clearAuth,
  };
});
