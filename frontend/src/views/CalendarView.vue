<template>
  <div class="h-full flex flex-col overflow-hidden">
    <!-- Adaptive Top Header: Transparent at rest -> Smoothly fades to UI Pink on scroll -->
    <header class="nav-adaptive px-4 pb-2.5" :style="headerStyle">
      <div class="flex items-center justify-between">
        <!-- iOS 27 Liquid Glass Left/Right Month Switcher with Rolling Digits -->
        <MonthGlassSwitcher
          :year="currentYear"
          :month="currentMonth"
          :show-reset="selectedDate !== todayStr || currentMonth !== dayjs().month() + 1 || currentYear !== dayjs().year()"
          @change="onMonthStep"
          @reset="jumpToToday"
        />

        <!-- Clean 34x34px Pure White Icon Buttons -->
        <div class="flex items-center gap-2">
          <button
            type="button"
            class="ios27-icon-btn"
            :class="{ 'is-active': ui.privacyMode }"
            :aria-label="ui.privacyMode ? '显示金额' : '隐藏金额'"
            @click="ui.togglePrivacy()"
          >
            <IconLashEyeClosed v-if="ui.privacyMode" :size="17" />
            <IconLashEyeOpen v-else :size="17" />
          </button>

          <button
            type="button"
            class="ios27-icon-btn"
            aria-label="生成档期海报"
            @click="showPoster = true"
          >
            <IconPosterCard :size="17" />
          </button>
        </div>
      </div>
    </header>

    <!-- Scrollable Body -->
    <div class="scroll-pane no-scrollbar px-4 pt-2 pb-8" @scroll.passive="onPaneScroll">
      <div class="relative">
        <!-- 1:1 Pixel-Matched Overlay Skeleton (Dissolves smoothly on top with ZERO layout shift or blank flash) -->
        <Transition name="skeleton-dissolve">
          <div
            v-if="initialLoading"
            class="absolute inset-0 z-20 pointer-events-none"
          >
            <div class="flex items-center gap-2 mb-3">
              <div class="skeleton-box h-[28px] w-[104px] rounded-full" />
              <div class="skeleton-box h-[28px] w-[124px] rounded-full" />
              <div class="skeleton-box h-[28px] w-[96px] rounded-full" />
            </div>
            <section class="card-soft px-2.5 pt-3.5 pb-2.5">
              <div class="grid grid-cols-7 place-items-center mb-1.5 px-1 h-[16px]">
                <div v-for="w in 7" :key="'sw-' + w" class="skeleton-box h-3 w-4 rounded-full" />
              </div>
              <div class="px-1 py-1 grid grid-cols-7 gap-y-1.5 gap-x-0">
                <div v-for="d in 42" :key="'sd-' + d" class="h-[60px] flex items-center justify-center">
                  <div class="skeleton-box flex-1 h-full mx-[2px] rounded-[15px]" />
                </div>
              </div>
              <div class="px-1.5 pt-0.5 flex items-center gap-3.5 h-[18px]">
                <div class="skeleton-box h-3 w-12 rounded-full" />
                <div class="skeleton-box h-3 w-12 rounded-full" />
              </div>
            </section>
            <div class="flex items-center justify-between mt-4 mb-2.5 px-1 h-[22px]">
              <div class="skeleton-box h-4 w-36 rounded-full" />
              <div class="skeleton-box h-4 w-16 rounded-full" />
            </div>
            <div class="card-soft p-4 pl-5 space-y-3 min-h-[116px]">
              <div class="flex items-center justify-between">
                <div class="skeleton-box h-5 w-28 rounded-full" />
                <div class="skeleton-box h-5 w-14 rounded-full" />
              </div>
              <div class="flex items-center gap-3">
                <div class="skeleton-box w-10 h-10 rounded-2xl shrink-0" />
                <div class="flex-1 space-y-2">
                  <div class="skeleton-box h-4 w-36" />
                  <div class="skeleton-box h-3 w-28" />
                </div>
                <div class="skeleton-box h-6 w-16" />
              </div>
            </div>
          </div>
        </Transition>

        <div :class="initialLoading ? 'opacity-0' : 'opacity-100 transition-opacity duration-200'">
      <!-- Monthly Quick Insight Pills -->
      <div class="flex items-center gap-2 overflow-x-auto no-scrollbar mb-3">
        <div class="shrink-0 whitespace-nowrap px-3 py-1.5 rounded-full bg-white/90 flex items-center gap-1.5 text-[11px]">
          <span class="w-1.5 h-1.5 rounded-full bg-brand shrink-0" />
          <span class="text-ink-secondary">本月已排</span>
          <strong class="text-ink font-semibold tabular-nums">{{ monthOrderCount }} 单</strong>
        </div>
        <div class="shrink-0 whitespace-nowrap px-3 py-1.5 rounded-full bg-white/90 flex items-center gap-1.5 text-[11px]">
          <span class="w-2.5 h-1 rounded-full bg-brand/45 shrink-0" />
          <span class="text-ink-secondary">好日子空档</span>
          <strong class="text-brand-deep font-semibold tabular-nums">{{ freeAuspiciousCount }} 天</strong>
        </div>
        <div
          v-if="monthPendingBalance > 0"
          class="shrink-0 whitespace-nowrap px-3 py-1.5 rounded-full bg-white/90 flex items-center gap-1.5 text-[11px] pressable cursor-pointer"
          @click="router.push('/orders?status=PENDING_BALANCE')"
        >
          <span class="text-ink-secondary">待收</span>
          <strong class="text-status-danger-text font-semibold tabular-nums">{{ ui.formatMoney(monthPendingBalance) }}</strong>
        </div>
      </div>

      <!-- Native-App 120fps 3-Month Carousel Card -->
      <section class="card-soft px-2.5 pt-3.5 pb-2.5 select-none overflow-hidden flex flex-col justify-center">
        <!-- Centered Weekday Header -->
        <div class="grid grid-cols-7 place-items-center text-center text-[11px] font-medium mb-1.5 px-1">
          <span
            v-for="(w, idx) in ['一', '二', '三', '四', '五', '六', '日']"
            :key="w"
            :class="idx >= 5 ? 'text-brand' : 'text-ink-muted'"
          >
            {{ w }}
          </span>
        </div>

        <!-- 3-Panel Pre-rendered GPU Track (Prev | Current | Next) -->
        <div
          ref="viewportRef"
          class="overflow-hidden w-full cal-viewport"
          @touchstart.passive="onTouchStart"
          @touchmove="onTouchMove"
          @touchend.passive="onTouchEnd"
          @touchcancel.passive="onTouchEnd"
        >
          <div
            ref="trackRef"
            class="flex w-[300%] cal-track"
            style="transform: translate3d(-33.333333%, 0, 0)"
            @transitionend="onTrackTransitionEnd"
          >
            <div
              v-for="panel in threeMonthPanels"
              :key="panel.key"
              class="w-1/3 px-1 py-1 grid grid-cols-7 gap-y-1.5 gap-x-0 cal-panel"
            >
              <div
                v-for="cell in panel.cells"
                :key="cell.date"
                class="h-[60px] flex items-center justify-center"
              >
                <div
                  class="relative flex-1 h-full flex flex-col items-center justify-center cursor-pointer active:opacity-75"
                  :class="[
                    cell.shapeClass,
                    cell.tagLabel
                      ? cell.tileClass
                      : cell.date === selectedDate
                        ? 'btn-rose text-white'
                        : cell.isToday
                          ? 'bg-brand-soft/85 text-brand-deep border border-brand/35'
                          : cell.inCurrentMonth
                            ? 'text-ink'
                            : 'text-ink-muted/35',
                  ]"
                  @click="selectDate(cell.date)"
                >
                  <!-- Active Selection Inner Pill when tapping inside a booked / connected multi-day bar -->
                  <span
                    v-if="cell.tagLabel && cell.date === selectedDate"
                    class="pointer-events-none absolute inset-[2px] rounded-[13px] btn-rose z-0"
                  />

                  <!-- Harmoniously Centered Stack: Day + Lunar + Crisp Tag -->
                  <div class="relative z-10 flex flex-col items-center justify-center text-center leading-none">
                    <span
                      class="text-[15px] font-semibold tabular-nums leading-none"
                      :class="cell.date === selectedDate ? 'text-white' : ''"
                    >
                      {{ cell.day }}
                    </span>
                    <span
                      class="text-[9.5px] leading-none mt-[4px]"
                      :class="
                        cell.date === selectedDate
                          ? 'text-white/80'
                          : cell.inCurrentMonth
                            ? 'text-ink-muted'
                            : 'text-ink-muted/35'
                      "
                    >
                      {{ cell.lunarLabel }}
                    </span>
                    <span
                      v-if="cell.tagLabel"
                      class="text-[9.5px] font-semibold leading-none mt-[4px] whitespace-nowrap tabular-nums"
                      :class="cell.date === selectedDate ? 'text-white' : cell.tagTextClass"
                    >
                      {{ cell.tagLabel }}
                    </span>
                  </div>

                  <!-- Floating Bottom Bar ONLY on Free Auspicious Days -->
                  <span
                    v-if="!cell.tagLabel && cell.isGoodWedding && cell.inCurrentMonth"
                    class="pointer-events-none absolute bottom-[5px] left-1/2 -translate-x-1/2 w-3 h-[2.5px] rounded-full"
                    :class="cell.date === selectedDate ? 'bg-white/65' : 'bg-brand/35'"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Minimal Legend (No border line, no extra spacing, no swipe hint text) -->
        <div class="px-1.5 pt-0.5 flex items-center gap-3.5 text-[11px] text-ink-muted">
          <span class="flex items-center gap-1.5">
            <i class="w-3 h-[2.5px] rounded-full bg-brand/40 inline-block" />好日子
          </span>
          <span class="flex items-center gap-1.5">
            <i class="w-2.5 h-2.5 rounded-[4px] bg-[#FCF2F5] border border-[#F2DCE3] inline-block" />有行程
          </span>
        </div>
      </section>

      <!-- Selected Day Summary Bar -->
      <div class="flex items-center justify-between mt-4 mb-2.5 px-1">
        <h2 class="text-[15px] font-semibold text-ink tabular-nums">{{ selectedDateHeading }}</h2>
        <span
          v-if="selectedDayOrders.length > 0"
          class="px-2.5 py-0.5 rounded-full bg-brand-soft text-brand-deep text-[11px] font-semibold tabular-nums"
        >
          {{ selectedDayOrders.length }} 场妆造
        </span>
        <span v-else class="text-[12px] text-ink-muted">当日空闲</span>
      </div>

      <!-- Selected Day Itinerary Cards -->
      <div class="space-y-2.5">
        <template v-if="selectedDayOrders.length > 0">
          <article
            v-for="order in selectedDayOrders"
            :key="order.id"
            class="card-soft p-4 pl-5 relative overflow-hidden pressable cursor-pointer"
            @click="router.push(`/orders/${order.id}`)"
          >
            <span
              class="absolute left-0 top-3 bottom-3 w-1 rounded-r-full"
              :class="statusMeta(order.status, order.balanceDue).ribbonClass"
            />

            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="px-2.5 py-0.5 rounded-full bg-brand-soft text-brand-deep text-[12px] font-semibold tabular-nums">
                  {{ order.startTime }} - {{ order.endTime }}
                </span>
                <span
                  v-if="order.endDate && order.endDate !== order.serviceDate"
                  class="text-[11px] text-champagne font-medium"
                >
                  跨天连档
                </span>
              </div>
              <span
                class="px-2.5 py-0.5 rounded-full text-[11px] font-medium"
                :class="[statusMeta(order.status, order.balanceDue).bgClass, statusMeta(order.status, order.balanceDue).textClass]"
              >
                {{ statusMeta(order.status, order.balanceDue).label }}
              </span>
            </div>

            <div class="flex items-center justify-between mt-3">
              <div class="flex items-center gap-3 min-w-0 pr-3">
                <div
                  class="w-10 h-10 rounded-2xl bg-gradient-to-br flex items-center justify-center text-[15px] font-semibold shrink-0"
                  :class="serviceCategoryVisual(order.serviceType).avatarBg"
                >
                  {{ order.clientName.slice(0, 1) }}
                </div>
                <div class="min-w-0">
                  <h3 class="text-[15px] font-semibold text-ink truncate">
                    {{ order.clientName }}
                    <span class="text-[13px] font-normal text-ink-secondary">· {{ order.serviceType }}</span>
                  </h3>
                  <p class="text-[12px] text-ink-muted mt-0.5 truncate flex items-center gap-1">
                    <IconPearlPin :size="13" class="text-brand shrink-0" />
                    <span class="truncate">{{ order.location || '待确认出妆地点' }}</span>
                  </p>
                </div>
              </div>

              <div class="text-right shrink-0 tabular-nums">
                <div class="text-[17px] font-semibold text-ink">
                  <span class="text-[12px] font-normal mr-0.5">¥</span>{{ ui.formatMoney(order.totalAmount, '') }}
                </div>
                <div v-if="order.balanceDue > 0" class="text-[11px] text-status-danger-text mt-0.5">
                  尾款 {{ ui.formatMoney(order.balanceDue) }}
                </div>
              </div>
            </div>
          </article>
        </template>

        <div v-else class="card-soft">
          <CuteEmptyState
            variant="calendar"
            title="当日档期留白可约"
            description="轻点底部中央按钮，即可记录新娘试妆或跟妆行程"
            compact
          />
        </div>
      </div>
        </div>
      </div>
    </div>

    <!-- Schedule Poster Modal -->
    <SchedulePosterModal
      v-model:show="showPoster"
      :year="currentYear"
      :month="currentMonth"
      :studio-name="auth.user?.studioName || '嘻嘻化妆室'"
      :share-token="auth.user?.shareToken || ''"
      :orders="currentMonthOrders"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import dayjs from 'dayjs';
