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
 * At rest (no keyboard): `#app` uses `position: fixed; top: 0; bottom: 0; height: auto;`
 * so it reaches the EXACT 0.00px physical bottom edge on iOS Standalone PWA, Safari, WeChat & Android
 * (avoiding iOS PWA's `window.innerHeight` 34px gap AND `100lvh`'s 44px overflow!).
 * We measure `#app.offsetHeight` at rest, and ONLY lock `#app` to that pixel height while the soft
 * keyboard is open (`html.kb-open`) so the keyboard never shrinks or pushes up the page!
 */
export function useViewportLock() {
  let lockedHeight = 0;
  let lastWidth = 0;
  let settleTimer: ReturnType<typeof setTimeout> | null = null;

  function measureRestHeight(): number {
    const appEl = document.getElementById('app');
    const renderedH = appEl && !document.documentElement.classList.contains('kb-open') ? appEl.offsetHeight : 0;
    return Math.max(renderedH, window.innerHeight);
  }

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
    const vv = window.visualViewport;
    const vvH = vv ? vv.height : window.innerHeight;
    const inputFocused = isTextInput(document.activeElement);

    if (!lockedHeight || Math.abs(w - lastWidth) > 24) {
      lastWidth = w;
      applyAppHeight(measureRestHeight());
    } else if (!inputFocused && vvH >= window.innerHeight - 60) {
      document.documentElement.classList.remove('kb-open');
      applyAppHeight(measureRestHeight());
    }

    const baseCompare = Math.min(lockedHeight, window.innerHeight);
    const rawKb = Math.max(0, Math.round(baseCompare - vvH - (vv ? vv.offsetTop : 0)));
    const kbOpen = inputFocused && rawKb > 90;
    const kbPx = kbOpen ? rawKb : 0;

    document.documentElement.style.setProperty('--kb-height', `${kbPx}px`);
    document.documentElement.classList.toggle('kb-open', kbOpen);

    if (kbOpen) {
      ensureActiveInputVisible(kbPx);
    }
  }

  function onFocusIn(e: FocusEvent) {
    if (!isTextInput(e.target as Element)) return;
    if (!document.documentElement.classList.contains('kb-open')) {
      applyAppHeight(measureRestHeight());
    }
    pinWindowTop();
    setTimeout(syncViewport, 80);
    setTimeout(syncViewport, 280);
  }

  function onFocusOut() {
    if (settleTimer) clearTimeout(settleTimer);
    settleTimer = setTimeout(() => {
      pinWindowTop();
      if (!isTextInput(document.activeElement)) {
        document.documentElement.classList.remove('kb-open');
        document.documentElement.style.setProperty('--kb-height', '0px');
        applyAppHeight(measureRestHeight());
      } else {
        syncViewport();
      }
    }, 100);
  }

  onMounted(() => {
    lastWidth = window.innerWidth;
    requestAnimationFrame(() => {
      applyAppHeight(measureRestHeight());
      syncViewport();
    });

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
