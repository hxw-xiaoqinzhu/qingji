<template>
  <nav class="tabbar-monolith px-2 pt-1.5 w-full select-none">
    <!-- Continuous One-Piece Top Arch & Border (Concentric with larger 54x54 button lowered to cy=+17px) -->
    <div class="pointer-events-none absolute -top-[18px] inset-x-0 h-[19px] flex items-end z-0">
      <!-- Left Wing Flat Top Border -->
      <div class="flex-1 h-[1px] bg-[#EADAE0]" />

      <!-- Mathematically Tangent Circular Dome Arch (R=33.5px around 54x54px r=27px button, r_f=10px shoulder fillets) -->
      <svg
        viewBox="0 0 116 19"
        class="w-[116px] h-[19px] shrink-0 block overflow-visible"
        aria-hidden="true"
      >
        <path
          d="M 0 18.5 L 23.50 18.5 A 10 10 0 0 0 31.43 14.59 A 33.5 33.5 0 0 1 84.57 14.59 A 10 10 0 0 0 92.50 18.5 L 116 18.5 L 116 21 L 0 21 Z"
          fill="#FFFCFD"
        />
        <path
          d="M 0 18.5 L 23.50 18.5 A 10 10 0 0 0 31.43 14.59 A 33.5 33.5 0 0 1 84.57 14.59 A 10 10 0 0 0 92.50 18.5 L 116 18.5"
          fill="none"
          stroke="#EADAE0"
          stroke-width="1"
        />
      </svg>

      <!-- Right Wing Flat Top Border -->
      <div class="flex-1 h-[1px] bg-[#EADAE0]" />
    </div>

    <div class="relative z-10 grid grid-cols-5 items-center max-w-[440px] mx-auto">
      <!-- Liquid Sliding Soft-Blush Indicator Pill for the 4 Outer Tabs (Untouched) -->
      <div
        v-if="activeColIndex >= 0"
        class="absolute top-0 bottom-0 left-0 w-1/5 px-1 py-0.5 pointer-events-none transition-transform duration-300 ease-spring"
        :style="{ transform: `translate3d(${activeColIndex * 100}%, 0, 0)` }"
      >
        <div
          class="w-full h-full rounded-[17px]"
          style="
            background: #FAF0F3;
            box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.95);
          "
        />
      </div>

      <!-- Left 2 Tabs: 档期 & 行程 (Untouched size & position) -->
      <button
        v-for="item in leftTabs"
        :key="item.path"
        type="button"
        class="relative z-10 pressable flex flex-col items-center justify-center py-1.5 rounded-[17px] transition-colors duration-200"
        :class="isTabActive(item.path) ? 'text-brand-deep' : 'text-ink-muted'"
        @click="go(item.path)"
      >
        <div
          class="transition-transform duration-300 ease-spring"
          :class="isTabActive(item.path) ? '-translate-y-0.5 scale-105' : ''"
        >
          <component :is="item.icon" :size="21" />
        </div>
        <span
          class="text-[11px] mt-0.5 leading-tight transition-colors duration-200"
          :class="isTabActive(item.path) ? 'font-semibold text-brand-deep' : 'font-medium'"
        >
          {{ item.label }}
        </span>
      </button>

      <!-- Center Enlarged (54x54) & Slightly Lowered Button (0.00px concentric with cy=+17px SVG Dome) -->
      <div class="relative z-20 h-[48px] flex items-center justify-center">
        <button
          type="button"
          class="center-create-orb pressable w-[54px] h-[54px] rounded-full text-white flex items-center justify-center absolute"
          style="top: -16.5px"
          aria-label="新建妆造行程"
          @click="goCreateOrder"
        >
          <IconCenterCreate :size="25" />
        </button>
      </div>

      <!-- Right 2 Tabs: 账本 & 工作室 (Untouched size & position) -->
      <button
        v-for="item in rightTabs"
        :key="item.path"
        type="button"
        class="relative z-10 pressable flex flex-col items-center justify-center py-1.5 rounded-[17px] transition-colors duration-200"
        :class="isTabActive(item.path) ? 'text-brand-deep' : 'text-ink-muted'"
        @click="go(item.path)"
      >
        <div
          class="transition-transform duration-300 ease-spring"
          :class="isTabActive(item.path) ? '-translate-y-0.5 scale-105' : ''"
        >
          <component :is="item.icon" :size="21" />
        </div>
        <span
          class="text-[11px] mt-0.5 leading-tight transition-colors duration-200"
          :class="isTabActive(item.path) ? 'font-semibold text-brand-deep' : 'font-medium'"
        >
          {{ item.label }}
        </span>
      </button>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useUiStore } from '@/stores/ui';
import {
  IconCenterCreate,
  IconTabCalendar,
  IconTabItinerary,
  IconTabLedger,
  IconTabStudio,
} from '@/components/icons/BeautyIcons';

const route = useRoute();
const router = useRouter();
const ui = useUiStore();

const leftTabs = [
  { label: '档期', path: '/calendar', col: 0, icon: IconTabCalendar },
  { label: '行程', path: '/orders', col: 1, icon: IconTabItinerary },
];

const rightTabs = [
  { label: '账本', path: '/finance', col: 3, icon: IconTabLedger },
  { label: '工作室', path: '/profile', col: 4, icon: IconTabStudio },
];

function isTabActive(path: string) {
  return route.path === path || route.path.startsWith(path + '/');
}

const activeColIndex = computed(() => {
  for (const t of [...leftTabs, ...rightTabs]) {
    if (isTabActive(t.path)) return t.col;
  }
  return -1;
});

function go(path: string) {
  if (route.path !== path) {
    router.replace(path);
  }
}

function goCreateOrder() {
  router.push({
    path: '/orders/new',
    query: { date: ui.selectedCalendarDate },
  });
}
</script>

<style scoped>
.tabbar-monolith {
  position: relative;
  flex-shrink: 0;
  background: #FFFCFD;
  padding-bottom: max(8px, calc(env(safe-area-inset-bottom, 0px) * 0.55));
  z-index: 30;
  box-shadow: 0 -8px 24px -10px rgba(176, 132, 146, 0.12);
}

.center-create-orb {
  background: linear-gradient(155deg, #ECC0CC 0%, #DC99AA 100%);
  border: 1.5px solid rgba(255, 255, 255, 0.9);
  box-shadow:
    0 6px 15px -3px rgba(212, 145, 163, 0.42),
    inset 0 1.5px 1.5px rgba(255, 255, 255, 0.65);
}
</style>