import { Solar } from 'lunar-javascript';
import http from '@/api/http';
import { useUiStore } from '@/stores/ui';
import { useAuthStore } from '@/stores/auth';
import { useScrollHeader } from '@/composables/useScrollHeader';
import { serviceCategoryVisual, statusMeta } from '@/utils/format';
import {
  IconLashEyeClosed,
  IconLashEyeOpen,
  IconPearlPin,
  IconPosterCard,
} from '@/components/icons/BeautyIcons';
import CuteEmptyState from '@/components/CuteEmptyState.vue';
import MonthGlassSwitcher from '@/components/MonthGlassSwitcher.vue';
import SchedulePosterModal from '@/components/SchedulePosterModal.vue';
import type { Order } from '@/types';

const lunarCache = new Map<string, { lunarLabel: string; isGoodWedding: boolean }>();

function getCachedLunar(dateStr: string) {
  const hit = lunarCache.get(dateStr);
  if (hit) return hit;
  try {
    const [y, m, d] = dateStr.split('-').map(Number);
    const solar = Solar.fromYmd(y, m, d);
    const lunar = solar.getLunar();
    const yi: string[] = lunar.getDayYi() || [];
    const isGoodWedding = yi.includes('嫁娶');
    const jieQi = lunar.getJieQi();
    const dayStr = lunar.getDayInChinese();
    const lunarLabel = jieQi || (dayStr === '初一' ? `${lunar.getMonthInChinese()}月` : dayStr);
    const val = { lunarLabel, isGoodWedding };
    lunarCache.set(dateStr, val);
    return val;
  } catch {
    return { lunarLabel: '', isGoodWedding: false };
  }
}

