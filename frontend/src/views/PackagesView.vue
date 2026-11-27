<template>
  <div class="h-full flex flex-col overflow-hidden">
    <!-- Minimalist Adaptive Top Bar -->
    <header class="nav-adaptive px-4 pb-3 flex items-center justify-between" :style="headerStyle">
      <button
        type="button"
        class="ios27-icon-btn"
        aria-label="返回"
        @click="router.back()"
      >
        <ChevronLeft class="w-[17px] h-[17px]" />
      </button>

      <h1 class="text-[17px] font-semibold text-ink tracking-tight">报价套餐库</h1>

      <button
        type="button"
        class="ios27-icon-btn"
        aria-label="新增套餐"
        @click="openCreateSheet"
      >
        <Plus class="w-[17px] h-[17px]" />
      </button>
    </header>

    <!-- Main Scrollable Minimalist Content -->
    <div class="scroll-pane no-scrollbar px-4 pt-1 pb-24" @scroll.passive="onPaneScroll">
      <!-- Quiet Filter Bar + Lightweight Copy Action -->
      <div class="flex items-center justify-between mb-4">
        <div class="inline-flex bg-white/80 p-1 rounded-full border border-white/90 text-[12px] font-medium">
          <button
            v-for="tab in filterTabs"
            :key="tab.value"
            type="button"
            class="px-3.5 py-1 rounded-full transition-colors"
            :class="filter === tab.value ? 'bg-brand text-white' : 'text-ink-secondary'"
            @click="filter = tab.value"
          >
            {{ tab.label }}
          </button>
        </div>

        <button
          v-if="packages.length > 0"
          type="button"
          class="inline-flex items-center gap-1 text-[12px] font-medium text-[#A46B7D] px-2.5 py-1.5 rounded-full bg-white/75 pressable"
          @click="copyFullPriceList"
        >
          <Copy class="w-3.5 h-3.5" />
          <span>复制文案</span>
        </button>
      </div>

      <!-- 1:1 Zero-Flash Overlay Skeleton + Minimalist Grouped Cards -->
      <div class="relative min-h-[340px]">
        <Transition name="skeleton-dissolve">
          <div v-if="loading" class="absolute inset-0 z-10 space-y-3 pointer-events-none">
            <div v-for="i in 4" :key="i" class="card-soft p-4 space-y-2">
              <div class="flex items-center justify-between">
                <div class="skeleton-box h-4 w-32 rounded-lg" />
                <div class="skeleton-box h-5 w-16 rounded-lg" />
              </div>
              <div class="skeleton-box h-3 w-48 rounded-full" />
            </div>
          </div>
        </Transition>

        <div v-if="filteredPackages.length > 0" class="space-y-5">
          <!-- Main Packages Section -->
          <section v-if="visibleMains.length > 0" class="space-y-2.5">
            <div class="px-1 flex items-center justify-between">
              <span class="text-[12px] font-semibold text-ink-secondary">主推套餐</span>
              <span class="text-[11px] text-ink-muted tabular-nums">{{ visibleMains.length }} 项</span>
            </div>
            <div class="card-soft divide-y divide-[#F3E8EC] overflow-hidden">
              <div
                v-for="pkg in visibleMains"
                :key="pkg.id"
                class="px-4 py-3.5 active:bg-[#FAF2F5]/60 transition-colors cursor-pointer"
                @click="openEditSheet(pkg)"
              >
                <div class="flex items-center justify-between gap-3">
                  <div class="flex items-center gap-2 min-w-0">
                    <span class="text-[15px] font-semibold text-ink truncate">{{ pkg.name }}</span>
                    <span
                      v-if="pkg.defaultDurationMin > 0"
                      class="text-[10.5px] text-ink-muted bg-[#FAF2F5] px-2 py-0.5 rounded-full shrink-0 tabular-nums"
                    >
                      约 {{ formatDuration(pkg.defaultDurationMin) }}
                    </span>
                  </div>
                  <span class="text-[16px] font-semibold text-brand-deep tabular-nums shrink-0">
                    ¥{{ pkg.price }}
                  </span>
                </div>
                <p v-if="pkg.description" class="text-[12px] text-ink-muted mt-1 leading-relaxed line-clamp-2">
                  {{ pkg.description }}
                </p>
                <div class="mt-2.5 flex items-center justify-between text-[11.5px]">
                  <span class="text-[#B79BA4]">轻点编辑</span>
                  <button
                    type="button"
                    class="inline-flex items-center gap-0.5 text-[#A46B7D] font-medium pressable"
                    @click.stop="bookWithPackage(pkg)"
                  >
                    <span>用此套餐排单</span>
                    <ChevronRight class="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </section>

          <!-- Extra Add-ons Section -->
          <section v-if="visibleExtras.length > 0" class="space-y-2.5">
            <div class="px-1 flex items-center justify-between">
              <span class="text-[12px] font-semibold text-ink-secondary">增项服务</span>
              <span class="text-[11px] text-ink-muted tabular-nums">{{ visibleExtras.length }} 项</span>
            </div>
            <div class="card-soft divide-y divide-[#F3E8EC] overflow-hidden">
              <div
                v-for="pkg in visibleExtras"
                :key="pkg.id"
                class="px-4 py-3.5 active:bg-[#FAF2F5]/60 transition-colors cursor-pointer"
                @click="openEditSheet(pkg)"
              >
                <div class="flex items-center justify-between gap-3">
                  <span class="text-[15px] font-semibold text-ink truncate">{{ pkg.name }}</span>
                  <span class="text-[16px] font-semibold text-brand-deep tabular-nums shrink-0">
                    ¥{{ pkg.price }}
                  </span>
                </div>
                <p v-if="pkg.description" class="text-[12px] text-ink-muted mt-1 leading-relaxed line-clamp-2">
                  {{ pkg.description }}
                </p>
              </div>
            </div>
          </section>
        </div>

        <div v-else-if="!loading" class="card-soft py-6">
          <CuteEmptyState
            variant="packages"
            title="还没有保存的报价套餐"
            description="点击右上角 + 添加常用妆造套餐或增项，完成后可一键生成专属海报"
          />
        </div>
      </div>
    </div>

    <!-- Clean Docked Bottom CTA: Confirm & Generate Cute Price Poster -->
    <div v-if="packages.length > 0" class="dock-glass-bar px-4 pt-2.5">
      <button
        type="button"
        class="btn-unified w-full btn-rose text-white flex items-center justify-center gap-1.5"
        @click="showPricePoster = true"
      >
        <Sparkles class="w-4 h-4" />
        <span>确认生成可爱报价海报</span>
      </button>
    </div>

    <!-- Clean Add / Edit Package Sheet -->
    <van-popup v-model:show="showEditorSheet" position="bottom" teleport="body" round :style="{ maxHeight: '82dvh' }">
      <div class="p-5 pb-safe-sheet space-y-4">
        <div class="sheet-grabber" />
        <div class="flex items-center justify-between">
          <h3 class="text-[17px] font-semibold text-ink">
            {{ editingId ? '编辑套餐 / 增项' : '新增套餐 / 增项' }}
          </h3>
          <button type="button" class="icon-btn-white" @click="showEditorSheet = false">
            <X class="w-4 h-4" />
          </button>
        </div>

        <div class="space-y-3">
          <div class="grid grid-cols-2 gap-2.5">
            <div>
              <label class="block text-[11.5px] text-ink-secondary mb-1">名称 *</label>
              <input v-model.trim="form.name" type="text" placeholder="如：新娘全天跟妆" class="w-full input-silk px-3.5 h-[42px]" />
            </div>
            <div>
              <label class="block text-[11.5px] text-ink-secondary mb-1">报价金额</label>
              <div class="input-affix-wrap !h-[42px]">
                <span class="input-affix-unit mr-1">¥</span>
                <input v-model.number="form.price" type="number" inputmode="decimal" placeholder="0" class="tabular-nums font-medium" />
              </div>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-2.5">
            <div>
              <label class="block text-[11.5px] text-ink-secondary mb-1">类型</label>
              <div class="flex gap-1.5">
                <button
                  type="button"
                  class="flex-1 h-[40px] rounded-xl text-[12.5px] font-medium transition-colors"
                  :class="form.category === 'MAIN' ? 'bg-brand text-white' : 'bg-[#FAF2F5] text-ink-secondary'"
                  @click="form.category = 'MAIN'"
                >
                  主套餐
                </button>
                <button
                  type="button"
                  class="flex-1 h-[40px] rounded-xl text-[12.5px] font-medium transition-colors"
                  :class="form.category === 'EXTRA' ? 'bg-brand text-white' : 'bg-[#FAF2F5] text-ink-secondary'"
                  @click="form.category = 'EXTRA'"
                >
                  增项
                </button>
              </div>
            </div>
            <div>
              <label class="block text-[11.5px] text-ink-secondary mb-1">预计时长</label>
              <div class="input-affix-wrap !h-[40px]">
                <input v-model.number="form.durationHours" type="number" step="0.5" min="0" inputmode="decimal" placeholder="0" class="tabular-nums" />
                <span class="input-affix-unit ml-1">小时</span>
              </div>
            </div>
          </div>

          <div>
            <label class="block text-[11.5px] text-ink-secondary mb-1">服务内容说明（选填）</label>
            <textarea
              v-model.trim="form.description"
              rows="2"
              placeholder="如：含早妆+仪式+敬酒共3套造型，免费试妆一次"
              class="w-full input-silk p-3"
            />
          </div>
        </div>

        <div class="flex items-center gap-2.5 pt-1">
          <button
            v-if="editingId"
            type="button"
            class="btn-unified btn-glass !text-status-danger-text px-5 shrink-0"
            @click="deleteCurrentPackage"
          >
            删除
          </button>
          <button
            type="button"
            class="btn-unified flex-1 btn-rose text-white"
            :disabled="saving"
            @click="savePackage"
          >
            {{ saving ? '保存中...' : editingId ? '保存修改' : '确认添加' }}
          </button>
        </div>
      </div>
    </van-popup>

    <!-- High-Impact Cute Price-List Poster Modal (Long-Press to Save to Album) -->
    <PriceListPosterModal
      v-model:show="showPricePoster"
      :studio-name="auth.user?.studioName || '嘻嘻化妆室'"
      :avatar-url="auth.user?.avatarUrl"
      :bio="auth.user?.bio"
      :phone="auth.user?.phone"
      :packages="packages"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { showConfirmDialog, showToast } from 'vant';
