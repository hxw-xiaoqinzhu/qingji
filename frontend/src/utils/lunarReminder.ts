import dayjs from 'dayjs';
import { Lunar, Solar } from 'lunar-javascript';
import type { CalendarReminder } from '@/types';

export const LUNAR_MONTH_NAMES = [
  '正月', '二月', '三月', '四月', '五月', '六月',
  '七月', '八月', '九月', '十月', '冬月', '腊月',
];

export const LUNAR_DAY_NAMES = [
  '初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十',
  '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十',
  '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十',
];

export function formatLunarMonthDay(month?: number | null, day?: number | null): string {
  const m = Math.max(1, Math.min(12, Number(month) || 1));
  const d = Math.max(1, Math.min(30, Number(day) || 1));
  return `${LUNAR_MONTH_NAMES[m - 1]}${LUNAR_DAY_NAMES[d - 1]}`;
}

/**
 * Safely convert a Lunar (year, month, day) to a Solar YYYY-MM-DD string.
 * If day === 30 in a 29-day lunar month, gracefully falls back to day 29.
 */
export function lunarToSolarDate(lunarYear: number, lunarMonth: number, lunarDay: number): string {
  const m = Math.max(1, Math.min(12, lunarMonth));
  const d = Math.max(1, Math.min(30, lunarDay));
  try {
    const solar = Lunar.fromYmd(lunarYear, m, d).getSolar();
    return `${solar.getYear()}-${String(solar.getMonth()).padStart(2, '0')}-${String(solar.getDay()).padStart(2, '0')}`;
  } catch {
    const solar = Lunar.fromYmd(lunarYear, m, Math.min(29, d)).getSolar();
    return `${solar.getYear()}-${String(solar.getMonth()).padStart(2, '0')}-${String(solar.getDay()).padStart(2, '0')}`;
  }
}

/**
 * Extract (lunarMonth, lunarDay) from a Solar YYYY-MM-DD string.
 */
export function solarToLunarMonthDay(solarDate: string): { lunarYear: number; lunarMonth: number; lunarDay: number } {
  const dt = dayjs(solarDate);
  const lunar = Solar.fromYmd(dt.year(), dt.month() + 1, dt.date()).getLunar();
  return {
    lunarYear: lunar.getYear(),
    lunarMonth: Math.abs(lunar.getMonth()),
    lunarDay: lunar.getDay(),
  };
}

/**
 * Check whether a CalendarReminder occurs on a given Solar YYYY-MM-DD date.
 * Automatically handles SOLAR & LUNAR dates + NONE / YEARLY / MONTHLY recurrence!
 */
export function reminderOccursOnDate(rem: CalendarReminder, dateStr: string): boolean {
  if (!dateStr || !rem.solarDate) return false;

  if (rem.calendarType === 'LUNAR' && rem.lunarMonth && rem.lunarDay) {
    if (rem.repeatType === 'NONE') {
      return rem.solarDate === dateStr;
    }
    const dt = dayjs(dateStr);
    const lunar = Solar.fromYmd(dt.year(), dt.month() + 1, dt.date()).getLunar();
    // Skip leap months (negative lunar month) so yearly lunar birthdays trigger cleanly once per year
    if (lunar.getMonth() < 0) return false;
    const m = lunar.getMonth();
    const d = lunar.getDay();

    if (rem.repeatType === 'YEARLY') {
      if (m !== rem.lunarMonth) return false;
      if (d === rem.lunarDay) return true;
      // Handle lunar day 30 in a 29-day month: fire on day 29
      if (rem.lunarDay === 30 && d === 29) {
        const nextDayLunar = Solar.fromYmd(dt.add(1, 'day').year(), dt.add(1, 'day').month() + 1, dt.add(1, 'day').date()).getLunar();
        return nextDayLunar.getDay() === 1;
      }
      return false;
    }
    if (rem.repeatType === 'MONTHLY') {
      return d === rem.lunarDay;
    }
    return rem.solarDate === dateStr;
  }

  // SOLAR calendar
  if (rem.repeatType === 'NONE') {
    return rem.solarDate === dateStr;
  }
  const srcMonth = Number(rem.solarDate.slice(5, 7));
  const srcDay = Number(rem.solarDate.slice(8, 10));
  const target = dayjs(dateStr);
  const tMonth = target.month() + 1;
  const tDay = target.date();

  if (rem.repeatType === 'YEARLY') {
    if (tMonth === srcMonth && tDay === srcDay) return true;
    // Feb 29 birthday on non-leap years -> Feb 28
    if (srcMonth === 2 && srcDay === 29 && tMonth === 2 && tDay === 28 && target.daysInMonth() === 28) {
      return true;
    }
    return false;
  }
  if (rem.repeatType === 'MONTHLY') {
    const maxDay = target.daysInMonth();
    return tDay === Math.min(srcDay, maxDay);
  }
  return rem.solarDate === dateStr;
}

