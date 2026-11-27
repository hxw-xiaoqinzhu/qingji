import { createApp } from 'vue';
import { createPinia } from 'pinia';
import 'vant/lib/index.css';
import {
  Popup,
  Toast,
  Dialog,
  SwipeCell,
  Switch,
  ActionSheet,
  DatePicker,
  Picker,
  ImagePreview,
} from 'vant';
import App from './App.vue';
import router from './router';
import './style.css';

// Fix iOS Home-Screen PWA (apple-mobile-web-app-status-bar-style="black-translucent")
// where window.innerHeight subtracts status-bar height (~47px-59px), leaving a gap at the bottom.
function syncAppViewportHeight() {
  const isStandalone =
    (window.navigator as any).standalone === true ||
    window.matchMedia('(display-mode: standalone)').matches;
  const isPortrait = window.innerHeight >= window.innerWidth;
  const screenH = isPortrait
    ? Math.max(window.screen.height, window.screen.width)
    : Math.min(window.screen.height, window.screen.width);

  const exactHeight = isStandalone
    ? Math.max(window.innerHeight, screenH)
    : window.visualViewport?.height || window.innerHeight;

  document.documentElement.style.setProperty('--app-height', `${exactHeight}px`);
}

syncAppViewportHeight();
window.addEventListener('resize', syncAppViewportHeight, { passive: true });
window.addEventListener('orientationchange', () => setTimeout(syncAppViewportHeight, 100), { passive: true });
window.visualViewport?.addEventListener('resize', syncAppViewportHeight, { passive: true });

const app = createApp(App);
app.use(createPinia());
app.use(router);

app.use(Popup);
app.use(Toast);
app.use(Dialog);
app.use(SwipeCell);
app.use(Switch);
app.use(ActionSheet);
app.use(DatePicker);
app.use(Picker);
app.use(ImagePreview);

app.mount('#app');