function shortServiceTag(serviceType: string): string {
  const s = serviceType || '';
  if (s.includes('全天')) return '全天';
  if (s.includes('早妆') || s.includes('半天')) return '早妆';
  if (s.includes('领证') || s.includes('轻婚纱')) return '领证';
  if (s.includes('商业') || s.includes('广告') || s.includes('艺人')) return '商拍';
  if (s.includes('试妆')) return '试妆';
  return s.slice(0, 2) || '已排';
}

interface CalendarCell {
  date: string;
  day: number;
  inCurrentMonth: boolean;
  isToday: boolean;
  lunarLabel: string;
  isGoodWedding: boolean;
  tagLabel: string;
  shapeClass: string;
  tileClass: string;
  tagTextClass: string;
}

const router = useRouter();
const ui = useUiStore();
const auth = useAuthStore();
const { onPaneScroll, headerStyle } = useScrollHeader(44);

const todayStr = dayjs().format('YYYY-MM-DD');
const currentYear = ref(dayjs().year());
const currentMonth = ref(dayjs().month() + 1);
const selectedDate = ref(todayStr);

const ordersCache = reactive<Record<string, Order[]>>({});
const showPoster = ref(false);
const initialLoading = ref(true);

const ymKey = (y: number, m: number) => `${y}-${String(m).padStart(2, '0')}`;

