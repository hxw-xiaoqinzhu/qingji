import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useStorage } from '@vueuse/core';
import dayjs from 'dayjs';

export const useUiStore = defineStore('ui', () => {
  const privacyMode = useStorage('ms_privacy_mode', false);
  const selectedCalendarDate = ref(dayjs().format('YYYY-MM-DD'));

  function togglePrivacy() {
    privacyMode.value = !privacyMode.value;
  }

  function formatMoney(amount: number | string | undefined | null, prefix = '¥'): string {
    if (privacyMode.value) return `${prefix}****`;
    const num = Number(amount || 0);
    return `${prefix}${num.toLocaleString('zh-CN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
  }

  return {
    privacyMode,
    selectedCalendarDate,
    togglePrivacy,
    formatMoney,
  };
});
