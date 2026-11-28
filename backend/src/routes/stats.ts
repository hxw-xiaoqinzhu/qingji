import { Router, Response } from 'express';
import dayjs from 'dayjs';
import { prisma } from '../lib/prisma';
import { AuthRequest, requireAuth } from '../lib/auth';

const router = Router();
router.use(requireAuth);

router.get('/overview', async (req: AuthRequest, res: Response) => {
  try {
    const year = Number(req.query.year) || dayjs().year();
    const month = Number(req.query.month) || dayjs().month() + 1;
    const rawMode = String(req.query.mode || 'service_date');
    const mode = rawMode === 'all' ? 'all' : rawMode === 'cash_date' ? 'cash_date' : 'service_date';

    const targetMonth = dayjs(`${year}-${String(month).padStart(2, '0')}-01`);
    const targetYearStart = dayjs(`${year}-01-01`);

    const rangeStartStr = mode === 'all' ? `${year}-01-01` : targetMonth.format('YYYY-MM-DD');
    const rangeEndStr = mode === 'all' ? `${year}-12-31` : targetMonth.endOf('month').format('YYYY-MM-DD');
    const rangeStartDate = mode === 'all' ? targetYearStart.startOf('year').toDate() : targetMonth.startOf('month').toDate();
    const rangeEndDate = mode === 'all' ? targetYearStart.endOf('year').toDate() : targetMonth.endOf('month').toDate();

    const [user, periodOrders, periodPayments, periodExpenses] = await Promise.all([
      prisma.user.findUnique({ where: { id: req.user!.userId } }),
      prisma.order.findMany({
        where: {
          userId: req.user!.userId,
          deletedAt: null,
          status: { not: 'CANCELLED' },
          serviceDate: { gte: rangeStartStr, lte: rangeEndStr },
        },
        orderBy: { serviceDate: 'desc' },
      }),
      prisma.paymentRecord.findMany({
        where:
          mode === 'cash_date'
            ? {
                userId: req.user!.userId,
                paidAt: { gte: rangeStartDate, lte: rangeEndDate },
                order: { deletedAt: null, status: { not: 'CANCELLED' } },
              }
            : {
                userId: req.user!.userId,
                order: {
                  deletedAt: null,
                  status: { not: 'CANCELLED' },
                  serviceDate: { gte: rangeStartStr, lte: rangeEndStr },
                },
              },
        include: {
          order: { select: { id: true, clientName: true, serviceType: true, serviceDate: true } },
        },
        orderBy: { paidAt: 'desc' },
      }),
      prisma.expense.findMany({
        where: {
          userId: req.user!.userId,
          incurredAt: { gte: rangeStartDate, lte: rangeEndDate },
        },
        orderBy: { incurredAt: 'desc' },
      }),
    ]);

    const expenseTotal = periodExpenses.reduce((s, e) => s + e.amount, 0);
    const assistantAndCommission = periodOrders.reduce(
      (s, o) => s + (o.assistantFee || 0) + (o.channelCommission || 0),
      0
    );

    let totalRevenue = 0;
    let receivedAmount = 0;
    let pendingBalance = 0;

    if (mode === 'cash_date') {
      receivedAmount = periodPayments.reduce((s, p) => s + p.amount, 0);
      totalRevenue = receivedAmount;
      pendingBalance = periodOrders.reduce((s, o) => s + o.balanceDue, 0);
    } else {
      totalRevenue = periodOrders.reduce((s, o) => s + o.totalAmount, 0);
      receivedAmount = periodOrders.reduce((s, o) => s + o.depositPaid, 0);
      pendingBalance = periodOrders.reduce((s, o) => s + o.balanceDue, 0);
    }

    const netProfit = Math.max(0, receivedAmount - expenseTotal - assistantAndCommission);
    const monthlyTarget = user?.monthlyTarget || 20000;

    // Trend: 12 months of selected year when mode === 'all', otherwise 6-month rolling trend
    const trend: Array<{ month: string; label: string; revenue: number; received: number; count: number }> = [];
    if (mode === 'all') {
      const monthBuckets = Array.from({ length: 12 }, (_, idx) => ({
        month: `${year}-${String(idx + 1).padStart(2, '0')}`,
        label: `${idx + 1}月`,
        revenue: 0,
        received: 0,
        count: 0,
      }));
      for (const o of periodOrders) {
        const mIdx = Number(o.serviceDate.slice(5, 7)) - 1;
        if (mIdx >= 0 && mIdx < 12) {
          monthBuckets[mIdx].revenue += o.totalAmount;
          monthBuckets[mIdx].received += o.depositPaid;
          monthBuckets[mIdx].count += 1;
        }
      }
      trend.push(...monthBuckets);
    } else {
      for (let i = 5; i >= 0; i--) {
        const m = targetMonth.subtract(i, 'month');
        const mStartStr = m.startOf('month').format('YYYY-MM-DD');
        const mEndStr = m.endOf('month').format('YYYY-MM-DD');
        const mStartDate = m.startOf('month').toDate();
        const mEndDate = m.endOf('month').toDate();

        if (mode === 'service_date') {
          const orders = await prisma.order.findMany({
            where: {
              userId: req.user!.userId,
              deletedAt: null,
              status: { not: 'CANCELLED' },
              serviceDate: { gte: mStartStr, lte: mEndStr },
            },
            select: { totalAmount: true, depositPaid: true },
          });
          trend.push({
            month: m.format('YYYY-MM'),
            label: `${m.month() + 1}月`,
            revenue: orders.reduce((s, o) => s + o.totalAmount, 0),
            received: orders.reduce((s, o) => s + o.depositPaid, 0),
            count: orders.length,
          });
        } else {
          const payments = await prisma.paymentRecord.findMany({
            where: {
              userId: req.user!.userId,
              paidAt: { gte: mStartDate, lte: mEndDate },
              order: { deletedAt: null, status: { not: 'CANCELLED' } },
            },
            select: { amount: true },
          });
          const sum = payments.reduce((s, p) => s + p.amount, 0);
          trend.push({
            month: m.format('YYYY-MM'),
            label: `${m.month() + 1}月`,
            revenue: sum,
            received: sum,
            count: payments.length,
          });
        }
      }
    }

    // Service type breakdown (synced to full year when mode === 'all', or month otherwise)
    const typeMap = new Map<string, number>();
    for (const o of periodOrders) {
      typeMap.set(o.serviceType, (typeMap.get(o.serviceType) || 0) + o.totalAmount);
    }
    const breakdown = Array.from(typeMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    // Unified ledger list (income + expenses, synced to full year when mode === 'all')
    const ledger = [
      ...periodPayments.map((p) => ({
        id: `pay-${p.id}`,
        rawId: p.id,
        kind: 'INCOME' as const,
        title: `${p.order.clientName} · ${p.type === 'DEPOSIT' ? '定金' : '尾款'}`,
        subtitle: `${p.order.serviceType} · ${p.channel}`,
        amount: p.amount,
        date: mode === 'cash_date' ? dayjs(p.paidAt).format('YYYY-MM-DD') : p.order.serviceDate,
        orderId: p.orderId,
      })),
      ...periodExpenses.map((e) => ({
        id: `exp-${e.id}`,
        rawId: e.id,
        kind: 'EXPENSE' as const,
        title: e.category,
        subtitle: e.note || '日常支出',
        amount: e.amount,
        date: dayjs(e.incurredAt).format('YYYY-MM-DD'),
        orderId: e.orderId,
      })),
    ].sort((a, b) => (a.date < b.date ? 1 : -1));

    res.json({
      year,
      month,
      mode,
      summary: {
        totalRevenue,
        monthlyTarget,
        targetProgress: monthlyTarget > 0 ? Math.min(100, Math.round((totalRevenue / monthlyTarget) * 100)) : 0,
        receivedAmount,
        pendingBalance,
        expenseTotal,
        assistantAndCommission,
        netProfit,
        orderCount: periodOrders.length,
      },
      trend,
      breakdown,
      ledger,
    });
  } catch (err) {
    console.error('Stats overview error:', err);
    res.status(500).json({ error: '加载统计数据失败' });
  }
});

router.get('/export', async (req: AuthRequest, res: Response) => {
  try {
    const year = Number(req.query.year) || dayjs().year();
    const month = Number(req.query.month) || dayjs().month() + 1;
    const isYearScope = req.query.mode === 'all';
    const targetMonth = dayjs(`${year}-${String(month).padStart(2, '0')}-01`);
    const targetYear = dayjs(`${year}-01-01`);
    const startStr = isYearScope ? `${year}-01-01` : targetMonth.format('YYYY-MM-DD');
    const endStr = isYearScope ? `${year}-12-31` : targetMonth.endOf('month').format('YYYY-MM-DD');
    const startDate = isYearScope ? targetYear.startOf('year').toDate() : targetMonth.startOf('month').toDate();
    const endDate = isYearScope ? targetYear.endOf('year').toDate() : targetMonth.endOf('month').toDate();

    const [orders, expenses] = await Promise.all([
      prisma.order.findMany({
        where: {
          userId: req.user!.userId,
          deletedAt: null,
          serviceDate: { gte: startStr, lte: endStr },
        },
        orderBy: { serviceDate: 'asc' },
      }),
      prisma.expense.findMany({
        where: {
          userId: req.user!.userId,
          incurredAt: { gte: startDate, lte: endDate },
        },
        orderBy: { incurredAt: 'asc' },
      }),
    ]);

    const escapeCsv = (val: any) => `"${String(val ?? '').replace(/"/g, '""')}"`;

    const lines: string[] = [
      ['类型', '日期', '客户/项目', '妆型/分类', '状态', '总金额', '已收金额', '待收尾款', '备注'].map(escapeCsv).join(','),
    ];

    for (const o of orders) {
      lines.push(
        ['订单', o.serviceDate, o.clientName, o.serviceType, o.status, o.totalAmount, o.depositPaid, o.balanceDue, o.notes]
          .map(escapeCsv)
          .join(',')
      );
    }
    for (const e of expenses) {
      lines.push(
        ['支出', dayjs(e.incurredAt).format('YYYY-MM-DD'), e.category, '支出', '-', -e.amount, -e.amount, 0, e.note]
          .map(escapeCsv)
          .join(',')
      );
    }

    const bom = '\uFEFF';
    const suffix = isYearScope ? `${year}` : `${year}-${String(month).padStart(2, '0')}`;
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="makeup-ledger-${suffix}.csv"`);
    res.send(bom + lines.join('\n'));
  } catch {
    res.status(500).json({ error: '导出 CSV 失败' });
  }
});

export default router;
