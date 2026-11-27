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
            <span>长按上方海报图片即可保存到相册</span>
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

    <!-- Off-Screen Pixel-Aligned Poster Template (Zero html2canvas baseline shift or text clipping) -->
    <div class="fixed -left-[9999px] top-0 pointer-events-none" aria-hidden="true">
      <div
        ref="posterRef"
        style="
          width: 375px;
          padding: 24px;
          position: relative;
          background: linear-gradient(160deg, #FFEBF1 0%, #FFF8FA 38%, #FFFDFB 66%, #FCEEE9 100%);
          font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Hiragino Sans GB', sans-serif;
          box-sizing: border-box;
        "
      >
        <!-- Decorative Pastel Ambient Orbs -->
        <div
          style="
            position: absolute;
            top: -50px;
            right: -36px;
            width: 180px;
            height: 180px;
            border-radius: 9999px;
            background: radial-gradient(circle, rgba(244, 189, 206, 0.52) 0%, rgba(244, 189, 206, 0) 70%);
          "
        />
        <div
          style="
            position: absolute;
            bottom: -56px;
            left: -40px;
            width: 200px;
            height: 200px;
            border-radius: 9999px;
            background: radial-gradient(circle, rgba(247, 214, 194, 0.46) 0%, rgba(247, 214, 194, 0) 70%);
          "
        />

        <!-- Inner Couture Framed Card -->
        <div
          style="
            position: relative;
            z-index: 10;
            border-radius: 26px;
            padding: 22px 18px 20px 18px;
            background: rgba(255, 255, 255, 0.92);
            border: 1.5px solid #F6DAE4;
            box-shadow: 0 12px 32px rgba(196, 130, 152, 0.14);
          "
        >
          <!-- Top Header -->
          <div style="text-align: center; padding-bottom: 18px; border-bottom: 1.5px dashed #F3DCE4;">
            <div style="margin-bottom: 14px;">
              <span
                style="
                  display: inline-block;
                  padding: 4px 14px 6px 14px;
                  border-radius: 9999px;
                  background: #FDEEF3;
                  color: #C2748B;
                  font-size: 10.5px;
                  font-weight: 600;
                  letter-spacing: 0.16em;
                  line-height: 1.25;
                "
              >
                ✦ BRIDAL MAKEUP MENU ✦
              </span>
            </div>

            <!-- Centered Circular Studio Avatar -->
            <div
              style="
                width: 71px;
                height: 71px;
                margin: 0 auto 12px auto;
                padding: 3.5px;
                border-radius: 9999px;
                background: linear-gradient(135deg, #F3C8D6 0%, #FFFFFF 52%, #EFCEBE 100%);
                box-shadow: 0 8px 18px rgba(196, 130, 152, 0.24);
                box-sizing: border-box;
              "
            >
              <StudioAvatar :src="avatarUrl" :size="64" rounded-class="rounded-full" />
            </div>

            <div
              style="
                font-size: 21px;
                font-weight: 700;
                color: #3B2B31;
                line-height: 1.35;
                letter-spacing: 0.02em;
              "
            >
              {{ studioName }}
            </div>
            <div
              style="
                font-size: 11.5px;
                color: #8B6E78;
                line-height: 1.55;
                margin-top: 5px;
              "
            >
              {{ bio || '每一笔粉黛，都是双向奔赴的浪漫' }}
            </div>
          </div>

          <!-- Section 1: Main Packages -->
          <div v-if="mainPackages.length > 0" style="margin-top: 18px;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
              <span
                style="
                  display: inline-block;
                  padding: 4px 12px 6px 12px;
                  border-radius: 9999px;
                  background: linear-gradient(90deg, #FDEAF0 0%, #FDF2EB 100%);
                  color: #B4657D;
                  font-size: 11.5px;
                  font-weight: 600;
                  line-height: 1.25;
                "
              >
                ✦ 主推妆造套餐
              </span>
              <span style="font-size: 10px; letter-spacing: 0.12em; color: #BFA5AE; line-height: 1.2;">
                SIGNATURE
              </span>
            </div>

            <div style="display: flex; flex-direction: column; gap: 10px;">
              <div
                v-for="pkg in mainPackages"
                :key="pkg.id"
                style="
                  border-radius: 18px;
                  padding: 14px 14px 13px 14px;
                  background: linear-gradient(135deg, #FFF7FA 0%, #FFFDFB 100%);
                  border: 1px solid #F5E2E8;
                "
              >
                <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px;">
                  <div style="display: flex; align-items: center; flex-wrap: wrap; gap: 6px; min-width: 0;">
                    <span style="font-size: 15px; font-weight: 700; color: #3B2B31; line-height: 1.35;">
                      {{ pkg.name }}
                    </span>
                    <span
                      v-if="pkg.defaultDurationMin > 0"
                      style="
                        display: inline-block;
                        padding: 2px 8px 4px 8px;
                        border-radius: 9999px;
                        background: #FFFFFF;
                        color: #A67584;
                        border: 1px solid #F2DFE5;
                        font-size: 10px;
                        font-weight: 500;
                        line-height: 1.2;
                      "
                    >
                      约 {{ formatDuration(pkg.defaultDurationMin) }}
                    </span>
                  </div>
                  <div
                    style="
                      flex-shrink: 0;
                      font-weight: 700;
                      color: #C76A86;
                      font-size: 18px;
                      line-height: 1.2;
                    "
                  >
                    <span style="font-size: 12px; margin-right: 1px;">¥</span>{{ pkg.price }}
                  </div>
                </div>
                <div
                  v-if="pkg.description"
                  style="
                    font-size: 11.5px;
                    color: #7D646D;
                    line-height: 1.55;
                    margin-top: 7px;
                    word-break: break-word;
                  "
                >
                  {{ pkg.description }}
                </div>
              </div>
            </div>
          </div>

          <!-- Section 2: Extra Add-ons (No overflow:hidden clipping!) -->
          <div v-if="extraPackages.length > 0" style="margin-top: 18px;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
              <span
                style="
                  display: inline-block;
                  padding: 4px 12px 6px 12px;
                  border-radius: 9999px;
                  background: #FAF2F5;
                  color: #9E6879;
                  font-size: 11.5px;
                  font-weight: 600;
                  line-height: 1.25;
                "
              >
                ✦ 贴心增项服务
              </span>
              <span style="font-size: 10px; letter-spacing: 0.12em; color: #BFA5AE; line-height: 1.2;">
                ADD-ONS
              </span>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
              <div
                v-for="ep in extraPackages"
                :key="ep.id"
                style="
                  border-radius: 15px;
                  padding: 11px 12px 12px 12px;
                  background: #FCF7F9;
                  border: 1px solid #F3E4E9;
                  box-sizing: border-box;
                "
              >
                <div
                  style="
                    font-size: 12.5px;
                    font-weight: 600;
                    color: #3F2F35;
                    line-height: 1.45;
                    word-break: break-word;
                  "
                >
                  {{ ep.name }}
                </div>
                <div
                  style="
                    font-size: 15px;
                    font-weight: 700;
                    color: #C4718A;
                    line-height: 1.35;
                    margin-top: 4px;
                  "
                >
                  ¥{{ ep.price }}
                </div>
                <div
                  v-if="ep.description"
                  style="
                    font-size: 10.5px;
                    color: #9A818A;
                    line-height: 1.5;
                    margin-top: 4px;
                    word-break: break-word;
                  "
                >
                  {{ ep.description }}
                </div>
              </div>
            </div>
          </div>

          <!-- Sweet Footer Stamp -->
          <div
            style="
              margin-top: 20px;
              padding-top: 15px;
              border-top: 1.5px dashed #F3DCE4;
              display: flex;
              align-items: center;
              justify-content: space-between;
              gap: 10px;
            "
          >
            <div>
              <div style="font-size: 11.5px; font-weight: 600; color: #B56E84; line-height: 1.4;">
                私信试妆 · 定金锁档
              </div>
              <div v-if="phone" style="font-size: 10.5px; color: #A68D96; line-height: 1.4; margin-top: 2px;">
                预约咨询：{{ phone }}
              </div>
            </div>
            <span
              style="
                display: inline-block;
                padding: 4px 11px 6px 11px;
                border-radius: 9999px;
                background: #FDEEF3;
                color: #C2748B;
                font-size: 10.5px;
                font-weight: 600;
                line-height: 1.25;
                flex-shrink: 0;
              "
            >
              晴记 · 专属价目
            </span>
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
  await new Promise((r) => setTimeout(r, 140));
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