import { ChevronLeft, ChevronRight, Copy, Plus, Sparkles, X } from 'lucide-vue-next';
import http from '@/api/http';
import { useAuthStore } from '@/stores/auth';
import { useScrollHeader } from '@/composables/useScrollHeader';
import CuteEmptyState from '@/components/CuteEmptyState.vue';
import PriceListPosterModal from '@/components/PriceListPosterModal.vue';
import type { PackageTemplate } from '@/types';

const router = useRouter();
const auth = useAuthStore();
const { onPaneScroll, headerStyle } = useScrollHeader(44);

const loading = ref(true);
const saving = ref(false);
const packages = ref<PackageTemplate[]>([]);
const filter = ref<'ALL' | 'MAIN' | 'EXTRA'>('ALL');
const showPricePoster = ref(false);

const filterTabs = [
  { value: 'ALL' as const, label: '全部' },
  { value: 'MAIN' as const, label: '主套餐' },
  { value: 'EXTRA' as const, label: '增项' },
];

const filteredPackages = computed(() => {
  if (filter.value === 'ALL') return packages.value;
  return packages.value.filter((p) => p.category === filter.value);
});

const visibleMains = computed(() => filteredPackages.value.filter((p) => p.category === 'MAIN'));
const visibleExtras = computed(() => filteredPackages.value.filter((p) => p.category === 'EXTRA'));

