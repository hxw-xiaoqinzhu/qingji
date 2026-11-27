import dayjs from 'dayjs';
import {
  createUserWithEmailAndPassword,
  EmailAuthProvider,
  onAuthStateChanged,
  reauthenticateWithCredential,
  signInWithEmailAndPassword,
  signOut,
  updatePassword,
  type User as FirebaseUser,
} from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  setDoc,
  updateDoc,
  type Unsubscribe,
} from 'firebase/firestore';
import { firebaseAuth, firestoreDb } from '@/lib/firebase';
import type { ClientItem, Order, OrderExtraItem, OrderStatus, PackageTemplate, PaymentRecord, UserProfile, UserSession } from '@/types';

const SESSION_KEY = 'ms_fb_session_id';

const DEFAULT_CHECKLIST = [
  '底妆粉底液（冷白/暖白双色）',
  '高遮瑕遮瑕盘 & 散粉',
  '睫毛夹 / 单簇假睫毛 / 胶水',
  '新娘定妆喷雾（防水防汗）',
  '卷发棒 / 玉米须夹板 / 钢夹',
  '头饰备用发卡 & 隐形发网',
];

const DEFAULT_NOTICE =
  '1. 婚礼前一晚请做好基础补水，切勿尝试全新功效型护肤品。\n2. 睡前3小时尽量少喝水，避免清晨眼部浮肿。\n3. 试妆及婚礼当天请穿开衫/拉链睡衣，方便更换礼服不蹭妆。';

function toAuthEmail(username: string): string {
  const clean = username.trim().toLowerCase();
  if (clean.includes('@')) return clean;
  const safe = clean.replace(/[^a-z0-9._-]/g, '') || 'user';
  return `${safe}@qingji.app`;
}

function parseBrowserDeviceInfo(): string {
  const ua = (navigator.userAgent || '').toLowerCase();
  let os = 'Web 设备';
  if (ua.includes('iphone')) os = 'iPhone';
  else if (ua.includes('ipad')) os = 'iPad';
  else if (ua.includes('android')) os = 'Android';
  else if (ua.includes('mac os')) os = 'macOS';
  else if (ua.includes('windows')) os = 'Windows';

  let browser = '浏览器';
  if (ua.includes('micromessenger')) browser = '微信';
  else if (ua.includes('edg')) browser = 'Edge';
  else if (ua.includes('chrome') && !ua.includes('edg')) browser = 'Chrome';
  else if (ua.includes('safari') && !ua.includes('chrome')) browser = 'Safari';
  else if (ua.includes('firefox')) browser = 'Firefox';
  return `${os} · ${browser}`;
}

function genId(prefix = 'id'): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function makeApiError(status: number, error: string, extra?: Record<string, any>) {
  const err: any = new Error(error);
  err.response = { status, data: { error, ...extra } };
  return err;
}

function getDb() {
  if (!firestoreDb) throw makeApiError(500, 'Firestore 未初始化');
  return firestoreDb;
}

function getAuthInst() {
  if (!firebaseAuth) throw makeApiError(500, 'Firebase Auth 未初始化');
  return firebaseAuth;
}

export function waitForFirebaseUser(): Promise<FirebaseUser | null> {
  const auth = getAuthInst();
  if (auth.currentUser) return Promise.resolve(auth.currentUser);
  return new Promise((resolve) => {
    const unsub = onAuthStateChanged(auth, (u) => {
      unsub();
      resolve(u);
    });
  });
}

async function requireUid(): Promise<string> {
  const u = await waitForFirebaseUser();
  if (!u) throw makeApiError(401, '未登录或登录已过期');
  return u.uid;
}

function mapFirebaseAuthError(err: any): string {
  const code = err?.code || '';
  if (code === 'auth/email-already-in-use') return '该账号已被注册';
  if (code === 'auth/weak-password') return '密码至少需要 6 位';
  if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found') {
    return '账号或密码不正确';
  }
  if (code === 'auth/too-many-requests') return '尝试次数过多，请稍后再试';
  if (code === 'auth/invalid-email') return '账号格式不正确（请使用字母、数字或邮箱）';
  return err?.message || '操作失败，请稍后重试';
}

async function syncPublicSchedule(uid: string) {
  const db = getDb();
  const userSnap = await getDoc(doc(db, 'users', uid));
  if (!userSnap.exists()) return;
  const userData = userSnap.data() as any;
  const shareToken = userData.shareToken;
  if (!shareToken) return;

  const ordersSnap = await getDocs(collection(db, 'users', uid, 'orders'));
  const busyDates: Record<string, boolean> = {};
  ordersSnap.forEach((d) => {
    const o = d.data() as Order;
    if (o.deletedAt || o.status === 'CANCELLED') return;
    let cur = dayjs(o.serviceDate);
    const end = o.endDate ? dayjs(o.endDate) : cur;
    let guard = 0;
    while (!cur.isAfter(end) && guard < 60) {
      busyDates[cur.format('YYYY-MM-DD')] = true;
      cur = cur.add(1, 'day');
      guard++;
    }
  });

  await setDoc(doc(db, 'publicSchedules', shareToken), {
    ownerUid: uid,
    studioName: userData.studioName || '嘻嘻化妆室',
    busyDates,
    updatedAt: new Date().toISOString(),
  });
}