async function loadMonthIntoCache(y: number, m: number) {
  const key = ymKey(y, m);
  try {
    const { data } = await http.get('/calendar/month', { params: { year: y, month: m } });
    ordersCache[key] = data.orders || [];
  } catch {
    if (!ordersCache[key]) ordersCache[key] = [];
  }
}

async function ensureThreeMonthsLoaded(y: number, m: number) {
  const base = dayjs(`${ymKey(y, m)}-01`);
  const prev = base.subtract(1, 'month');
  const next = base.add(1, 'month');
  await loadMonthIntoCache(y, m);
  const prevKey = ymKey(prev.year(), prev.month() + 1);
  const nextKey = ymKey(next.year(), next.month() + 1);
  if (!ordersCache[prevKey]) loadMonthIntoCache(prev.year(), prev.month() + 1);
  if (!ordersCache[nextKey]) loadMonthIntoCache(next.year(), next.month() + 1);
}

watch([currentYear, currentMonth], ([y, m]) => {
  ensureThreeMonthsLoaded(y, m);
});

watch(
  selectedDate,
  (val) => {
    ui.selectedCalendarDate = val;
  },
  { immediate: true }
);

onMounted(async () => {
  try {
    await ensureThreeMonthsLoaded(currentYear.value, currentMonth.value);
  } finally {
    initialLoading.value = false;
  }
});

