<template>
  <van-popup
    :show="show"
    teleport="body"
    position="bottom"
    round
    :style="{ maxHeight: 'calc(var(--app-height, 100vh) * 0.92)', backgroundColor: '#FCF6F8' }"
    @update:show="emit('update:show', $event)"
  >
    <div v-if="order" class="p-5 pb-safe-sheet">
      <div class="sheet-grabber" />
      <div class="flex items-center justify-between mb-4">
        <div>
          <h3 class="text-[17px] font-semibold text-ink">新娘档期锁定确认函</h3>
          <p class="text-[12px] text-ink-muted">仪式感满满的电子预约函，可一键保存发给新娘</p>
        </div>
        <button
          type="button"
          class="icon-btn-white"
          @click="emit('update:show', false)"
        >
          <X class="w-4 h-4" />
        </button>
      </div>

      <div class="flex justify-center">
        <div
          ref="cardRef"
          class="w-full max-w-[344px] rounded-[26px] p-6 relative overflow-hidden"
          style="
            background: linear-gradient(170deg, #FFF4F7 0%, #FFFFFF 36%, #FDF6EF 100%);
            border: 1px solid #FADBE5;
            box-shadow: 0 12px 32px rgba(186, 104, 128, 0.12);
          "
        >
          <div class="text-center pb-4" style="border-bottom: 1px dashed #F2DCE4">
            <p class="text-[10px] uppercase tracking-[0.26em] text-brand font-semibold">BRIDAL RESERVATION</p>
            <h2 class="text-[20px] font-semibold text-ink mt-1.5">{{ studioName }}</h2>
            <p class="text-[11px] text-ink-secondary mt-1">♥ 您的重要时刻 · 专属妆造档期已锁定 ♥</p>
          </div>

          <div class="mt-4 space-y-2.5 text-[13px]">
            <div class="flex justify-between">
              <span class="text-ink-muted">预约新娘</span>
              <span class="font-semibold text-ink">{{ order.clientName }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-ink-muted">服务日期</span>
              <span class="font-medium text-ink tabular-nums">
                {{ order.serviceDate }}{{ order.endDate ? ` 至 ${order.endDate}` : '' }}
              </span>
            </div>
            <div class="flex justify-between">
              <span class="text-ink-muted">开妆时间</span>
              <span class="font-medium text-ink tabular-nums">{{ order.startTime }} - {{ order.endTime }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-ink-muted">定制套餐</span>
              <span class="font-medium text-brand-deep">{{ order.serviceType }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-ink-muted">出妆地点</span>
              <span class="font-medium text-ink text-right max-w-[185px]">{{ order.location || '待确认' }}</span>
            </div>
          </div>

          <div
            class="mt-4 rounded-2xl p-3.5 space-y-2 text-[13px] tabular-nums"
            style="background: rgba(253, 238, 243, 0.65)"
          >
            <div class="flex justify-between">
              <span class="text-ink-secondary">套餐总额</span>
              <span class="font-semibold text-ink">¥{{ order.totalAmount }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-ink-secondary">已收定金</span>
              <span class="font-semibold text-status-locked-text">¥{{ order.depositPaid }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-ink-secondary">待付尾款</span>
              <span class="font-semibold text-brand-deep">¥{{ order.balanceDue }}</span>
            </div>
          </div>

          <div
            v-if="noticeTemplate"
            class="mt-4 p-3.5 rounded-2xl bg-white border border-brand/10 text-[11px] text-ink-secondary leading-relaxed whitespace-pre-line"
          >
            <div class="font-semibold text-brand-deep mb-1">妆前护肤与准备贴士</div>
            {{ noticeTemplate }}
          </div>
        </div>
      </div>

      <div v-if="generatedUrl" class="mt-4 text-center">
        <p class="text-[12px] text-brand-deep mb-2">长按图片可直接保存发送给新娘</p>
        <img :src="generatedUrl" alt="确认函" class="w-44 mx-auto rounded-2xl shadow-card" />
      </div>

      <button
        type="button"
        :disabled="rendering"
        class="btn-unified mt-5 w-full btn-rose text-white disabled:opacity-60"
        @click="generateImage"
      >
        {{ rendering ? '绘制确认函中...' : '保存高清确认函长图' }}
      </button>
    </div>
  </van-popup>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import html2canvas from 'html2canvas';
import { showToast } from 'vant';
import { X } from 'lucide-vue-next';
import type { Order } from '@/types';

const props = defineProps<{
  show: boolean;
  order: Order | null;
  studioName: string;
  noticeTemplate: string;
}>();

const emit = defineEmits<{ (e: 'update:show', val: boolean): void }>();
const cardRef = ref<HTMLElement | null>(null);
const rendering = ref(false);
const generatedUrl = ref('');

async function generateImage() {
  if (!cardRef.value || !props.order) return;
  rendering.value = true;
  try {
    const canvas = await html2canvas(cardRef.value, {
      scale: 3,
      useCORS: true,
      backgroundColor: '#FFF8FA',
    });
    const url = canvas.toDataURL('image/png');
    generatedUrl.value = url;
    const a = document.createElement('a');
    a.href = url;
    a.download = `预约确认函-${props.order.clientName}-${props.order.serviceDate}.png`;
    a.click();
    showToast('高清确认函已生成');
  } catch {
    showToast('生成失败');
  } finally {
    rendering.value = false;
  }
}
</script>
