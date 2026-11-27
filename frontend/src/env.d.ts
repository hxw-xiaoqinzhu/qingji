/// <reference types="vite/client" />

declare module 'lunar-javascript' {
  export class Lunar {
    getDayYi(): string[];
    getJieQi(): string;
    getDayInChinese(): string;
    getMonthInChinese(): string;
  }
  export class Solar {
    static fromYmd(year: number, month: number, day: number): Solar;
    getLunar(): Lunar;
  }
}
