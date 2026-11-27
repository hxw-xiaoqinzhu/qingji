<template>
  <div class="h-full flex flex-col overflow-hidden">
    <!-- Adaptive Top Header: Transparent at rest -> Smoothly fades to UI Pink on scroll -->
    <header class="nav-adaptive px-4 pb-3 flex items-center justify-between" :style="headerStyle">
      <h1 class="text-[22px] font-semibold tracking-tight text-ink">美学工作室</h1>
      <!-- Clean 34x34px Pure White Settings Gear Button -> Navigates to Dedicated Settings Page -->
      <button
        type="button"
        class="ios27-icon-btn"
        aria-label="工作室设置"
        @click="router.push('/profile/settings')"
      >
        <IconSettingsGear :size="17" />
      </button>
    </header>

    <!-- Scrollable Studio Workbench -->
    <div class="scroll-pane no-scrollbar px-4 pt-2 pb-8 space-y-4" @scroll.passive="onPaneScroll">
      <!-- Studio Identity Card (Clean, ONLY displays studioName "嘻嘻化妆室") -->
      <section
        class="card-soft p-5 relative overflow-hidden stagger-item"
        style="background: linear-gradient(145deg, rgba(251,241,244,0.96) 0%, rgba(255,255,255,0.96) 60%, rgba(250,245,241,0.94) 100%)"
      >
        <div class="flex items-center gap-3.5 relative z-10">
          <div class="w-12 h-12 rounded-[18px] btn-rose text-white flex items-center justify-center shrink-0">
            <IconTabStudio :size="24" />
          </div>
          <h2 class="text-[19px] font-semibold text-ink tracking-tight truncate">
            {{ auth.user?.studioName || '嘻嘻化妆室' }}
          </h2>
        </div>
      </section>

      <!-- Group 1: Bespoke Beauty Tools (Unified Pale Blush Squircles — No multi-color rainbow) -->
      <section class="card-soft p-2.5 stagger-item" style="--stagger: 1">
        <div class="px-3 pt-1.5 pb-1 text-[11px] font-semibold text-ink-muted tracking-wider">美妆百宝箱</div>
        <button type="button" class="menu-row" @click="openPackages">
          <div class="flex items-center gap-3">
            <span class="icon-squircle" style="background: #FAF0F3; color: #AD7485">
              <IconLipstick :size="19" />
            </span>
            <div class="text-left">
              <div class="font-medium text-ink">报价套餐与增项库</div>
              <div class="text-[11px] text-ink-muted">排单时一键点选带入价格</div>
            </div>
          </div>
          <ChevronRight class="w-4 h-4 text-ink-muted" />
        </button>

        <button type="button" class="menu-row" @click="openClients">
          <div class="flex items-center gap-3">
            <span class="icon-squircle" style="background: #FAF0F3; color: #AD7485">
              <IconVanityMirror :size="19" />
            </span>
            <div class="text-left">
              <div class="font-medium text-ink">新娘客户肤质档案</div>
              <div class="text-[11px] text-ink-muted">记录干敏肌、发质与历史预约</div>
            </div>
          </div>
          <ChevronRight class="w-4 h-4 text-ink-muted" />
        </button>

        <button type="button" class="menu-row" @click="openChecklistTpl">
          <div class="flex items-center gap-3">
            <span class="icon-squircle" style="background: #FAF0F3; color: #AD7485">
              <IconCosmeticCase :size="19" />
            </span>
            <div class="text-left">
              <div class="font-medium text-ink">化妆箱出妆清单模板</div>
              <div class="text-[11px] text-ink-muted">凌晨出门前逐项打钩防遗漏</div>
            </div>
          </div>
          <ChevronRight class="w-4 h-4 text-ink-muted" />
        </button>

        <button type="button" class="menu-row" @click="openNoticeTpl">
          <div class="flex items-center gap-3">
            <span class="icon-squircle" style="background: #FAF0F3; color: #AD7485">
              <IconLoveNote :size="19" />
            </span>
            <div class="text-left">
              <div class="font-medium text-ink">新娘妆前须知贴士</div>
              <div class="text-[11px] text-ink-muted">自动印制在《预约确认函》底部</div>
            </div>
          </div>
          <ChevronRight class="w-4 h-4 text-ink-muted" />
        </button>
      </section>

      <!-- Group 2: Share & Apple Calendar Sync -->
      <section class="card-soft p-2.5 stagger-item" style="--stagger: 2">
        <div class="px-3 pt-1.5 pb-1 text-[11px] font-semibold text-ink-muted tracking-wider">分享与日历同步</div>
        <button type="button" class="menu-row" @click="copyPublicSchedule">
          <div class="flex items-center gap-3">
            <span class="icon-squircle" style="background: #FAF0F3; color: #AD7485">
              <IconSilkLink :size="19" />
            </span>
            <div class="text-left">
              <div class="font-medium text-ink">复制对外只读档期链接</div>
              <div class="text-[11px] text-ink-muted">严格脱敏，仅向新娘展示可约/已定</div>
            </div>
          </div>
          <ChevronRight class="w-4 h-4 text-ink-muted" />
        </button>

        <button type="button" class="menu-row" @click="previewPublicSchedule">
          <div class="flex items-center gap-3">
            <span class="icon-squircle" style="background: #FAF0F3; color: #AD7485">
              <IconPosterCard :size="19" />
            </span>
            <div class="text-left">
              <div class="font-medium text-ink">预览新娘视角档期页</div>
              <div class="text-[11px] text-ink-muted">查看客户打开链接时的真实效果</div>
            </div>
          </div>
          <ChevronRight class="w-4 h-4 text-ink-muted" />
        </button>

        <button type="button" class="menu-row" @click="copyIcsLink">
          <div class="flex items-center gap-3">
            <span class="icon-squircle" style="background: #FAF0F3; color: #AD7485">
              <IconCalendarSync :size="19" />
            </span>
            <div class="text-left">
              <div class="font-medium text-ink">复制苹果日历订阅 (.ics)</div>
              <div class="text-[11px] text-ink-muted">添加至原生日历，锁屏实时提醒行程</div>
            </div>
          </div>
          <ChevronRight class="w-4 h-4 text-ink-muted" />
        </button>
      </section>

      <!-- Group 3: Account & Security -->
      <section class="card-soft p-2.5 stagger-item" style="--stagger: 3">
        <div class="px-3 pt-1.5 pb-1 text-[11px] font-semibold text-ink-muted tracking-wider">安全与多端同步</div>
        <button type="button" class="menu-row" @click="openSessions">
          <div class="flex items-center gap-3">
            <span class="icon-squircle" style="background: #F6EEF2; color: #7A646D">
              <Smartphone class="w-4 h-4" />
            </span>
            <span class="font-medium text-ink">多端已登录设备管理</span>
          </div>
          <ChevronRight class="w-4 h-4 text-ink-muted" />
        </button>
        <button type="button" class="menu-row" @click="openRecycleBin">
          <div class="flex items-center gap-3">
            <span class="icon-squircle" style="background: #F6EEF2; color: #7A646D">
              <Trash2 class="w-4 h-4" />
            </span>
            <span class="font-medium text-ink">30 天订单回收站</span>
          </div>
          <ChevronRight class="w-4 h-4 text-ink-muted" />
        </button>
      </section>
    </div>

    <!-- Sheet: Packages CRUD (Generous default height + skeleton + cute empty state) -->
    <van-popup v-model:show="showPackagesSheet" position="bottom" teleport="body" round :style="{ minHeight: '56dvh', maxHeight: '85dvh' }">
      <div class="p-5 pb-safe-sheet flex flex-col min-h-[56dvh] max-h-[85dvh]">
        <div class="sheet-grabber shrink-0" />
        <div class="flex items-center justify-between mb-4 shrink-0">
          <h3 class="text-[17px] font-semibold text-ink">报价套餐库</h3>
          <button type="button" class="icon-btn-white" @click="showPackagesSheet = false">
            <X class="w-4 h-4" />
          </button>
        </div>
        <div class="flex-1 overflow-y-auto no-scrollbar space-y-4">
          <Transition name="skeleton-fade" mode="out-in">
            <div v-if="loadingPackages" key="pkg-sk" class="space-y-2.5">
              <div v-for="i in 3" :key="i" class="skeleton-box h-16 w-full rounded-2xl" />
            </div>
            <div v-else-if="packages.length > 0" key="pkg-list" class="space-y-2.5">
              <div v-for="pkg in packages" :key="pkg.id" class="bg-canvas rounded-2xl p-3.5 flex items-center justify-between">
                <div>
                  <div class="text-[14px] font-semibold text-ink">
                    {{ pkg.name }}
                    <span class="text-[11px] px-2 py-0.5 rounded-full bg-white text-brand-deep ml-1 font-medium">
                      {{ pkg.category === 'MAIN' ? '主套餐' : '增项' }}
                    </span>
                  </div>
                  <div class="text-[13px] text-brand-deep font-semibold tabular-nums mt-0.5">¥{{ pkg.price }}</div>
                </div>
                <button type="button" class="icon-btn-white text-status-danger-text" @click="deletePackage(pkg.id)">
                  <Trash2 class="w-4 h-4" />
                </button>
              </div>
            </div>
            <CuteEmptyState
              v-else
              key="pkg-empty"
              variant="packages"
              title="还没有保存的报价套餐"
              description="在下方添加常用妆造套餐或增项，随时翻阅管理"
              compact
            />
          </Transition>

          <div class="bg-[#FAF2F5]/80 border border-[#EFE2E6] rounded-2xl p-3.5 space-y-2.5">
            <div class="text-[12px] font-semibold text-brand-deep">新增套餐 / 增项</div>
            <div class="grid grid-cols-2 gap-2.5">
              <input v-model.trim="newPkg.name" type="text" placeholder="套餐名称" class="w-full input-silk !bg-white px-3.5 h-[40px]" />
              <div class="input-affix-wrap !bg-white !h-[40px]">
                <span class="input-affix-unit mr-1">¥</span>
                <input v-model.number="newPkg.price" type="number" inputmode="decimal" placeholder="价格" class="tabular-nums font-medium" />
              </div>
            </div>
            <div class="flex items-center justify-between">
              <div class="flex gap-2">
                <button
                  type="button"
                  class="px-3 h-8 rounded-full text-[12px] font-medium"
                  :class="newPkg.category === 'MAIN' ? 'bg-brand text-white' : 'bg-white text-ink-secondary'"
                  @click="newPkg.category = 'MAIN'"
                >
                  主套餐
                </button>
                <button
                  type="button"
                  class="px-3 h-8 rounded-full text-[12px] font-medium"
                  :class="newPkg.category === 'EXTRA' ? 'bg-brand text-white' : 'bg-white text-ink-secondary'"
                  @click="newPkg.category = 'EXTRA'"
                >
                  增项
                </button>
              </div>
              <button type="button" class="icon-btn-white" aria-label="添加套餐" @click="addPackage">
                <IconPlusAction :size="18" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </van-popup>

    <!-- Sheet: Clients (Generous default height + skeleton + cute empty state) -->
    <van-popup v-model:show="showClientsSheet" position="bottom" teleport="body" round :style="{ minHeight: '54dvh', maxHeight: '85dvh' }">
      <div class="p-5 pb-safe-sheet flex flex-col min-h-[54dvh] max-h-[85dvh]">
        <div class="sheet-grabber shrink-0" />
        <div class="flex items-center justify-between mb-3 shrink-0">
          <h3 class="text-[17px] font-semibold text-ink">新娘客户档案 ({{ clients.length }})</h3>
          <button type="button" class="icon-btn-white" @click="showClientsSheet = false">
            <X class="w-4 h-4" />
          </button>
        </div>
        <div class="flex-1 overflow-y-auto no-scrollbar">
          <Transition name="skeleton-fade" mode="out-in">
            <div v-if="loadingClients" key="cli-sk" class="space-y-3">
              <div v-for="i in 3" :key="i" class="skeleton-box h-20 w-full rounded-2xl" />
            </div>
            <div v-else-if="clients.length > 0" key="cli-list" class="space-y-3">
              <div v-for="c in clients" :key="c.id" class="bg-canvas rounded-2xl p-4">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2.5">
                    <span class="w-8 h-8 rounded-xl bg-brand-soft text-brand-deep flex items-center justify-center text-[13px] font-semibold">
                      {{ c.name.slice(0, 1) }}
                    </span>
                    <span class="text-[15px] font-semibold text-ink">{{ c.name }}</span>
                  </div>
                  <span class="text-[12px] text-brand-deep font-semibold tabular-nums">
                    {{ c.orderCount }} 单 · {{ ui.formatMoney(c.totalSpent) }}
                  </span>
                </div>
                <div class="text-[12px] text-ink-secondary mt-2 tabular-nums">
                  {{ c.phone || '未留电话' }} {{ c.source ? `· 来自${c.source}` : '' }}
                </div>
                <div v-if="c.skinType || c.allergyNote" class="text-[11px] text-ink-muted mt-1 bg-white px-2.5 py-1.5 rounded-xl">
                  {{ c.skinType }} {{ c.allergyNote ? `｜禁忌：${c.allergyNote}` : '' }}
                </div>
              </div>
            </div>
            <div v-else key="cli-empty" class="h-full flex items-center justify-center py-6">
              <CuteEmptyState
                variant="clients"
                title="还没有新娘客户档案"
                description="完成第一笔排单后，将自动沉淀客户的肤质与历史记录"
              />
            </div>
          </Transition>
        </div>
      </div>
    </van-popup>

    <!-- Sheet: Checklist Template -->
    <van-popup v-model:show="showChecklistSheet" position="bottom" teleport="body" round>
      <div class="p-5 pb-safe-sheet space-y-4">
        <div class="sheet-grabber" />
        <div class="flex items-center justify-between">
          <h3 class="text-[17px] font-semibold text-ink">化妆箱默认清点清单</h3>
          <button type="button" class="icon-btn-white" @click="showChecklistSheet = false">
            <X class="w-4 h-4" />
          </button>
        </div>
        <p class="text-[12px] text-ink-muted">每行一项，每次新建妆造订单时自动生成</p>
        <textarea v-model="checklistText" rows="6" class="w-full input-silk p-3.5" />
        <button type="button" class="btn-unified w-full btn-rose text-white" @click="saveChecklistTpl">
          保存清单模板
        </button>
      </div>
    </van-popup>

    <!-- Sheet: Notice Template -->
    <van-popup v-model:show="showNoticeSheet" position="bottom" teleport="body" round>
      <div class="p-5 pb-safe-sheet space-y-4">
        <div class="sheet-grabber" />
        <div class="flex items-center justify-between">
          <h3 class="text-[17px] font-semibold text-ink">新娘妆前准备贴士模板</h3>
          <button type="button" class="icon-btn-white" @click="showNoticeSheet = false">
            <X class="w-4 h-4" />
          </button>
        </div>
        <p class="text-[12px] text-ink-muted">生成《新娘档期锁定确认函》时将附在底部</p>
        <textarea v-model="noticeText" rows="6" class="w-full input-silk p-3.5" />
        <button type="button" class="btn-unified w-full btn-rose text-white" @click="saveNoticeTpl">
          保存贴士文案
        </button>
      </div>
    </van-popup>

    <!-- Sheet: Multi-device Sessions (Generous default height + skeleton + cute empty state) -->
    <van-popup v-model:show="showSessionsSheet" position="bottom" teleport="body" round :style="{ minHeight: '50dvh', maxHeight: '80dvh' }">
      <div class="p-5 pb-safe-sheet flex flex-col min-h-[50dvh] max-h-[80dvh]">
        <div class="sheet-grabber shrink-0" />
        <div class="flex items-center justify-between mb-1 shrink-0">
          <h3 class="text-[17px] font-semibold text-ink">多端在线设备管理</h3>
          <button type="button" class="icon-btn-white" @click="showSessionsSheet = false">
            <X class="w-4 h-4" />
          </button>
        </div>
        <p class="text-[12px] text-ink-muted mb-3 shrink-0">移除后该设备将自动退出并需重新登录</p>
        <div class="flex-1 overflow-y-auto no-scrollbar">
          <Transition name="skeleton-fade" mode="out-in">
            <div v-if="loadingSessions" key="sess-sk" class="space-y-2.5">
              <div v-for="i in 2" :key="i" class="skeleton-box h-16 w-full rounded-2xl" />
            </div>
            <div v-else-if="sessions.length > 0" key="sess-list" class="space-y-2.5">
              <div v-for="s in sessions" :key="s.id" class="bg-canvas rounded-2xl p-3.5 flex items-center justify-between">
                <div>
                  <div class="text-[14px] font-medium text-ink flex items-center gap-2">
                    <span>{{ s.deviceInfo }}</span>
                    <span v-if="s.isCurrent" class="px-2 py-0.5 rounded-full bg-brand-soft text-brand-deep text-[10px] font-semibold">
                      本机在线
                    </span>
                  </div>
                  <div class="text-[11px] text-ink-muted mt-0.5 tabular-nums">
                    IP: {{ s.ip }} · 活跃于 {{ dayjs(s.lastActiveAt).format('MM-DD HH:mm') }}
                  </div>
                </div>
                <button
                  v-if="!s.isCurrent"
                  type="button"
                  class="icon-btn-white text-status-danger-text"
                  aria-label="移除设备"
                  @click="kickSession(s.id)"
                >
                  <Trash2 class="w-4 h-4" />
                </button>
              </div>
            </div>
            <div v-else key="sess-empty" class="h-full flex items-center justify-center py-6">
              <CuteEmptyState variant="sessions" title="暂无在线设备记录" compact />
            </div>
          </Transition>
        </div>
      </div>
    </van-popup>

    <!-- Sheet: Recycle Bin (Generous default height + skeleton + cute empty state) -->
    <van-popup v-model:show="showRecycleSheet" position="bottom" teleport="body" round :style="{ minHeight: '54dvh', maxHeight: '82dvh' }">
      <div class="p-5 pb-safe-sheet flex flex-col min-h-[54dvh] max-h-[82dvh]">
        <div class="sheet-grabber shrink-0" />
        <div class="flex items-center justify-between mb-3 shrink-0">
          <h3 class="text-[17px] font-semibold text-ink">30 天订单回收站</h3>
          <button type="button" class="icon-btn-white" @click="showRecycleSheet = false">
            <X class="w-4 h-4" />
          </button>
        </div>
        <div class="flex-1 overflow-y-auto no-scrollbar">
          <Transition name="skeleton-fade" mode="out-in">
            <div v-if="loadingRecycle" key="rec-sk" class="space-y-2.5">
              <div v-for="i in 3" :key="i" class="skeleton-box h-16 w-full rounded-2xl" />
            </div>
            <div v-else-if="deletedOrders.length" key="rec-list" class="space-y-2.5">
              <div v-for="o in deletedOrders" :key="o.id" class="bg-canvas rounded-2xl p-3.5 flex items-center justify-between">
                <div>
                  <div class="text-[14px] font-medium text-ink">{{ o.clientName }} · {{ o.serviceType }}</div>
                  <div class="text-[11px] text-ink-muted tabular-nums">{{ o.serviceDate }} · ¥{{ o.totalAmount }}</div>
                </div>
                <div class="flex gap-2">
                  <button
                    type="button"
                    class="icon-btn-white text-status-locked-text"
                    aria-label="恢复订单"
                    @click="restoreOrder(o.id)"
                  >
                    <RotateCcw class="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    class="icon-btn-white text-status-danger-text"
                    aria-label="彻底删除"
                    @click="permanentDelete(o.id)"
                  >
                    <Trash2 class="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
            <div v-else key="rec-empty" class="h-full flex items-center justify-center py-6">
              <CuteEmptyState
                variant="recycle"
                title="回收站干干净净"
                description="误删的行程会在这里安静保留 30 天，随时可以一键恢复"
              />
            </div>
          </Transition>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import dayjs from 'dayjs';
