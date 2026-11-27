import { Router, Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest, requireAuth } from '../lib/auth';

const router = Router();
router.use(requireAuth);

interface PackageAddon {
  id: string;
  name: string;
  price: number;
}

function normalizeAddons(raw: unknown): PackageAddon[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item, idx) => ({
      id: typeof item?.id === 'string' && item.id.trim() ? item.id.trim() : `addon-${Date.now()}-${idx}`,
      name: String(item?.name || '').trim(),
      price: Math.max(0, Number(item?.price) || 0),
    }))
    .filter((item) => item.name.length > 0);
}

function parseAddonsJson(raw?: string | null): PackageAddon[] {
  if (!raw) return [];
  try {
    return normalizeAddons(JSON.parse(raw));
  } catch {
    return [];
  }
}

function serializePackage(pkg: any) {
  return {
    id: pkg.id,
    name: pkg.name,
    category: pkg.category,
    price: pkg.price,
    defaultDurationMin: pkg.defaultDurationMin,
    description: pkg.description,
    addons: parseAddonsJson(pkg.addonsJson),
    createdAt: pkg.createdAt,
  };
}

router.get('/', async (req: AuthRequest, res: Response) => {
  const packages = await prisma.packageTemplate.findMany({
    where: { userId: req.user!.userId },
    orderBy: [{ createdAt: 'desc' }],
  });
  res.json({ packages: packages.map(serializePackage) });
});

router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { name, category = 'MAIN', price, defaultDurationMin = 360, description = '', addons } = req.body;
    if (!name || price === undefined) {
      res.status(400).json({ error: '请填写套餐名称与价格' });
      return;
    }
    const cleanAddons = normalizeAddons(addons);
    const pkg = await prisma.packageTemplate.create({
      data: {
        userId: req.user!.userId,
        name: String(name).trim(),
        category: category === 'EXTRA' ? 'EXTRA' : 'MAIN',
        price: Number(price) || 0,
        defaultDurationMin: Math.max(0, Number(defaultDurationMin) || 0),
        description: String(description || ''),
        addonsJson: JSON.stringify(cleanAddons),
      },
    });
    res.status(201).json({ package: serializePackage(pkg) });
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
    const { name, category, price, defaultDurationMin, description, addons } = req.body;
    const pkg = await prisma.packageTemplate.update({
      where: { id: existing.id },
      data: {
        ...(name !== undefined ? { name: String(name).trim() } : {}),
        ...(category !== undefined ? { category: category === 'EXTRA' ? 'EXTRA' : 'MAIN' } : {}),
        ...(price !== undefined ? { price: Number(price) || 0 } : {}),
        ...(defaultDurationMin !== undefined ? { defaultDurationMin: Math.max(0, Number(defaultDurationMin) || 0) } : {}),
        ...(description !== undefined ? { description: String(description || '') } : {}),
        ...(addons !== undefined ? { addonsJson: JSON.stringify(normalizeAddons(addons)) } : {}),
      },
    });
    res.json({ package: serializePackage(pkg) });
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
