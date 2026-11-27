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
      <h1 class="text-[17px] font-semibold text-ink">{{ isEdit ? '编辑妆造行程' : '快速排单' }}</h1>
      <div class="w-[34px]" />
    </header>

    <!-- Scrollable Form Body -->
    <div class="scroll-pane no-scrollbar px-4 pt-2 pb-6" @scroll.passive="onPaneScroll">
      <div class="relative">
        <Transition name="skeleton-dissolve">
          <div v-if="loadingOrder" class="absolute inset-0 z-20 space-y-4 pointer-events-none">
            <div class="card-soft p-4 space-y-4">
              <div class="skeleton-box h-4 w-28 rounded-lg" />
              <div class="grid grid-cols-2 gap-3">
                <div class="space-y-1.5">
                  <div class="skeleton-box h-3 w-16 rounded-full" />
                  <div class="skeleton-box h-[42px] w-full rounded-[11px]" />
                </div>
                <div class="space-y-1.5">
                  <div class="skeleton-box h-3 w-16 rounded-full" />
                  <div class="skeleton-box h-[42px] w-full rounded-[11px]" />
                </div>
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div class="space-y-1.5">
                  <div class="skeleton-box h-3 w-16 rounded-full" />
                  <div class="skeleton-box h-[42px] w-full rounded-[11px]" />
                </div>
                <div class="space-y-1.5">
                  <div class="skeleton-box h-3 w-16 rounded-full" />
                  <div class="skeleton-box h-[42px] w-full rounded-[11px]" />
                </div>
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div class="space-y-1.5">
                  <div class="skeleton-box h-3 w-20 rounded-full" />
                  <div class="skeleton-box h-[42px] w-full rounded-[11px]" />
                </div>
                <div class="space-y-1.5">
                  <div class="skeleton-box h-3 w-16 rounded-full" />
                  <div class="skeleton-box h-[42px] w-full rounded-[11px]" />
                </div>
              </div>
              <div class="space-y-1.5">
                <div class="skeleton-box h-3 w-16 rounded-full" />
                <div class="skeleton-box h-[42px] w-full rounded-[11px]" />
              </div>
              <div class="space-y-1.5">
                <div class="skeleton-box h-3 w-24 rounded-full" />
                <div class="skeleton-box h-[42px] w-full rounded-[11px]" />
              </div>
              <div class="skeleton-box h-[68px] w-full rounded-[18px]" />
            </div>
          </div>
        </Transition>

        <div class="space-y-4" :class="loadingOrder ? 'opacity-0' : 'opacity-100 transition-opacity duration-200'">
      <!-- Smart WeChat Chat Snippet Parser -->
      <section
        v-if="!isEdit"
        class="card-soft overflow-hidden"
        style="background: linear-gradient(135deg, rgba(254,240,245,0.95) 0%, rgba(255,255,255,0.96) 100%)"
      >
        <button
          type="button"
          class="w-full px-4 py-3.5 flex items-center justify-between text-left"
          @click="showWechatParser = !showWechatParser"
        >
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-xl btn-rose flex items-center justify-center text-white shrink-0">
              <IconMagicWand :size="17" />
            </div>
            <div>
              <div class="text-[14px] font-semibold text-ink">粘贴微信聊天记录 · 智能填单</div>
              <div class="text-[11px] text-ink-muted">自动提取日期、时间、酒店、新娘姓名与电话</div>
            </div>
          </div>
          <ChevronDown
            class="w-4 h-4 text-brand transition-transform duration-200 shrink-0"
            :class="showWechatParser ? 'rotate-180' : ''"
          />
        </button>

        <div v-if="showWechatParser" class="px-4 pb-4 space-y-2.5 stagger-item">
          <textarea
            v-model="wechatText"
            rows="3"
            placeholder="粘贴微信预约消息，如：11月30日早上5点半 柏悦酒店1808 新娘沈清梨 13988776655 全天跟妆"
            class="w-full input-silk !bg-white p-3.5"
          />
          <div class="flex items-center gap-2">
            <button
              type="button"
              class="btn-unified btn-glass text-[12px]"
              @click="fillSampleWechat"
            >
              填入示例试试
            </button>
            <button
              type="button"
              class="btn-unified flex-1 btn-rose text-white text-[13px]"
              @click="applyWechatParse"
            >
              智能识别并填入
            </button>
          </div>
        </div>
      </section>

      <!-- Core Required Section -->
      <section class="card-soft p-4 space-y-4">
        <div class="flex items-center gap-1.5 text-[13px] font-semibold text-brand-deep">
          <IconTabItinerary :size="16" class="text-brand" />
          <span>核心预约信息</span>
        </div>

        <!-- iOS-Safe Custom Date Overlay Inputs -->
        <div class="grid grid-cols-2 gap-3">
          <div class="min-w-0">
            <label class="block text-[12px] text-ink-secondary mb-1.5 font-medium">服务日期 *</label>
            <label class="relative flex items-center justify-between input-silk px-3.5 h-[42px] cursor-pointer">
              <span class="text-[14px] font-medium text-ink tabular-nums truncate">
                {{ formatDisplayDate(form.serviceDate) }}
              </span>
              <IconTabCalendar :size="15" class="text-brand shrink-0 ml-1" />
              <input
                v-model="form.serviceDate"
                type="date"
                class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </label>
          </div>

          <div class="min-w-0">
            <label class="block text-[12px] text-ink-secondary mb-1.5 font-medium">跨天结束日</label>
            <label class="relative flex items-center justify-between input-silk px-3.5 h-[42px] cursor-pointer">
              <span
                class="text-[14px] tabular-nums truncate"
                :class="form.endDate ? 'font-medium text-ink' : 'text-ink-muted'"
              >
                {{ form.endDate ? formatDisplayDate(form.endDate) : '单日不跨天' }}
              </span>
              <button
                v-if="form.endDate"
                type="button"
                class="relative z-10 text-ink-muted p-0.5"
                @click.prevent="form.endDate = ''"
              >
                <X class="w-3.5 h-3.5" />
              </button>
              <IconTabCalendar v-else :size="14" class="text-ink-muted/70 shrink-0 ml-1" />
              <input
                v-model="form.endDate"
                type="date"
                class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </label>
          </div>
        </div>

        <!-- iOS-Safe Custom Time Overlay Inputs -->
        <div class="grid grid-cols-2 gap-3">
          <div class="min-w-0">
            <label class="block text-[12px] text-ink-secondary mb-1.5 font-medium">开始时间</label>
            <label class="relative flex items-center justify-between input-silk px-3.5 h-[42px] cursor-pointer">
              <span class="text-[14.5px] font-semibold text-ink tabular-nums">{{ form.startTime }}</span>
              <ChevronDown class="w-3.5 h-3.5 text-ink-muted shrink-0" />
              <input
                v-model="form.startTime"
                type="time"
                class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </label>
          </div>

          <div class="min-w-0">
            <label class="block text-[12px] text-ink-secondary mb-1.5 font-medium">预计结束</label>
            <label class="relative flex items-center justify-between input-silk px-3.5 h-[42px] cursor-pointer">
              <span class="text-[14.5px] font-semibold text-ink tabular-nums">{{ form.endTime }}</span>
              <ChevronDown class="w-3.5 h-3.5 text-ink-muted shrink-0" />
              <input
                v-model="form.endTime"
                type="time"
                class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </label>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div class="min-w-0">
            <label class="block text-[12px] text-ink-secondary mb-1.5 font-medium">新娘/客户姓名 *</label>
            <input
              v-model.trim="form.clientName"
              type="text"
              placeholder="如：林知夏"
              class="w-full input-silk px-3.5 h-[42px]"
            />
          </div>
          <div class="min-w-0">
            <label class="block text-[12px] text-ink-secondary mb-1.5 font-medium">联系电话</label>
            <input
              v-model.trim="form.clientPhone"
              type="tel"
              placeholder="选填"
              class="w-full input-silk px-3.5 h-[42px] tabular-nums"
            />
          </div>
        </div>

        <!-- Manual Makeup Style Input + Optional Clean Picker from Package Library -->
        <div>
          <div class="flex items-center justify-between mb-1.5">
            <label class="text-[12px] text-ink-secondary font-medium">妆型名称</label>
            <button
              v-if="mainPackages.length > 0"
              type="button"
              class="text-[11.5px] font-medium text-[#A46B7D] pressable"
              @click="showPackagePicker = true"
            >
              从报价套餐库选 &rsaquo;
            </button>
          </div>
          <input
            v-model.trim="form.serviceType"
            type="text"
            placeholder="请输入妆型名称，如：新娘全天跟妆"
            class="w-full input-silk px-3.5 h-[42px]"
          />
        </div>

        <div>
          <label class="block text-[12px] text-ink-secondary mb-1.5 font-medium">出妆酒店 / 详细地址</label>
          <input
            v-model.trim="form.location"
            type="text"
            placeholder="如：柏悦酒店 28层 湖景套房"
            class="w-full input-silk px-3.5 h-[42px]"
          />
        </div>

        <div class="grid grid-cols-2 gap-3 pt-0.5">
          <div class="min-w-0">
            <label class="block text-[12px] text-ink-secondary mb-1.5 font-medium">套餐基础价</label>
            <div class="input-affix-wrap">
              <span class="input-affix-unit mr-1.5">¥</span>
              <input
                v-model.number="form.basePrice"
                type="number"
                inputmode="decimal"
                placeholder="0"
                class="font-semibold tabular-nums"
              />
            </div>
          </div>
          <div class="min-w-0">
            <label class="block text-[12px] text-ink-secondary mb-1.5 font-medium">已收定金</label>
            <div class="input-affix-wrap">
              <span class="input-affix-unit mr-1.5">¥</span>
              <input
                v-model.number="form.depositPaid"
                type="number"
                inputmode="decimal"
                placeholder="0"
                class="text-status-locked-text font-semibold tabular-nums"
              />
            </div>
          </div>
        </div>

        <div
          class="rounded-[18px] p-3.5 flex items-center justify-between tabular-nums"
          style="background: linear-gradient(135deg, #FDEEF3 0%, #FDF4EB 100%)"
        >
          <div>
            <span class="text-[11px] text-ink-secondary block">订单总额</span>
            <span class="text-[17px] font-semibold text-ink">¥{{ computedTotal }}</span>
          </div>
          <div class="text-right">
            <span class="text-[11px] text-ink-secondary block">待收尾款</span>
            <span class="text-[17px] font-semibold text-brand-deep">¥{{ computedBalance }}</span>
          </div>
        </div>
      </section>

      <!-- Progressive Disclosure: Professional Details -->
      <section class="card-soft overflow-hidden">
        <button
          type="button"
          class="w-full px-4 py-4 flex items-center justify-between text-left"
          @click="showAdvanced = !showAdvanced"
        >
          <div>
            <div class="text-[14px] font-semibold text-ink">展开更多专业细节</div>
            <div class="text-[11px] text-ink-muted mt-0.5">妈妈妆增项、车程倒推、助理费、肤质禁忌与参考图</div>
          </div>
          <ChevronDown
            class="w-4 h-4 text-brand shrink-0 ml-2 transition-transform duration-200"
            :class="showAdvanced ? 'rotate-180' : ''"
          />
        </button>

        <div v-if="showAdvanced" class="px-4 pb-5 space-y-4 stagger-item">
          <div>
            <div class="flex items-center justify-between mb-2">
              <label class="text-[12px] text-ink-secondary font-medium">增项明细（妈妈妆 / 伴娘妆 / 早起费）</label>
              <button type="button" class="text-[12px] text-brand font-medium pressable" @click="addExtraItem()">
                + 自定义增项
              </button>
            </div>
            <div v-if="extraPackages.length" class="flex flex-wrap gap-1.5 mb-2.5">
              <button
                v-for="ep in extraPackages"
                :key="ep.id"
                type="button"
                class="pressable px-3 py-1 rounded-full bg-brand-soft text-[11px] text-brand-deep font-medium tabular-nums"
                @click="addExtraItem(ep.name, ep.price)"
              >
                + {{ ep.name }} ¥{{ ep.price }}
              </button>
            </div>
            <div v-for="(item, idx) in form.extraItems" :key="idx" class="flex items-center gap-2 mb-2">
              <input v-model.trim="item.name" type="text" placeholder="增项名称" class="flex-1 input-silk px-3 h-[38px]" />
              <div class="input-affix-wrap !h-[38px] !px-2.5 w-24">
                <span class="input-affix-unit mr-1">¥</span>
                <input v-model.number="item.unitPrice" type="number" inputmode="decimal" placeholder="0" class="tabular-nums" />
              </div>
              <div class="input-affix-wrap !h-[38px] !px-2 w-16">
                <span class="input-affix-unit mr-0.5">×</span>
                <input v-model.number="item.quantity" type="number" min="1" class="tabular-nums text-center" />
              </div>
              <button
                type="button"
                class="w-8 h-8 rounded-full bg-status-danger-bg text-status-danger-text flex items-center justify-center shrink-0"
                @click="form.extraItems.splice(idx, 1)"
              >
                <X class="w-4 h-4" />
              </button>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div class="min-w-0">
              <label class="block text-[12px] text-ink-secondary mb-1.5 font-medium">优惠减免</label>
              <div class="input-affix-wrap">
                <span class="input-affix-unit mr-1.5">¥</span>
                <input v-model.number="form.discount" type="number" inputmode="decimal" placeholder="0" class="tabular-nums" />
              </div>
            </div>
            <div class="min-w-0">
              <label class="block text-[12px] text-ink-secondary mb-1.5 font-medium">单程车程</label>
              <div class="input-affix-wrap">
                <input v-model.number="form.commuteMinutes" type="number" placeholder="0" class="tabular-nums" />
                <span class="input-affix-unit ml-1.5">分钟</span>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-3 gap-2.5">
            <div class="min-w-0">
              <label class="block text-[12px] text-ink-secondary mb-1.5 font-medium">助理姓名</label>
              <input v-model.trim="form.assistantName" type="text" placeholder="选填" class="w-full input-silk px-3 h-[42px]" />
            </div>
            <div class="min-w-0">
              <label class="block text-[12px] text-ink-secondary mb-1.5 font-medium">助理费</label>
              <div class="input-affix-wrap !px-2.5">
                <span class="input-affix-unit mr-1">¥</span>
                <input v-model.number="form.assistantFee" type="number" inputmode="decimal" placeholder="0" class="tabular-nums" />
              </div>
            </div>
            <div class="min-w-0">
              <label class="block text-[12px] text-ink-secondary mb-1.5 font-medium">渠道返点</label>
              <div class="input-affix-wrap !px-2.5">
                <span class="input-affix-unit mr-1">¥</span>
                <input v-model.number="form.channelCommission" type="number" inputmode="decimal" placeholder="0" class="tabular-nums" />
              </div>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div class="min-w-0">
              <label class="block text-[12px] text-ink-secondary mb-1.5 font-medium">肤质记录</label>
              <input v-model.trim="form.skinType" type="text" placeholder="混干皮/T区油" class="w-full input-silk px-3.5 h-[42px]" />
            </div>
            <div class="min-w-0">
              <label class="block text-[12px] text-ink-secondary mb-1.5 font-medium">敏感/禁忌</label>
              <input v-model.trim="form.allergyNote" type="text" placeholder="酒精敏感等" class="w-full input-silk px-3.5 h-[42px]" />
            </div>
          </div>

          <div>
            <label class="block text-[12px] text-ink-secondary mb-1.5 font-medium">妆造灵感与礼服备注</label>
            <textarea
              v-model.trim="form.notes"
              rows="3"
              placeholder="记录主纱款式、敬酒服颜色、头饰搭配灵感..."
              class="w-full input-silk p-3.5"
            />
          </div>

          <div>
            <label class="block text-[12px] text-ink-secondary mb-2 font-medium">
              试妆 / 礼服参考图（{{ form.referenceImages.length }}/9，自动轻压缩）
            </label>
            <div class="grid grid-cols-3 gap-2.5">
              <div
                v-for="(img, idx) in form.referenceImages"
                :key="img"
                class="relative aspect-square rounded-2xl overflow-hidden bg-brand-soft"
              >
                <img :src="img" alt="参考图" class="w-full h-full object-cover" />
                <button
                  type="button"
                  class="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/50 text-white flex items-center justify-center"
                  @click="form.referenceImages.splice(idx, 1)"
                >
                  <X class="w-3.5 h-3.5" />
                </button>
              </div>

              <label
                v-if="form.referenceImages.length < 9"
                class="aspect-square rounded-2xl bg-[#FCFAFB] border border-dashed border-[#E5CED6] flex flex-col items-center justify-center text-brand cursor-pointer pressable"
              >
                <ImagePlus class="w-6 h-6 mb-1" />
                <span class="text-[11px] font-medium">{{ uploading ? '压缩上传中...' : '上传美图' }}</span>
                <input type="file" accept="image/*" class="hidden" :disabled="uploading" @change="onFileSelect" />
              </label>
            </div>
          </div>
        </div>
      </section>
        </div>
      </div>
    </div>

    <!-- Docked Bottom Save Bar -->
    <div class="dock-glass-bar px-4 pt-2.5">
      <button
        type="button"
        :disabled="saving"
        class="btn-unified w-full btn-rose text-white disabled:opacity-60"
        @click="submitOrder(false)"
      >
        {{ saving ? '正在保存...' : isEdit ? '保存行程修改' : '确认锁定档期' }}
      </button>
    </div>

    <!-- Clean Bottom Picker Sheet for Saved Main Packages -->
    <van-popup v-model:show="showPackagePicker" position="bottom" teleport="body" round :style="{ maxHeight: 'calc(var(--app-height, 100vh) * 0.72)' }">
      <div class="p-5 pb-safe-sheet flex flex-col" style="max-height: calc(var(--app-height, 100vh) * 0.72)">
        <div class="sheet-grabber shrink-0" />
        <div class="flex items-center justify-between mb-3 shrink-0">
          <div>
            <h3 class="text-[17px] font-semibold text-ink">从报价套餐库选择</h3>
            <p class="text-[11px] text-ink-muted mt-0.5">点选后自动带入妆型名称、基础价与参考时长</p>
          </div>
          <button type="button" class="icon-btn-white" @click="showPackagePicker = false">
            <X class="w-4 h-4" />
          </button>
        </div>
        <div class="flex-1 overflow-y-auto no-scrollbar space-y-2.5">
          <button
            v-for="pkg in mainPackages"
            :key="pkg.id"
            type="button"
            class="w-full text-left bg-canvas rounded-2xl p-3.5 flex items-center justify-between gap-3 pressable"
            @click="applyPackageFromLibrary(pkg)"
          >
            <div class="min-w-0 flex-1">
              <div class="text-[14.5px] font-semibold text-ink truncate">{{ pkg.name }}</div>
              <p v-if="pkg.description" class="text-[11.5px] text-ink-muted mt-0.5 line-clamp-2">{{ pkg.description }}</p>
            </div>
            <div class="text-right shrink-0 tabular-nums">
              <div class="text-[15px] font-semibold text-brand-deep">¥{{ pkg.price }}</div>
              <div v-if="pkg.defaultDurationMin > 0" class="text-[10.5px] text-ink-muted mt-0.5">
                约 {{ Number.isInteger(pkg.defaultDurationMin / 60) ? pkg.defaultDurationMin / 60 : (pkg.defaultDurationMin / 60).toFixed(1) }}h
              </div>
            </div>
          </button>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import dayjs from 'dayjs';
