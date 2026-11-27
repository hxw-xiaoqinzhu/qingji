<template>
  <van-popup
    :show="show"
    teleport="body"
    position="bottom"
    round
    :style="{ maxHeight: '94dvh', backgroundColor: '#FDF8FA' }"
    @update:show="emit('update:show', $event)"
  >
    <div class="p-5 pb-safe-sheet flex flex-col max-h-[94dvh]">
      <div class="sheet-grabber shrink-0" />
      <div class="flex items-center justify-between mb-3 shrink-0">
        <div>
          <h3 class="text-[17px] font-semibold text-ink">专属可爱报价海报</h3>
          <p class="text-[11.5px] text-ink-muted mt-0.5">长按下方海报图片即可保存到手机相册</p>
        </div>
        <button type="button" class="icon-btn-white" @click="emit('update:show', false)">
          <X class="w-4 h-4" />
        </button>
      </div>

      <!-- Scrollable Poster Display Area -->
      <div class="flex-1 overflow-y-auto no-scrollbar pb-2">
        <!-- Rendered Real <img> for Native Long-Press Save to Album -->
        <div v-if="posterDataUrl && !rendering" class="flex flex-col items-center">
          <img
            :src="posterDataUrl"
            alt="报价单海报"
            class="w-full max-w-[346px] rounded-[26px] shadow-[0_18px_42px_-14px_rgba(186,118,140,0.34)] select-auto"
            style="-webkit-touch-callout: default"
          />
          <div class="mt-3 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#FAF0F3] text-[#A46B7D] text-[12px] font-medium">
            <span>👆 长按上方海报图片即可保存到相册</span>
          </div>
        </div>

        <!-- Smooth Skeleton While Rendering High-Res Poster -->
        <div v-else class="flex flex-col items-center py-2">
          <div class="skeleton-box w-full max-w-[346px] h-[460px] rounded-[26px]" />
          <p class="text-[12px] text-ink-muted mt-3">正在为你精绘高清报价海报...</p>
        </div>
      </div>

      <!-- Bottom Action Buttons -->
      <div class="mt-3 pt-2 grid grid-cols-2 gap-2.5 shrink-0">
        <button
          type="button"
          class="btn-unified btn-glass !h-[44px] text-[13.5px]"
          @click="emit('update:show', false)"
        >
          返回修改套餐
        </button>
        <button
          type="button"
          :disabled="rendering || !posterDataUrl"
          class="btn-unified btn-rose text-white !h-[44px] text-[13.5px] disabled:opacity-60"
          @click="downloadPoster"
        >
          下载高清原图
        </button>
      </div>
    </div>

    <!-- Off-Screen High-Visual-Impact Cute Designer Poster Template (Captured at 3x Retina by html2canvas) -->
    <div class="fixed -left-[9999px] top-0 pointer-events-none" aria-hidden="true">
      <div
        ref="posterRef"
        class="w-[375px] p-6 relative overflow-hidden"
        style="
          background: linear-gradient(160deg, #FFEBF1 0%, #FFF8FA 38%, #FFFDFB 66%, #FCEEE9 100%);
          font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Hiragino Sans GB', sans-serif;
        "
      >
        <!-- Decorative Pastel Ambient Orbs -->
        <div
          style="
            position: absolute;
            top: -54px;
            right: -40px;
            width: 190px;
            height: 190px;
            border-radius: 9999px;
            background: radial-gradient(circle, rgba(244, 189, 206, 0.55) 0%, rgba(244, 189, 206, 0) 70%);
          "
        />
        <div
          style="
            position: absolute;
            bottom: -60px;
            left: -45px;
            width: 210px;
            height: 210px;
            border-radius: 9999px;
            background: radial-gradient(circle, rgba(247, 214, 194, 0.5) 0%, rgba(247, 214, 194, 0) 70%);
          "
        />

        <!-- Inner Couture Framed Card -->
        <div
          class="relative z-10 rounded-[28px] p-5"
          style="
            background: rgba(255, 255, 255, 0.88);
            border: 1.5px solid #F6DAE4;
            box-shadow: 0 12px 32px rgba(196, 130, 152, 0.14);
          "
        >
          <!-- Top Kawaii Ribbon & Title Header -->
          <div class="flex flex-col items-center text-center pb-4" style="border-bottom: 1.5px dashed #F3DCE4">
            <div
              class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold tracking-[0.18em] mb-3"
              style="background: #FDEEF3; color: #C2748B"
            >
              ✦ BRIDAL MAKEUP MENU ✦
            </div>

            <!-- Circular Studio Avatar -->
            <div
              class="p-[3.5px] rounded-full mb-2.5"
              style="background: linear-gradient(135deg, #F3C8D6 0%, #FFFFFF 52%, #EFCEBE 100%); box-shadow: 0 8px 18px rgba(196, 130, 152, 0.25)"
            >
              <StudioAvatar :src="avatarUrl" :size="64" rounded-class="rounded-full" />
            </div>

            <h2 class="text-[22px] font-bold tracking-tight" style="color: #3B2B31">
              {{ studioName }}
            </h2>
            <p class="text-[11.5px] mt-1 leading-relaxed" style="color: #8B6E78">
              {{ bio || '每一笔粉黛，都是双向奔赴的浪漫 ✨' }}
            </p>
          </div>

          <!-- Section 1: Main Packages -->
          <div v-if="mainPackages.length > 0" class="mt-4">
            <div class="flex items-center justify-between mb-2.5">
              <span
                class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11.5px] font-semibold"
                style="background: linear-gradient(90deg, #FDEAF0 0%, #FDF2EB 100%); color: #B4657D"
              >
                🎀 主推妆造套餐
              </span>
              <span class="text-[10px] tracking-wider" style="color: #BFA5AE">SIGNATURE</span>
            </div>

            <div class="space-y-2.5">
              <div
                v-for="pkg in mainPackages"
                :key="pkg.id"
                class="rounded-[18px] p-3.5"
                style="background: linear-gradient(135deg, #FFF7FA 0%, #FFFDFB 100%); border: 1px solid #F5E2E8"
              >
                <div class="flex items-baseline justify-between gap-2">
                  <div class="flex items-center gap-1.5 min-w-0">
                    <span class="text-[15px] font-bold" style="color: #3B2B31">{{ pkg.name }}</span>
                    <span
                      v-if="pkg.defaultDurationMin > 0"
                      class="px-2 py-0.5 rounded-full text-[10px] font-medium shrink-0"
                      style="background: #FFFFFF; color: #A67584; border: 1px solid #F2DFE5"
                    >
                      约 {{ formatDuration(pkg.defaultDurationMin) }}
                    </span>
                  </div>
                  <div class="shrink-0 font-bold tabular-nums" style="color: #C76A86; font-size: 18px">
                    <span style="font-size: 12px; margin-right: 1px">¥</span>{{ pkg.price }}
                  </div>
                </div>
                <p v-if="pkg.description" class="text-[11.5px] mt-1.5 leading-relaxed" style="color: #7D646D">
                  {{ pkg.description }}
                </p>
              </div>
            </div>
          </div>

          <!-- Section 2: Extra Add-ons -->
          <div v-if="extraPackages.length > 0" class="mt-4">
            <div class="flex items-center justify-between mb-2.5">
              <span
                class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11.5px] font-semibold"
                style="background: #FAF2F5; color: #9E6879"
              >
                🌷 贴心增项服务
              </span>
              <span class="text-[10px] tracking-wider" style="color: #BFA5AE">ADD-ONS</span>
            </div>

            <div class="grid grid-cols-2 gap-2">
              <div
                v-for="ep in extraPackages"
                :key="ep.id"
                class="rounded-[14px] px-3 py-2.5"
                style="background: #FCF7F9; border: 1px solid #F3E4E9"
              >
                <div class="text-[12.5px] font-semibold truncate" style="color: #3F2F35">{{ ep.name }}</div>
                <div class="text-[14px] font-bold tabular-nums mt-0.5" style="color: #C4718A">
                  ¥{{ ep.price }}
                </div>
                <div v-if="ep.description" class="text-[10px] mt-0.5 truncate" style="color: #9A818A">
                  {{ ep.description }}
                </div>
              </div>
            </div>
          </div>

          <!-- Sweet Footer Stamp -->
          <div
            class="mt-5 pt-3.5 flex items-center justify-between text-[11px]"
            style="border-top: 1.5px dashed #F3DCE4; color: #9A7B86"
          >
            <div>
              <div class="font-semibold" style="color: #B56E84">私信试妆 · 定金锁档 🌷</div>
              <div v-if="phone" class="mt-0.5 tabular-nums" style="font-size: 10.5px; color: #A68D96">
                预约咨询：{{ phone }}
              </div>
            </div>
            <div
              class="px-2.5 py-1 rounded-full text-[10px] font-semibold"
              style="background: #FDEEF3; color: #C2748B"
            >
              晴记 · 专属价目
            </div>
          </div>
        </div>
      </div>
    </div>
  </van-popup>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue';
