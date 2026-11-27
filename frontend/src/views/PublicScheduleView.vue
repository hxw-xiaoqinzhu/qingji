<template>
  <div class="h-full flex flex-col silk-mesh-bg overflow-hidden">
    <header class="nav-adaptive px-4 pb-3 flex items-center justify-between" :style="headerStyle">
      <button
        v-if="canGoBack"
        type="button"
        class="ios27-icon-btn"
        aria-label="返回"
        @click="router.back()"
      >
        <ChevronLeft class="w-[17px] h-[17px]" />
      </button>
      <div v-else class="w-[34px]" />
      <h1 class="text-[17px] font-semibold text-ink">公开档期页</h1>
      <div class="w-[34px]" />
    </header>

    <div class="scroll-pane no-scrollbar px-4 pt-2 pb-6" @scroll.passive="onPaneScroll">
      <div class="max-w-[440px] mx-auto">
        <div
          class="card-soft p-6 relative overflow-hidden stagger-item"
          style="
            background: linear-gradient(165deg, #FFF4F8 0%, #FFFFFF 42%, #FDF6F0 100%);
            border: 1px solid #FADCE6;
          "
        >
          <div class="flex items-start justify-between mb-5 relative z-10">
            <div>
              <p class="text-[10px] uppercase tracking-[0.24em] text-brand font-semibold">MAKEUP SCHEDULE</p>
              <h2 class="text-[21px] font-semibold text-ink mt-1">{{ studioName || '档期查询' }}</h2>
              <p class="text-[12px] text-ink-secondary mt-0.5">实时可约档期 · 客户隐私已严格保护</p>
            </div>
            <div class="px-3 py-1 rounded-full bg-brand-soft text-brand-deep text-[11px] font-semibold tabular-nums">
              余 {{ availableCount }} 天可约
            </div>
          </div>

          <div class="flex justify-center mb-5">
            <MonthGlassSwitcher
              :year="year"
              :month="month"
              @change="onMonthStep"
            />
          </div>

          <div class="grid grid-cols-7 text-center text-[11px] text-ink-muted mb-2.5 font-medium">
            <span v-for="w in ['一', '二', '三', '四', '五', '六', '日']" :key="w">{{ w }}</span>
          </div>

          <div class="relative min-h-[264px]">
            <Transition name="skeleton-dissolve">
              <div v-if="loading" class="absolute inset-0 z-20 grid grid-cols-7 gap-1.5 pointer-events-none">
                <div v-for="i in 35" :key="i" class="skeleton-box h-12 rounded-[14px]" />
              </div>
            </Transition>

            <div v-if="errorMsg && !loading" class="py-4">
              <CuteEmptyState variant="calendar" :title="errorMsg" description="请联系化妆师获取最新档期链接" compact />
            </div>

            <div v-else class="grid grid-cols-7 gap-1.5" :class="loading ? 'opacity-0' : 'opacity-100 transition-opacity duration-200'">
            <div v-for="n in leadingBlanks" :key="'b-' + n" class="h-12" />
            <div
              v-for="item in days"
              :key="item.date"
              class="h-12 rounded-[14px] flex flex-col items-center justify-center tabular-nums"
              :class="
                item.status === 'BUSY'
                  ? 'bg-brand-soft text-brand-deep'
                  : 'bg-white text-ink border border-brand/10'
              "
            >
              <span class="text-[14px] font-semibold leading-none">{{ Number(item.date.slice(8)) }}</span>
              <span class="text-[10px] mt-1 leading-none">
                {{ item.status === 'BUSY' ? '已定' : '可约' }}
              </span>
            </div>
            </div>
          </div>

          <div class="mt-6 pt-4 flex items-center justify-between text-[12px] text-ink-muted" style="border-top: 1px dashed #F2DCE4">
            <div class="flex items-center gap-3.5">
              <span class="flex items-center gap-1.5"><i class="w-2.5 h-2.5 rounded-full bg-white border border-brand inline-block" />可约</span>
              <span class="flex items-center gap-1.5"><i class="w-2.5 h-2.5 rounded-full bg-brand inline-block" />已定</span>
            </div>
            <span class="text-brand-deep font-medium text-[11px]">欢迎私信预约试妆</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom Copy Public Schedule Link CTA (Transparent, no white background bar) -->
    <div
      class="px-4 pt-2 shrink-0"
      style="padding-bottom: max(14px, calc(env(safe-area-inset-bottom, 0px) * 0.65))"
    >
      <div class="max-w-[440px] mx-auto">
        <button
          type="button"
          class="btn-unified w-full btn-rose text-white inline-flex items-center justify-center gap-1.5 leading-none"
          @click="copyScheduleLink"
        >
          <Copy class="w-[15px] h-[15px] shrink-0" />
          <span class="leading-none">复制档期链接</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import dayjs from 'dayjs';
import axios from 'axios';
import { showToast } from 'vant';
import { ChevronLeft, Copy } from 'lucide-vue-next';
import { isFirebaseMode } from '@/lib/firebase';
import { API_BASE_URL } from '@/api/http';
import { fetchFirebasePublicSchedule } from '@/api/firebaseBackend';
import { useScrollHeader } from '@/composables/useScrollHeader';
import CuteEmptyState from '@/components/CuteEmptyState.vue';
import MonthGlassSwitcher from '@/components/MonthGlassSwitcher.vue';

const route = useRoute();
const router = useRouter();
const { onPaneScroll, headerStyle } = useScrollHeader(44);
const year = ref(dayjs().year());
const month = ref(dayjs().month() + 1);
const studioName = ref('');
const days = ref<Array<{ date: string; status: 'AVAILABLE' | 'BUSY' | 'BLOCKED' }>>([]);
const loading = ref(true);
const errorMsg = ref('');

const canGoBack = computed(() => window.history.length > 1);

const leadingBlanks = computed(() => {
  const dow = dayjs(`${year.value}-${String(month.value).padStart(2, '0')}-01`).day();
  return dow === 0 ? 6 : dow - 1;
});

const availableCount = computed(() => days.value.filter((d) => d.status !== 'BUSY').length);

async function fetchPublicSchedule() {
  loading.value = true;
  errorMsg.value = '';
  try {
    const data = isFirebaseMode
      ? await fetchFirebasePublicSchedule(String(route.params.shareToken), year.value, month.value)
      : (
          await axios.get(`${API_BASE_URL}/public/schedule/${route.params.shareToken}`, {
            params: { year: year.value, month: month.value },
          })
        ).data;
    studioName.value = data.studioName;
    days.value = data.days || [];
  } catch (err: any) {
    errorMsg.value = err?.response?.data?.error || '档期链接不存在或已失效';
  } finally {
    loading.value = false;
  }
}

function onMonthStep({ year: y, month: m }: { year: number; month: number }) {
  year.value = y;
  month.value = m;
}

async function copyScheduleLink() {
  const url = `${window.location.origin}/s/${route.params.shareToken}`;
  try {
    await navigator.clipboard.writeText(url);
    showToast('已复制公开档期链接');
  } catch {
    showToast(url);
  }
}

watch([year, month], fetchPublicSchedule);
onMounted(fetchPublicSchedule);
</script>