function buildCellsForMonth(y: number, m: number): CalendarCell[] {
  const key = ymKey(y, m);
  const monthOrders = ordersCache[key] || [];
  const first = dayjs(`${key}-01`);
  const dow = first.day();
  const offset = dow === 0 ? 6 : dow - 1;
  const start = first.subtract(offset, 'day');

  const cells: CalendarCell[] = [];
  for (let i = 0; i < 42; i++) {
    const colIdx = i % 7;
    const cur = start.add(i, 'day');
    const dateStr = cur.format('YYYY-MM-DD');
    const inMonth = cur.month() + 1 === m;
    const dayOrders = monthOrders.filter((o) => {
      const end = o.endDate || o.serviceDate;
      return dateStr >= o.serviceDate && dateStr <= end;
    });

    // Check if this date connects left/right as part of a multi-day consecutive booking
    const multiDay = dayOrders.find((o) => o.endDate && o.endDate !== o.serviceDate);
    const connectLeft = Boolean(multiDay && dateStr > multiDay.serviceDate && colIdx > 0);
    const connectRight = Boolean(multiDay && multiDay.endDate && dateStr < multiDay.endDate && colIdx < 6);

    let shapeClass = 'mx-[2px] rounded-[15px]';
    let borderClass = 'border';
    if (connectLeft && connectRight) {
      shapeClass = 'mx-0 rounded-none';
      borderClass = 'border-y border-x-0';
    } else if (connectRight) {
      shapeClass = 'ml-[2px] mr-0 rounded-l-[15px] rounded-r-none';
      borderClass = 'border-y border-l border-r-0';
    } else if (connectLeft) {
      shapeClass = 'ml-0 mr-[2px] rounded-r-[15px] rounded-l-none';
      borderClass = 'border-y border-r border-l-0';
    }

    let tagLabel = '';
    let tileClass = '';
    let tagTextClass = '';

    if (dayOrders.length > 0) {
      tagLabel = dayOrders.length >= 2 ? `${dayOrders.length}场` : shortServiceTag(dayOrders[0].serviceType);
      tileClass = inMonth
        ? `bg-[#FCF2F5] ${borderClass} border-[#F2DCE3] text-ink`
        : `bg-[#FCF2F5]/45 ${borderClass} border-[#F2DCE3]/45 text-ink-muted/45`;
      tagTextClass = inMonth ? 'text-[#AE7384]' : 'text-[#AE7384]/45';
    }

    const { lunarLabel, isGoodWedding } = getCachedLunar(dateStr);

    cells.push({
      date: dateStr,
      day: cur.date(),
      inCurrentMonth: inMonth,
      isToday: dateStr === todayStr,
      lunarLabel,
      isGoodWedding,
      tagLabel,
      shapeClass,
      tileClass,
      tagTextClass,
    });
  }
  return cells;
}