import html2canvas from 'html2canvas';
import { showToast } from 'vant';
import { X } from 'lucide-vue-next';
import StudioAvatar from '@/components/StudioAvatar.vue';
import type { PackageTemplate } from '@/types';

const props = defineProps<{
  show: boolean;
  studioName: string;
  avatarUrl?: string | null;
  bio?: string | null;
  phone?: string | null;
  packages: PackageTemplate[];
}>();

const emit = defineEmits<{
  (e: 'update:show', v: boolean): void;
}>();

const posterRef = ref<HTMLElement | null>(null);
const posterDataUrl = ref('');
const rendering = ref(false);

const mainPackages = computed(() => props.packages.filter((p) => p.category === 'MAIN'));
const extraPackages = computed(() => props.packages.filter((p) => p.category === 'EXTRA'));

function formatDuration(mins: number) {
  const h = mins / 60;
  return Number.isInteger(h) ? `${h}h` : `${h.toFixed(1)}h`;
}

async function renderPoster() {
  rendering.value = true;
  posterDataUrl.value = '';
  await nextTick();
  // Give images/fonts a brief beat to settle
  await new Promise((r) => setTimeout(r, 120));
  if (!posterRef.value) {
    rendering.value = false;
    return;
  }
  try {
    const canvas = await html2canvas(posterRef.value, {
      scale: 3,
      useCORS: true,
      backgroundColor: '#FFF7FA',
    });
    posterDataUrl.value = canvas.toDataURL('image/png');
  } catch {
    showToast('生成海报失败，请重试');
  } finally {
    rendering.value = false;
  }
}

watch(
  () => props.show,
  (visible) => {
    if (visible) {
      renderPoster();
    }
  }
);

function downloadPoster() {
  if (!posterDataUrl.value) return;
  const a = document.createElement('a');
  a.href = posterDataUrl.value;
  a.download = `${props.studioName || '嘻嘻化妆室'}-妆造报价海报.png`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  showToast('已开始下载高清海报');
}
</script>
