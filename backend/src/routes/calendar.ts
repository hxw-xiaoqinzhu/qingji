import { Router, Response } from 'express';
import dayjs from 'dayjs';
import { prisma } from '../lib/prisma';
import { AuthRequest, requireAuth } from '../lib/auth';

const router = Router();
router.use(requireAuth);

router.get('/month', async (req: AuthRequest, res: Response) => {
  try {
    const year = Number(req.query.year) || dayjs().year();
    const month = Number(req.query.month) || dayjs().month() + 1;

    const startOfMonth = dayjs(`${year}-${String(month).padStart(2, '0')}-01`);
    // Fetch slightly wider range to cover calendar leading/trailing days & multi-day spans
    const rangeStart = startOfMonth.subtract(7, 'day').format('YYYY-MM-DD');
    const rangeEnd = startOfMonth.endOf('month').add(7, 'day').format('YYYY-MM-DD');

    const [orders, blockedDates] = await Promise.all([
      prisma.order.findMany({
        where: {
          userId: req.user!.userId,
          deletedAt: null,
          status: { not: 'CANCELLED' },
          OR: [
            {
              serviceDate: { gte: rangeStart, lte: rangeEnd },
            },
            {
              serviceDate: { lte: rangeEnd },
              endDate: { gte: rangeStart },
            },
          ],
        },
        include: {
          extraItems: true,
        },
        orderBy: [{ serviceDate: 'asc' }, { startTime: 'asc' }],
      }),
      prisma.blockedDate.findMany({
        where: {
          userId: req.user!.userId,
          date: { gte: rangeStart, lte: rangeEnd },
        },
      }),
    ]);

    res.json({
      year,
      month,
      orders: orders.map((o) => ({
        ...o,
        referenceImages: JSON.parse(o.referenceImages || '[]'),
        checklist: JSON.parse(o.checklistJson || '[]'),
      })),
      blockedDates,
    });
  } catch (err) {
    console.error('Calendar month error:', err);
    res.status(500).json({ error: '加载月度档期失败' });
  }
});

router.post('/block', async (req: AuthRequest, res: Response) => {
  try {
    const { date, reason } = req.body;
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      res.status(400).json({ error: '日期格式应为 YYYY-MM-DD' });
      return;
    }

    const blocked = await prisma.blockedDate.upsert({
      where: {
        userId_date: {
          userId: req.user!.userId,
          date,
        },
      },
      update: { reason: reason || '休息日' },
      create: {
        userId: req.user!.userId,
        date,
        reason: reason || '休息日',
      },
    });

    res.json({ blocked });
  } catch (err) {
    console.error('Block date error:', err);
    res.status(500).json({ error: '设置休息日失败' });
  }
});

router.delete('/block/:date', async (req: AuthRequest, res: Response) => {
  try {
    await prisma.blockedDate.deleteMany({
      where: {
        userId: req.user!.userId,
        date: String(req.params.date),
      },
    });
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: '取消休息日失败' });
  }
});

export default router;
