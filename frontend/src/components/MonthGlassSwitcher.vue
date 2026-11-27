<template>
  <div class="inline-flex items-center gap-1.5 select-none">
    <!-- iOS 27 Liquid Glass Month Stepper with Vertical Odometer Rolling Digits -->
    <div class="ios27-month-track p-[2px] rounded-full inline-flex items-center">
      <!-- Previous Month -->
      <button
        type="button"
        class="ios27-month-btn"
        aria-label="上个月"
        @click="step(-1)"
      >
        <svg viewBox="0 0 24 24" class="w-[16px] h-[16px]" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round">
          <path d="M14.5 6.5 9 12l5.5 5.5" />
        </svg>
      </button>

      <!-- Odometer Rolling Digits: Large Month + Small Year -->
      <div class="px-2.5 min-w-[92px] flex items-end justify-center whitespace-nowrap tabular-nums">
        <!-- Month Vertical Roller (Leading zero smoothly collapses for months 1-9) -->
        <div class="inline-flex items-center text-[20px] font-bold text-[#3D3236] tracking-tight leading-none">
          <span
            v-for="(digit, idx) in monthDigits"
            :key="'m-' + idx"
            class="digit-window h-[22px]"
            :class="idx === 0 && digit === 0 ? 'digit-zero-collapsed' : 'digit-visible'"
          >
            <span
              class="digit-strip"
              :style="{ transform: `translate3d(0, -${digit * 10}%, 0)` }"
            >
              <span v-for="n in 10" :key="n" class="h-[22px] leading-[22px] flex items-center justify-center">
                {{ n - 1 }}
              </span>
            </span>
          </span>
        </div>

        <span class="text-[12px] font-semibold text-[#5E4D53] ml-0.5 mb-[2.5px] leading-none">月</span>

        <!-- Year 4-Digit Vertical Roller -->
        <div class="inline-flex items-center text-[11px] font-medium text-[#B89AA5] ml-1.5 mb-[2px] leading-none">
          <span
            v-for="(digit, idx) in yearDigits"
            :key="'y-' + idx"
            class="digit-window h-[14px]"
          >
            <span
              class="digit-strip"
              :style="{ transform: `translate3d(0, -${digit * 10}%, 0)` }"
            >
              <span v-for="n in 10" :key="n" class="h-[14px] leading-[14px] flex items-center justify-center">
                {{ n - 1 }}
              </span>
            </span>
          </span>
        </div>
      </div>

      <!-- Next Month -->
      <button
        type="button"
        class="ios27-month-btn"
        aria-label="下个月"
        @click="step(1)"
      >
        <svg viewBox="0 0 24 24" class="w-[16px] h-[16px]" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round">
          <path d="M9.5 6.5 15 12l-5.5 5.5" />
        </svg>
      </button>
    </div>

    <!-- Clean 34x34px White "今" Reset Button -->
    <button
      v-if="showReset"
      type="button"
      class="ios27-icon-btn is-active text-[12px] font-bold spring-pop"
      aria-label="回到当月"
      @click="emit('reset')"
    >
      今
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import dayjs from 'dayjs';

const props = defineProps<{
  year: number;
  month: number;
  showReset?: boolean;
}>();

const emit = defineEmits<{
  (e: 'change', payload: { year: number; month: number; delta: number }): void;
  (e: 'reset'): void;
}>();

const monthDigits = computed(() =>
  String(props.month)
    .padStart(2, '0')
    .split('')
    .map((c) => Number(c))
);

const yearDigits = computed(() =>
  String(props.year)
    .padStart(4, '0')
    .split('')
    .map((c) => Number(c))
);

function step(delta: number) {
  const next = dayjs(`${props.year}-${String(props.month).padStart(2, '0')}-01`).add(delta, 'month');
  emit('change', { year: next.year(), month: next.month() + 1, delta });
}
</script>

<style scoped>
.ios27-month-track {
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.72) 0%,
    rgba(254, 242, 246, 0.58) 100%
  );
  backdrop-filter: blur(20px) saturate(190%);
  -webkit-backdrop-filter: blur(20px) saturate(190%);
  border: 1px solid rgba(255, 255, 255, 0.94);
  box-shadow:
    0 4px 14px -3px rgba(180, 96, 122, 0.12),
    inset 0 1px 1px rgba(255, 255, 255, 0.96);
}

.ios27-month-btn {
  width: 34px;
  height: 34px;
  border-radius: 9999px;
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.96) 0%,
    rgba(255, 245, 248, 0.82) 100%
  );
  color: #3D3236;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: 1px solid rgba(255, 255, 255, 0.98);
  box-shadow:
    0 2px 8px rgba(176, 92, 118, 0.10),
    inset 0 1px 0.5px rgba(255, 255, 255, 1);
  transition: transform 150ms cubic-bezier(0.32, 0.72, 0, 1), color 150ms ease;
}
.ios27-month-btn:active {
  transform: scale(0.89);
  color: #DC99AA;
}

.digit-window {
  display: inline-block;
  overflow: hidden;
  position: relative;
  transition: max-width 320ms cubic-bezier(0.22, 1, 0.36, 1), opacity 240ms ease;
}

.digit-visible {
  max-width: 14px;
  opacity: 1;
}

.digit-zero-collapsed {
  max-width: 0px;
  opacity: 0;
}

.digit-strip {
  display: flex;
  flex-direction: column;
  will-change: transform;
  transition: transform 440ms cubic-bezier(0.22, 1, 0.36, 1);
}
</style>