const showEditorSheet = ref(false);
const editingId = ref<string | null>(null);
const form = reactive({
  name: '',
  price: 0,
  category: 'MAIN' as 'MAIN' | 'EXTRA',
  durationHours: 6,
  description: '',
});

function formatDuration(mins: number) {
  const h = mins / 60;
  return Number.isInteger(h) ? `${h}h` : `${h.toFixed(1)}h`;
}

function openCreateSheet() {
  editingId.value = null;
  form.name = '';
  form.price = 0;
  form.category = filter.value === 'EXTRA' ? 'EXTRA' : 'MAIN';
  form.durationHours = form.category === 'MAIN' ? 6 : 1;
  form.description = '';
  showEditorSheet.value = true;
}

function openEditSheet(pkg: PackageTemplate) {
  editingId.value = pkg.id;
  form.name = pkg.name;
  form.price = pkg.price;
  form.category = pkg.category;
  form.durationHours = pkg.defaultDurationMin ? Number((pkg.defaultDurationMin / 60).toFixed(1)) : 0;
  form.description = pkg.description || '';
  showEditorSheet.value = true;
}

async function savePackage() {
  if (!form.name.trim()) return showToast('请填写套餐名称');
  saving.value = true;
  try {
    const payload = {
      name: form.name.trim(),
      price: Number(form.price) || 0,
      category: form.category,
      defaultDurationMin: Math.max(0, Math.round((Number(form.durationHours) || 0) * 60)),
      description: form.description || '',
    };
    if (editingId.value) {
      const { data } = await http.put(`/packages/${editingId.value}`, payload);
      const idx = packages.value.findIndex((p) => p.id === editingId.value);
      if (idx !== -1) packages.value[idx] = data.package;
      showToast('已保存修改');
    } else {
      const { data } = await http.post('/packages', payload);
      packages.value.push(data.package);
      showToast('已添加到报价库');
    }
    showEditorSheet.value = false;
  } finally {
    saving.value = false;
  }
}

