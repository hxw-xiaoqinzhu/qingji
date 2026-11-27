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
    const mode = req.query.mode === 'cash_date' ? 'cash_date' : 'service_date';

    const targetMonth = dayjs(`${year}-${String(month).padStart(2, '0')}-01`);
    const monthStartStr = targetMonth.format('YYYY-MM-DD');
    const monthEndStr = targetMonth.endOf('month').format('YYYY-MM-DD');
    const monthStartDate = targetMonth.startOf('month').toDate();
    const monthEndDate = targetMonth.endOf('month').toDate();

    const [user, monthOrders, monthPayments, monthExpenses] = await Promise.all([
      prisma.user.findUnique({ where: { id: req.user!.userId } }),
      prisma.order.findMany({
        where: {
          userId: req.user!.userId,
          deletedAt: null,
          status: { not: 'CANCELLED' },
          serviceDate: { gte: monthStartStr, lte: monthEndStr },
        },
        orderBy: { serviceDate: 'desc' },
      }),
      prisma.paymentRecord.findMany({
        where: {
          userId: req.user!.userId,
          paidAt: { gte: monthStartDate, lte: monthEndDate },
          order: { deletedAt: null, status: { not: 'CANCELLED' } },
        },
        include: {
          order: { select: { id: true, clientName: true, serviceType: true, serviceDate: true } },
        },
        orderBy: { paidAt: 'desc' },
      }),
      prisma.expense.findMany({
        where: {
          userId: req.user!.userId,
          incurredAt: { gte: monthStartDate, lte: monthEndDate },
        },
        orderBy: { incurredAt: 'desc' },
      }),
    ]);

    const expenseTotal = monthExpenses.reduce((s, e) => s + e.amount, 0);
    const assistantAndCommission = monthOrders.reduce(
      (s, o) => s + (o.assistantFee || 0) + (o.channelCommission || 0),
      0
    );

    let totalRevenue = 0;
    let receivedAmount = 0;
    let pendingBalance = 0;

    if (mode === 'service_date') {
      totalRevenue = monthOrders.reduce((s, o) => s + o.totalAmount, 0);
      receivedAmount = monthOrders.reduce((s, o) => s + o.depositPaid, 0);
      pendingBalance = monthOrders.reduce((s, o) => s + o.balanceDue, 0);
    } else {
      receivedAmount = monthPayments.reduce((s, p) => s + p.amount, 0);
      totalRevenue = receivedAmount;
      pendingBalance = monthOrders.reduce((s, o) => s + o.balanceDue, 0);
    }

    const netProfit = Math.max(0, receivedAmount - expenseTotal - assistantAndCommission);
    const monthlyTarget = user?.monthlyTarget || 20000;

    // 6-month trend
    const trend: Array<{ month: string; label: string; revenue: number; received: number; count: number }> = [];
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

    // Service type breakdown
    const typeMap = new Map<string, number>();
    for (const o of monthOrders) {
      typeMap.set(o.serviceType, (typeMap.get(o.serviceType) || 0) + o.totalAmount);
    }
    const breakdown = Array.from(typeMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    // Unified ledger list (income + expenses)
    const ledger = [
      ...monthPayments.map((p) => ({
        id: `pay-${p.id}`,
        rawId: p.id,
        kind: 'INCOME' as const,
        title: `${p.order.clientName} · ${p.type === 'DEPOSIT' ? '定金' : '尾款'}`,
        subtitle: `${p.order.serviceType} · ${p.channel}`,
        amount: p.amount,
        date: dayjs(p.paidAt).format('YYYY-MM-DD'),
        orderId: p.orderId,
      })),
      ...monthExpenses.map((e) => ({
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
        orderCount: monthOrders.length,
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
    const targetMonth = dayjs(`${year}-${String(month).padStart(2, '0')}-01`);
    const monthStartStr = targetMonth.format('YYYY-MM-DD');
    const monthEndStr = targetMonth.endOf('month').format('YYYY-MM-DD');
    const monthStartDate = targetMonth.startOf('month').toDate();
    const monthEndDate = targetMonth.endOf('month').toDate();

    const [orders, expenses] = await Promise.all([
      prisma.order.findMany({
        where: {
          userId: req.user!.userId,
          deletedAt: null,
          serviceDate: { gte: monthStartStr, lte: monthEndStr },
        },
        orderBy: { serviceDate: 'asc' },
      }),
      prisma.expense.findMany({
        where: {
          userId: req.user!.userId,
          incurredAt: { gte: monthStartDate, lte: monthEndDate },
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
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="makeup-ledger-${year}-${String(month).padStart(2, '0')}.csv"`);
    res.send(bom + lines.join('\n'));
  } catch {
    res.status(500).json({ error: '导出 CSV 失败' });
  }
});

export default router;
