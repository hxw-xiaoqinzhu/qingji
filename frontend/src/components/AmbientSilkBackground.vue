<template>
  <div class="ambient-silk-stage" aria-hidden="true">
    <!-- Layer 1: Sweeping Elliptical Pastel Aurora Ribbons (360° orbital + rotational flow) -->
    <span class="silk-ribbon ribbon-rose" />
    <span class="silk-ribbon ribbon-apricot" />
    <span class="silk-ribbon ribbon-lilac" />
    <span class="silk-ribbon ribbon-mintpearl" />
    <span class="silk-ribbon ribbon-sunbeam" />

    <!-- Layer 2: Gently Morphing & Drifting Liquid Glass Light Rings -->
    <span class="liquid-ring ring-top" />
    <span class="liquid-ring ring-mid" />
    <span class="liquid-ring ring-bottom" />

    <!-- Layer 3: Floating Sunlit Pearl Bokeh Bubbles ("晴记" Morning Light Motes) -->
    <span class="bokeh-orb bokeh-1" />
    <span class="bokeh-orb bokeh-2" />
    <span class="bokeh-orb bokeh-3" />
    <span class="bokeh-orb bokeh-4" />
    <span class="bokeh-orb bokeh-5" />
    <span class="bokeh-orb bokeh-6" />
    <span class="bokeh-orb bokeh-7" />
  </div>
</template>