import { showToast } from 'vant';
import { Smartphone, Trash2, ChevronRight, RotateCcw, X } from 'lucide-vue-next';
import http, { API_BASE_URL } from '@/api/http';
import { isFirebaseMode } from '@/lib/firebase';
import { buildAllOrdersIcs } from '@/api/firebaseBackend';
import { useAuthStore } from '@/stores/auth';
import { useUiStore } from '@/stores/ui';
import { useScrollHeader } from '@/composables/useScrollHeader';
import {
  IconCalendarSync,
  IconCosmeticCase,
  IconLipstick,
  IconLoveNote,
  IconPlusAction,
  IconPosterCard,
  IconSettingsGear,
  IconSilkLink,
  IconTabStudio,
  IconVanityMirror,
} from '@/components/icons/BeautyIcons';
import CuteEmptyState from '@/components/CuteEmptyState.vue';
import type { ClientItem, Order, PackageTemplate, UserSession } from '@/types';

const router = useRouter();
const auth = useAuthStore();
const ui = useUiStore();
const { onPaneScroll, headerStyle } = useScrollHeader(44);

const showPackagesSheet = ref(false);
const loadingPackages = ref(false);
const packages = ref<PackageTemplate[]>([]);
const newPkg = reactive({ name: '', price: 0, category: 'MAIN' as 'MAIN' | 'EXTRA' });

