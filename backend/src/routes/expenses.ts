import { Router, Response } from 'express';
import dayjs from 'dayjs';
import { prisma } from '../lib/prisma';
import { AuthRequest, requireAuth } from '../lib/auth';

const router = Router();
router.use(requireAuth);

router.get('/', async (req: AuthRequest, res: Response) => {
  const expenses = await prisma.expense.findMany({
    where: { userId: req.user!.userId },
    orderBy: { incurredAt: 'desc' },
  });
  res.json({ expenses });
});

router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { category, amount, incurredAt, note = '', orderId } = req.body;
    const numAmount = Number(amount);
    if (!category || !numAmount || numAmount <= 0) {
      res.status(400).json({ error: '请填写有效的支出分类与金额' });
      return;
    }

    const expense = await prisma.expense.create({
      data: {
        userId: req.user!.userId,
        orderId: orderId || null,
        category,
        amount: numAmount,
        incurredAt: incurredAt ? dayjs(incurredAt).toDate() : new Date(),
        note,
      },
    });
    res.status(201).json({ expense });
  } catch {
    res.status(500).json({ error: '记录支出失败' });
  }
});

router.delete('/:id', async (req: AuthRequest, res: Response) => {
  await prisma.expense.deleteMany({
    where: { id: String(req.params.id), userId: req.user!.userId },
  });
  res.json({ success: true });
});

export default router;
