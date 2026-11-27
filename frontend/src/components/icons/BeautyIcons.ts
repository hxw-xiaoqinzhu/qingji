import { defineComponent, h } from 'vue';

function createBeautyIcon(name: string, renderPaths: () => any[]) {
  return defineComponent({
    name,
    props: {
      size: { type: [Number, String], default: 18 },
    },
    setup(props) {
      return () =>
        h(
          'svg',
          {
            xmlns: 'http://www.w3.org/2000/svg',
            viewBox: '0 0 24 24',
            fill: 'none',
            stroke: 'currentColor',
            'stroke-width': '1.75',
            'stroke-linecap': 'round',
            'stroke-linejoin': 'round',
            style: { width: `${props.size}px`, height: `${props.size}px` },
          },
          renderPaths()
        );
    },
  });
}

// 1. TabBar: Silk Bridal Calendar
export const IconTabCalendar = createBeautyIcon('IconTabCalendar', () => [
  h('rect', { x: '3.5', y: '5', width: '17', height: '15.5', rx: '4.5', fill: 'currentColor', 'fill-opacity': '0.13' }),
  h('path', { d: 'M8 3.2v3.2M16 3.2v3.2M3.8 9.4h16.4' }),
  h('circle', { cx: '9', cy: '13.5', r: '1.1', fill: 'currentColor', stroke: 'none' }),
  h('circle', { cx: '15', cy: '13.5', r: '1.1', fill: 'currentColor', stroke: 'none' }),
  h('path', { d: 'M9.5 16.8h5' }),
]);

// 2. TabBar: Makeup Brush & Sparkle Itinerary
export const IconTabItinerary = createBeautyIcon('IconTabItinerary', () => [
  h('path', {
    d: 'M14.8 4.2c1.8-1.2 4.2.2 3.8 2.4-.3 1.7-1.9 3.1-3.6 3.4l-2.2-2.2c.3-1.7 1-2.9 2-3.6Z',
    fill: 'currentColor',
    'fill-opacity': '0.24',
  }),
  h('path', { d: 'M12.8 7.8 5.2 15.4a2.1 2.1 0 0 0 3 3l7.6-7.6' }),
  h('path', { d: 'M10.8 9.8l3.4 3.4' }),
  h('path', { d: 'M6.5 4.5l.6 1.4 1.4.6-1.4.6-.6 1.4-.6-1.4-1.4-.6 1.4-.6.6-1.4Z', fill: 'currentColor', stroke: 'none' }),
]);

// 3. TabBar: Rose Pearl Clasp Purse / Ledger
export const IconTabLedger = createBeautyIcon('IconTabLedger', () => [
  h('path', {
    d: 'M4.5 9.5c0-1.6 1.3-2.8 2.9-2.8h9.2c1.6 0 2.9 1.2 2.9 2.8l.7 7.2a3.3 3.3 0 0 1-3.3 3.6H7.1a3.3 3.3 0 0 1-3.3-3.6l.7-7.2Z',
    fill: 'currentColor',
    'fill-opacity': '0.14',
  }),
  h('path', { d: 'M9.2 6.7a2.8 2.8 0 0 1 5.6 0' }),
  h('circle', { cx: '10.6', cy: '4.1', r: '1', fill: 'currentColor', stroke: 'none' }),
  h('circle', { cx: '13.4', cy: '4.1', r: '1', fill: 'currentColor', stroke: 'none' }),
  h('path', { d: 'M12 11.2v4.8M9.8 12.6h4.4M9.8 14.6h4.4' }),
]);

// 4. TabBar: Couture Perfume Bottle / Studio Atelier
export const IconTabStudio = createBeautyIcon('IconTabStudio', () => [
  h('rect', { x: '9.5', y: '3.2', width: '5', height: '2.8', rx: '1', fill: 'currentColor', 'fill-opacity': '0.22' }),
  h('path', { d: 'M10.5 6v2h3V6' }),
  h('rect', {
    x: '5.5',
    y: '8',
    width: '13',
    height: '12.5',
    rx: '4.2',
    fill: 'currentColor',
    'fill-opacity': '0.14',
  }),
  h('circle', { cx: '12', cy: '14.2', r: '2.2', fill: 'currentColor', 'fill-opacity': '0.28' }),
]);

