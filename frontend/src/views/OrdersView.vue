<template>
  <div class="h-full flex flex-col overflow-hidden">
    <!-- Fixed Top Header: Transparent at rest -> Smoothly fades to UI Pink on scroll -->
    <header class="nav-adaptive px-4 pb-3 space-y-2.5" :style="headerStyle">
      <div class="flex items-baseline gap-2.5">
        <h1 class="text-[22px] font-semibold tracking-tight text-ink leading-none">妆造行程</h1>
        <span class="text-[12.5px] font-semibold text-[#66555C] tabular-nums leading-none">
          共 {{ orders.length }} 场预约
        </span>
      </div>

      <!-- Refined Search Pill Input -->
      <div class="relative">
        <Search class="w-[15px] h-[15px] text-ink-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          v-model.trim="searchQuery"
          type="search"
          placeholder="搜索新娘姓名、电话或酒店..."
          class="w-full input-search-pill pl-9 pr-9 h-[38px]"
        />
        <button
          v-if="searchQuery"
          type="button"
          class="absolute right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-brand-soft text-brand-deep flex items-center justify-center"
          @click="searchQuery = ''"
        >
          <X class="w-3 h-3" />
        </button>
      </div>

      <!-- Shadowless Flat Status Filter Tabs -->
      <div class="flex items-center gap-2 overflow-x-auto no-scrollbar">
        <button
          v-for="pill in statusPills"
          :key="pill.value"
          type="button"
          class="pressable shrink-0 px-3.5 h-8 rounded-full text-[13px] font-medium transition-colors duration-200 flex items-center gap-1.5 shadow-none"
          :class="
            activeStatus === pill.value
              ? 'bg-brand text-white'
              : 'bg-white/85 text-ink-secondary'
          "
          @click="activeStatus = pill.value"
        >
          <span>{{ pill.label }}</span>
          <span
            v-if="pill.value === 'PENDING_BALANCE' && pendingBalanceCount > 0"
            class="px-1.5 py-0.2 rounded-full text-[10px] font-semibold tabular-nums"
            :class="
              activeStatus === 'PENDING_BALANCE'
                ? 'bg-white/25 text-white'
                : 'bg-status-danger-bg text-status-danger-text'
            "
          >
            {{ pendingBalanceCount }}
          </span>
        </button>
      </div>
    </header>

    <!-- Independently Scrollable Card Region -->
    <div class="scroll-pane no-scrollbar px-4 pt-3 pb-6" @scroll.passive="onPaneScroll">
      <Transition name="skeleton-fade" mode="out-in">
        <div v-if="loading && !orders.length" key="orders-skeleton" class="space-y-4">
          <div v-for="g in 2" :key="'og-' + g" class="space-y-2.5">
            <div class="flex items-center justify-between px-1">
              <div class="skeleton-box h-4 w-36 rounded-full" />
              <div class="skeleton-box h-3.5 w-10 rounded-full" />
            </div>
            <div class="space-y-2.5 pl-3 border-l border-brand/15 ml-1">
              <div v-for="i in 2" :key="'oc-' + g + '-' + i" class="card-soft p-4 space-y-3">
                <div class="flex items-center justify-between">
                  <div class="skeleton-box h-5 w-24 rounded-full" />
                  <div class="skeleton-box h-5 w-14 rounded-full" />
                </div>
                <div class="flex items-center gap-3">
                  <div class="skeleton-box w-10 h-10 rounded-2xl shrink-0" />
                  <div class="flex-1 space-y-2">
                    <div class="skeleton-box h-4 w-40" />
                    <div class="skeleton-box h-3 w-28" />
                  </div>
                  <div class="skeleton-box h-6 w-16" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-else-if="groupedOrders.length > 0" key="orders-list" class="space-y-5">
        <section
          v-for="(group, gIdx) in groupedOrders"
          :key="group.date"
          class="stagger-item"
          :style="{ '--stagger': Math.min(gIdx, 6) }"
        >
          <div class="flex items-center justify-between px-1 mb-2.5">
            <div class="flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-brand ring-4 ring-brand/15" />
              <h2 class="text-[13px] font-semibold text-ink tabular-nums">{{ group.label }}</h2>
              <span class="px-2 py-0.5 rounded-full bg-brand-soft text-brand-deep text-[10px] font-medium">
                {{ getRelativeDayLabel(group.date) }}
              </span>
            </div>
            <span class="text-[11px] text-ink-muted tabular-nums">{{ group.items.length }} 场</span>
          </div>

          <div class="space-y-2.5 pl-3 border-l border-brand/15 ml-1">
            <van-swipe-cell
              v-for="order in group.items"
              :key="order.id"
              class="rounded-[22px] overflow-hidden"
            >
              <article
                class="card-soft p-4 pl-5 relative overflow-hidden pressable cursor-pointer"
                @click="router.push(`/orders/${order.id}`)"
              >
                <span
                  class="absolute left-0 top-3 bottom-3 w-1 rounded-r-full"
                  :class="statusMeta(order.status, order.balanceDue).ribbonClass"
                />

                <div class="flex items-center justify-between">
                  <span class="px-2.5 py-0.5 rounded-full bg-brand-soft text-brand-deep text-[12px] font-semibold tabular-nums">
                    {{ order.startTime }} - {{ order.endTime }}
                  </span>
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
                        <span class="truncate">{{ order.location || '地点待确认' }}</span>
                      </p>
                    </div>
                  </div>

                  <div class="text-right shrink-0 tabular-nums">
                    <div class="text-[16px] font-semibold text-ink">
                      <span class="text-[11px] font-normal mr-0.5">¥</span>{{ ui.formatMoney(order.totalAmount, '') }}
                    </div>
                    <div v-if="order.balanceDue > 0" class="text-[11px] text-status-danger-text">
                      尾款 {{ ui.formatMoney(order.balanceDue) }}
                    </div>
                  </div>
                </div>
              </article>

              <template #right>
                <div class="flex h-full pl-2 gap-1.5">
                  <button
                    v-if="order.balanceDue > 0"
                    type="button"
                    class="h-full px-4 rounded-[18px] bg-status-locked-bg text-status-locked-text text-[13px] font-medium"
                    @click.stop="quickSettle(order)"
                  >
                    结清尾款
                  </button>
                  <button
                    type="button"
                    class="h-full px-4 rounded-[18px] bg-brand-soft text-brand-deep text-[13px] font-medium"
                    @click.stop="router.push(`/orders/${order.id}/edit`)"
                  >
                    编辑
                  </button>
                  <button
                    type="button"
                    class="h-full px-4 rounded-[18px] bg-status-danger-bg text-status-danger-text text-[13px] font-medium"
                    @click.stop="softDelete(order)"
                  >
                    删除
                  </button>
                </div>
              </template>
            </van-swipe-cell>
          </div>
        </section>
      </div>

        <div v-else key="orders-empty" class="card-soft mt-2">
          <CuteEmptyState
            variant="orders"
            title="暂无匹配的妆造行程"
            description="可切换筛选状态，或轻点底部中央按钮新建行程"
          />
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { watchDebounced } from '@vueuse/core';
import dayjs from 'dayjs';
import { showConfirmDialog, showToast } from 'vant';
import { Search, X } from 'lucide-vue-next';
import http from '@/api/http';
import { useUiStore } from '@/stores/ui';
import { useScrollHeader } from '@/composables/useScrollHeader';
import { getRelativeDayLabel, serviceCategoryVisual, statusMeta } from '@/utils/format';
import { IconPearlPin } from '@/components/icons/BeautyIcons';
import CuteEmptyState from '@/components/CuteEmptyState.vue';
import type { Order } from '@/types';