export function reminderTypeMeta(type: CalendarReminder['type']) {
  if (type === 'BIRTHDAY') {
    return { label: '生日', shortTag: '生日', badgeBg: 'bg-[#FEF0DF]', badgeText: 'text-[#B56D28]' };
  }
  if (type === 'ANNIVERSARY') {
    return { label: '纪念日', shortTag: '纪念', badgeBg: 'bg-[#FDEEE6]', badgeText: 'text-[#BA6642]' };
  }
  return { label: '日常事项', shortTag: '提醒', badgeBg: 'bg-[#FBF1E3]', badgeText: 'text-[#9F6A34]' };
}

export function repeatTypeLabel(repeatType: CalendarReminder['repeatType']) {
  if (repeatType === 'YEARLY') return '每年重复';
  if (repeatType === 'MONTHLY') return '每月重复';
  return '仅一次';
}

export interface DayAlmanacInfo {
  solarText: string;
  weekdayText: string;
  lunarFullText: string;
  yi: string[];
  ji: string[];
  isAuspiciousWedding: boolean;
}

const WEEKDAYS = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];

export function getDayAlmanac(dateStr: string): DayAlmanacInfo {
  const dt = dayjs(dateStr);
  const solar = Solar.fromYmd(dt.year(), dt.month() + 1, dt.date());
  const lunar = solar.getLunar();
  const yiAll: string[] = lunar.getDayYi() || [];
  const jiAll: string[] = lunar.getDayJi() || [];
  const isAuspiciousWedding = yiAll.includes('嫁娶') || yiAll.includes('订盟') || yiAll.includes('纳采');

  // Prioritize bridal/wedding terms first in 宜
  const priority = ['嫁娶', '订盟', '纳采', '祈福', '出行', '开市', '移徙'];
  const sortedYi = [
    ...priority.filter((p) => yiAll.includes(p)),
    ...yiAll.filter((x) => !priority.includes(x)),
  ].slice(0, 6);

  const rawMonth = lunar.getMonth();
  const absMonth = Math.abs(rawMonth);
  const monthPrefix = rawMonth < 0 ? '闰' : '';
  const baseMonthName = LUNAR_MONTH_NAMES[absMonth - 1] || `${absMonth}月`;
  const chineseMonthAlias: Record<number, string> = { 1: '一月', 11: '十一月', 12: '十二月' };
  const monthName = chineseMonthAlias[absMonth]
    ? `${baseMonthName}(${chineseMonthAlias[absMonth]})`
    : baseMonthName;
  const dayName = LUNAR_DAY_NAMES[lunar.getDay() - 1] || `${lunar.getDay()}日`;

  return {
    solarText: dt.format('M月D日'),
    weekdayText: WEEKDAYS[dt.day()],
    lunarFullText: `${lunar.getYearInGanZhi()}年 ${monthPrefix}${monthName}${dayName}`,
    yi: sortedYi.length > 0 ? sortedYi : ['诸事皆宜'],
    ji: jiAll.slice(0, 5).length > 0 ? jiAll.slice(0, 5) : ['无'],
    isAuspiciousWedding,
  };
}
