<template>
  <div class="h-full flex flex-col overflow-hidden">
    <!-- Adaptive Top Header: Transparent at rest -> Smoothly fades to UI Pink on scroll -->
    <header class="nav-adaptive px-4 pb-2.5 flex items-center justify-between" :style="headerStyle">
      <!-- iOS 27 Liquid Glass Left/Right Month or Year Switcher -->
      <MonthGlassSwitcher
        :year="year"
        :month="month"
        :year-only="mode === 'all'"
        :show-reset="mode === 'all' ? year !== dayjs().year() : (month !== dayjs().month() + 1 || year !== dayjs().year())"
        @change="onMonthStep"
        @reset="jumpToCurrentMonth"
      />

      <!-- Clean 34x34px Pure White Icon Buttons (No glass background tray) -->
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
          aria-label="导出月度账单"
          @click="exportCsv"
        >
          <IconExportBill :size="17" />
        </button>

        <button
          type="button"
          class="ios27-icon-btn"
          aria-label="记一笔支出"
          @click="showExpenseModal = true"
        >
          <IconPlusAction :size="17" />
        </button>
      </div>
    </header>

    <!-- Scrollable Finance Body -->
    <div class="scroll-pane no-scrollbar px-4 pt-2 pb-6" @scroll.passive="onPaneScroll">
      <!-- Shadowless Flat Mode Switch Capsule -->
      <div class="flex items-center justify-between mb-3">
        <span class="text-[14px] font-semibold text-ink">{{ mode === 'all' ? '年账本统计' : '月账本统计' }}</span>
        <div class="inline-flex bg-white/85 p-0.5 rounded-full text-[11px] font-medium">
          <button
            type="button"
            class="px-2.5 py-1 rounded-full transition-colors"
            :class="mode === 'all' ? 'bg-brand text-white' : 'text-ink-secondary'"
            @click="mode = 'all'"
          >
            全部
          </button>
          <button
            type="button"
            class="px-2.5 py-1 rounded-full transition-colors"
            :class="mode === 'service_date' ? 'bg-brand text-white' : 'text-ink-secondary'"
            @click="mode = 'service_date'"
          >
            总营收
          </button>
          <button
            type="button"
            class="px-2.5 py-1 rounded-full transition-colors"
            :class="mode === 'cash_date' ? 'bg-brand text-white' : 'text-ink-secondary'"
            @click="mode = 'cash_date'"
          >
            实际收款
          </button>
        </div>
      </div>

      <!-- In-Flow 1:1 Height-Reserved Skeleton (Hides cleanly when loaded) -->
      <div v-if="loading" class="space-y-4">
        <div class="card-velvet p-5">
          <div class="flex items-center justify-between h-[20px]">
            <div class="skeleton-box h-3.5 w-28 rounded-full" />
            <div class="skeleton-box h-5 w-16 rounded-full" />
          </div>
          <div class="mt-2.5 h-[34px] flex items-center">
            <div class="skeleton-box h-8 w-40 rounded-xl" />
          </div>
          <div class="grid grid-cols-3 mt-5 py-3.5 px-2 rounded-2xl bg-[#FAF2F5]/85 h-[68px] items-center divide-x divide-[#EAD8DE]/70">
            <div class="flex flex-col items-center justify-center space-y-1.5">
              <div class="skeleton-box h-2.5 w-10 rounded-full" />
              <div class="skeleton-box h-4 w-14 rounded-lg" />
            </div>
            <div class="flex flex-col items-center justify-center space-y-1.5">
              <div class="skeleton-box h-2.5 w-12 rounded-full" />
              <div class="skeleton-box h-4 w-14 rounded-lg" />
            </div>
            <div class="flex flex-col items-center justify-center space-y-1.5">
              <div class="skeleton-box h-2.5 w-10 rounded-full" />
              <div class="skeleton-box h-4 w-14 rounded-lg" />
            </div>
          </div>
        </div>
        <div class="card-soft p-5 space-y-2">
          <div class="flex items-center justify-between h-[36px]">
            <div class="space-y-1.5">
              <div class="skeleton-box h-4 w-28 rounded-lg" />
              <div class="skeleton-box h-2.5 w-36 rounded-full" />
            </div>
            <div class="skeleton-box h-6 w-16 rounded-full" />
          </div>
          <div class="skeleton-box h-44 w-full rounded-2xl" />
        </div>
        <div class="card-soft p-5 space-y-3">
          <div class="skeleton-box h-4 w-24 rounded-lg" />
          <div class="skeleton-box h-40 w-full rounded-2xl" />
          <div class="skeleton-box h-10 w-full rounded-2xl" />
          <div class="skeleton-box h-10 w-full rounded-2xl" />
        </div>
        <div class="card-soft p-5 space-y-2.5">
          <div class="flex items-center justify-between">
            <div class="skeleton-box h-4 w-24 rounded-lg" />
            <div class="skeleton-box h-3 w-20 rounded-full" />
          </div>
          <div class="skeleton-box h-[58px] w-full rounded-2xl" />
          <div class="skeleton-box h-[58px] w-full rounded-2xl" />
        </div>
      </div>

      <div v-else-if="stats" class="space-y-4">
        <!-- Pale Silk-Blush Revenue Overview Card (Airy pastel, zero heavy dark plum) -->
        <section class="card-velvet p-5 stagger-item">
          <div class="relative z-10">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-1.5 text-[12px] text-ink-secondary">
                <IconTabLedger :size="15" class="text-brand" />
                <span>
                  {{
                    mode === 'all'
                      ? `${year === dayjs().year() ? '今年' : `${year}年`}妆造总营收`
                      : mode === 'service_date'
                        ? '本月妆造总营收'
                        : '本月实际收款总额'
                  }}
                </span>
              </div>
              <span class="px-2.5 py-0.5 rounded-full bg-[#FAF0F3] text-[11px] text-brand-deep font-medium tabular-nums">
                共 {{ stats.summary.orderCount }} 单
              </span>
            </div>

            <div class="mt-2.5 flex items-baseline gap-1 tabular-nums">
              <span class="text-[18px] text-ink-secondary font-medium">¥</span>
              <span class="text-[34px] font-semibold tracking-tight text-ink leading-none">
                {{ ui.privacyMode ? '****' : animatedRevenue.toLocaleString('zh-CN') }}
              </span>
            </div>

            <div class="grid grid-cols-3 mt-5 py-3.5 px-2 rounded-2xl bg-[#FAF2F5]/85 tabular-nums divide-x divide-[#EAD8DE]/70">
              <div class="flex flex-col items-center justify-center text-center px-1 min-w-0">
                <div class="text-[11px] text-ink-muted">已实收</div>
                <div class="text-[15px] font-semibold text-ink mt-1 truncate max-w-full">
                  {{ ui.formatMoney(stats.summary.receivedAmount) }}
                </div>
              </div>
              <button
                type="button"
                class="flex flex-col items-center justify-center text-center px-1 min-w-0 pressable"
                @click="router.push('/orders?status=PENDING_BALANCE')"
              >
                <div class="text-[11px] text-ink-muted inline-flex items-center justify-center gap-0.5">
                  <span>待收尾款</span>
                  <ChevronRight class="w-3 h-3" />
                </div>
                <div class="text-[15px] font-semibold text-brand-deep mt-1 truncate max-w-full">
                  {{ ui.formatMoney(stats.summary.pendingBalance) }}
                </div>
              </button>
              <div class="flex flex-col items-center justify-center text-center px-1 min-w-0">
                <div class="text-[11px] text-ink-muted">净收益</div>
                <div class="text-[15px] font-semibold text-ink mt-1 truncate max-w-full">
                  {{ ui.formatMoney(stats.summary.netProfit) }}
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Trend Rose Gradient Bar Chart (Year 12-Month when 'all', otherwise 6-Month) -->
        <section class="card-soft p-5 stagger-item" style="--stagger: 1">
          <div class="flex items-center justify-between mb-2">
            <div>
              <h2 class="text-[15px] font-semibold text-ink">
                {{ mode === 'all' ? (year === dayjs().year() ? '今年营收趋势' : `${year}年营收趋势`) : '近 6 月营收趋势' }}
              </h2>
              <p v-if="hasTrendData" class="text-[11px] text-ink-muted mt-0.5">轻触柱形查看各月明细数据</p>
            </div>
            <span class="px-2.5 py-1 rounded-full bg-brand-soft text-brand-deep text-[11px] font-semibold tabular-nums">
              {{ mode === 'all' ? '全年' : '本月' }} {{ stats.summary.orderCount }} 单
            </span>
          </div>
          <div v-if="hasTrendData" ref="barChartRef" class="w-full h-44" />
          <CuteEmptyState
            v-else
            variant="finance"
            :title="mode === 'all' ? '该年暂无营收趋势' : '近 6 月暂无营收趋势'"
            description="记入妆造预约后，这里将自动生成月度营收柱状图"
            compact
          />
        </section>

        <!-- Couture Donut Breakdown Chart (Synced to Year or Month) -->
        <section class="card-soft p-5 stagger-item" style="--stagger: 2">
          <h2 class="text-[15px] font-semibold text-ink mb-2">妆型收入结构</h2>
          <template v-if="stats.breakdown.length > 0">
            <div class="relative w-full h-40 mb-2">
              <div ref="pieChartRef" class="w-full h-full" />
              <div class="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span class="text-[10px] text-ink-muted">主打妆型</span>
                <span class="text-[14px] font-semibold text-ink tabular-nums mt-0.5">
                  {{ stats.breakdown.length }} 类
                </span>
              </div>
            </div>
            <div class="space-y-2">
              <div
                v-for="(item, idx) in stats.breakdown"
                :key="item.name"
                class="flex items-center justify-between text-[13px] tabular-nums bg-canvas/80 px-3.5 py-2 rounded-2xl"
              >
                <div class="flex items-center gap-2 min-w-0 pr-2">
                  <span
                    class="w-2.5 h-2.5 rounded-full shrink-0"
                    :style="{ backgroundColor: pieColors[idx % pieColors.length] }"
                  />
                  <span class="text-ink font-medium">{{ item.name }}</span>
                </div>
                <span class="font-semibold text-brand-deep shrink-0">{{ ui.formatMoney(item.value) }}</span>
              </div>
            </div>
          </template>
          <CuteEmptyState
            v-else
            variant="finance"
            :title="mode === 'all' ? '全年暂无妆型收入' : '本月暂无妆型收入'"
            description="记入妆造预约后，这里会自动展示各妆型占比"
            compact
          />
        </section>

        <!-- Ledger List (Synced to Year or Month) -->
        <section class="card-soft p-5 stagger-item" style="--stagger: 3">
          <div class="flex items-center justify-between mb-3">
            <h2 class="text-[15px] font-semibold text-ink">{{ mode === 'all' ? '全年收支手账' : '当月收支手账' }}</h2>
            <span class="text-[11px] text-ink-muted tabular-nums">
              {{ mode === 'all' ? '全年支出' : '本月支出' }} {{ ui.formatMoney(stats.summary.expenseTotal) }}
            </span>
          </div>

          <div v-if="stats.ledger.length > 0" class="space-y-2.5">
            <div
              v-for="item in stats.ledger"
              :key="item.id"
              class="flex items-center justify-between p-2.5 rounded-2xl bg-canvas/80"
            >
              <div class="flex items-center gap-3 min-w-0 pr-2">
                <div
                  class="w-9 h-9 rounded-[13px] flex items-center justify-center shrink-0 bg-[#FAF0F3] text-[#AD7485]"
                >
                  <IconLoveNote v-if="item.kind === 'INCOME'" :size="17" />
                  <IconLipstick v-else :size="17" />
                </div>
                <div class="min-w-0">
                  <div class="text-[14px] font-medium text-ink truncate">{{ item.title }}</div>
                  <div class="text-[11px] text-ink-muted mt-0.5 tabular-nums truncate">
                    {{ item.date }} · {{ item.subtitle }}
                  </div>
                </div>
              </div>
              <span
                class="text-[15px] font-semibold tabular-nums shrink-0"
                :class="item.kind === 'INCOME' ? 'text-brand-deep' : 'text-ink-secondary'"
              >
                {{ item.kind === 'INCOME' ? '+' : '-' }}{{ ui.formatMoney(item.amount, '') }}
              </span>
            </div>
          </div>
          <CuteEmptyState
            v-else
            variant="finance"
            :title="mode === 'all' ? '全年收支手账还是空的' : '本月收支手账还是空的'"
            description="收款入账或点右上角「+」记录支出后会显示在这里"
            compact
          />
        </section>
      </div>
    </div>

    <!-- Add Expense Bottom Sheet -->
    <van-popup v-model:show="showExpenseModal" teleport="body" position="bottom" round>
      <div class="p-5 pb-safe-sheet space-y-4">
        <div class="sheet-grabber" />
        <div class="flex items-center justify-between">
          <h3 class="text-[17px] font-semibold text-ink">记录工作室支出</h3>
          <button type="button" class="icon-btn-white" @click="showExpenseModal = false">
            <X class="w-4 h-4" />
          </button>
        </div>

        <div class="flex flex-wrap gap-2">
          <button
            v-for="cat in expenseCategories"
            :key="cat"
            type="button"
            class="pressable px-3.5 h-8 rounded-full text-[13px] font-medium"
            :class="expenseForm.category === cat ? 'bg-brand text-white' : 'bg-brand-soft/75 text-ink-secondary'"
            @click="expenseForm.category = cat"
          >
            {{ cat }}
          </button>
        </div>

        <div v-if="expenseForm.category === '其他'">
          <label class="block text-[12px] text-ink-secondary mb-1.5 font-medium">支出标题</label>
          <input
            v-model.trim="expenseForm.customTitle"
            type="text"
            placeholder="请输入支出标题，如：房租水电、化妆灯具..."
            class="w-full input-silk px-3.5 h-[48px]"
          />
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div class="min-w-0">
            <label class="block text-[12px] text-ink-secondary mb-1.5 font-medium">支出金额</label>
            <div class="input-affix-wrap !h-[46px]">
              <span class="input-affix-unit mr-1.5">¥</span>
              <input
                v-model.number="expenseForm.amount"
                type="number"
                inputmode="decimal"
                placeholder="0"
                class="font-semibold tabular-nums"
              />
            </div>
          </div>
          <div class="min-w-0">
            <label class="block text-[12px] text-ink-secondary mb-1.5 font-medium">发生日期</label>
            <label class="relative flex items-center justify-between input-silk px-3.5 h-[46px] cursor-pointer">
              <span class="text-[14px] font-medium text-ink tabular-nums">
                {{ dayjs(expenseForm.incurredAt).format('YYYY.MM.DD') }}
              </span>
              <IconTabCalendar :size="15" class="text-brand shrink-0" />
              <input
                v-model="expenseForm.incurredAt"
                type="date"
                class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </label>
          </div>
        </div>

        <div>
          <label class="block text-[12px] text-ink-secondary mb-1.5 font-medium">备注说明</label>
          <textarea
            v-model.trim="expenseForm.note"
            rows="3"
            placeholder="如：CPB隔离补货、假睫毛、早妆专车费"
            class="w-full input-silk px-3.5 py-3 min-h-[84px] leading-relaxed"
          />
        </div>

        <button
          type="button"
          class="btn-unified w-full btn-rose text-white"
          @click="saveExpense"
        >
          保存这笔支出
        </button>
      </div>
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import dayjs from 'dayjs';
import { showToast } from 'vant';
import * as echarts from 'echarts/core';
import { BarChart, PieChart } from 'echarts/charts';
import { GridComponent, TooltipComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { ChevronRight, X } from 'lucide-vue-next';
import http from '@/api/http';
import { useUiStore } from '@/stores/ui';
import { useScrollHeader } from '@/composables/useScrollHeader';
import {
  IconExportBill,
  IconLashEyeClosed,
  IconLashEyeOpen,
  IconLipstick,
  IconLoveNote,
  IconPlusAction,
  IconTabCalendar,
  IconTabLedger,
} from '@/components/icons/BeautyIcons';
import CuteEmptyState from '@/components/CuteEmptyState.vue';
import MonthGlassSwitcher from '@/components/MonthGlassSwitcher.vue';
import type { StatsOverview } from '@/types';

echarts.use([BarChart, PieChart, GridComponent, TooltipComponent, CanvasRenderer]);

const router = useRouter();
const ui = useUiStore();
const { onPaneScroll, headerStyle } = useScrollHeader(44);

const year = ref(dayjs().year());
const month = ref(dayjs().month() + 1);

const mode = ref<'all' | 'service_date' | 'cash_date'>('service_date');
const stats = ref<StatsOverview | null>(null);
const loading = ref(true);
const hasTrendData = computed(() =>
  Boolean(stats.value?.trend?.some((t) => Number(t.revenue || 0) > 0))
);
const animatedRevenue = ref(0);

const barChartRef = ref<HTMLElement | null>(null);
const pieChartRef = ref<HTMLElement | null>(null);
let barChart: echarts.ECharts | null = null;
let pieChart: echarts.ECharts | null = null;

// Monochromatic Soft Pale Blush-Champagne Palette (Zero harsh purple/green contrast)
const pieColors = ['#DF9FB0', '#ECC3CE', '#E6CCB9', '#F2DEE4', '#DDD0D5'];

const showExpenseModal = ref(false);
const expenseCategories = ['耗材采购', '交通打车', '助理费用', '推广返点', '工作室杂费', '其他'];
const expenseForm = reactive({
  category: '耗材采购',
  customTitle: '',
  amount: 0,
  incurredAt: dayjs().format('YYYY-MM-DD'),
  note: '',
});

function animateTo(target: number) {
  const start = animatedRevenue.value;
  const diff = target - start;
  const duration = 320;
  const t0 = performance.now();
  function step(now: number) {
    const p = Math.min(1, (now - t0) / duration);
    const eased = 1 - Math.pow(1 - p, 3);
    animatedRevenue.value = Math.round(start + diff * eased);
    if (p < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

async function fetchStats() {
  loading.value = true;
  try {
    const { data } = await http.get('/stats/overview', {
      params: { year: year.value, month: month.value, mode: mode.value },
    });
    stats.value = data;
    animateTo(data.summary.totalRevenue || 0);
  } catch {
    showToast('加载账本失败');
  } finally {
    loading.value = false;
    await nextTick();
    renderCharts();
  }
}

function clampTooltipPosition(
  point: number[],
  _params: any,
  _dom: any,
  _rect: any,
  size: { contentSize: [number, number]; viewSize: [number, number] }
) {
  const [x, y] = point;
  const [boxW, boxH] = size.contentSize;
  const [viewW, viewH] = size.viewSize;
  // Auto-shift rightward when tapping left slices/bars & leftward on right slices/bars
  const safeX = Math.max(8, Math.min(x - boxW / 2, viewW - boxW - 8));
  const safeY = y - boxH - 12 >= 4 ? y - boxH - 12 : Math.min(viewH - boxH - 4, y + 12);
  return [safeX, safeY];
}

function renderCharts() {
  if (!stats.value) return;

  if (barChartRef.value && hasTrendData.value) {
    if (barChart && barChart.getDom() !== barChartRef.value) {
      barChart.dispose();
      barChart = null;
    }
    if (!barChart) barChart = echarts.init(barChartRef.value);
    const trend = stats.value.trend;
    const isYearView = mode.value === 'all';
    const currentMonthKey = dayjs().format('YYYY-MM');
    barChart.setOption({
      grid: { left: 6, right: 6, top: 18, bottom: 24, containLabel: false },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'none' },
        confine: true,
        position: clampTooltipPosition,
        backgroundColor: 'rgba(58, 36, 45, 0.92)',
        borderWidth: 0,
        borderRadius: 10,
        padding: [6, 10],
        textStyle: { color: '#fff', fontSize: 12 },
        formatter: (params: any) => {
          const p = params[0];
          const label = isYearView ? `${p.name}月` : p.name;
          return `${label}：${ui.privacyMode ? '¥****' : '¥' + Number(p.value).toLocaleString()}`;
        },
      },
      xAxis: {
        type: 'category',
        data: trend.map((t) => (isYearView ? t.label.replace('月', '') : t.label)),
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: '#AD96A0', fontSize: isYearView ? 10 : 11, interval: 0 },
      },
      yAxis: {
        type: 'value',
        show: false,
      },
      series: [
        {
          type: 'bar',
          barWidth: isYearView ? 12 : 22,
          data: trend.map((t, idx) => {
            const isHighlighted = isYearView ? t.month === currentMonthKey : idx === trend.length - 1;
            return {
              value: t.revenue,
              itemStyle: {
                color: isHighlighted
                  ? new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                      { offset: 0, color: '#EAB6C4' },
                      { offset: 1, color: '#DB98AA' },
                    ])
                  : new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                      { offset: 0, color: '#FAF0F3' },
                      { offset: 1, color: '#F3E1E7' },
                    ]),
                borderRadius: isYearView ? [6, 6, 6, 6] : [10, 10, 10, 10],
              },
            };
          }),
        },
      ],
    });
  }

  if (pieChartRef.value && stats.value.breakdown.length > 0) {
    if (pieChart && pieChart.getDom() !== pieChartRef.value) {
      pieChart.dispose();
      pieChart = null;
    }
    if (!pieChart) pieChart = echarts.init(pieChartRef.value);
    pieChart.setOption({
      color: pieColors,
      tooltip: {
        trigger: 'item',
        confine: true,
        position: clampTooltipPosition,
        backgroundColor: 'rgba(58, 36, 45, 0.92)',
        borderWidth: 0,
        borderRadius: 10,
        padding: [6, 10],
        textStyle: { color: '#fff', fontSize: 12 },
        formatter: (p: any) =>
          `${p.name}：${ui.privacyMode ? '¥****' : '¥' + Number(p.value).toLocaleString()} (${p.percent}%)`,
      },
      series: [
        {
          type: 'pie',
          radius: ['46px', '64px'],
          center: ['50%', '50%'],
          avoidLabelOverlap: false,
          label: { show: false },
          labelLine: { show: false },
          itemStyle: { borderRadius: 8, borderColor: '#FFFFFF', borderWidth: 2.5 },
          data: stats.value.breakdown,
        },
      ],
    });
  }
}