import Compressor from 'compressorjs';
import { showConfirmDialog, showToast } from 'vant';
import { ChevronLeft, ChevronDown, X, ImagePlus } from 'lucide-vue-next';
import http from '@/api/http';
import { useScrollHeader } from '@/composables/useScrollHeader';
import { parseWechatBookingText } from '@/utils/wechatParser';
import { IconMagicWand, IconTabCalendar, IconTabItinerary } from '@/components/icons/BeautyIcons';
import type { OrderExtraItem, PackageTemplate } from '@/types';

const route = useRoute();
const router = useRouter();
const { onPaneScroll, headerStyle } = useScrollHeader(44);

const isEdit = computed(() => Boolean(route.params.id));
const loadingOrder = ref(Boolean(route.params.id));
const showWechatParser = ref(false);
const showPackagePicker = ref(false);
const showAdvanced = ref(false);
const wechatText = ref('');
const saving = ref(false);
const uploading = ref(false);
const packages = ref<PackageTemplate[]>([]);

const form = reactive({
  serviceDate: (route.query.date as string) || dayjs().format('YYYY-MM-DD'),
  endDate: '',
  startTime: '05:30',
  endTime: '13:30',
  clientName: '',
  clientPhone: '',
  serviceType: '新娘全天跟妆',
  location: '',
  basePrice: 3280,
  depositPaid: 0,
  discount: 0,
  commuteMinutes: 45,
  assistantName: '',
  assistantFee: 0,
  channelCommission: 0,
  skinType: '',
  allergyNote: '',
  notes: '',
  extraItems: [] as OrderExtraItem[],
  referenceImages: [] as string[],
});