// 5. Lash Eye Open (Privacy Visible)
export const IconLashEyeOpen = createBeautyIcon('IconLashEyeOpen', () => [
  h('path', {
    d: 'M2.8 12.5C4.8 8.6 8.1 6.8 12 6.8s7.2 1.8 9.2 5.7c-2 3.9-5.3 5.7-9.2 5.7s-7.2-1.8-9.2-5.7Z',
    fill: 'currentColor',
    'fill-opacity': '0.12',
  }),
  h('circle', { cx: '12', cy: '12.5', r: '2.3', fill: 'currentColor', 'fill-opacity': '0.28' }),
  h('path', { d: 'M12 4.3v1.3M8 5.1l.6 1.2M16 5.1l-.6 1.2' }),
]);

// 6. Lash Eye Closed / Wink (Privacy Hidden ****)
export const IconLashEyeClosed = createBeautyIcon('IconLashEyeClosed', () => [
  h('path', { d: 'M3.5 11.2c2.1 3.2 5.1 4.8 8.5 4.8s6.4-1.6 8.5-4.8' }),
  h('path', { d: 'M12 16v2.2M8.2 15.2l-.9 2M15.8 15.2l.9 2M4.8 13l-1.4 1.5M19.2 13l1.4 1.5' }),
]);

// 7. Polaroid Sparkle Card (Share Schedule Poster)
export const IconPosterCard = createBeautyIcon('IconPosterCard', () => [
  h('rect', { x: '4', y: '3.8', width: '16', height: '16.4', rx: '3.6', fill: 'currentColor', 'fill-opacity': '0.12' }),
  h('path', { d: 'M4.5 15.6h15' }),
  h('path', {
    d: 'M12 7.2l.85 2 2 .85-2 .85-.85 2-.85-2-2-.85 2-.85.85-2Z',
    fill: 'currentColor',
    'fill-opacity': '0.35',
  }),
]);

// 8. Unified Minimal Plus Icon
export const IconPlusAction = createBeautyIcon('IconPlusAction', () => [
  h('path', { d: 'M12 5.2v13.6M5.2 12h13.6' }),
]);

// 9. Unified Settings Blossom Gear Icon (Profile Studio Settings)
export const IconSettingsGear = createBeautyIcon('IconSettingsGear', () => [
  h('circle', { cx: '12', cy: '12', r: '3.2', fill: 'currentColor', 'fill-opacity': '0.22' }),
  h('path', {
    d: 'M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.08a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h.08a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.08a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z',
  }),
]);

// 10. Unified Export Bill Icon
export const IconExportBill = createBeautyIcon('IconExportBill', () => [
  h('path', {
    d: 'M5 14.5v3a2.5 2.5 0 0 0 2.5 2.5h9a2.5 2.5 0 0 0 2.5-2.5v-3',
  }),
  h('path', { d: 'M12 4.2v11M8.2 11.5 12 15.3l3.8-3.8' }),
]);

// 11. Lipstick & Palette (Packages)
export const IconLipstick = createBeautyIcon('IconLipstick', () => [
  h('path', { d: 'M9 4.5c0-1 .9-1.5 2-.8l1.5 1c.4.3.5.7.5 1.2V11H9V4.5Z', fill: 'currentColor', 'fill-opacity': '0.28' }),
  h('rect', { x: '7.8', y: '11', width: '6.4', height: '9.2', rx: '1.8', fill: 'currentColor', 'fill-opacity': '0.14' }),
  h('path', { d: 'M7.8 14.5h6.4' }),
  h('path', { d: 'M17.5 6.5l.6 1.3 1.3.6-1.3.6-.6 1.3-.6-1.3-1.3-.6 1.3-.6.6-1.3Z', fill: 'currentColor', stroke: 'none' }),
]);

// 12. Vanity Hand Mirror (Bridal Client Profiles)
export const IconVanityMirror = createBeautyIcon('IconVanityMirror', () => [
  h('ellipse', { cx: '12', cy: '9.5', rx: '5.6', ry: '6.2', fill: 'currentColor', 'fill-opacity': '0.16' }),
  h('path', { d: 'M10.2 7.2l1.6-1.6M9.8 10l3.2-3.2' }),
  h('path', { d: 'M12 15.7v4.8M9.8 20.5h4.4' }),
]);

// 13. Cosmetic Vanity Trunk (Packing Checklist)
export const IconCosmeticCase = createBeautyIcon('IconCosmeticCase', () => [
  h('rect', { x: '3.5', y: '7.5', width: '17', height: '12.5', rx: '3.5', fill: 'currentColor', 'fill-opacity': '0.15' }),
  h('path', { d: 'M8.8 7.5V5.8a2 2 0 0 1 2-2h2.4a2 2 0 0 1 2 2v1.7' }),
  h('path', { d: 'M3.8 12.5h16.4' }),
  h('rect', { x: '10.4', y: '10.8', width: '3.2', height: '3.4', rx: '1', fill: 'currentColor', 'fill-opacity': '0.35' }),
]);

