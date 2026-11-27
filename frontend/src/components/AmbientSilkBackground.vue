<template>
  <div class="ambient-silk-stage" :class="{ 'is-paused': paused }" aria-hidden="true">
    <!-- Static Multi-Layered Pastel Aurora Base (Zero per-frame GPU cost) -->
    <div class="silk-static-base" />

    <!-- Only 2 Lightweight Pure-Translate3d Pastel Clouds (No rotate/scale -> zero re-rasterization!) -->
    <span class="silk-cloud cloud-rose" />
    <span class="silk-cloud cloud-apricot" />

    <!-- 4 Crisp Lightweight Glass Bubbles (Pure translate3d, zero box-shadow -> silky 60/120fps forever) -->
    <span class="silk-bubble b1" />
    <span class="silk-bubble b2" />
    <span class="silk-bubble b3" />
    <span class="silk-bubble b4" />
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';

const paused = ref(false);

function onVisibilityChange() {
  paused.value = document.visibilityState === 'hidden';
}

onMounted(() => {
  paused.value = document.visibilityState === 'hidden';
  document.addEventListener('visibilitychange', onVisibilityChange);
});

onBeforeUnmount(() => {
  document.removeEventListener('visibilitychange', onVisibilityChange);
});
</script>

<style scoped>
.ambient-silk-stage {
  position: absolute;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
  contain: strict;
  isolation: isolate;
  transform: translateZ(0);
}

.ambient-silk-stage.is-paused * {
  animation-play-state: paused !important;
}

/* Rich Multi-Stop Static Pastel Base (Replaces 3 heavy animated ribbons with zero GPU overhead) */
.silk-static-base {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse 80% 45% at 15% 10%, rgba(244, 194, 212, 0.42) 0%, rgba(244, 194, 212, 0) 70%),
    radial-gradient(ellipse 75% 42% at 88% 24%, rgba(250, 212, 188, 0.36) 0%, rgba(250, 212, 188, 0) 70%),
    radial-gradient(ellipse 70% 45% at 20% 72%, rgba(224, 206, 244, 0.28) 0%, rgba(224, 206, 244, 0) 70%),
    radial-gradient(ellipse 80% 46% at 82% 88%, rgba(245, 200, 216, 0.34) 0%, rgba(245, 200, 216, 0) 70%),
    linear-gradient(165deg, #FDF5F8 0%, #FCF8FA 48%, #FDF7F3 100%);
}

/* Compact Pure-Translate3d Ambient Clouds (No rotate/scale -> stays 100% cached in GPU VRAM) */
.silk-cloud {
  position: absolute;
  border-radius: 50%;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}

.cloud-rose {
  width: 300px;
  height: 220px;
  top: -40px;
  left: -60px;
  background: radial-gradient(
    ellipse at center,
    rgba(244, 188, 208, 0.44) 0%,
    rgba(248, 212, 224, 0.18) 48%,
    rgba(248, 212, 224, 0) 74%
  );
  animation: cloudDriftA 22s ease-in-out infinite alternate;
}

.cloud-apricot {
  width: 280px;
  height: 210px;
  bottom: 6%;
  right: -60px;
  background: radial-gradient(
    ellipse at center,
    rgba(250, 210, 186, 0.40) 0%,
    rgba(252, 226, 208, 0.16) 48%,
    rgba(252, 226, 208, 0) 74%
  );
  animation: cloudDriftB 26s ease-in-out infinite alternate;
}

/* Ultra-Light Glass Bubbles (Zero box-shadow, pure translate3d) */
.silk-bubble {
  position: absolute;
  border-radius: 9999px;
  border: 1px solid rgba(255, 255, 255, 0.72);
  background: radial-gradient(
    circle at 32% 30%,
    rgba(255, 255, 255, 0.86) 0%,
    rgba(252, 228, 236, 0.36) 58%,
    rgba(244, 206, 220, 0.08) 100%
  );
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}

.silk-bubble.b1 {
  width: 56px;
  height: 56px;
  top: 13%;
  left: 10%;
  animation: bubbleFloatA 16s ease-in-out infinite alternate;
}

.silk-bubble.b2 {
  width: 36px;
  height: 36px;
  top: 22%;
  right: 14%;
  animation: bubbleFloatB 14s ease-in-out infinite alternate;
}

.silk-bubble.b3 {
  width: 64px;
  height: 64px;
  top: 46%;
  right: 8%;
  animation: bubbleFloatA 19s ease-in-out -5s infinite alternate;
}

.silk-bubble.b4 {
  width: 44px;
  height: 44px;
  bottom: 18%;
  left: 14%;
  animation: bubbleFloatB 17s ease-in-out -3s infinite alternate;
}

@keyframes cloudDriftA {
  0% {
    transform: translate3d(0, 0, 0);
  }
  100% {
    transform: translate3d(90px, 65px, 0);
  }
}

@keyframes cloudDriftB {
  0% {
    transform: translate3d(0, 0, 0);
  }
  100% {
    transform: translate3d(-85px, -70px, 0);
  }
}

@keyframes bubbleFloatA {
  0% {
    transform: translate3d(0, 0, 0);
  }
  100% {
    transform: translate3d(24px, -32px, 0);
  }
}

@keyframes bubbleFloatB {
  0% {
    transform: translate3d(0, 0, 0);
  }
  100% {
    transform: translate3d(-22px, 28px, 0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .silk-cloud,
  .silk-bubble {
    animation: none;
  }
}
</style>