function formatDisplayDate(d: string) {
  if (!d) return '';
  return dayjs(d).format('YYYY.MM.DD');
}

const mainPackages = computed(() => packages.value.filter((p) => p.category === 'MAIN'));
const extraPackages = computed(() => packages.value.filter((p) => p.category === 'EXTRA'));

function applyPackageFromLibrary(pkg: PackageTemplate) {
  form.serviceType = pkg.name;
  form.basePrice = pkg.price;
  if (pkg.defaultDurationMin > 0 && form.startTime) {
    const [h, m] = form.startTime.split(':').map(Number);
    const totalMin = Math.min(23 * 60 + 59, (h || 0) * 60 + (m || 0) + pkg.defaultDurationMin);
    form.endTime = `${String(Math.floor(totalMin / 60)).padStart(2, '0')}:${String(totalMin % 60).padStart(2, '0')}`;
  }
  showPackagePicker.value = false;
  showToast(`已带入「${pkg.name}」`);
}

const extraTotal = computed(() =>
  form.extraItems.reduce((sum, i) => sum + (Number(i.unitPrice) || 0) * (Number(i.quantity) || 1), 0)
);
const computedTotal = computed(() =>
  Math.max(0, (Number(form.basePrice) || 0) + extraTotal.value - (Number(form.discount) || 0))
);
const computedBalance = computed(() => Math.max(0, computedTotal.value - (Number(form.depositPaid) || 0)));

