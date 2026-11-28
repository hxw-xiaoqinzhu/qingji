export interface UserProfile {
  id: string;
  username: string;
  phone?: string | null;
  studioName: string;
  avatarUrl?: string | null;
  bio?: string | null;
  monthlyTarget: number;
  noticeTemplate: string;
  checklistTemplate: string[];
  shareToken: string;
  createdAt: string;
}

export interface UserSession {
  id: string;
  deviceInfo: string;
  ip: string;
  lastActiveAt: string;
  createdAt: string;
  isCurrent: boolean;
}

export interface OrderExtraItem {
  id?: string;
  name: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

export interface ChecklistItem {
  id: string;
  label: string;
  checked: boolean;
}

export interface PaymentRecord {
  id: string;
  orderId: string;
  type: 'DEPOSIT' | 'BALANCE' | 'REFERRAL';
  amount: number;
  channel: 'WECHAT' | 'ALIPAY' | 'BANK' | 'CASH';
  paidAt: string;
  note: string;
}

export type OrderStatus = 'RESERVED' | 'LOCKED' | 'COMPLETED' | 'SETTLED' | 'CANCELLED';

export interface Order {
  id: string;
  clientId?: string | null;
  clientName: string;
  clientPhone?: string | null;
  title: string;
  serviceType: string;
  serviceDate: string; // YYYY-MM-DD
  endDate?: string | null; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  commuteMinutes: number;
  location: string;
  status: OrderStatus;
  basePrice: number;
  extraTotal: number;
  discount: number;
  totalAmount: number;
  depositPaid: number;
  balanceDue: number;
  assistantName?: string | null;
  assistantFee: number;
  assistantPaid: boolean;
  channelCommission: number;
  notes: string;
  skinType?: string | null;
  allergyNote?: string | null;
  referenceImages: string[];
  checklist: ChecklistItem[];
  extraItems: OrderExtraItem[];
  payments?: PaymentRecord[];
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BlockedDate {
  id: string;
  date: string;
  reason: string;
}

export interface CalendarReminder {
  id: string;
  type: 'TASK' | 'BIRTHDAY' | 'ANNIVERSARY';
  title: string;
  calendarType: 'SOLAR' | 'LUNAR';
  solarDate: string; // YYYY-MM-DD
  lunarMonth?: number | null;
  lunarDay?: number | null;
  repeatType: 'NONE' | 'YEARLY' | 'MONTHLY';
  remindTime?: string | null;
  note: string;
  createdAt?: string;
}

export interface PackageAddon {
  id: string;
  name: string;
  price: number;
}

export interface PackageTemplate {
  id: string;
  name: string;
  category: 'MAIN' | 'EXTRA';
  price: number;
  defaultDurationMin: number;
  description: string;
  addons?: PackageAddon[];
}

export interface ClientItem {
  id: string;
  name: string;
  phone?: string | null;
  wechat?: string | null;
  source?: string | null;
  skinType?: string | null;
  allergyNote?: string | null;
  hairNote?: string | null;
  orderCount?: number;
  totalSpent?: number;
  receivedAmount?: number;
  pendingBalance?: number;
  lastServiceDate?: string | null;
  orders?: Order[];
}

export interface StatsOverview {
  year: number;
  month: number;
  mode: 'service_date' | 'cash_date';
  summary: {
    totalRevenue: number;
    monthlyTarget: number;
    targetProgress: number;
    receivedAmount: number;
    pendingBalance: number;
    expenseTotal: number;
    assistantAndCommission: number;
    netProfit: number;
    orderCount: number;
  };
  trend: Array<{
    month: string;
    label: string;
    revenue: number;
    received: number;
    count: number;
  }>;
  breakdown: Array<{
    name: string;
    value: number;
  }>;
  ledger: Array<{
    id: string;
    rawId: string;
    kind: 'INCOME' | 'EXPENSE';
    title: string;
    subtitle: string;
    amount: number;
    date: string;
    orderId?: string | null;
  }>;
}
