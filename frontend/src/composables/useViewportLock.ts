import { onBeforeUnmount, onMounted } from 'vue';

function isTextInput(el: Element | null): el is HTMLElement {
  if (!el || !(el instanceof HTMLElement)) return false;
  const tag = el.tagName;
  if (tag === 'TEXTAREA') return true;
  if (tag === 'INPUT') {
    const type = ((el as HTMLInputElement).type || 'text').toLowerCase();
    return !['checkbox', 'radio', 'button', 'submit', 'reset', 'file', 'range', 'color', 'date', 'time'].includes(type);
  }
  return el.isContentEditable;
}

/**
 * Keyboard-immune full-screen viewport lock:
 * - In iOS Standalone Home-Screen PWA (`display-mode: standalone`): uses `100vh` (exact physical
 *   screen height, never 34px short like `window.innerHeight` / `fixed bottom:0` on `html`, and
 *   never 44px too tall like `100lvh`, AND naturally immune to soft-keyboard shrink!).
 * - In Safari / WeChat / Android browsers: locks `--app-height` to pre-keyboard `window.innerHeight`
 *   in pixels so `#app` never shrinks or exposes a gap when the virtual keyboard opens.
 */
export function useViewportLock() {
  let lockedHeight = 0;
  let lastWidth = 0;
  let settleTimer: ReturnType<typeof setTimeout> | null = null;

  function isStandalone(): boolean {
    return (
      (typeof window.matchMedia === 'function' && window.matchMedia('(display-mode: standalone)').matches) ||
      (window.navigator as any).standalone === true
    );
  }

  function applyAppHeight(h: number) {
    if (isStandalone()) {
      lockedHeight = Math.max(h, window.screen.height);
      document.documentElement.style.setProperty('--app-height', '100vh');
      return;
    }
    if (h > 200) {
      lockedHeight = h;
      document.documentElement.style.setProperty('--app-height', `${Math.round(h)}px`);
    }
  }

  function pinWindowTop() {
    if (window.scrollY !== 0 || window.scrollX !== 0) {
      window.scrollTo(0, 0);
    }
    if (document.documentElement.scrollTop !== 0) {
      document.documentElement.scrollTop = 0;
    }
    if (document.body.scrollTop !== 0) {
      document.body.scrollTop = 0;
    }
  }

  function ensureActiveInputVisible(kbHeight: number) {
    const active = document.activeElement;
    if (!isTextInput(active)) return;

    const vv = window.visualViewport;
    const visibleBottom = vv ? vv.height : lockedHeight - kbHeight;
    const rect = active.getBoundingClientRect();

    if (rect.bottom > visibleBottom - 20) {
      const scrollContainer = active.closest('.van-popup, .scroll-pane') as HTMLElement | null;
      if (scrollContainer) {
        const delta = rect.bottom - (visibleBottom - 36);
        scrollContainer.scrollBy({ top: delta, behavior: 'smooth' });
      }
    }
  }

  function syncViewport() {
    pinWindowTop();

    const w = window.innerWidth;
    const innerH = window.innerHeight;
    const vv = window.visualViewport;
    const vvH = vv ? vv.height : innerH;
    const inputFocused = isTextInput(document.activeElement);

    if (!lockedHeight || Math.abs(w - lastWidth) > 24) {
      lastWidth = w;
      applyAppHeight(innerH);
    } else if (!inputFocused && innerH >= lockedHeight - 80) {
      applyAppHeight(innerH);
    }

    const baseCompare = isStandalone() ? window.screen.height : lockedHeight;
    const rawKb = Math.max(0, Math.round(baseCompare - vvH - (vv ? vv.offsetTop : 0)));
    const kbOpen = inputFocused && rawKb > 100;
    const kbPx = kbOpen ? rawKb : 0;

    document.documentElement.style.setProperty('--kb-height', `${kbPx}px`);
    document.documentElement.classList.toggle('kb-open', kbOpen);

    if (kbOpen) {
      ensureActiveInputVisible(kbPx);
    }
  }

  function onFocusIn(e: FocusEvent) {
    if (!isTextInput(e.target as Element)) return;
    pinWindowTop();
    setTimeout(syncViewport, 80);
    setTimeout(syncViewport, 280);
  }

  function onFocusOut() {
    if (settleTimer) clearTimeout(settleTimer);
    settleTimer = setTimeout(() => {
      pinWindowTop();
      syncViewport();
    }, 100);
  }

  onMounted(() => {
    lastWidth = window.innerWidth;
    applyAppHeight(window.innerHeight);
    syncViewport();

    window.addEventListener('resize', syncViewport, { passive: true });
    window.addEventListener('scroll', pinWindowTop, { passive: true });
    window.addEventListener('focusin', onFocusIn);
    window.addEventListener('focusout', onFocusOut);
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', syncViewport, { passive: true });
      window.visualViewport.addEventListener('scroll', pinWindowTop, { passive: true });
    }
  });

  onBeforeUnmount(() => {
    if (settleTimer) clearTimeout(settleTimer);
    window.removeEventListener('resize', syncViewport);
    window.removeEventListener('scroll', pinWindowTop);
    window.removeEventListener('focusin', onFocusIn);
    window.removeEventListener('focusout', onFocusOut);
    if (window.visualViewport) {
      window.visualViewport.removeEventListener('resize', syncViewport);
      window.visualViewport.removeEventListener('scroll', pinWindowTop);
    }
  });
}