<style scoped>
.ambient-silk-stage {
  position: absolute;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
  background: linear-gradient(165deg, #FDF5F8 0%, #FCF8FA 48%, #FDF7F3 100%);
  contain: strict;
}

/* =========================================================================
   Layer 1: Elongated Elliptical Silk Ribbons (High-visibility smooth flow)
   ========================================================================= */
.silk-ribbon {
  position: absolute;
  border-radius: 50%;
  will-change: transform;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}

/* Soft Peony Rose Ribbon */
.ribbon-rose {
  width: 480px;
  height: 250px;
  top: -60px;
  left: -140px;
  background: radial-gradient(
    ellipse at center,
    rgba(242, 182, 203, 0.68) 0%,
    rgba(246, 204, 219, 0.36) 45%,
    rgba(246, 204, 219, 0) 74%
  );
  animation: sweepRose 20s cubic-bezier(0.42, 0, 0.58, 1) infinite;
}

/* Warm Sunlit Champagne-Apricot Ribbon */
.ribbon-apricot {
  width: 460px;
  height: 230px;
  top: 12%;
  right: -150px;
  background: radial-gradient(
    ellipse at center,
    rgba(250, 206, 176, 0.66) 0%,
    rgba(252, 224, 203, 0.34) 46%,
    rgba(252, 224, 203, 0) 74%
  );
  animation: sweepApricot 24s cubic-bezier(0.42, 0, 0.58, 1) infinite;
}

/* Misty Lavender-Iris Ribbon */
.ribbon-lilac {
  width: 450px;
  height: 240px;
  top: 44%;
  left: -140px;
  background: radial-gradient(
    ellipse at center,
    rgba(217, 196, 240, 0.60) 0%,
    rgba(231, 216, 246, 0.30) 46%,
    rgba(231, 216, 246, 0) 74%
  );
  animation: sweepLilac 22s cubic-bezier(0.42, 0, 0.58, 1) infinite;
}

/* Bottom Rosewater-Peach Cloud */
.ribbon-mintpearl {
  width: 470px;
  height: 250px;
  bottom: -65px;
  right: -120px;
  background: radial-gradient(
    ellipse at center,
    rgba(244, 190, 210, 0.62) 0%,
    rgba(250, 218, 228, 0.30) 46%,
    rgba(250, 218, 228, 0) 74%
  );
  animation: sweepBottom 21s cubic-bezier(0.42, 0, 0.58, 1) infinite;
}

/* Bright Pure-White Sunbeam Shaft cutting across the pastels */
.ribbon-sunbeam {
  width: 560px;
  height: 150px;
  top: 24%;
  left: -90px;
  background: radial-gradient(
    ellipse at center,
    rgba(255, 255, 255, 0.92) 0%,
    rgba(255, 255, 255, 0.48) 45%,
    rgba(255, 255, 255, 0) 75%
  );
  animation: sweepSunbeam 17s ease-in-out infinite alternate;
}

/* =========================================================================
   Layer 2: Translucent Liquid Glass Halo Rings (Visible organic movement)
   ========================================================================= */
.liquid-ring {
  position: absolute;
  border-radius: 50%;
  border: 1.5px solid rgba(255, 255, 255, 0.68);
  background: radial-gradient(
    circle at 32% 30%,
    rgba(255, 255, 255, 0.46) 0%,
    rgba(252, 232, 239, 0.14) 55%,
    rgba(255, 255, 255, 0) 100%
  );
  box-shadow: inset 0 1px 8px rgba(255, 255, 255, 0.65);
  will-change: transform, opacity;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}

.ring-top {
  width: 230px;
  height: 230px;
  top: 5%;
  right: -45px;
  animation: floatRingA 18s ease-in-out infinite alternate;
}

.ring-mid {
  width: 185px;
  height: 185px;
  top: 48%;
  left: -50px;
  animation: floatRingB 21s ease-in-out infinite alternate;
}

.ring-bottom {
  width: 250px;
  height: 250px;
  bottom: 4%;
  right: 8%;
  animation: floatRingC 23s ease-in-out infinite alternate;
}

/* =========================================================================
   Layer 3: Floating Dewy Pearl Bokeh Bubbles (Immediate visual motion cues)
   ========================================================================= */
.bokeh-orb {
  position: absolute;
  border-radius: 9999px;
  border: 1px solid rgba(255, 255, 255, 0.78);
  background: radial-gradient(
    circle at 32% 32%,
    rgba(255, 255, 255, 0.92) 0%,
    rgba(252, 226, 235, 0.48) 54%,
    rgba(244, 202, 218, 0.12) 100%
  );
  box-shadow: 0 4px 16px rgba(214, 152, 172, 0.10);
  will-change: transform, opacity;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}

.bokeh-1 {
  width: 58px;
  height: 58px;
  top: 14%;
  left: 12%;
  animation: bokehGlide1 15s ease-in-out infinite alternate;
}

.bokeh-2 {
  width: 38px;
  height: 38px;
  top: 22%;
  right: 16%;
  background: radial-gradient(
    circle at 32% 32%,
    rgba(255, 255, 255, 0.94) 0%,
    rgba(253, 228, 210, 0.52) 56%,
    rgba(250, 212, 186, 0.12) 100%
  );
  animation: bokehGlide2 13.5s ease-in-out infinite alternate;
}

.bokeh-3 {
  width: 72px;
  height: 72px;
  top: 36%;
  right: 8%;
  background: radial-gradient(
    circle at 32% 32%,
    rgba(255, 255, 255, 0.88) 0%,
    rgba(235, 220, 246, 0.46) 56%,
    rgba(222, 204, 240, 0.10) 100%
  );
  animation: bokehGlide3 17s ease-in-out infinite alternate;
}

.bokeh-4 {
  width: 44px;
  height: 44px;
  top: 64%;
  left: 14%;
  animation: bokehGlide2 14.5s ease-in-out -4s infinite alternate;
}

.bokeh-5 {
  width: 64px;
  height: 64px;
  bottom: 16%;
  left: 56%;
  background: radial-gradient(
    circle at 32% 32%,
    rgba(255, 255, 255, 0.90) 0%,
    rgba(252, 228, 214, 0.48) 56%,
    rgba(248, 212, 194, 0.10) 100%
  );
  animation: bokehGlide1 16.5s ease-in-out -6s infinite alternate;
}

.bokeh-6 {
  width: 30px;
  height: 30px;
  top: 8%;
  left: 58%;
  animation: bokehGlide3 12.5s ease-in-out -3s infinite alternate;
}

.bokeh-7 {
  width: 48px;
  height: 48px;
  bottom: 24%;
  right: 18%;
  animation: bokehGlide1 15.5s ease-in-out -8s infinite alternate;
}

/* =========================================================================
   GPU-Composited Keyframes (Pure translate3d + rotate + scale + opacity)
   ========================================================================= */
@keyframes sweepRose {
  0% {
    transform: translate3d(0, 0, 0) rotate(-18deg) scale(1);
  }
  33% {
    transform: translate3d(165px, 95px, 0) rotate(22deg) scale(1.16);
  }
  66% {
    transform: translate3d(75px, 210px, 0) rotate(-8deg) scale(0.95);
  }
  100% {
    transform: translate3d(0, 0, 0) rotate(-18deg) scale(1);
  }
}

@keyframes sweepApricot {
  0% {
    transform: translate3d(0, 0, 0) rotate(24deg) scale(1.05);
  }
  35% {
    transform: translate3d(-180px, 115px, 0) rotate(-22deg) scale(1.18);
  }
  70% {
    transform: translate3d(-90px, 240px, 0) rotate(12deg) scale(0.96);
  }
  100% {
    transform: translate3d(0, 0, 0) rotate(24deg) scale(1.05);
  }
}

@keyframes sweepLilac {
  0% {
    transform: translate3d(0, 0, 0) rotate(15deg) scale(1);
  }
  40% {
    transform: translate3d(190px, -110px, 0) rotate(-28deg) scale(1.18);
  }
  75% {
    transform: translate3d(120px, 95px, 0) rotate(8deg) scale(1.04);
  }
  100% {
    transform: translate3d(0, 0, 0) rotate(15deg) scale(1);
  }
}

@keyframes sweepBottom {
  0% {
    transform: translate3d(0, 0, 0) rotate(-20deg) scale(1);
  }
  45% {
    transform: translate3d(-175px, -135px, 0) rotate(24deg) scale(1.16);
  }
  80% {
    transform: translate3d(-65px, -210px, 0) rotate(-6deg) scale(0.98);
  }
  100% {
    transform: translate3d(0, 0, 0) rotate(-20deg) scale(1);
  }
}

@keyframes sweepSunbeam {
  0% {
    transform: translate3d(-60px, -70px, 0) rotate(-28deg) scaleY(0.9);
    opacity: 0.65;
  }
  50% {
    transform: translate3d(85px, 95px, 0) rotate(-14deg) scaleY(1.25);
    opacity: 0.95;
  }
  100% {
    transform: translate3d(-20px, 230px, 0) rotate(-32deg) scaleY(1);
    opacity: 0.72;
  }
}

@keyframes floatRingA {
  0% {
    transform: translate3d(0, 0, 0) scale(0.92) rotate(0deg);
    opacity: 0.55;
  }
  100% {
    transform: translate3d(-95px, 85px, 0) scale(1.16) rotate(25deg);
    opacity: 0.88;
  }
}

@keyframes floatRingB {
  0% {
    transform: translate3d(0, 0, 0) scale(0.95) rotate(0deg);
    opacity: 0.50;
  }
  100% {
    transform: translate3d(110px, -75px, 0) scale(1.18) rotate(-28deg);
    opacity: 0.85;
  }
}

@keyframes floatRingC {
  0% {
    transform: translate3d(0, 0, 0) scale(1) rotate(0deg);
    opacity: 0.48;
  }
  100% {
    transform: translate3d(-85px, -95px, 0) scale(1.15) rotate(22deg);
    opacity: 0.82;
  }
}

@keyframes bokehGlide1 {
  0% {
    transform: translate3d(0, 0, 0) scale(0.92);
    opacity: 0.52;
  }
  50% {
    transform: translate3d(42px, -38px, 0) scale(1.08);
    opacity: 0.90;
  }
  100% {
    transform: translate3d(-26px, -76px, 0) scale(0.96);
    opacity: 0.64;
  }
}

@keyframes bokehGlide2 {
  0% {
    transform: translate3d(0, 0, 0) scale(0.94);
    opacity: 0.56;
  }
  50% {
    transform: translate3d(-46px, 36px, 0) scale(1.12);
    opacity: 0.92;
  }
  100% {
    transform: translate3d(28px, 74px, 0) scale(0.98);
    opacity: 0.62;
  }
}

@keyframes bokehGlide3 {
  0% {
    transform: translate3d(0, 0, 0) scale(0.90);
    opacity: 0.48;
  }
  50% {
    transform: translate3d(-54px, -44px, 0) scale(1.10);
    opacity: 0.88;
  }
  100% {
    transform: translate3d(-18px, 52px, 0) scale(0.95);
    opacity: 0.58;
  }
}

@media (prefers-reduced-motion: reduce) {
  .silk-ribbon,
  .liquid-ring,
  .bokeh-orb {
    animation: none !important;
  }
}
</style>
