import { computed, ref } from 'vue';

export function useScrollHeader(threshold = 48) {
  const scrollTop = ref(0);

  function onPaneScroll(e: Event) {
    const el = e.target as HTMLElement;
    scrollTop.value = Math.max(0, el.scrollTop || 0);
  }

  const headerStyle = computed(() => {
    const progress = Math.min(1, scrollTop.value / threshold);
    if (progress <= 0.01) {
      return {
        backgroundColor: 'rgba(251, 240, 243, 0)',
        borderBottom: '1px solid rgba(220, 153, 170, 0)',
      };
    }
    return {
      backgroundColor: `rgba(251, 240, 243, ${progress.toFixed(3)})`,
      borderBottom: `1px solid rgba(220, 153, 170, ${(progress * 0.12).toFixed(3)})`,
    };
  });

  return {
    scrollTop,
    onPaneScroll,
    headerStyle,
  };
}