const showClientsSheet = ref(false);
const loadingClients = ref(false);
const clients = ref<ClientItem[]>([]);

const showChecklistSheet = ref(false);
const checklistText = ref('');

const showNoticeSheet = ref(false);
const noticeText = ref('');

const showSessionsSheet = ref(false);
const loadingSessions = ref(false);
const sessions = ref<UserSession[]>([]);

const showRecycleSheet = ref(false);
const loadingRecycle = ref(false);
const deletedOrders = ref<Order[]>([]);

async function openPackages() {
  showPackagesSheet.value = true;
  loadingPackages.value = true;
  try {
    const { data } = await http.get('/packages');
    packages.value = data.packages || [];
  } finally {
    loadingPackages.value = false;
  }
}

async function addPackage() {
  if (!newPkg.name) return showToast('请填写套餐名称');
  const { data } = await http.post('/packages', newPkg);
  packages.value.push(data.package);
  newPkg.name = '';
  newPkg.price = 0;
  showToast('套餐已添加');
}

async function deletePackage(id: string) {
  await http.delete(`/packages/${id}`);
  packages.value = packages.value.filter((p) => p.id !== id);
  showToast('已删除');
}

async function openClients() {
  showClientsSheet.value = true;
  loadingClients.value = true;
  try {
    const { data } = await http.get('/clients');
    clients.value = data.clients || [];
  } finally {
    loadingClients.value = false;
  }
}

