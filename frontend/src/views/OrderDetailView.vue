<template>
  <div class="h-full flex flex-col silk-mesh-bg overflow-hidden">
    <!-- Adaptive Top Header: Transparent at rest -> Smoothly fades to UI Pink on scroll -->
    <header class="nav-adaptive px-4 pb-3 flex items-center justify-between" :style="headerStyle">
      <button
        type="button"
        class="ios27-icon-btn"
        aria-label="返回"
        @click="router.back()"
      >
        <ChevronLeft class="w-[17px] h-[17px]" />
      </button>
      <h1 class="text-[17px] font-semibold text-ink">新娘妆造档案</h1>
      <button
        v-if="order"
        type="button"
        class="ios27-icon-btn"
        aria-label="编辑订单"
        @click="router.push(`/orders/${order.id}/edit`)"
      >
        <Pencil class="w-[16px] h-[16px]" />
      </button>
      <div v-else class="w-[34px]" />
    </header>

    <!-- Scrollable Detail Content -->
    <div class="scroll-pane no-scrollbar px-4 pt-2 pb-6" @scroll.passive="onPaneScroll">
      <div v-if="loading" class="space-y-3">
        <div class="card-soft p-5 space-y-3">
          <div class="skeleton-box h-5 w-40" />
          <div class="skeleton-box h-4 w-56" />
          <div class="skeleton-box h-20 w-full" />
        </div>
      </div>

      <div v-else-if="order" class="space-y-4">
        <!-- Bridal Vanity Hero Card -->
        <section
          class="card-soft p-5 relative overflow-hidden stagger-item"
          style="background: linear-gradient(160deg, rgba(254,239,244,0.95) 0%, rgba(255,255,255,0.96) 48%)"
        >
          <div class="flex items-start justify-between">
            <div class="flex items-center gap-3">
              <div
                class="w-12 h-12 rounded-[18px] bg-gradient-to-br flex items-center justify-center text-[18px] font-semibold shadow-sm"
                :class="serviceCategoryVisual(order.serviceType).avatarBg"
              >
                {{ order.clientName.slice(0, 1) }}
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <h2 class="text-[19px] font-semibold text-ink">{{ order.clientName }}</h2>
                  <span class="px-2 py-0.5 rounded-full bg-white text-brand-deep text-[11px] font-medium shadow-sm">
                    {{ getRelativeDayLabel(order.serviceDate) }}
                  </span>
                </div>
                <p class="text-[13px] text-ink-secondary mt-0.5">{{ order.serviceType }}</p>
              </div>
            </div>

            <span
              class="px-3 py-1 rounded-full text-[11px] font-semibold"
              :class="[statusMeta(order.status, order.balanceDue).bgClass, statusMeta(order.status, order.balanceDue).textClass]"
            >
              {{ statusMeta(order.status, order.balanceDue).label }}
            </span>
          </div>

          <div class="mt-3.5 text-[13px] text-ink-secondary tabular-nums flex items-center gap-2">
            <IconTabCalendar :size="16" class="text-brand" />
            <span>
              {{ order.serviceDate }}{{ order.endDate ? ` 至 ${order.endDate}` : '' }} · {{ order.startTime }} - {{ order.endTime }}
            </span>
          </div>

          <!-- Connected 3-Node Morning Prep Countdown -->
          <div class="mt-4 rounded-[20px] bg-white p-4 border border-brand/10 shadow-sm">
            <div class="flex items-center justify-between text-[11px] text-brand-deep font-medium mb-3">
              <span class="flex items-center gap-1">
                <IconTabItinerary :size="14" class="text-brand" />
                晨光出妆倒推时刻表
              </span>
              <span class="tabular-nums text-ink-muted">预留车程 {{ order.commuteMinutes }} 分钟</span>
            </div>

            <div class="relative grid grid-cols-3 gap-2 text-center">
              <div
                class="absolute top-3.5 left-[18%] right-[18%] h-[2px] pointer-events-none"
                style="background: linear-gradient(90deg, #F5E1E7 0%, #DF9FB0 100%)"
              />

              <div class="relative z-10 flex flex-col items-center">
                <span class="w-7 h-7 rounded-full bg-brand-soft text-brand-deep flex items-center justify-center mb-1.5 border-2 border-white shadow-sm">
                  <IconRestMoon :size="14" />
                </span>
                <div class="text-[15px] font-semibold text-ink tabular-nums">{{ wakeUpTime }}</div>
                <div class="text-[11px] text-ink-muted">建议起床</div>
              </div>

              <div class="relative z-10 flex flex-col items-center">
                <span class="w-7 h-7 rounded-full bg-brand-soft text-brand-deep flex items-center justify-center mb-1.5 border-2 border-white shadow-sm">
                  <IconPearlPin :size="14" />
                </span>
                <div class="text-[15px] font-semibold text-ink tabular-nums">{{ leaveTime }}</div>
                <div class="text-[11px] text-ink-muted">最晚出门</div>
              </div>

              <div class="relative z-10 flex flex-col items-center">
                <span class="w-7 h-7 rounded-full btn-rose text-white flex items-center justify-center mb-1.5 border-2 border-white shadow-sm">
                  <IconLipstick :size="14" />
                </span>
                <div class="text-[15px] font-semibold text-brand-deep tabular-nums">{{ order.startTime }}</div>
                <div class="text-[11px] text-ink-muted">准时开妆</div>
              </div>
            </div>
          </div>

          <!-- One-Tap Navigation & Call -->
          <div class="grid grid-cols-2 gap-2.5 mt-4">
            <a
              :href="mapUrl"
              target="_blank"
              rel="noopener"
              class="btn-unified btn-glass text-[13px] px-3"
            >
              <IconPearlPin :size="15" class="text-brand shrink-0" />
              <span class="truncate">{{ order.location || '导航出妆点' }}</span>
            </a>
            <a
              :href="order.clientPhone ? `tel:${order.clientPhone}` : undefined"
              class="btn-unified btn-glass text-[13px] px-3"
              :class="!order.clientPhone ? 'opacity-50 pointer-events-none' : ''"
            >
              <Phone class="w-4 h-4 text-brand shrink-0" />
              <span class="tabular-nums">{{ order.clientPhone || '未留电话' }}</span>
            </a>
          </div>
        </section>

        <!-- Fee Breakdown with Soft Pale-Blush Ratio Bar -->
        <section class="card-soft p-5 space-y-2.5 text-[14px] tabular-nums stagger-item" style="--stagger: 1">
          <div class="flex items-center justify-between mb-1">
            <h3 class="text-[15px] font-semibold text-ink">费用与尾款进度</h3>
            <span class="text-[11px] text-brand-deep font-medium">已收 {{ paidRatio }}%</span>
          </div>

          <div class="h-2 rounded-full bg-brand-soft overflow-hidden mb-3">
            <div
              class="h-full rounded-full transition-transform duration-500 ease-ios origin-left"
              style="background: linear-gradient(90deg, #F0CBD5 0%, #DF9FB0 100%)"
              :style="{ transform: `scaleX(${paidRatio / 100})` }"
            />
          </div>

          <div class="flex justify-between">
            <span class="text-ink-secondary">套餐基础价</span>
            <span class="text-ink">{{ ui.formatMoney(order.basePrice) }}</span>
          </div>
          <div v-for="extra in order.extraItems" :key="extra.id || extra.name" class="flex justify-between text-[13px]">
            <span class="text-ink-secondary">{{ extra.name }} × {{ extra.quantity }}</span>
            <span class="text-ink">{{ ui.formatMoney(extra.subtotal) }}</span>
          </div>
          <div v-if="order.discount > 0" class="flex justify-between text-[13px]">
            <span class="text-ink-secondary">心意减免</span>
            <span class="text-status-locked-text">-{{ ui.formatMoney(order.discount) }}</span>
          </div>
          <div class="pt-2.5 mt-2 flex justify-between font-semibold" style="border-top: 1px dashed #F2DCE4">
            <span class="text-ink">订单总额</span>
            <span class="text-ink text-[17px]">{{ ui.formatMoney(order.totalAmount) }}</span>
          </div>
          <div class="flex justify-between text-[13px]">
            <span class="text-ink-secondary">已收定金/款项</span>
            <span class="text-status-locked-text font-semibold">{{ ui.formatMoney(order.depositPaid) }}</span>
          </div>
          <div class="flex justify-between text-[13px]">
            <span class="text-ink-secondary">待收尾款</span>
            <span :class="order.balanceDue > 0 ? 'text-status-danger-text font-semibold' : 'text-ink-muted'">
              {{ ui.formatMoney(order.balanceDue) }}
            </span>
          </div>
          <div v-if="order.assistantName || order.assistantFee > 0" class="flex justify-between text-[12px] text-ink-muted pt-1">
            <span>跟妆助理：{{ order.assistantName || '未命名' }}</span>
            <span>助理费 {{ ui.formatMoney(order.assistantFee) }}</span>
          </div>
        </section>

        <!-- Skin & Styling Inspiration Notes -->
        <section
          v-if="order.skinType || order.allergyNote || order.notes || order.referenceImages.length"
          class="card-soft p-5 space-y-3 stagger-item"
          style="--stagger: 2"
        >
          <h3 class="text-[15px] font-semibold text-ink">肤质档案与造型灵感</h3>
          <div v-if="order.skinType" class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-champagne-soft text-[12px] text-champagne font-medium">
            <span>肤质：{{ order.skinType }}</span>
          </div>
          <div v-if="order.allergyNote" class="text-[13px] text-status-danger-text bg-status-danger-bg px-3.5 py-2.5 rounded-2xl">
            禁忌提醒：{{ order.allergyNote }}
          </div>
          <p v-if="order.notes" class="text-[13px] text-ink-secondary leading-relaxed whitespace-pre-line bg-canvas p-3.5 rounded-2xl">
            {{ order.notes }}
          </p>
          <div v-if="order.referenceImages.length" class="grid grid-cols-3 gap-2 pt-1">
            <img
              v-for="(img, idx) in order.referenceImages"
              :key="img"
              :src="img"
              alt="参考图"
              class="aspect-square rounded-2xl object-cover cursor-pointer pressable shadow-sm"
              @click="previewImages(idx)"
            />
          </div>
        </section>

        <!-- Interactive Vanity Packing Checklist -->
        <section class="card-soft p-5 stagger-item" style="--stagger: 3">
          <div class="flex items-center justify-between mb-2">
            <div class="flex items-center gap-1.5">
              <IconCosmeticCase :size="17" class="text-brand" />
              <h3 class="text-[15px] font-semibold text-ink">化妆箱清点清单</h3>
            </div>
            <span class="text-[12px] text-brand-deep tabular-nums font-semibold">
              {{ checkedCount }} / {{ order.checklist.length }}
            </span>
          </div>

          <div class="h-1.5 rounded-full bg-brand-soft overflow-hidden mb-3.5">
            <div
              class="h-full rounded-full btn-rose transition-transform duration-300 ease-ios origin-left"
              :style="{ transform: `scaleX(${order.checklist.length ? checkedCount / order.checklist.length : 0})` }"
            />
          </div>

          <div
            v-if="order.checklist.length > 0 && checkedCount === order.checklist.length"
            class="mb-3 px-3.5 py-2 rounded-2xl bg-brand-soft text-brand-deep text-[12px] font-medium spring-pop"
          >
            化妆箱已全部清点完毕，祝今日妆效惊艳全场！
          </div>

          <div class="space-y-2">
            <button
              v-for="item in order.checklist"
              :key="item.id"
              type="button"
              class="pressable w-full flex items-center gap-3 p-3 rounded-2xl transition-colors text-left"
              :class="item.checked ? 'bg-brand-soft/45' : 'bg-canvas'"
              @click="toggleChecklist(item)"
            >
              <div
                class="w-5 h-5 rounded-full flex items-center justify-center transition-all shrink-0"
                :class="item.checked ? 'btn-rose text-white spring-pop' : 'bg-white border border-brand/25'"
              >
                <Check v-if="item.checked" class="w-3.5 h-3.5" :stroke-width="2.6" />
              </div>
              <span
                class="text-[14px] transition-colors"
                :class="item.checked ? 'line-through text-ink-muted' : 'text-ink'"
              >
                {{ item.label }}
              </span>
            </button>
          </div>
        </section>
      </div>
    </div>

    <!-- Docked Bottom Action Bar (Clean White Icon Buttons + Primary CTA, no glass tray) -->
    <div v-if="order" class="dock-glass-bar px-4 pt-2.5">
      <div class="flex items-center gap-2.5">
        <button
          type="button"
          class="ios27-icon-btn"
          aria-label="生成预约确认函"
          @click="showConfirmPoster = true"
        >
          <IconPosterCard :size="17" />
        </button>
        <button
          type="button"
          class="ios27-icon-btn"
          aria-label="写入苹果日历"
          @click="exportIcs"
        >
          <IconCalendarSync :size="17" />
        </button>
        <button
          type="button"
          :disabled="order.balanceDue <= 0"
          class="btn-unified flex-1 tabular-nums"
          :class="
            order.balanceDue > 0
              ? 'btn-rose text-white'
              : 'btn-glass text-status-locked-text'
          "
          @click="settleBalance"
        >
          {{ order.balanceDue > 0 ? `结清尾款 (${ui.formatMoney(order.balanceDue)})` : '✓ 款项已结清' }}
        </button>
      </div>
    </div>

    <OrderConfirmPosterModal
      v-model:show="showConfirmPoster"
      :order="order"
      :studio-name="auth.user?.studioName || '嘻嘻化妆室'"
      :notice-template="auth.user?.noticeTemplate || ''"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { showImagePreview, showToast } from 'vant';
