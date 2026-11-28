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

    <!-- Main Scrollable Single Reusable Package List -->
    <div class="scroll-pane no-scrollbar px-4 pt-1 pb-28" @scroll.passive="onPaneScroll">
      <!-- Lightweight Top Action Strip (No Main/Extra Tabs) -->
      <div v-if="packages.length > 0" class="flex items-center justify-between mb-3.5 px-0.5">
        <div class="flex items-center gap-2.5 text-[12.5px]">
          <button
            type="button"
            class="inline-flex items-center gap-1.5 text-ink-secondary font-medium active:opacity-70"
            @click="toggleSelectAll"
          >
            <span
              class="w-[18px] h-[18px] rounded-full flex items-center justify-center transition-colors"
              :class="
                allSelected
                  ? 'bg-brand text-white'
                  : 'bg-white border border-[#DEC8D0] text-transparent'
              "
            >
              <Check class="w-3 h-3" :stroke-width="2.6" />
            </span>
            <span>{{ allSelected ? '取消全选' : '全选' }}</span>
          </button>
          <span class="text-ink-muted text-[12px] tabular-nums">
            共 {{ packages.length }} 个套餐<template v-if="selectedPackages.length > 0"> · 已选 {{ selectedPackages.length }} 项</template>
          </span>
        </div>

        <button
          type="button"
          class="inline-flex items-center gap-1 text-[12px] font-medium px-3 py-1.5 rounded-full transition-colors pressable"
          :class="
            selectedPackages.length > 0
              ? 'bg-white/90 text-[#A46B7D]'
              : 'bg-white/55 text-ink-muted'
          "
          @click="copySelectedPriceList"
        >
          <Copy class="w-3.5 h-3.5" />
          <span>复制文案</span>
        </button>
      </div>

      <!-- 1:1 Zero-Flash Overlay Skeleton + Unified Package Cards -->
      <div class="relative min-h-[360px]">
        <Transition name="skeleton-dissolve">
          <div v-if="loading" class="absolute inset-0 z-10 space-y-3 pointer-events-none">
            <div v-for="i in 3" :key="i" class="card-soft p-4 space-y-2.5">
              <div class="flex items-center justify-between">
                <div class="skeleton-box h-4 w-36 rounded-lg" />
                <div class="skeleton-box h-5 w-16 rounded-lg" />
              </div>
              <div class="skeleton-box h-3 w-52 rounded-full" />
            </div>
          </div>
        </Transition>

        <div v-if="packages.length > 0" class="space-y-3">
          <van-swipe-cell
            v-for="pkg in packages"
            :key="pkg.id"
            class="rounded-[22px] overflow-hidden"
          >
            <article
              class="card-soft p-4 transition-all"
              :class="selectedIds.has(pkg.id) ? 'ring-1.5 ring-[#DF9BB0] bg-white' : ''"
            >
              <!-- Card Header: Tap checkbox to select for quote; tap body to expand details -->
              <div class="flex items-start gap-3">
                <button
                  type="button"
                  class="mt-0.5 w-[22px] h-[22px] rounded-full flex items-center justify-center shrink-0 transition-all pressable"
                  :class="
                    selectedIds.has(pkg.id)
                      ? 'bg-brand text-white shadow-[0_3px_10px_rgba(205,132,155,0.38)]'
                      : 'bg-[#FAF4F6] border border-[#E2CCD4] text-transparent'
                  "
                  :aria-label="selectedIds.has(pkg.id) ? '取消选择套餐' : '选择套餐生成报价'"
                  @click.stop="toggleSelect(pkg.id)"
                >
                  <Check class="w-3.5 h-3.5" :stroke-width="2.7" />
                </button>

                <div class="min-w-0 flex-1 cursor-pointer" @click="toggleExpand(pkg.id)">
                  <div class="flex items-start justify-between gap-2.5">
                    <div class="min-w-0 flex-1">
                      <div class="flex items-center flex-wrap gap-1.5">
                        <h3 class="text-[15.5px] font-semibold text-ink leading-snug break-words">
                          {{ pkg.name }}
                        </h3>
                        <span
                          v-if="pkg.defaultDurationMin > 0"
                          class="inline-flex items-center justify-center h-[20px] px-2 rounded-full bg-[#FAF2F5] text-[10.5px] font-medium text-[#9B7280] shrink-0 tabular-nums leading-none"
                        >
                          约 {{ formatDuration(pkg.defaultDurationMin) }}
                        </span>
                      </div>
                      <p
                        v-if="pkg.description"
                        class="text-[12px] text-ink-muted mt-1.5 leading-relaxed"
                        :class="expandedIds.has(pkg.id) ? '' : 'line-clamp-2'"
                      >
                        {{ pkg.description }}
                      </p>
                    </div>

                    <div class="text-right shrink-0 tabular-nums pt-0.5">
                      <div class="text-[17px] font-semibold text-brand-deep leading-none">
                        ¥{{ formatMoneyNum(packageTotal(pkg)) }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Expanded Detail & Manual Add-ons Management (Only shown when expanded) -->
              <div v-if="expandedIds.has(pkg.id)" class="mt-3.5 pt-3 border-t border-[#F4E8EC] space-y-3">
                <!-- Main Makeup Base Price Summary -->
                <div class="bg-[#FAF5F7] rounded-[16px] px-3.5 py-2.5 flex items-center justify-between gap-2">
                  <div>
                    <div class="text-[12.5px] font-semibold text-ink">主妆容基础价</div>
                    <div class="text-[11px] text-ink-muted mt-0.5">新娘 / 女主男主等主妆容费用</div>
                  </div>
                  <div class="flex items-center gap-2 shrink-0">
                    <span class="text-[14.5px] font-semibold text-ink tabular-nums">¥{{ formatMoneyNum(pkg.price) }}</span>
                    <button
                      type="button"
                      class="px-2.5 h-[26px] rounded-full bg-white text-[11px] font-medium text-[#A46B7D] pressable"
                      @click.stop="openEditSheet(pkg)"
                    >
                      编辑
                    </button>
                  </div>
                </div>

                <!-- Add-on Services List + Pure Manual Input Bar -->
                <div class="bg-[#FAF5F7] rounded-[16px] p-3.5 space-y-2.5">
                  <div class="flex items-center justify-between">
                    <span class="text-[12.5px] font-semibold text-ink">
                      增项服务明细
                      <span class="text-[11px] font-normal text-ink-muted">({{ pkg.addons?.length || 0 }} 项)</span>
                    </span>
                    <span v-if="(pkg.addons?.length || 0) > 0" class="text-[11.5px] font-medium text-[#A46B7D] tabular-nums">
                      增项小计 ¥{{ formatMoneyNum(addonsTotal(pkg)) }}
                    </span>
                  </div>

                  <!-- Existing Add-ons -->
                  <div v-if="(pkg.addons?.length || 0) > 0" class="space-y-2">
                    <div
                      v-for="addon in pkg.addons"
                      :key="addon.id"
                      class="bg-white rounded-[13px] px-3 py-2.5"
                    >
                      <template v-if="editingAddonKey === `${pkg.id}:${addon.id}`">
                        <div class="flex items-center gap-2">
                          <input
                            v-model.trim="editingAddonForm.name"
                            type="text"
                            placeholder="增项昵称"
                            class="flex-1 min-w-0 input-silk px-2.5 h-[34px] text-[13px]"
                          />
                          <div class="input-affix-wrap !h-[34px] w-[96px] shrink-0">
                            <span class="input-affix-unit mr-0.5 text-[12px]">¥</span>
                            <input
                              v-model.number="editingAddonForm.price"
                              type="number"
                              inputmode="decimal"
                              placeholder="0"
                              class="tabular-nums text-[13px]"
                            />
                          </div>
                        </div>
                        <div class="flex items-center justify-end gap-1.5 mt-2">
                          <button
                            type="button"
                            class="px-3 h-[26px] rounded-full bg-[#FAF2F5] text-ink-muted text-[11px]"
                            @click="editingAddonKey = null"
                          >
                            取消
                          </button>
                          <button
                            type="button"
                            class="px-3 h-[26px] rounded-full bg-brand text-white text-[11px] font-medium"
                            @click="confirmEditAddon(pkg, addon.id)"
                          >
                            保存
                          </button>
                        </div>
                      </template>

                      <div v-else class="flex items-center justify-between gap-2">
                        <button
                          type="button"
                          class="flex-1 min-w-0 text-left flex items-center justify-between gap-2 active:opacity-70"
                          @click="startEditAddon(pkg.id, addon)"
                        >
                          <span class="text-[13px] font-medium text-ink truncate">{{ addon.name }}</span>
                          <span class="text-[13.5px] font-semibold text-brand-deep tabular-nums shrink-0">
                            ¥{{ formatMoneyNum(addon.price) }}
                          </span>
                        </button>
                        <button
                          type="button"
                          class="w-6 h-6 rounded-full bg-[#FAF2F5] text-status-danger-text flex items-center justify-center shrink-0 pressable"
                          aria-label="删除增项"
                          @click.stop="removeAddon(pkg, addon.id)"
                        >
                          <Trash2 class="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <p v-else class="text-[11.5px] text-ink-muted py-1">
                    可在下方自由添加新郎、双方父母、伴娘等增项名称与费用
                  </p>

                  <!-- Manual Add-on Input Row (No Preset Tags) -->
                  <div class="flex items-center gap-2 pt-0.5">
                    <input
                      v-model.trim="getAddonDraft(pkg.id).name"
                      type="text"
                      placeholder="输入增项昵称，如新郎/妈妈/伴娘"
                      class="flex-1 min-w-0 input-silk !bg-white px-3 h-[38px] text-[12.5px]"
                      @keyup.enter="addAddonToPackage(pkg)"
                    />
                    <div class="input-affix-wrap !bg-white !h-[38px] w-[86px] shrink-0">
                      <span class="input-affix-unit mr-0.5 text-[12px]">¥</span>
                      <input
                        v-model.number="getAddonDraft(pkg.id).price"
                        type="number"
                        inputmode="decimal"
                        placeholder="费用"
                        class="tabular-nums text-[12.5px]"
                        @keyup.enter="addAddonToPackage(pkg)"
                      />
                    </div>
                    <button
                      type="button"
                      class="h-[38px] px-3.5 rounded-xl bg-brand text-white text-[12.5px] font-medium shrink-0 pressable"
                      @click.stop="addAddonToPackage(pkg)"
                    >
                      添加
                    </button>
                  </div>

                  <!-- Per-Package Total Summary Strip -->
                  <div class="pt-2 border-t border-[#EFE1E7] flex items-center justify-end text-[12.5px] tabular-nums">
                    <span class="font-semibold text-brand-deep">
                      本套餐合计 ¥{{ formatMoneyNum(packageTotal(pkg)) }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Card Footer Strip: Expand/Collapse Toggle + Quick Book -->
              <div class="mt-3 pt-2.5 border-t border-[#F4E8EC] flex items-center justify-between text-[11.5px]">
                <button
                  type="button"
                  class="inline-flex items-center gap-1 text-[#A46B7D] font-medium active:opacity-70"
                  @click.stop="toggleExpand(pkg.id)"
                >
                  <span>
                    {{
                      expandedIds.has(pkg.id)
                        ? '收起详情'
                        : (pkg.addons?.length || 0) > 0
                          ? `展开查看详情 · 含 ${pkg.addons?.length} 项增项`
                          : '展开查看详情与添加增项'
                    }}
                  </span>
                  <ChevronDown
                    class="w-3.5 h-3.5 transition-transform duration-200"
                    :class="expandedIds.has(pkg.id) ? 'rotate-180' : ''"
                  />
                </button>

                <button
                  type="button"
                  class="inline-flex items-center gap-0.5 px-2.5 py-1 rounded-full bg-[#FAF0F3] text-[#A46B7D] font-medium pressable"
                  @click.stop="bookWithPackage(pkg)"
                >
                  <span>用此套餐排单</span>
                  <ChevronRight class="w-3.5 h-3.5" />
                </button>
              </div>
            </article>

            <template #right>
              <div class="flex h-full pl-2 gap-1.5">
                <button
                  type="button"
                  class="h-full px-4 rounded-[18px] bg-white text-brand-deep text-[13px] font-medium"
                  @click.stop="openEditSheet(pkg)"
                >
                  编辑
                </button>
                <button
                  type="button"
                  class="h-full px-4 rounded-[18px] bg-white text-status-danger-text text-[13px] font-medium"
                  @click.stop="deletePackageCard(pkg)"
                >
                  删除
                </button>
              </div>
            </template>
          </van-swipe-cell>
        </div>

        <div v-else-if="!loading" class="card-soft py-6">
          <CuteEmptyState
            variant="packages"
            title="还没有保存的报价套餐"
            description="点击右上角 + 创建可复用套餐卡片，展开后可添加新郎、父母、伴娘等增项"
          />
        </div>
      </div>
    </div>

    <!-- Docked Bottom Quote Bar: Unselected by default; highlights CTA + shows Grand Total once selected -->
    <div v-if="packages.length > 0" class="dock-glass-bar px-4 pt-2.5">
      <div class="flex items-center justify-between gap-3">
        <div class="min-w-0 tabular-nums">
          <template v-if="selectedPackages.length > 0">
            <div class="text-[11px] text-ink-muted">
              已选 {{ selectedPackages.length }} 个套餐
            </div>
            <div class="text-[18px] font-bold text-brand-deep leading-tight mt-0.5">
              合计 ¥{{ formatMoneyNum(selectedGrandTotal) }}
            </div>
          </template>
          <template v-else>
            <div class="text-[12.5px] font-medium text-ink-secondary">未选择套餐</div>
            <div class="text-[11px] text-ink-muted mt-0.5">勾选上方卡片即可生成报价</div>
          </template>
        </div>

        <button
          type="button"
          :disabled="selectedPackages.length === 0"
          class="btn-unified px-6 shrink-0 inline-flex items-center justify-center gap-1.5 leading-none transition-all"
          :class="
            selectedPackages.length > 0
              ? 'btn-rose text-white'
              : 'bg-[#ECE0E5] text-[#AD97A0] cursor-not-allowed shadow-none'
          "
          @click="openQuotePoster"
        >
          <Sparkles class="w-[15px] h-[15px] shrink-0" />
          <span class="leading-none">确认生成报价</span>
        </button>
      </div>
    </div>

    <!-- Clean Add / Edit Package Sheet (Custom Card Name + Main Makeup Price + Duration + Description) -->
    <van-popup
      v-model:show="showEditorSheet"
      position="bottom"
      teleport="body"
      round
      :style="{ maxHeight: 'calc(var(--app-height, 100vh) * 0.82)', backgroundColor: '#FDF8FA' }"
    >
      <div class="p-5 pb-safe-sheet space-y-4">
        <div class="sheet-grabber" />
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-[17px] font-semibold text-ink">
              {{ editingId ? '编辑套餐卡片' : '新增套餐卡片' }}
            </h3>
            <p class="text-[11.5px] text-ink-muted mt-0.5">
              保存后展开卡片即可自由添加新郎、父母、伴娘等增项
            </p>
          </div>
          <button type="button" class="icon-btn-white" @click="showEditorSheet = false">
            <X class="w-4 h-4" />
          </button>
        </div>

        <div class="bg-white rounded-[20px] p-4 space-y-3">
          <div>
            <label class="block text-[11.5px] text-ink-secondary mb-1 font-medium">套餐卡片名称 *</label>
            <input
              v-model.trim="form.name"
              type="text"
              placeholder="如：新娘全天跟妆 / 女主男主精致妆造"
              class="w-full input-silk px-3.5 h-[42px]"
            />
          </div>

          <div class="grid grid-cols-2 gap-2.5">
            <div>
              <label class="block text-[11.5px] text-ink-secondary mb-1 font-medium">主妆容报价</label>
              <div class="input-affix-wrap !h-[42px]">
                <span class="input-affix-unit mr-1">¥</span>
                <input
                  v-model.number="form.price"
                  type="number"
                  inputmode="decimal"
                  placeholder="0"
                  class="tabular-nums font-medium"
                />
              </div>
            </div>
            <div>
              <label class="block text-[11.5px] text-ink-secondary mb-1 font-medium">预计时长（选填）</label>
              <div class="input-affix-wrap !h-[42px]">
                <input
                  v-model.number="form.durationHours"
                  type="number"
                  step="0.5"
                  min="0"
                  inputmode="decimal"
                  placeholder="0"
                  class="tabular-nums"
                />
                <span class="input-affix-unit ml-1">小时</span>
              </div>
            </div>
          </div>

          <div>
            <label class="block text-[11.5px] text-ink-secondary mb-1 font-medium">主妆容说明（选填）</label>
            <textarea
              v-model.trim="form.description"
              rows="2"
              placeholder="如：含新娘早妆+仪式+敬酒共3套造型，免费试妆一次"
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
            {{ saving ? '保存中...' : editingId ? '保存修改' : '确认添加套餐' }}
          </button>
        </div>
      </div>
    </van-popup>

    <!-- Cute Designer Price-List Poster Modal (Only Renders Selected Packages + Grand Total) -->
    <PriceListPosterModal
      v-model:show="showPricePoster"
      :studio-name="auth.user?.studioName || '嘻嘻化妆室'"
      :avatar-url="auth.user?.avatarUrl"
      :bio="auth.user?.bio"
      :phone="auth.user?.phone"
      :packages="selectedPackages"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { showConfirmDialog, showToast } from 'vant';
import { Check, ChevronDown, ChevronLeft, ChevronRight, Copy, Plus, Sparkles, Trash2, X } from 'lucide-vue-next';
import http from '@/api/http';
import { useAuthStore } from '@/stores/auth';
import { useScrollHeader } from '@/composables/useScrollHeader';
import CuteEmptyState from '@/components/CuteEmptyState.vue';
import PriceListPosterModal from '@/components/PriceListPosterModal.vue';
import type { PackageAddon, PackageTemplate } from '@/types';

const router = useRouter();
const auth = useAuthStore();
const { onPaneScroll, headerStyle } = useScrollHeader(44);

const loading = ref(true);
const saving = ref(false);
const packages = ref<PackageTemplate[]>([]);
const showEditorSheet = ref(false);
const showPricePoster = ref(false);
const editingId = ref<string | null>(null);

// Default: ALL unselected; user selects cards to highlight "确认生成报价"
const selectedIds = ref<Set<string>>(new Set());
// Default: ALL collapsed; tap card to expand details & manage add-ons
const expandedIds = ref<Set<string>>(new Set());

// Per-package manual add-on draft state
const addonDrafts = reactive<Record<string, { name: string; price: number | '' }>>({});
const editingAddonKey = ref<string | null>(null);
const editingAddonForm = reactive({ name: '', price: 0 as number | '' });

const form = reactive({
  name: '',
  price: 0,
  durationHours: 6,
  description: '',
});

function getAddonDraft(pkgId: string) {
  if (!addonDrafts[pkgId]) {
    addonDrafts[pkgId] = { name: '', price: '' };
  }
  return addonDrafts[pkgId];
}

function addonsTotal(pkg: PackageTemplate): number {
  return (pkg.addons || []).reduce((sum, a) => sum + (Number(a.price) || 0), 0);
}

function packageTotal(pkg: PackageTemplate): number {
  return (Number(pkg.price) || 0) + addonsTotal(pkg);
}

function formatMoneyNum(val: number): string {
  const n = Number(val) || 0;
  return Number.isInteger(n) ? n.toLocaleString('zh-CN') : n.toFixed(2);
}

function formatDuration(mins: number) {
  const h = mins / 60;
  return Number.isInteger(h) ? `${h}h` : `${h.toFixed(1)}h`;
}

const selectedPackages = computed(() => packages.value.filter((p) => selectedIds.value.has(p.id)));
const allSelected = computed(() => packages.value.length > 0 && selectedPackages.value.length === packages.value.length);
const selectedGrandTotal = computed(() =>
  selectedPackages.value.reduce((sum, pkg) => sum + packageTotal(pkg), 0)
);

function toggleSelect(id: string) {
  const next = new Set(selectedIds.value);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  selectedIds.value = next;
}

function toggleSelectAll() {
  if (allSelected.value) {
    selectedIds.value = new Set();
  } else {
    selectedIds.value = new Set(packages.value.map((p) => p.id));
  }
}

function toggleExpand(id: string) {
  const next = new Set(expandedIds.value);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  expandedIds.value = next;
}

function openQuotePoster() {
  if (selectedPackages.value.length === 0) {
    return showToast('请先勾选要生成报价的套餐');
  }
  showPricePoster.value = true;
}

function openCreateSheet() {
  editingId.value = null;
  form.name = '';
  form.price = 0;
  form.durationHours = 6;
  form.description = '';
  showEditorSheet.value = true;
}

function openEditSheet(pkg: PackageTemplate) {
  editingId.value = pkg.id;
  form.name = pkg.name;
  form.price = pkg.price;
  form.durationHours = pkg.defaultDurationMin ? Number((pkg.defaultDurationMin / 60).toFixed(1)) : 0;
  form.description = pkg.description || '';
  showEditorSheet.value = true;
}

async function fetchPackages() {
  loading.value = true;
  try {
    const { data } = await http.get('/packages');
    packages.value = (data.packages || []).map((p: PackageTemplate) => ({
      ...p,
      addons: Array.isArray(p.addons) ? p.addons : [],
    }));
  } finally {
    loading.value = false;
  }
}

async function savePackage() {
  if (!form.name.trim()) return showToast('请填写套餐卡片名称');
  saving.value = true;
  try {
    const payload = {
      name: form.name.trim(),
      category: 'MAIN' as const,
      price: Math.max(0, Number(form.price) || 0),
      defaultDurationMin: Math.max(0, Math.round((Number(form.durationHours) || 0) * 60)),
      description: form.description || '',
    };
    if (editingId.value) {
      const { data } = await http.put(`/packages/${editingId.value}`, payload);
      const idx = packages.value.findIndex((p) => p.id === editingId.value);
      if (idx !== -1) packages.value[idx] = { ...data.package, addons: data.package.addons || [] };
      showToast('套餐已更新');
    } else {
      const { data } = await http.post('/packages', { ...payload, addons: [] });
      packages.value.unshift({ ...data.package, addons: data.package.addons || [] });
      showToast('套餐已添加');
    }
    showEditorSheet.value = false;
  } finally {
    saving.value = false;
  }
}

async function persistPackageAddons(pkg: PackageTemplate, nextAddons: PackageAddon[], toastMsg?: string) {
  const { data } = await http.put(`/packages/${pkg.id}`, { addons: nextAddons });
  const idx = packages.value.findIndex((p) => p.id === pkg.id);
  if (idx !== -1) {
    packages.value[idx] = { ...data.package, addons: data.package.addons || [] };
  }
  if (toastMsg) showToast(toastMsg);
}

async function addAddonToPackage(pkg: PackageTemplate) {
  const draft = getAddonDraft(pkg.id);
  const name = draft.name.trim();
  const price = Math.max(0, Number(draft.price) || 0);
  if (!name) return showToast('请输入增项昵称');
  const nextAddons: PackageAddon[] = [
    ...(pkg.addons || []),
    { id: `addon-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, name, price },
  ];
  draft.name = '';
  draft.price = '';
  await persistPackageAddons(pkg, nextAddons, '已添加增项');
}

function startEditAddon(pkgId: string, addon: PackageAddon) {
  editingAddonKey.value = `${pkgId}:${addon.id}`;
  editingAddonForm.name = addon.name;
  editingAddonForm.price = addon.price;
}

async function confirmEditAddon(pkg: PackageTemplate, addonId: string) {
  const name = editingAddonForm.name.trim();
  if (!name) return showToast('增项昵称不能为空');
  const price = Math.max(0, Number(editingAddonForm.price) || 0);
  const nextAddons = (pkg.addons || []).map((a) => (a.id === addonId ? { ...a, name, price } : a));
  editingAddonKey.value = null;
  await persistPackageAddons(pkg, nextAddons, '已保存增项修改');
}

async function removeAddon(pkg: PackageTemplate, addonId: string) {
  const nextAddons = (pkg.addons || []).filter((a) => a.id !== addonId);
  if (editingAddonKey.value === `${pkg.id}:${addonId}`) editingAddonKey.value = null;
  await persistPackageAddons(pkg, nextAddons, '已删除增项');
}

async function deleteCurrentPackage() {
  if (!editingId.value) return;
  const target = packages.value.find((p) => p.id === editingId.value);
  if (!target) return;
  await deletePackageCard(target);
}

async function deletePackageCard(pkg: PackageTemplate) {
  try {
    await showConfirmDialog({
      title: '删除套餐',
      message: `确认删除「${pkg.name}」吗？`,
      confirmButtonText: '确认删除',
      confirmButtonColor: '#C67A89',
    });
    await http.delete(`/packages/${pkg.id}`);
    packages.value = packages.value.filter((p) => p.id !== pkg.id);
    if (selectedIds.value.has(pkg.id)) {
      const nextSel = new Set(selectedIds.value);
      nextSel.delete(pkg.id);
      selectedIds.value = nextSel;
    }
    if (editingId.value === pkg.id) showEditorSheet.value = false;
    showToast('已删除');
  } catch {
    // cancelled
  }
}

function bookWithPackage(pkg: PackageTemplate) {
  router.push({ path: '/orders/new', query: { packageId: pkg.id } });
}

async function copySelectedPriceList() {
  if (selectedPackages.value.length === 0) {
    return showToast('请先勾选需要复制报价的套餐');
  }
  const studio = auth.user?.studioName || '嘻嘻化妆室';
  const lines: string[] = [`✨ 【${studio} · 专属妆造报价单】`];

  for (const p of selectedPackages.value) {
    const dur = p.defaultDurationMin ? `（约${formatDuration(p.defaultDurationMin)}）` : '';
    lines.push('', `🌸 ${p.name}${dur}`);
    lines.push(`   主妆容：¥${formatMoneyNum(p.price)}`);
    if (p.description) lines.push(`   包含：${p.description}`);
    if (p.addons && p.addons.length > 0) {
      lines.push('   附带增项：');
      for (const a of p.addons) {
        lines.push(`   · ${a.name}：¥${formatMoneyNum(a.price)}`);
      }
      lines.push(`   本套餐合计：¥${formatMoneyNum(packageTotal(p))}`);
    }
  }

  lines.push('', `💰 报价总计：¥${formatMoneyNum(selectedGrandTotal.value)}`);

  const text = lines.join('\n');
  try {
    await navigator.clipboard.writeText(text);
    showToast('已复制已选套餐报价文案');
  } catch {
    showToast('复制失败，请手动截图');
  }
}

onMounted(fetchPackages);
</script>