async function seedDefaultPackages(uid: string) {
  const db = getDb();
  const now = new Date().toISOString();
  const defaults = [
    { name: '新娘全天跟妆', category: 'MAIN', price: 3280, defaultDurationMin: 480, description: '早妆+仪式+敬酒共3套造型' },
    { name: '新娘精致早妆', category: 'MAIN', price: 1680, defaultDurationMin: 180, description: '晨袍+出门秀禾/主纱造型' },
    { name: '领证/轻婚纱跟妆', category: 'MAIN', price: 980, defaultDurationMin: 120, description: '清透纯欲伪素颜妆造' },
    { name: '商业广告/艺人妆造', category: 'MAIN', price: 2400, defaultDurationMin: 360, description: '商业TVC/平面高定妆发' },
    { name: '妈妈妆 / 伴娘妆', category: 'EXTRA', price: 280, defaultDurationMin: 60, description: '精致清透妆面+盘发' },
    { name: '早起费（6点前）', category: 'EXTRA', price: 200, defaultDurationMin: 0, description: '凌晨6点前开妆补贴' },
  ];
  await Promise.all(
    defaults.map((pkg) => {
      const id = genId('pkg');
      return setDoc(doc(db, 'users', uid, 'packages', id), { ...pkg, createdAt: now });
    })
  );
}

async function fetchAllOrders(uid: string): Promise<Order[]> {
  const db = getDb();
  const snap = await getDocs(collection(db, 'users', uid, 'orders'));
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Order, 'id'>) }));
}

async function fetchAllExpenses(uid: string): Promise<Array<{ id: string; category: string; amount: number; incurredAt: string; note: string; createdAt: string }>> {
  const db = getDb();
  const snap = await getDocs(collection(db, 'users', uid, 'expenses'));
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
}

function toMinutes(timeStr: string): number {
  const [h, m] = (timeStr || '00:00').split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

export function watchFirebaseSessionRevoked(onRevoked: () => void): Unsubscribe | null {
  const auth = firebaseAuth;
  const db = firestoreDb;
  const sessionId = localStorage.getItem(SESSION_KEY);
  if (!auth?.currentUser || !db || !sessionId) return null;

  const ref = doc(db, 'users', auth.currentUser.uid, 'sessions', sessionId);
  let seenExists = false;
  return onSnapshot(
    ref,
    (snap) => {
      if (snap.exists()) {
        seenExists = true;
      } else if (seenExists) {
        onRevoked();
      }
    },
    () => {
      // Ignore transient offline errors
    }
  );
}

export async function fetchFirebasePublicSchedule(shareToken: string, year: number, month: number) {
  const db = getDb();
  const snap = await getDoc(doc(db, 'publicSchedules', shareToken));
  if (!snap.exists()) {
    throw makeApiError(404, '档期链接不存在或已失效');
  }
  const data = snap.data() as { studioName: string; busyDates: Record<string, boolean> };
  const target = dayjs(`${year}-${String(month).padStart(2, '0')}-01`);
  const daysInMonth = target.daysInMonth();
  const busyDates = data.busyDates || {};

  const days: Array<{ date: string; status: 'AVAILABLE' | 'BUSY' | 'BLOCKED' }> = [];
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = target.date(d).format('YYYY-MM-DD');
    days.push({ date: dateStr, status: busyDates[dateStr] ? 'BUSY' : 'AVAILABLE' });
  }
  return {
    studioName: data.studioName || '嘻嘻化妆室',
    year,
    month,
    days,
  };
}

export async function buildAllOrdersIcs(): Promise<string> {
  const uid = await requireUid();
  const db = getDb();
  const userSnap = await getDoc(doc(db, 'users', uid));
  const studioName = (userSnap.data() as any)?.studioName || '嘻嘻化妆室';
  const orders = (await fetchAllOrders(uid))
    .filter((o) => !o.deletedAt && o.status !== 'CANCELLED')
    .sort((a, b) => a.serviceDate.localeCompare(b.serviceDate));

  const esc = (s: string) =>
    String(s || '')
      .replace(/\\/g, '\\\\')
      .replace(/;/g, '\\;')
      .replace(/,/g, '\\,')
      .replace(/\n/g, '\\n');

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//QingJi//Schedule//CN',
    `X-WR-CALNAME:晴记 · ${esc(studioName)}`,
    'X-WR-TIMEZONE:Asia/Shanghai',
    'CALSCALE:GREGORIAN',
  ];

  for (const o of orders) {
    const dtStart = `${o.serviceDate.replace(/-/g, '')}T${o.startTime.replace(':', '')}00`;
    const dtEnd = `${(o.endDate || o.serviceDate).replace(/-/g, '')}T${o.endTime.replace(':', '')}00`;
    lines.push(
      'BEGIN:VEVENT',
      `UID:${o.id}@qingji`,
      `DTSTART;TZID=Asia/Shanghai:${dtStart}`,
      `DTEND;TZID=Asia/Shanghai:${dtEnd}`,
      `SUMMARY:${esc(`${o.clientName} · ${o.serviceType}`)}`,
      `LOCATION:${esc(o.location || '待定地点')}`,
      `DESCRIPTION:${esc(`状态: ${o.status}\\n备注: ${o.notes || '无'}`)}`,
      'END:VEVENT'
    );
  }
  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

