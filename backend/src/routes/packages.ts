import { Router, Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest, requireAuth } from '../lib/auth';

const router = Router();
router.use(requireAuth);

router.get('/', async (req: AuthRequest, res: Response) => {
  const packages = await prisma.packageTemplate.findMany({
    where: { userId: req.user!.userId },
    orderBy: [{ category: 'asc' }, { price: 'desc' }],
  });
  res.json({ packages });
});

router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { name, category = 'MAIN', price, defaultDurationMin = 360, description = '' } = req.body;
    if (!name || price === undefined) {
      res.status(400).json({ error: '请填写套餐名称与价格' });
      return;
    }
    const pkg = await prisma.packageTemplate.create({
      data: {
        userId: req.user!.userId,
        name: String(name).trim(),
        category: category === 'EXTRA' ? 'EXTRA' : 'MAIN',
        price: Number(price) || 0,
        defaultDurationMin: Number(defaultDurationMin) || 360,
        description,
      },
    });
    res.status(201).json({ package: pkg });
  } catch {
    res.status(500).json({ error: '创建套餐失败' });
  }
});

router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.packageTemplate.findFirst({
      where: { id: String(req.params.id), userId: req.user!.userId },
    });
    if (!existing) {
      res.status(404).json({ error: '套餐不存在' });
      return;
    }
    const { name, category, price, defaultDurationMin, description } = req.body;
    const pkg = await prisma.packageTemplate.update({
      where: { id: existing.id },
      data: {
        ...(name !== undefined ? { name: String(name).trim() } : {}),
        ...(category !== undefined ? { category: category === 'EXTRA' ? 'EXTRA' : 'MAIN' } : {}),
        ...(price !== undefined ? { price: Number(price) || 0 } : {}),
        ...(defaultDurationMin !== undefined ? { defaultDurationMin: Number(defaultDurationMin) || 360 } : {}),
        ...(description !== undefined ? { description } : {}),
      },
    });
    res.json({ package: pkg });
  } catch {
    res.status(500).json({ error: '更新套餐失败' });
  }
});

router.delete('/:id', async (req: AuthRequest, res: Response) => {
  await prisma.packageTemplate.deleteMany({
    where: { id: String(req.params.id), userId: req.user!.userId },
  });
  res.json({ success: true });
});

export default router;