function openChecklistTpl() {
  checklistText.value = (auth.user?.checklistTemplate || []).join('\n');
  showChecklistSheet.value = true;
}

async function saveChecklistTpl() {
  const list = checklistText.value
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean);
  await auth.updateProfile({ checklistTemplate: list });
  showChecklistSheet.value = false;
  showToast('清单模板已保存');
}

function openNoticeTpl() {
  noticeText.value = auth.user?.noticeTemplate || '';
  showNoticeSheet.value = true;
}

async function saveNoticeTpl() {
  await auth.updateProfile({ noticeTemplate: noticeText.value });
  showNoticeSheet.value = false;
  showToast('妆前贴士已保存');
}

async function copyPublicSchedule() {
  const url = `${window.location.origin}/s/${auth.user?.shareToken}`;
  try {
    await navigator.clipboard.writeText(url);
    showToast('已复制脱敏档期链接');
  } catch {
    showToast(url);
  }
}

function previewPublicSchedule() {
  if (auth.user?.shareToken) {
    router.push(`/s/${auth.user.shareToken}`);
  }
}

async function copyIcsLink() {
  if (isFirebaseMode) {
    try {
      const ics = await buildAllOrdersIcs();
      const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `晴记档期-${auth.user?.studioName || '嘻嘻化妆室'}.ics`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('已导出日历文件，可直接导入 iPhone 日历');
    } catch {
      showToast('导出日历失败');
    }
    return;
  }
  const base = API_BASE_URL.startsWith('http') ? API_BASE_URL : `${window.location.origin}${API_BASE_URL}`;
  const url = `${base}/public/calendar/${auth.user?.shareToken}.ics`;
  try {
    await navigator.clipboard.writeText(url);
    showToast('已复制 iPhone 日历订阅链接');
  } catch {
    showToast(url);
  }
}