export async function firebaseRequest(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  rawUrl: string,
  body?: any,
  config?: { params?: Record<string, any>; responseType?: string }
): Promise<{ data: any }> {
  const [pathOnly, queryString] = rawUrl.split('?');
  const urlParams = new URLSearchParams(queryString || '');
  const params: Record<string, any> = { ...config?.params };
  urlParams.forEach((v, k) => {
    if (params[k] === undefined) params[k] = v;
  });

  const db = getDb();
  const auth = getAuthInst();

  // ======================== AUTH ========================
  if (method === 'POST' && pathOnly === '/auth/register') {
    const { username, password, studioName, phone } = body || {};
    if (!username || String(username).trim().length < 2) throw makeApiError(400, '账号至少需要 2 位');
    if (!password || String(password).length < 6) throw makeApiError(400, '密码至少需要 6 位');

    try {
      const cred = await createUserWithEmailAndPassword(auth, toAuthEmail(username), password);
      const uid = cred.user.uid;
      const now = new Date().toISOString();
      const shareToken = `${String(username).replace(/[^a-zA-Z0-9]/g, '').toLowerCase() || 'studio'}-${uid.slice(0, 6)}`;
      const profileData = {
        username: String(username).trim(),
        studioName: (studioName && String(studioName).trim()) || '嘻嘻化妆室',
        phone: phone || null,
        noticeTemplate: DEFAULT_NOTICE,
        checklistTemplate: DEFAULT_CHECKLIST,
        shareToken,
        createdAt: now,
        updatedAt: now,
      };
      await setDoc(doc(db, 'users', uid), profileData);
      await seedDefaultPackages(uid);

      const sessionId = genId('sess');
      await setDoc(doc(db, 'users', uid, 'sessions', sessionId), {
        deviceInfo: parseBrowserDeviceInfo(),
        ip: 'Firebase Cloud',
        lastActiveAt: now,
        createdAt: now,
      });
      localStorage.setItem(SESSION_KEY, sessionId);
      await syncPublicSchedule(uid);

      const token = await cred.user.getIdToken();
      return {
        data: {
          user: { id: uid, monthlyTarget: 20000, ...profileData } as UserProfile,
          accessToken: token,
          refreshToken: cred.user.refreshToken,
          sessionId,
        },
      };
    } catch (err: any) {
      throw makeApiError(400, mapFirebaseAuthError(err));
    }
  }

  if (method === 'POST' && pathOnly === '/auth/login') {
    const { username, password } = body || {};
    if (!username || !password) throw makeApiError(400, '请输入账号与密码');

    try {
      const cred = await signInWithEmailAndPassword(auth, toAuthEmail(username), password);
      const uid = cred.user.uid;
      const now = new Date().toISOString();

      const userRef = doc(db, 'users', uid);
      let userSnap = await getDoc(userRef);
      if (!userSnap.exists()) {
        const shareToken = `${String(username).replace(/[^a-zA-Z0-9]/g, '').toLowerCase() || 'studio'}-${uid.slice(0, 6)}`;
        await setDoc(userRef, {
          username: String(username).trim(),
          studioName: '嘻嘻化妆室',
          phone: null,
          noticeTemplate: DEFAULT_NOTICE,
          checklistTemplate: DEFAULT_CHECKLIST,
          shareToken,
          createdAt: now,
          updatedAt: now,
        });
        await seedDefaultPackages(uid);
        userSnap = await getDoc(userRef);
      }

      const sessionId = genId('sess');
      await setDoc(doc(db, 'users', uid, 'sessions', sessionId), {
        deviceInfo: parseBrowserDeviceInfo(),
        ip: 'Firebase Cloud',
        lastActiveAt: now,
        createdAt: now,
      });
      localStorage.setItem(SESSION_KEY, sessionId);
      await syncPublicSchedule(uid);

      const token = await cred.user.getIdToken();
      return {
        data: {
          user: { id: uid, monthlyTarget: 20000, ...(userSnap.data() as any) } as UserProfile,
          accessToken: token,
          refreshToken: cred.user.refreshToken,
          sessionId,
        },
      };
    } catch (err: any) {
      throw makeApiError(401, mapFirebaseAuthError(err));
    }
  }

  if (method === 'POST' && pathOnly === '/auth/logout') {
    try {
      const uid = auth.currentUser?.uid;
      const sessionId = localStorage.getItem(SESSION_KEY);
      if (uid && sessionId) {
        await deleteDoc(doc(db, 'users', uid, 'sessions', sessionId));
      }
      localStorage.removeItem(SESSION_KEY);
      await signOut(auth);
    } catch {
      // ignore
    }
    return { data: { success: true } };
  }

  // All routes below require authenticated Firebase user
  const uid = await requireUid();
  const currentSessionId = localStorage.getItem(SESSION_KEY) || '';

  if (method === 'GET' && pathOnly === '/auth/ping') {
    if (currentSessionId) {
      const sSnap = await getDoc(doc(db, 'users', uid, 'sessions', currentSessionId));
      if (!sSnap.exists()) {
        throw makeApiError(401, '当前设备已被移除，请重新登录');
      }
    }
    return { data: { ok: true, sessionId: currentSessionId } };
  }

  if (method === 'GET' && pathOnly === '/auth/me') {
    if (currentSessionId) {
      const sSnap = await getDoc(doc(db, 'users', uid, 'sessions', currentSessionId));
      if (!sSnap.exists()) {
        throw makeApiError(401, '当前设备登录已失效');
      }
    }
    const snap = await getDoc(doc(db, 'users', uid));
    if (!snap.exists()) throw makeApiError(404, '用户资料不存在');
    return {
      data: {
        user: { id: uid, monthlyTarget: 20000, ...(snap.data() as any) } as UserProfile,
        currentSessionId,
      },
    };
  }

  if (method === 'PUT' && pathOnly === '/auth/me') {
    const userRef = doc(db, 'users', uid);
    const snap = await getDoc(userRef);
    const existing = snap.data() || {};
    const updates: Record<string, any> = { updatedAt: new Date().toISOString() };
    if (typeof body?.studioName === 'string') updates.studioName = body.studioName.trim();
    if (typeof body?.phone === 'string' || body?.phone === null) updates.phone = body.phone || null;
    if (typeof body?.noticeTemplate === 'string') updates.noticeTemplate = body.noticeTemplate;
    if (Array.isArray(body?.checklistTemplate)) updates.checklistTemplate = body.checklistTemplate;

    await updateDoc(userRef, updates);
    await syncPublicSchedule(uid);
    return {
      data: {
        user: { id: uid, monthlyTarget: 20000, ...existing, ...updates } as UserProfile,
      },
    };
  }

  if (method === 'POST' && pathOnly === '/auth/change-password') {
    const { oldPassword, newPassword } = body || {};
    if (!oldPassword || !newPassword || newPassword.length < 6) {
      throw makeApiError(400, '新密码至少 6 位');
    }
    const curUser = auth.currentUser;
    if (!curUser?.email) throw makeApiError(401, '未登录');
    try {
      const cred = EmailAuthProvider.credential(curUser.email, oldPassword);
      await reauthenticateWithCredential(curUser, cred);
      await updatePassword(curUser, newPassword);

      // Kick all other sessions
      const sessSnap = await getDocs(collection(db, 'users', uid, 'sessions'));
      await Promise.all(
        sessSnap.docs
          .filter((d) => d.id !== currentSessionId)
          .map((d) => deleteDoc(doc(db, 'users', uid, 'sessions', d.id)))
      );
      return { data: { success: true } };
    } catch (err: any) {
      throw makeApiError(400, mapFirebaseAuthError(err));
    }
  }

  if (method === 'GET' && pathOnly === '/auth/sessions') {
    const snap = await getDocs(collection(db, 'users', uid, 'sessions'));
    const sessions: UserSession[] = snap.docs
      .map((d) => {
        const v = d.data() as any;
        return {
          id: d.id,
          deviceInfo: v.deviceInfo || 'Web 设备',
          ip: v.ip || 'Firebase Cloud',
          lastActiveAt: v.lastActiveAt || v.createdAt,
          createdAt: v.createdAt,
          isCurrent: d.id === currentSessionId,
        };
      })
      .sort((a, b) => (a.lastActiveAt < b.lastActiveAt ? 1 : -1));
    return { data: { sessions } };
  }

  if (method === 'DELETE' && pathOnly.startsWith('/auth/sessions/')) {
    const targetId = pathOnly.slice('/auth/sessions/'.length);
    await deleteDoc(doc(db, 'users', uid, 'sessions', targetId));
    return { data: { success: true } };
  }

  // ======================== CALENDAR ========================
  if (method === 'GET' && pathOnly === '/calendar/month') {
    const year = Number(params.year) || dayjs().year();
    const month = Number(params.month) || dayjs().month() + 1;
    const base = dayjs(`${year}-${String(month).padStart(2, '0')}-01`);
    const rangeStart = base.subtract(7, 'day').format('YYYY-MM-DD');
    const rangeEnd = base.endOf('month').add(7, 'day').format('YYYY-MM-DD');

    const all = await fetchAllOrders(uid);
    const orders = all
      .filter((o) => {
        if (o.deletedAt || o.status === 'CANCELLED') return false;
        const end = o.endDate || o.serviceDate;
        return end >= rangeStart && o.serviceDate <= rangeEnd;
      })
      .sort((a, b) => `${a.serviceDate} ${a.startTime}`.localeCompare(`${b.serviceDate} ${b.startTime}`));
    return { data: { orders, blockedDates: [] } };
  }

  // ======================== ORDERS ========================
  if (method === 'GET' && pathOnly === '/orders') {
    const all = await fetchAllOrders(uid);
    const showDeleted = params.deleted === 'true';
    const statusFilter = params.status || '';
    const q = String(params.q || '').trim().toLowerCase();

    const filtered = all
      .filter((o) => (showDeleted ? Boolean(o.deletedAt) : !o.deletedAt))
      .filter((o) => {
        if (!statusFilter || statusFilter === 'ALL') return true;
        if (statusFilter === 'PENDING_BALANCE') return o.balanceDue > 0 && o.status !== 'CANCELLED';
        return o.status === statusFilter;
      })
      .filter((o) => {
        if (!q) return true;
        return (
          (o.clientName || '').toLowerCase().includes(q) ||
          (o.clientPhone || '').toLowerCase().includes(q) ||
          (o.location || '').toLowerCase().includes(q) ||
          (o.serviceType || '').toLowerCase().includes(q)
        );
      })
      .sort((a, b) => `${b.serviceDate} ${b.startTime}`.localeCompare(`${a.serviceDate} ${a.startTime}`));
    return { data: { orders: filtered } };
  }

  if (method === 'GET' && /^\/orders\/[^/]+$/.test(pathOnly)) {
    const id = pathOnly.slice('/orders/'.length);
    const snap = await getDoc(doc(db, 'users', uid, 'orders', id));
    if (!snap.exists()) throw makeApiError(404, '订单不存在');
    return { data: { order: { id: snap.id, ...(snap.data() as any) } } };
  }

  if (method === 'POST' && pathOnly === '/orders') {
    const all = await fetchAllOrders(uid);
    const activeSameDay = all.filter(
      (o) => !o.deletedAt && o.status !== 'CANCELLED' && o.serviceDate === body.serviceDate
    );

    if (!body.forceConflict) {
      const newStart = toMinutes(body.startTime);
      const newEnd = toMinutes(body.endTime);
      const conflicts = activeSameDay.filter((o) => {
        const s = toMinutes(o.startTime);
        const e = toMinutes(o.endTime);
        return !(newEnd + 60 <= s || e + 60 <= newStart);
      });
      if (conflicts.length > 0) {
        throw makeApiError(409, '该时段与已有行程间隔不足 60 分钟', {
          conflict: true,
          conflicts: conflicts.map((c) => ({
            id: c.id,
            clientName: c.clientName,
            serviceType: c.serviceType,
            startTime: c.startTime,
            endTime: c.endTime,
          })),
        });
      }
    }

    const userSnap = await getDoc(doc(db, 'users', uid));
    const checklistTpl: string[] = (userSnap.data() as any)?.checklistTemplate || DEFAULT_CHECKLIST;

    const extraItems: OrderExtraItem[] = (body.extraItems || []).map((it: any) => ({
      id: genId('ext'),
      name: String(it.name || ''),
      unitPrice: Number(it.unitPrice || 0),
      quantity: Number(it.quantity || 1),
      subtotal: Number(it.unitPrice || 0) * Number(it.quantity || 1),
    }));
    const extraTotal = extraItems.reduce((s, it) => s + it.subtotal, 0);
    const basePrice = Number(body.basePrice || 0);
    const discount = Number(body.discount || 0);
    const totalAmount = Math.max(0, basePrice + extraTotal - discount);
    const depositPaid = Number(body.depositPaid || 0);
    const balanceDue = Math.max(0, totalAmount - depositPaid);
    const status: OrderStatus =
      balanceDue === 0 && totalAmount > 0 ? 'SETTLED' : depositPaid > 0 ? 'LOCKED' : 'RESERVED';

    const id = genId('ord');
    const now = new Date().toISOString();
    const payments: PaymentRecord[] =
      depositPaid > 0
        ? [
            {
              id: genId('pay'),
              orderId: id,
              type: 'DEPOSIT',
              amount: depositPaid,
              channel: 'WECHAT',
              paidAt: now,
              note: '预约定金',
            },
          ]
        : [];

    const orderDoc = {
      clientName: String(body.clientName || '').trim(),
      clientPhone: String(body.clientPhone || '').trim(),
      title: `${body.clientName} · ${body.serviceType || '定制妆造'}`,
      serviceType: String(body.serviceType || '新娘全天跟妆').trim(),
      serviceDate: String(body.serviceDate),
      endDate: body.endDate ? String(body.endDate) : null,
      startTime: String(body.startTime || '05:30'),
      endTime: String(body.endTime || '13:30'),
      commuteMinutes: Number(body.commuteMinutes || 0),
      location: String(body.location || ''),
      status,
      basePrice,
      extraTotal,
      discount,
      totalAmount,
      depositPaid,
      balanceDue,
      assistantName: String(body.assistantName || ''),
      assistantFee: Number(body.assistantFee || 0),
      assistantPaid: false,
      channelCommission: Number(body.channelCommission || 0),
      notes: String(body.notes || ''),
      skinType: String(body.skinType || ''),
      allergyNote: String(body.allergyNote || ''),
      referenceImages: Array.isArray(body.referenceImages) ? body.referenceImages.slice(0, 9) : [],
      checklist: checklistTpl.map((label, idx) => ({ id: `chk_${idx}`, label, checked: false })),
      extraItems,
      payments,
      deletedAt: null,
      createdAt: now,
      updatedAt: now,
    };

    await setDoc(doc(db, 'users', uid, 'orders', id), orderDoc);
    await syncPublicSchedule(uid);
    return { data: { order: { id, ...orderDoc } } };
  }

  if (method === 'PUT' && /^\/orders\/[^/]+$/.test(pathOnly)) {
    const id = pathOnly.slice('/orders/'.length);
    const ref = doc(db, 'users', uid, 'orders', id);
    const snap = await getDoc(ref);
    if (!snap.exists()) throw makeApiError(404, '订单不存在');
    const prev = snap.data() as Order;

    const merged: any = { ...prev, ...body, updatedAt: new Date().toISOString() };
    if (body.extraItems) {
      merged.extraItems = body.extraItems.map((it: any) => ({
        id: it.id || genId('ext'),
        name: String(it.name || ''),
        unitPrice: Number(it.unitPrice || 0),
        quantity: Number(it.quantity || 1),
        subtotal: Number(it.unitPrice || 0) * Number(it.quantity || 1),
      }));
      merged.extraTotal = merged.extraItems.reduce((s: number, it: OrderExtraItem) => s + it.subtotal, 0);
    }
    if (
      body.basePrice !== undefined ||
      body.discount !== undefined ||
      body.depositPaid !== undefined ||
      body.extraItems !== undefined
    ) {
      merged.basePrice = Number(merged.basePrice || 0);
      merged.discount = Number(merged.discount || 0);
      merged.depositPaid = Number(merged.depositPaid || 0);
      merged.totalAmount = Math.max(0, merged.basePrice + (merged.extraTotal || 0) - merged.discount);
      merged.balanceDue = Math.max(0, merged.totalAmount - merged.depositPaid);
      if (merged.status !== 'CANCELLED') {
        merged.status =
          merged.balanceDue === 0 && merged.totalAmount > 0
            ? 'SETTLED'
            : merged.depositPaid > 0
              ? 'LOCKED'
              : 'RESERVED';
      }
    }
    if (body.endDate === '') merged.endDate = null;
    merged.title = `${merged.clientName} · ${merged.serviceType}`;
    delete merged.id;
    delete merged.forceConflict;

    await setDoc(ref, merged);
    await syncPublicSchedule(uid);
    return { data: { order: { id, ...merged } } };
  }

  if (method === 'POST' && /^\/orders\/[^/]+\/payments$/.test(pathOnly)) {
    const id = pathOnly.split('/')[2];
    const ref = doc(db, 'users', uid, 'orders', id);
    const snap = await getDoc(ref);
    if (!snap.exists()) throw makeApiError(404, '订单不存在');
    const prev = snap.data() as Order;

    const amount = Number(body.amount || 0);
    if (amount <= 0) throw makeApiError(400, '收款金额必须大于 0');

    const now = new Date().toISOString();
    const record: PaymentRecord = {
      id: genId('pay'),
      orderId: id,
      type: body.type || 'BALANCE',
      amount,
      channel: body.channel || 'WECHAT',
      paidAt: body.paidAt || now,
      note: body.note || '结清尾款',
    };
    const newDeposit = (prev.depositPaid || 0) + amount;
    const newBalance = Math.max(0, (prev.totalAmount || 0) - newDeposit);
    const newStatus: OrderStatus = newBalance === 0 ? 'SETTLED' : prev.status;
    const payments = [...(prev.payments || []), record];

    await updateDoc(ref, {
      depositPaid: newDeposit,
      balanceDue: newBalance,
      status: newStatus,
      payments,
      updatedAt: now,
    });
    return { data: { order: { ...prev, id, depositPaid: newDeposit, balanceDue: newBalance, status: newStatus, payments } } };
  }

  if (method === 'POST' && /^\/orders\/[^/]+\/restore$/.test(pathOnly)) {
    const id = pathOnly.split('/')[2];
    await updateDoc(doc(db, 'users', uid, 'orders', id), {
      deletedAt: null,
      updatedAt: new Date().toISOString(),
    });
    await syncPublicSchedule(uid);
    return { data: { success: true } };
  }

  if (method === 'DELETE' && /^\/orders\/[^/]+$/.test(pathOnly)) {
    const id = pathOnly.slice('/orders/'.length);
    if (params.permanent === 'true') {
      await deleteDoc(doc(db, 'users', uid, 'orders', id));
    } else {
      await updateDoc(doc(db, 'users', uid, 'orders', id), {
        deletedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
    await syncPublicSchedule(uid);
    return { data: { success: true } };
  }

  // ======================== UPLOAD (Spark-Compatible Compact Data URL) ========================
  if (method === 'POST' && pathOnly === '/upload') {
    const file = body instanceof FormData ? body.get('file') : null;
    if (!(file instanceof Blob)) throw makeApiError(400, '请选择图片文件');
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ''));
      reader.onerror = () => reject(makeApiError(500, '图片读取失败'));
      reader.readAsDataURL(file);
    });
    return { data: { url: dataUrl } };
  }

  // ======================== PACKAGES ========================
  if (method === 'GET' && pathOnly === '/packages') {
    const snap = await getDocs(collection(db, 'users', uid, 'packages'));
    const packages: PackageTemplate[] = snap.docs
      .map((d) => ({ id: d.id, ...(d.data() as any) }))
      .sort((a, b) => (a.category === b.category ? b.price - a.price : a.category === 'MAIN' ? -1 : 1));
    return { data: { packages } };
  }

  if (method === 'POST' && pathOnly === '/packages') {
    const id = genId('pkg');
    const pkg = {
      name: String(body.name || '').trim(),
      category: body.category === 'EXTRA' ? 'EXTRA' : 'MAIN',
      price: Number(body.price || 0),
      defaultDurationMin: Number(body.defaultDurationMin || 180),
      description: String(body.description || ''),
      createdAt: new Date().toISOString(),
    };
    await setDoc(doc(db, 'users', uid, 'packages', id), pkg);
    return { data: { package: { id, ...pkg } } };
  }

  if (method === 'DELETE' && pathOnly.startsWith('/packages/')) {
    const id = pathOnly.slice('/packages/'.length);
    await deleteDoc(doc(db, 'users', uid, 'packages', id));
    return { data: { success: true } };
  }

  // ======================== EXPENSES ========================
  if (method === 'POST' && pathOnly === '/expenses') {
    const amount = Number(body.amount || 0);
    if (amount <= 0) throw makeApiError(400, '请填写支出金额');
    const id = genId('exp');
    const exp = {
      category: String(body.category || '彩妆补货'),
      amount,
      incurredAt: body.incurredAt || dayjs().format('YYYY-MM-DD'),
      note: String(body.note || ''),
      createdAt: new Date().toISOString(),
    };
    await setDoc(doc(db, 'users', uid, 'expenses', id), exp);
    return { data: { expense: { id, ...exp } } };
  }

  if (method === 'DELETE' && pathOnly.startsWith('/expenses/')) {
    const id = pathOnly.slice('/expenses/'.length);
    await deleteDoc(doc(db, 'users', uid, 'expenses', id));
    return { data: { success: true } };
  }

  // ======================== CLIENTS ========================
  if (method === 'GET' && pathOnly === '/clients') {
    const all = (await fetchAllOrders(uid)).filter((o) => !o.deletedAt && o.status !== 'CANCELLED');
    const map = new Map<string, ClientItem>();
    for (const o of all) {
      const key = (o.clientPhone || o.clientName || o.id).trim();
      const existing = map.get(key);
      if (!existing) {
        map.set(key, {
          id: key,
          name: o.clientName,
          phone: o.clientPhone || null,
          skinType: o.skinType || null,
          allergyNote: o.allergyNote || null,
          orderCount: 1,
          totalSpent: o.totalAmount || 0,
          lastServiceDate: o.serviceDate,
        });
      } else {
        existing.orderCount = (existing.orderCount || 0) + 1;
        existing.totalSpent = (existing.totalSpent || 0) + (o.totalAmount || 0);
        if (o.skinType && !existing.skinType) existing.skinType = o.skinType;
        if (o.allergyNote && !existing.allergyNote) existing.allergyNote = o.allergyNote;
        if (o.serviceDate > (existing.lastServiceDate || '')) existing.lastServiceDate = o.serviceDate;
      }
    }
    const clients = Array.from(map.values()).sort((a, b) => (b.totalSpent || 0) - (a.totalSpent || 0));
    return { data: { clients } };
  }

  // ======================== STATS & CSV EXPORT ========================
  if (method === 'GET' && pathOnly === '/stats/overview') {
    const year = Number(params.year) || dayjs().year();
    const month = Number(params.month) || dayjs().month() + 1;
    const mode: 'service_date' | 'cash_date' = params.mode === 'cash_date' ? 'cash_date' : 'service_date';

    const targetMonth = dayjs(`${year}-${String(month).padStart(2, '0')}-01`);
    const ymPrefix = targetMonth.format('YYYY-MM');

    const [allOrders, allExpenses] = await Promise.all([fetchAllOrders(uid), fetchAllExpenses(uid)]);
    const validOrders = allOrders.filter((o) => !o.deletedAt && o.status !== 'CANCELLED');
    const monthOrders = validOrders.filter((o) => o.serviceDate.startsWith(ymPrefix));
    const monthExpenses = allExpenses.filter((e) => dayjs(e.incurredAt).format('YYYY-MM') === ymPrefix);

    const allPayments = validOrders.flatMap((o) =>
      (o.payments || []).map((p) => ({ ...p, order: o }))
    );
    const monthPayments = allPayments.filter((p) => dayjs(p.paidAt).format('YYYY-MM') === ymPrefix);

    const expenseTotal = monthExpenses.reduce((s, e) => s + Number(e.amount || 0), 0);
    const assistantAndCommission = monthOrders.reduce(
      (s, o) => s + Number(o.assistantFee || 0) + Number(o.channelCommission || 0),
      0
    );

    const totalRevenue =
      mode === 'service_date'
        ? monthOrders.reduce((s, o) => s + Number(o.totalAmount || 0), 0)
        : monthPayments.reduce((s, p) => s + Number(p.amount || 0), 0);
    const receivedAmount =
      mode === 'service_date'
        ? monthOrders.reduce((s, o) => s + Number(o.depositPaid || 0), 0)
        : monthPayments.reduce((s, p) => s + Number(p.amount || 0), 0);
    const pendingBalance = monthOrders.reduce((s, o) => s + Number(o.balanceDue || 0), 0);
    const netProfit = Math.max(0, receivedAmount - expenseTotal - assistantAndCommission);

    const trend = [];
    for (let i = 5; i >= 0; i--) {
      const m = targetMonth.subtract(i, 'month');
      const mPrefix = m.format('YYYY-MM');
      if (mode === 'service_date') {
        const mOrds = validOrders.filter((o) => o.serviceDate.startsWith(mPrefix));
        trend.push({
          month: mPrefix,
          label: `${m.month() + 1}月`,
          revenue: mOrds.reduce((s, o) => s + Number(o.totalAmount || 0), 0),
          received: mOrds.reduce((s, o) => s + Number(o.depositPaid || 0), 0),
          count: mOrds.length,
        });
      } else {
        const mPays = allPayments.filter((p) => dayjs(p.paidAt).format('YYYY-MM') === mPrefix);
        const sum = mPays.reduce((s, p) => s + Number(p.amount || 0), 0);
        trend.push({
          month: mPrefix,
          label: `${m.month() + 1}月`,
          revenue: sum,
          received: sum,
          count: mPays.length,
        });
      }
    }

    const typeMap = new Map<string, number>();
    for (const o of monthOrders) {
      typeMap.set(o.serviceType, (typeMap.get(o.serviceType) || 0) + Number(o.totalAmount || 0));
    }
    const breakdown = Array.from(typeMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    const ledger = [
      ...monthPayments.map((p) => ({
        id: `pay-${p.id}`,
        rawId: p.id,
        kind: 'INCOME' as const,
        title: `${p.order.clientName} · ${p.type === 'DEPOSIT' ? '定金' : '尾款'}`,
        subtitle: `${p.order.serviceType} · ${p.channel}`,
        amount: p.amount,
        date: dayjs(p.paidAt).format('YYYY-MM-DD'),
        orderId: p.order.id,
      })),
      ...monthExpenses.map((e) => ({
        id: `exp-${e.id}`,
        rawId: e.id,
        kind: 'EXPENSE' as const,
        title: e.category,
        subtitle: e.note || '日常支出',
        amount: e.amount,
        date: dayjs(e.incurredAt).format('YYYY-MM-DD'),
        orderId: null,
      })),
    ].sort((a, b) => (a.date < b.date ? 1 : -1));

    return {
      data: {
        year,
        month,
        mode,
        summary: {
          totalRevenue,
          monthlyTarget: 20000,
          targetProgress: 0,
          receivedAmount,
          pendingBalance,
          expenseTotal,
          assistantAndCommission,
          netProfit,
          orderCount: monthOrders.length,
        },
        trend,
        breakdown,
        ledger,
      },
    };
  }

  if (method === 'GET' && pathOnly === '/stats/export') {
    const year = Number(params.year) || dayjs().year();
    const month = Number(params.month) || dayjs().month() + 1;
    const ymPrefix = dayjs(`${year}-${String(month).padStart(2, '0')}-01`).format('YYYY-MM');

    const [allOrders, allExpenses] = await Promise.all([fetchAllOrders(uid), fetchAllExpenses(uid)]);
    const orders = allOrders
      .filter((o) => !o.deletedAt && o.serviceDate.startsWith(ymPrefix))
      .sort((a, b) => a.serviceDate.localeCompare(b.serviceDate));
    const expenses = allExpenses
      .filter((e) => dayjs(e.incurredAt).format('YYYY-MM') === ymPrefix)
      .sort((a, b) => a.incurredAt.localeCompare(b.incurredAt));

    const esc = (v: any) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const lines = [['类型', '日期', '客户/项目', '妆型/分类', '状态', '总金额', '已收金额', '待收尾款', '备注'].map(esc).join(',')];
    for (const o of orders) {
      lines.push(['订单', o.serviceDate, o.clientName, o.serviceType, o.status, o.totalAmount, o.depositPaid, o.balanceDue, o.notes].map(esc).join(','));
    }
    for (const e of expenses) {
      lines.push(['支出', dayjs(e.incurredAt).format('YYYY-MM-DD'), e.category, '支出', '-', -e.amount, -e.amount, 0, e.note].map(esc).join(','));
    }
    const blob = new Blob(['\uFEFF' + lines.join('\n')], { type: 'text/csv;charset=utf-8' });
    return { data: blob };
  }

  throw makeApiError(404, `未找到接口: ${method} ${pathOnly}`);
}
