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
 * Locks `--app-height` to the full un-keyboarded screen height so the soft keyboard
 * NEVER shrinks `#app`, pushes up bottom bars, or exposes a cut-off seam on iOS WeChat / Safari / Android.
 * When an input is below the keyboard fold, smoothly scrolls ONLY its inner `.scroll-pane` / `.van-popup`
 * while keeping `window.scrollY === 0`.
 */
export function useViewportLock() {
  let lockedHeight = 0;
  let lastWidth = 0;
  let settleTimer: ReturnType<typeof setTimeout> | null = null;

  function applyAppHeight(h: number) {
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

    // Only scroll inner container if input is obscured by (or very close to) keyboard top
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

    // Update locked full height ONLY on initial load, orientation/width change,
    // or when height grows (e.g. browser toolbar hides) and no keyboard is shrinking it.
    if (!lockedHeight || Math.abs(w - lastWidth) > 24) {
      lastWidth = w;
      applyAppHeight(Math.max(innerH, vvH));
    } else if (!inputFocused && innerH >= lockedHeight - 80) {
      applyAppHeight(innerH);
    }

    const rawKb = Math.max(0, Math.round(lockedHeight - vvH - (vv ? vv.offsetTop : 0)));
    const kbOpen = rawKb > 110;
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
