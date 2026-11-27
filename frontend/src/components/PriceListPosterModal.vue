<template>
  <van-popup
    :show="show"
    teleport="body"
    position="bottom"
    round
    :style="{ maxHeight: 'calc(var(--app-height, 100vh) * 0.94)', backgroundColor: '#FDF8FA' }"
    @update:show="emit('update:show', $event)"
  >
    <div class="p-5 pb-safe-sheet flex flex-col" style="max-height: calc(var(--app-height, 100vh) * 0.94)">
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
        <div v-if="posterDataUrl && !rendering" class="flex flex-col items-center">
          <img
            :src="posterDataUrl"
            alt="报价单海报"
            class="w-full max-w-[346px] rounded-[26px] shadow-[0_18px_42px_-14px_rgba(186,118,140,0.34)] select-auto"
            style="-webkit-touch-callout: default"
          />
          <div class="mt-3 inline-flex items-center justify-center h-8 px-4 rounded-full bg-[#FAF0F3] text-[#A46B7D] text-[12px] font-medium">
            长按上方海报图片即可保存到相册
          </div>
        </div>

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
  </van-popup>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { showToast } from 'vant';
import { X } from 'lucide-vue-next';
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

const posterDataUrl = ref('');
const rendering = ref(false);

const mainPackages = computed(() => props.packages.filter((p) => p.category === 'MAIN'));
const extraPackages = computed(() => props.packages.filter((p) => p.category === 'EXTRA'));

const FONT_STACK = `-apple-system, BlinkMacSystemFont, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif`;

function formatDuration(mins: number) {
  const h = mins / 60;
  return Number.isInteger(h) ? `${h}h` : `${h.toFixed(1)}h`;
}

function roundRectPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

/**
 * Exact Sub-Pixel Ink-Box Vertical & Horizontal Centering.
 * Uses actualBoundingBoxAscent/Descent so text is mathematically centered inside pills/boxes
 * with ZERO html2canvas baseline drift across iOS Safari, Chrome, and WeChat.
 */
function inkBaselineY(ctx: CanvasRenderingContext2D, text: string, centerY: number): number {
  const m = ctx.measureText(text);
  if (typeof m.actualBoundingBoxAscent === 'number' && typeof m.actualBoundingBoxDescent === 'number') {
    return centerY + (m.actualBoundingBoxAscent - m.actualBoundingBoxDescent) / 2;
  }
  return centerY + 4;
}

function measureInkWidth(ctx: CanvasRenderingContext2D, text: string): number {
  const m = ctx.measureText(text);
  if (typeof m.actualBoundingBoxLeft === 'number' && typeof m.actualBoundingBoxRight === 'number') {
    return m.actualBoundingBoxLeft + m.actualBoundingBoxRight;
  }
  return m.width;
}

function drawInkCenteredText(ctx: CanvasRenderingContext2D, text: string, centerX: number, centerY: number) {
  ctx.save();
  ctx.textBaseline = 'alphabetic';
  ctx.textAlign = 'left';
  const m = ctx.measureText(text);
  const left = typeof m.actualBoundingBoxLeft === 'number' ? m.actualBoundingBoxLeft : 0;
  const right = typeof m.actualBoundingBoxRight === 'number' ? m.actualBoundingBoxRight : m.width;
  const inkW = left + right;
  const drawX = centerX - inkW / 2 + left;
  const drawY = inkBaselineY(ctx, text, centerY);
  ctx.fillText(text, drawX, drawY);
  ctx.restore();
}

function drawInkLeftText(ctx: CanvasRenderingContext2D, text: string, x: number, centerY: number) {
  ctx.save();
  ctx.textBaseline = 'alphabetic';
  ctx.textAlign = 'left';
  ctx.fillText(text, x, inkBaselineY(ctx, text, centerY));
  ctx.restore();
}

function wrapTextLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  if (!text) return [];
  const lines: string[] = [];
  for (const rawLine of text.split('\n')) {
    let cur = '';
    for (const ch of rawLine) {
      const test = cur + ch;
      if (ctx.measureText(test).width > maxWidth && cur.length > 0) {
        lines.push(cur);
        cur = ch;
      } else {
        cur = test;
      }
    }
    if (cur) lines.push(cur);
  }
  return lines;
}

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function drawFourPointStar(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, color: string) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(cx, cy - r);
  ctx.quadraticCurveTo(cx, cy, cx + r, cy);
  ctx.quadraticCurveTo(cx, cy, cx, cy + r);
  ctx.quadraticCurveTo(cx, cy, cx - r, cy);
  ctx.quadraticCurveTo(cx, cy, cx, cy - r);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

async function drawCircularAvatar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  src?: string | null
) {
  // Outer Pearlescent Ring
  ctx.save();
  ctx.shadowColor = 'rgba(196, 130, 152, 0.26)';
  ctx.shadowBlur = 16;
  ctx.shadowOffsetY = 6;
  const ringGrad = ctx.createLinearGradient(cx - radius - 4, cy - radius - 4, cx + radius + 4, cy + radius + 4);
  ringGrad.addColorStop(0, '#F3C8D6');
  ringGrad.addColorStop(0.52, '#FFFFFF');
  ringGrad.addColorStop(1, '#EFCEBE');
  ctx.fillStyle = ringGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, radius + 3.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Clip Inner Circle
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.clip();

  const isImg = src && (src.startsWith('/') || src.startsWith('http://') || src.startsWith('https://') || src.startsWith('data:'));
  if (isImg && src) {
    const img = await loadImage(src);
    if (img) {
      const scale = Math.max((radius * 2) / img.width, (radius * 2) / img.height);
      const dw = img.width * scale;
      const dh = img.height * scale;
      ctx.drawImage(img, cx - dw / 2, cy - dh / 2, dw, dh);
      ctx.restore();
      return;
    }
  }

  // Preset Pastel Backgrounds + Vector Kawaii Art
  const preset = src || 'preset:ribbon';
  const bg = ctx.createLinearGradient(cx - radius, cy - radius, cx + radius, cy + radius);
  if (preset === 'preset:crown') {
    bg.addColorStop(0, '#FCF3EA');
    bg.addColorStop(1, '#F6E3D7');
  } else if (preset === 'preset:tulip') {
    bg.addColorStop(0, '#FBF0F4');
    bg.addColorStop(1, '#F3E5EC');
  } else if (preset === 'preset:butterfly') {
    bg.addColorStop(0, '#F6EFFA');
    bg.addColorStop(1, '#EFE2F2');
  } else {
    bg.addColorStop(0, '#FCEBF0');
    bg.addColorStop(1, '#F7DCE5');
  }
  ctx.fillStyle = bg;
  ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);

  // Inner soft white disc
  ctx.fillStyle = '#FFF8FA';
  ctx.beginPath();
  ctx.arc(cx, cy, radius * 0.68, 0, Math.PI * 2);
  ctx.fill();

  // Scale 64x64 coordinate space into avatar center
  const s = (radius * 1.56) / 64;
  ctx.translate(cx - 32 * s, cy - 32 * s);
  ctx.scale(s, s);
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  if (preset === 'preset:crown') {
    ctx.fillStyle = '#F8DFC8';
    ctx.strokeStyle = '#C79678';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(16, 42);
    ctx.lineTo(19, 25);
    ctx.lineTo(27, 33);
    ctx.lineTo(32, 21);
    ctx.lineTo(37, 33);
    ctx.lineTo(45, 25);
    ctx.lineTo(48, 42);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    roundRectPath(ctx, 16, 42, 32, 5, 2.5);
    ctx.fillStyle = '#F2C6D2';
    ctx.fill();
    ctx.stroke();
  } else if (preset === 'preset:tulip') {
    ctx.strokeStyle = '#99B09A';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(32, 37);
    ctx.lineTo(32, 48);
    ctx.stroke();

    ctx.fillStyle = '#F5C3D0';
    ctx.strokeStyle = '#C68497';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(22, 28);
    ctx.bezierCurveTo(22, 20, 28, 17, 32, 22);
    ctx.bezierCurveTo(36, 17, 42, 20, 42, 28);
    ctx.bezierCurveTo(42, 35, 37, 38, 32, 38);
    ctx.bezierCurveTo(27, 38, 22, 35, 22, 28);
    ctx.fill();
    ctx.stroke();
  } else if (preset === 'preset:butterfly') {
    ctx.fillStyle = '#EBC5D8';
    ctx.strokeStyle = '#B6809A';
    ctx.lineWidth = 1.9;
    ctx.beginPath();
    ctx.moveTo(31, 32);
    ctx.bezierCurveTo(24, 20, 13, 18, 14, 29);
    ctx.bezierCurveTo(15, 35, 23, 36, 31, 33);
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(33, 32);
    ctx.bezierCurveTo(40, 20, 51, 18, 50, 29);
    ctx.bezierCurveTo(49, 35, 41, 36, 33, 33);
    ctx.fill();
    ctx.stroke();

    roundRectPath(ctx, 30.5, 25, 3, 15, 1.5);
    ctx.fillStyle = '#B6809A';
    ctx.fill();
  } else {
    // Default Ribbon Bow
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#C9869A';

    // Tails
    ctx.fillStyle = '#F7D7DF';
    ctx.beginPath();
    ctx.moveTo(29, 34);
    ctx.lineTo(22, 47);
    ctx.lineTo(28, 44);
    ctx.lineTo(31, 48);
    ctx.lineTo(32, 35);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#F2C0CD';
    ctx.beginPath();
    ctx.moveTo(35, 34);
    ctx.lineTo(42, 47);
    ctx.lineTo(36, 44);
    ctx.lineTo(33, 48);
    ctx.lineTo(32, 35);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Left & Right Loops
    ctx.fillStyle = '#F2B8C6';
    ctx.beginPath();
    ctx.moveTo(32, 31);
    ctx.bezierCurveTo(26, 23, 14, 20, 13, 29);
    ctx.bezierCurveTo(12, 37, 23, 38, 32, 33);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#F6C8D3';
    ctx.beginPath();
    ctx.moveTo(32, 31);
    ctx.bezierCurveTo(38, 23, 50, 20, 51, 29);
    ctx.bezierCurveTo(52, 37, 41, 38, 32, 33);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Center Knot
    ctx.fillStyle = '#FFFDFD';
    ctx.beginPath();
    ctx.arc(32, 32, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  ctx.restore();
}

async function renderPoster() {
  rendering.value = true;
  posterDataUrl.value = '';
  await new Promise((r) => setTimeout(r, 30));

  try {
    const W = 375;
    const DPR = 3;
    const outerPad = 20;
    const cardX = outerPad;
    const cardW = W - outerPad * 2; // 335
    const innerPadX = 18;
    const contentX = cardX + innerPadX; // 38
    const contentW = cardW - innerPadX * 2; // 299

    const measureCanvas = document.createElement('canvas');
    const mctx = measureCanvas.getContext('2d')!;

    const studio = props.studioName || '嘻嘻化妆室';
    const bioText = (props.bio || '每一笔粉黛，都是双向奔赴的浪漫').replace(/[\u{1F300}-\u{1FAFF}]/gu, '').trim() || '每一笔粉黛，都是双向奔赴的浪漫';

    mctx.font = `400 11.5px ${FONT_STACK}`;
    const bioLines = wrapTextLines(mctx, bioText, contentW - 24);

    // Measure Main Package Card Heights
    const mainLayouts = mainPackages.value.map((pkg) => {
      mctx.font = `400 11.5px ${FONT_STACK}`;
      const descLines = wrapTextLines(mctx, pkg.description || '', contentW - 28);
      const cardH = 16 + 24 + (descLines.length > 0 ? 8 + descLines.length * 17 : 0) + 15;
      return { pkg, descLines, cardH };
    });

    // Measure 2-Column Extra Package Rows
    const extraGap = 10;
    const extraColW = (contentW - extraGap) / 2; // 144.5
    const extraRows: Array<{ left: any; right?: any; rowH: number }> = [];
    for (let i = 0; i < extraPackages.value.length; i += 2) {
      const calcExtra = (ep: PackageTemplate) => {
        mctx.font = `600 12.5px ${FONT_STACK}`;
        const nameLines = wrapTextLines(mctx, ep.name, extraColW - 22);
        mctx.font = `400 10.5px ${FONT_STACK}`;
        const descLines = wrapTextLines(mctx, ep.description || '', extraColW - 22);
        const h = 12 + nameLines.length * 17 + 6 + 18 + (descLines.length > 0 ? 5 + descLines.length * 15 : 0) + 12;
        return { ep, nameLines, descLines, h };
      };
      const left = calcExtra(extraPackages.value[i]);
      const right = extraPackages.value[i + 1] ? calcExtra(extraPackages.value[i + 1]) : undefined;
      const rowH = Math.max(left.h, right?.h || 0);
      extraRows.push({ left, right, rowH });
    }

    // Calculate Exact Total Height
    let cursorY = outerPad + 22; // Top of inner card content
    cursorY += 26 + 16; // Top BRIDAL MAKEUP MENU pill + margin
    cursorY += 68 + 14; // Avatar + margin
    cursorY += 26 + 6 + bioLines.length * 17 + 18; // Studio title + bio + dashed divider space

    if (mainLayouts.length > 0) {
      cursorY += 18 + 26 + 12; // Section spacing + pill + margin
      for (let i = 0; i < mainLayouts.length; i++) {
        cursorY += mainLayouts[i].cardH + (i < mainLayouts.length - 1 ? 10 : 0);
      }
    }

    if (extraRows.length > 0) {
      cursorY += 18 + 26 + 12;
      for (let i = 0; i < extraRows.length; i++) {
        cursorY += extraRows[i].rowH + (i < extraRows.length - 1 ? 10 : 0);
      }
    }

    const footerContentH = props.phone ? 34 : 26;
    cursorY += 20 + 16 + footerContentH + 20; // Dashed divider + footer + inner bottom pad
    const cardH = cursorY - outerPad;
    const totalH = cardH + outerPad * 2;

    // Create 3x Retina Canvas
    const canvas = document.createElement('canvas');
    canvas.width = W * DPR;
    canvas.height = Math.ceil(totalH * DPR);
    const ctx = canvas.getContext('2d')!;
    ctx.scale(DPR, DPR);

    // 1. Pastel Gradient Outer Canvas
    const outerBg = ctx.createLinearGradient(0, 0, W, totalH);
    outerBg.addColorStop(0, '#FFEBF1');
    outerBg.addColorStop(0.38, '#FFF8FA');
    outerBg.addColorStop(0.68, '#FFFDFB');
    outerBg.addColorStop(1, '#FCEEE9');
    ctx.fillStyle = outerBg;
    ctx.fillRect(0, 0, W, totalH);

    // Ambient Radial Glows
    const glow1 = ctx.createRadialGradient(W - 25, 25, 0, W - 25, 25, 130);
    glow1.addColorStop(0, 'rgba(244, 189, 206, 0.5)');
    glow1.addColorStop(1, 'rgba(244, 189, 206, 0)');
    ctx.fillStyle = glow1;
    ctx.fillRect(0, 0, W, 200);

    const glow2 = ctx.createRadialGradient(25, totalH - 25, 0, 25, totalH - 25, 140);
    glow2.addColorStop(0, 'rgba(247, 214, 194, 0.45)');
    glow2.addColorStop(1, 'rgba(247, 214, 194, 0)');
    ctx.fillStyle = glow2;
    ctx.fillRect(0, totalH - 200, W, 200);

    // 2. Inner Couture White Framed Card
    ctx.save();
    ctx.shadowColor = 'rgba(196, 130, 152, 0.14)';
    ctx.shadowBlur = 28;
    ctx.shadowOffsetY = 10;
    roundRectPath(ctx, cardX, outerPad, cardW, cardH, 26);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.94)';
    ctx.fill();
    ctx.restore();

    roundRectPath(ctx, cardX, outerPad, cardW, cardH, 26);
    ctx.strokeStyle = '#F6DAE4';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    let y = outerPad + 22;

    // 3. Top Pill: BRIDAL MAKEUP MENU (100% Symmetric Left/Right & Top/Bottom!)
    ctx.font = `600 10.5px ${FONT_STACK}`;
    const topLabel = 'BRIDAL MAKEUP MENU';
    const topLabelW = measureInkWidth(ctx, topLabel);
    const starR = 3.6;
    const starGap = 7;
    const topInnerW = starR * 2 + starGap + topLabelW + starGap + starR * 2;
    const topPillW = Math.ceil(topInnerW + 26);
    const topPillH = 26;
    const topPillX = W / 2 - topPillW / 2;
    const topPillCenterY = y + topPillH / 2;
    roundRectPath(ctx, topPillX, y, topPillW, topPillH, 13);
    ctx.fillStyle = '#FDEEF3';
    ctx.fill();

    drawFourPointStar(ctx, W / 2 - topLabelW / 2 - starGap - starR, topPillCenterY, starR, '#C2748B');
    drawFourPointStar(ctx, W / 2 + topLabelW / 2 + starGap + starR, topPillCenterY, starR, '#C2748B');
    ctx.fillStyle = '#C2748B';
    drawInkCenteredText(ctx, topLabel, W / 2, topPillCenterY);

    y += topPillH + 16;

    // 4. Circular Studio Avatar
    const avatarRadius = 32;
    await drawCircularAvatar(ctx, W / 2, y + avatarRadius + 2, avatarRadius, props.avatarUrl);
    y += 68 + 14;

    // 5. Studio Name + Playful Bio
    ctx.font = `700 21px ${FONT_STACK}`;
    ctx.fillStyle = '#3B2B31';
    drawInkCenteredText(ctx, studio, W / 2, y + 13);
    y += 26 + 6;

    ctx.font = `400 11.5px ${FONT_STACK}`;
    ctx.fillStyle = '#8B6E78';
    for (const line of bioLines) {
      drawInkCenteredText(ctx, line, W / 2, y + 8.5);
      y += 17;
    }

    y += 18;
    // Dashed Divider
    ctx.save();
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = '#F3DCE4';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(contentX, y);
    ctx.lineTo(contentX + contentW, y);
    ctx.stroke();
    ctx.restore();

    // 6. Main Packages Section
    if (mainLayouts.length > 0) {
      y += 18;
      const secPillH = 26;
      ctx.font = `600 11.5px ${FONT_STACK}`;
      const mainSecLabel = '主推妆造套餐';
      const mainSecLabelW = measureInkWidth(ctx, mainSecLabel);
      const sR = 3.5;
      const sGap = 5.5;
      const mainGroupW = sR * 2 + sGap + mainSecLabelW;
      const secPillW = Math.ceil(mainGroupW + 24);
      const secCenterY = y + secPillH / 2;

      const secGrad = ctx.createLinearGradient(contentX, y, contentX + secPillW, y);
      secGrad.addColorStop(0, '#FDEAF0');
      secGrad.addColorStop(1, '#FDF2EB');
      roundRectPath(ctx, contentX, y, secPillW, secPillH, 13);
      ctx.fillStyle = secGrad;
      ctx.fill();

      const groupStartX = contentX + (secPillW - mainGroupW) / 2;
      drawFourPointStar(ctx, groupStartX + sR, secCenterY, sR, '#B4657D');
      ctx.fillStyle = '#B4657D';
      drawInkCenteredText(ctx, mainSecLabel, groupStartX + sR * 2 + sGap + mainSecLabelW / 2, secCenterY);

      ctx.font = `500 10px ${FONT_STACK}`;
      ctx.fillStyle = '#BFA5AE';
      const sigText = 'SIGNATURE';
      const sigW = ctx.measureText(sigText).width;
      drawInkLeftText(ctx, sigText, contentX + contentW - sigW, secCenterY);

      y += secPillH + 12;

      for (let i = 0; i < mainLayouts.length; i++) {
        const { pkg, descLines, cardH: itemH } = mainLayouts[i];
        const cardGrad = ctx.createLinearGradient(contentX, y, contentX + contentW, y + itemH);
        cardGrad.addColorStop(0, '#FFF7FA');
        cardGrad.addColorStop(1, '#FFFDFB');
        roundRectPath(ctx, contentX, y, contentW, itemH, 18);
        ctx.fillStyle = cardGrad;
        ctx.fill();
        ctx.strokeStyle = '#F5E2E8';
        ctx.lineWidth = 1;
        ctx.stroke();

        // EXACT SAME HORIZONTAL CENTERLINE for Title, Duration Pill, and Price!
        const rowCenterY = y + 16 + 12;

        // Left: Package Name
        ctx.font = `700 15px ${FONT_STACK}`;
        ctx.fillStyle = '#3B2B31';
        drawInkLeftText(ctx, pkg.name, contentX + 14, rowCenterY);
        const nameW = ctx.measureText(pkg.name).width;

        // Middle: Duration Pill centered on exact same rowCenterY!
        if (pkg.defaultDurationMin > 0) {
          const durLabel = `约 ${formatDuration(pkg.defaultDurationMin)}`;
          ctx.font = `500 10.5px ${FONT_STACK}`;
          const durTextW = measureInkWidth(ctx, durLabel);
          const pillW = Math.ceil(durTextW + 18);
          const pillH = 21;
          const pillX = contentX + 14 + nameW + 8;
          const pillY = rowCenterY - pillH / 2;

          roundRectPath(ctx, pillX, pillY, pillW, pillH, 10.5);
          ctx.fillStyle = '#FFFFFF';
          ctx.fill();
          ctx.strokeStyle = '#F0DCE3';
          ctx.lineWidth = 1;
          ctx.stroke();

          ctx.fillStyle = '#A67584';
          drawInkCenteredText(ctx, durLabel, pillX + pillW / 2, rowCenterY);
        }

        // Right: Price aligned on exact same rowCenterY!
        const priceNumStr = String(pkg.price);
        ctx.font = `700 18px ${FONT_STACK}`;
        const numW = ctx.measureText(priceNumStr).width;
        ctx.font = `700 12.5px ${FONT_STACK}`;
        const yenW = ctx.measureText('¥').width;
        const priceRightX = contentX + contentW - 14;

        ctx.fillStyle = '#C76A86';
        ctx.font = `700 12.5px ${FONT_STACK}`;
        drawInkLeftText(ctx, '¥', priceRightX - numW - yenW - 1.5, rowCenterY + 1);
        ctx.font = `700 18px ${FONT_STACK}`;
        drawInkLeftText(ctx, priceNumStr, priceRightX - numW, rowCenterY);

        // Description lines
        if (descLines.length > 0) {
          let descY = y + 16 + 24 + 8;
          ctx.font = `400 11.5px ${FONT_STACK}`;
          ctx.fillStyle = '#7D646D';
          for (const dLine of descLines) {
            drawInkLeftText(ctx, dLine, contentX + 14, descY + 8.5);
            descY += 17;
          }
        }

        y += itemH + (i < mainLayouts.length - 1 ? 10 : 0);
      }
    }

    // 7. Extra Packages Section (2-Column Cards)
    if (extraRows.length > 0) {
      y += 18;
      const secPillH = 26;
      ctx.font = `600 11.5px ${FONT_STACK}`;
      const extraSecLabel = '贴心增项服务';
      const extraSecLabelW = measureInkWidth(ctx, extraSecLabel);
      const sR = 3.5;
      const sGap = 5.5;
      const extraGroupW = sR * 2 + sGap + extraSecLabelW;
      const secPillW = Math.ceil(extraGroupW + 24);
      const secCenterY = y + secPillH / 2;

      roundRectPath(ctx, contentX, y, secPillW, secPillH, 13);
      ctx.fillStyle = '#FAF2F5';
      ctx.fill();

      const groupStartX = contentX + (secPillW - extraGroupW) / 2;
      drawFourPointStar(ctx, groupStartX + sR, secCenterY, sR, '#9E6879');
      ctx.fillStyle = '#9E6879';
      drawInkCenteredText(ctx, extraSecLabel, groupStartX + sR * 2 + sGap + extraSecLabelW / 2, secCenterY);

      ctx.font = `500 10px ${FONT_STACK}`;
      ctx.fillStyle = '#BFA5AE';
      const addText = 'ADD-ONS';
      const addW = ctx.measureText(addText).width;
      drawInkLeftText(ctx, addText, contentX + contentW - addW, secCenterY);

      y += secPillH + 12;

      for (let i = 0; i < extraRows.length; i++) {
        const { left, right, rowH } = extraRows[i];
        const drawExtraCard = (item: any, x: number) => {
          roundRectPath(ctx, x, y, extraColW, rowH, 15);
          ctx.fillStyle = '#FCF7F9';
          ctx.fill();
          ctx.strokeStyle = '#F3E4E9';
          ctx.lineWidth = 1;
          ctx.stroke();

          let cy = y + 12;
          ctx.font = `600 12.5px ${FONT_STACK}`;
          ctx.fillStyle = '#3F2F35';
          for (const nl of item.nameLines) {
            drawInkLeftText(ctx, nl, x + 11, cy + 8.5);
            cy += 17;
          }
          cy += 6;
          ctx.font = `700 15px ${FONT_STACK}`;
          ctx.fillStyle = '#C4718A';
          drawInkLeftText(ctx, `¥${item.ep.price}`, x + 11, cy + 9);
          cy += 18;

          if (item.descLines.length > 0) {
            cy += 5;
            ctx.font = `400 10.5px ${FONT_STACK}`;
            ctx.fillStyle = '#9A818A';
            for (const dl of item.descLines) {
              drawInkLeftText(ctx, dl, x + 11, cy + 7.5);
              cy += 15;
            }
          }
        };

        drawExtraCard(left, contentX);
        if (right) drawExtraCard(right, contentX + extraColW + extraGap);
        y += rowH + (i < extraRows.length - 1 ? 10 : 0);
      }
    }

    // 8. Footer Dashed Line + Centered Footer Stamp
    y += 20;
    ctx.save();
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = '#F3DCE4';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(contentX, y);
    ctx.lineTo(contentX + contentW, y);
    ctx.stroke();
    ctx.restore();

    y += 16;
    const footerCenterY = y + footerContentH / 2;

    if (props.phone) {
      ctx.font = `600 11.5px ${FONT_STACK}`;
      ctx.fillStyle = '#B56E84';
      drawInkLeftText(ctx, '私信试妆 · 定金锁档', contentX, y + 8);
      ctx.font = `400 10.5px ${FONT_STACK}`;
      ctx.fillStyle = '#A68D96';
      drawInkLeftText(ctx, `预约咨询：${props.phone}`, contentX, y + 25);
    } else {
      ctx.font = `600 11.5px ${FONT_STACK}`;
      ctx.fillStyle = '#B56E84';
      drawInkLeftText(ctx, '私信试妆 · 定金锁档', contentX, footerCenterY);
    }

    // Footer Right Pill: 晴记 · 专属价目 (100% Symmetric Left/Right & Top/Bottom!)
    ctx.font = `600 10.5px ${FONT_STACK}`;
    const footLabel = '晴记 · 专属价目';
    const footLabelW = measureInkWidth(ctx, footLabel);
    const footPillW = Math.ceil(footLabelW + 24);
    const footPillH = 25;
    const footPillX = contentX + contentW - footPillW;
    const footPillY = footerCenterY - footPillH / 2;
    roundRectPath(ctx, footPillX, footPillY, footPillW, footPillH, 12.5);
    ctx.fillStyle = '#FDEEF3';
    ctx.fill();

    ctx.fillStyle = '#C2748B';
    drawInkCenteredText(ctx, footLabel, footPillX + footPillW / 2, footerCenterY);

    posterDataUrl.value = canvas.toDataURL('image/png');
  } catch (err) {
    console.error('Poster render error:', err);
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