function onMonthStep({ year: y, month: m }: { year: number; month: number }) {
  year.value = y;
  month.value = m;
}

function jumpToCurrentMonth() {
  const now = dayjs();
  year.value = now.year();
  month.value = now.month() + 1;
}

async function saveExpense() {
  if (!expenseForm.amount || expenseForm.amount <= 0) {
    showToast('请输入有效金额');
    return;
  }
  const finalCategory =
    expenseForm.category === '其他' && expenseForm.customTitle.trim()
      ? expenseForm.customTitle.trim()
      : expenseForm.category;
  try {
    await http.post('/expenses', {
      category: finalCategory,
      amount: expenseForm.amount,
      incurredAt: expenseForm.incurredAt,
      note: expenseForm.note,
    });
    showExpenseModal.value = false;
    expenseForm.customTitle = '';
    expenseForm.amount = 0;
    expenseForm.note = '';
    showToast('支出已入账');
    fetchStats();
  } catch {
    showToast('保存支出失败');
  }
}

async function exportCsv() {
  try {
    const res = await http.get('/stats/export', {
      params: { year: year.value, month: month.value, mode: mode.value },
      responseType: 'blob',
    });
    const url = URL.createObjectURL(res.data);
    const a = document.createElement('a');
    a.href = url;
    const suffix = mode.value === 'all' ? `${year.value}全年` : `${year.value}-${String(month.value).padStart(2, '0')}`;
    a.download = `晴记账本-${suffix}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('账单已导出');
  } catch {
    showToast('导出失败');
  }
}

watch([year, month, mode], () => {
  fetchStats();
});
watch(() => ui.privacyMode, renderCharts);
onMounted(fetchStats);

onBeforeUnmount(() => {
  barChart?.dispose();
  pieChart?.dispose();
});
</script>
