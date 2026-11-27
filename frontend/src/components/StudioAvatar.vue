<template>
  <div
    class="relative overflow-hidden flex items-center justify-center shrink-0 select-none"
    :class="roundedClass"
    :style="{ width: `${size}px`, height: `${size}px`, background: bgStyle }"
  >
    <!-- Custom Uploaded Image -->
    <img
      v-if="isImageUrl"
      :src="src || ''"
      alt="头像"
      class="w-full h-full object-cover"
    />

    <!-- Preset 1: Pastel Ribbon Bow -->
    <svg v-else-if="src === 'preset:ribbon'" viewBox="0 0 64 64" class="w-[74%] h-[74%]" fill="none">
      <circle cx="32" cy="32" r="26" fill="#FFF7F9" />
      <path d="M32 31C26 23 14 20 13 29C12 37 23 38 32 33Z" fill="#F2B8C6" stroke="#C9869A" stroke-width="2" stroke-linejoin="round" />
      <path d="M32 31C38 23 50 20 51 29C52 37 41 38 32 33Z" fill="#F6C8D3" stroke="#C9869A" stroke-width="2" stroke-linejoin="round" />
      <path d="M29 34L22 47L28 44L31 48L32 35" fill="#F7D7DF" stroke="#C9869A" stroke-width="1.8" stroke-linejoin="round" />
      <path d="M35 34L42 47L36 44L33 48L32 35" fill="#F2C0CD" stroke="#C9869A" stroke-width="1.8" stroke-linejoin="round" />
      <circle cx="32" cy="32" r="4.5" fill="#FFFDFD" stroke="#C9869A" stroke-width="2" />
      <circle cx="17" cy="18" r="1.8" fill="#E3A8B8" />
      <circle cx="48" cy="19" r="1.4" fill="#E5C09D" />
    </svg>

    <!-- Preset 2: Bridal Pearl Crown -->
    <svg v-else-if="src === 'preset:crown'" viewBox="0 0 64 64" class="w-[74%] h-[74%]" fill="none">
      <circle cx="32" cy="32" r="26" fill="#FFF9F4" />
      <path d="M16 42L19 25L27 33L32 21L37 33L45 25L48 42H16Z" fill="#F8DFC8" stroke="#C79678" stroke-width="2" stroke-linejoin="round" />
      <rect x="16" y="42" width="32" height="5" rx="2.5" fill="#F2C6D2" stroke="#C79678" stroke-width="1.8" />
      <circle cx="32" cy="18.5" r="2.6" fill="#FFFFFF" stroke="#C79678" stroke-width="1.6" />
      <circle cx="19" cy="22.5" r="2" fill="#FFFFFF" stroke="#C79678" stroke-width="1.5" />
      <circle cx="45" cy="22.5" r="2" fill="#FFFFFF" stroke="#C79678" stroke-width="1.5" />
      <circle cx="32" cy="35" r="2.2" fill="#E49EB2" />
    </svg>

    <!-- Preset 3: Soft Tulip Blossom -->
    <svg v-else-if="src === 'preset:tulip'" viewBox="0 0 64 64" class="w-[74%] h-[74%]" fill="none">
      <circle cx="32" cy="32" r="26" fill="#FFF7FA" />
      <path d="M32 37V49" stroke="#99B09A" stroke-width="2.4" stroke-linecap="round" />
      <path d="M32 45C25 45 21 41 21 37C26 37 30 40 32 45Z" fill="#D2E3D2" stroke="#8CA68D" stroke-width="1.6" stroke-linejoin="round" />
      <path d="M32 46C39 46 43 42 43 38C38 38 34 41 32 46Z" fill="#C4DAC5" stroke="#8CA68D" stroke-width="1.6" stroke-linejoin="round" />
      <path d="M22 28C22 20 28 17 32 22C36 17 42 20 42 28C42 35 37 38 32 38C27 38 22 35 22 28Z" fill="#F5C3D0" stroke="#C68497" stroke-width="2" stroke-linejoin="round" />
      <path d="M27 24C29 20 35 20 37 24" stroke="#FFF8FA" stroke-width="1.8" stroke-linecap="round" />
    </svg>

    <!-- Preset 4: Blush Butterfly -->
    <svg v-else-if="src === 'preset:butterfly'" viewBox="0 0 64 64" class="w-[74%] h-[74%]" fill="none">
      <circle cx="32" cy="32" r="26" fill="#FAF6FC" />
      <path d="M31 32C24 20 13 18 14 29C15 35 23 36 31 33Z" fill="#EBC5D8" stroke="#B6809A" stroke-width="1.9" stroke-linejoin="round" />
      <path d="M33 32C40 20 51 18 50 29C49 35 41 36 33 33Z" fill="#F2D2E1" stroke="#B6809A" stroke-width="1.9" stroke-linejoin="round" />
      <path d="M31 34C24 35 17 40 20 45C23 49 29 44 31 37Z" fill="#F6DFE9" stroke="#B6809A" stroke-width="1.8" stroke-linejoin="round" />
      <path d="M33 34C40 35 47 40 44 45C41 49 35 44 33 37Z" fill="#F6DFE9" stroke="#B6809A" stroke-width="1.8" stroke-linejoin="round" />
      <rect x="30.5" y="25" width="3" height="15" rx="1.5" fill="#B6809A" />
      <path d="M31 25C29 21 27 20 26 20" stroke="#B6809A" stroke-width="1.5" stroke-linecap="round" />
      <path d="M33 25C35 21 37 20 38 20" stroke="#B6809A" stroke-width="1.5" stroke-linecap="round" />
    </svg>

    <!-- Default Studio Emblem -->
    <IconTabStudio v-else :size="Math.round(size * 0.44)" class="text-white" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { IconTabStudio } from '@/components/icons/BeautyIcons';

const props = withDefaults(
  defineProps<{
    src?: string | null;
    size?: number;
    roundedClass?: string;
  }>(),
  {
    src: null,
    size: 60,
    roundedClass: 'rounded-[20px]',
  }
);

const isImageUrl = computed(() => {
  const s = props.src || '';
  return s.startsWith('/') || s.startsWith('http://') || s.startsWith('https://') || s.startsWith('data:');
});

const bgStyle = computed(() => {
  if (isImageUrl.value) return '#FAF0F3';
  if (props.src === 'preset:ribbon') return 'linear-gradient(145deg, #FCEBF0 0%, #F7DCE5 100%)';
  if (props.src === 'preset:crown') return 'linear-gradient(145deg, #FCF3EA 0%, #F6E3D7 100%)';
  if (props.src === 'preset:tulip') return 'linear-gradient(145deg, #FBF0F4 0%, #F3E5EC 100%)';
  if (props.src === 'preset:butterfly') return 'linear-gradient(145deg, #F6EFFA 0%, #EFE2F2 100%)';
  return 'linear-gradient(145deg, #E2AAB9 0%, #CC8C9F 100%)';
});
</script>