onMounted(async () => {
  try {
    const { data } = await http.get('/packages');
    packages.value = data.packages || [];
    const presetPkgId = route.query.packageId as string | undefined;
    if (!isEdit.value && presetPkgId) {
      const target = packages.value.find((p) => p.id === presetPkgId);
      if (target) applyPackageFromLibrary(target);
    }
  } catch {
    // ignore
  }

  if (isEdit.value) {
    try {
      const { data } = await http.get(`/orders/${route.params.id}`);
      const o = data.order;
      form.serviceDate = o.serviceDate;
      form.endDate = o.endDate || '';
      form.startTime = o.startTime;
      form.endTime = o.endTime;
      form.clientName = o.clientName;
      form.clientPhone = o.clientPhone || '';
      form.serviceType = o.serviceType;
      form.location = o.location || '';
      form.basePrice = o.basePrice;
      form.depositPaid = o.depositPaid;
      form.discount = o.discount;
      form.commuteMinutes = o.commuteMinutes;
      form.assistantName = o.assistantName || '';
      form.assistantFee = o.assistantFee;
      form.channelCommission = o.channelCommission;
      form.skinType = o.skinType || '';
      form.allergyNote = o.allergyNote || '';
      form.notes = o.notes || '';
      form.extraItems = o.extraItems || [];
      form.referenceImages = o.referenceImages || [];
      if (form.extraItems.length || form.notes || form.referenceImages.length) {
        showAdvanced.value = true;
      }
    } catch {
      showToast('加载订单失败');
    } finally {
      loadingOrder.value = false;
    }
  }
});