async function openSessions() {
  showSessionsSheet.value = true;
  loadingSessions.value = true;
  try {
    const { data } = await http.get('/auth/sessions');
    sessions.value = data.sessions || [];
  } finally {
    loadingSessions.value = false;
  }
}

async function kickSession(id: string) {
  await http.delete(`/auth/sessions/${id}`);
  sessions.value = sessions.value.filter((s) => s.id !== id);
  showToast('已移除该设备');
}

async function openRecycleBin() {
  showRecycleSheet.value = true;
  loadingRecycle.value = true;
  try {
    const { data } = await http.get('/orders', { params: { deleted: 'true' } });
    deletedOrders.value = data.orders || [];
  } finally {
    loadingRecycle.value = false;
  }
}

async function restoreOrder(id: string) {
  await http.post(`/orders/${id}/restore`);
  deletedOrders.value = deletedOrders.value.filter((o) => o.id !== id);
  showToast('行程已恢复');
}

async function permanentDelete(id: string) {
  await http.delete(`/orders/${id}?permanent=true`);
  deletedOrders.value = deletedOrders.value.filter((o) => o.id !== id);
  showToast('已彻底删除');
}
</script>

<style scoped>
.menu-row {
  @apply w-full px-2.5 py-3 rounded-[16px] flex items-center justify-between text-[14px] text-ink active:bg-brand-soft/45 transition-colors;
}
.icon-squircle {
  @apply w-9 h-9 rounded-[13px] flex items-center justify-center shrink-0;
}
</style>
