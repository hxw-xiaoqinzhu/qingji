import dayjs from 'dayjs';
import type { OrderStatus } from '@/types';

/**
 * Unified Low-Saturation Pale Pastel Status System
 * Eliminates harsh green/yellow/red rainbow clashes across itinerary & detail cards.
 */
export function statusMeta(status: OrderStatus, balanceDue = 0) {
  if (status === 'CANCELLED') {
    return {
      label: '已取消',
      textClass: 'text-[#A69A9F]',
      bgClass: 'bg-[#F5F2F4]',
      dotClass: 'bg-[#C4B8BD]',
      ribbonClass: 'bg-[#EBE5E8]',
    };
  }
  if (status === 'SETTLED') {
    return {
      label: '已结清',
      textClass: 'text-[#8C7E84]',
      bgClass: 'bg-[#F6F3F4]',
      dotClass: 'bg-[#C9BDC2]',
      ribbonClass: 'bg-[#EDE6E9]',
    };
  }
  if (status === 'COMPLETED' && balanceDue > 0) {
    return {
      label: '待收尾款',
      textClass: 'text-[#B07283]',
      bgClass: 'bg-[#FAF0F3]',
      dotClass: 'bg-[#DC99AA]',
      ribbonClass: 'bg-[#F0CDD7]',
    };
  }
  if (status === 'COMPLETED') {
    return {
      label: '已完成',
      textClass: 'text-[#8C7E84]',
      bgClass: 'bg-[#F6F3F4]',
      dotClass: 'bg-[#C9BDC2]',
      ribbonClass: 'bg-[#EDE6E9]',
    };
  }
  if (status === 'LOCKED') {
    return {
      label: '已锁档',
      textClass: 'text-[#A86E7E]',
      bgClass: 'bg-[#FAF0F3]',
      dotClass: 'bg-[#DC99AA]',
      ribbonClass: 'bg-[#ECC8D2]',
    };
  }
  return {
    label: '待确认',
    textClass: 'text-[#AA8B77]',
    bgClass: 'bg-[#FAF4EF]',
    dotClass: 'bg-[#DFC3B0]',
    ribbonClass: 'bg-[#EFE0D5]',
  };
}

/**
 * Unified Monochromatic Pale-Blush Client Avatar (No purple/green/orange rainbow)
 */
export function serviceCategoryVisual(serviceType: string) {
  const s = serviceType || '';
  if (s.includes('全天')) {
    return { badge: '高定全天', avatarBg: 'from-[#FBF0F4] to-[#F6E4EA] text-[#A86E7E]' };
  }
  if (s.includes('早妆') || s.includes('半天')) {
    return { badge: '晨光早妆', avatarBg: 'from-[#FBF2F5] to-[#F7E8EC] text-[#A86E7E]' };
  }
  if (s.includes('领证') || s.includes('轻婚纱')) {
    return { badge: '甜美领证', avatarBg: 'from-[#FBF2F5] to-[#F7E8EC] text-[#A86E7E]' };
  }
  return { badge: '定制妆造', avatarBg: 'from-[#FAF1F4] to-[#F5E6EB] text-[#A86E7E]' };
}

export function getRelativeDayLabel(serviceDate: string): string {
  const today = dayjs().startOf('day');
  const target = dayjs(serviceDate).startOf('day');
  const diff = target.diff(today, 'day');
  if (diff === 0) return '今日出妆';
  if (diff === 1) return '明日出妆';
  if (diff === 2) return '后天出妆';
  if (diff > 2) return `还有 ${diff} 天`;
  return `已履约`;
}

export function getGreetingByHour(): string {
  const h = new Date().getHours();
  if (h < 6) return '星光早妆人，辛苦啦';
  if (h < 11) return '早安，愿今天底妆清透服帖';
  if (h < 14) return '午安，记得喝水小憩片刻';
  if (h < 19) return '下午好，美好妆造正在发生';
  return '晚安，整理完刷具早点休息';
}

export function subtractMinutes(timeStr: string, minutes: number): string {
  const [h, m] = timeStr.split(':').map(Number);
  let total = (h || 0) * 60 + (m || 0) - minutes;
  let prefix = '';
  if (total < 0) {
    total += 24 * 60;
    prefix = '前夜 ';
  }
  const hh = String(Math.floor(total / 60) % 24).padStart(2, '0');
  const mm = String(total % 60).padStart(2, '0');
  return `${prefix}${hh}:${mm}`;
}

export function downloadSingleOrderIcs(order: {
  id: string;
  clientName: string;
  serviceType: string;
  serviceDate: string;
  endDate?: string | null;
  startTime: string;
  endTime: string;
  location: string;
  notes: string;
}) {
  const dtStart = `${order.serviceDate.replace(/-/g, '')}T${order.startTime.replace(':', '')}00`;
  const dtEnd = `${(order.endDate || order.serviceDate).replace(/-/g, '')}T${order.endTime.replace(':', '')}00`;
  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//QingJi//CN',
    'BEGIN:VEVENT',
    `UID:${order.id}@qingji`,
    `DTSTART;TZID=Asia/Shanghai:${dtStart}`,
    `DTEND;TZID=Asia/Shanghai:${dtEnd}`,
    `SUMMARY:${order.clientName} · ${order.serviceType}`,
    `LOCATION:${order.location || '待定地点'}`,
    `DESCRIPTION:${(order.notes || '').replace(/\n/g, '\\n')}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${order.serviceDate}-${order.clientName}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