function addExtraItem(name = '', unitPrice = 0) {
  form.extraItems.push({ name, unitPrice, quantity: 1, subtotal: unitPrice });
}

function fillSampleWechat() {
  wechatText.value = '12月06日早上5点半 杭州君悦酒店1906 新娘沈清梨 13988776655 全天跟妆';
}

function applyWechatParse() {
  if (!wechatText.value.trim()) {
    showToast('请先粘贴聊天记录');
    return;
  }
  const parsed = parseWechatBookingText(wechatText.value);
  if (parsed.serviceDate) form.serviceDate = parsed.serviceDate;
  if (parsed.startTime) form.startTime = parsed.startTime;
  if (parsed.clientName) form.clientName = parsed.clientName;
  if (parsed.clientPhone) form.clientPhone = parsed.clientPhone;
  if (parsed.location) form.location = parsed.location;
  if (parsed.serviceType) form.serviceType = parsed.serviceType;
  showWechatParser.value = false;
  showToast('已自动识别并填入');
}

function onFileSelect(e: Event) {
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;
  uploading.value = true;

  new Compressor(file, {
    quality: 0.72,
    maxWidth: 1280,
    maxHeight: 1280,
    async success(result) {
      try {
        const fd = new FormData();
        fd.append('file', result, file.name);
        const { data } = await http.post('/upload', fd);
        form.referenceImages.push(data.url);
      } catch {
        showToast('图片上传失败');
      } finally {
        uploading.value = false;
        input.value = '';
      }
    },
    error() {
      uploading.value = false;
      showToast('图片压缩失败');
    },
  });
}

