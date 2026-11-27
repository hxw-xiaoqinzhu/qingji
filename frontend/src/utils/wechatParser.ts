import dayjs from 'dayjs';

export interface ParsedWechatOrder {
  clientName?: string;
  clientPhone?: string;
  serviceDate?: string;
  startTime?: string;
  location?: string;
  serviceType?: string;
}

/**
 * Smart regex parser for pasted WeChat booking chat snippets.
 * Examples:
 * "11月28日早上5点半 柏悦酒店1808 新娘林知夏 13912345678 全天跟妆"
 * "2026-12-05 06:00 杭州君悦酒店 电话13800138000 客户：周念安"
 */
export function parseWechatBookingText(raw: string): ParsedWechatOrder {
  const text = raw.trim();
  const result: ParsedWechatOrder = {};

  // 1. Phone number (11 digits starting with 1)
  const phoneMatch = text.match(/(1[3-9]\d{9})/);
  if (phoneMatch) {
    result.clientPhone = phoneMatch[1];
  }

  // 2. Date: YYYY-MM-DD / YYYY.MM.DD / YYYY年M月D日 / M月D日
  const fullDateMatch = text.match(/(\d{4})[-./年](\d{1,2})[-./月](\d{1,2})/);
  if (fullDateMatch) {
    const [, y, m, d] = fullDateMatch;
    result.serviceDate = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  } else {
    const mdMatch = text.match(/(\d{1,2})[月./-](\d{1,2})[日号]?/);
    if (mdMatch) {
      const year = dayjs().year();
      const [, m, d] = mdMatch;
      result.serviceDate = `${year}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
    }
  }

  // 3. Time: HH:mm or X点半 / X点XX分
  const colonTime = text.match(/(\d{1,2})[:：](\d{2})/);
  if (colonTime) {
    result.startTime = `${colonTime[1].padStart(2, '0')}:${colonTime[2]}`;
  } else {
    const cnTime = text.match(/(?:凌晨|早上|上午|下午)?(\d{1,2})点(半|\d{1,2}分?)?/);
    if (cnTime) {
      let h = Number(cnTime[1]);
      if (text.includes('下午') && h < 12) h += 12;
      let m = '00';
      if (cnTime[2] === '半') m = '30';
      else if (cnTime[2]) m = cnTime[2].replace('分', '').padStart(2, '0');
      result.startTime = `${String(h).padStart(2, '0')}:${m}`;
    }
  }

  // 4. Client Name
  const nameMatch = text.match(/(?:新娘|客户|姓名|联系人)[：:\s]*([\u4e00-\u9fa5]{2,4})/);
  if (nameMatch) {
    result.clientName = nameMatch[1];
  }

  // 5. Location (hotel / address keywords)
  const locMatch = text.match(
    /(?:地点|地址|酒店)[：:\s]*([^\s，,。\n]+)|([^\s，,。\n]*(?:酒店|宾馆|山庄|套房|中心|花园|小区|大厦|民宿|度假村)[^\s，,。\n]*)/
  );
  if (locMatch) {
    result.location = locMatch[1] || locMatch[2];
  }

  // 6. Service Type
  if (text.includes('全天')) result.serviceType = '新娘全天跟妆';
  else if (text.includes('早妆') || text.includes('半天')) result.serviceType = '新娘精致早妆';
  else if (text.includes('领证') || text.includes('轻婚纱')) result.serviceType = '领证/轻婚纱跟妆';
  else if (text.includes('商业') || text.includes('广告') || text.includes('艺人')) result.serviceType = '商业广告/艺人妆造';

  return result;
}