import { ChevronLeft, Pencil, Phone, Check } from 'lucide-vue-next';
import http from '@/api/http';
import { useUiStore } from '@/stores/ui';
import { useAuthStore } from '@/stores/auth';
import { useScrollHeader } from '@/composables/useScrollHeader';
import {
  downloadSingleOrderIcs,
  getRelativeDayLabel,
  serviceCategoryVisual,
  statusMeta,
  subtractMinutes,
} from '@/utils/format';
import {
  IconCalendarSync,
  IconCosmeticCase,
  IconLipstick,
  IconPearlPin,
  IconPosterCard,
  IconRestMoon,
  IconTabCalendar,
  IconTabItinerary,
} from '@/components/icons/BeautyIcons';
import OrderConfirmPosterModal from '@/components/OrderConfirmPosterModal.vue';
import type { ChecklistItem, Order } from '@/types';

const route = useRoute();
const router = useRouter();
const ui = useUiStore();
const auth = useAuthStore();
const { onPaneScroll, headerStyle } = useScrollHeader(44);

const order = ref<Order | null>(null);
const loading = ref(true);
const showConfirmPoster = ref(false);

onMounted(async () => {
  try {
    const { data } = await http.get(`/orders/${route.params.id}`);
    order.value = data.order;
  } catch {
    showToast('加载订单失败');
  } finally {
    loading.value = false;
  }
});

