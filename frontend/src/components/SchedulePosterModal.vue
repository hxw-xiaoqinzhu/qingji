<template>
  <van-popup
    :show="show"
    teleport="body"
    position="bottom"
    round
    :style="{ maxHeight: '92dvh', backgroundColor: '#FCF6F8' }"
    @update:show="emit('update:show', $event)"
  >
    <div class="p-5 pb-safe-sheet">
      <div class="sheet-grabber" />
      <div class="flex items-center justify-between mb-4">
        <div>
          <h3 class="text-[17px] font-semibold text-ink">月度档期分享海报</h3>
          <p class="text-[12px] text-ink-muted mt-0.5">已自动隐私脱敏 · 适合发朋友圈与小红书</p>
        </div>
        <button
          type="button"
          class="icon-btn-white"
          @click="emit('update:show', false)"
        >
          <X class="w-4 h-4" />
        </button>
      </div>

      <!-- Magazine Poster Canvas -->
      <div class="flex justify-center">
        <div
          ref="posterRef"
          class="w-full max-w-[344px] rounded-[26px] p-6 relative overflow-hidden"
          style="
            background: linear-gradient(165deg, #FFF4F7 0%, #FFFFFF 44%, #FDF6F0 100%);
            border: 1px solid #FADCE6;
            box-shadow: 0 12px 32px rgba(186, 104, 128, 0.12);
          "
        >
          <div class="flex items-start justify-between mb-5 relative z-10">
            <div>
              <p class="text-[10px] uppercase tracking-[0.22em] text-brand font-semibold">MAKEUP SCHEDULE</p>
              <h2 class="text-[22px] font-semibold text-ink tabular-nums mt-1">
                {{ year }}年{{ month }}月档期表
              </h2>
              <p class="text-[12px] text-ink-secondary mt-1 font-medium">{{ studioName }}</p>
            </div>
            <div class="px-3 py-1.5 rounded-full bg-brand-soft text-brand-deep text-[11px] font-semibold tabular-nums">
              余 {{ availableCount }} 天可约
            </div>
          </div>

          <div class="grid grid-cols-7 text-center text-[11px] text-ink-muted mb-2 font-medium">
            <span v-for="w in ['一', '二', '三', '四', '五', '六', '日']" :key="w">{{ w }}</span>
          </div>

          <div class="grid grid-cols-7 gap-1.5">
            <div v-for="n in leadingBlanks" :key="'b-' + n" class="h-10" />
            <div
              v-for="cell in posterDays"
              :key="cell.date"
              class="h-10 rounded-[12px] flex flex-col items-center justify-center tabular-nums"
              :style="
                cell.status === 'BUSY'
                  ? 'background: linear-gradient(135deg, #FDE8EE 0%, #FAD6E1 100%); color: #BE506E;'
                  : 'background: #FFFFFF; color: #2B1E23; border: 1px solid #F7E8ED;'
              "
            >
              <span class="text-[13px] font-semibold leading-none">{{ cell.day }}</span>
              <span class="text-[9px] mt-1 leading-none">
                {{ cell.status === 'BUSY' ? '已定' : '可约' }}
              </span>
            </div>
          </div>

          <div
            class="mt-5 pt-4 flex items-center justify-between text-[11px] text-ink-secondary"
            style="border-top: 1px dashed #F2DCE4"
          >
            <div class="flex items-center gap-3">
              <span class="flex items-center gap-1">
                <i class="w-2 h-2 rounded-full bg-white border border-brand inline-block" />可约
              </span>
              <span class="flex items-center gap-1">
                <i class="w-2 h-2 rounded-full bg-brand inline-block" />已定
              </span>
            </div>
            <span class="text-brand-deep font-medium">私信试妆 · 定金锁档</span>
          </div>
        </div>
      </div>

      <div v-if="generatedUrl" class="mt-4 text-center">
        <p class="text-[12px] text-brand-deep mb-2">长按下方海报即可保存至手机相册</p>
        <img :src="generatedUrl" alt="档期海报" class="w-44 mx-auto rounded-2xl shadow-card" />
      </div>

      <div class="mt-5 grid grid-cols-2 gap-3">
        <button
          type="button"
          class="btn-unified btn-glass"
          @click="copyShareLink"
        >
          复制只读档期链接
        </button>
        <button
          type="button"
          :disabled="rendering"
          class="btn-unified btn-rose text-white disabled:opacity-60"
          @click="generatePoster"
        >
          {{ rendering ? '绘制海报中...' : '保存高清海报' }}
        </button>
      </div>
    </div>
  </van-popup>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import dayjs from 'dayjs';
import html2canvas from 'html2canvas';
import { showToast } from 'vant';
import { X } from 'lucide-vue-next';
import type { Order } from '@/types';

const props = defineProps<{
  show: boolean;
  year: number;
  month: number;
  studioName: string;
  shareToken: string;
  orders: Order[];
}>();

const emit = defineEmits<{ (e: 'update:show', val: boolean): void }>();

const posterRef = ref<HTMLElement | null>(null);
const rendering = ref(false);
const generatedUrl = ref('');

const firstDay = computed(() => dayjs(`${props.year}-${String(props.month).padStart(2, '0')}-01`));
const leadingBlanks = computed(() => {
  const dow = firstDay.value.day();
  return dow === 0 ? 6 : dow - 1;
});

const posterDays = computed(() => {
  const daysInMonth = firstDay.value.daysInMonth();
  const busySet = new Set<string>();

  for (const o of props.orders) {
    if (o.status === 'CANCELLED') continue;
    let cur = dayjs(o.serviceDate);
    const end = o.endDate ? dayjs(o.endDate) : cur;
    while (!cur.isAfter(end)) {
      busySet.add(cur.format('YYYY-MM-DD'));
      cur = cur.add(1, 'day');
    }
  }

  const list: Array<{ date: string; day: number; status: 'AVAILABLE' | 'BUSY' }> = [];
  for (let d = 1; d <= daysInMonth; d++) {
    const date = firstDay.value.date(d).format('YYYY-MM-DD');
    list.push({ date, day: d, status: busySet.has(date) ? 'BUSY' : 'AVAILABLE' });
  }
  return list;
});

const availableCount = computed(() => posterDays.value.filter((d) => d.status === 'AVAILABLE').length);

async function generatePoster() {
  if (!posterRef.value) return;
  rendering.value = true;
  try {
    const canvas = await html2canvas(posterRef.value, {
      scale: 3,
      useCORS: true,
      backgroundColor: '#FFF8FA',
    });
    const url = canvas.toDataURL('image/png');
    generatedUrl.value = url;

    const a = document.createElement('a');
    a.href = url;
    a.download = `${props.studioName}-${props.year}年${props.month}月档期.png`;
    a.click();
    showToast('高清档期海报已生成');
  } catch {
    showToast('生成失败，请重试');
  } finally {
    rendering.value = false;
  }
}

async function copyShareLink() {
  const link = `${window.location.origin}/s/${props.shareToken}`;
  try {
    await navigator.clipboard.writeText(link);
    showToast('已复制脱敏档期链接');
  } catch {
    showToast(link);
  }
}
</script>
