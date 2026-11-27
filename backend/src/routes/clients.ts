import { Router, Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest, requireAuth } from '../lib/auth';

const router = Router();
router.use(requireAuth);

router.get('/', async (req: AuthRequest, res: Response) => {
  const q = String(req.query.search || '').trim();
  const clients = await prisma.client.findMany({
    where: {
      userId: req.user!.userId,
      ...(q
        ? {
            OR: [{ name: { contains: q } }, { phone: { contains: q } }, { wechat: { contains: q } }],
          }
        : {}),
    },
    include: {
      orders: {
        where: { deletedAt: null },
        select: { id: true, totalAmount: true, serviceDate: true, status: true },
        orderBy: { serviceDate: 'desc' },
      },
    },
    orderBy: { updatedAt: 'desc' },
  });

  res.json({
    clients: clients.map((c) => ({
      ...c,
      orderCount: c.orders.length,
      totalSpent: c.orders.reduce((s, o) => s + o.totalAmount, 0),
      lastServiceDate: c.orders[0]?.serviceDate || null,
    })),
  });
});

router.get('/:id/history', async (req: AuthRequest, res: Response) => {
  const client = await prisma.client.findFirst({
    where: { id: String(req.params.id), userId: req.user!.userId },
    include: {
      orders: {
        where: { deletedAt: null },
        orderBy: { serviceDate: 'desc' },
      },
    },
  });
  if (!client) {
    res.status(404).json({ error: '客户不存在' });
    return;
  }
  res.json({ client });
});

router.put('/:id', async (req: AuthRequest, res: Response) => {
  const existing = await prisma.client.findFirst({
    where: { id: String(req.params.id), userId: req.user!.userId },
  });
  if (!existing) {
    res.status(404).json({ error: '客户不存在' });
    return;
  }
  const { name, phone, wechat, source, skinType, allergyNote, hairNote } = req.body;
  const client = await prisma.client.update({
    where: { id: existing.id },
    data: {
      ...(name !== undefined ? { name } : {}),
      ...(phone !== undefined ? { phone } : {}),
      ...(wechat !== undefined ? { wechat } : {}),
      ...(source !== undefined ? { source } : {}),
      ...(skinType !== undefined ? { skinType } : {}),
      ...(allergyNote !== undefined ? { allergyNote } : {}),
      ...(hairNote !== undefined ? { hairNote } : {}),
    },
  });
  res.json({ client });
});

export default router;
