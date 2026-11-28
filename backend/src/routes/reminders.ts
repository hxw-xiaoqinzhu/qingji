import { Router, Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest, requireAuth } from '../lib/auth';

const router = Router();
router.use(requireAuth);

const VALID_TYPES = new Set(['TASK', 'BIRTHDAY', 'ANNIVERSARY']);
const VALID_CAL = new Set(['SOLAR', 'LUNAR']);
const VALID_REPEAT = new Set(['NONE', 'YEARLY', 'MONTHLY']);

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const showDeleted = req.query.deleted === 'true';
    const reminders = await prisma.calendarReminder.findMany({
      where: {
        userId: req.user!.userId,
        deletedAt: showDeleted ? { not: null } : null,
      },
      orderBy: showDeleted ? [{ deletedAt: 'desc' }] : [{ createdAt: 'desc' }],
    });
    res.json({ reminders });
  } catch (err) {
    console.error('List reminders error:', err);
    res.status(500).json({ error: '加载提醒事项失败' });
  }
});

router.delete('/trash/empty', async (req: AuthRequest, res: Response) => {
  try {
    await prisma.calendarReminder.deleteMany({
      where: {
        userId: req.user!.userId,
        deletedAt: { not: null },
      },
    });
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: '清空提醒回收站失败' });
  }
});

router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const reminder = await prisma.calendarReminder.findFirst({
      where: { id: String(req.params.id), userId: req.user!.userId },
    });
    if (!reminder) {
      res.status(404).json({ error: '提醒事项不存在' });
      return;
    }
    res.json({ reminder });
  } catch {
    res.status(500).json({ error: '加载提醒详情失败' });
  }
});

router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const {
      type = 'TASK',
      title,
      calendarType = 'SOLAR',
      solarDate,
      lunarMonth = null,
      lunarDay = null,
      repeatType = 'NONE',
      remindTime = null,
      note = '',
    } = req.body;

    if (!title || !String(title).trim()) {
      res.status(400).json({ error: '请输入事项标题' });
      return;
    }
    if (!solarDate || !/^\d{4}-\d{2}-\d{2}$/.test(String(solarDate))) {
      res.status(400).json({ error: '请选择有效日期' });
      return;
    }

    const safeCal = VALID_CAL.has(calendarType) ? calendarType : 'SOLAR';
    const reminder = await prisma.calendarReminder.create({
      data: {
        userId: req.user!.userId,
        type: VALID_TYPES.has(type) ? type : 'TASK',
        title: String(title).trim(),
        calendarType: safeCal,
        solarDate: String(solarDate),
        lunarMonth: safeCal === 'LUNAR' && lunarMonth ? Number(lunarMonth) : null,
        lunarDay: safeCal === 'LUNAR' && lunarDay ? Number(lunarDay) : null,
        repeatType: VALID_REPEAT.has(repeatType) ? repeatType : 'NONE',
        remindTime: remindTime ? String(remindTime).trim() : null,
        note: String(note || '').trim(),
      },
    });
    res.status(201).json({ reminder });
  } catch (err) {
    console.error('Create reminder error:', err);
    res.status(500).json({ error: '保存提醒失败' });
  }
});

router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.calendarReminder.findFirst({
      where: { id: String(req.params.id), userId: req.user!.userId },
    });
    if (!existing) {
      res.status(404).json({ error: '提醒事项不存在' });
      return;
    }

    const { type, title, calendarType, solarDate, lunarMonth, lunarDay, repeatType, remindTime, note } = req.body;
    const nextCal = calendarType !== undefined ? (VALID_CAL.has(calendarType) ? calendarType : 'SOLAR') : existing.calendarType;

    const reminder = await prisma.calendarReminder.update({
      where: { id: existing.id },
      data: {
        ...(type !== undefined ? { type: VALID_TYPES.has(type) ? type : 'TASK' } : {}),
        ...(title !== undefined ? { title: String(title).trim() } : {}),
        calendarType: nextCal,
        ...(solarDate !== undefined ? { solarDate: String(solarDate) } : {}),
        lunarMonth: nextCal === 'LUNAR' ? (lunarMonth !== undefined ? Number(lunarMonth) || null : existing.lunarMonth) : null,
        lunarDay: nextCal === 'LUNAR' ? (lunarDay !== undefined ? Number(lunarDay) || null : existing.lunarDay) : null,
        ...(repeatType !== undefined ? { repeatType: VALID_REPEAT.has(repeatType) ? repeatType : 'NONE' } : {}),
        ...(remindTime !== undefined ? { remindTime: remindTime ? String(remindTime).trim() : null } : {}),
        ...(note !== undefined ? { note: String(note || '').trim() } : {}),
      },
    });
    res.json({ reminder });
  } catch (err) {
    console.error('Update reminder error:', err);
    res.status(500).json({ error: '更新提醒失败' });
  }
});

router.post('/:id/restore', async (req: AuthRequest, res: Response) => {
  try {
    await prisma.calendarReminder.updateMany({
      where: { id: String(req.params.id), userId: req.user!.userId },
      data: { deletedAt: null },
    });
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: '恢复提醒失败' });
  }
});

router.delete('/:id', async (req: AuthRequest, res: Response) => {
  const permanent = req.query.permanent === 'true';
  if (permanent) {
    await prisma.calendarReminder.deleteMany({
      where: { id: String(req.params.id), userId: req.user!.userId },
    });
  } else {
    await prisma.calendarReminder.updateMany({
      where: { id: String(req.params.id), userId: req.user!.userId, deletedAt: null },
      data: { deletedAt: new Date() },
    });
  }
  res.json({ success: true });
});

export default router;