// 14. Love Note Envelope (Bridal Notice)
export const IconLoveNote = createBeautyIcon('IconLoveNote', () => [
  h('rect', { x: '3.5', y: '5.5', width: '17', height: '13', rx: '3.2', fill: 'currentColor', 'fill-opacity': '0.14' }),
  h('path', { d: 'M4.2 7l7.8 5.2L19.8 7' }),
]);

// 15. Silk Ribbon Link (Public Share Link)
export const IconSilkLink = createBeautyIcon('IconSilkLink', () => [
  h('path', { d: 'M9.8 14.2 14.2 9.8' }),
  h('path', {
    d: 'M8.2 11.2 6.5 13a3.5 3.5 0 0 0 5 5l1.7-1.7',
    fill: 'currentColor',
    'fill-opacity': '0.12',
  }),
  h('path', {
    d: 'M15.8 12.8l1.7-1.8a3.5 3.5 0 0 0-5-5l-1.7 1.7',
    fill: 'currentColor',
    'fill-opacity': '0.12',
  }),
]);

// 16. Calendar Bell Sync (.ics Apple Calendar)
export const IconCalendarSync = createBeautyIcon('IconCalendarSync', () => [
  h('rect', { x: '3.5', y: '5', width: '17', height: '15.5', rx: '4', fill: 'currentColor', 'fill-opacity': '0.14' }),
  h('path', { d: 'M8 3.3v3M16 3.3v3M3.8 9.2h16.4' }),
  h('path', { d: 'M9.6 14.6l1.8 1.8 3.4-3.6' }),
]);

// 17. Magic Wand (Smart WeChat Parser)
export const IconMagicWand = createBeautyIcon('IconMagicWand', () => [
  h('path', { d: 'M4.5 19.5 15 9' }),
  h('path', {
    d: 'M16.5 4.2l1 2.3 2.3 1-2.3 1-1 2.3-1-2.3-2.3-1 2.3-1 1-2.3Z',
    fill: 'currentColor',
    'fill-opacity': '0.32',
  }),
  h('circle', { cx: '8.5', cy: '6.5', r: '1.1', fill: 'currentColor', stroke: 'none' }),
]);

// 18. Crescent Moon Pillow
export const IconRestMoon = createBeautyIcon('IconRestMoon', () => [
  h('path', {
    d: 'M18.2 14.6A6.8 6.8 0 0 1 9.4 5.8a7 7 0 1 0 8.8 8.8Z',
    fill: 'currentColor',
    'fill-opacity': '0.22',
  }),
]);

// 19. Location Pearl Pin
export const IconPearlPin = createBeautyIcon('IconPearlPin', () => [
  h('path', {
    d: 'M12 20.5s6-5.2 6-10a6 6 0 1 0-12 0c0 4.8 6 10 6 10Z',
    fill: 'currentColor',
    'fill-opacity': '0.16',
  }),
  h('circle', { cx: '12', cy: '10.5', r: '2.1', fill: 'currentColor', 'fill-opacity': '0.35' }),
]);

// 20. Center Raised TabBar Create Icon: Bespoke Schedule Note + Crisp Plus & Twinkle Star
export const IconCenterCreate = createBeautyIcon('IconCenterCreate', () => [
  // Soft rounded schedule card silhouette
  h('path', {
    d: 'M14.5 4.8H7.8A3.3 3.3 0 0 0 4.5 8.1v8.6A3.3 3.3 0 0 0 7.8 20h8.4a3.3 3.3 0 0 0 3.3-3.3v-6.2',
    fill: 'currentColor',
    'fill-opacity': '0.14',
    'stroke-width': '1.85',
  }),
  // Crisp centered plus inside card
  h('path', {
    d: 'M12 10.3v4.6M9.7 12.6h4.6',
    'stroke-width': '2',
  }),
  // Sculpted 4-point sparkle star at top-right
  h('path', {
    d: 'M18.3 3.2l.75 1.85 1.85.75-1.85.75-.75 1.85-.75-1.85-1.85-.75 1.85-.75.75-1.85Z',
    fill: 'currentColor',
    stroke: 'none',
  }),
]);