const route = useRoute();
const router = useRouter();
const ui = useUiStore();
const { onPaneScroll, headerStyle } = useScrollHeader(44);

const searchQuery = ref('');
const activeStatus = ref<string>((route.query.status as string) || 'ALL');
const orders = ref<Order[]>([]);
const pendingBalanceCount = ref(0);
const loading = ref(true);

const statusPills = [
  { label: '全部', value: 'ALL' },
  { label: '待服务', value: 'PENDING_SERVICE' },
  { label: '待收尾款', value: 'PENDING_BALANCE' },
  { label: '已完成', value: 'COMPLETED' },
];

async function fetchOrders() {
  loading.value = true;
  try {
    const { data } = await http.get('/orders', {
      params: {
        status: activeStatus.value,
        search: searchQuery.value || undefined,
      },
    });
    orders.value = data.orders || [];
    pendingBalanceCount.value = data.pendingBalanceCount || 0;
  } catch {
    showToast('加载行程失败');
  } finally {
    loading.value = false;
  }
}

watch(activeStatus, fetchOrders);
watchDebounced(searchQuery, fetchOrders, { debounce: 240 });
onMounted(fetchOrders);

const groupedOrders = computed(() => {
  const map = new Map<string, Order[]>();
  for (const o of orders.value) {
    const arr = map.get(o.serviceDate) || [];
    arr.push(o);
    map.set(o.serviceDate, arr);
  }
  const today = dayjs().format('YYYY-MM-DD');
  const entries = Array.from(map.entries());
  const upcoming = entries.filter(([d]) => d >= today).sort((a, b) => (a[0] > b[0] ? 1 : -1));
  const past = entries.filter(([d]) => d < today).sort((a, b) => (a[0] < b[0] ? 1 : -1));
  const sorted = [...upcoming, ...past];

  const weekNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  return sorted.map(([date, items]) => {
    const d = dayjs(date);
    return {
      date,
      label: `${d.format('YYYY年M月D日')} ${weekNames[d.day()]}`,
      items,
    };
  });
});

async function quickSettle(order: Order) {
  const backup = { ...order };
  const settleAmt = order.balanceDue;
  order.depositPaid += settleAmt;
  order.balanceDue = 0;
  order.status = 'SETTLED';
  pendingBalanceCount.value = Math.max(0, pendingBalanceCount.value - 1);

  try {
    await http.post(`/orders/${order.id}/payments`, {
      amount: settleAmt,
      type: 'BALANCE',
      channel: 'WECHAT',
      note: '左滑一键结清尾款',
    });
    showToast('尾款已结清');
  } catch {
    Object.assign(order, backup);
    pendingBalanceCount.value += 1;
    showToast('结清失败，已回滚');
  }
}

async function softDelete(order: Order) {
  try {
    await showConfirmDialog({
      title: '移入回收站',
      message: `确定将「${order.clientName}」的行程移入 30 天回收站吗？`,
      confirmButtonText: '移入回收站',
      confirmButtonColor: '#C93B5B',
    });
    orders.value = orders.value.filter((o) => o.id !== order.id);
    await http.delete(`/orders/${order.id}`);
    showToast('已移入回收站');
  } catch {
    // cancelled
  }
}
</script>
