<template>
  <div
    class="flex flex-col items-center justify-center text-center select-none"
    :class="compact ? 'py-6 px-4' : 'py-10 px-6'"
  >
    <!-- Cute Pastel Kawaii Inline SVG Illustration (Matches QingJi soft blush & cream palette) -->
    <div
      class="relative flex items-center justify-center mb-3 cute-float"
      :class="compact ? 'w-[86px] h-[74px]' : 'w-[108px] h-[92px]'"
      aria-hidden="true"
    >
      <!-- Calendar / Free Day: Sleepy smiling blush cloud resting on a tiny calendar -->
      <svg v-if="variant === 'calendar'" viewBox="0 0 120 100" class="w-full h-full overflow-visible">
        <ellipse cx="60" cy="86" rx="34" ry="6" fill="#F4E2E8" opacity="0.65" />
        <!-- Tiny pastel calendar card -->
        <rect x="30" y="24" width="60" height="54" rx="16" fill="#FFF9FB" stroke="#EED6DF" stroke-width="2" />
        <path d="M30 40 C30 31.16 37.16 24 46 24 H74 C82.84 24 90 31.16 90 40 V42 H30 Z" fill="#F8E2EA" />
        <!-- Calendar rings -->
        <rect x="44" y="17" width="6" height="12" rx="3" fill="#E3AEBC" />
        <rect x="70" y="17" width="6" height="12" rx="3" fill="#E3AEBC" />
        <!-- Cute kawaii face -->
        <path d="M47 57 Q50 53 53 57" fill="none" stroke="#5A464D" stroke-width="2.2" stroke-linecap="round" />
        <path d="M67 57 Q70 53 73 57" fill="none" stroke="#5A464D" stroke-width="2.2" stroke-linecap="round" />
        <ellipse cx="43.5" cy="61.5" rx="3.8" ry="2.2" fill="#F4B8C8" opacity="0.7" />
        <ellipse cx="76.5" cy="61.5" rx="3.8" ry="2.2" fill="#F4B8C8" opacity="0.7" />
        <path d="M56.5 61.5 Q60 65.5 63.5 61.5" fill="none" stroke="#5A464D" stroke-width="2" stroke-linecap="round" />
        <!-- Little floating sparkles & heart -->
        <path d="M18 34 L20 29 L22 34 L27 36 L22 38 L20 43 L18 38 L13 36 Z" fill="#E9B5C3" />
        <circle cx="99" cy="30" r="3.2" fill="#F6D5C4" />
        <circle cx="104" cy="44" r="2" fill="#E8B8C7" />
      </svg>

      <!-- Finance / Ledger: Cute smiling pastel ledger notebook with tiny coin -->
      <svg v-else-if="variant === 'finance'" viewBox="0 0 120 100" class="w-full h-full overflow-visible">
        <ellipse cx="60" cy="86" rx="34" ry="6" fill="#F4E2E8" opacity="0.65" />
        <!-- Cute notebook body -->
        <rect x="33" y="20" width="54" height="60" rx="15" fill="#FFF9FB" stroke="#EED6DF" stroke-width="2" />
        <rect x="33" y="20" width="12" height="60" rx="6" fill="#F8E2EA" />
        <!-- Cute ribbon bookmark -->
        <path d="M72 20 V34 L76.5 30.5 L81 34 V20 Z" fill="#E4AEBC" />
        <!-- Cute face -->
        <circle cx="55" cy="51" r="2.3" fill="#5A464D" />
        <circle cx="71" cy="51" r="2.3" fill="#5A464D" />
        <ellipse cx="50.5" cy="55.5" rx="3.5" ry="2" fill="#F4B8C8" opacity="0.75" />
        <ellipse cx="75.5" cy="55.5" rx="3.5" ry="2" fill="#F4B8C8" opacity="0.75" />
        <path d="M60 55.5 Q63 58.8 66 55.5" fill="none" stroke="#5A464D" stroke-width="2" stroke-linecap="round" />
        <!-- Floating champagne coin -->
        <circle cx="96" cy="34" r="9.5" fill="#FCECDD" stroke="#EBCDB7" stroke-width="1.8" />
        <text x="96" y="38" text-anchor="middle" font-size="10" font-weight="600" fill="#BA8E74">¥</text>
        <path d="M21 44 L22.6 40 L24.2 44 L28 45.6 L24.2 47.2 L22.6 51 L21 47.2 L17 45.6 Z" fill="#E9B5C3" />
      </svg>

      <!-- Recycle Bin: Cute tidy smiling pastel bin with sparkles -->
      <svg v-else-if="variant === 'recycle'" viewBox="0 0 120 100" class="w-full h-full overflow-visible">
        <ellipse cx="60" cy="86" rx="32" ry="6" fill="#F4E2E8" opacity="0.65" />
        <!-- Floating lifted lid -->
        <g transform="rotate(-8 60 28)">
          <rect x="34" y="24" width="52" height="9" rx="4.5" fill="#F8E1E9" stroke="#E8CAD4" stroke-width="1.8" />
          <rect x="52" y="18" width="16" height="6" rx="3" fill="#E6B3C1" />
        </g>
        <!-- Cute rounded bin body -->
        <path d="M38 36 H82 L78 75 C77.5 79.5 73.8 82 69.3 82 H50.7 C46.2 82 42.5 79.5 42 75 Z" fill="#FFF9FB" stroke="#EED6DF" stroke-width="2" />
        <!-- Happy closed eyes -->
        <path d="M49 56 Q52 52.5 55 56" fill="none" stroke="#5A464D" stroke-width="2.1" stroke-linecap="round" />
        <path d="M65 56 Q68 52.5 71 56" fill="none" stroke="#5A464D" stroke-width="2.1" stroke-linecap="round" />
        <ellipse cx="46.5" cy="60.5" rx="3.5" ry="2" fill="#F4B8C8" opacity="0.7" />
        <ellipse cx="73.5" cy="60.5" rx="3.5" ry="2" fill="#F4B8C8" opacity="0.7" />
        <path d="M57 60.5 Q60 64 63 60.5" fill="none" stroke="#5A464D" stroke-width="2" stroke-linecap="round" />
        <!-- Clean sparkles -->
        <path d="M94 26 L96 20 L98 26 L104 28 L98 30 L96 36 L94 30 L88 28 Z" fill="#E8B4C2" />
        <path d="M23 48 L24.5 44 L26 48 L30 49.5 L26 51 L24.5 55 L23 51 L19 49.5 Z" fill="#F2CEB8" />
        <circle cx="96" cy="52" r="2.8" fill="#E8D8EE" />
      </svg>

      <!-- Clients / Packages / Sessions / Orders: Cute smiling pastel vanity compact puff -->
      <svg v-else viewBox="0 0 120 100" class="w-full h-full overflow-visible">
        <ellipse cx="60" cy="86" rx="34" ry="6" fill="#F4E2E8" opacity="0.65" />
        <!-- Cute plush cloud / powder puff character -->
        <path
          d="M36 74 C27 74 21 67.5 21 59 C21 51.5 26.2 45.4 33.2 44.3 C35.8 31.8 46.8 23 60 23 C73.2 23 84.2 31.8 86.8 44.3 C93.8 45.4 99 51.5 99 59 C99 67.5 93 74 84 74 Z"
          fill="#FFF9FB"
          stroke="#EED6DF"
          stroke-width="2"
        />
        <!-- Little bow on top -->
        <ellipse cx="55.5" cy="24" rx="5.5" ry="3.4" transform="rotate(-14 55.5 24)" fill="#F3CBD6" />
        <ellipse cx="64.5" cy="24" rx="5.5" ry="3.4" transform="rotate(14 64.5 24)" fill="#F3CBD6" />
        <circle cx="60" cy="24.5" r="2.6" fill="#DF9FB0" />
        <!-- Cute kawaii face -->
        <circle cx="49" cy="52" r="2.5" fill="#5A464D" />
        <circle cx="71" cy="52" r="2.5" fill="#5A464D" />
        <circle cx="48.2" cy="51.2" r="0.8" fill="#FFFFFF" />
        <circle cx="70.2" cy="51.2" r="0.8" fill="#FFFFFF" />
        <ellipse cx="43.5" cy="57" rx="4" ry="2.2" fill="#F4B8C8" opacity="0.72" />
        <ellipse cx="76.5" cy="57" rx="4" ry="2.2" fill="#F4B8C8" opacity="0.72" />
        <path d="M56.5 57 Q60 61 63.5 57" fill="none" stroke="#5A464D" stroke-width="2" stroke-linecap="round" />
        <!-- Sparkles -->
        <path d="M20 31 L21.8 26.5 L23.6 31 L28 32.8 L23.6 34.6 L21.8 39 L20 34.6 L15.5 32.8 Z" fill="#E9B5C3" />
        <circle cx="98" cy="34" r="3" fill="#F6D5C4" />
      </svg>
    </div>

    <p class="text-[14px] font-semibold text-ink">{{ title }}</p>
    <p v-if="description" class="text-[12px] text-ink-muted mt-1 leading-relaxed max-w-[230px]">
      {{ description }}
    </p>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    variant?: 'calendar' | 'orders' | 'finance' | 'recycle' | 'clients' | 'packages' | 'sessions';
    title: string;
    description?: string;
    compact?: boolean;
  }>(),
  {
    variant: 'orders',
    description: '',
    compact: false,
  }
);
</script>

<style scoped>
.cute-float {
  animation: cuteBob 4.2s ease-in-out infinite alternate;
}

@keyframes cuteBob {
  0% {
    transform: translate3d(0, 0, 0);
  }
  100% {
    transform: translate3d(0, -4px, 0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .cute-float {
    animation: none;
  }
}
</style>