const leaveTime = computed(() =>
  order.value ? subtractMinutes(order.value.startTime, (order.value.commuteMinutes || 45) + 15) : '--:--'
);
const wakeUpTime = computed(() =>
  order.value ? subtractMinutes(order.value.startTime, (order.value.commuteMinutes || 45) + 60) : '--:--'
);
const mapUrl = computed(() =>
  order.value?.location
    ? `https://uri.amap.com/search?keyword=${encodeURIComponent(order.value.location)}`
    : '#'
);
const checkedCount = computed(() => order.value?.checklist.filter((c) => c.checked).length || 0);

const paidRatio = computed(() => {
  if (!order.value || order.value.totalAmount <= 0) return 100;
  return Math.min(100, Math.round((order.value.depositPaid / order.value.totalAmount) * 100));
});

function previewImages(startPosition: number) {
  if (!order.value?.referenceImages.length) return;
  showImagePreview({ images: order.value.referenceImages, startPosition });
}

async function toggleChecklist(item: ChecklistItem) {
  if (!order.value) return;
  item.checked = !item.checked;
  try {
    await http.put(`/orders/${order.value.id}`, {
      checklist: order.value.checklist,
    });
  } catch {
    item.checked = !item.checked;
    showToast('同步清单失败');
  }
}

async function settleBalance() {
  if (!order.value || order.value.balanceDue <= 0) return;
  const amt = order.value.balanceDue;
  const prevPaid = order.value.depositPaid;
  const prevStatus = order.value.status;

  order.value.depositPaid += amt;
  order.value.balanceDue = 0;
  order.value.status = 'SETTLED';

  try {
    await http.post(`/orders/${order.value.id}/payments`, {
      amount: amt,
      type: 'BALANCE',
      channel: 'WECHAT',
      note: '详情页一键结清尾款',
    });
    showToast('尾款已结清');
  } catch {
    order.value.depositPaid = prevPaid;
    order.value.balanceDue = amt;
    order.value.status = prevStatus;
    showToast('结清失败，已回滚');
  }
}

function exportIcs() {
  if (!order.value) return;
  downloadSingleOrderIcs(order.value);
  showToast('已生成苹果日历提醒');
}
</script>