const threeMonthPanels = computed(() => {
  const curr = dayjs(`${ymKey(currentYear.value, currentMonth.value)}-01`);
  const prev = curr.subtract(1, 'month');
  const next = curr.add(1, 'month');
  return [
    { key: ymKey(prev.year(), prev.month() + 1), cells: buildCellsForMonth(prev.year(), prev.month() + 1) },
    { key: ymKey(curr.year(), curr.month() + 1), cells: buildCellsForMonth(curr.year(), curr.month() + 1) },
    { key: ymKey(next.year(), next.month() + 1), cells: buildCellsForMonth(next.year(), next.month() + 1) },
  ];
});

const currentMonthOrders = computed(() => ordersCache[ymKey(currentYear.value, currentMonth.value)] || []);

const currentPrefix = computed(() => ymKey(currentYear.value, currentMonth.value));
const monthOrderCount = computed(
  () => currentMonthOrders.value.filter((o) => o.serviceDate.startsWith(currentPrefix.value)).length
);
const monthPendingBalance = computed(() =>
  currentMonthOrders.value
    .filter((o) => o.serviceDate.startsWith(currentPrefix.value))
    .reduce((sum, o) => sum + (o.balanceDue || 0), 0)
);
const freeAuspiciousCount = computed(
  () =>
    threeMonthPanels.value[1].cells.filter(
      (c) => c.inCurrentMonth && c.isGoodWedding && !c.tagLabel
    ).length
);

const selectedDayOrders = computed(() =>
  currentMonthOrders.value.filter((o) => {
    const end = o.endDate || o.serviceDate;
    return selectedDate.value >= o.serviceDate && selectedDate.value <= end;
  })
);

const selectedDateHeading = computed(() => {
  const d = dayjs(selectedDate.value);
  const weekNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  const prefix = selectedDate.value === todayStr ? '今天 · ' : '';
  return `${prefix}${d.month() + 1}月${d.date()}日 ${weekNames[d.day()]}`;
});

// Pure Pixel GPU-Composited 120fps Carousel Physics (Zero layout reads in touchmove, zero child bubbling)
const viewportRef = ref<HTMLElement | null>(null);
const trackRef = ref<HTMLElement | null>(null);
let startX = 0;
let startY = 0;
let startTime = 0;
let cachedPanelW = 340;
let draggingHorizontal: boolean | null = null;
let pendingDelta = 0;
let isAnimating = false;

const SILKY_EASE = 'transform 440ms cubic-bezier(0.22, 1, 0.36, 1)';

function resetTrackInstant() {
  if (!trackRef.value) return;
  trackRef.value.style.transition = 'none';
  trackRef.value.style.transform = 'translate3d(-33.333333%, 0, 0)';
}

function onTouchStart(e: TouchEvent) {
  if (isAnimating || !trackRef.value || !viewportRef.value) return;
  cachedPanelW = viewportRef.value.offsetWidth || 340;
  startX = e.touches[0].clientX;
  startY = e.touches[0].clientY;
  startTime = performance.now();
  draggingHorizontal = null;
  trackRef.value.style.transition = 'none';
}