async function submitOrder(force = false) {
  if (!form.clientName || !form.serviceDate) {
    showToast('请填写新娘姓名和服务日期');
    return;
  }
  saving.value = true;
  try {
    const payload = {
      ...form,
      endDate: form.endDate || null,
      force,
    };
    if (isEdit.value) {
      await http.put(`/orders/${route.params.id}`, payload);
      showToast('修改已保存');
      router.replace(`/orders/${route.params.id}`);
    } else {
      const { data } = await http.post('/orders', payload);
      showToast('档期已锁定');
      router.replace(`/orders/${data.order.id}`);
    }
  } catch (err: any) {
    if (err?.response?.status === 409 && err?.response?.data?.code === 'SCHEDULE_CONFLICT') {
      const conflicts = err.response.data.conflicts || [];
      const summary = conflicts
        .map((c: any) => `${c.startTime}-${c.endTime} ${c.clientName}（${c.reason}）`)
        .join('\n');
      try {
        await showConfirmDialog({
          title: '温柔提醒：档期时间紧凑',
          message: `${summary}\n\n确认仍要排入这单吗？`,
          confirmButtonText: '仍要排单',
          confirmButtonColor: '#D46884',
        });
        saving.value = false;
        await submitOrder(true);
        return;
      } catch {
        // user cancelled
      }
    } else {
      showToast(err?.response?.data?.error || '保存失败');
    }
  } finally {
    saving.value = false;
  }
}
</script>