async function deleteCurrentPackage() {
  if (!editingId.value) return;
  try {
    await showConfirmDialog({
      title: '删除套餐',
      message: `确认删除「${form.name}」吗？`,
      confirmButtonText: '确认删除',
      confirmButtonColor: '#C67A89',
    });
    await http.delete(`/packages/${editingId.value}`);
    packages.value = packages.value.filter((p) => p.id !== editingId.value);
    showEditorSheet.value = false;
    showToast('已删除');
  } catch {
    // cancelled
  }
}

function bookWithPackage(pkg: PackageTemplate) {
  router.push({ path: '/orders/new', query: { packageId: pkg.id } });
}

async function copyFullPriceList() {
  const studio = auth.user?.studioName || '嘻嘻化妆室';
  const mains = packages.value.filter((p) => p.category === 'MAIN');
  const extras = packages.value.filter((p) => p.category === 'EXTRA');
  const lines: string[] = [`✨ 【${studio} · 妆造报价单】`];
  if (mains.length) {
    lines.push('', '🌸 主推妆造套餐');
    for (const p of mains) {
      const dur = p.defaultDurationMin ? `（约${formatDuration(p.defaultDurationMin)}）` : '';
      lines.push(`· ${p.name}${dur}：¥${p.price}`);
      if (p.description) lines.push(`  ${p.description}`);
    }
  }
  if (extras.length) {
    lines.push('', '🌷 常用增项服务');
    for (const p of extras) {
      lines.push(`· ${p.name}：¥${p.price}${p.description ? `（${p.description}）` : ''}`);
    }
  }
  try {
    await navigator.clipboard.writeText(lines.join('\n'));
    showToast('已复制报价文案，可直接粘贴发微信');
  } catch {
    showToast('复制失败，请手动截图');
  }
}

onMounted(async () => {
  try {
    const { data } = await http.get('/packages');
    packages.value = data.packages || [];
  } finally {
    loading.value = false;
  }
});
</script>