function onTouchMove(e: TouchEvent) {
  if (isAnimating || !trackRef.value) return;
  const dx = e.touches[0].clientX - startX;
  const dy = e.touches[0].clientY - startY;

  if (draggingHorizontal === null) {
    if (Math.abs(dx) < 5 && Math.abs(dy) < 5) return;
    draggingHorizontal = Math.abs(dx) > Math.abs(dy);
  }

  if (draggingHorizontal) {
    if (e.cancelable) e.preventDefault();
    const clampedDx = Math.max(-cachedPanelW, Math.min(cachedPanelW, dx));
    trackRef.value.style.transform = `translate3d(${-cachedPanelW + clampedDx}px, 0, 0)`;
  }
}

function onTouchEnd(e: TouchEvent) {
  if (isAnimating || !trackRef.value || !draggingHorizontal) {
    draggingHorizontal = null;
    return;
  }
  const dx = e.changedTouches[0].clientX - startX;
  const elapsed = Math.max(1, performance.now() - startTime);
  const velocity = Math.abs(dx) / elapsed;
  const shouldFlip = Math.abs(dx) > cachedPanelW * 0.20 || (Math.abs(dx) > 24 && velocity > 0.30);

  trackRef.value.style.transition = SILKY_EASE;
  if (shouldFlip) {
    isAnimating = true;
    pendingDelta = dx < 0 ? 1 : -1;
    const targetX = pendingDelta > 0 ? -cachedPanelW * 2 : 0;
    trackRef.value.style.transform = `translate3d(${targetX}px, 0, 0)`;
  } else {
    isAnimating = true;
    pendingDelta = 0;
    trackRef.value.style.transform = `translate3d(${-cachedPanelW}px, 0, 0)`;
  }
  draggingHorizontal = null;
}

function onTrackTransitionEnd(e: TransitionEvent) {
  // Ignore any bubbled transition events from child nodes!
  if (e.target !== trackRef.value || !isAnimating) return;
  isAnimating = false;
  if (pendingDelta !== 0) {
    const next = dayjs(`${ymKey(currentYear.value, currentMonth.value)}-01`).add(pendingDelta, 'month');
    currentYear.value = next.year();
    currentMonth.value = next.month() + 1;
    const nextYm = ymKey(next.year(), next.month() + 1);
    selectedDate.value = nextYm === todayStr.slice(0, 7) ? todayStr : `${nextYm}-01`;
    pendingDelta = 0;
  }
  requestAnimationFrame(resetTrackInstant);
}

function selectDate(dateStr: string) {
  if (isAnimating) return;
  const d = dayjs(dateStr);
  if (d.year() !== currentYear.value || d.month() + 1 !== currentMonth.value) {
    currentYear.value = d.year();
    currentMonth.value = d.month() + 1;
  }
  selectedDate.value = dateStr;
}

function jumpToToday() {
  const now = dayjs();
  currentYear.value = now.year();
  currentMonth.value = now.month() + 1;
  selectedDate.value = todayStr;
}

function onMonthStep({ year: y, month: m, delta }: { year: number; month: number; delta: number }) {
  if (trackRef.value && viewportRef.value && !isAnimating) {
    cachedPanelW = viewportRef.value.offsetWidth || 340;
    trackRef.value.style.transition = 'none';
    trackRef.value.style.transform = `translate3d(${-cachedPanelW}px, 0, 0)`;
    // Force single-frame commit then glide with 440ms quintic ease-out
    void trackRef.value.offsetWidth;
    isAnimating = true;
    pendingDelta = delta;
    trackRef.value.style.transition = SILKY_EASE;
    trackRef.value.style.transform = `translate3d(${delta > 0 ? -cachedPanelW * 2 : 0}px, 0, 0)`;
    return;
  }
  currentYear.value = y;
  currentMonth.value = m;
  const nextYm = ymKey(y, m);
  selectedDate.value = nextYm === todayStr.slice(0, 7) ? todayStr : `${nextYm}-01`;
}
</script>

<style scoped>
.cal-viewport {
  touch-action: pan-y;
}
.cal-track {
  will-change: transform;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}
.cal-panel {
  contain: layout paint;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}
</style>
